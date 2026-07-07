// Compliance Tracker — local, private web app. Binds 127.0.0.1 and edits only the
// checklists/ and offboarding/ Markdown files (+ data/ JSON). Git + many management features.
import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { parseChecklist, computeStats, periodFromFreq, addPeriod, setField, isoDate, today } from './lib/checklist.js';
import { load, save, taskKey } from './lib/store.js';

const exec = promisify(execFile);
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIRS = ['checklists', 'offboarding', 'databases'];
const PORT = Number(process.env.PORT || process.argv[2] || 4181);

const app = express();
app.use(express.json({ limit: '4mb' }));
app.use(express.static(path.join(ROOT, 'public')));

// ---- helpers ----------------------------------------------------------------
function resolveRel(rel) {
    rel = String(rel || '').replace(/\\/g, '/');
    if (!/^(checklists|offboarding|databases)\/[A-Za-z0-9._ -]+\.md$/.test(rel)) throw new Error('invalid path');
    const abs = path.resolve(ROOT, rel);
    if (!DIRS.some((d) => abs.startsWith(path.resolve(ROOT, d) + path.sep))) throw new Error('outside repo');
    return abs;
}
async function git(args) {
    try { return (await exec('git', args, { cwd: ROOT, maxBuffer: 48 * 1024 * 1024 })).stdout; }
    catch (e) { throw new Error((e.stderr || e.message || 'git error').toString().trim()); }
}
async function gitTry(args, dflt = '') { try { return await git(args); } catch { return dflt; } }
async function listMd(dir) { try { return (await fs.readdir(path.join(ROOT, dir))).filter((f) => f.endsWith('.md')).sort(); } catch { return []; } }
async function readParsed(rel) {
    const raw = await fs.readFile(resolveRel(rel), 'utf8');
    const parsed = parseChecklist(raw);
    return { raw, parsed, stats: computeStats(parsed.tasks) };
}
const wrap = (fn) => (req, res) => fn(req, res).catch((e) => res.status(400).json({ error: String(e.message || e) }));
async function enabledFrameworks() {
    const cfg = await load('config.json');
    return (rel) => cfg.frameworks?.[rel] !== false;
}
async function allFiles() { const o = []; for (const d of DIRS) for (const f of await listMd(d)) o.push(`${d}/${f}`); return o; }
const commitLine = (l) => { const [hash, author, date, subject] = l.split('\x1f'); return { hash, author, date, subject }; };
const setCb = (L, v) => L.replace(/\[[ xX]\]/, v ? '[x]' : '[ ]');

// Propagate a change to the same-named task across sibling privacy-database instances.
// scope 'company' → all other databases; 'level' → same-sensitivity-level databases only.
async function syncScoped(sourceRel, scope, taskName, mutate) {
    if (scope === 'per-db' || !sourceRel.startsWith('databases/')) return [];
    const dbs = await load('databases.json');
    const srcLevel = dbs.find((x) => x.rel === sourceRel)?.level;
    const touched = [];
    for (const d of dbs) {
        if (d.rel === sourceRel) continue;
        if (scope === 'level' && d.level !== srcLevel) continue;
        const abs = path.resolve(ROOT, d.rel);
        let raw; try { raw = await fs.readFile(abs, 'utf8'); } catch { continue; }
        const lines = raw.split(/\r?\n/);
        const task = parseChecklist(raw).tasks.find((x) => x.name === taskName);
        if (!task) continue;
        const nl = mutate(lines[task.line]);
        if (nl != null && nl !== lines[task.line]) { lines[task.line] = nl; await fs.writeFile(abs, lines.join('\n'), 'utf8'); touched.push(d.rel); }
    }
    return touched;
}

// ---- config / listing -------------------------------------------------------
app.get('/api/config', wrap(async (req, res) => {
    res.json({ root: ROOT, today: today(), checklists: await listMd('checklists'), offboarding: await listMd('offboarding'), ai: !!process.env.AI_API_KEY });
}));

