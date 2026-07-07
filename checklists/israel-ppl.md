# Israel — Protection of Privacy Law + Amendment 13 + Data Security Regulations 5777-2017

**Full version** — built from the official structure of the **תקנות הגנת הפרטיות (אבטחת מידע),
התשע"ז-2017** as encoded in the PPA questionnaire, plus **Amendment 13** (in force **14 Aug 2025**).

> **This is the per-database template.** Under the 2017 regulations, most obligations apply **per
> managed database (מאגר מידע)**. In the app, add each database under **Privacy databases** — it
> clones this list into `databases/<name>.md`. Tasks tagged **{company-wide}** are done once for the
> whole company and **sync across all databases**; **{per-level}** tasks **sync across databases of
> the same sensitivity level**; everything else is tracked **independently per database**.

> ⚠️ Not legal advice — confirm specifics with Israeli counsel.

## 0. Scope & security level — do this first
- [ ] Inventory every **מאגר מידע** (database of personal data) you hold or process — _one-time; keep current_ {company-wide}
- [ ] Classify **this database** as **basic / medium / high** — _one-time; re-check on change_
  - **בסיסית (basic):** small business-use DB with limited sensitive data.
  - **בינונית (medium):** main purpose is disclosure to others **or** especially-sensitive data (health, genetic, biometric, political/religious, criminal record, comms data, financial data, consumption habits revealing personality).
  - **גבוהה (high):** a medium-level DB **plus** **> 100 authorized users** **or** **≥ 100,000 data subjects**.
- [ ] Confirm **registration** obligations under Amendment 13 — _one-time_ {company-wide}

## 2. מסמך הגדרות המאגר — Database Definitions Document (per DB)
- [ ] General description of **collection & use** operations — _one-time; update on change_
- [ ] **Purposes** of use; sources of the data — _one-time_
- [ ] **Types of data** held (map against the sensitive-data list) — _one-time_
- [ ] **Cross-border transfer** details — _one-time; review annually_
- [ ] **Processing by a holder** (מחזיק / external processor) documented — _one-time_
- [ ] **Main security risks** and how you handle them — _one-time_
- [ ] Names of **DB manager, holder, and security officer** — _one-time; keep current_

## 3. ממונה אבטחת מידע — Information Security Officer
- [ ] Appoint a **security officer** where required — _one-time_ {company-wide}
- [ ] Ensure independence (no conflict of interest) and direct reporting — _one-time_ {company-wide}
- ⟳ Security-officer **report to management** — _annual_ — last: `____` · next: **`____`** {company-wide}

## 4. נוהל אבטחה — Security Procedure (per DB)
- [ ] Write the **Security Procedure** (physical & environmental; access permissions; protection controls; instructions to users; risks & handling; incident handling; mobile devices; identification & authentication; access control & logging; periodic audits; backup; development documentation) — _one-time_
- ⟳ **Review & update the Security Procedure** — _annual_ — last: `____` · next: **`____`**

## 5. מיפוי מערכות המאגר וביצוע סקר סיכונים — System mapping & risk survey (per DB)
- [ ] Maintain an up-to-date **structure map & asset inventory** of the DB's systems — _one-time; keep current_
- ⟳ **Risk survey (סקר סיכונים)** for medium/high DBs — _high: every 18 months; medium: periodic_ — last: `____` · next: **`____`**
- ⟳ **Penetration test (מבדקי חדירה)** for **high-level** DBs — _every 18 months_ — last: `____` · next: **`____`**

## 6. אבטחה פיזית וסביבתית — Physical & environmental security
- [ ] Physical access controls to systems/media (or documented cloud reliance) — _one-time; continuous_
- [ ] Environmental protection & secure disposal of media — _one-time_

## 7. אבטחת מידע בניהול כוח אדם — Personnel security (HR)
- [ ] Suitability check before granting access; **confidentiality undertakings** signed — _event-driven (per hire)_
- [ ] **HR procedure** covering access on hire/role-change/termination — _one-time_ {company-wide}
- ⟳ **Security awareness / training** for authorized users — _annual + at onboarding_ — last: `____` · next: **`____`** {company-wide}

