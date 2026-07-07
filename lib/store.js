// Tiny JSON store for app data (settings, evidence, owners, POA&M). Lives in data/.
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');

const DEFAULTS = {
    'config.json': { settings: { velocity: 5, owner: '', lang: 'en', webhook: '' }, frameworks: {} },
    'evidence.json': {}, // key `rel::name` -> [{label,url,path,sha256,by,date}]
    'owners.json': {}, // key `rel::name` -> owner
    'poam.json': [], // [{id,title,framework,severity,owner,due,status,notes,created}]
    'databases.json': [] // [{slug,name,level,rel,created}]
};

export async function load(name) {
    try {
        return JSON.parse(await fs.readFile(path.join(DATA, name), 'utf8'));
    } catch {
        return structuredClone(DEFAULTS[name] ?? {});
    }
}
export async function save(name, obj) {
    await fs.mkdir(DATA, { recursive: true });
    await fs.writeFile(path.join(DATA, name), JSON.stringify(obj, null, 2), 'utf8');
    return obj;
}
export const taskKey = (rel, name) => `${rel}::${name}`.slice(0, 300);
