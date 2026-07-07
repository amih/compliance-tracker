'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const TODAY = () => new Date().toISOString().slice(0, 10);
const days = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

async function api(url, opts) {
    const r = await fetch(url, opts && { method: opts.method || 'GET', headers: { 'Content-Type': 'application/json' }, body: opts.body ? JSON.stringify(opts.body) : undefined });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || r.statusText);
    return data;
}
function toast(msg, err) { const t = $('#toast'); t.textContent = msg; t.className = 'toast show' + (err ? ' err' : ''); setTimeout(() => (t.className = 'toast'), 2600); }

// --- i18n --------------------------------------------------------------------
let LANGS = [], EN = {}, DICT = {}, LANG = new URLSearchParams(location.search).get('lang') || localStorage.lang || 'en';
const t = (k) => DICT[k] || EN[k] || k;
async function loadLang(code) {
    EN = EN.app ? EN : await api('/i18n/en.json');
    DICT = code === 'en' ? EN : await api('/i18n/' + code + '.json').catch(() => EN);
    LANG = code; localStorage.lang = code;
    const meta = LANGS.find((l) => l.code === code) || { dir: 'ltr' };
    document.documentElement.dir = meta.dir; document.documentElement.lang = code;
}
function statusTag(next) {
    if (!next) return `<span class="tag">${t('unscheduled')}</span>`;
    const d = days(TODAY(), next);
    if (d < 0) return `<span class="tag danger">${t('overdue')} ${-d}d</span>`;
    if (d <= 30) return `<span class="tag warn">${t('due')} ${d}d</span>`;
    return `<span class="tag ok">${next}</span>`;
}

