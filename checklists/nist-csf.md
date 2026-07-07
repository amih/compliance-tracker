# NIST Cybersecurity Framework 2.0 — full version (all subcategories)

**Full version** — every **Function → Category → Subcategory** of the CSF 2.0 (2024) Core. CSF is
**voluntary and not certifiable** — use it to *organize* your program and cross-map to ISO 27001 /
SOC 2 / 800-53. Subcategories are **outcomes to achieve and maintain** (check when achieved);
genuinely periodic program activities are marked `⟳`. Run it as a yearly loop: assess **Current
Profile** → set **Target Profile** → close gaps.

- ⟳ **Self-assess Current vs Target Profile** across all 6 functions; update the improvement plan — _annual_ — last: `____` · next: **`____`**

## GV — GOVERN
**GV.OC Organizational Context**
- [ ] GV.OC-01 Mission understood & informs cybersecurity risk mgmt · GV.OC-02 stakeholders & their expectations understood · GV.OC-03 legal/regulatory/contractual requirements understood & managed · GV.OC-04 critical objectives/capabilities/services understood · GV.OC-05 outcomes/capabilities/services the org depends on understood
**GV.RM Risk Management Strategy**
- [ ] GV.RM-01 risk objectives agreed · GV.RM-02 **risk appetite & tolerance** established · GV.RM-03 integrated into enterprise risk mgmt · GV.RM-04 strategic direction on response options · GV.RM-05 risk communication lines · GV.RM-06 standardized risk calc/prioritization method · GV.RM-07 strategic opportunities (positive risk) included
**GV.RR Roles, Responsibilities & Authorities**
- [ ] GV.RR-01 leadership accountable; culture · GV.RR-02 roles/responsibilities/authorities established · GV.RR-03 adequate resources allocated · GV.RR-04 cybersecurity in HR practices
**GV.PO Policy**
- [ ] GV.PO-01 policy established, communicated, enforced
- ⟳ GV.PO-02 **policy reviewed, updated, communicated** — _annual + on change_ — last: `____` · next: **`____`**
**GV.OV Oversight**
- ⟳ GV.OV-01/02/03 **review risk-management strategy outcomes & performance** to inform/adjust — _annual_ — last: `____` · next: **`____`**
**GV.SC Cybersecurity Supply Chain Risk Management**
- [ ] GV.SC-01 C-SCRM strategy/objectives agreed · GV.SC-02 supplier roles/responsibilities · GV.SC-03 integrated into risk mgmt · GV.SC-04 suppliers known & prioritized by criticality · GV.SC-05 security requirements in contracts · GV.SC-06 due diligence before engaging · GV.SC-08 suppliers in incident planning · GV.SC-09 supply-chain security across lifecycle · GV.SC-10 wind-down/termination provisions
- ⟳ GV.SC-07 **monitor supplier risks over the relationship** — _annual_ — last: `____` · next: **`____`**

## ID — IDENTIFY
**ID.AM Asset Management**
- [ ] ID.AM-01 hardware inventory · ID.AM-02 software/service/system inventory · ID.AM-03 network comms & data-flow maps · ID.AM-04 supplier-provided services inventory · ID.AM-05 assets prioritized by classification/criticality · ID.AM-07 data & metadata inventory · ID.AM-08 assets managed across lifecycle
**ID.RA Risk Assessment**
- [ ] ID.RA-01 vulnerabilities identified & recorded · ID.RA-02 threat intel received · ID.RA-03 internal/external threats recorded · ID.RA-04 impacts & likelihoods recorded · ID.RA-05 risk understood & prioritized · ID.RA-06 responses chosen/prioritized/tracked · ID.RA-07 changes & exceptions managed · ID.RA-08 vuln-disclosure handling · ID.RA-09 authenticity/integrity of components assessed · ID.RA-10 critical suppliers assessed pre-acquisition
- ⟳ **ID.RA overall risk assessment** refresh — _annual + on change_ — last: `____` · next: **`____`**
**ID.IM Improvement**
- [ ] ID.IM-04 incident-response & other cyber plans established, communicated, maintained
- ⟳ ID.IM-01/02/03 **identify improvements** from evaluations, tests/exercises, and operations — _annual_ — last: `____` · next: **`____`**

