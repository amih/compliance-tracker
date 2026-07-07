# Employee offboarding — security runbook

Run this **every time someone leaves or changes role** (event-driven). It satisfies the offboarding
expectations of ISO 27001 (A.6.5), SOC 2 (CC6), NIST 800-53 (PS-4/PS-5, AC-2), GDPR/PPL (access
revocation), and PCI DSS (Req 7/8). In the app, start a **new offboarding run** to track one
departure with dates and sign-off; git records who completed each step and when.

> Target: **critical access revoked within hours** of the effective time; everything else within a
> few business days.

## A. Before / at the effective time (HR + manager)
- [ ] Confirm effective date/time and whether it's amicable or for-cause (adjust urgency)
- [ ] Notify IT/security to begin revocation; agree the cut-over time
- [ ] Identify what the person **owned**: systems, data, repos, vendor accounts, on-call, keys
- [ ] Arrange knowledge transfer / reassign ownership of their responsibilities

## B. Identity & access (do first — highest risk)
- [ ] Disable **SSO / IdP** account (Google Workspace / Entra / Okta) — kills most access at once
- [ ] Terminate active sessions & revoke OAuth tokens / refresh tokens / app passwords
- [ ] Remove from **MFA** (revoke authenticator, security keys, backup codes)
- [ ] Disable **VPN** and any remote-access accounts
- [ ] Remove/disable individual accounts on systems **not** behind SSO (databases, servers, admin panels)
- [ ] Revoke **SSH keys** and **personal access tokens** (GitHub/GitLab, CI, cloud CLIs)
- [ ] Remove from cloud consoles (AWS IAM / GCP / Azure) and delete their access keys
- [ ] Remove from privileged/admin groups and break-glass lists

## C. Secrets rotation (if they had access)
- [ ] Rotate **shared secrets** the person knew: service accounts, API keys, DB passwords, signing keys
- [ ] Rotate secrets in the secrets manager / CI they could read
- [ ] Rotate any shared production credentials or bastion keys

## D. Applications, data & communications
- [ ] Revoke access to source code, artifact registries, and deployment tooling
- [ ] Revoke SaaS/vendor logins (billing, support, analytics, monitoring, LLM provider consoles)
- [ ] Transfer ownership of **files/docs/repos/calendars** to the manager
- [ ] Set an email auto-reply / forward per policy; then disable or convert the mailbox
- [ ] Remove from mailing lists, Slack/Teams, PagerDuty/on-call rotations
- [ ] Reassign customer-facing accounts and support queues

## E. Assets & physical
- [ ] Recover company hardware (laptop, phone, security keys, access cards, tokens)
- [ ] Wipe / re-image returned devices; verify **full-disk encryption** state before disposal/reissue
- [ ] Revoke building/badge access; collect keys

## F. Legal, HR & records
- [ ] Confirm confidentiality / NDA obligations survive termination; remind in writing
- [ ] Final payroll, benefits, equity per HR
- [ ] Update the **authorized-users register** and asset inventory to reflect removal
- [ ] Record completion of each step (evidence for audits)

## G. Verify & close
- [ ] **Verify** the person no longer appears in the IdP, cloud IAM, repos, and critical systems
- [ ] Confirm no scheduled jobs / automations run under their account
- [ ] Manager + security **sign off** that offboarding is complete (commit closes the run)
- [ ] Note lessons learned; if for-cause, review logs for anomalous activity before/after departure