// --- markdown preview --------------------------------------------------------
function md(text) {
    const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>').replace(/(^|[\s(])_([^_]+)_/g, '$1<em>$2</em>');
    const lines = String(text).split(/\r?\n/); let html = '', i = 0;
    while (i < lines.length) {
        let l = lines[i], m;
        if (/^\s*$/.test(l)) { i++; continue; }
        if ((m = l.match(/^(#{1,6})\s+(.+)/))) { html += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; i++; continue; }
        if (/^---+\s*$/.test(l)) { html += '<hr/>'; i++; continue; }
        if (/^>\s?/.test(l)) { html += `<blockquote>${inline(l.replace(/^>\s?/, ''))}</blockquote>`; i++; continue; }
        if (/^\s*\|/.test(l) && /^[\s|:-]+$/.test(lines[i + 1] || '')) {
            const rows = []; while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
            const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
            let ta = '<table><thead><tr>' + cells(rows[0]).map((h) => `<th>${inline(h)}</th>`).join('') + '</tr></thead><tbody>';
            for (const r of rows.slice(2)) ta += '<tr>' + cells(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>';
            html += ta + '</tbody></table>'; continue;
        }
        if (/^\s*[-*]\s+/.test(l)) {
            html += '<ul>';
            while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { let it = lines[i].replace(/^\s*[-*]\s+/, '').replace(/^\[ \]\s*/, '☐ ').replace(/^\[[xX]\]\s*/, '☑ '); html += `<li>${inline(it)}</li>`; i++; }
            html += '</ul>'; continue;
        }
        html += `<p>${inline(l)}</p>`; i++;
    }
    return html;
}

// --- state / router ----------------------------------------------------------
let CFG = null, SETTINGS = null, DBS = [], CUR = 'dashboard', CURARG = null;
const VIEWS = {};
const MANAGE = [['recurring', '🔁'], ['mytasks', '👤'], ['gantt', '📅'], ['poam', '⚠️'], ['mapping', '🗺️'], ['trend', '📈'], ['checks', '🤖'], ['offboarding', '👋'], ['reports', '📄'], ['git', '🔀'], ['ai', '✨'], ['settings', '⚙️']];
const FW_NAME = { 'owasp-appsec.md': 'OWASP AppSec', 'soc2.md': 'SOC 2', 'iso-27001.md': 'ISO 27001', 'nist-csf.md': 'NIST CSF 2.0', 'nist-800-53.md': 'NIST 800-53', 'gdpr.md': 'GDPR', 'israel-ppl.md': 'Israel PPL', 'pci-dss.md': 'PCI DSS', 'hipaa.md': 'HIPAA' };
const FW_DESC = { 'owasp-appsec.md': 'Secure software development — always applies', 'soc2.md': 'For US / enterprise SaaS buyers', 'iso-27001.md': 'Recognized ISMS certification', 'nist-csf.md': 'Organizing backbone (voluntary)', 'nist-800-53.md': 'US government / FedRAMP', 'gdpr.md': 'EU / UK personal data', 'israel-ppl.md': 'Israeli residents’ data — per managed database', 'pci-dss.md': 'If you handle card data', 'hipaa.md': 'US health data (PHI)' };
const fwName = (f) => FW_NAME[f] || f.replace('.md', '');
const isRegFile = (f) => f !== 'employee-offboarding.md';
const fwOn = (f) => SETTINGS && SETTINGS.frameworks['checklists/' + f] !== false;

async function boot() {
    LANGS = await api('/i18n/langs.json');
    await loadLang(LANG);
    [CFG, SETTINGS, DBS] = await Promise.all([api('/api/config'), api('/api/data/settings'), api('/api/databases')]);
    $('#appName').textContent = t('app');
    $('#privateBadge').className = 'pill priv'; $('#privateBadge').textContent = t('private_badge');
    $('#search').placeholder = t('search');
    $('#langSel').innerHTML = LANGS.map((l) => `<option value="${l.code}" ${l.code === LANG ? 'selected' : ''}>${esc(l.name)}</option>`).join('');
    $('#langSel').onchange = async (e) => { await loadLang(e.target.value); render(); };
    wireSearch();
    refreshGitPill();
    if (!SETTINGS.settings.onboarded) { $('#sidebar').innerHTML = ''; CUR = 'onboarding'; VIEWS.onboarding(); return; }
    renderNav();
    go('dashboard');
}
function render() { $('#appName').textContent = t('app'); $('#privateBadge').textContent = t('private_badge'); $('#search').placeholder = t('search'); renderNav(); go(CUR, CURARG); }

function renderNav() {
    if (!SETTINGS) return;
    const regs = CFG.checklists.filter(isRegFile);
    const enabled = regs.filter(fwOn), disabled = regs.filter((f) => !fwOn(f));
    let h = `<a data-view="dashboard" class="${CUR === 'dashboard' ? 'active' : ''}">📊 ${esc(t('nav.dashboard'))}</a>`;
    h += `<div class="nav-group">${esc(t('your_frameworks'))}</div>`;
    if (!enabled.length) h += `<div class="muted" style="padding:4px 12px;font-size:12px">${esc(t('pick_frameworks'))}</div>`;
    for (const f of enabled) {
        const rel = 'checklists/' + f;
        h += `<a data-open="${rel}" class="nav-fw ${CURARG === rel ? 'active' : ''}">✅ ${esc(fwName(f))}</a>`;
        if (f === 'israel-ppl.md') {
            for (const d of DBS) h += `<a data-open="${esc(d.rel)}" class="nav-sub ${CURARG === d.rel ? 'active' : ''}">🗄 ${esc(d.name)} <span class="tag">${esc(d.level)}</span></a>`;
            h += `<a class="nav-sub add" data-adddb>＋ ${esc(t('add_database'))}</a>`;
        }
    }
    if (disabled.length) {
        h += `<div class="nav-group collapsible" data-toggle>${esc(t('more_frameworks'))} (${disabled.length}) ▾</div><div id="moreFw" class="collapsed">`;
        for (const f of disabled) h += `<a class="nav-dim" data-enable="${esc(f)}" title="${esc(FW_DESC[f] || '')}">○ ${esc(fwName(f))}</a>`;
        h += `</div>`;
    }
    h += `<div class="nav-group">${esc(t('manage'))}</div>` + MANAGE.map(([v, ic]) => `<a data-view="${v}" class="${v === CUR ? 'active' : ''}">${ic} ${esc(t('nav.' + v))}</a>`).join('');
    h += `<div class="sidebar-foot">${esc(CFG.root)}</div>`;
    $('#sidebar').innerHTML = h;
    $$('#sidebar [data-view]').forEach((a) => (a.onclick = () => go(a.dataset.view)));
    $$('#sidebar [data-open]').forEach((a) => (a.onclick = () => go('checklists', a.dataset.open)));
    $$('#sidebar [data-enable]').forEach((a) => (a.onclick = () => enableFw(a.dataset.enable)));
    $$('#sidebar [data-adddb]').forEach((a) => (a.onclick = addDatabaseFlow));
    const tog = $('#sidebar [data-toggle]'); if (tog) tog.onclick = () => $('#moreFw').classList.toggle('collapsed');
}
function go(view, arg) {
    CUR = view; CURARG = view === 'checklists' ? arg : null;
    renderNav();
    $('#main').innerHTML = `<div class="loading">${t('loading')}</div>`;
    (VIEWS[view] || VIEWS.dashboard)(arg).catch((e) => ($('#main').innerHTML = `<div class="card">Error: ${esc(e.message)}</div>`));
}
async function enableFw(f) { await api('/api/data/settings', { method: 'PUT', body: { frameworks: { ['checklists/' + f]: true } } }); SETTINGS = await api('/api/data/settings'); go('checklists', 'checklists/' + f); }
function modal(inner) { const d = document.createElement('div'); d.className = 'modal-bg'; d.innerHTML = `<div class="modal">${inner}</div>`; document.body.appendChild(d); d.addEventListener('click', (e) => { if (e.target === d) d.remove(); }); return d; }
function addDatabaseFlow() {
    const d = modal(`<h3>🗄 ${esc(t('add_database'))}</h3><p class="muted">${esc(t('add_database_desc'))}</p>
      <div class="form-row"><input id="dbn" placeholder="${esc(t('db_name'))}"><select id="dbl"><option value="basic">${esc(t('level_basic'))}</option><option value="medium" selected>${esc(t('level_medium'))}</option><option value="high">${esc(t('level_high'))}</option></select></div>
      <div class="row" style="justify-content:flex-end"><button data-x>${esc(t('cancel'))}</button><button class="primary" id="dbadd">${esc(t('add'))}</button></div>`);
    d.querySelector('[data-x]').onclick = () => d.remove();
    d.querySelector('#dbadd').onclick = async () => { const name = d.querySelector('#dbn').value.trim(); if (!name) return; try { const r = await api('/api/databases', { method: 'POST', body: { name, level: d.querySelector('#dbl').value } }); d.remove(); DBS = await api('/api/databases'); toast('✓'); go('checklists', r.rel); } catch (e) { toast(e.message, true); } };
}
async function refreshGitPill() { try { const g = await api('/api/git/status'); $('#gitPill').textContent = `⎇ ${g.branch} · ${g.dirty.length}${g.signed ? ' · 🔏' : ''}${g.ahead ? ' · ↑' + g.ahead : ''}`; } catch { $('#gitPill').textContent = 'no git'; } }

// --- Onboarding --------------------------------------------------------------
VIEWS.onboarding = async function () {
    const regs = CFG.checklists.filter(isRegFile);
    const rec = ['owasp-appsec.md', 'soc2.md', 'gdpr.md', 'israel-ppl.md'];
    $('#main').innerHTML = `<div class="card" style="max-width:720px;margin:10px auto">
      <h1>${esc(t('welcome'))}</h1><p class="muted">${esc(t('welcome_desc'))}</p>
      <div class="form-row"><label>${esc(t('your_name'))}<input id="ob_owner" value="${esc(localStorage.owner || '')}"></label>
      <label>${esc(t('language'))}<select id="ob_lang">${LANGS.map((l) => `<option value="${l.code}" ${l.code === LANG ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select></label></div>
      <div class="section-title">${esc(t('pick_frameworks'))}</div>
      ${regs.map((f) => `<label class="check-lang"><input type="checkbox" data-fw="${esc(f)}" ${rec.includes(f) ? 'checked' : ''} style="width:auto"> <b>${esc(fwName(f))}</b> — <span class="muted">${esc(FW_DESC[f] || '')}</span></label>`).join('')}
      <p class="muted" style="font-size:12px;margin-top:10px">${esc(t('onboard_hint'))}</p>
      <div class="row" style="margin-top:10px"><button class="primary" id="ob_go">${esc(t('get_started'))}</button></div></div>`;
    $('#ob_lang').onchange = async (e) => { await loadLang(e.target.value); $('#langSel').value = LANG; VIEWS.onboarding(); };
    $('#ob_go').onclick = async () => {
        const frameworks = {}; $$('[data-fw]').forEach((c) => (frameworks['checklists/' + c.dataset.fw] = c.checked));
        const owner = $('#ob_owner').value;
        await api('/api/data/settings', { method: 'PUT', body: { frameworks, settings: { owner, onboarded: true, lang: LANG } } });
        if (owner) localStorage.owner = owner;
        SETTINGS = await api('/api/data/settings');
        toast('✓'); renderNav(); go('dashboard');
    };
};

// --- Dashboard ---------------------------------------------------------------
VIEWS.dashboard = async function () {
    const velocity = Number(localStorage.velocity || 5);
    const o = await api('/api/overview?velocity=' + velocity + '&soon=45');
    $('#main').innerHTML = `
    <div class="spread"><h1>${t('nav.dashboard')}</h1><label class="muted">${t('velocity')} <input id="vel" type="number" min="1" style="width:64px" value="${velocity}"> ${t('per_week')}</label></div>
    <div class="grid stat-cards" style="margin:14px 0 6px">
      <div class="card stat"><div class="n">${o.totals.pct}%</div><div class="l">${t('program_completion')}</div><div class="bar" style="margin-top:8px"><span style="width:${o.totals.pct}%"></span></div></div>
      <div class="card stat"><div class="n">${o.totals.oneDone}/${o.totals.oneTotal}</div><div class="l">${t('one_time_done')}</div></div>
      <div class="card stat"><div class="n">${o.totals.recurring}</div><div class="l">${t('recurring_activities')}</div></div>
      <div class="card stat"><div class="n" style="color:${o.overdue.length ? 'var(--danger)' : 'var(--acc)'}">${o.overdue.length}</div><div class="l">${t('overdue')}</div></div></div>
    <div class="section-title">${t('by_regulation')}</div>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">${o.files.map(regCard).join('')}</div>
    <div class="section-title">${t('overdue')} (${o.overdue.length})</div>${recurTable(o.overdue)}
    <div class="section-title">${t('coming_up')} (${o.upcoming.length})</div>${recurTable(o.upcoming)}`;
    $('#vel').onchange = (e) => { localStorage.velocity = Math.max(1, +e.target.value || 5); go('dashboard'); };
    wireOpen();
};
function regCard(f) {
    return `<div class="card reg-card"><div class="spread"><h3><a data-open="${esc(f.rel)}">${esc(f.title)}</a></h3>${f.stats.overdue ? `<span class="tag danger">${f.stats.overdue} ${t('overdue')}</span>` : ''}</div>
    <div class="bar" style="margin:6px 0 8px"><span style="width:${f.stats.pct}%"></span></div>
    <div class="row muted" style="font-size:12px;justify-content:space-between"><span>${f.stats.oneDone}/${f.stats.oneTotal} · ${f.stats.pct}%</span><span>${f.stats.recurring} 🔁</span><span>${t('eta')} ${f.remaining ? '~' + f.projected : t('complete')}</span></div></div>`;
}
function recurTable(rows) {
    if (!rows.length) return `<div class="card muted">${t('nothing')}</div>`;
    return `<div class="card" style="padding:4px 8px"><table><thead><tr><th>${t('activity')}</th><th>${t('regulation')}</th><th>${t('every')}</th><th>${t('last')}</th><th>${t('next')}</th><th></th><th></th></tr></thead><tbody>
    ${rows.map((r) => `<tr><td>${esc(r.name)}</td><td class="muted">${esc(r.title)}</td><td class="muted">${esc(r.freq)}</td><td class="mono">${r.last || '—'}</td><td class="mono">${r.next || '—'}</td><td>${statusTag(r.next)}</td>
      <td><button class="small" data-done='${esc(JSON.stringify({ f: r.rel, line: r.line }))}'>✓ ${t('done')}</button></td></tr>`).join('')}</tbody></table></div>`;
}
document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-done]'); if (!b) return;
    const { f, line } = JSON.parse(b.dataset.done);
    const by = localStorage.owner || prompt(t('your_name'), '@me'); if (by) localStorage.owner = by;
    try { const r = await api('/api/recur', { method: 'POST', body: { f, line, action: 'done', by } }); toast(r.synced && r.synced.length ? `${t('synced')} · ${r.synced.length}` : '✓'); go(CUR, CURARG); } catch (err) { toast(err.message, true); }
});
function wireOpen() { $$('[data-open]').forEach((a) => (a.onclick = () => go('checklists', a.dataset.open))); }

// --- Checklists / editor -----------------------------------------------------
VIEWS.checklists = async function (rel) {
    CFG = await api('/api/config');
    const files = [...CFG.checklists.map((f) => 'checklists/' + f), ...CFG.offboarding.map((f) => 'offboarding/' + f)];
    rel = rel || files[0];
    $('#main').innerHTML = `<h1>${t('nav.checklists')}</h1><div class="editor-wrap"><div class="card file-list">${files.map((f) => `<a data-f="${esc(f)}" class="${f === rel ? 'active' : ''}">${esc(f.replace('checklists/', '').replace('offboarding/', '👋 '))}</a>`).join('')}</div><div id="ed" class="card">…</div></div>`;
    $$('.file-list a').forEach((a) => (a.onclick = () => loadFile(a.dataset.f)));
    loadFile(rel);
};
let EVID = {}, OWN = {};
async function loadFile(rel) {
    $$('.file-list a').forEach((a) => a.classList.toggle('active', a.dataset.f === rel));
    const [d, ev, ow] = await Promise.all([api('/api/file?f=' + encodeURIComponent(rel)), api('/api/evidence?f=' + encodeURIComponent(rel)), api('/api/owners')]);
    EVID = ev; OWN = ow;
    const ed = $('#ed'); ed.dataset.rel = rel;
    const mode = localStorage.edMode || 'tasks';
    let ctx = '';
    const db = DBS.find((x) => x.rel === rel);
    if (db) ctx = `<div class="db-head">🗄 <b>${esc(db.name)}</b> · ${t('level')}: <b>${esc(db.level)}</b> <button class="mini" id="deldb" style="margin-inline-start:10px">${t('delete_db')}</button></div>`;
    else if (rel === 'checklists/israel-ppl.md') ctx = `<div class="db-head">📋 ${t('add_database_desc')}</div>`;
    ed.innerHTML = ctx + `<div class="spread"><div class="tabs"><button data-m="tasks" class="${mode === 'tasks' ? 'on' : ''}">${t('tab.tasks')}</button><button data-m="source" class="${mode === 'source' ? 'on' : ''}">${t('tab.source')}</button></div>
      <div class="muted" style="font-size:12px">${d.stats.oneDone}/${d.stats.oneTotal} · ${d.stats.overdue} ${t('overdue')}</div></div><div id="edBody"></div>`;
    if ($('#deldb', ed)) $('#deldb', ed).onclick = async () => { if (!confirm(t('delete_db') + '?')) return; await api('/api/databases/delete', { method: 'POST', body: { rel } }); DBS = await api('/api/databases'); go('dashboard'); };
    $$('.tabs button', ed).forEach((b) => (b.onclick = () => { localStorage.edMode = b.dataset.m; renderEd(d); }));
    renderEd(d);
}
function renderEd(d) {
    const body = $('#edBody'), rel = $('#ed').dataset.rel;
    if ((localStorage.edMode || 'tasks') === 'source') {
        body.innerHTML = `<div class="split"><textarea id="src">${esc(d.raw)}</textarea><div class="preview">${md(d.raw)}</div></div><div class="row" style="margin-top:10px"><button class="primary" id="save">${t('save')}</button></div>`;
        $('#src').oninput = (e) => ($('.preview', body).innerHTML = md(e.target.value));
        $('#save').onclick = async () => { try { await api('/api/file', { method: 'PUT', body: { f: rel, raw: $('#src').value } }); toast(t('save')); loadFile(rel); } catch (e) { toast(e.message, true); } };
        return;
    }
    const bySection = {};
    d.parsed.tasks.forEach((x) => (bySection[x.section || ''] = bySection[x.section || ''] || []).push(x));
    let h = '';
    for (const [sec, tasks] of Object.entries(bySection)) {
        h += `<div class="subhead">${esc(sec)}</div>`;
        for (const x of tasks) {
            const owner = OWN[rel + '::' + x.name];
            const evs = EVID[x.name] || [];
            const scopeBadge = x.scope === 'company' ? `<span class="tag scope" title="${t('synced')}">${t('scope_company')}</span>` : x.scope === 'level' ? `<span class="tag scope" title="${t('synced')}">${t('scope_level')}</span>` : '';
            const meta = `<span class="task-meta"><span class="mini" data-own="${esc(x.name)}">👤 ${owner ? esc(owner) : t('assign_owner')}</span><span class="mini" data-ev="${esc(x.name)}">📎 ${t('evidence')}${evs.length ? ' (' + evs.length + ')' : ''}</span></span>`;
            if (x.type === 'recurring') {
                h += `<div class="recur ${x.next && x.next < TODAY() ? 'overdue' : ''}"><span class="name">🔁 ${esc(x.name)} <span class="tag">${esc(x.freq)}</span> ${scopeBadge}</span><span class="dates">${t('last')} <span class="mono">${x.last || '—'}</span> → ${t('next')} <span class="mono">${x.next || '—'}</span></span>${statusTag(x.next)}
                  <button class="small" data-done='${esc(JSON.stringify({ f: rel, line: x.line }))}'>✓ ${t('done')}</button><button class="small" data-setnext="${x.line}">${t('edit')}</button>${meta}</div><div class="ev-holder" data-holder="${esc(x.name)}"></div>`;
            } else {
                h += `<div class="task ${x.done ? 'done' : ''}"><input type="checkbox" ${x.done ? 'checked' : ''} data-line="${x.line}"><span class="name">${esc(x.name)} ${x.cadence ? `<span class="tag">${esc(x.cadence)}</span>` : ''} ${scopeBadge} ${meta}</span></div><div class="ev-holder" data-holder="${esc(x.name)}"></div>`;
            }
        }
    }
    body.innerHTML = h || `<div class="muted">—</div>`;
    $$('input[type=checkbox]', body).forEach((c) => (c.onchange = async () => { try { const r = await api('/api/toggle', { method: 'POST', body: { f: rel, line: +c.dataset.line } }); if (r.synced && r.synced.length) toast(`${t('synced')} · ${r.synced.length}`); refreshGitPill(); loadFile(rel); } catch (e) { toast(e.message, true); c.checked = !c.checked; } }));
    $$('[data-setnext]', body).forEach((b) => (b.onclick = async () => { const nx = prompt(t('next') + ' (YYYY-MM-DD)', TODAY()); if (nx === null) return; try { await api('/api/recur', { method: 'POST', body: { f: rel, line: +b.dataset.setnext, next: nx } }); loadFile(rel); } catch (e) { toast(e.message, true); } }));
    $$('[data-own]', body).forEach((b) => (b.onclick = async () => { const owner = prompt(t('owner'), OWN[rel + '::' + b.dataset.own] || localStorage.owner || ''); if (owner === null) return; try { await api('/api/owner', { method: 'POST', body: { rel, name: b.dataset.own, owner } }); loadFile(rel); } catch (e) { toast(e.message, true); } }));
    $$('[data-ev]', body).forEach((b) => (b.onclick = () => toggleEvidence(rel, b.dataset.ev)));
}
function toggleEvidence(rel, name) {
    const holder = $(`.ev-holder[data-holder="${CSS.escape(name)}"]`);
    if (holder.innerHTML) { holder.innerHTML = ''; return; }
    const evs = EVID[name] || [];
    holder.innerHTML = `<div class="ev-panel"><div>${evs.map((e, i) => `<div class="ev"><span>${e.url ? `<a href="${esc(e.url)}" target="_blank">${esc(e.label)}</a>` : esc(e.label)}</span>${e.sha256 ? `<span class="sha">sha256:${esc(e.sha256.slice(0, 16))}…</span>` : ''}<span class="muted">${esc(e.by || '')} ${esc(e.date || '')}</span><button class="mini" data-rmev="${i}">✕</button></div>`).join('') || `<span class="muted">—</span>`}</div>
      <div class="form-row" style="margin-top:6px"><div class="row"><input id="evl" placeholder="${t('label')}"><input id="evu" placeholder="${t('url')}"></div><div class="row"><input id="evp" placeholder="${t('file_path')}"><button class="primary small" id="evadd">${t('add')}</button></div></div></div>`;
    $('#evadd', holder).onclick = async () => {
        try { const r = await api('/api/evidence', { method: 'POST', body: { rel, name, label: $('#evl').value, url: $('#evu').value, path: $('#evp').value, by: localStorage.owner || '' } }); EVID[name] = r.items; toast(t('add')); holder.innerHTML = ''; toggleEvidence(rel, name); } catch (e) { toast(e.message, true); }
    };
    $$('[data-rmev]', holder).forEach((x) => (x.onclick = async () => { try { await api('/api/evidence/remove', { method: 'POST', body: { rel, name, idx: +x.dataset.rmev } }); const ev = await api('/api/evidence?f=' + encodeURIComponent(rel)); EVID = ev; holder.innerHTML = ''; toggleEvidence(rel, name); } catch (e) { toast(e.message, true); } }));
}

// --- Recurring / My tasks ----------------------------------------------------
VIEWS.recurring = async function () {
    const o = await api('/api/overview?velocity=5&soon=36500');
    const all = [...o.overdue, ...o.upcoming].sort((a, b) => (a.next || '').localeCompare(b.next || ''));
    $('#main').innerHTML = `<div class="spread"><h1>${t('nav.recurring')}</h1><a href="/api/export/ics"><button>📅 ${t('export_ics')}</button></a></div><p class="muted">${t('recurring_desc')}</p>${recurTable(all)}`;
};
VIEWS.mytasks = async function () {
    const owner = localStorage.owner || prompt(t('your_name'), '@me') || '';
    if (owner) localStorage.owner = owner;
    const d = await api('/api/mytasks?owner=' + encodeURIComponent(owner));
    $('#main').innerHTML = `<h1>${t('nav.mytasks')} — ${esc(owner)}</h1><p class="muted">${t('mytasks_desc')}</p>` +
        (d.tasks.length ? `<div class="card" style="padding:4px 8px"><table><thead><tr><th>${t('activity')}</th><th>${t('regulation')}</th><th></th></tr></thead><tbody>${d.tasks.map((x) => `<tr><td>${x.type === 'recurring' ? '🔁 ' : x.done ? '☑ ' : '☐ '}${esc(x.name)}</td><td class="muted"><a data-open="${esc(x.rel)}">${esc(x.title)}</a></td><td>${x.type === 'recurring' ? statusTag(x.next) : ''}</td></tr>`).join('')}</tbody></table></div>` : `<div class="card muted">${t('no_owner')}</div>`);
    wireOpen();
};

// --- Gantt -------------------------------------------------------------------
VIEWS.gantt = async function () {
    const velocity = Number(localStorage.velocity || 5);
    const o = await api('/api/overview?velocity=' + velocity + '&soon=180');
    const WEEKS = 16, start = new Date();
    const head = Array.from({ length: WEEKS }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i * 7); return `<td class="wk">${d.toISOString().slice(5, 10)}</td>`; }).join('');
    const rows = o.files.map((f) => {
        const w = Math.min(WEEKS, Math.ceil(f.remaining / velocity));
        const bar = f.remaining ? `<div class="bar2" style="left:0;width:${(w / WEEKS) * 100}%"></div>` : '';
        const marks = o.upcoming.filter((r) => r.rel === f.rel).map((r) => { const wk = days(TODAY(), r.next) / 7; return wk < 0 || wk > WEEKS ? '' : `<div class="mark" style="left:${(wk / WEEKS) * 100}%" title="${esc(r.name)} · ${r.next}"></div>`; }).join('');
        return `<tr><td style="min-width:200px"><a data-open="${esc(f.rel)}">${esc(f.title)}</a><div class="muted" style="font-size:11px">${f.remaining} ${t('left')} · ${t('eta')} ${f.remaining ? f.projected : t('complete')}</div></td><td colspan="${WEEKS}"><div class="track">${bar}${marks}</div></td></tr>`;
    }).join('');
    $('#main').innerHTML = `<div class="spread"><h1>${t('nav.gantt')}</h1><span class="muted">${t('gantt_legend')}</span></div><div class="card gantt"><table><thead><tr><th>${t('regulation')}</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
    wireOpen();
};

// --- POA&M -------------------------------------------------------------------
VIEWS.poam = async function () {
    const list = await api('/api/poam');
    const sev = ['Low', 'Medium', 'High', 'Critical'], st = ['Open', 'In progress', 'Closed'];
    $('#main').innerHTML = `<h1>${t('poam_title')}</h1><p class="muted">${t('poam_desc')}</p>
      <div class="card"><div class="form-row"><input id="pt" placeholder="${t('new_finding')}"><div class="row"><input id="pf" placeholder="${t('regulation')}" style="max-width:220px"><select id="ps">${sev.map((s) => `<option>${s}</option>`).join('')}</select><input id="po" placeholder="${t('owner')}" style="max-width:140px"><input id="pd" type="date"><button class="primary" id="padd">${t('add')}</button></div></div></div>
      <div class="card" style="padding:4px 8px;margin-top:12px"><table><thead><tr><th>${t('new_finding')}</th><th>${t('regulation')}</th><th>${t('severity')}</th><th>${t('owner')}</th><th>${t('due')}</th><th>${t('status')}</th><th></th></tr></thead><tbody>
      ${list.map((p) => `<tr><td>${esc(p.title)}</td><td class="muted">${esc(p.framework || '')}</td><td>${esc(p.severity || '')}</td><td>${esc(p.owner || '')}</td><td class="mono">${esc(p.due || '')}</td><td><select data-st="${p.id}">${st.map((s) => `<option ${s === p.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td><td><button class="mini" data-del="${p.id}">✕</button></td></tr>`).join('') || `<tr><td colspan=7 class="muted">${t('nothing')}</td></tr>`}
      </tbody></table></div>`;
    $('#padd').onclick = async () => { const title = $('#pt').value.trim(); if (!title) return; await api('/api/poam', { method: 'POST', body: { title, framework: $('#pf').value, severity: $('#ps').value, owner: $('#po').value, due: $('#pd').value, status: 'Open' } }); go('poam'); };
    $$('[data-del]').forEach((b) => (b.onclick = async () => { await api('/api/poam/delete', { method: 'POST', body: { id: b.dataset.del } }); go('poam'); }));
    $$('[data-st]').forEach((s) => (s.onchange = async () => { await api('/api/poam', { method: 'POST', body: { id: s.dataset.st, status: s.value } }); toast('✓'); }));
};

// --- Cross-framework map -----------------------------------------------------
VIEWS.mapping = async function () {
    const m = await api('/api/mapping');
    const cols = [['iso', 'ISO 27001'], ['soc2', 'SOC 2'], ['nist80053', '800-53'], ['csf', 'CSF'], ['pci', 'PCI'], ['gdpr', 'GDPR'], ['israel', 'Israel PPL']];
    $('#main').innerHTML = `<h1>${t('mapping_title')}</h1><p class="muted">${t('mapping_desc')}</p>
      <div class="card" style="overflow-x:auto"><table class="map-table"><thead><tr><th>${t('theme')}</th>${cols.map((c) => `<th>${c[1]}</th>`).join('')}</tr></thead><tbody>
      ${m.map((r) => `<tr><td class="theme">${esc(r.theme)}</td>${cols.map((c) => `<td>${(r[c[0]] || []).map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
};

// --- Trend -------------------------------------------------------------------
VIEWS.trend = async function () {
    const { series } = await api('/api/trend');
    let svg = `<div class="muted">${t('nothing')}</div>`;
    if (series.length) {
        const W = 800, H = 220, pad = 30, n = series.length;
        const x = (i) => pad + (i / Math.max(1, n - 1)) * (W - 2 * pad);
        const y = (p) => H - pad - (p / 100) * (H - 2 * pad);
        const pts = series.map((s, i) => `${x(i)},${y(s.pct)}`).join(' ');
        svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
          <line x1="${pad}" y1="${y(0)}" x2="${W - pad}" y2="${y(0)}" stroke="#e2e8ee"/><line x1="${pad}" y1="${y(100)}" x2="${W - pad}" y2="${y(100)}" stroke="#e2e8ee"/>
          <text x="4" y="${y(100) + 4}" font-size="10" fill="#64757f">100%</text><text x="4" y="${y(0) + 4}" font-size="10" fill="#64757f">0%</text>
          <polyline points="${pts}" fill="none" stroke="#0b7a5b" stroke-width="2"/>${series.map((s, i) => `<circle cx="${x(i)}" cy="${y(s.pct)}" r="2.5" fill="#0b7a5b"><title>${s.date}: ${s.done}/${s.total} (${s.pct}%)</title></circle>`).join('')}
          <text x="${pad}" y="${H - 8}" font-size="10" fill="#64757f">${series[0].date}</text><text x="${W - pad}" y="${H - 8}" font-size="10" fill="#64757f" text-anchor="end">${series[n - 1].date}</text></svg>`;
    }
    $('#main').innerHTML = `<h1>${t('trend_title')}</h1><p class="muted">${t('trend_desc')}</p><div class="card trend">${svg}</div>`;
};

// --- Checks ------------------------------------------------------------------
VIEWS.checks = async function () {
    const { checks } = await api('/api/checks');
    $('#main').innerHTML = `<h1>${t('checks_title')}</h1><p class="muted">${t('checks_desc')}</p><div class="card">${checks.map((c) => `<div class="check"><span class="badge ${c.status}">${c.status.toUpperCase()}</span><span style="flex:1">${esc(c.label)}<div class="muted" style="font-size:12px">${esc(c.detail)}</div></span></div>`).join('')}</div>`;
};

// --- Offboarding -------------------------------------------------------------
VIEWS.offboarding = async function () {
    CFG = await api('/api/config');
    const runs = CFG.offboarding;
    $('#main').innerHTML = `<h1>${t('offboarding_title')}</h1><p class="muted">${t('offboarding_desc')}</p>
      <div class="card"><div class="row"><input id="emp" placeholder="${t('departing')}" style="max-width:280px"><button class="primary" id="startRun">${t('start_run')}</button><a data-open="checklists/employee-offboarding.md" style="margin-inline-start:auto">${t('view_runbook')}</a></div>
        <div class="tag warn" style="margin-top:8px">${t('reminder_label')}</div></div>
      <div class="section-title">${t('runs')} (${runs.length})</div>${runs.length ? '<div class="card file-list">' + runs.map((f) => `<a data-open="offboarding/${esc(f)}">👋 ${esc(f)}</a>`).join('') + '</div>' : `<div class="card muted">${t('no_runs')}</div>`}`;
    $('#startRun').onclick = async () => { const employee = $('#emp').value.trim(); if (!employee) return toast('!', true); try { const r = await api('/api/offboarding/new', { method: 'POST', body: { employee } }); go('checklists', r.rel); } catch (e) { toast(e.message, true); } };
    wireOpen();
};

// --- Reports & trust ---------------------------------------------------------
VIEWS.reports = async function () {
    $('#main').innerHTML = `<h1>${t('reports_title')}</h1><p class="muted">${t('reports_desc')}</p>
      <div class="card"><div class="row"><a href="/api/report" target="_blank"><button>📄 ${t('download_report')}</button></a>
        <a href="/api/report?full=1" target="_blank"><button>📄 ${t('download_full')}</button></a>
        <a href="/trust" target="_blank"><button>🌐 ${t('open_trust')}</button></a></div></div>`;
};

// --- Git & history -----------------------------------------------------------
VIEWS.git = async function () {
    const g = await api('/api/git/status');
    const files = CFG.checklists.map((f) => 'checklists/' + f);
    $('#main').innerHTML = `<h1>${t('git_title')}</h1>
      <div class="grid" style="grid-template-columns:1fr 1fr">
        <div class="card"><h3>${t('status_label')}</h3><div class="muted">${t('branch')} <b>${esc(g.branch)}</b> · ${g.dirty.length} ${t('changed')}${g.ahead ? ' · ' + g.ahead + ' ' + t('unpushed') : ''}</div>
          <div class="mono" style="margin:8px 0;max-height:110px;overflow:auto">${g.dirty.map(esc).join('<br>') || `<span class="muted">${t('clean')}</span>`}</div>
          <div class="row"><input id="msg" placeholder="${t('commit_msg')}" style="flex:1"><button class="primary" id="commit">${t('commit')}</button></div>
          <div class="row" style="margin-top:8px"><select id="remoteSel">${g.remotes.map((r) => `<option>${esc(r.name)}</option>`).join('') || '<option>origin</option>'}</select><button id="push">${t('push')}</button><span class="muted" style="font-size:12px">${g.remotes.map((r) => esc(r.name + ' → ' + r.url)).join('; ') || t('no_remote')}</span></div>
          <label class="check-lang" style="margin-top:8px"><input type="checkbox" id="sign" ${g.signed ? 'checked' : ''} style="width:auto"> ${t('signed_commits')}</label></div>
        <div class="card"><h3>${t('setup_remote')}</h3><p class="muted">${t('remote_desc')}</p>
          <div class="row"><input id="rname" value="origin" style="max-width:110px"><input id="rurl" placeholder="git@github.com:you/compliance.git"><button id="setRemote">${t('save_remote')}</button></div>
          <p class="muted" style="font-size:12px;margin-top:10px">${t('remote_hint')}</p></div></div>
      <div class="section-title">${t('audit_trail')}</div>
      <div class="card"><div class="row"><select id="hf">${files.map((f) => `<option>${esc(f)}</option>`).join('')}</select><button id="blameBtn">${t('show_blame')}</button><button id="logBtn">${t('file_history')}</button></div>
        <div class="row" style="margin-top:8px"><input id="taskq" placeholder="${t('activity_ph')}" style="flex:1"><button id="histBtn">${t('activity_history')}</button></div><div id="gitOut" style="margin-top:12px"></div></div>`;
    $('#commit').onclick = async () => { const message = $('#msg').value.trim(); if (!message) return toast('!', true); try { await api('/api/git/commit', { method: 'POST', body: { message } }); toast('✓'); refreshGitPill(); go('git'); } catch (e) { toast(e.message, true); } };
    $('#push').onclick = async () => { try { await api('/api/git/push', { method: 'POST', body: { remote: $('#remoteSel').value } }); toast('✓'); refreshGitPill(); } catch (e) { toast(e.message, true); } };
    $('#sign').onchange = async (e) => { try { await api('/api/git/sign', { method: 'POST', body: { enabled: e.target.checked } }); toast('✓'); refreshGitPill(); } catch (err) { toast(err.message, true); } };
    $('#setRemote').onclick = async () => { try { await api('/api/git/remote', { method: 'POST', body: { name: $('#rname').value, url: $('#rurl').value } }); toast('✓'); go('git'); } catch (e) { toast(e.message, true); } };
    $('#blameBtn').onclick = async () => { const d = await api('/api/git/blame?f=' + encodeURIComponent($('#hf').value)); $('#gitOut').innerHTML = d.lines.length ? d.lines.map((l) => `<div class="blame-line"><span>${esc(l.author || '')}</span><span>${esc(l.date || '')}</span><span class="mono">${esc(l.text || '')}</span></div>`).join('') : `<div class="muted">${esc(d.note || '—')}</div>`; };
    $('#logBtn').onclick = async () => { const d = await api('/api/git/log?f=' + encodeURIComponent($('#hf').value)); $('#gitOut').innerHTML = commitsTable(d.commits); };
    $('#histBtn').onclick = async () => { const d = await api('/api/git/history?f=' + encodeURIComponent($('#hf').value) + '&task=' + encodeURIComponent($('#taskq').value)); $('#gitOut').innerHTML = d.commits.length ? commitsTable(d.commits) : `<div class="muted">—</div>`; };
};
const commitsTable = (c) => `<table><thead><tr><th>#</th><th>Author</th><th>Date</th><th>Message</th></tr></thead><tbody>${c.map((x) => `<tr><td class="mono">${esc(x.hash)}</td><td>${esc(x.author)}</td><td class="mono">${esc(x.date)}</td><td>${esc(x.subject)}</td></tr>`).join('')}</tbody></table>`;

// --- AI ----------------------------------------------------------------------
VIEWS.ai = async function () {
    $('#main').innerHTML = `<h1>${t('ai_title')}</h1><p class="muted">${t('ai_desc')}</p>
      <div class="card"><textarea id="q" rows="3" placeholder="e.g. Draft an access-control policy for ISO 27001 A.5.15"></textarea><div class="row" style="margin-top:8px"><button class="primary" id="ask">${t('ask')}</button></div><div class="ai-out" id="aiout"></div></div>`;
    $('#ask').onclick = async () => { $('#aiout').textContent = '…'; try { const r = await api('/api/ai', { method: 'POST', body: { prompt: $('#q').value } }); $('#aiout').textContent = r.configured ? r.text : t('ai_not_configured'); } catch (e) { $('#aiout').textContent = e.message; } };
};

// --- Settings ----------------------------------------------------------------
VIEWS.settings = async function () {
    const [s, g] = await Promise.all([api('/api/data/settings'), api('/api/git/status')]);
    CFG = await api('/api/config');
    $('#main').innerHTML = `<h1>${t('settings_title')}</h1>
      <div class="card" style="max-width:640px"><div class="form-row"><label>${t('your_name')}<input id="s_owner" value="${esc(s.settings.owner || localStorage.owner || '')}"></label></div>
        <div class="form-row"><label>${t('language')}<select id="s_lang">${LANGS.map((l) => `<option value="${l.code}" ${l.code === LANG ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select></label></div>
        <div class="form-row"><label>${t('webhook')}<input id="s_hook" value="${esc(s.settings.webhook || '')}" placeholder="https://hooks.slack.com/…"></label><div class="muted" style="font-size:12px">${t('reminders_hint')}</div></div>
        <label class="check-lang"><input type="checkbox" id="s_sign" ${g.signed ? 'checked' : ''} style="width:auto"> ${t('signed_commits')}</label>
        <div class="row" style="margin-top:10px"><button class="primary" id="s_save">${t('save_settings')}</button></div></div>
      <div class="section-title">${t('applicability')}</div>
      <div class="card">${CFG.checklists.map((f) => { const rel = 'checklists/' + f; const on = s.frameworks[rel] !== false; return `<label class="check-lang"><input type="checkbox" data-fw="${rel}" ${on ? 'checked' : ''} style="width:auto"> ${esc(f)}</label>`; }).join('')}</div>`;
    $('#s_save').onclick = async () => {
        const frameworks = {}; $$('[data-fw]').forEach((c) => (frameworks[c.dataset.fw] = c.checked));
        await api('/api/data/settings', { method: 'PUT', body: { settings: { owner: $('#s_owner').value, webhook: $('#s_hook').value, lang: $('#s_lang').value }, frameworks } });
        await api('/api/git/sign', { method: 'POST', body: { enabled: $('#s_sign').checked } });
        if ($('#s_owner').value) localStorage.owner = $('#s_owner').value;
        if ($('#s_lang').value !== LANG) { await loadLang($('#s_lang').value); $('#langSel').value = LANG; }
        toast(t('save')); refreshGitPill(); render();
    };
};

// --- search ------------------------------------------------------------------
function wireSearch() {
    const inp = $('#search'), box = $('#searchResults'); let tm;
    inp.oninput = () => { clearTimeout(tm); tm = setTimeout(async () => {
        if (inp.value.trim().length < 2) return (box.className = 'search-results');
        const d = await api('/api/search?q=' + encodeURIComponent(inp.value.trim()));
        box.innerHTML = d.hits.length ? d.hits.map((h) => `<a data-f="${esc(h.rel)}"><small>${esc(h.file)}</small><br>${esc(h.text)}</a>`).join('') : '<a><small>—</small></a>';
        box.className = 'search-results open';
        $$('a[data-f]', box).forEach((a) => (a.onclick = () => { box.className = 'search-results'; inp.value = ''; go('checklists', a.dataset.f); }));
    }, 200); };
    document.addEventListener('click', (e) => { if (!e.target.closest('.search')) box.className = 'search-results'; });
}

boot().catch((e) => ($('#main').innerHTML = `<div class="card">Failed to start: ${esc(e.message)}</div>`));
