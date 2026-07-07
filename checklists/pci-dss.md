# PCI DSS v4.0.1 — full version (service-provider scope)

**Full version** — all **12 requirements** with their sub-requirements, aligned to the **SAQ-D for
Service Providers (v4.0)**. A SaaS that
stores/processes/transmits cardholder data (or can affect its security) is a **service provider**.
Several v4.0 requirements became **mandatory 31 March 2025**. **Scope check first** — if card data
never touches your systems (fully outsourced to Stripe/PayPal), you're likely **SAQ A**; do §Scope
and skip the rest.

Each requirement's **`x.1`** sub-requirement ("processes and mechanisms… are defined and
understood") means: document it, assign roles, and **review it at least once every 12 months**.

## Scope & program
- [ ] Confirm whether card data is stored/processed/transmitted by you → pick SAQ type — _one-time; re-confirm annually_
- ⟳ **Document & validate PCI DSS scope** (12.5.1) incl. all CDE system components & data flows — _annual (service providers: every 6 months, 12.5.2.1)_ — last: `____` · next: **`____`**
- ⟳ **Manage PCI DSS compliance** & assign a responsible executive (12.4) — _continuous_ — last: `____` · next: **`____`**
- ⟳ **Complete the SAQ-D / RoC + AOC** and submit to acquirer/brands — _annual_ — last: `____` · next: **`____`**

## Req 1 — Install and maintain network security controls
- [ ] 1.1 Processes & mechanisms defined & understood — 1.2 NSCs configured & maintained — 1.3 restrict network access to/from the CDE — 1.4 control connections between trusted & untrusted networks — 1.5 mitigate CDE risk from dual-connected computing devices

## Req 2 — Apply secure configurations to all system components
- [ ] 2.1 Processes & mechanisms — 2.2 components configured & managed securely (no vendor defaults, hardening) — 2.3 wireless environments configured & managed securely

## Req 3 — Protect stored account data
- [ ] 3.1 Processes & mechanisms — 3.2 minimize storage of account data — 3.3 do **not** store SAD after authorization — 3.4 restrict display of full PAN & copy — 3.5 secure PAN wherever stored (encryption/tokenization/hashing) — 3.6 secure cryptographic keys
- ⟳ 3.7 **Key-management** procedures incl. rotation at defined cryptoperiod — _per cryptoperiod_ — last: `____` · next: **`____`**

## Req 4 — Protect cardholder data with strong cryptography in transit
- [ ] 4.1 Processes & mechanisms — 4.2 PAN protected with strong cryptography during transmission over open/public networks (+ inventory of trusted keys/certs)

## Req 5 — Protect systems/networks from malicious software
- [ ] 5.1 Processes & mechanisms — 5.2 malware prevented/detected/addressed — 5.4 anti-phishing mechanisms
- ⟳ 5.3 **Anti-malware active, maintained, monitored**; periodic scans/evaluations — _continuous; evaluate periodically_ — last: `____` · next: **`____`**

## Req 6 — Develop and maintain secure systems and software
- [ ] 6.1 Processes & mechanisms — 6.2 bespoke/custom software developed securely (secure SDLC, training, review — cross-ref `owasp-appsec.md`) — 6.5 changes managed securely
- ⟳ 6.3 **Identify & address security vulnerabilities**; apply critical/high patches within **1 month** — _continuous; monthly_ — last: `____` · next: **`____`**
- ⟳ 6.4 **Public-facing web apps** protected (WAF or reviews); 6.4.3 manage payment-page scripts — _reviews per policy; scripts continuous_ — last: `____` · next: **`____`**

## Req 7 — Restrict access by business need-to-know
- [ ] 7.1 Processes & mechanisms — 7.2 access appropriately defined & assigned (least privilege) — 7.3 access managed via an access-control system
- ⟳ 7.2.4 **Review user accounts & access** — _service providers: every 6 months_ — last: `____` · next: **`____`**

