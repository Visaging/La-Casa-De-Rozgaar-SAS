# Data Quality Audit & Preparation Report
**Project:** La Casa De Rozgaar — Workforce Intelligence Engine  
**Track:** SAS Hackathon & Build For Bharat (Workforce Intelligence)  
**Author:** Data Engineering Team (Member 1)  
**Generated Date:** 2026-10-07 17:16:01  
**Status:** Validated & Reproducible

---

## 1. Executive Data Quality Summary

This report documents the rigorous data auditing, cleaning decisions, anomaly resolution, and feature engineering applied to the four official competition datasets. Total observations processed: **17,743 records**.

| Dataset Name | Raw Rows | Raw Cols | Processed Rows | Clean Cols | Missing Data Resolution | Primary Analytical Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Data Science Jobs** | 1,602 | 8 | 1,602 | 12 | 0.0% missing; parsed string salaries into numeric Lakhs | Role Demand & Salary Percentiles |
| **Analytics Jobs** | 15,841 | 8 | 15,841 | 16 | Extracted 79k skills into canonical taxonomy; imputed job_type | Macro Market Trends & Skill Graphs |
| **JDS Skill Traits** | 139 | 7 | 139 | 11 | Verified 1.0-5.0 bounds; 0.0% missing | Junior Data Scientist Salary Hike ML |
| **SDS Personality Traits** | 161 | 7 | 161 | 11 | Cleaned column whitespace; verified Big 5 OCEAN bounds | Senior Data Scientist Success Analysis |

---

## 2. Dataset 1: Data Science Jobs Audit (`DataScience Jobs.csv`)

### 2.1 Dataset Profile
- **Total Records:** 1,602
- **Unique Companies Represented:** 642
- **Unique Standardized Roles:** 10
- **Total Cumulative Job Openings:** 93,005

### 2.2 Salary & Experience Distributions
- **Average Salary (Lakhs INR):** Mean = 13.23L, Median = 11.90L, Min = 1.40L, Max = 82.00L
- **Minimum Experience Requirement:** Mean = 2.80 years

### 2.3 Role Breakdown in Data Science Jobs
| Role Title | Count | Percentage | Median Avg Salary | Mean Min Exp |
| :--- | :--- | :--- | :--- | :--- |
| **Business Analyst** | 188 | 11.7% | 8.3 Lakhs | 1.7 yrs |
| **Data Engineer** | 188 | 11.7% | 10.9 Lakhs | 1.5 yrs |
| **Data Scientist** | 188 | 11.7% | 12.8 Lakhs | 1.5 yrs |
| **Data Analyst** | 187 | 11.7% | 5.0 Lakhs | 0.8 yrs |
| **Senior Data Analyst** | 187 | 11.7% | 8.6 Lakhs | 2.9 yrs |
| **Senior Business Analyst** | 187 | 11.7% | 13.0 Lakhs | 4.0 yrs |
| **Senior Data Scientist** | 185 | 11.5% | 21.2 Lakhs | 4.0 yrs |
| **Senior Data Engineer** | 183 | 11.4% | 17.6 Lakhs | 4.6 yrs |
| **Machine Learning Engineer** | 59 | 3.7% | 9.1 Lakhs | 1.4 yrs |
| **Data Architect** | 50 | 3.1% | 24.2 Lakhs | 10.0 yrs |

### 2.4 Cleaning Decisions & Justifications
1. **Salary String to Float:** Stripped 'L', 'Lakhs', and whitespace to generate continuous numeric targets (`avg_salary_lakhs`, `min_salary_lakhs`, `max_salary_lakhs`).
2. **Boundary Validation:** Verified and ensured min_salary <= avg_salary <= max_salary.
3. **Experience Categorization:** Engineered `experience_tier` into Entry (0-2 yrs), Mid (3-5 yrs), Senior (6-9 yrs), and Lead (10+ yrs).

---

## 3. Dataset 2: Analytics Jobs Audit (`Analytics Jobs.csv`)

### 3.1 Dataset Profile
- **Total Records:** 15,841
- **Total Canonical Skills Extracted:** 77,079
- **Unique Canonical Skill Entities:** 8208

