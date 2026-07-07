# SOC 2 (AICPA) — full version, by Common Criteria

**Full version** — the full **Common Criteria (CC1–CC9)** task set (207 tasks) against the **2017
Trust Services Criteria (revised points of focus 2022)**. **Security (CC-series) is mandatory**;
add **Availability / Confidentiality / Processing Integrity / Privacy** only where you commit them.
**Type II** proves controls operated over a **period** (commonly 3–12 months), renewed **annually**.

Most CC tasks are **establish-once controls** (checkbox) that you then *operate continuously* and
evidence for the audit window; the genuinely time-boxed ones are pulled out as `⟳`.

## CC1 — Control Environment (integrity, board, structure, competence)
- [ ] Establishing and approving a **Code of Conduct**; communicating & tracking acknowledgment
- [ ] Board **oversight of ethics & compliance**; independence; roles & responsibilities documented
- [ ] Defining authorities & enforcing **role-based responsibilities**; documenting reporting lines
- [ ] Defining **competency expectations** for key roles; background checks & competency evaluation
- [ ] Mentoring/training for key roles; **contingency plans** for key responsibilities
- [ ] Communicating responsibilities & enforcing accountability; align performance measures to control objectives; manage performance pressures
- [ ] Disciplinary process for conduct/privacy violations
- ⟳ **Review Code of Conduct** with leadership — _annual_ — last: `____` · next: **`____`**
- ⟳ **Review board expertise / roles & reporting lines** — _annual_ — last: `____` · next: **`____`**
- ⟳ **Evaluate personnel & provider competency; internal-control fulfilment** — _annual_ — last: `____` · next: **`____`**
- ⟳ **Monitor third-party performance & compliance** — _ongoing; review quarterly_ — last: `____` · next: **`____`**

## CC2 — Communication and Information
- [ ] Identify information needed for controls; capture/transform system data; ensure data quality & availability
- [ ] **Document internal & external data flows**; maintain **system component inventory**; classify information; track custody/location of assets
- [ ] Internal comms: control responsibilities, management–board channel, **confidential/anonymous internal reporting**, change & incident reporting procedures, objectives & updates
- [ ] External comms: control info to external parties, feedback channels, anonymous external reporting, confidentiality/privacy objectives, external privacy-incident reporting, system design/boundaries/responsibilities to external users
- ⟳ **Security awareness training** (all staff) — _annual + onboarding_ — last: `____` · next: **`____`**
- ⟳ **Privacy awareness training** — _annual + onboarding_ — last: `____` · next: **`____`**
- ⟳ **Communicate assessment results to the board** — _annual_ — last: `____` · next: **`____`**

## CC3 — Risk Assessment
- [ ] Define & document operational / financial-reporting / nonfinancial-reporting / compliance objectives; materiality & accuracy standards; acceptable deviation
- [ ] Identify & document organizational **risks, threats, and vulnerabilities**; risk treatment strategy; assess risks from external parties
- [ ] **Fraud-risk** assessment (incl. IT-related & rationalization) with records
- ⟳ **Comprehensive risk assessment** (impact & likelihood, management involved) — _annual_ — last: `____` · next: **`____`**
- ⟳ **Reassess risks & review controls** for business/environment/system/vendor changes — _annual + on change_ — last: `____` · next: **`____`**

## CC4 — Monitoring Activities
- [ ] Define scope & frequency of evaluations; appoint independent evaluators; integrate ongoing control checks; use diverse evaluation methods
- ⟳ **Perform ongoing + separate control evaluations** — _quarterly ongoing / annual separate_ — last: `____` · next: **`____`**
- ⟳ **Review evaluation results with management & board; communicate deficiencies** — _annual_ — last: `____` · next: **`____`**
- ⟳ **Track remediation** of control deficiencies to closure — _continuous; review monthly_ — last: `____` · next: **`____`**

## CC5 — Control Activities
- [ ] Design controls in response to risks; identify processes needing controls; use balanced control types across org levels
- [ ] Enforce **segregation of duties** (or compensating controls); document system/control dependencies
- [ ] Technology controls: procedures, role-based access, development & maintenance controls; embed controls in operations; assign responsibility to competent personnel; timely execution; investigate & correct failures
- ⟳ **Review control activities for effectiveness** — _annual_ — last: `____` · next: **`____`**

