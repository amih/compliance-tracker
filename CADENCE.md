# Consolidated cadence — what's due, and when

Recurring obligations merged across frameworks. **The point: most items overlap** — do the work
**once** and it satisfies ISO 27001 *and* SOC 2 *and* NIST CSF at the same time. Frameworks that
each item helps satisfy are in brackets. Run `python3 scripts/due.py` to see live due dates from
your checklists.

## Continuous / always-on (build once, operate forever)
- Access control, least privilege, **MFA** [ISO, SOC2, CSF, GDPR, PPL, PCI]
- Encryption in transit & at rest + key management [all]
- Centralized logging, monitoring & alerting [all]
- Vulnerability management & patching to SLA [all]
- CI security gates: SAST, SCA/dependency, secret-scanning, DAST, code review [OWASP, ISO, SOC2]
- Backups running [ISO, SOC2, CSF]
- Evidence collection for SOC 2 Type II window [SOC2]

## Event-driven (on trigger — some with hard legal clocks)
- Joiner/mover/leaver access changes; per-hire screening + NDA [ISO, SOC2]
- New vendor → **DPA/BAA** + security review before onboarding [ISO, SOC2, GDPR, PPL, HIPAA]
- New feature/architecture change → **threat model**; high-risk processing → **DPIA** [OWASP, GDPR]
- Change management approval per production change [ISO, SOC2, PCI, FedRAMP]
- ⏱ **Breach:** GDPR authority **≤72h** + individuals if high risk; Israel PPA for serious events; HIPAA individuals/HHS **≤60d** [GDPR, PPL, HIPAA]
- ⏱ **Data-subject request** response **≤1 month** [GDPR, PPL]

## Monthly
- Vulnerability-scan review + patch status report [ISO, SOC2, OWASP]
- (FedRAMP only) ConMon scans + **POA&M** update [800-53]
- (Israel, high-level DB) access-log review [PPL]

## Quarterly
- **User & privileged access review** [ISO, SOC2, CSF, PPL]
- Control-effectiveness / KPI review; management self-review [ISO, SOC2]
- **Backup restore test** [ISO, SOC2, CSF]
- Detection/alert tuning review [CSF]
- API endpoint inventory review [OWASP]

## Semi-annual
- (PCI service providers) segmentation test [PCI]
- (PCI SAQ A) payment-page script inventory/integrity check [PCI]

## Annual
- **Internal ISMS audit** [ISO] · **Management review** [ISO, SOC2]
- **Risk assessment** refresh + SoA/treatment-plan update [ISO, SOC2, CSF, GDPR, PPL]
- **SOC 2 Type II audit** [SOC2] · **ISO surveillance audit** (yrs 1–2) [ISO]
- **Penetration test** [ISO, SOC2, OWASP, PCI, 800-53]
- **Security awareness training** (all staff) [all]
- **BC/DR test** + **IR tabletop** [ISO, SOC2, CSF]
- **Vendor/sub-processor security & privacy reviews** [ISO, SOC2, GDPR, PPL]
- Policy / RoPA / privacy-notice / retention review [ISO, GDPR, PPL]
- **SAMM** maturity assessment + **ASVS** verification review [OWASP]
- **CSF Current-vs-Target profile** self-assessment [CSF]
- **SAQ / RoC** [PCI] · **HIPAA Security Risk Analysis** [HIPAA]

## Every 18 months
- (Israel, **high-level** DBs) **penetration test + risk assessment** [PPL]
- (Israel, medium/high) internal audit of the security procedure [PPL]

## Triennial (every 3 years)
- **ISO 27001 recertification** audit [ISO]
