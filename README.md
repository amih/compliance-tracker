# Security & Privacy Compliance Tracker

An open-source, **local-first** compliance tracker for a software-development company that also runs
**SaaS handling client data**. The state lives in **plain Markdown** (`checklists/`), **git** is the
tamper-evident audit log (*who did what, when*), and an included **local web app** gives you a
dashboard, editor, Gantt, risk register, cross-framework map, reports and more — all on `localhost`,
editing only your local files.

```bash
npm install && npm start     # opens http://localhost:4181 in your browser
```

Covers **ISO 27001:2022, SOC 2, NIST CSF 2.0, NIST 800-53, OWASP (ASVS/Top 10/SAMM/LLM), GDPR,
Israel PPL (Amendment 13), PCI DSS 4.0, HIPAA** — enable only the ones that apply to you. Multilingual
(English / Hebrew RTL / Spanish).

> **Privacy — read this before you push anywhere.** As you use the app it writes your **ticked state,
> evidence, owners, POA&M, offboarding runs and per-database records** into the working tree — that is
> **sensitive**. This public repo ships **blank templates + the tool only**. For real use, keep your
> records in a **PRIVATE** repo (fork this private, or point the in-app git remote at a private repo);
> pull the public upstream for tool updates, but never push your filled-in state to it.

> ⚠️ **Not legal advice.** These lists are practical, plain-language checklists distilled from
> the *public structure* of each framework. They are a working starting point, **not** the
> authoritative control text and **not** a substitute for the official standards, a qualified
> auditor, or a privacy lawyer. Buy/obtain the real standards (linked under **Sources**) and
> confirm scope for your jurisdiction and customers.

---

## Can this really be run without an app? — Yes.

You asked whether a "smart `.md` + git repo" can hold the state of which tasks are done, when,
and by whom. It can, and for a small company it's arguably *better* than a SaaS GRC tool for the
audit-trail part:

| Need | How git+md covers it |
|------|----------------------|
| **State** (done / not done) | Markdown checkboxes for one-time tasks; a `last`/`next` date line for recurring ones. |
| **Who + when** | **`git log`** — every tick is a commit with an author and a timestamp. `git log -p checklists/iso-27001.md` is a complete, tamper-evident history of every change. This *is* your audit evidence. |
| **History over time** | git keeps every past state; `git blame` shows who last touched each line; `git log --since` scopes a period for an auditor. |
| **"What's due now?"** | `scripts/due.py` scans recurring tasks and prints anything past its `next` date. Run it from cron/CI for a nudge. |
| **Evidence / artifacts** | Link each task to a PDF/screenshot/ticket (store big files elsewhere; commit the *link* + a hash). |
| **Sign-off** | A commit is the sign-off. For stronger assurance, **sign commits** (`git commit -S`) so authorship is cryptographically provable. |

**Where a real GRC tool still wins** (know the ceiling): automated evidence *collection* from
cloud/SaaS, control-to-framework cross-mapping at scale, auditor portals, SSO/RBAC on the data,
and reminders/dashboards for a **team**. Rule of thumb: **git+md is great up to ~1 framework and a
handful of people**; once you're maintaining SOC 2 *and* ISO *and* answering security
questionnaires weekly, graduate to Vanta/Drata/Secureframe/a full GRC platform and keep this repo
as the human-readable index.

---

## Optional: the local web app

A small **localhost web UI** ships with this repo. It edits **only** these Markdown files (nothing
leaves your machine) and adds a dashboard, an overdue/recurring manager, a Gantt plan, an
offboarding workflow, and git commit/push/blame from the browser. The `.md` files stay the source
of truth — the app is just a nicer way to drive them.

```bash
npm install                       # one time (needs Node 18+)
npm start                         # serves http://localhost:4181  (PORT=… to change)
node scripts/notify.js            # (optional) print/post overdue items — wire to cron
```

**Private by design:** binds to `127.0.0.1` only, validates every path (can never write outside
`checklists/` / `offboarding/` / `data/`), and the git-remote helper refuses to treat these
sensitive records as anything but a **private** repo.

**Features:**
- **Dashboard** — completion %, per-regulation progress, and ETA projection at an adjustable
  tasks/week velocity.
