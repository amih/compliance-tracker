# HIPAA — only if you handle US health data (PHI)

If your SaaS stores/processes **Protected Health Information** for US healthcare customers, you're a
**Business Associate** and the **Security Rule** (+ Breach Notification Rule) applies. Otherwise
skip. Engage US healthcare-privacy counsel; this is a practical outline.

## A. Foundations (one-time)
- [ ] Sign a **Business Associate Agreement (BAA)** with each covered-entity customer — _event-driven (per customer)_
- [ ] Sign BAAs with your **sub-processors** that touch PHI (cloud, email, LLM APIs) — _event-driven (per vendor)_
- [ ] Name a **Security Official** responsible for HIPAA — _one-time_
- [ ] Policies & procedures for the Security Rule safeguards — _one-time; review annually_

## B. Safeguards (Security Rule)
- [ ] **Administrative**: workforce training, access management, sanction policy — _continuous_
- [ ] **Technical**: access control, unique IDs, encryption of ePHI in transit & at rest, audit logging, integrity — _continuous_
- [ ] **Physical**: facility access, device/media controls & disposal — _one-time; continuous_
- ⟳ **Security Risk Analysis** (required, recurring) + risk management plan — _annual (and on major change)_ — last: `____` · next: **`____`**
- ⟳ **Workforce HIPAA training** — _annual + onboarding_ — last: `____` · next: **`____`**
- ⟳ **Access / audit-log review** — _quarterly_ — last: `____` · next: **`____`**

## C. Breach Notification Rule (hard clocks)
- [ ] Breach assessment & notification runbook — _one-time_
- [ ] ⏱ Notify affected individuals & HHS **without unreasonable delay, ≤ 60 days**; notify the covered entity per your BAA (often faster) — _event-driven_
- [ ] Log all incidents; report annually for breaches < 500 individuals — _continuous / annual_
