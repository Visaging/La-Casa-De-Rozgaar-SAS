# Predictive ML Modeling & Validation Report
**Project:** La Casa De Rozgaar — Workforce Intelligence Engine  
**Track:** SAS Hackathon & Build For Bharat (Workforce Intelligence)  
**Author:** ML & Analytics Team (Member 3)  
**Generated Date:** 2026-10-07 17:16:14  
**Status:** Validated with 5-Fold Stratified Cross-Validation

---

## 1. Executive Modeling Summary

This report documents the machine learning algorithms, cross-validation metrics, feature importances, and ethical safeguards for:
1. **JDS Skill-Outcome Classifier (Junior Data Scientists, N = 139):** Predicts salary hike / promotion probability based on 5 core skill traits.
2. **SDS Personality Success Profiler (Senior Data Scientists, N = 161):** Models psychometric associations with leadership and customer-facing delivery.

---

## 2. JDS Skill-Outcome Predictive Modeling (Junior Data Scientists)

### 2.1 Problem Formulation & Mathematical Model
We model the probability of a junior data scientist achieving a high salary hike / promotion ($Y \in \{0, 1\}$) as a function of their measured skills vector $X = [x_1, x_2, x_3, x_4, x_5]^T$:

$$\text{logit}(P) = b + \sum_{i=1}^5 w_i \tilde{x}_i$$
$$P(Y = 1 \mid X) = \frac{1}{1 + e^{-(b + \sum w_i \tilde{x}_i)}}$$

where standard scaling is applied to all input dimensions.

### 2.2 5-Fold Stratified Cross-Validation Benchmark
| Model Architecture | 5-Fold Mean Accuracy | Std Dev | Mean Precision | Mean Recall | Mean F1-Score | Mean ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression (Interpretable)** | **81.93%** | ±7.47% | **0.8170** | **0.8476** | **0.8276** | **0.9043** |
| **Decision Tree (Max Depth 3)** | 79.84% | — | — | — | 0.8135 | 0.8186 |
| **Random Forest (100 Trees)** | 82.67% | — | — | — | 0.8328 | 0.8722 |

### 2.3 Feature Importance & Odds Ratios ($OR_i = e^{w_i}$)
| Skill Feature | Coefficient ($w_i$) | Odds Ratio ($OR$) | RF Feature Importance | Analytical Role |
| :--- | :--- | :--- | :--- | :--- |
| **big_data_skills** | 0.6282 | **1.8743x** | 0.1056 | Each +1 SD increase in big_data_skills multiplies the odds of a high salary hike by 1.87x |
| **maths_stats_skills** | 1.2282 | **3.4151x** | 0.3014 | Each +1 SD increase in maths_stats_skills multiplies the odds of a high salary hike by 3.42x |
| **coding_skills** | 0.4780 | **1.6128x** | 0.1441 | Each +1 SD increase in coding_skills multiplies the odds of a high salary hike by 1.61x |
| **ai_ml_skills** | 0.7844 | **2.1911x** | 0.1627 | Each +1 SD increase in ai_ml_skills multiplies the odds of a high salary hike by 2.19x |
| **storytelling_skills** | 0.8558 | **2.3531x** | 0.2861 | Each +1 SD increase in storytelling_skills multiplies the odds of a high salary hike by 2.35x |

### 2.4 Confusion Matrix on Test Set (Holdout 20%)
- **True Positives (High Predicted as High):** 14
- **True Negatives (Low Predicted as Low):** 11
- **False Positives:** 2
- **False Negatives:** 1
- **Test Set F1-Score:** 0.9032 | **Test ROC-AUC:** 0.9667

---

## 3. SDS Personality-Success Pattern Analysis (Senior Data Scientists)

### 3.1 Big Five (OCEAN) Success Modeling Formulation
For senior, customer-facing roles, we model the association between psychometric dimensions and high success levels:

| Big Five Dimension | Coefficient ($w_i$) | Odds Ratio ($OR$) | RF Importance | Psychological & Workplace Significance |
| :--- | :--- | :--- | :--- | :--- |
| **neuroticism** | 0.7123 | **2.0388x** | 0.0268 | Dominant trait for project completion and delivery |
| **extraversion** | 1.3515 | **3.8633x** | 0.1595 | Dominant trait for project completion and delivery |
| **openness** | 1.8830 | **6.5731x** | 0.3284 | Dominant trait for project completion and delivery |
| **agreeableness** | 0.5353 | **1.7079x** | 0.1093 | Dominant trait for project completion and delivery |
| **conscientiousness** | 2.2124 | **9.1376x** | 0.3760 | Dominant trait for project completion and delivery |

### 3.2 5-Fold Stratified Cross-Validation Benchmark
| Model Architecture | 5-Fold Mean Accuracy | Std Dev | Mean Precision | Mean Recall | Mean F1-Score | Mean ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | **90.70%** | ±5.89% | **0.8920** | **0.9412** | **0.9145** | **0.9493** |
| **Decision Tree (Max Depth 3)** | 93.77% | — | — | — | 0.9391 | 0.9424 |
| **Random Forest (100 Trees)** | 95.02% | — | — | — | 0.9525 | 0.9945 |

---

## 4. Responsible AI & Ethical Governance Framework

### 4.1 Non-Evaluative / Anti-Rejection Safeguard
Psychometric traits must never be used as automated barriers or elimination criteria in recruitment. The SDS model is deployed in La Casa De Rozgaar purely as an **evidence-based self-coaching and professional development lens**.

### 4.2 Interpretability Over Black-Box Complexity
We chose **Logistic Regression** and **Regularized Random Forests** over opaque deep neural networks because every prediction must provide explainable factor weights to candidates and HR leaders.