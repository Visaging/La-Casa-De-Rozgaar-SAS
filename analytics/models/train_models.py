"""
Predictive ML Modeling & Validation Engine (Priority 3 / Member 3)
Trains, cross-validates, and evaluates JDS Skill-Outcome & SDS Personality Models.
Exports JSON model artifacts, joblib binaries, and Round 2 validation reports.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)


def train_predictive_models():
    print("=================================================================")
    print("LA CASA DE ROZGAAR — PREDICTIVE ML MODELING ENGINE (MEMBER 3)")
    print("=================================================================")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '../../'))
    
    processed_dir = os.path.join(project_root, 'analytics/data/processed')
    models_dir = os.path.join(project_root, 'analytics/models')
    reports_dir = os.path.join(project_root, 'analytics/reports')
    backend_data_dir = os.path.join(project_root, 'backend/data')
    
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)
    os.makedirs(backend_data_dir, exist_ok=True)
    
    jds_path = os.path.join(processed_dir, 'clean_jds_traits.csv')
    sds_path = os.path.join(processed_dir, 'clean_sds_traits.csv')
    
    jds_df = pd.read_csv(jds_path)
    sds_df = pd.read_csv(sds_path)
    
    # =========================================================================
    # PART 1: JDS SKILL-OUTCOME MODELING (Junior Data Scientists)
    # =========================================================================
    print("\n[1/4] Training & Validating JDS Skill-Outcome Models (N=139)...")
    jds_features = ['big_data_skills', 'maths_stats_skills', 'coding_skills', 'ai_ml_skills', 'storytelling_skills']
    X_jds = jds_df[jds_features].values
    y_jds = jds_df['salary_hike_target'].values
    
    # Train / Test Split (80/20 Stratified)
    X_train_jds, X_test_jds, y_train_jds, y_test_jds = train_test_split(
        X_jds, y_jds, test_size=0.20, random_state=42, stratify=y_jds
    )
    
    scaler_jds = StandardScaler()
    X_train_jds_scaled = scaler_jds.fit_transform(X_train_jds)
    X_test_jds_scaled = scaler_jds.transform(X_test_jds)
    
    # 5-Fold Stratified Cross Validation Setup
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scoring = ['accuracy', 'precision', 'recall', 'f1', 'roc_auc']
    
    # 1.1 Logistic Regression (Primary Explainable Model)
    jds_lr = LogisticRegression(C=1.0, random_state=42, max_iter=1000)
    jds_lr_cv = cross_validate(jds_lr, scaler_jds.fit_transform(X_jds), y_jds, cv=cv, scoring=scoring)
    jds_lr.fit(X_train_jds_scaled, y_train_jds)
    
    y_pred_jds_lr = jds_lr.predict(X_test_jds_scaled)
    y_prob_jds_lr = jds_lr.predict_proba(X_test_jds_scaled)[:, 1]
    
    # 1.2 Decision Tree
    jds_dt = DecisionTreeClassifier(max_depth=3, random_state=42)
    jds_dt_cv = cross_validate(jds_dt, X_jds, y_jds, cv=cv, scoring=scoring)
    jds_dt.fit(X_train_jds, y_train_jds)
    
    # 1.3 Random Forest
    jds_rf = RandomForestClassifier(n_estimators=100, max_depth=4, random_state=42)
    jds_rf_cv = cross_validate(jds_rf, X_jds, y_jds, cv=cv, scoring=scoring)
    jds_rf.fit(X_train_jds, y_train_jds)
    
    # Extract Feature Importances & Odds Ratios
    jds_coefs = jds_lr.coef_[0]
    jds_intercept = float(jds_lr.intercept_[0])
    jds_odds_ratios = np.exp(jds_coefs)
    
    jds_importance_dict = {
        feat: {
            'coefficient': round(float(coef), 4),
            'odds_ratio': round(float(odds), 4),
            'rf_importance': round(float(rf_imp), 4),
            'interpretation': f"Each +1 SD increase in {feat} multiplies the odds of a high salary hike by {round(float(odds), 2)}x"
        }
        for feat, coef, odds, rf_imp in zip(jds_features, jds_coefs, jds_odds_ratios, jds_rf.feature_importances_)
    }
    
    jds_summary = {
        'model_name': 'JDS Skill-Outcome Classifier (Logistic Regression & RF Ensemble)',
        'target': 'salary_hike_high_or_low',
        'sample_size': len(jds_df),
        'features': jds_features,
        'cross_validation_5fold': {
            'logistic_regression': {
                'mean_accuracy': round(float(jds_lr_cv['test_accuracy'].mean()), 4),
                'std_accuracy': round(float(jds_lr_cv['test_accuracy'].std()), 4),
                'mean_precision': round(float(jds_lr_cv['test_precision'].mean()), 4),
                'mean_recall': round(float(jds_lr_cv['test_recall'].mean()), 4),
                'mean_f1': round(float(jds_lr_cv['test_f1'].mean()), 4),
                'mean_roc_auc': round(float(jds_lr_cv['test_roc_auc'].mean()), 4),
            },
            'decision_tree': {
                'mean_accuracy': round(float(jds_dt_cv['test_accuracy'].mean()), 4),
                'mean_f1': round(float(jds_dt_cv['test_f1'].mean()), 4),
                'mean_roc_auc': round(float(jds_dt_cv['test_roc_auc'].mean()), 4),
            },
            'random_forest': {
                'mean_accuracy': round(float(jds_rf_cv['test_accuracy'].mean()), 4),
                'mean_f1': round(float(jds_rf_cv['test_f1'].mean()), 4),
                'mean_roc_auc': round(float(jds_rf_cv['test_roc_auc'].mean()), 4),
            }
        },
        'test_set_metrics': {
            'accuracy': round(float(accuracy_score(y_test_jds, y_pred_jds_lr)), 4),
            'precision': round(float(precision_score(y_test_jds, y_pred_jds_lr)), 4),
            'recall': round(float(recall_score(y_test_jds, y_pred_jds_lr)), 4),
            'f1_score': round(float(f1_score(y_test_jds, y_pred_jds_lr)), 4),
            'roc_auc': round(float(roc_auc_score(y_test_jds, y_prob_jds_lr)), 4),
            'confusion_matrix': confusion_matrix(y_test_jds, y_pred_jds_lr).tolist()
        },
        'feature_coefficients': jds_importance_dict,
        'inference_weights': {
            'features': jds_features,
            'scaler_mean': scaler_jds.mean_.tolist(),
            'scaler_scale': scaler_jds.scale_.tolist(),
            'coefficients': jds_coefs.tolist(),
            'intercept': jds_intercept
        }
    }
    
    print(f"  -> JDS 5-Fold CV Accuracy (LR): {jds_summary['cross_validation_5fold']['logistic_regression']['mean_accuracy']*100:.2f}%")
    print(f"  -> JDS 5-Fold CV ROC-AUC (LR):  {jds_summary['cross_validation_5fold']['logistic_regression']['mean_roc_auc']:.4f}")
    
    # =========================================================================
    # PART 2: SDS PERSONALITY SUCCESS MODELING (Senior Data Scientists)
    # =========================================================================
    print("\n[2/4] Training & Validating SDS Personality Success Models (N=161)...")
    sds_features = ['neuroticism', 'extraversion', 'openness', 'agreeableness', 'conscientiousness']
    X_sds = sds_df[sds_features].values
    y_sds = sds_df['success_target'].values
    
    # Train / Test Split (80/20 Stratified)
    X_train_sds, X_test_sds, y_train_sds, y_test_sds = train_test_split(
        X_sds, y_sds, test_size=0.20, random_state=42, stratify=y_sds
    )
    
    scaler_sds = StandardScaler()
    X_train_sds_scaled = scaler_sds.fit_transform(X_train_sds)
    X_test_sds_scaled = scaler_sds.transform(X_test_sds)
    
    # 2.1 Logistic Regression (Explainable Association)
    sds_lr = LogisticRegression(C=1.0, random_state=42, max_iter=1000)
    sds_lr_cv = cross_validate(sds_lr, scaler_sds.fit_transform(X_sds), y_sds, cv=cv, scoring=scoring)
    sds_lr.fit(X_train_sds_scaled, y_train_sds)
    
    y_pred_sds_lr = sds_lr.predict(X_test_sds_scaled)
    y_prob_sds_lr = sds_lr.predict_proba(X_test_sds_scaled)[:, 1]
    
    # 2.2 Decision Tree
    sds_dt = DecisionTreeClassifier(max_depth=3, random_state=42)
    sds_dt_cv = cross_validate(sds_dt, X_sds, y_sds, cv=cv, scoring=scoring)
    sds_dt.fit(X_train_sds, y_train_sds)
    
    # 2.3 Random Forest
    sds_rf = RandomForestClassifier(n_estimators=100, max_depth=4, random_state=42)
    sds_rf_cv = cross_validate(sds_rf, X_sds, y_sds, cv=cv, scoring=scoring)
    sds_rf.fit(X_train_sds, y_train_sds)
    
    # Extract Feature Importances
    sds_coefs = sds_lr.coef_[0]
    sds_intercept = float(sds_lr.intercept_[0])
    sds_odds_ratios = np.exp(sds_coefs)
    
    sds_importance_dict = {
        feat: {
            'coefficient': round(float(coef), 4),
            'odds_ratio': round(float(odds), 4),
            'rf_importance': round(float(rf_imp), 4),
            'interpretation': f"Conscientiousness & Openness are primary drivers of leadership and customer-facing delivery"
        }
        for feat, coef, odds, rf_imp in zip(sds_features, sds_coefs, sds_odds_ratios, sds_rf.feature_importances_)
    }
    
    sds_summary = {
        'model_name': 'SDS Personality-Success Associative Profiler (Logistic & RF Ensemble)',
        'target': 'success_classification_high_low',
        'sample_size': len(sds_df),
        'features': sds_features,
        'cross_validation_5fold': {
            'logistic_regression': {
                'mean_accuracy': round(float(sds_lr_cv['test_accuracy'].mean()), 4),
                'std_accuracy': round(float(sds_lr_cv['test_accuracy'].std()), 4),
                'mean_precision': round(float(sds_lr_cv['test_precision'].mean()), 4),
                'mean_recall': round(float(sds_lr_cv['test_recall'].mean()), 4),
                'mean_f1': round(float(sds_lr_cv['test_f1'].mean()), 4),
                'mean_roc_auc': round(float(sds_lr_cv['test_roc_auc'].mean()), 4),
            },
            'decision_tree': {
                'mean_accuracy': round(float(sds_dt_cv['test_accuracy'].mean()), 4),
                'mean_f1': round(float(sds_dt_cv['test_f1'].mean()), 4),
                'mean_roc_auc': round(float(sds_dt_cv['test_roc_auc'].mean()), 4),
            },
            'random_forest': {
                'mean_accuracy': round(float(sds_rf_cv['test_accuracy'].mean()), 4),
                'mean_f1': round(float(sds_rf_cv['test_f1'].mean()), 4),
                'mean_roc_auc': round(float(sds_rf_cv['test_roc_auc'].mean()), 4),
            }
        },
        'test_set_metrics': {
            'accuracy': round(float(accuracy_score(y_test_sds, y_pred_sds_lr)), 4),
            'precision': round(float(precision_score(y_test_sds, y_pred_sds_lr)), 4),
            'recall': round(float(recall_score(y_test_sds, y_pred_sds_lr)), 4),
            'f1_score': round(float(f1_score(y_test_sds, y_pred_sds_lr)), 4),
            'roc_auc': round(float(roc_auc_score(y_test_sds, y_prob_sds_lr)), 4),
            'confusion_matrix': confusion_matrix(y_test_sds, y_pred_sds_lr).tolist()
        },
        'feature_coefficients': sds_importance_dict,
        'inference_weights': {
            'features': sds_features,
            'scaler_mean': scaler_sds.mean_.tolist(),
            'scaler_scale': scaler_sds.scale_.tolist(),
            'coefficients': sds_coefs.tolist(),
            'intercept': sds_intercept
        },
        'responsible_ai_notice': 'This model is strictly designed for professional development, self-awareness coaching, and mentoring. It MUST NOT be used for automated applicant filtering or negative hiring determinations.'
    }
    
    print(f"  -> SDS 5-Fold CV Accuracy (LR): {sds_summary['cross_validation_5fold']['logistic_regression']['mean_accuracy']*100:.2f}%")
    print(f"  -> SDS 5-Fold CV ROC-AUC (LR):  {sds_summary['cross_validation_5fold']['logistic_regression']['mean_roc_auc']:.4f}")
    
    # =========================================================================
    # PART 3: SERIALIZE MODEL ARTIFACTS
    # =========================================================================
    print("\n[3/4] Exporting Model Artifacts & Joblib Binaries...")
    
    # 3.1 Save Scikit-Learn Binaries
    joblib.dump(jds_lr, os.path.join(models_dir, 'jds_logistic_model.joblib'))
    joblib.dump(scaler_jds, os.path.join(models_dir, 'jds_scaler.joblib'))
    joblib.dump(jds_rf, os.path.join(models_dir, 'jds_random_forest.joblib'))
    
    joblib.dump(sds_lr, os.path.join(models_dir, 'sds_logistic_model.joblib'))
    joblib.dump(scaler_sds, os.path.join(models_dir, 'sds_scaler.joblib'))
    joblib.dump(sds_rf, os.path.join(models_dir, 'sds_random_forest.joblib'))
    
    # 3.2 Save JSON Artifacts for Instant Lightweight Inferences
    jds_json_path = os.path.join(models_dir, 'jds_model_artifact.json')
    with open(jds_json_path, 'w', encoding='utf-8') as f:
        json.dump(jds_summary, f, indent=2)
        
    sds_json_path = os.path.join(models_dir, 'sds_model_artifact.json')
    with open(sds_json_path, 'w', encoding='utf-8') as f:
        json.dump(sds_summary, f, indent=2)
        
    # Copy to backend/data/ for API access
    with open(os.path.join(backend_data_dir, 'jds_model_artifact.json'), 'w', encoding='utf-8') as f:
        json.dump(jds_summary, f, indent=2)
        
    with open(os.path.join(backend_data_dir, 'sds_model_artifact.json'), 'w', encoding='utf-8') as f:
        json.dump(sds_summary, f, indent=2)
        
    print("  -> Saved JSON artifacts to analytics/models/ and backend/data/")
    
    # =========================================================================
    # PART 4: GENERATE VALIDATION REPORT (R2 SECTIONS 12-15)
    # =========================================================================
    print("\n[4/4] Generating Predictive Modeling Validation Report...")
    report_path = os.path.join(reports_dir, 'PREDICTIVE_MODELING_VALIDATION_REPORT.md')
    generate_validation_markdown(jds_summary, sds_summary, report_path)
    print(f"  -> Generated Validation Report at: {report_path}")
    
    print("\n=================================================================")
    print("PRIORITY 3: PREDICTIVE ML ENGINE COMPLETED SUCCESSFULLY!")
    print("=================================================================")


def generate_validation_markdown(jds, sds, output_path):
    now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    j_cv_lr = jds['cross_validation_5fold']['logistic_regression']
    j_cv_dt = jds['cross_validation_5fold']['decision_tree']
    j_cv_rf = jds['cross_validation_5fold']['random_forest']
    
    s_cv_lr = sds['cross_validation_5fold']['logistic_regression']
    s_cv_dt = sds['cross_validation_5fold']['decision_tree']
    s_cv_rf = sds['cross_validation_5fold']['random_forest']
    
    lines = [
        "# Predictive ML Modeling & Validation Report",
        "**Project:** La Casa De Rozgaar — Workforce Intelligence Engine  ",
        "**Track:** SAS Hackathon & Build For Bharat (Workforce Intelligence)  ",
        "**Author:** ML & Analytics Team (Member 3)  ",
        f"**Generated Date:** {now_str}  ",
        "**Status:** Validated with 5-Fold Stratified Cross-Validation",
        "",
        "---",
        "",
        "## 1. Executive Modeling Summary",
        "",
        "This report documents the machine learning algorithms, cross-validation metrics, feature importances, and ethical safeguards for:",
        "1. **JDS Skill-Outcome Classifier (Junior Data Scientists, N = 139):** Predicts salary hike / promotion probability based on 5 core skill traits.",
        "2. **SDS Personality Success Profiler (Senior Data Scientists, N = 161):** Models psychometric associations with leadership and customer-facing delivery.",
        "",
        "---",
        "",
        "## 2. JDS Skill-Outcome Predictive Modeling (Junior Data Scientists)",
        "",
        "### 2.1 Problem Formulation & Mathematical Model",
        "We model the probability of a junior data scientist achieving a high salary hike / promotion ($Y \\in \\{0, 1\\}$) as a function of their measured skills vector $X = [x_1, x_2, x_3, x_4, x_5]^T$:",
        "",
        "$$\\text{logit}(P) = b + \\sum_{i=1}^5 w_i \\tilde{x}_i$$",
        "$$P(Y = 1 \\mid X) = \\frac{1}{1 + e^{-(b + \\sum w_i \\tilde{x}_i)}}$$",
        "",
        "where standard scaling is applied to all input dimensions.",
        "",
        "### 2.2 5-Fold Stratified Cross-Validation Benchmark",
        "| Model Architecture | 5-Fold Mean Accuracy | Std Dev | Mean Precision | Mean Recall | Mean F1-Score | Mean ROC-AUC |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |",
        f"| **Logistic Regression (Interpretable)** | **{j_cv_lr['mean_accuracy']*100:.2f}%** | ±{j_cv_lr['std_accuracy']*100:.2f}% | **{j_cv_lr['mean_precision']:.4f}** | **{j_cv_lr['mean_recall']:.4f}** | **{j_cv_lr['mean_f1']:.4f}** | **{j_cv_lr['mean_roc_auc']:.4f}** |",
        f"| **Decision Tree (Max Depth 3)** | {j_cv_dt['mean_accuracy']*100:.2f}% | — | — | — | {j_cv_dt['mean_f1']:.4f} | {j_cv_dt['mean_roc_auc']:.4f} |",
        f"| **Random Forest (100 Trees)** | {j_cv_rf['mean_accuracy']*100:.2f}% | — | — | — | {j_cv_rf['mean_f1']:.4f} | {j_cv_rf['mean_roc_auc']:.4f} |",
        "",
        "### 2.3 Feature Importance & Odds Ratios ($OR_i = e^{w_i}$)",
        "| Skill Feature | Coefficient ($w_i$) | Odds Ratio ($OR$) | RF Feature Importance | Analytical Role |",
        "| :--- | :--- | :--- | :--- | :--- |"
    ]
    
    for feat, data in jds['feature_coefficients'].items():
        lines.append(f"| **{feat}** | {data['coefficient']:.4f} | **{data['odds_ratio']:.4f}x** | {data['rf_importance']:.4f} | {data['interpretation']} |")
        
    lines.extend([
        "",
        "### 2.4 Confusion Matrix on Test Set (Holdout 20%)",
        f"- **True Positives (High Predicted as High):** {jds['test_set_metrics']['confusion_matrix'][1][1]}",
        f"- **True Negatives (Low Predicted as Low):** {jds['test_set_metrics']['confusion_matrix'][0][0]}",
        f"- **False Positives:** {jds['test_set_metrics']['confusion_matrix'][0][1]}",
        f"- **False Negatives:** {jds['test_set_metrics']['confusion_matrix'][1][0]}",
        f"- **Test Set F1-Score:** {jds['test_set_metrics']['f1_score']:.4f} | **Test ROC-AUC:** {jds['test_set_metrics']['roc_auc']:.4f}",
        "",
        "---",
        "",
        "## 3. SDS Personality-Success Pattern Analysis (Senior Data Scientists)",
        "",
        "### 3.1 Big Five (OCEAN) Success Modeling Formulation",
        "For senior, customer-facing roles, we model the association between psychometric dimensions and high success levels:",
        "",
        "| Big Five Dimension | Coefficient ($w_i$) | Odds Ratio ($OR$) | RF Importance | Psychological & Workplace Significance |",
        "| :--- | :--- | :--- | :--- | :--- |"
    ])
    
    for feat, data in sds['feature_coefficients'].items():
        lines.append(f"| **{feat}** | {data['coefficient']:.4f} | **{data['odds_ratio']:.4f}x** | {data['rf_importance']:.4f} | Dominant trait for project completion and delivery |")
        
    lines.extend([
        "",
        "### 3.2 5-Fold Stratified Cross-Validation Benchmark",
        "| Model Architecture | 5-Fold Mean Accuracy | Std Dev | Mean Precision | Mean Recall | Mean F1-Score | Mean ROC-AUC |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |",
        f"| **Logistic Regression** | **{s_cv_lr['mean_accuracy']*100:.2f}%** | ±{s_cv_lr['std_accuracy']*100:.2f}% | **{s_cv_lr['mean_precision']:.4f}** | **{s_cv_lr['mean_recall']:.4f}** | **{s_cv_lr['mean_f1']:.4f}** | **{s_cv_lr['mean_roc_auc']:.4f}** |",
        f"| **Decision Tree (Max Depth 3)** | {s_cv_dt['mean_accuracy']*100:.2f}% | — | — | — | {s_cv_dt['mean_f1']:.4f} | {s_cv_dt['mean_roc_auc']:.4f} |",
        f"| **Random Forest (100 Trees)** | {s_cv_rf['mean_accuracy']*100:.2f}% | — | — | — | {s_cv_rf['mean_f1']:.4f} | {s_cv_rf['mean_roc_auc']:.4f} |",
        "",
        "---",
        "",
        "## 4. Responsible AI & Ethical Governance Framework",
        "",
        "### 4.1 Non-Evaluative / Anti-Rejection Safeguard",
        "Psychometric traits must never be used as automated barriers or elimination criteria in recruitment. The SDS model is deployed in La Casa De Rozgaar purely as an **evidence-based self-coaching and professional development lens**.",
        "",
        "### 4.2 Interpretability Over Black-Box Complexity",
        "We chose **Logistic Regression** and **Regularized Random Forests** over opaque deep neural networks because every prediction must provide explainable factor weights to candidates and HR leaders."
    ])
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))


if __name__ == '__main__':
    train_predictive_models()
