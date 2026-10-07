"""
JDS Skill Traits & SDS Personality Traits Cleaning & Feature Engineering Pipeline
Processes Instruction/JDS Skill Traits.xlsx and Instruction/SDS Personality Traits.xlsx
"""

import os
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any


def clean_jds_traits(input_path: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans and feature-engineers JDS Skill Traits dataset.
    Returns (cleaned_df, quality_audit_dict)
    """
    raw_df = pd.read_excel(input_path)
    df = raw_df.copy()
    
    # Standardize column headers
    rename_map = {
        'id': 'candidate_id',
        'big_data_skills': 'big_data_skills',
        'maths-stats_skills': 'maths_stats_skills',
        'coding_skills': 'coding_skills',
        'ai_and_ml_skills': 'ai_ml_skills',
        'dashboard_and_storytelling_skills': 'storytelling_skills',
        'salary_hike_high_or_low': 'salary_hike_target'
    }
    df.rename(columns=rename_map, inplace=True)
    
    # Verify bounds (1.0 to 5.0)
    skill_cols = ['big_data_skills', 'maths_stats_skills', 'coding_skills', 'ai_ml_skills', 'storytelling_skills']
    for col in skill_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce').clip(1.0, 5.0).round(2)
        
    df['salary_hike_target'] = pd.to_numeric(df['salary_hike_target'], errors='coerce').astype(int)
    
    # Feature Engineering
    df['technical_skill_composite'] = df[['big_data_skills', 'coding_skills', 'ai_ml_skills']].mean(axis=1).round(2)
    df['analytical_story_composite'] = df[['maths_stats_skills', 'storytelling_skills']].mean(axis=1).round(2)
    df['overall_skill_average'] = df[skill_cols].mean(axis=1).round(2)
    df['skill_variance'] = df[skill_cols].std(axis=1).round(2)
    
    # Correlations
    corrs = df[skill_cols + ['technical_skill_composite', 'analytical_story_composite']].apply(lambda c: df['salary_hike_target'].corr(c)).to_dict()
    
    audit = {
        'shape': df.shape,
        'target_distribution': df['salary_hike_target'].value_counts().to_dict(),
        'feature_means': df[skill_cols].mean().to_dict(),
        'correlations_with_salary_hike': corrs,
    }
    
    return df, audit


def clean_sds_traits(input_path: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans and feature-engineers SDS Personality Traits dataset.
    Returns (cleaned_df, quality_audit_dict)
    """
    raw_df = pd.read_excel(input_path)
    df = raw_df.copy()
    
    # Strip whitespace from columns
    df.columns = [c.strip() for c in df.columns]
    
    # Standardize column headers
    rename_map = {
        'id': 'senior_ds_id',
        'neuroticism': 'neuroticism',
        'extraversion': 'extraversion',
        'openness_to_experience': 'openness',
        'agreeableness': 'agreeableness',
        'conscientiousness': 'conscientiousness',
        'success_ classification_ high_low': 'success_target'
    }
    df.rename(columns=rename_map, inplace=True)
    
    ocean_cols = ['neuroticism', 'extraversion', 'openness', 'agreeableness', 'conscientiousness']
    for col in ocean_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce').round(1)
        
    df['success_target'] = pd.to_numeric(df['success_target'], errors='coerce').astype(int)
    
    # Feature Engineering
    df['emotional_stability'] = (100.0 - df['neuroticism']).round(1)
    df['leadership_orientation'] = df[['extraversion', 'conscientiousness']].mean(axis=1).round(1)
    df['innovation_orientation'] = df[['openness', 'conscientiousness']].mean(axis=1).round(1)
    df['client_facing_index'] = df[['extraversion', 'agreeableness', 'conscientiousness']].mean(axis=1).round(1)
    
    corrs = df[ocean_cols + ['emotional_stability', 'leadership_orientation', 'innovation_orientation', 'client_facing_index']].apply(lambda c: df['success_target'].corr(c)).to_dict()
    
    audit = {
        'shape': df.shape,
        'target_distribution': df['success_target'].value_counts().to_dict(),
        'ocean_means': df[ocean_cols].mean().to_dict(),
        'correlations_with_success': corrs,
    }
    
    return df, audit


if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '../../'))
    
    jds_file = os.path.join(project_root, 'Instruction/JDS Skill Traits.xlsx')
    sds_file = os.path.join(project_root, 'Instruction/SDS Personality Traits.xlsx')
    
    jds_df, jds_audit = clean_jds_traits(jds_file)
    sds_df, sds_audit = clean_sds_traits(sds_file)
    
    print("JDS Cleaned Shape:", jds_df.shape)
    print("JDS Correlations:", jds_audit['correlations_with_salary_hike'])
    print("\nSDS Cleaned Shape:", sds_df.shape)
    print("SDS Correlations:", sds_audit['correlations_with_success'])
