// Parsing, stats and date math for the compliance checklists (plain Markdown).
// Shared by the server; no external deps.

export const isoDate = (d) => {
    const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return z.toISOString().slice(0, 10);
};
export const today = () => isoDate(new Date());

// freq keyword -> period. Order matters (most specific first).
const PERIODS = [
    [/every\s*18\s*month|(^|\D)18\s*month/i, { months: 18 }],
    [/tri(ennial)?|every\s*3\s*years?|(^|\D)3\s*years?/i, { months: 36 }],
    [/semi-?annual|every\s*6\s*month|(^|\D)6\s*month|bi-?annual/i, { months: 6 }],
    [/quarter/i, { months: 3 }],
    [/annual|yearly|every\s*year|per\s*year/i, { months: 12 }],
    [/month/i, { months: 1 }],
    [/fortnight|every\s*2\s*weeks?|bi-?week/i, { days: 14 }],
    [/week/i, { days: 7 }],
    [/dai?ly|every\s*day/i, { days: 1 }]
];

export function periodFromFreq(freq) {
    if (!freq) return null;
    for (const [re, val] of PERIODS) if (re.test(freq)) return val;
    return null;
}

export function addPeriod(dateStr, period) {
    if (!period) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (period.months) d.setMonth(d.getMonth() + period.months);
    if (period.days) d.setDate(d.getDate() + period.days);
    return isoDate(d);
}

const field = (name) => new RegExp(name + '\\s*:\\s*\\*{0,2}`([^`]+)`');
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
// Scope tag: {company-wide} = one for the whole company; {per-level} = shared across DBs of the
// same sensitivity level; otherwise per-database. Only meaningful for the Israel per-DB template.
export const scopeOf = (line) => (/\{company-wide\}/i.test(line) ? 'company' : /\{per-level\}/i.test(line) ? 'level' : 'per-db');

// Parse a checklist file into a title + task list with line numbers.
export function parseChecklist(raw) {
    const lines = String(raw).split(/\r?\n/);
    let title = null,
        section = null;
    const tasks = [];
    lines.forEach((line, i) => {
        const h1 = line.match(/^#\s+(.+)/);
        if (h1 && !title) title = h1[1].trim();
        const h = line.match(/^#{2,}\s+(.+)/);
        if (h) section = h[1].replace(/[*_`]/g, '').trim();

        const recur = line.match(/^\s*-\s*⟳\s*(.+)$/);
        if (recur) {
            const body = recur[1];
            const nameM = body.match(/\*\*(.+?)\*\*/);
            const name = (nameM ? nameM[1] : body.split('—')[0]).replace(/[*`]/g, '').trim();
            const freqM = body.match(/_([^_]+)_/);
            const lastM = body.match(field('last'));
            const nextM = body.match(field('next'));
            const byM = body.match(field('by')) || body.match(/@([A-Za-z0-9._-]+)/);
            tasks.push({
                type: 'recurring',
                line: i,
                section,
                name,
                scope: scopeOf(body),
                freq: freqM ? freqM[1].trim() : '',
                last: lastM && isDate(lastM[1]) ? lastM[1] : '',
                next: nextM && isDate(nextM[1]) ? nextM[1] : '',
                by: byM ? (byM[1] || '').trim() : ''
            });
            return;
        }

        const cb = line.match(/^\s*-\s*\[([ xX])\]\s*(.+)$/);
        if (cb) {
            const done = cb[1].toLowerCase() === 'x';
            const text = cb[2];
            const italics = text.match(/_([^_]+)_/g) || [];
            const cadence = italics.length ? italics[italics.length - 1].replace(/_/g, '').trim() : '';
            const type = /event/i.test(cadence) ? 'event' : /continuous|ongoing/i.test(cadence) ? 'continuous' : 'once';
            const name = text
                .replace(/\{(company-wide|per-level)\}/gi, '')
                .replace(/—\s*_[^_]+_.*$/, '')
                .replace(/<!--.*?-->/g, '')
                .replace(/\*\*/g, '')
                .replace(/`/g, '')
                .trim();
            tasks.push({ type, line: i, section, name, done, cadence, scope: scopeOf(text) });
        }
    });
    return { title: title || 'Untitled', tasks };
}

export function computeStats(tasks, ref) {
    const t = ref || today();
    const closable = tasks.filter((x) => x.type === 'once' || x.type === 'event');
    const done = closable.filter((x) => x.done).length;
    const recurring = tasks.filter((x) => x.type === 'recurring');
    const scheduled = recurring.filter((x) => x.next);
    const overdue = scheduled.filter((x) => x.next < t);
    const continuous = tasks.filter((x) => x.type === 'continuous').length;
    return {
        oneTotal: closable.length,
        oneDone: done,
        pct: closable.length ? Math.round((done / closable.length) * 100) : 100,
        continuous,
        recurring: recurring.length,
        scheduled: scheduled.length,
        unscheduled: recurring.length - scheduled.length,
        overdue: overdue.length
    };
}

// Replace or append a `field: `value`` token on a single line, preserving bold markers.
export function setField(line, name, value, bold) {
    const q = bold ? '**' : '';
    const re = new RegExp(name + '\\s*:\\s*\\*{0,2}`[^`]*`');
    const rep = `${name}: ${q}\`${value}\`${q}`;
    if (re.test(line)) return line.replace(re, rep);
    return line.replace(/\s*$/, '') + ` · ${rep}`;
}