## PR — PROTECT
**PR.AA Identity Management, Authentication & Access Control**
- [ ] PR.AA-01 identities & credentials managed · PR.AA-02 identity proofing · PR.AA-03 users/services/hardware authenticated (**MFA**) · PR.AA-04 identity assertions protected · PR.AA-05 access permissions least-privilege & SoD · PR.AA-06 physical access managed & monitored
**PR.AT Awareness & Training**
- ⟳ PR.AT-01 **general awareness & training** — _annual + onboarding_ — last: `____` · next: **`____`**
- ⟳ PR.AT-02 **role-based training** (privileged/dev) — _annual_ — last: `____` · next: **`____`**
**PR.DS Data Security**
- [ ] PR.DS-01 data-at-rest protected · PR.DS-02 data-in-transit protected · PR.DS-10 data-in-use protected
- ⟳ PR.DS-11 **backups created, protected & tested** — _restore test quarterly_ — last: `____` · next: **`____`**
**PR.PS Platform Security**
- [ ] PR.PS-01 configuration management · PR.PS-02 software maintained/patched · PR.PS-03 hardware maintained · PR.PS-04 logs generated & available · PR.PS-05 unauthorized software prevented · PR.PS-06 secure software development practices
**PR.IR Technology Infrastructure Resilience**
- [ ] PR.IR-01 networks/environments protected from unauthorized access · PR.IR-02 assets protected from environmental threats · PR.IR-03 resilience mechanisms for normal/adverse situations · PR.IR-04 adequate capacity for availability

## DE — DETECT
**DE.CM Continuous Monitoring**
- [ ] DE.CM-01 networks monitored · DE.CM-02 physical environment monitored · DE.CM-03 personnel activity & tech usage monitored · DE.CM-06 external-provider activity monitored · DE.CM-09 computing hardware/software & data monitored
**DE.AE Adverse Event Analysis**
- [ ] DE.AE-02 adverse events analyzed · DE.AE-03 information correlated across sources · DE.AE-04 impact & scope understood · DE.AE-06 event info shared with authorized staff/tools · DE.AE-07 threat intel integrated into analysis · DE.AE-08 incidents declared per criteria
- ⟳ **Tune detections / review monitoring effectiveness** — _quarterly_ — last: `____` · next: **`____`**

## RS — RESPOND
**RS.MA Incident Management**
- [ ] RS.MA-01 IR plan executed on declaration · RS.MA-02 reports triaged & validated · RS.MA-03 incidents categorized & prioritized · RS.MA-04 escalated/elevated as needed · RS.MA-05 recovery-initiation criteria applied
**RS.AN Incident Analysis**
- [ ] RS.AN-03 root-cause analysis · RS.AN-06 investigation actions recorded (integrity preserved) · RS.AN-07 incident data/metadata collected · RS.AN-08 magnitude estimated & validated
**RS.CO Reporting & Communication**
- [ ] RS.CO-02 stakeholders notified · RS.CO-03 information shared with designated stakeholders (⏱ meet legal breach clocks — see `gdpr.md` / `israel-ppl.md`)
**RS.MI Incident Mitigation**
- [ ] RS.MI-01 incidents contained · RS.MI-02 incidents eradicated
- ⟳ **Incident-response exercise / tabletop** (validates RS.*) — _annual_ — last: `____` · next: **`____`**

## RC — RECOVER
**RC.RP Incident Recovery Plan Execution**
- [ ] RC.RP-01 recovery plan executed · RC.RP-02 recovery actions scoped & performed · RC.RP-03 backup/restoration-asset integrity verified · RC.RP-04 post-incident operational norms set · RC.RP-05 restored assets verified & normal status confirmed · RC.RP-06 recovery-end declared & documentation completed
**RC.CO Recovery Communication**
- [ ] RC.CO-03 recovery progress communicated to stakeholders · RC.CO-04 approved public updates
- ⟳ **Recovery / DR test** (validates RC.*) — _annual_ — last: `____` · next: **`____`**

> CSF **1.1** was the prior version; the above is the current **2.0** (2024), which added the
> **GOVERN** function and reorganized subcategories.