- **Checklists** — tick tasks, roll recurring dates forward automatically, or edit raw Markdown with
  live preview. Per-task **owner assignment** and **evidence attachments** (link + SHA-256 of a local file).
- **Recurring & overdue** + **My tasks** (filter by owner) + **.ics** calendar export.
- **Gantt** plan · **Risk register / POA&M** · **Cross-framework map** (do-once-satisfy-many) ·
  **Completion trend** rebuilt from git history · **Automated checks** (remote configured? signed
  commits? reminders wired? + cloud-integration stubs).
- **Employee offboarding** — dated runbook run per departure.
- **Reports & trust** — one-click status report and shareable **trust page**, each anchored to the
  **git commit hash** as an integrity proof; optional **signed commits**.
- **Git** — status/commit/push, private-remote setup, **blame** and **activity history**.
- **AI assistant** — optional; set `AI_API_KEY` (+ `AI_BASE_URL` / `AI_MODEL`) for any
  OpenAI-compatible endpoint, including your own gateway.
- **Multilingual** — English, Hebrew (RTL) and Spanish out of the box. Add a language by dropping a
  `public/i18n/<code>.json` and one line in `public/i18n/langs.json`.
- **Onboarding & framework-first menu** — first run asks which frameworks apply; **enabled ones are
  prominent** in the sidebar, disabled ones tuck into a collapsed "More frameworks", and existing
  users add a framework (or database) any time.
- **Israeli privacy databases (per-מאגר)** — the 2017 Data Security Regulations apply **per managed
  database**. "Add privacy database" (name + sensitivity level) clones the Israel PPL checklist into
  `databases/<name>.md`. Tasks tagged **{company-wide}** sync across **all** databases; **{per-level}**
  across databases of the **same** sensitivity level; the rest are tracked independently. A new
  database **inherits** the shared work already done.

---

## How to use it

1. **Scope first.** Open the **Applicability** matrix below and delete the checklists that don't
   apply to you. Don't track PCI if you never touch card data.
2. **Do one framework at a time.** ISO 27001 or SOC 2 as the backbone; layer the rest.
3. **Tick as you go**, one task per commit where practical, with a real message:
   `git commit -m "iso-27001: access reviews done for Q3 (evidence: link)"`.
4. **Weekly (5 min):** run `python3 scripts/due.py` → do/anything overdue.
5. **Monthly & quarterly:** work the recurring items due that period (see `CADENCE.md`).
6. **Sign commits** if you want the history to stand up as evidence: `git config commit.gpgsign true`.

### Task conventions

**One-time & event-driven tasks — use a checkbox:**
```
- [ ] Define the ISMS scope and boundaries            <!-- one-time -->
- [x] Sign a DPA with Stripe                          <!-- done; git log shows who/when -->
```

**Recurring tasks — no checkbox; track a rolling last/next:**
```
- ⟳ **Review user access rights** — _every quarter_ — last: `2026-07-01` · next: **`2026-10-01`** · by: `@ami`
```
When you do a recurring task: update `last` to today, recompute `next`, set `by`, and commit.
`git log` preserves every past cycle — that's the evidence an auditor wants.

### Frequency legend

`one-time` · `continuous` (always-on control) · `monthly` · `quarterly` · `semi-annual` ·
`annual` · `every 18 months` · `triennial` (3-yr) · `event-driven` (on incident / hire / change /
new vendor / new high-risk processing).

---

## Applicability — which of these apply to a SaaS dev shop?