app.get('/api/data/settings', wrap(async (req, res) => res.json(await load('config.json'))));
app.put('/api/data/settings', wrap(async (req, res) => {
    const cfg = await load('config.json');
    if (req.body.settings) cfg.settings = { ...cfg.settings, ...req.body.settings };
    if (req.body.frameworks) cfg.frameworks = { ...cfg.frameworks, ...req.body.frameworks };
    await save('config.json', cfg);
    res.json(cfg);
}));

// Program overview (respects applicability unless ?all=1).
app.get('/api/overview', wrap(async (req, res) => {
    const velocity = Math.max(1, Number(req.query.velocity) || 5);
    const soon = Number(req.query.soon) || 30;
    const showAll = req.query.all === '1';
    const isOn = await enabledFrameworks();
    const dbs = await load('databases.json');
    const t = today();
    const soonDate = addPeriod(t, { days: soon });
    const files = [], overdue = [], upcoming = [];
    for (const dir of DIRS) for (const f of await listMd(dir)) {
        const rel = `${dir}/${f}`;
        if (rel === 'checklists/israel-ppl.md' && dbs.length && !showAll) continue; // template hidden once DBs exist
        const enabled = dir !== 'checklists' || isOn(rel);
        if (!enabled && !showAll) continue;
        const { parsed, stats } = await readParsed(rel);
        const remaining = stats.oneTotal - stats.oneDone;
        const projected = remaining ? addPeriod(t, { days: Math.ceil(remaining / velocity) * 7 }) : t;
        files.push({ rel, file: f, dir, title: parsed.title, stats, remaining, projected, enabled });
        for (const task of parsed.tasks) {
            if (task.type !== 'recurring' || !task.next) continue;
            const row = { rel, file: f, title: parsed.title, name: task.name, freq: task.freq, last: task.last, next: task.next, by: task.by, line: task.line };
            if (task.next < t) overdue.push(row);
            else if (task.next <= soonDate) upcoming.push(row);
        }
    }
    overdue.sort((a, b) => a.next.localeCompare(b.next));
    upcoming.sort((a, b) => a.next.localeCompare(b.next));
    const totals = files.reduce((a, f) => ({ oneTotal: a.oneTotal + f.stats.oneTotal, oneDone: a.oneDone + f.stats.oneDone, recurring: a.recurring + f.stats.recurring, overdue: a.overdue + f.stats.overdue }), { oneTotal: 0, oneDone: 0, recurring: 0, overdue: 0 });
    totals.pct = totals.oneTotal ? Math.round((totals.oneDone / totals.oneTotal) * 100) : 100;
    res.json({ today: t, velocity, soon, files, totals, overdue, upcoming });
}));

// ---- file read / write + task ops ------------------------------------------
app.get('/api/file', wrap(async (req, res) => res.json({ rel: req.query.f, ...(await readParsed(req.query.f)) })));
app.put('/api/file', wrap(async (req, res) => { await fs.writeFile(resolveRel(req.body.f), String(req.body.raw), 'utf8'); res.json({ ok: true, ...(await readParsed(req.body.f)) }); }));

app.post('/api/toggle', wrap(async (req, res) => {
    const { f, line } = req.body; const abs = resolveRel(f);
    const lines = (await fs.readFile(abs, 'utf8')).split(/\r?\n/); const L = lines[line];
    if (!/^\s*-\s*\[[ xX]\]/.test(L || '')) throw new Error('not a checkbox line');
    lines[line] = /\[ \]/.test(L) ? L.replace('[ ]', '[x]') : L.replace(/\[[xX]\]/, '[ ]');
    await fs.writeFile(abs, lines.join('\n'), 'utf8');
    const task = parseChecklist(lines.join('\n')).tasks.find((x) => x.line === line);
    let synced = [];
    if (task && task.scope !== 'per-db') { const v = /\[[xX]\]/.test(lines[line]); synced = await syncScoped(f, task.scope, task.name, (SL) => setCb(SL, v)); }
    res.json({ ok: true, synced, ...(await readParsed(f)) });
}));

