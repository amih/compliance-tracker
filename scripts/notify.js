#!/usr/bin/env node
// Reminder notifier — prints overdue + soon-due recurring activities and, if a webhook
// is configured (data/config.json → settings.webhook), posts a summary to Slack/Teams/etc.
// Run from cron, e.g.:  0 8 * * 1  node /path/to/scripts/notify.js
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseChecklist, today, addPeriod } from '../lib/checklist.js';
import { load } from '../lib/store.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const soonDays = Number(process.argv[2] || 14);

async function collect() {
    const t = today();
    const soon = addPeriod(t, { days: soonDays });
    const overdue = [], upcoming = [];
    for (const dir of ['checklists', 'offboarding']) {
        let files = [];
        try { files = (await fs.readdir(path.join(ROOT, dir))).filter((f) => f.endsWith('.md')); } catch { continue; }
        for (const f of files) {
            const raw = await fs.readFile(path.join(ROOT, dir, f), 'utf8');
            const { title, tasks } = parseChecklist(raw);
            for (const task of tasks) {
                if (task.type !== 'recurring' || !task.next) continue;
                const row = `${title}: ${task.name} (due ${task.next})`;
                if (task.next < t) overdue.push(row);
                else if (task.next <= soon) upcoming.push(row);
            }
        }
    }
    return { t, overdue, upcoming };
}

const { t, overdue, upcoming } = await collect();
const lines = [
    `Compliance reminders — ${t}`,
    `OVERDUE (${overdue.length}):`, ...overdue.map((r) => '  • ' + r),
    `DUE within ${soonDays}d (${upcoming.length}):`, ...upcoming.map((r) => '  • ' + r)
];
console.log(lines.join('\n'));

const cfg = await load('config.json');
const webhook = cfg.settings?.webhook;
if (webhook && (overdue.length || upcoming.length)) {
    const text = lines.join('\n');
    try {
        const r = await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
        console.error(`webhook: ${r.status}`);
    } catch (e) {
        console.error('webhook failed:', e.message);
    }
}
process.exit(overdue.length ? 1 : 0);
