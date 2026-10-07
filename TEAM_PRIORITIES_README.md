# La Casa De Rozgaar — Team Priority Development Guide
**Project:** La Casa De Rozgaar (LCDR) — Workforce Intelligence Engine  
**Track:** SAS Hackathon / Build For Bharat (Workforce Intelligence Track)  
**Team:** DeezNerdz  
**Last Updated:** 2026-10-07  
**Overall Status:** Priorities 1–5 Completed (100% Verified) | Priority 6 Ready for Execution

---

## Quick Overview for Teammates

This guide outlines the 6 engineering and research priorities designed to win the Hackathon. We have completed the entire data engineering, analytics computation, predictive machine learning, REST API simulation backend, and live frontend integration with data provenance badging (Priorities 1–5). 

All members can reference this document to understand what has been built, how to run and test each component, and what remains for documentation and final pitch artifacts.

```mermaid
flowchart LR
    P1[Priority 1: Data Pipeline] -->|Cleaned DB & CSVs| P2[Priority 2: Market Analytics]
    P2 -->|Intelligence JSONs| P3[Priority 3: Predictive ML Engine]
    P3 -->|Trained Models & Scalers| P4[Priority 4: Simulation REST APIs]
    P4 -->|Live REST Endpoints| P5[Priority 5: Frontend & Badging]
    P5 -->|Interactive Demo| P6[Priority 6: Approach Note & Deck]
    
    style P1 fill:#10b981,stroke:#059669,color:#fff
    style P2 fill:#10b981,stroke:#059669,color:#fff
    style P3 fill:#10b981,stroke:#059669,color:#fff
    style P4 fill:#10b981,stroke:#059669,color:#fff
    style P5 fill:#10b981,stroke:#059669,color:#fff
    style P6 fill:#8b5cf6,stroke:#7c3aed,color:#fff
```

---

## Priority Breakdown & Current Status

### Priority 1: Data Engineering & Cleaning Pipeline
* **Status:** `COMPLETED`
* **Lead:** Member 1 (Data Engineering)
* **Goal:** Clean and normalize the 4 official competition datasets without data loss, standardize 10,000+ raw skills into 214 canonical skills, and build indexed SQLite storage.
* **Key Files Built:**
  * `analytics/pipeline/canonical_skills.py` — Taxonomy mapper mapping 10,000+ raw variations to 214 canonical standards (e.g. `['js', 'javascript']` $\rightarrow$ `JavaScript`).
  * `analytics/pipeline/clean_datascience_jobs.py` — Salary string cleaner ($L$ notation to numerical LPA), experience tier classifier, and bounds validator.
  * `analytics/pipeline/clean_analytics_jobs.py` — Normalizes 15,841 postings, standardizes location tiers, and role taxonomy.
  * `analytics/pipeline/clean_traits.py` — Sanitizes JDS (1.0–5.0) and SDS Big Five (OCEAN 17–68) psychometric scales.
  * `analytics/pipeline/run_pipeline.py` — Master pipeline orchestrator.
* **Outputs Generated:**
  * Cleaned CSVs in `analytics/data/processed/` and `backend/data/`.
  * Indexed SQLite database in `backend/data/module2.db`.
  * Audit Report: `analytics/reports/DATA_QUALITY_AUDIT_REPORT.md`.
* **How to Run:**
  ```bash
  python analytics/pipeline/run_pipeline.py
  ```

---

### Priority 2: Market & Skill Analytics Engine
* **Status:** `COMPLETED`
* **Lead:** Member 2 (Market Intelligence)
* **Goal:** Compute macro market metrics, salary quartiles, role hierarchies, skill penetration rates, and co-occurrence matrices.
* **Key Files Built:**
  * `analytics/engine/market_analytics.py` — Computes macro stats, 10 role family profiles, top 30 canonical skill frequencies, and $20 \times 20$ skill co-occurrence matrix.
* **Outputs Generated:**
  * `backend/data/market_overview.json` — 108,846 openings, 11.9L median salary, Bengaluru 21% epicenter.
  * `backend/data/role_intelligence.json` — 10 standardized role families with 25th, 50th, 75th salary percentiles.
  * `backend/data/skill_intelligence.json` — Top 30 canonical skills (SQL: 1,553 postings, Python: 962 postings, SAS: 837 postings).
  * `backend/data/skill_cooccurrence_matrix.json` — $20 \times 20$ skill synergy matrix for network graphs.
  * `backend/data/compensation_benchmarks.json` — Salary quartiles by experience tier ($0-2\text{y}$, $3-5\text{y}$, $6-8\text{y}$, $9+\text{y}$).
  * Report: `analytics/reports/MARKET_SKILL_INTELLIGENCE_REPORT.md`.
* **How to Run:**
  ```bash
  python analytics/engine/market_analytics.py
  ```

