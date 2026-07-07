# OWASP — secure software development (always applies)

You write software, so this one is non-negotiable. It combines **ASVS 5.0** (verification target),
the **Top 10** families (awareness/testing), **SAMM v2** (program maturity), and — because you
build AI features — the **OWASP Top 10 for LLM Applications (2025)**.

## A. Program & standard (one-time / annual)
- [ ] Adopt **OWASP ASVS 5.0** and pick a target **Level** (L1 baseline · L2 for apps handling sensitive data — pick **L2** for SaaS holding client data · L3 for high-assurance) — _one-time_
- [ ] Adopt a Secure SDLC policy (design → code → test → deploy → operate) — _one-time_
- ⟳ **SAMM v2 maturity self-assessment** (Governance, Design, Implementation, Verification, Operations) and set next targets — _annual_ — last: `____` · next: **`____`**
- ⟳ **Developer secure-coding / OWASP Top 10 training** — _annual + onboarding_ — last: `____` · next: **`____`**

## B. Design (per feature / event-driven)
- [ ] **Threat model** new features & significant architecture changes — _event-driven (per design)_
- [ ] Security requirements from ASVS baked into stories/acceptance criteria — _continuous_
- [ ] Secure defaults: deny-by-default, least privilege, fail closed — _continuous_

## C. Build — automated in CI (continuous)
- [ ] **SAST** (static analysis) gate on pull requests — _continuous_
- [ ] **SCA / dependency scanning** for known-vuln libraries (e.g. Dependabot) — _continuous_
- [ ] **Secret scanning** (block committed keys/tokens) — _continuous_
- [ ] **DAST** against a running build/staging — _continuous or nightly_
- [ ] Generate an **SBOM** per release — _continuous (per release)_
- [ ] **IaC / container image scanning** (misconfig + CVEs) — _continuous_
- [ ] Mandatory **peer code review** before merge — _continuous (per PR)_

## D. Verify / test (recurring)
- ⟳ **ASVS verification review** of the app against the chosen level — _annual (and per major release)_ — last: `____` · next: **`____`**
- ⟳ **Third-party penetration test** — _annual + after significant change_ — last: `____` · next: **`____`**
- ⟳ Triage & remediate findings by severity SLA (e.g. critical 7d / high 30d) — _continuous; report monthly_ — last: `____` · next: **`____`**
- [ ] Run a **bug-bounty / vuln-disclosure (security.txt)** channel — _one-time; ongoing triage_

## E. Operate
- [ ] WAF / rate limiting / input validation on all external endpoints — _continuous_
- [ ] Centralized logging of security events (authn, authz failures, admin actions) — _continuous_
- ⟳ **Patch runtime & dependencies** to SLA — _continuous; review monthly_ — last: `____` · next: **`____`**

## F. API security (if you expose APIs) — OWASP API Security Top 10 (2023)
- [ ] Object-/function-level authorization (BOLA/BFLA) tested per endpoint — _continuous_
- [ ] AuthN on every endpoint; no unauthenticated data; rate limits / quotas — _continuous_
- [ ] Inventory of API endpoints & versions; retire shadow/zombie APIs — _quarterly review_

## G. AI / LLM features — OWASP Top 10 for LLM Apps 2025 (if you ship AI)
> Directly relevant to your AI-cost / gateway work — this is the security half of it.
- [ ] **Prompt-injection** defenses: separate instructions from untrusted input; constrain tool use — _continuous_
- [ ] **Output handling**: treat LLM output as untrusted (encode, sandbox, no blind exec) — _continuous_
- [ ] **Sensitive-info disclosure** & **system-prompt leakage** controls (don't put secrets in prompts) — _continuous_
- [ ] **Excessive agency**: least-privilege tools, human-in-the-loop for high-impact actions — _continuous_
- [ ] **Unbounded consumption / DoW**: per-key & per-run spend/token caps, rate limits — _continuous_
- [ ] Supply-chain & **vector/embedding** integrity (models, plugins, RAG stores) — _continuous_
- ⟳ **Red-team the AI features** (injection, jailbreak, data-exfil) — _annual + on model/prompt change_ — last: `____` · next: **`____`**