## CC6 — Logical and Physical Access
- [ ] Manage **information-asset inventory & classification**; security risk assessment for new systems
- [ ] Restrict logical access by classification/role; **MFA** for users & devices; network segmentation; manage external access points & data flows
- [ ] Define & enforce access requirements; **access-credential lifecycle** management
- [ ] **Encryption** for data protection; **protect cryptographic keys**; restrict access to confidential & personal information
- [ ] Approve & document credential creation; modify access on authorization; remove/revoke access when no longer needed or expired
- [ ] Physical access to facilities (or documented cloud reliance); **secure disposal / data destruction**
- ⟳ **Periodic access-credential review** (all systems) — _quarterly_ — last: `____` · next: **`____`**

## CC7 — System Operations (detection & incident response)
- [ ] **Harden** configuration standards & monitor compliance; detect unauthorized infra changes & unknown components
- [ ] Security event detection procedures; filter/analyze anomalies; **monitor detection tools' effectiveness**
- [ ] Incident response: assign responsibilities, determine severity, **contain/mitigate/resolve**, restore interim ops, remediation
- [ ] Assess disclosure of confidential & personal data; **breach-response** for privacy incidents; report unauthorized disclosure; disciplinary action after privacy breach
- [ ] Post-incident: document root cause, implement preventive controls, apply lessons learned, communicate recovery actions
- ⟳ **Conduct & document vulnerability scans** — _continuous; monthly review_ — last: `____` · next: **`____`**
- ⟳ **Penetration test** — _annual_ — last: `____` · next: **`____`**
- ⟳ **Test the incident-recovery / IR plan** (tabletop) — _annual_ — last: `____` · next: **`____`**
- ⟳ **Review incidents for root cause & patterns; evaluate IR procedure effectiveness** — _annual_ — last: `____` · next: **`____`**

## CC8 — Change Management
- [ ] Manage change across the lifecycle; **authorize & approve changes** before implementation; design changes securely
- [ ] Document & track changes; maintain **baseline configuration** & software config parameters
- [ ] **Test changes** before deployment; enforce segregation of duties in the change process; evaluate changes for goal alignment
- [ ] Emergency-change procedures; **patch assessment & application**; initiate change from incident remediation
- [ ] Protect confidential & personal data and **build privacy in** during development; test resilience during design

## CC9 — Risk Mitigation
- [ ] Business resilience & mitigation plans (BC/DR)
- [ ] Vendor management: define engagement requirements, **risk inventory**, assign responsibilities, comms protocols, exception handling, secure termination
- [ ] Third-party **confidentiality & privacy agreements** in place
- ⟳ **Assess vendor performance/compliance by risk level; address findings** — _annual_ — last: `____` · next: **`____`**
- ⟳ **BC/DR resilience test** — _annual_ — last: `____` · next: **`____`**

## Category add-ons (only if in scope, beyond Security)
- [ ] **Availability (A1):** capacity monitoring, backups + restore tests, DR, SLA/uptime tracking — _continuous; restore test quarterly_
- [ ] **Confidentiality (C1):** identify/classify confidential data, encryption, retention & disposal — _continuous_
- [ ] **Processing Integrity (PI1):** input/output validation, processing monitoring, reconciliation — _continuous_
- [ ] **Privacy (P1–P8):** notice, choice/consent, collection/use/retention/disposal limits, access, disclosure, quality, monitoring/enforcement (align with `gdpr.md` / `israel-ppl.md`) — _continuous_

## Evidence & renewal
- ⟳ **Collect evidence continuously** across the Type II window (tickets, logs, review records, screenshots) — _continuous_
- ⟳ **Annual Type II audit** with a licensed CPA firm — _annual_ — last: `____` · next: **`____`**
- ⟳ **Bridge letter** to customers between reports — _as needed_ — last: `____` · next: **`____`**

> Organized by the 2017 Trust Services Criteria, mapped CC1.1–CC9.x. Attach the per-criterion
> evidence for each task in the app.