app.post('/api/recur', wrap(async (req, res) => {
    const { f, line, action, last, next, by } = req.body; const abs = resolveRel(f);
    const raw = await fs.readFile(abs, 'utf8'); const lines = raw.split(/\r?\n/); let L = lines[line];
    if (!/^\s*-\s*⟳/.test(L || '')) throw new Error('not a recurring line');
    const task = parseChecklist(raw).tasks.find((x) => x.line === line);
    if (action === 'done') {
        const d = last || today(); const nx = addPeriod(d, periodFromFreq(task.freq));
        L = setField(L, 'last', d, false); if (nx) L = setField(L, 'next', nx, true); if (by) L = setField(L, 'by', by, false);
    } else { if (last) L = setField(L, 'last', last, false); if (next) L = setField(L, 'next', next, true); if (by) L = setField(L, 'by', by, false); }
    lines[line] = L; await fs.writeFile(abs, lines.join('\n'), 'utf8');
    const upd = parseChecklist(lines.join('\n')).tasks.find((x) => x.line === line);
    let synced = [];
    if (upd && upd.scope !== 'per-db') synced = await syncScoped(f, upd.scope, upd.name, (SL) => { let x = SL; if (upd.last) x = setField(x, 'last', upd.last, false); if (upd.next) x = setField(x, 'next', upd.next, true); if (upd.by) x = setField(x, 'by', upd.by, false); return x; });
    res.json({ ok: true, synced, ...(await readParsed(f)) });
}));

// ---- owners & "my tasks" ----------------------------------------------------
app.get('/api/owners', wrap(async (req, res) => res.json(await load('owners.json'))));
app.post('/api/owner', wrap(async (req, res) => {
    const { rel, name, owner } = req.body; const o = await load('owners.json');
    if (owner) o[taskKey(rel, name)] = owner; else delete o[taskKey(rel, name)];
    await save('owners.json', o); res.json({ ok: true });
}));
app.get('/api/mytasks', wrap(async (req, res) => {
    const owner = String(req.query.owner || ''); const owners = await load('owners.json'); const out = [];
    for (const rel of await allFiles()) {
        const { parsed } = await readParsed(rel);
        for (const t of parsed.tasks) {
            const who = owners[taskKey(rel, t.name)];
            if (owner ? who === owner : who) out.push({ rel, title: parsed.title, ...t, owner: who });
        }
    }
    res.json({ owner, tasks: out });
}));

// ---- evidence ---------------------------------------------------------------
app.get('/api/evidence', wrap(async (req, res) => {
    const ev = await load('evidence.json'); const rel = req.query.f;
    const out = {}; for (const [k, v] of Object.entries(ev)) if (k.startsWith(rel + '::')) out[k.slice(rel.length + 2)] = v;
    res.json(out);
}));
app.post('/api/evidence', wrap(async (req, res) => {
    const { rel, name, label, url, path: fp } = req.body; const ev = await load('evidence.json');
    let sha256 = null;
    if (fp) { const buf = await fs.readFile(fp); if (buf.length > 50 * 1024 * 1024) throw new Error('file too large to hash'); sha256 = crypto.createHash('sha256').update(buf).digest('hex'); }
    const key = taskKey(rel, name); (ev[key] = ev[key] || []).push({ label: label || (fp ? path.basename(fp) : url), url: url || '', path: fp || '', sha256, by: req.body.by || '', date: today() });
    await save('evidence.json', ev); res.json({ ok: true, items: ev[key] });
}));
app.post('/api/evidence/remove', wrap(async (req, res) => {
    const { rel, name, idx } = req.body; const ev = await load('evidence.json'); const key = taskKey(rel, name);
    if (ev[key]) { ev[key].splice(idx, 1); if (!ev[key].length) delete ev[key]; }
    await save('evidence.json', ev); res.json({ ok: true });
}));

// ---- POA&M / risk register --------------------------------------------------
app.get('/api/poam', wrap(async (req, res) => res.json(await load('poam.json'))));
app.post('/api/poam', wrap(async (req, res) => {
    const list = await load('poam.json'); const item = req.body;
    if (item.id) { const i = list.findIndex((x) => x.id === item.id); if (i >= 0) list[i] = { ...list[i], ...item }; }
    else list.push({ ...item, id: 'P' + Date.now().toString(36), created: today() });
    await save('poam.json', list); res.json(list);
}));
app.post('/api/poam/delete', wrap(async (req, res) => {
    let list = await load('poam.json'); list = list.filter((x) => x.id !== req.body.id); await save('poam.json', list); res.json(list);
}));

