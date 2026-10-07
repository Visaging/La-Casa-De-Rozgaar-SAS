"""
Analytics Jobs Cleaning, Skill Extraction & Standardization Pipeline
Processes Instruction/Analytics Jobs.csv (15,841 rows) -> Standardized DataFrame
"""

import os
import re
import json
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List

from canonical_skills import extract_and_normalize_skills


def parse_experience_range(val: Any) -> Tuple[float, float, float]:
    """
    Parses experience strings like '5-10 yrs', '2-5 Yrs', '0-1 yrs', '10+ yrs'
    Returns (min_exp, max_exp, mid_exp)
    """
    if pd.isna(val):
        return (0.0, 0.0, 0.0)
    
    s = str(val).lower().replace('yrs', '').replace('yr', '').replace('years', '').replace('year', '').strip()
    
    # Handle range '5-10' or '5 - 10' or '5 to 10'
    match_range = re.search(r'(\d+)\s*[-to]+\s*(\d+)', s)
    if match_range:
        min_e = float(match_range.group(1))
        max_e = float(match_range.group(2))
        return (min_e, max_e, round((min_e + max_e) / 2.0, 1))
    
    # Handle single number '5' or '5+'
    match_single = re.search(r'(\d+)', s)
    if match_single:
        val_e = float(match_single.group(1))
        return (val_e, val_e + 3.0 if '+' in s else val_e, val_e)
        
    return (0.0, 0.0, 0.0)


def categorize_experience_years(mid_exp: float) -> str:
    """
    Categorize experience into standardized tiers.
    """
    if mid_exp <= 2:
        return "Entry-Level (0-2 yrs)"
    elif mid_exp <= 5:
        return "Mid-Level (3-5 yrs)"
    elif mid_exp <= 9:
        return "Senior-Level (6-9 yrs)"
    else:
        return "Lead / Principal (10+ yrs)"


def parse_salary_bracket(val: Any) -> Tuple[str, float, float, float]:
    """
    Parses salary brackets like '10to15', '15to25', '6to10', '0to3', '3to6', '25to50'
    Returns (clean_bracket, min_lakhs, max_lakhs, mid_lakhs)
    """
    if pd.isna(val):
        return ("Not Disclosed", np.nan, np.nan, np.nan)
    
    s = str(val).strip().lower()
    
    bracket_map = {
        '0to3': ('0 - 3 Lakhs', 0.0, 3.0, 1.5),
        '3to6': ('3 - 6 Lakhs', 3.0, 6.0, 4.5),
        '6to10': ('6 - 10 Lakhs', 6.0, 10.0, 8.0),
        '10to15': ('10 - 15 Lakhs', 10.0, 15.0, 12.5),
        '15to25': ('15 - 25 Lakhs', 15.0, 25.0, 20.0),
        '25to50': ('25 - 50 Lakhs', 25.0, 50.0, 37.5),
    }
    
    if s in bracket_map:
        return bracket_map[s]
        
    # Check regex match 'XtoY'
    match = re.search(r'(\d+)\s*to\s*(\d+)', s)
    if match:
        min_v = float(match.group(1))
        max_v = float(match.group(2))
        return (f"{int(min_v)} - {int(max_v)} Lakhs", min_v, max_v, round((min_v + max_v) / 2.0, 1))
        
    return (str(val), np.nan, np.nan, np.nan)


def parse_location_tier(val: Any) -> Tuple[str, str, str]:
    """
    Cleans location and identifies primary city, secondary city, and metro tier.
    Returns (primary_city, secondary_city, geo_tier)
    """
    if pd.isna(val):
        return ("Remote / Pan India", "", "Remote / Pan India")
    
    s = str(val).strip()
    parts = [p.strip() for p in re.split(r'[,/]+', s) if p.strip()]
    
    primary = parts[0] if len(parts) > 0 else "Remote / Pan India"
    secondary = parts[1] if len(parts) > 1 else ""
    
    tier_1_cities = {'bengaluru', 'bangalore', 'mumbai', 'delhi', 'delhi ncr', 'gurgaon', 'gurugram', 'noida', 'hyderabad', 'pune', 'chennai', 'kolkata'}
    ncr_cities = {'delhi', 'delhi ncr', 'gurgaon', 'gurugram', 'noida', 'faridabad', 'ghaziabad'}
    
    prim_lower = primary.lower()
    
    if prim_lower in ncr_cities:
        tier = "NCR Region"
    elif prim_lower in tier_1_cities:
        tier = "Tier-1 Metro"
    elif 'remote' in prim_lower or 'home' in prim_lower or 'india' in prim_lower:
        tier = "Remote / Pan-India"
    else:
        tier = "Tier-2 / Emerging Hub"
        
    # Standardize city names
    if prim_lower in ['bangalore', 'bengaluru']:
        primary = 'Bengaluru'
    elif prim_lower in ['gurgaon', 'gurugram']:
        primary = 'Gurgaon'
    elif prim_lower in ['delhi ncr', 'delhi']:
        primary = 'Delhi NCR'
        
    return (primary, secondary, tier)


