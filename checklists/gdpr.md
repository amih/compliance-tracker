# GDPR (EU/UK) — full version, article-referenced

**Full version** — organized by obligation area with **article references** to the official GDPR
text. As a SaaS vendor you're usually a **processor** for customer data and a
**controller** for your own (staff, marketing, billing) — many duties apply in both roles. ⏱ marks
hard legal clocks.

## A. Principles & lawful basis (Art 5–11)
- [ ] Document a **lawful basis** for every processing activity (Art 6); special-category data needs an Art 9 condition; criminal data Art 10 — _one-time; review on change_
- [ ] Apply the **Art 5 principles**: lawfulness/fairness/transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity & confidentiality, **accountability** — _continuous_
- [ ] **Consent** (Art 7): freely given, specific, recorded, as easy to withdraw as to give — _continuous_
- [ ] **Children's consent** (Art 8) handling if you offer services to minors — _one-time_

## B. Transparency & data-subject rights (Art 12–23) — ⏱ respond within **1 month**
- [ ] **Privacy notices** at collection (Art 13) and for indirectly-obtained data (Art 14) — _one-time; review annually_
- [ ] Build a process to fulfil rights within **one month** (extendable to 3 for complexity, Art 12):
  - [ ] Right of **access** (Art 15) — _event-driven_
  - [ ] **Rectification** (Art 16) — _event-driven_
  - [ ] **Erasure / "right to be forgotten"** (Art 17) — _event-driven_
  - [ ] **Restriction** of processing (Art 18) — _event-driven_
  - [ ] **Notification** to recipients of rectification/erasure/restriction (Art 19) — _event-driven_
  - [ ] **Data portability** (Art 20) — _event-driven_
  - [ ] **Object** to processing incl. direct marketing (Art 21) — _event-driven_
  - [ ] Rights re **automated decisions / profiling** (Art 22) — _one-time to assess_

## C. Controller & processor obligations (Art 24–31)
- [ ] **Accountability** measures & documentation (Art 24) — _continuous_
- [ ] **Data protection by design & by default** (Art 25) — _event-driven (per feature)_
- [ ] **Joint-controller** arrangement where applicable (Art 26) — _one-time_
- [ ] Appoint an **EU/UK representative** if you have no establishment there (Art 27) — _one-time_
- [ ] **DPA with every processor / sub-processor** (Art 28) — AWS, Stripe, analytics, LLM APIs, email — _event-driven (per vendor)_
- [ ] Offer customers your own **processor DPA**; keep a public **sub-processor list** + change notice — _one-time; update on change_
- [ ] Ensure staff process only on instruction (Art 29) — _one-time_
- [ ] **Records of Processing Activities (RoPA, Art 30)** — controller *and* processor records — _one-time; keep current_
- ⟳ **Review & refresh the RoPA** — _annual_ — last: `____` · next: **`____`**

## D. Security of processing (Art 32)
- [ ] Technical & organizational measures appropriate to risk: **encryption/pseudonymization**, confidentiality, integrity, availability, resilience, restore ability, and a **process to test/assess effectiveness** — cross-ref `iso-27001.md` — _continuous_
- ⟳ **Test/assess effectiveness of security measures** (Art 32(1)(d)) — _annual_ — last: `____` · next: **`____`**

## E. Breach notification (Art 33–34) — ⏱ hard clocks
- [ ] Breach detection → assessment → decision runbook — _one-time_
- [ ] ⏱ **Notify the supervisory authority within 72 hours** of becoming aware (unless unlikely to risk individuals) — Art 33 — _event-driven_
- [ ] ⏱ **Notify affected individuals without undue delay** if high risk — Art 34 — _event-driven_
- [ ] As a **processor**, notify your controller-customer "without undue delay" (Art 33(2)) — _event-driven_
- [ ] Maintain an internal **breach register** (all breaches, notifiable or not) — Art 33(5) — _continuous_
- ⟳ **Breach-response drill** — _annual_ — last: `____` · next: **`____`**

## F. DPIA & DPO (Art 35–39)
- [ ] **DPIA** for high-risk processing **before** you start it (Art 35); consult the authority if residual high risk (Art 36) — _event-driven_
- [ ] Appoint a **DPO** if required (Art 37) — or document why not; publish contact & involve in privacy matters (Art 38–39) — _one-time_
- ⟳ **Review DPIAs & DPO reporting** — _annual_ — last: `____` · next: **`____`**

## G. International transfers (Art 44–49)
- [ ] Map all transfers outside the EEA/UK (incl. US-hosted LLM APIs, analytics, support) — _one-time; keep current_
- [ ] Use a valid transfer mechanism: **adequacy** (Art 45) or **appropriate safeguards** — **SCCs** / BCRs (Art 46) — _one-time; per vendor_
- ⟳ **Transfer Impact Assessment** for non-adequate destinations; re-check on legal change — _annual_ — last: `____` · next: **`____`**
- [ ] Document reliance on any **Art 49 derogations** (exceptions) if used — _one-time_

## H. Accountability rollup
- ⟳ **Annual privacy review**: RoPA, notices, retention schedule, consent records, vendor/sub-processor DPAs, training — _annual_ — last: `____` · next: **`____`**
- ⟳ **Staff data-protection training** — _annual + onboarding_ — last: `____` · next: **`____`**