// ---- cross-framework mapping ------------------------------------------------
app.get('/api/mapping', wrap(async (req, res) => res.json(await load('mapping.json'))));

// ---- completion trend from git history --------------------------------------
app.get('/api/trend', wrap(async (req, res) => {
    const log = await gitTry(['log', '--date=short', '--format=%h\x1f%ad', '-n', '40', '--', 'checklists']);
    const commits = log.trim().split('\n').filter(Boolean).map((l) => { const [hash, date] = l.split('\x1f'); return { hash, date }; }).reverse();
    const series = [];
    for (const c of commits) {
        const cnt = async (re) => (await gitTry(['grep', '-c', '-E', re, c.hash, '--', 'checklists'])).trim().split('\n').filter(Boolean).reduce((a, l) => a + Number(l.split(':').pop() || 0), 0);
        const done = await cnt('- \\[x\\]'); const total = await cnt('- \\[[ xX]\\]');
        series.push({ hash: c.hash, date: c.date, done, total, pct: total ? Math.round((done / total) * 100) : 0 });
    }
    res.json({ series });
}));

// ---- automated checks (local evidence) --------------------------------------
app.get('/api/checks', wrap(async (req, res) => {
    const cfg = await load('config.json'); const ev = await load('evidence.json');
    const remotes = (await gitTry(['remote'])).trim();
    const gpgsign = (await gitTry(['config', '--get', 'commit.gpgsign'])).trim();
    const hasBackupEvidence = Object.keys(ev).some((k) => /backup|restore/i.test(k) && ev[k].length);
    const checks = [
        { id: 'remote', label: 'Off-site backup: a git remote is configured', status: remotes ? 'pass' : 'fail', detail: remotes || 'no remote — history is only local' },
        { id: 'signed', label: 'Commits are cryptographically signed', status: gpgsign === 'true' ? 'pass' : 'fail', detail: gpgsign === 'true' ? 'commit.gpgsign = true' : 'enable in Settings for provable attestations' },
        { id: 'webhook', label: 'Overdue reminders wired to a webhook', status: cfg.settings?.webhook ? 'pass' : 'fail', detail: cfg.settings?.webhook ? 'configured' : 'set a Slack/Teams webhook in Settings + a cron' },
        { id: 'backup', label: 'Backup/restore has attached evidence', status: hasBackupEvidence ? 'pass' : 'todo', detail: hasBackupEvidence ? 'evidence present' : 'attach a restore-test artifact' },
        { id: 'aws-mfa', label: 'Cloud: MFA enforced on all IAM users (AWS)', status: 'todo', detail: 'integration stub — needs AWS credentials/config' },
        { id: 'gh-branch', label: 'Source: branch protection + required reviews (GitHub)', status: 'todo', detail: 'integration stub — needs a GitHub token' }
    ];
    res.json({ checks });
}));