## Req 8 — Identify users and authenticate access
- [ ] 8.1 Processes & mechanisms — 8.2 unique IDs & account lifecycle — 8.3 strong authentication — 8.4 **MFA** for access into the CDE (and all remote/admin) — 8.5 MFA configured against misuse — 8.6 manage application/system account credentials

## Req 9 — Restrict physical access to cardholder data *(mostly cloud-inherited)*
- [ ] 9.1 Processes & mechanisms — 9.2 physical access controls to facilities/systems — 9.3 authorize & manage personnel/visitor access — 9.4 securely store/distribute/destroy media
- ⟳ 9.5 **POI device inspections** for tampering — _periodic per targeted risk analysis_ — last: `____` · next: **`____`**

## Req 10 — Log and monitor all access
- [ ] 10.1 Processes & mechanisms — 10.2 audit logs capture required events — 10.3 protect logs from tampering — 10.5 retain ≥12 months (≥3 months immediately available) — 10.6 time synchronization
- ⟳ 10.4 **Review audit logs** (daily for critical; automated mechanisms) — _daily (critical) / periodic (others)_ — last: `____` · next: **`____`**
- ⟳ 10.7 **Detect/report/respond to failures of critical security controls** — _service providers: promptly; review continuous_ — last: `____` · next: **`____`**

## Req 11 — Test security of systems and networks regularly
- ⟳ 11.1 Processes & mechanisms reviewed — _annual_ — last: `____` · next: **`____`**
- ⟳ 11.2 **Wireless access-point scan** — _quarterly_ — last: `____` · next: **`____`**
- ⟳ 11.3.1 **Internal vulnerability scans** (authenticated) — _quarterly + after significant change_ — last: `____` · next: **`____`**
- ⟳ 11.3.2 **External ASV scans** (approved scanning vendor) — _quarterly + after significant change_ — last: `____` · next: **`____`**
- ⟳ 11.4 **Penetration testing** (external + internal), exploitable findings fixed — _annual + after significant change_ — last: `____` · next: **`____`**
- ⟳ 11.4.6 **Segmentation penetration test** — _service providers: every 6 months_ — last: `____` · next: **`____`**
- [ ] 11.5 Detect network intrusions & unexpected file changes (IDS/IPS, FIM)
- ⟳ 11.6.1 **Payment-page change/tamper detection** — _every 7 days (or per targeted risk analysis)_ — last: `____` · next: **`____`**

## Req 12 — Support information security with policies and programs
- ⟳ 12.1 **Information security policy** established, published, reviewed & updated — _annual_ — last: `____` · next: **`____`**
- [ ] 12.2 Acceptable-use policies for end-user technologies
- ⟳ 12.3 **Targeted risk analyses** (for flexible requirements) + 12.3.3 crypto/cipher review + 12.3.4 hardware/software EOL review — _annual_ — last: `____` · next: **`____`**
- ⟳ 12.4 **PCI DSS compliance managed**; 12.4.2 service-provider reviews that personnel follow security policies — _service providers: every 3 months_ — last: `____` · next: **`____`**
- ⟳ 12.5 **Scope documented & validated** (see §Scope) — _annual / 6-monthly (SP)_ — last: `____` · next: **`____`**
- ⟳ 12.6 **Security awareness program** — _annual + on change_ — last: `____` · next: **`____`**
- [ ] 12.7 Personnel screening to reduce insider risk — _event-driven (per hire)_
- ⟳ 12.8 **Third-party service-provider (TPSP) risk management**: list, due diligence, written agreements, monitor compliance status — _annual_ — last: `____` · next: **`____`**
- [ ] 12.9 (If you are a TPSP) support customers' PCI compliance & provide AOC/responsibility matrix
- [ ] 12.10 Incident-response plan for CDE incidents
- ⟳ 12.10.2 **Review & test the incident-response plan** — _annual_ — last: `____` · next: **`____`**

## Appendix A1 — Multi-tenant service providers
- [ ] A1 Isolate each customer's environment/data; provide per-customer evidence & audit-log access; scope for shared infrastructure — _one-time; continuous_