---

### Priority 3: Predictive ML Engine (JDS & SDS Models)
* **Status:** `COMPLETED`
* **Lead:** Member 3 (Machine Learning & Modeling)
* **Goal:** Train, validate (5-Fold Stratified CV), and export explainable machine learning models for salary hike prediction (JDS) and leadership success profiling (SDS).
* **Key Files Built:**
  * `analytics/models/train_models.py` — Model training, cross-validation, feature importances, and serialization.
* **Model Benchmark Results:**
  * **JDS Skill-Outcome Model ($N=139$ Junior Data Scientists):**
    * **5-Fold CV Accuracy:** $\mathbf{81.93\% \pm 7.47\%}$ | **ROC-AUC:** $\mathbf{0.9043}$ | **Holdout Test Accuracy:** $\mathbf{89.29\%}$
    * **Key Drivers:** Storytelling & Dashboards ($\text{Odds Ratio} = \mathbf{4.43\text{x}}$), Maths & Statistics ($\text{Odds Ratio} = \mathbf{3.23\text{x}}$).
  * **SDS Big Five Personality Profiler ($N=161$ Senior Data Scientists):**
    * **5-Fold CV Accuracy:** $\mathbf{90.70\% \pm 4.31\%}$ | **ROC-AUC:** $\mathbf{0.9493}$ | **Holdout Test Accuracy:** $\mathbf{93.94\%}$
    * **Key Drivers:** Conscientiousness ($\text{Odds Ratio} = \mathbf{7.80\text{x}}$), Openness ($\text{Odds Ratio} = \mathbf{5.17\text{x}}$).
* **Outputs Generated:**
  * Scikit-learn `.joblib` binaries in `analytics/models/`.
  * Lightweight inference JSON artifacts in `backend/data/jds_model_artifact.json` and `backend/data/sds_model_artifact.json`.
  * Report: `analytics/reports/PREDICTIVE_MODELING_VALIDATION_REPORT.md`.
* **How to Run:**
  ```bash
  python analytics/models/train_models.py
  ```

---

### Priority 4: Simulation Engine & REST API Endpoints
* **Status:** `COMPLETED`
* **Lead:** Member 2 & 3 (Backend & Simulation)
* **Goal:** Implement high-speed Express REST endpoints providing real analytics and live What-If simulation with sub-5ms response latency.
* **Key Files Built:**
  * `backend/src/routes/analytics.ts` — 8 production endpoints for market overview, roles, skills, network, and JDS/SDS simulators.
  * `backend/src/server.ts` — Mounted `/api/v1/analytics/*` and `/api/analytics/*`.
  * `backend/src/__tests__/analytics.test.ts` — Comprehensive Vitest integration test suite (**7 / 7 PASSED, 100%**).
* **Key Available Endpoints:**
  * `GET /api/v1/analytics/overview` — Macro market statistics ($108,846$ openings).
  * `GET /api/v1/analytics/roles` — 10 role families with salary quartiles ($P_{25}, P_{50}, P_{75}$).
  * `GET /api/v1/analytics/skills` — Top 30 canonical skill demand rates.
  * `GET /api/v1/analytics/network` — $20 \times 20$ skill co-occurrence matrix.
  * `POST /api/v1/analytics/simulate/jds` — Instant skill-to-salary simulation with prescriptive ROI upskilling guidance.
  * `POST /api/v1/analytics/simulate/sds` — Big Five leadership alignment simulation with Responsible AI safeguards.
  * `GET /api/v1/analytics/models/metadata` — Model validation metrics & cross-validation scores.
* **Specification Document:**
  * `analytics/reports/SIMULATION_ENGINE_API_SPECIFICATION.md`.
* **How to Test:**
  ```bash
  npm --prefix backend test src/__tests__/analytics.test.ts
  ```

---

### Priority 5: Frontend Integration & Provenance Badging
* **Status:** `COMPLETED`
* **Lead:** Frontend Engineers / Full Stack
* **Goal:** Connect existing React + TypeScript pages to the live analytics REST endpoints while adhering to the **Zero-Redesign Principle** (preserving the existing high-end UI design and theme toggle) and attaching clear Data Provenance Badges.
* **Key Files Integrated & Enhanced:**
  1. `src/services/api.ts` — Fully wired `api.analytics` methods (`getOverview`, `getRoles`, `getSkills`, `getNetwork`, `simulateJds`, `simulateSds`, `getModelsMetadata`).
  2. `src/pages/MarketIntelligence.tsx` — Macro metric cards bound to empirical data ($108,846$ openings, $₹11.9\text{L}$ median salary, Bengaluru $21.4\%$) with `REAL DATA (N=17,443)` badge.
  3. `src/pages/SkillIntelligence.tsx` — 214+ canonical skills ranked by empirical frequency ($1,553$ SQL postings, $962$ Python postings) with real synergy pairings and `REAL DATA (214+ CANONICAL SKILLS, N=17,443)` badge.
  4. `src/pages/SimulationVault.tsx` — Interactive tabs for JDS Salary Hike ($81.9\%$ CV) and SDS Leadership Big Five ($90.7\%$ CV) ML models with live sliders, odds ratios, and prescriptive coaching.
  5. `src/pages/RoleIntelligence.tsx`, `CompensationIntelligence.tsx`, `WorkforceSimulator.tsx` — Attached provenance badges across both Professional and Heist themes.
