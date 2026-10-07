"""
Data Science Jobs Cleaning & Feature Engineering Pipeline
Processes Instruction/DataScience Jobs.csv -> Standardized DataFrame
"""

import os
import re
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any


def parse_salary_lakhs(val: Any) -> float:
    """
    Parse salary strings like '4.5L', '16.0L', '20L' into numerical float in Lakhs.
    """
    if pd.isna(val):
        return np.nan
    s = str(val).strip().upper().replace('LAKHS', '').replace('LACS', '').replace('L', '').replace('INR', '').replace(',', '').strip()
    try:
        return float(s)
    except ValueError:
        match = re.search(r'[\d\.]+', s)
        if match:
            return float(match.group(0))
        return np.nan


def categorize_experience(exp: float) -> str:
    """
    Map minimum experience to industry tiers.
    """
    if pd.isna(exp):
        return "Unknown"
    if exp <= 2:
        return "Entry-Level (0-2 yrs)"
    elif exp <= 5:
        return "Mid-Level (3-5 yrs)"
    elif exp <= 9:
        return "Senior-Level (6-9 yrs)"
    else:
        return "Lead / Principal (10+ yrs)"


def clean_datascience_jobs(input_path: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans and enhances Data Science Jobs dataset.
    Returns (cleaned_df, quality_audit_dict)
    """
    raw_df = pd.read_csv(input_path)
    initial_shape = raw_df.shape
    
    df = raw_df.copy()
    
    # Standardize column headers
    df.columns = [c.strip().lower() for c in df.columns]
    
    # Text cleaning
    df['company_name'] = df['company_name'].astype(str).str.strip()
    df['job_title'] = df['job_title'].astype(str).str.strip()
    
    # Numerical experience
    df['min_experience'] = pd.to_numeric(df['min_experience'], errors='coerce').fillna(0).astype(int)
    
    # Parse salaries
    df['avg_salary_lakhs'] = df['avg_salary'].apply(parse_salary_lakhs)
    df['min_salary_lakhs'] = df['min_salary'].apply(parse_salary_lakhs)
    df['max_salary_lakhs'] = df['max_salary'].apply(parse_salary_lakhs)
    
    # Sanity checks on salary: min <= avg <= max
    # If min > max or avg out of bounds, adjust logically
    for idx, row in df.iterrows():
        min_s = row['min_salary_lakhs']
        avg_s = row['avg_salary_lakhs']
        max_s = row['max_salary_lakhs']
        
        if pd.notna(min_s) and pd.notna(max_s) and min_s > max_s:
            df.at[idx, 'min_salary_lakhs'], df.at[idx, 'max_salary_lakhs'] = max_s, min_s
            
        if pd.notna(avg_s) and pd.notna(min_s) and pd.notna(max_s):
            if not (df.at[idx, 'min_salary_lakhs'] <= avg_s <= df.at[idx, 'max_salary_lakhs']):
                df.at[idx, 'avg_salary_lakhs'] = round((df.at[idx, 'min_salary_lakhs'] + df.at[idx, 'max_salary_lakhs']) / 2, 2)
    
    # Posting volume
    df['num_of_jobs'] = pd.to_numeric(df['num_of_jobs'], errors='coerce').fillna(1).astype(int)
    
    # Feature Engineering
    df['salary_spread_lakhs'] = (df['max_salary_lakhs'] - df['min_salary_lakhs']).round(2)
    df['experience_tier'] = df['min_experience'].apply(categorize_experience)
    df['is_senior_role'] = df['job_title'].str.contains('Senior|Principal|Lead|Architect|Head', case=False, regex=True).astype(int)
    
    # Audit summary
    audit = {
        'initial_shape': initial_shape,
        'final_shape': df.shape,
        'unique_companies': int(df['company_name'].nunique()),
        'unique_job_titles': int(df['job_title'].nunique()),
        'total_job_openings_represented': int(df['num_of_jobs'].sum()),
        'mean_avg_salary_lakhs': float(df['avg_salary_lakhs'].mean()),
        'median_avg_salary_lakhs': float(df['avg_salary_lakhs'].median()),
        'min_avg_salary_lakhs': float(df['avg_salary_lakhs'].min()),
        'max_avg_salary_lakhs': float(df['avg_salary_lakhs'].max()),
        'mean_min_experience_years': float(df['min_experience'].mean()),
    }
    
    return df, audit


if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '../../'))
    input_file = os.path.join(project_root, 'Instruction/DataScience Jobs.csv')
    df, audit = clean_datascience_jobs(input_file)
    print("Cleaned Data Science Jobs:")
    print("Shape:", df.shape)
    print("Audit:", audit)
    print(df.head(3))