### 3.2 Top 15 In-Demand Skills in Analytics Ecosystem
| Rank | Canonical Skill Name | Frequency Count | Share of Postings (%) |
| :--- | :--- | :--- | :--- |
| 1 | **SQL** | 1,553 | 9.80% |
| 2 | **Analytics** | 1,048 | 6.62% |
| 3 | **Python** | 962 | 6.07% |
| 4 | **Java** | 917 | 5.79% |
| 5 | **SAS** | 837 | 5.28% |
| 6 | **Financial Analytics & Modeling** | 824 | 5.20% |
| 7 | **Machine Learning** | 751 | 4.74% |
| 8 | **Business Analysis** | 730 | 4.61% |
| 9 | **Data Analysis** | 721 | 4.55% |
| 10 | **Advanced Excel & VBA** | 715 | 4.51% |
| 11 | **Digital Marketing & Growth** | 612 | 3.86% |
| 12 | **Project Management** | 588 | 3.71% |
| 13 | **JavaScript** | 564 | 3.56% |
| 14 | **Data Analytics** | 526 | 3.32% |
| 15 | **SEO & Web Analytics** | 518 | 3.27% |

### 3.3 Geographic Distribution of Analytics Demand
| Geographic Location | Job Postings Count | Percentage of Market |
| :--- | :--- | :--- |
| **Bengaluru** | 3,760 | 23.74% |
| **Mumbai** | 2,394 | 15.11% |
| **Gurgaon** | 1,582 | 9.99% |
| **Delhi NCR** | 1,543 | 9.74% |
| **Pune** | 998 | 6.30% |
| **Hyderabad** | 931 | 5.88% |
| **Chennai** | 891 | 5.62% |
| **Noida** | 423 | 2.67% |

### 3.4 Compensation Brackets Distribution
| Salary Bracket | Number of Postings | Percentage Share |
| :--- | :--- | :--- |
| **10 - 15 Lakhs** | 3,608 | 22.78% |
| **15 - 25 Lakhs** | 3,281 | 20.71% |
| **6 - 10 Lakhs** | 2,876 | 18.16% |
| **0 - 3 Lakhs** | 2,592 | 16.36% |
| **3 - 6 Lakhs** | 2,239 | 14.13% |
| **25 - 50 Lakhs** | 1,245 | 7.86% |

---

## 4. Dataset 3: JDS Skill Traits Audit (`JDS Skill Traits.xlsx`)

### 4.1 Sample Demographics & Target Balance
- **Sample Size ($N$):** 139 Junior Data Scientists
- **Target Feature:** `salary_hike_target` (1 = High, 0 = Low)
- **Target Distribution:** High = 73 (52.5%), Low = 66 (47.5%) — *Perfect class balance.*

### 4.2 Empirical Skill Correlations with Salary Hike
| Skill Dimension | Mean Score (1-5) | Pearson Correlation ($r$) with Salary Hike | Strategic Significance |
| :--- | :--- | :--- | :--- |
| **Storytelling & Dashboards** | 4.36 | **+0.5541** | **Primary Differentiator** |
| **Maths & Statistics** | 4.29 | **+0.5238** | **High Impact Rigor** |
| **Coding Skills (SAS/Python/SQL)** | 4.27 | **+0.4438** | Core Prerequisite |
| **AI & ML Skills** | 4.57 | **+0.4046** | Core Prerequisite |
| **Big Data Skills** | 3.85 | **+0.1123** | Moderate Impact in Junior Scope |

---

## 5. Dataset 4: SDS Personality Traits Audit (`SDS Personality Traits.xlsx`)

### 5.1 Sample Demographics & Target Balance
- **Sample Size ($N$):** 161 Senior Data Scientists
- **Target Feature:** `success_target` (1 = High Success, 0 = Low Success)
- **Target Distribution:** High = 85 (52.8%), Low = 76 (47.2%)

### 5.2 Big Five (OCEAN) Correlation with Senior Leadership Success
| Big Five Personality Trait | Normalized Mean (~17-68) | Correlation ($r$) with Success | Behavioral Insight |
| :--- | :--- | :--- | :--- |
| **Conscientiousness** | 45.21 | **+0.6802** | Goal direction, reliability, methodical delivery |
| **Openness to Experience** | 41.33 | **+0.6713** | Creative problem framing, adaptability |
| **Extraversion** | 43.20 | **+0.4943** | Client engagement, team energy |
| **Agreeableness** | 44.60 | **+0.2926** | Empathy, stakeholder cooperation |
| **Neuroticism** | 36.19 | **-0.0059** | Negligible linear impact on high-level success |

---

## 6. Data Integrity & Reproducibility Certification
- **No Data Fabrication:** 100% of figures are reproducible by running `python analytics/pipeline/run_pipeline.py`.
- **Database Synchronization:** All clean tables are populated with matching primary keys and indexes inside `backend/data/module2.db`.
- **Ready for Approach Note:** All tables and summary metrics in this document can be copied directly into Section 5 (Data Quality) and Section 6 (Data Preparation) of the Round 2 Approach Note.