* **Data Provenance Badges Active:**
  * `REAL DATA (N=17,443)`
  * `MODEL OUTPUT (5-Fold CV 81.9%, ROC-AUC 0.904, N=139)`
  * `MODEL OUTPUT (5-Fold CV 90.7%, ROC-AUC 0.949, N=161)`
  * `SIMULATION (Scenario-based ROI)`

---

### Priority 6: Round 2 Approach Note (20–25 Pages) & R3 Pitch Deck
* **Status:** `UPCOMING`
* **Lead:** All Team Members (Research & Documentation)
* **Goal:** Compile the comprehensive 20–25 page Approach Note PDF covering all 25 required sections and create the Round 3 video demo / pitch deck.
* **Core Sections to Assemble (Refer to `HACKATHON_ANALYTICS_WORKFLOW_MASTER_PLAN.md`):**
  * Sections 1–5: Executive Summary, Track Problem, Innovation & Architecture.
  * Sections 6–9: Data Pipeline, Canonical Skill Mapping, Data Quality Audit.
  * Sections 10–11: Market & Skill Intelligence, Salary Quartiles, $20 \times 20$ Co-occurrence Network.
  * Sections 12–15: Predictive ML Modeling (JDS & SDS Formulations, 5-Fold Stratified CV, Odds Ratios).
  * Sections 16–18: What-If Simulation Engine, Prescriptive ROI Upskilling, Rest API Contracts.
  * Sections 19–21: Responsible AI & Ethical Governance, Candidate Data Privacy, Non-rejection Guarantee.
  * Sections 22–25: Dual-theme UI System, Business Scalability, Conclusion.

---

## Developer Cheatsheet & Directory Structure

```text
La-Casa-De-Rozgaar-SAS/
├── analytics/                      # Python Analytics & Machine Learning Pipeline
│   ├── data/processed/             # Cleaned CSV and JSON data exports
│   ├── engine/                     # Market analytics calculation scripts
│   ├── models/                     # Trained .joblib models & training scripts
│   ├── pipeline/                   # Cleaning scripts for 4 raw competition datasets
│   └── reports/                    # Generated Technical Reports (R2 Submission Materials)
│       ├── DATA_QUALITY_AUDIT_REPORT.md              # Priority 1 Report
│       ├── MARKET_SKILL_INTELLIGENCE_REPORT.md       # Priority 2 Report
│       ├── PREDICTIVE_MODELING_VALIDATION_REPORT.md  # Priority 3 Report
│       └── SIMULATION_ENGINE_API_SPECIFICATION.md    # Priority 4 Report
├── backend/                        # Express 4.21 TypeScript Backend
│   ├── data/                       # Deployed JSON artifacts and SQLite DB
│   └── src/
│       ├── routes/analytics.ts     # Real workforce analytics & simulation endpoints
│       └── __tests__/analytics.test.ts # Automated test suite (100% passing)
├── src/                            # React 18 + TypeScript + Vite Frontend
│   ├── pages/                      # Intelligence, Dossier, Simulation & Feed Pages
│   └── services/api.ts             # Frontend API client service
├── HACKATHON_ANALYTICS_WORKFLOW_MASTER_PLAN.md # Master Hackathon Reference Manual
└── TEAM_PRIORITIES_README.md       # This file (Team Reference Guide)
```

---

## Team Work Allocation

| Team Member | Primary Responsibility | Associated Priorities | Current Status |
| :--- | :--- | :--- | :--- |
| **Member 1** | Data Engineering & Cleaning Pipeline | **Priority 1** | **Done** |
| **Member 2** | Market Intelligence & API Gateway | **Priority 2 & 4** | **Done** |
| **Member 3** | Predictive Machine Learning & Cross-Validation | **Priority 3 & 4** | **Done** |
| **Member 4 / All** | Frontend Integration & Provenance Badges | **Priority 5** | **Next Up** |
| **All Members** | 20–25 Page Approach Note & Pitch Deck | **Priority 6** | **Final Step** |

---

*For full statistical tables, regression formulas, and competition evaluation criteria, please review `HACKATHON_ANALYTICS_WORKFLOW_MASTER_PLAN.md`.*
