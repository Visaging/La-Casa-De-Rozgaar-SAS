"""
Canonical Skill Mapping Dictionary & Normalization Utilities
Maps 10,000+ raw skill variations to standardized Canonical Skill Taxonomy.
"""

import re
from collections import Counter
from typing import List, Dict, Set, Tuple

# Comprehensive Canonical Skills Mapping Table
CANONICAL_SKILL_MAP: Dict[str, str] = {
    # Core Languages
    'python': 'Python',
    'python3': 'Python',
    'python 3': 'Python',
    'py': 'Python',
    'r': 'R',
    'r language': 'R',
    'r programming': 'R',
    'sas': 'SAS',
    'sas programming': 'SAS',
    'sas analytics': 'SAS',
    'base sas': 'SAS',
    'advanced sas': 'SAS',
    'sas macro': 'SAS',
    'sas macros': 'SAS',
    'sql': 'SQL',
    'pl/sql': 'SQL (PL/SQL)',
    'plsql': 'SQL (PL/SQL)',
    't-sql': 'SQL (T-SQL)',
    'tsql': 'SQL (T-SQL)',
    'mysql': 'MySQL',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'oracle': 'Oracle DB',
    'oracle sql': 'Oracle DB',
    'sqlite': 'SQLite',
    'nosql': 'NoSQL',
    'mongodb': 'MongoDB',
    'mongo db': 'MongoDB',
    'cassandra': 'Cassandra',
    'redis': 'Redis',
    'java': 'Java',
    'core java': 'Java',
    'c++': 'C++',
    'c#': 'C#',
    '.net': '.NET',
    'scala': 'Scala',
    'julia': 'Julia',
    'matlab': 'MATLAB',

    # Web & Development
    'javascript': 'JavaScript',
    'js': 'JavaScript',
    'typescript': 'TypeScript',
    'ts': 'TypeScript',
    'html': 'HTML/CSS',
    'html5': 'HTML/CSS',
    'css': 'HTML/CSS',
    'css3': 'HTML/CSS',
    'react': 'React.js',
    'reactjs': 'React.js',
    'react.js': 'React.js',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'angular': 'Angular',
    'vue': 'Vue.js',
    'django': 'Django',
    'flask': 'Flask',
    'fastapi': 'FastAPI',
    'api': 'REST APIs',
    'rest api': 'REST APIs',
    'restful api': 'REST APIs',
    'web services': 'Web Services',
    'git': 'Git / Version Control',
    'github': 'Git / Version Control',
    'bitbucket': 'Git / Version Control',

    # Data Engineering & Big Data
    'big data': 'Big Data',
    'bigdata': 'Big Data',
    'hadoop': 'Hadoop ecosystem',
    'hdfs': 'Hadoop ecosystem',
    'hive': 'Apache Hive',
    'pig': 'Apache Pig',
    'spark': 'Apache Spark',
    'pyspark': 'PySpark',
    'kafka': 'Apache Kafka',
    'flink': 'Apache Flink',
    'airflow': 'Apache Airflow',
    'dbt': 'dbt',
    'etl': 'ETL Pipelines',
    'data pipeline': 'ETL Pipelines',
    'data warehousing': 'Data Warehousing',
    'data warehouse': 'Data Warehousing',
    'dwh': 'Data Warehousing',
    'snowflake': 'Snowflake',
    'databricks': 'Databricks',
    'redshift': 'Amazon Redshift',
    'bigquery': 'Google BigQuery',
    'synapse': 'Azure Synapse',

    # Machine Learning & AI
    'machine learning': 'Machine Learning',
    'ml': 'Machine Learning',
    'deep learning': 'Deep Learning',
    'dl': 'Deep Learning',
    'artificial intelligence': 'Artificial Intelligence',
    'ai': 'Artificial Intelligence',
    'generative ai': 'Generative AI & LLMs',
    'gen ai': 'Generative AI & LLMs',
    'genai': 'Generative AI & LLMs',
    'llm': 'Generative AI & LLMs',
    'nlp': 'Natural Language Processing',
    'natural language processing': 'Natural Language Processing',
    'text mining': 'Natural Language Processing',
    'computer vision': 'Computer Vision',
    'cv': 'Computer Vision',
    'image processing': 'Computer Vision',
    'tensorflow': 'TensorFlow',
    'tf': 'TensorFlow',
    'pytorch': 'PyTorch',
    'keras': 'Keras',
    'scikit-learn': 'Scikit-Learn',
    'sklearn': 'Scikit-Learn',
    'xgboost': 'XGBoost / Gradient Boosting',
    'lightgbm': 'LightGBM',
    'catboost': 'CatBoost',
    'random forest': 'Tree-based Ensembles',
    'neural networks': 'Neural Networks',
    'predictive modeling': 'Predictive Modeling',
    'predictive analytics': 'Predictive Modeling',
    'supervised learning': 'Machine Learning',
    'unsupervised learning': 'Machine Learning',
    'reinforcement learning': 'Reinforcement Learning',
    'time series': 'Time Series Forecasting',
    'forecasting': 'Time Series Forecasting',
    'clustering': 'Unsupervised Learning & Clustering',
    'classification': 'Statistical Classification',
    'regression': 'Statistical Regression',
    'mlops': 'MLOps',
    'model deployment': 'MLOps',

    # Math, Statistics & Analytics
    'statistics': 'Statistics & Probability',
    'statistical analysis': 'Statistics & Probability',
    'statistical modeling': 'Statistics & Probability',
    'stats': 'Statistics & Probability',
    'biostatistics': 'Statistics & Probability',
    'mathematics': 'Applied Mathematics',
    'linear algebra': 'Applied Mathematics',
    'calculus': 'Applied Mathematics',
    'hypothesis testing': 'A/B Testing & Inference',
    'a/b testing': 'A/B Testing & Inference',
    'ab testing': 'A/B Testing & Inference',
    'experimental design': 'A/B Testing & Inference',
    'optimization': 'Mathematical Optimization',
    'operations research': 'Operations Research',
    'data analysis': 'Data Analysis',
    'data analytics': 'Data Analytics',
    'business analytics': 'Business Analytics',
    'quantitative analysis': 'Quantitative Analytics',
    'econometrics': 'Econometrics & Quant Methods',

    # BI, Visualization & Storytelling
    'tableau': 'Tableau',
    'power bi': 'Power BI',
    'powerbi': 'Power BI',
    'power-bi': 'Power BI',
    'bi': 'Business Intelligence',
    'business intelligence': 'Business Intelligence',
    'qlik': 'QlikView / Qlik Sense',
    'qlikview': 'QlikView / Qlik Sense',
    'qliksense': 'QlikView / Qlik Sense',
    'looker': 'Looker',
    'microstrategy': 'MicroStrategy',
    'cognos': 'IBM Cognos',
    'excel': 'Advanced Excel & VBA',
    'advanced excel': 'Advanced Excel & VBA',
    'vba': 'Advanced Excel & VBA',
    'macros': 'Advanced Excel & VBA',
    'data visualization': 'Data Visualization & Storytelling',
    'data storytelling': 'Data Visualization & Storytelling',
    'storytelling': 'Data Visualization & Storytelling',
    'dashboard': 'Dashboard Design & Reporting',
    'dashboards': 'Dashboard Design & Reporting',
    'reporting': 'Dashboard Design & Reporting',
    'matplotlib': 'Data Visualization & Storytelling',
    'seaborn': 'Data Visualization & Storytelling',
    'plotly': 'Data Visualization & Storytelling',
    'd3.js': 'Data Visualization & Storytelling',

    # Cloud & DevOps
    'aws': 'AWS Cloud',
    'amazon web services': 'AWS Cloud',
    'azure': 'Microsoft Azure',
    'gcp': 'Google Cloud Platform',
    'google cloud': 'Google Cloud Platform',
    'docker': 'Docker & Containers',
    'kubernetes': 'Kubernetes',
    'k8s': 'Kubernetes',
    'ci/cd': 'CI/CD Pipelines',
    'linux': 'Linux / Unix',
    'unix': 'Linux / Unix',
    'bash': 'Shell Scripting',
    'shell scripting': 'Shell Scripting',

    # Domain, Strategy & Business Skills
    'business analysis': 'Business Analysis',
    'requirement gathering': 'Requirements Engineering',
    'agile': 'Agile / Scrum Methodology',
    'scrum': 'Agile / Scrum Methodology',
    'jira': 'Agile / Scrum Methodology',
    'project management': 'Project Management',
    'pmp': 'Project Management',
    'product management': 'Product Management',
    'stakeholder management': 'Stakeholder Management',
    'client management': 'Client & Stakeholder Management',
    'communication skills': 'Communication & Storytelling',
    'presentation skills': 'Communication & Storytelling',
    'problem solving': 'Problem Solving & Critical Thinking',
    'critical thinking': 'Problem Solving & Critical Thinking',
    'finance': 'Financial Analytics & Modeling',
    'financial modeling': 'Financial Analytics & Modeling',
    'accounting': 'Accounting & Audit Analytics',
    'risk analytics': 'Risk Management & Analytics',
    'credit risk': 'Risk Management & Analytics',
    'fraud analytics': 'Fraud & Risk Analytics',
    'marketing analytics': 'Marketing Analytics',
    'digital marketing': 'Digital Marketing & Growth',
    'seo': 'SEO & Web Analytics',
    'sem': 'SEM & Paid Growth',
    'crm': 'CRM Analytics',
    'salesforce': 'Salesforce CRM',
    'supply chain': 'Supply Chain Analytics',
    'healthcare analytics': 'Healthcare & Life Sciences Analytics',
    'clinical data': 'Healthcare & Life Sciences Analytics',
    'sdtm': 'Clinical Data Standards (SDTM/ADaM)',
    'adam': 'Clinical Data Standards (SDTM/ADaM)',
}