// ---- git --------------------------------------------------------------------
app.get('/api/git/status', wrap(async (req, res) => {
    const branch = (await git(['rev-parse', '--abbrev-ref', 'HEAD'])).trim();
    const porcelain = (await gitTry(['status', '--porcelain'])).trim();
    const dirty = porcelain ? porcelain.split('\n').map((l) => l.slice(3)) : [];
    const remotes = [...new Map((await gitTry(['remote', '-v'])).trim().split('\n').filter(Boolean).map((l) => { const [name, rest] = l.split('\t'); return [name, { name, url: (rest || '').split(' ')[0] }]; })).values()];
    const ahead = Number((await gitTry(['rev-list', '--count', '@{u}..HEAD'])).trim()) || 0;
    const signed = (await gitTry(['config', '--get', 'commit.gpgsign'])).trim() === 'true';
    res.json({ branch, dirty, remotes, ahead, signed });
}));
app.post('/api/git/commit', wrap(async (req, res) => {
    const message = String(req.body.message || '').trim(); if (!message) throw new Error('commit message required');
    await git(['add', '--', ...DIRS, 'data']); res.json({ ok: true, out: (await git(['commit', '-m', message])).trim() });
}));
app.post('/api/git/push', wrap(async (req, res) => {
    const branch = (await git(['rev-parse', '--abbrev-ref', 'HEAD'])).trim(); const remote = String(req.body.remote || 'origin');
    let out; try { out = await git(['push', remote, branch]); } catch { out = await git(['push', '-u', remote, branch]); }
    res.json({ ok: true, out: (out || 'pushed').trim() });
}));
app.post('/api/git/remote', wrap(async (req, res) => {
    const name = String(req.body.name || 'origin').trim(); const url = String(req.body.url || '').trim();
    if (!/^([\w.-]+@[\w.-]+:|https?:\/\/|git@|ssh:\/\/)/.test(url)) throw new Error('provide a valid git remote URL');
    try { await git(['remote', 'add', name, url]); } catch { await git(['remote', 'set-url', name, url]); }
    res.json({ ok: true });
}));
app.post('/api/git/sign', wrap(async (req, res) => { await git(['config', 'commit.gpgsign', req.body.enabled ? 'true' : 'false']); res.json({ ok: true }); }));
app.get('/api/git/log', wrap(async (req, res) => {
    resolveRel(req.query.f);
    const out = await git(['log', '--date=short', '--format=%h\x1f%an\x1f%ad\x1f%s', '--', req.query.f]);
    res.json({ rel: req.query.f, commits: out.trim().split('\n').filter(Boolean).map(commitLine) });
}));
app.get('/api/git/blame', wrap(async (req, res) => {
    resolveRel(req.query.f);
    const out = await gitTry(['blame', '--line-porcelain', '--', req.query.f]);
    if (!out) return res.json({ rel: req.query.f, lines: [], note: 'no history yet (commit first)' });
    const lines = []; let cur = {};
    for (const line of out.split('\n')) {
        if (/^author /.test(line)) cur.author = line.slice(7);
        else if (/^author-time /.test(line)) cur.date = isoDate(new Date(Number(line.slice(12)) * 1000));
        else if (/^\t/.test(line)) { cur.text = line.slice(1); lines.push(cur); cur = {}; }
    }
    res.json({ rel: req.query.f, lines });
}));
app.get('/api/git/history', wrap(async (req, res) => {
    resolveRel(req.query.f); const task = String(req.query.task || '').slice(0, 80); if (!task) throw new Error('task required');
    const out = await git(['log', '--date=short', '--format=%h\x1f%an\x1f%ad\x1f%s', `-S${task}`, '--', req.query.f]);
    res.json({ rel: req.query.f, task, commits: out.trim().split('\n').filter(Boolean).map(commitLine) });
}));