| Framework | File | Applies when… | Core cadence |
|-----------|------|---------------|--------------|
| **ISO/IEC 27001:2022** | `checklists/iso-27001.md` | You want a recognized ISMS certification (EU/global customers ask for it). | Annual internal audit + mgmt review; 3-yr cert cycle w/ annual surveillance |
| **SOC 2 (AICPA)** | `checklists/soc2.md` | You sell SaaS to **US / enterprise** buyers (most-requested). | Annual **Type II** audit over a 3–12-mo period |
| **NIST CSF 2.0** | `checklists/nist-csf.md` | You want a free framework to *organize* your program (maps to the others). | Annual profile self-assessment |
| **NIST SP 800-53 / FedRAMP** | `checklists/nist-800-53.md` | You sell to **US government** or need FedRAMP. | Monthly con-mon scans; annual assessment |
| **OWASP (ASVS 5.0 / Top 10 / SAMM / LLM)** | `checklists/owasp-appsec.md` | **Always** — you write software. | Continuous in CI; annual pen test |
| **GDPR** | `checklists/gdpr.md` | You process **EU/UK** residents' personal data. | Breach ≤72h; DSAR ≤1 mo; annual reviews |
| **Israel PPL (Amendment 13)** | `checklists/israel-ppl.md` | You're in **Israel** or hold Israeli residents' data. | Risk assessment + pen test **every 18 mo** for high-level DBs |
| **PCI DSS 4.0.1** | `checklists/pci-dss.md` | You **store/process/transmit card data** yourself (skip if fully outsourced to Stripe/PayPal → SAQ A). | Quarterly ASV scans; annual pen test/SAQ |
| **HIPAA** | `checklists/hipaa.md` | You handle **US health data (PHI)** as a Business Associate. | Annual risk analysis; breach rules |

**Typical B2B SaaS dev company (no cards, no health data):**
`OWASP` (always) + `SOC 2` and/or `ISO 27001` (customer-driven) + `GDPR` (if EU data) +
`Israel PPL` (if Israeli) — with `NIST CSF` as the organizing backbone. Everything else is opt-in.

See **`CADENCE.md`** for the merged recurring calendar across whatever you keep.

---

## Limitations

- **Not legal advice.** The checklists are practical, plain-language distillations of each framework's
  **public structure** — not the authoritative control text, and not a substitute for the official
  standards, a qualified auditor, or a privacy lawyer. ISO 27001 and PCI DSS full texts are
  paywalled; obtain them for the exact wording.
- **Privacy of your records.** The app edits your working files in place; a public/shared repo would
  expose your compliance posture. Keep real records **private** (see the note at the top).
- **Local trust model.** The app binds to `127.0.0.1` with **no authentication** — it assumes only you
  can reach your machine. Don't expose the port. It runs git commands in this repo on your behalf.
- **Cloud auto-evidence is stubbed.** The "Automated checks" that touch AWS / GitHub are placeholders
  (`TODO`) until you wire in credentials; the local checks (git remote, signed commits, reminders,
  evidence) work today.
- **AI assistant is opt-in** and needs your own OpenAI-compatible key (`AI_API_KEY`).
- **Scale.** Ideal for a solo founder / small team running one-to-a-few frameworks. For a larger team
  with automated evidence collection, auditor portals and SSO, graduate to a full GRC platform and
  keep this as the human-readable index.
- **Freshness.** Frameworks change; the content reflects versions current as of mid-2026 (e.g. ISO
  27001:**2022**, PCI DSS **4.0**, CSF **2.0**, Israel Amendment **13**). Re-check before an audit.

## Sources (official)

- **ISO/IEC 27001:2022** (ISMS requirements) & **27002:2022** (controls) — https://www.iso.org/standard/27001
- **SOC 2 — 2017 Trust Services Criteria (rev. points of focus 2022)**, AICPA — https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022
- **NIST Cybersecurity Framework 2.0** (2024) — https://www.nist.gov/cyberframework
- **NIST SP 800-53 Rev. 5** — https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final
- **OWASP ASVS 5.0** — https://owasp.org/www-project-application-security-verification-standard/
- **OWASP Top 10 (2021)** — https://owasp.org/Top10/ · **API Security Top 10 (2023)** — https://owasp.org/API-Security/
- **OWASP SAMM v2** — https://owaspsamm.org/ · **OWASP Top 10 for LLM Apps (2025)** — https://genai.owasp.org/llm-top-10/
- **GDPR** (Regulation 2016/679) — https://gdpr-info.eu/ · EDPB — https://www.edpb.europa.eu/
- **Israel Protection of Privacy Law + Amendment 13 + Data Security Regs 5777-2017** — https://www.gov.il/en/departments/the_privacy_protection_authority
- **PCI DSS 4.0.1** — https://www.pcisecuritystandards.org/