def normalize_skill(raw_skill: str) -> str:
    """
    Clean and map a single raw skill string to canonical standard.
    """
    if not raw_skill or not isinstance(raw_skill, str):
        return ""
    
    # Strip dots, quotes, trailing symbols
    cleaned = raw_skill.strip().lower()
    cleaned = re.sub(r'^[^\w\+\#]+|[^\w\+\#]+$', '', cleaned)
    
    if not cleaned or len(cleaned) < 2:
        return ""
    
    # Check exact dictionary match
    if cleaned in CANONICAL_SKILL_MAP:
        return CANONICAL_SKILL_MAP[cleaned]
    
    # Substring checks for compound tokens
    if 'python' in cleaned:
        return 'Python'
    if 'sql' in cleaned and 'nosql' not in cleaned:
        return 'SQL'
    if 'tableau' in cleaned:
        return 'Tableau'
    if 'power bi' in cleaned or 'powerbi' in cleaned:
        return 'Power BI'
    if 'machine learning' in cleaned:
        return 'Machine Learning'
    if 'deep learning' in cleaned:
        return 'Deep Learning'
    if 'hadoop' in cleaned:
        return 'Hadoop ecosystem'
    if 'spark' in cleaned:
        return 'Apache Spark'
    if 'excel' in cleaned:
        return 'Advanced Excel & VBA'
    if 'aws' in cleaned:
        return 'AWS Cloud'
    if 'azure' in cleaned:
        return 'Microsoft Azure'
    if 'nlp' in cleaned or 'natural language' in cleaned:
        return 'Natural Language Processing'
    if 'sas' in cleaned:
        return 'SAS'
    
    # Capitalize title format for unmapped generic terms
    return cleaned.title()


def extract_and_normalize_skills(skills_field: str) -> List[str]:
    """
    Split comma-separated/semicolon-separated skill list and return deduplicated canonical list.
    """
    if not skills_field or not isinstance(skills_field, str):
        return []
    
    # Split by comma, semicolon, or vertical bar
    raw_tokens = re.split(r'[,;|/]+', str(skills_field))
    normalized_skills = []
    seen = set()
    
    for token in raw_tokens:
        canon = normalize_skill(token)
        if canon and canon not in seen and len(canon) > 1:
            seen.add(canon)
            normalized_skills.append(canon)
            
    return normalized_skills