def clean_analytics_jobs(input_path: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans, normalizes skills, and feature-engineers Analytics Jobs dataset.
    Returns (cleaned_df, quality_audit_dict)
    """
    raw_df = pd.read_csv(input_path)
    initial_shape = raw_df.shape
    
    df = raw_df.copy()
    df.columns = [c.strip().lower() for c in df.columns]
    
    # 1. Experience extraction
    exp_tuples = df['experience'].apply(parse_experience_range)
    df['min_experience'] = [t[0] for t in exp_tuples]
    df['max_experience'] = [t[1] for t in exp_tuples]
    df['mid_experience'] = [t[2] for t in exp_tuples]
    df['experience_tier'] = df['mid_experience'].apply(categorize_experience_years)
    
    # 2. Location standardization
    loc_tuples = df['location'].apply(parse_location_tier)
    df['primary_location'] = [t[0] for t in loc_tuples]
    df['secondary_location'] = [t[1] for t in loc_tuples]
    df['geo_tier'] = [t[2] for t in loc_tuples]
    
    # 3. Salary standardization
    sal_tuples = df['salary'].apply(parse_salary_bracket)
    df['salary_bracket_clean'] = [t[0] for t in sal_tuples]
    df['salary_min_lakhs'] = [t[1] for t in sal_tuples]
    df['salary_max_lakhs'] = [t[2] for t in sal_tuples]
    df['salary_mid_lakhs'] = [t[3] for t in sal_tuples]
    
    # 4. Job type standardization
    df['job_type_clean'] = df['job_type'].fillna('Analytics').astype(str).str.strip().str.capitalize()
    
    # 5. Canonical Skill Extraction
    print("Extracting canonical skills for 15,841 records...")
    df['canonical_skills_list'] = df['key_skills'].apply(extract_and_normalize_skills)
    df['canonical_skills_str'] = df['canonical_skills_list'].apply(lambda lst: ", ".join(lst))
    df['canonical_skills_json'] = df['canonical_skills_list'].apply(json.dumps)
    df['num_skills_required'] = df['canonical_skills_list'].apply(len)
    
    # 6. High-level Role Family Mapping
    def categorize_role_family(desig: str) -> str:
        d = str(desig).lower()
        if 'data scientist' in d or 'machine learning' in d or 'ai ' in d:
            return 'Data Science & AI'
        elif 'data engineer' in d or 'etl' in d or 'big data' in d or 'database' in d:
            return 'Data Engineering & Big Data'
        elif 'business analyst' in d or 'business analytics' in d:
            return 'Business Analytics'
        elif 'data analyst' in d or 'analytics' in d or 'reporting' in d or 'bi ' in d:
            return 'Data & BI Analytics'
        elif 'marketing' in d or 'seo' in d or 'sem' in d or 'growth' in d:
            return 'Marketing & Growth Analytics'
        elif 'finance' in d or 'account' in d or 'risk' in d or 'credit' in d:
            return 'Financial & Risk Analytics'
        elif 'product' in d or 'project' in d or 'program' in d:
            return 'Product & Project Management'
        elif 'consultant' in d or 'manager' in d or 'lead' in d or 'director' in d:
            return 'Consulting & Leadership'
        else:
            return 'Specialized / Applied Analytics'
            
    df['role_family'] = df['job_desig'].apply(categorize_role_family)
    
    # Audit summary
    all_skills = [s for sublist in df['canonical_skills_list'] for s in sublist]
    from collections import Counter
    skill_freq = Counter(all_skills)
    
    audit = {
        'initial_shape': initial_shape,
        'final_shape': df.shape,
        'total_canonical_skills_extracted': len(all_skills),
        'unique_canonical_skills': len(skill_freq),
        'top_10_skills': skill_freq.most_common(10),
        'location_distribution': df['primary_location'].value_counts().head(5).to_dict(),
        'geo_tier_distribution': df['geo_tier'].value_counts().to_dict(),
        'salary_bracket_distribution': df['salary_bracket_clean'].value_counts().to_dict(),
        'role_family_distribution': df['role_family'].value_counts().to_dict(),
    }
    
    return df, audit


if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '../../'))
    input_file = os.path.join(project_root, 'Instruction/Analytics Jobs.csv')
    df, audit = clean_analytics_jobs(input_file)
    print("Cleaned Analytics Jobs:")
    print("Shape:", df.shape)
    print("Top skills:", audit['top_10_skills'])
    print(df[['s_no', 'job_desig', 'role_family', 'primary_location', 'salary_bracket_clean', 'canonical_skills_str']].head(3))