// ---- offboarding ------------------------------------------------------------
app.post('/api/offboarding/new', wrap(async (req, res) => {
    const name = String(req.body.employee || '').trim(); if (!name) throw new Error('employee name required');
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    const rel = `offboarding/${today()}-${slug || 'employee'}.md`; const abs = path.resolve(ROOT, rel);
    try { await fs.access(abs); throw new Error('a run for that name/date already exists'); } catch (e) { if (!/ENOENT|no such file/i.test(e.message)) throw e; }
    await fs.mkdir(path.join(ROOT, 'offboarding'), { recursive: true });
    const template = await fs.readFile(path.join(ROOT, 'checklists', 'employee-offboarding.md'), 'utf8');
    const header = `# Offboarding — ${name}\n\n> Started ${today()}. Based on the offboarding runbook; commit each step to record who/when.\n\n`;
    await fs.writeFile(abs, header + template.replace(/^#\s+.*\n/, ''), 'utf8');
    res.json({ ok: true, rel });
}));

// ---- privacy databases (per-מאגר Israel PPL instances) ----------------------
app.get('/api/databases', wrap(async (req, res) => res.json(await load('databases.json'))));
app.post('/api/databases', wrap(async (req, res) => {
    const name = String(req.body.name || '').trim();
    const level = ['basic', 'medium', 'high'].includes(req.body.level) ? req.body.level : 'medium';
    if (!name) throw new Error('database name required');
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'db';
    const rel = `databases/${slug}.md`; const abs = path.resolve(ROOT, rel);
    try { await fs.access(abs); throw new Error('a database with that name already exists'); } catch (e) { if (!/ENOENT|no such file/i.test(e.message)) throw e; }
    await fs.mkdir(path.join(ROOT, 'databases'), { recursive: true });
    const template = await fs.readFile(path.join(ROOT, 'checklists', 'israel-ppl.md'), 'utf8');
    const header = `# Privacy database — ${name}\n\n> **Managed database:** ${name} · **Security level:** ${level} · created ${today()}. Cloned from the Israel PPL per-database template. company-wide tasks sync across all databases; per-level tasks across ${level}-level databases.\n\n`;
    const lines = (header + template.replace(/^#\s+.*\n/, '')).split(/\r?\n/);
    // inherit shared-scope task states from existing instances
    const dbs = await load('databases.json');
    for (const task of parseChecklist(lines.join('\n')).tasks) {
        if (task.scope === 'per-db') continue;
        for (const d of dbs) {
            if (task.scope === 'level' && d.level !== level) continue;
            let sraw; try { sraw = await fs.readFile(path.resolve(ROOT, d.rel), 'utf8'); } catch { continue; }
            const st = parseChecklist(sraw).tasks.find((x) => x.name === task.name); if (!st) continue;
            if (task.type === 'recurring' && (st.last || st.next)) { let L = lines[task.line]; if (st.last) L = setField(L, 'last', st.last, false); if (st.next) L = setField(L, 'next', st.next, true); if (st.by) L = setField(L, 'by', st.by, false); lines[task.line] = L; break; }
            else if (task.type !== 'recurring' && st.done) { lines[task.line] = setCb(lines[task.line], true); break; }
        }
    }
    await fs.writeFile(abs, lines.join('\n'), 'utf8');
    dbs.push({ slug, name, level, rel, created: today() }); await save('databases.json', dbs);
    res.json({ ok: true, rel, level });
}));
app.post('/api/databases/delete', wrap(async (req, res) => {
    const rel = req.body.rel; let dbs = await load('databases.json'); dbs = dbs.filter((x) => x.rel !== rel); await save('databases.json', dbs);
    try { await fs.unlink(resolveRel(rel)); } catch {}
    res.json({ ok: true });
}));

// ---- exports / reports / trust ----------------------------------------------
app.get('/api/export/ics', wrap(async (req, res) => {
    const rows = [];
    for (const rel of await allFiles()) { const { parsed } = await readParsed(rel); for (const t of parsed.tasks) if (t.type === 'recurring' && t.next) rows.push({ title: parsed.title, name: t.name, next: t.next }); }
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//compliance-tracker//EN',
        ...rows.flatMap((r, i) => ['BEGIN:VEVENT', `UID:ct-${i}@compliance-tracker`, `DTSTART;VALUE=DATE:${r.next.replace(/-/g, '')}`, `SUMMARY:${(r.title + ': ' + r.name).replace(/[,;]/g, ' ')}`, 'END:VEVENT']),
        'END:VCALENDAR'].join('\r\n');
    res.setHeader('Content-Type', 'text/calendar'); res.setHeader('Content-Disposition', 'attachment; filename="compliance-due-dates.ics"'); res.send(ics);
}));

async function buildReport({ full }) {
    const isOn = await enabledFrameworks(); const ev = await load('evidence.json');
    const head = (await gitTry(['log', '-1', '--format=%h · %ad', '--date=short'])).trim() || 'uncommitted';
    const dbs = await load('databases.json');
    const rows = [];
    for (const dir of DIRS) for (const f of await listMd(dir)) {
        const rel = `${dir}/${f}`; if (dir === 'checklists' && !isOn(rel)) continue;
        if (rel === 'checklists/israel-ppl.md' && dbs.length) continue;
        const { parsed, stats } = await readParsed(rel);
        const evCount = Object.entries(ev).filter(([k]) => k.startsWith(rel + '::')).reduce((a, [, v]) => a + v.length, 0);
        rows.push(`<tr><td>${parsed.title}</td><td>${stats.pct}%</td><td>${stats.oneDone}/${stats.oneTotal}</td><td>${stats.recurring}</td><td>${stats.overdue}</td>${full ? `<td>${evCount}</td>` : ''}</tr>`);
    }
    return `<!doctype html><meta charset=utf-8><title>Compliance report</title>
    <style>body{font:14px/1.5 system-ui,sans-serif;max-width:820px;margin:36px auto;color:#16232e}h1{margin-bottom:2px}
    table{border-collapse:collapse;width:100%;margin-top:14px}th,td{border-bottom:1px solid #e2e8ee;padding:7px 10px;text-align:left}
    .muted{color:#64757f}.stamp{background:#f7fafc;border:1px solid #e2e8ee;border-radius:8px;padding:8px 12px;font-family:monospace;font-size:12px;display:inline-block;margin-top:8px}</style>
    <h1>Compliance status report</h1><div class="muted">Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} · integrity anchor (git HEAD): </div>
    <div class="stamp">${head}</div>
    <table><thead><tr><th>Framework</th><th>Complete</th><th>One-time</th><th>Recurring</th><th>Overdue</th>${full ? '<th>Evidence</th>' : ''}</tr></thead><tbody>${rows.join('')}</tbody></table>
    <p class="muted" style="margin-top:20px;font-size:12px">The git commit hash above anchors this snapshot; anyone with the private repo can verify the underlying records and their full history (who changed what, when).</p>`;
}
app.get('/api/report', wrap(async (req, res) => { res.setHeader('Content-Type', 'text/html'); res.send(await buildReport({ full: req.query.full === '1' })); }));
app.get('/trust', wrap(async (req, res) => { res.setHeader('Content-Type', 'text/html'); res.send(await buildReport({ full: false })); }));

// ---- AI assistant (bring-your-own key) --------------------------------------
app.post('/api/ai', wrap(async (req, res) => {
    if (!process.env.AI_API_KEY) return res.json({ configured: false, hint: 'Set AI_API_KEY (and optionally AI_BASE_URL / AI_MODEL) and restart to enable. Works with any OpenAI-compatible endpoint — including your own gateway.' });
    const base = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.AI_MODEL || 'gpt-4o-mini';
    const sys = 'You are a compliance assistant for a SaaS company. Be concise and practical. When asked, draft policies, explain controls, or identify gaps. Always note this is not legal advice.';
    const r = await fetch(`${base}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_API_KEY}` }, body: JSON.stringify({ model, messages: [{ role: 'system', content: sys }, { role: 'user', content: String(req.body.prompt || '').slice(0, 6000) }] }) });
    const data = await r.json();
    res.json({ configured: true, text: data.choices?.[0]?.message?.content || JSON.stringify(data).slice(0, 500) });
}));

// ---- search -----------------------------------------------------------------
app.get('/api/search', wrap(async (req, res) => {
    const q = String(req.query.q || '').toLowerCase(); if (q.length < 2) return res.json({ q, hits: [] });
    const hits = [];
    for (const rel of await allFiles()) {
        const raw = await fs.readFile(resolveRel(rel), 'utf8'); const file = rel.split('/').pop();
        raw.split(/\r?\n/).forEach((l, i) => { if (l.toLowerCase().includes(q)) hits.push({ rel, file, line: i, text: l.trim().slice(0, 160) }); });
    }
    res.json({ q, hits: hits.slice(0, 200) });
}));

function openBrowser(url) {
    if (process.env.NO_OPEN === '1') return;
    const p = process.platform;
    const [cmd, args] = p === 'darwin' ? ['open', [url]] : p === 'win32' ? ['cmd', ['/c', 'start', '', url]] : ['xdg-open', [url]];
    execFile(cmd, args, () => {}); // best-effort; ignore failures (e.g. headless)
}
app.listen(PORT, '127.0.0.1', () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n  Compliance Tracker (private) → ${url}\n  Editing files under:           ${ROOT}\n  Bound to 127.0.0.1 only. Ctrl-C to stop.  (set NO_OPEN=1 to not auto-open)\n`);
    openBrowser(url);
});