## 8. ניהול הרשאות הגישה — Access-permission management (per DB)
- [ ] Grant access on **need-to-know / least privilege**; document who may access what — _one-time; continuous_
- [ ] Maintain a **register of authorized users (רישום מורשי גישה)** — _continuous_
- ⟳ **Review access rights** against role/employment — _quarterly_ — last: `____` · next: **`____`**

## 9. זיהוי ואימות — Identification & authentication
- [ ] Authentication means appropriate to level (**MFA** for medium/high) — _one-time; continuous_ {per-level}
- [ ] Unique identities; control over authentication credentials — _continuous_

## 10. בקרה ותעוד גישה — Access control & logging (per DB)
- [ ] **Automated logging** of access to the DB systems (who, when, which action) — _continuous_
- [ ] Logs protected from tampering; cover access attempts & security events — _continuous_
- ⟳ **Review access/security logs** — _monthly for high; quarterly for medium_ — last: `____` · next: **`____`**

## 11. תעוד של ארועי אבטחה — Security-event documentation (per DB)
- [ ] Document **security events**; maintain an incident record — _continuous_

## 12. התקנים ניידים — Mobile devices
- [ ] Policy for mobile/portable device use (encryption, remote wipe, restrictions) — _one-time; continuous_ {company-wide}

## 13. ניהול מאובטח ומעודכן — Secure & up-to-date system management (per DB)
- [ ] Hardening/secure configuration; **patching & updates** to SLA — _continuous_
- [ ] **Document development actions in the DB** — _continuous_

## 14. אבטחת תקשורת — Communications security (per DB)
- [ ] Encrypt sensitive data **in transit and at rest**; secure the network — _continuous_

## 15. מיקור חוץ — Outsourcing (holders / processors)
- [ ] Written agreement with each **holder / external processor** — _event-driven (per vendor)_
- ⟳ **Review outsourcing / holder arrangements** — _annual_ — last: `____` · next: **`____`**

## 16. ביקורות תקופתיות — Periodic audits (per DB)
- ⟳ **Internal audit** of Security-Procedure compliance (independent reviewer) — _high & medium: every 18 months_ — last: `____` · next: **`____`**

## 17. משך שמירת נתוני האבטחה — Retention of security/log data
- [ ] Retain **access/security logs** for the required minimum (**≥ 24 months** for high-level) — _one-time to set; continuous_ {per-level}

## 18. גיבוי ושחזור נתוני אבטחה — Backup & recovery (per DB)
- [ ] **Backup procedure** + **recovery procedure** documented — _one-time_
- ⟳ **Restore test** and document recovery drills — _quarterly_ — last: `____` · next: **`____`**

## 19. האחריות לאבטחת המידע — Responsibility for information security
- [ ] Owner/manager accountable; roles & responsibilities documented — _one-time_ {company-wide}
- ⟳ **Ongoing compliance-monitoring plan** (תוכנית לבקרה שוטפת) reviewed — _annual_ — last: `____` · next: **`____`** {company-wide}

## 20. רגולציה ותקנים מקבילים — Parallel regulation & standards
- [ ] Map coverage to ISO 27001 / SOC 2 to avoid duplicate work — _one-time; review annually_ {company-wide}

## A13. Amendment 13 — data-subject rights, breach & enforcement
- [ ] Process for **data-subject rights** (access, correction, deletion) — _one-time to build_ {company-wide}
- [ ] ⏱ **Data-subject request** handling within statutory time — _event-driven_
- [ ] Updated **privacy notice / consent** aligned to the broadened definitions — _one-time; review annually_ {company-wide}
- [ ] **Breach runbook**: assess severity; **notify the PPA**; notify data subjects where required — _one-time; event-driven_ {company-wide}
- [ ] Maintain readiness for **administrative fines / PPA enforcement** (documented compliance evidence) — _continuous_ {company-wide}
- ⟳ **Breach drill** — _annual_ — last: `____` · next: **`____`** {company-wide}
