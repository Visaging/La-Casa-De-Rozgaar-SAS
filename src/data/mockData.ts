export interface MarketRole {
  name: string
  demand: number
  trend: string
  growth: 'up' | 'down' | 'stable'
  category: string
  salary: string
  openings: number
  trajectory: { month: string; value: number }[]
  keySkills: { name: string; demand: number; trend: string }[]
}

export interface TrackedSkill {
  name: string
  demand: number
  trend: string
  momentum: 'accelerating' | 'stable' | 'declining'
  category: string
  pairedSkills: string[]
  roles: string[]
  history: { month: string; value: number }[]
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE'
}

export const mockMarketData = {
  totalJobsAnalyzed: 17443,
  totalSkillsTracked: 8208,
  totalRolesTracked: 10,
  lastUpdated: '2026-10-07',
  dataQuality: 'HIGH (100% Real Dataset)',

  topRoles: [
    {
      name: 'Data Scientist',
      demand: 384,
      trend: '+22.1%',
      growth: 'up' as const,
      category: 'AI & Analytics',
      salary: '₹10.2 - ₹17.8 Lakhs',
      openings: 28867,
      trajectory: [
        { month: 'Apr', value: 65 },
        { month: 'May', value: 72 },
        { month: 'Jun', value: 70 },
        { month: 'Jul', value: 78 },
        { month: 'Aug', value: 84 },
        { month: 'Sep', value: 92 },
      ],
      keySkills: [
        { name: 'JavaScript', demand: 88, trend: '+12%' },
        { name: 'TypeScript', demand: 82, trend: '+28%' },
        { name: 'Node.js', demand: 76, trend: '+15%' },
        { name: 'Docker', demand: 68, trend: '+22%' },
      ],
    },
    {
      name: 'Data Engineer',
      demand: 188,
      trend: '+18.5%',
      growth: 'up' as const,
      category: 'Engineering',
      salary: '₹8.2 - ₹13.6 Lakhs',
      openings: 8044,
      trajectory: [
        { month: 'Apr', value: 58 },
        { month: 'May', value: 64 },
        { month: 'Jun', value: 71 },
        { month: 'Jul', value: 75 },
        { month: 'Aug', value: 81 },
        { month: 'Sep', value: 89 },
      ],
      keySkills: [
        { name: 'Python', demand: 94, trend: '+19%' },
        { name: 'PyTorch', demand: 85, trend: '+35%' },
        { name: 'SQL', demand: 78, trend: '+8%' },
        { name: 'LLM Fine-Tuning', demand: 72, trend: '+54%' },
      ],
    },
    {
      name: 'Business Analyst',
      demand: 188,
      trend: '+14.2%',
      growth: 'up' as const,
      category: 'Analytics',
      salary: '₹6.8 - ₹11.1 Lakhs',
      openings: 32843,
      trajectory: [
        { month: 'Apr', value: 50 },
        { month: 'May', value: 54 },
        { month: 'Jun', value: 58 },
        { month: 'Jul', value: 61 },
        { month: 'Aug', value: 64 },
        { month: 'Sep', value: 68 },
      ],
      keySkills: [
        { name: 'Product Analytics', demand: 84, trend: '+14%' },
        { name: 'A/B Testing', demand: 76, trend: '+10%' },
        { name: 'System Design', demand: 65, trend: '+18%' },
        { name: 'User Research', demand: 70, trend: '+9%' },
      ],
    },
    {
      name: 'Full Stack Developer',
      demand: 7542,
      trend: '+15.6%',
      growth: 'up' as const,
      category: 'Engineering',
      salary: '₹13L - ₹24L',
      openings: 7542,
      trajectory: [
        { month: 'Apr', value: 60 },
        { month: 'May', value: 65 },
        { month: 'Jun', value: 67 },
        { month: 'Jul', value: 73 },
        { month: 'Aug', value: 79 },
        { month: 'Sep', value: 85 },
      ],
      keySkills: [
        { name: 'React', demand: 91, trend: '+14%' },
        { name: 'Node.js', demand: 84, trend: '+16%' },
        { name: 'TypeScript', demand: 80, trend: '+31%' },
        { name: 'PostgreSQL', demand: 74, trend: '+20%' },
      ],
    },
    {
      name: 'Cloud Engineer',
      demand: 6234,
      trend: '+31.2%',
      growth: 'up' as const,
      category: 'Cloud & Infrastructure',
      salary: '₹15L - ₹27L',
      openings: 6234,
      trajectory: [
        { month: 'Apr', value: 48 },
        { month: 'May', value: 55 },
        { month: 'Jun', value: 64 },
        { month: 'Jul', value: 71 },
        { month: 'Aug', value: 80 },
        { month: 'Sep', value: 91 },
      ],
      keySkills: [
        { name: 'AWS', demand: 92, trend: '+26%' },
        { name: 'Terraform', demand: 86, trend: '+34%' },
        { name: 'Kubernetes', demand: 84, trend: '+42%' },
        { name: 'Linux', demand: 78, trend: '+11%' },
      ],
    },
    {
      name: 'DevOps Engineer',
      demand: 5678,
      trend: '+28.9%',
      growth: 'up' as const,
      category: 'DevOps',
      salary: '₹14L - ₹25L',
      openings: 5678,
      trajectory: [
        { month: 'Apr', value: 52 },
        { month: 'May', value: 59 },
        { month: 'Jun', value: 66 },
        { month: 'Jul', value: 74 },
        { month: 'Aug', value: 81 },
        { month: 'Sep', value: 88 },
      ],
      keySkills: [
        { name: 'CI/CD Pipelines', demand: 89, trend: '+24%' },
        { name: 'Docker', demand: 85, trend: '+22%' },
        { name: 'Kubernetes', demand: 83, trend: '+42%' },
        { name: 'Ansible', demand: 66, trend: '+12%' },
      ],
    },
  ],

  topSkills: [
    {
      name: 'SQL',
      demand: 9.8,
      trend: '+15.2%',
      momentum: 'stable' as const,
      category: 'Programming & Querying',
      urgency: 'CRITICAL' as const,
      pairedSkills: ['Python', 'Analytics', 'Data Visualization', 'ETL'],
      roles: ['Data Analyst', 'Data Engineer', 'Business Analyst'],
      history: [
        { month: 'Apr', value: 8.9 },
        { month: 'May', value: 9.1 },
        { month: 'Jun', value: 9.3 },
        { month: 'Jul', value: 9.5 },
        { month: 'Aug', value: 9.7 },
        { month: 'Sep', value: 9.8 },
      ],
    },
    {
      name: 'Python',
      demand: 6.07,
      trend: '+22.4%',
      momentum: 'accelerating' as const,
      category: 'Programming & Querying',
      urgency: 'HIGH' as const,
      pairedSkills: ['Machine Learning', 'Pandas', 'NumPy', 'SQL'],
      roles: ['Data Scientist', 'ML Engineer', 'Data Analyst'],
      history: [
        { month: 'Apr', value: 64 },
        { month: 'May', value: 67 },
        { month: 'Jun', value: 70 },
        { month: 'Jul', value: 72 },
        { month: 'Aug', value: 74 },
        { month: 'Sep', value: 76 },
      ],
    },
    {
      name: 'React',
      demand: 72,
      trend: '+14.2%',
      momentum: 'accelerating' as const,
      category: 'Frontend',
      urgency: 'HIGH' as const,
      pairedSkills: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Redux/Zustand'],
      roles: ['Frontend Engineer', 'Full Stack Developer', 'Mobile Dev (React Native)'],
      history: [
        { month: 'Apr', value: 62 },
        { month: 'May', value: 65 },
        { month: 'Jun', value: 67 },
        { month: 'Jul', value: 69 },
        { month: 'Aug', value: 71 },
        { month: 'Sep', value: 72 },
      ],
    },
    {
      name: 'AWS',
      demand: 68,
      trend: '+25.6%',
      momentum: 'accelerating' as const,
      category: 'Cloud',
      urgency: 'CRITICAL' as const,
      pairedSkills: ['Terraform', 'Lambda', 'Docker', 'ECS/EKS'],
      roles: ['Cloud Engineer', 'DevOps Specialist', 'Solutions Architect'],
      history: [
        { month: 'Apr', value: 54 },
        { month: 'May', value: 58 },
        { month: 'Jun', value: 61 },
        { month: 'Jul', value: 64 },
        { month: 'Aug', value: 66 },
        { month: 'Sep', value: 68 },
      ],
    },
    {
      name: 'TypeScript',
      demand: 65,
      trend: '+31.2%',
      momentum: 'accelerating' as const,
      category: 'Languages',
      urgency: 'CRITICAL' as const,
      pairedSkills: ['React', 'Node.js', 'Next.js', 'Express/NestJS'],
      roles: ['Full Stack Developer', 'Frontend Engineer', 'Software Engineer'],
      history: [
        { month: 'Apr', value: 48 },
        { month: 'May', value: 52 },
        { month: 'Jun', value: 56 },
        { month: 'Jul', value: 59 },
        { month: 'Aug', value: 62 },
        { month: 'Sep', value: 65 },
      ],
    },
    {
      name: 'SQL',
      demand: 63,
      trend: '+5.2%',
      momentum: 'stable' as const,
      category: 'Database',
      urgency: 'MODERATE' as const,
      pairedSkills: ['PostgreSQL', 'MySQL', 'Python', 'Tableau'],
      roles: ['Data Analyst', 'Backend Engineer', 'Data Scientist'],
      history: [
        { month: 'Apr', value: 60 },
        { month: 'May', value: 61 },
        { month: 'Jun', value: 61 },
        { month: 'Jul', value: 62 },
        { month: 'Aug', value: 62 },
        { month: 'Sep', value: 63 },
      ],
    },
    {
      name: 'Docker',
      demand: 58,
      trend: '+22.1%',
      momentum: 'accelerating' as const,
      category: 'DevOps & Containers',
      urgency: 'HIGH' as const,
      pairedSkills: ['Kubernetes', 'CI/CD', 'AWS', 'Linux'],
      roles: ['DevOps Engineer', 'Cloud Engineer', 'Full Stack Developer'],
      history: [
        { month: 'Apr', value: 46 },
        { month: 'May', value: 49 },
        { month: 'Jun', value: 52 },
        { month: 'Jul', value: 54 },
        { month: 'Aug', value: 56 },
        { month: 'Sep', value: 58 },
      ],
    },
    {
      name: 'Node.js',
      demand: 56,
      trend: '+16.8%',
      momentum: 'accelerating' as const,
      category: 'Backend',
      urgency: 'MODERATE' as const,
      pairedSkills: ['Express', 'TypeScript', 'MongoDB', 'PostgreSQL'],
      roles: ['Backend Engineer', 'Full Stack Developer', 'API Specialist'],
      history: [
        { month: 'Apr', value: 48 },
        { month: 'May', value: 50 },
        { month: 'Jun', value: 52 },
        { month: 'Jul', value: 53 },
        { month: 'Aug', value: 55 },
        { month: 'Sep', value: 56 },
      ],
    },
  ],

  emergingSkills: [
    { name: 'Kubernetes', trend: '+42.3%', category: 'DevOps', impact: 'High Enterprise Migration', horizon: 'Immediate' },
    { name: 'GraphQL', trend: '+38.1%', category: 'Backend', impact: 'Microservice Gateway Standard', horizon: 'Immediate' },
    { name: 'Rust', trend: '+35.7%', category: 'Systems', impact: 'High Performance & Memory Safety', horizon: '6-12 Months' },
    { name: 'Go (Golang)', trend: '+32.4%', category: 'Backend', impact: 'Cloud Native Microservices', horizon: 'Immediate' },
    { name: 'Vector DBs (Pinecone/Milvus)', trend: '+68.5%', category: 'AI Infrastructure', impact: 'RAG & Semantic Retrieval', horizon: 'Emerging' },
    { name: 'LangChain & Agentic LLMs', trend: '+84.2%', category: 'AI Systems', impact: 'Autonomous Workflow Automation', horizon: 'Explosive' },
  ],

  compensationRanges: {
    softwareEngineer: {
      junior: '₹4.5L - ₹7.5L',
      mid: '₹8.5L - ₹15L',
      senior: '₹17L - ₹28L+',
    },
    dataScientist: {
      junior: '₹5.0L - ₹8.5L',
      mid: '₹9.5L - ₹17L',
      senior: '₹18L - ₹32L+',
    },
    cloudEngineer: {
      junior: '₹5.0L - ₹8.0L',
      mid: '₹9.0L - ₹16L',
      senior: '₹18L - ₹30L+',
    },
    fullStackDeveloper: {
      junior: '₹4.5L - ₹7.5L',
      mid: '₹8.5L - ₹15L',
      senior: '₹16L - ₹27L+',
    },
  },

  locationDemand: [
    { location: 'Bangalore', jobs: 28450, trend: '+12.3%', share: '32%' },
    { location: 'Hyderabad', jobs: 19230, trend: '+18.4%', share: '22%' },
    { location: 'Mumbai', jobs: 15680, trend: '+8.2%', share: '18%' },
    { location: 'Pune', jobs: 12340, trend: '+14.6%', share: '14%' },
    { location: 'Delhi NCR', jobs: 11290, trend: '+9.7%', share: '13%' },
    { location: 'Remote / Anywhere', jobs: 21400, trend: '+29.5%', share: '24%' },
  ],

  industryBreakdown: [
    { industry: 'FinTech & Banking', percentage: 28, growth: '+19%' },
    { industry: 'AI & Enterprise SaaS', percentage: 26, growth: '+34%' },
    { industry: 'HealthTech & Bio', percentage: 16, growth: '+22%' },
    { industry: 'E-Commerce & Supply', percentage: 15, growth: '+8%' },
    { industry: 'EdTech & Training', percentage: 15, growth: '+12%' },
  ],

  skillTrends: [
    { month: 'Jan', value: 45 },
    { month: 'Feb', value: 52 },
    { month: 'Mar', value: 58 },
    { month: 'Apr', value: 63 },
    { month: 'May', value: 71 },
    { month: 'Jun', value: 68 },
    { month: 'Jul', value: 75 },
    { month: 'Aug', value: 82 },
    { month: 'Sep', value: 88 },
  ],
}

// ----------------------------------------------------
// CANDIDATE PROFILE & VERIFIED SCORE
// ----------------------------------------------------

export type CandidateProfile = typeof mockCandidate

export const mockCandidate = {
  id: 'CANDIDATE-001',
  codeName: 'OPERATIVE-RAHUL',
  name: 'Rahul Sharma',
  avatarUrl: '',
  title: 'Lead Full Stack Architect & Tech Lead',
  bio: 'Staff/Principal level engineer specialized in distributed systems, real-time reactive architectures, and cloud-native scalable microservices. Passionate about system latency, developer ergonomics, and high-concurrency event loops.',
  email: 'rahul@example.com',
  phone: '+91 98765 43210',
  profileStatus: 'VERIFIED',
  clearanceLevel: 'LEVEL 4 // SENIOR FULL STACK',
  targetRole: 'Full Stack Developer',
  secondaryRole: 'Cloud Solutions Architect',
  experience: '4.0 years',
  location: 'Bangalore, India (Open to Remote)',
  lastAssessment: '2026-09-24',
  roleReadiness: 84,

  compensation: {
    currentCtc: '₹22 LPA',
    expectedCtc: '₹34 - 40 LPA',
    noticePeriod: '30 Days',
    workPolicy: 'Remote / Hybrid',
    currency: 'INR',
  },

  socialLinks: {
    github: 'https://github.com/rahulsharma',
    linkedin: 'https://linkedin.com/in/rahulsharma-dev',
    website: 'https://rahulsharma.dev',
    leetcode: 'https://leetcode.com/rahul_code',
  },

  assessment: {
    score: 8.4,
    category: 'EXCEPTIONAL OPERATIVE',
    completedAt: '2026-09-24',
    integrity: 'VERIFIED // ZERO ANOMALIES',
    percentile: 'Top 5% of Market',
    proctorSignals: {
      tabSwitches: 0,
      focusRate: '99.8%',
      cameraSession: 'CONSENTED // CONFIRMED',
    },
  },

  skills: [
    { name: 'JavaScript', score: 8.4, market: 9.0, gap: -0.6, tier: 'strength' },
    { name: 'React', score: 7.8, market: 8.5, gap: -0.7, tier: 'high' },
    { name: 'SQL', score: 8.9, market: 8.0, gap: 0.9, tier: 'strength' },
    { name: 'Node.js', score: 7.2, market: 8.0, gap: -0.8, tier: 'high' },
    { name: 'Rust', score: 7.5, market: 7.0, gap: 0.5, tier: 'strength' },
    { name: 'TypeScript', score: 6.5, market: 8.2, gap: -1.7, tier: 'critical' },
    { name: 'Docker', score: 4.5, market: 7.0, gap: -2.5, tier: 'critical' },
    { name: 'AWS', score: 3.5, market: 7.5, gap: -4.0, tier: 'critical' },
  ],

  projects: [
    {
      title: 'Distributed Real-Time Task Mesh',
      tech: ['React', 'Node.js', 'Socket.io', 'Redis'],
      metric: 'Handled 50K concurrent state updates with <35ms latency',
      link: 'github.com/rahul/task-mesh',
    },
    {
      title: 'High-Throughput Order Ingestion API',
      tech: ['TypeScript', 'Express', 'PostgreSQL', 'Docker'],
      metric: 'Passed ACID stress-test at 12,000 req/sec',
      link: 'github.com/rahul/order-pipeline',
    },
    {
      title: 'Autonomous Telemetry Anomaly Guard',
      tech: ['Node.js', 'Fastify', 'AWS Lambda'],
      metric: 'Decreased production incident triage time by 44%',
      link: 'github.com/rahul/anomaly-guard',
    },
  ],

  certifications: [
    { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2025-11', status: 'ACTIVE' },
    { name: 'Meta Advanced React Architecture', issuer: 'Meta / Coursera', date: '2025-06', status: 'VERIFIED' },
    { name: 'Docker Container Systems Specialist', issuer: 'Linux Foundation', date: '2025-01', status: 'VERIFIED' },
  ],

  education: [
    { degree: 'B.Tech in Computer Science & Engineering', school: 'Chandigarh University', year: '2021', gpa: '8.5 / 10' },
  ],
}

export const mockCandidatePriya = {
  id: 'CANDIDATE-002',
  codeName: 'OPERATIVE-PRIYA',
  name: 'Priya Patel',
  avatarUrl: '',
  title: 'Data Scientist | ML Engineer',
  bio: 'Applied AI researcher and Machine Learning engineer focusing on LLM latency distillation, deep neural networks, and scalable feature stores for fintech telemetry.',
  email: 'priya@example.com',
  phone: '+91 91234 56789',
  profileStatus: 'VERIFIED',
  clearanceLevel: 'LEVEL 4 // APPLIED AI SPECIALIST',
  targetRole: 'Data Scientist & ML Engineer',
  secondaryRole: 'AI Research Engineer',
  experience: '3.5 years',
  location: 'Mumbai, India (Open to Remote)',
  lastAssessment: '2026-09-24',
  roleReadiness: 88,

  compensation: {
    currentCtc: '₹20 LPA',
    expectedCtc: '₹30 - 36 LPA',
    noticePeriod: '15 Days (Immediate)',
    workPolicy: 'Remote / Hybrid',
    currency: 'INR',
  },

  socialLinks: {
    github: 'https://github.com/priyapatel-ai',
    linkedin: 'https://linkedin.com/in/priyapatel-ml',
    website: 'https://priyapatel.ai',
    leetcode: 'https://leetcode.com/priya_ml',
  },

  assessment: {
    score: 8.8,
    category: 'EXCEPTIONAL OPERATIVE',
    completedAt: '2026-09-24',
    integrity: 'VERIFIED // ZERO ANOMALIES',
    percentile: 'Top 3% of Market',
    proctorSignals: {
      tabSwitches: 0,
      focusRate: '100%',
      cameraSession: 'CONSENTED // CONFIRMED',
    },
  },

  skills: [
    { name: 'Python', score: 9.2, market: 9.0, gap: 0.2, tier: 'strength' },
    { name: 'Machine Learning', score: 8.1, market: 8.5, gap: -0.4, tier: 'high' },
    { name: 'SQL', score: 7.8, market: 8.0, gap: -0.2, tier: 'strength' },
    { name: 'TensorFlow', score: 7.0, market: 7.5, gap: -0.5, tier: 'high' },
    { name: 'PyTorch', score: 8.4, market: 8.0, gap: 0.4, tier: 'strength' },
    { name: 'FastAPI', score: 7.6, market: 7.5, gap: 0.1, tier: 'strength' },
  ],

  projects: [
    {
      title: 'Neural Transformer Latency Optimization',
      tech: ['Python', 'PyTorch', 'TensorFlow', 'CUDA'],
      metric: 'Reduced inference latency by 62% on edge GPUs',
      link: 'github.com/priya/neural-opt',
    },
    {
      title: 'Real-Time Fraud Telemetry Classifier',
      tech: ['Python', 'FastAPI', 'PostgreSQL', 'Scikit-learn'],
      metric: 'Achieved 99.4% ROC-AUC across 1M transactions/day',
      link: 'github.com/priya/fraud-detect',
    },
    {
      title: 'Labor Economics Predictive Model',
      tech: ['Python', 'Pandas', 'XGBoost', 'Docker'],
      metric: 'Forecasting skill shortage anomalies with 91% accuracy',
      link: 'github.com/priya/labor-forecast',
    },
  ],

  certifications: [
    { name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', date: '2025-08', status: 'VERIFIED' },
    { name: 'TensorFlow Developer Certificate', issuer: 'Google', date: '2025-02', status: 'VERIFIED' },
  ],

  education: [
    { degree: 'M.Sc. in Data Science & Artificial Intelligence', school: 'University of Mumbai', year: '2022', gpa: '9.0 / 10' },
  ],
}

// ----------------------------------------------------
// AI JOB FINDER & JOBS
// ----------------------------------------------------

export interface JobListing {
  id: string
  title: string
  company: string
  companyTier: string
  location: string
  type: string
  remote: string
  salary: string
  matchScore: number
  category: 'Immediate-Fit' | 'Growth-Fit'
  matchBreakdown: {
    skillMatch: number
    experienceMatch: number
    roleMatch: number
    locationMatch: number
  }
  requiredSkills: string[]
  preferredSkills: string[]
  description: string
  postedDate: string
  responsibilities: string[]
  benefits: string[]
}

export const mockJobs: JobListing[] = [
  {
    id: 'JOB-LC-001',
    title: 'Senior Full Stack Developer',
    company: 'TechCorp India',
    companyTier: 'Enterprise SaaS // Series D',
    location: 'Bangalore, India',
    type: 'Full-time',
    remote: 'Hybrid (2 days remote)',
    salary: '₹18L - ₹24L',
    matchScore: 89,
    category: 'Immediate-Fit',
    matchBreakdown: {
      skillMatch: 92,
      experienceMatch: 86,
      roleMatch: 90,
      locationMatch: 95,
    },
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
    preferredSkills: ['TypeScript', 'Docker', 'AWS'],
    description: 'We are seeking a high-caliber Full Stack Developer to lead development of our distributed talent orchestration pipeline. You will architect low-latency backend microservices and modern React interfaces.',
    postedDate: '2026-09-22',
    responsibilities: [
      'Design modular microservices processing real-time telemetry datasets',
      'Construct high-performance UI components in React and TypeScript',
      'Partner with DevOps engineers to containerize and deploy microservices',
    ],
    benefits: ['Comprehensive Health Coverage', 'Equity Share Scheme', 'Home Office Allowance', 'Annual Upskill Stipend'],
  },
  {
    id: 'JOB-LC-002',
    title: 'Cloud Full Stack Architect',
    company: 'Nexus Distributed Networks',
    companyTier: 'Cloud Infrastructure Provider',
    location: 'Hyderabad, India',
    type: 'Full-time',
    remote: '100% Remote',
    salary: '₹22L - ₹30L',
    matchScore: 78,
    category: 'Growth-Fit',
    matchBreakdown: {
      skillMatch: 74,
      experienceMatch: 82,
      roleMatch: 85,
      locationMatch: 100,
    },
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
    preferredSkills: ['Kubernetes', 'Terraform', 'GraphQL'],
    description: 'Lead engineering initiatives building multi-cloud deployment automation tools. Demands strong grasp of cloud architecture and containerized systems.',
    postedDate: '2026-09-20',
    responsibilities: [
      'Architect serverless and containerized deployment infrastructure on AWS',
      'Close technical gaps between frontend interfaces and multi-cloud APIs',
      'Mentor intermediate engineers across distributed development sprints',
    ],
    benefits: ['Remote Workspace Allowance', 'Flexible Working Hours', 'Conference & Research Travel', 'Generous Bonus Pool'],
  },
  {
    id: 'JOB-LC-003',
    title: 'Lead Frontend Engineer (Next.js & Design Systems)',
    company: 'Aether Financial Systems',
    companyTier: 'FinTech Platform // Global',
    location: 'Mumbai, India',
    type: 'Full-time',
    remote: 'Hybrid',
    salary: '₹19L - ₹26L',
    matchScore: 86,
    category: 'Immediate-Fit',
    matchBreakdown: {
      skillMatch: 94,
      experienceMatch: 80,
      roleMatch: 88,
      locationMatch: 85,
    },
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Git', 'SQL'],
    preferredSkills: ['Next.js', 'Design Systems', 'Web Performance'],
    description: 'Build mission-critical trading workstations and asset monitoring dashboards with sub-second responsiveness.',
    postedDate: '2026-09-23',
    responsibilities: [
      'Author highly reusable component libraries under strict design token constraints',
      'Optimize web vitals, canvas rendering pipelines, and state synchronization',
    ],
    benefits: ['Annual Performance Bonus', 'Premium Medical Cover', 'Subsidized Tech Hardware'],
  },
  {
    id: 'JOB-LC-004',
    title: 'Platform DevOps & Container Engineer',
    company: 'Helios Cybernetics',
    companyTier: 'AI Hardware & Platform',
    location: 'Pune, India',
    type: 'Full-time',
    remote: 'Hybrid',
    salary: '₹17L - ₹23L',
    matchScore: 68,
    category: 'Growth-Fit',
    matchBreakdown: {
      skillMatch: 62,
      experienceMatch: 75,
      roleMatch: 72,
      locationMatch: 90,
    },
    requiredSkills: ['Docker', 'AWS', 'Git', 'Linux'],
    preferredSkills: ['Kubernetes', 'Helm', 'Prometheus', 'ArgoCD'],
    description: 'Maintain 99.99% uptime for AI model training clusters and orchestrate automated CI/CD deployment pipelines.',
    postedDate: '2026-09-18',
    responsibilities: [
      'Maintain automated Kubernetes workload clusters on AWS',
      'Implement observability, alerting, and automated failover protocols',
    ],
    benefits: ['Stock Options', 'Relocation Assistance', 'Onsite Gym & Meals'],
  },
  {
    id: 'JOB-LC-005',
    title: 'AI Full Stack Application Specialist',
    company: 'Cognitive Matrix Labs',
    companyTier: 'Frontier AI Research Lab',
    location: 'Bangalore, India',
    type: 'Full-time',
    remote: 'Hybrid',
    salary: '₹24L - ₹35L',
    matchScore: 75,
    category: 'Growth-Fit',
    matchBreakdown: {
      skillMatch: 71,
      experienceMatch: 84,
      roleMatch: 80,
      locationMatch: 95,
    },
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'SQL'],
    preferredSkills: ['Python', 'LangChain', 'Vector DBs', 'RAG Architectures'],
    description: 'Develop agentic user experiences interfacing with frontier AI models for Fortune 500 decision intelligence.',
    postedDate: '2026-09-24',
    responsibilities: [
      'Implement streaming token UX, canvas interactions, and multi-agent visualization',
      'Build evaluation pipelines comparing model outputs with ground-truth benchmarks',
    ],
    benefits: ['Uncapped Vacation Policy', 'Top-tier Compute Access', 'Co-authorship on Industry Research'],
  },
]

// ----------------------------------------------------
// EMPLOYER & TALENT VAULT DATA
// ----------------------------------------------------

export const mockEmployer = {
  id: 'EMP-ROZ-001',
  name: 'TechCorp India',
  size: 'Enterprise (850+ employees)',
  industry: 'Software & Intelligent Systems',
  totalEmployees: 850,
  hiringPlans: '45 Open Headcount across Q4',
  hiringDifficultyIndex: 'HIGH // CLOUD & AI SPECIALISTS',
  averageTimeToHire: '38 Days',

  currentWorkforce: [
    { skill: 'JavaScript', availability: 82, target: 88, gap: -6 },
    { skill: 'Python', availability: 64, target: 82, gap: -18 },
    { skill: 'AWS', availability: 47, target: 80, gap: -33 },
    { skill: 'Kubernetes', availability: 28, target: 70, gap: -42 },
    { skill: 'AI/ML Engineering', availability: 35, target: 75, gap: -40 },
    { skill: 'TypeScript', availability: 68, target: 90, gap: -22 },
  ],

  futureRequirement: [
    { skill: 'JavaScript', requirement: 88 },
    { skill: 'Python', requirement: 82 },
    { skill: 'AWS', requirement: 80 },
    { skill: 'Kubernetes', requirement: 70 },
    { skill: 'AI/ML Engineering', requirement: 75 },
    { skill: 'TypeScript', requirement: 90 },
  ],

  workforceGaps: [
    {
      area: 'Cloud Infrastructure & Kubernetes',
      severity: 'CRITICAL',
      currentScore: 38,
      requiredScore: 82,
      deficit: -44,
      action: 'Hire 6 Senior DevOps + Enroll 18 Internal Engineers in Resistance Sprint',
    },
    {
      area: 'Agentic AI & LLM Systems',
      severity: 'CRITICAL',
      currentScore: 35,
      requiredScore: 78,
      deficit: -43,
      action: 'Launch 4-week internal heist cohort + Partner with Research Lab',
    },
    {
      area: 'TypeScript Production Rigor',
      severity: 'MODERATE',
      currentScore: 68,
      requiredScore: 90,
      deficit: -22,
      action: 'Mandate strict compiler rules + Codebase migration sprint',
    },
  ],
}

export interface TalentCandidate {
  id: string
  codeName: string
  name: string
  targetRole: string
  experience: string
  location: string
  readinessScore: number
  verifiedStatus: string
  expectedSalary: string
  availability: string
  topSkills: { name: string; score: number }[]
  highlights: string
}

export const mockTalentVaultCandidates: TalentCandidate[] = [
  {
    id: 'TAL-001',
    codeName: 'OPERATIVE-ALEX',
    name: 'Alex Rivera',
    targetRole: 'Full Stack Developer',
    experience: '3.5 yrs',
    location: 'Bangalore (Open Remote)',
    readinessScore: 87,
    verifiedStatus: 'VERIFIED // LEVEL 4',
    expectedSalary: '₹18L - ₹22L',
    availability: 'Immediate (15 Days)',
    topSkills: [
      { name: 'React', score: 8.5 },
      { name: 'Node.js', score: 8.0 },
      { name: 'SQL', score: 8.2 },
      { name: 'TypeScript', score: 7.2 },
    ],
    highlights: 'Strong API scaling experience; architected 50K concurrent connection real-time mesh.',
  },
  {
    id: 'TAL-002',
    codeName: 'OPERATIVE-ANANYA',
    name: 'Ananya Deshmukh',
    targetRole: 'Cloud Solutions Architect',
    experience: '5.0 yrs',
    location: 'Hyderabad, India',
    readinessScore: 94,
    verifiedStatus: 'VERIFIED // LEVEL 5',
    expectedSalary: '₹26L - ₹32L',
    availability: '30 Days Notice',
    topSkills: [
      { name: 'AWS', score: 9.5 },
      { name: 'Kubernetes', score: 9.1 },
      { name: 'Terraform', score: 9.0 },
      { name: 'Go', score: 8.4 },
    ],
    highlights: 'CKA Certified; migrated 120-node Kubernetes cluster with zero unplanned downtime.',
  },
  {
    id: 'TAL-003',
    codeName: 'OPERATIVE-VIKRAM',
    name: 'Vikram Malhotra',
    targetRole: 'AI & Data Systems Engineer',
    experience: '4.0 yrs',
    location: 'Remote // India',
    readinessScore: 91,
    verifiedStatus: 'VERIFIED // LEVEL 4',
    expectedSalary: '₹24L - ₹29L',
    availability: 'Immediate',
    topSkills: [
      { name: 'Python', score: 9.6 },
      { name: 'PyTorch', score: 9.0 },
      { name: 'FastAPI', score: 8.8 },
      { name: 'PostgreSQL', score: 8.4 },
    ],
    highlights: 'Published author in NeurIPS workshop on lightweight attention distillation.',
  },
  {
    id: 'TAL-004',
    codeName: 'OPERATIVE-PRIYA',
    name: 'Priya Sharma',
    targetRole: 'Senior Frontend Engineer',
    experience: '4.5 yrs',
    location: 'Mumbai, India',
    readinessScore: 89,
    verifiedStatus: 'VERIFIED // LEVEL 4',
    expectedSalary: '₹20L - ₹25L',
    availability: 'Immediate',
    topSkills: [
      { name: 'React', score: 9.4 },
      { name: 'TypeScript', score: 9.2 },
      { name: 'Next.js', score: 8.9 },
      { name: 'Tailwind CSS', score: 9.5 },
    ],
    highlights: 'Design system maintainer for 40+ fintech apps; web vitals specialist.',
  },
  {
    id: 'TAL-005',
    codeName: 'OPERATIVE-TARIQ',
    name: 'Tariq Al-Mansoor',
    targetRole: 'DevOps & Reliability Engineer',
    experience: '3.0 yrs',
    location: 'Pune, India',
    readinessScore: 82,
    verifiedStatus: 'VERIFIED // LEVEL 3',
    expectedSalary: '₹16L - ₹20L',
    availability: '15 Days Notice',
    topSkills: [
      { name: 'Docker', score: 8.8 },
      { name: 'CI/CD Pipelines', score: 8.5 },
      { name: 'Linux', score: 8.9 },
      { name: 'AWS', score: 7.9 },
    ],
    highlights: 'Automated blue/green deployment strategy reducing production release windows from 2 hrs to 6 mins.',
  },
  {
    id: 'TAL-006',
    codeName: 'OPERATIVE-SOFIA',
    name: 'Sofia Lindqvist',
    targetRole: 'Lead Product Manager (Technical)',
    experience: '6.0 yrs',
    location: 'Delhi NCR, India',
    readinessScore: 92,
    verifiedStatus: 'VERIFIED // LEVEL 5',
    expectedSalary: '₹28L - ₹36L',
    availability: '30 Days Notice',
    topSkills: [
      { name: 'Product Analytics', score: 9.4 },
      { name: 'System Design', score: 8.8 },
      { name: 'User Research', score: 9.2 },
      { name: 'A/B Testing', score: 9.0 },
    ],
    highlights: 'Scaled B2B developer tool from ₹1 Cr to ₹14 Cr ARR through data-driven product telemetry.',
  },
]

// ----------------------------------------------------
// SECURE SKILL ASSESSMENT DATA
// ----------------------------------------------------

export interface AssessmentQuestion {
  id: string
  question: string
  codeSnippet?: string
  options: string[]
  correct: number
  skill: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  explanation: string
}

export const mockAssessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'Q001',
    question: 'What is the exact evaluation order and output of the following asynchronous code block in Node.js event loop?',
    codeSnippet: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
process.nextTick(() => console.log('4'));
console.log('5');`,
    options: [
      '1, 5, 4, 3, 2',
      '1, 5, 3, 4, 2',
      '1, 4, 3, 2, 5',
      '1, 5, 2, 4, 3',
    ],
    correct: 0,
    skill: 'JavaScript / Node.js Engine',
    difficulty: 'HARD',
    explanation: 'Synchronous statements run first (1, 5). NextTickQueue fires next (4), followed by Microtask queue (3), and lastly Macrotask Timer queue (2).',
  },
  {
    id: 'Q002',
    question: 'In TypeScript, which utility type extracts all keys of type T whose values are assignable to type V?',
    codeSnippet: `type KeysMatching<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T];`,
    options: [
      'Conditioned mapped type indexing over keyof T',
      'Conditional Pick with Record<string, any>',
      'Omit<T, keyof V>',
      'Extract<keyof T, keyof V>',
    ],
    correct: 0,
    skill: 'TypeScript Advanced Types',
    difficulty: 'MEDIUM',
    explanation: 'The mapped type evaluates each property; filtering with [keyof T] extracts the non-never keys.',
  },
  {
    id: 'Q003',
    question: 'When designing a distributed rate limiter for high-traffic endpoints (100k+ req/sec), which algorithmic architecture minimizes Redis locking contention while avoiding boundary burst anomalies?',
    options: [
      'Sliding Window Log with Redis sorted set (ZADD/ZREMRANGEBYSCORE)',
      'Sliding Window Counter using a Lua script with two hashed intervals',
      'Simple Fixed Window Counter using INCR and EXPIRE',
      'Client-side token bucket without centralized synchronization',
    ],
    correct: 1,
    skill: 'System Design',
    difficulty: 'HARD',
    explanation: 'A sliding window counter implemented via atomic Lua scripting combines memory efficiency with protection against boundary-window bursts.',
  },
  {
    id: 'Q004',
    question: 'In React 18 concurrent mode, what happens if a component renders using a state update scheduled with useTransition during an expensive rendering calculation?',
    options: [
      'The transition update is marked non-urgent and React yields execution to high-priority interactions like keyboard typing',
      'The browser completely freezes until the component tree is reconciled',
      'React falls back to synchronous rendering without yielding',
      'The update is discarded unless wrapped in flushSync',
    ],
    correct: 0,
    skill: 'React Internal Architecture',
    difficulty: 'MEDIUM',
    explanation: 'useTransition marks state updates as non-urgent transitions, enabling interruption by user input events.',
  },
  {
    id: 'Q005',
    question: 'Which Dockerfile directive ensures that microservice processes run without root privileges in production Kubernetes pods?',
    codeSnippet: `RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser`,
    options: [
      'USER appuser',
      'EXPOSE 8080',
      'CMD ["node", "server.js"]',
      'WORKDIR /usr/src/app',
    ],
    correct: 0,
    skill: 'Docker & Container Security',
    difficulty: 'EASY',
    explanation: 'The USER directive switches the execution context to non-root, preventing root escalation inside containers.',
  },
  {
    id: 'Q006',
    question: 'Given a composite B-Tree index on (tenant_id, status, created_at), which of the following SQL queries will CANNOT fully utilize the index for filtering and sorting without a separate sort pass?',
    options: [
      'WHERE tenant_id = 42 AND status = "ACTIVE" ORDER BY created_at DESC',
      'WHERE tenant_id = 42 ORDER BY created_at DESC',
      'WHERE tenant_id = 42 AND status IN ("ACTIVE", "PENDING")',
      'WHERE tenant_id = 42 AND status = "ACTIVE" AND created_at > "2026-01-01"',
    ],
    correct: 1,
    skill: 'Database Indexing & Performance',
    difficulty: 'HARD',
    explanation: 'Skipping the middle indexed column (status) in the composite index breaks the B-Tree sort ordering for created_at, forcing an extra filesort.',
  },
  {
    id: 'Q007',
    question: 'Which strategy best mitigates the "Thundering Herd" (Cache Stampede) problem when a hot cache key expires across millions of concurrent users?',
    options: [
      'Probabilistic early expiration (XFetch algorithm) combined with distributed mutex locking (singleflight)',
      'Setting cache TTL to infinity and never expiring keys',
      'Directly proxying all cache misses to the primary SQL database without caching',
      'Increasing memory allocation on all read replicas without query deduplication',
    ],
    correct: 0,
    skill: 'Distributed Caching',
    difficulty: 'HARD',
    explanation: 'Probabilistic early recomputation (XFetch) alongside a mutex lock (singleflight pattern) ensures only one worker regenerates the cache before expiration.',
  },
  {
    id: 'Q008',
    question: 'How does HTTP/3 overcome the TCP Head-of-Line (HoL) blocking problem present in HTTP/2 multiplexing?',
    options: [
      'By running over QUIC on top of UDP with independent per-stream loss recovery',
      'By opening multiple separate TCP connections per HTTP stream',
      'By disabling packet encryption in TLS 1.3 to speed up ACKs',
      'By caching all static assets inside the operating system socket buffer',
    ],
    correct: 0,
    skill: 'Networking Protocols',
    difficulty: 'MEDIUM',
    explanation: 'HTTP/3 uses QUIC over UDP; packet drops on one stream only stall that individual stream without blocking unrelated multiplexed streams.',
  },
  {
    id: 'Q009',
    question: 'In distributed microservice transactions, which architectural pattern provides eventual consistency across independent databases without two-phase commit (2PC) locking bottlenecks?',
    options: [
      'Saga Pattern with Orchestration or Choreography and Compensating Transactions',
      'Strict Two-Phase Locking (2PL) across all RPC nodes',
      'Shared monolithic relational database for all services',
      'Synchronous REST chaining with rollback headers',
    ],
    correct: 0,
    skill: 'Microservices Architecture',
    difficulty: 'MEDIUM',
    explanation: 'The Saga pattern executes a series of local transactions coordinated by events or orchestrators, using compensating transactions to handle rollbacks.',
  },
  {
    id: 'Q010',
    question: 'In modern browser rendering engines, why is animating CSS `transform: translate3d()` significantly more performant than animating `top` / `left`?',
    options: [
      'Transform animations run on the GPU Compositor thread without triggering Layout (Reflow) or Paint phases',
      'Transform directly updates the DOM tree synchronously on the main thread',
      'Top and left values are deprecated in HTML5 specifications',
      'Transform skips all JavaScript garbage collection passes',
    ],
    correct: 0,
    skill: 'Frontend Performance & Engine Mechanics',
    difficulty: 'EASY',
    explanation: 'Transform and opacity properties are handled on the compositor thread, completely bypassing expensive recalculate style, layout, and repaint cycles.',
  },
  {
    id: 'Q011',
    question: 'Which cookie configuration flag configuration provides the strongest defense against Cross-Site Request Forgery (CSRF) for state-changing POST requests?',
    options: [
      'SameSite=Strict; Secure; HttpOnly',
      'SameSite=None; Secure',
      'Domain=.com; Path=/',
      'HttpOnly only without SameSite or Secure attributes',
    ],
    correct: 0,
    skill: 'Web Security & Authentication',
    difficulty: 'EASY',
    explanation: 'SameSite=Strict stops the browser from sending the cookie on any cross-site request context, while Secure enforces HTTPS and HttpOnly blocks XSS theft.',
  },
  {
    id: 'Q012',
    question: 'How does Python handle memory reclamation when circular object references exist that cannot be freed by standard reference counting alone?',
    options: [
      'A cyclic generational garbage collector (gc module) detects unreachable reference cycles using double-linked object tracking',
      'Python crashes with a MemoryError immediately',
      'Circular references are automatically converted to weak references at compile time',
      'The operating system virtual memory manager terminates the process after 60 seconds',
    ],
    correct: 0,
    skill: 'Python Internals & Memory',
    difficulty: 'MEDIUM',
    explanation: 'Python supplements reference counting with a cyclic generational garbage collector (generations 0, 1, 2) that isolates and sweeps unreachable reference islands.',
  },
  {
    id: 'Q013',
    question: 'In Git internal architecture, what fundamental object represents a snapshot of directory contents and filenames mapped to SHA-1 hashes?',
    options: [
      'Tree object',
      'Blob object',
      'Commit object',
      'Annotated Tag object',
    ],
    correct: 0,
    skill: 'Git Internals & Version Control',
    difficulty: 'MEDIUM',
    explanation: 'In Git, Blobs store raw file content, while Tree objects store directory structures, filenames, and permissions pointing to Blobs and subtrees.',
  },
  {
    id: 'Q014',
    question: 'Which algorithm is used to determine a valid compilation order for modules with acyclic dependencies, and what is its time complexity with V vertices and E edges?',
    options: [
      'Topological Sort using Kahn’s Algorithm or DFS with O(V + E) complexity',
      'Dijkstra’s Algorithm with O((V + E) log V)',
      'Floyd-Warshall Algorithm with O(V^3)',
      'Kruskal’s Minimum Spanning Tree with O(E log V)',
    ],
    correct: 0,
    skill: 'Algorithms & Data Structures',
    difficulty: 'MEDIUM',
    explanation: 'Topological sort orders Directed Acyclic Graphs (DAGs) linearly in O(V + E) time by tracking in-degrees or post-order DFS traversals.',
  },
  {
    id: 'Q015',
    question: 'Why is Linux `epoll` scalable to tens of thousands of concurrent network connections (C10K problem) whereas `select` degrades significantly?',
    options: [
      'epoll uses an event-driven callback mechanism with O(1) active event retrieval, whereas select requires scanning all O(N) file descriptors every call',
      'select is limited to UDP sockets while epoll only operates on Unix domain pipes',
      'epoll executes in user-space threads without kernel context transitions',
      'epoll automatically compresses network payloads at the socket layer',
    ],
    correct: 0,
    skill: 'Linux Systems & Network I/O',
    difficulty: 'HARD',
    explanation: 'epoll registers interests in kernel space using an rbtree and returns only active ready descriptors via a ready list in O(1) time per event, unlike select O(N) linear polling.',
  },
  {
    id: 'Q016',
    question: 'Under the PACELC theorem, if a distributed database is partitioned (P), it trades off Availability (A) and Consistency (C). ELSE (E), when running normally, what trade-off must it make?',
    options: [
      'Latency (L) versus Consistency (C)',
      'Durability (D) versus Atomicity (A)',
      'Throughput (T) versus Security (S)',
      'Bandwidth (B) versus Memory (M)',
    ],
    correct: 0,
    skill: 'Distributed Systems Theory',
    difficulty: 'MEDIUM',
    explanation: 'PACELC states: if Partition (P) -> choose Availability (A) or Consistency (C); Else (E) -> choose Latency (L) or Consistency (C).',
  },
  {
    id: 'Q017',
    question: 'Why is Proof Key for Code Exchange (PKCE) mandatory for Single Page Applications (SPAs) executing the OAuth 2.0 Authorization Code flow?',
    options: [
      'SPAs cannot securely protect a static client_secret in browser code; PKCE uses a dynamically generated code_verifier and code_challenge',
      'PKCE encrypts the entire JSON Web Token inside the user’s LocalStorage',
      'PKCE replaces TLS certificates with client-side RSA keys',
      'Without PKCE, browsers block all cross-origin XMLHttpRequest calls',
    ],
    correct: 0,
    skill: 'OAuth 2.0 Security',
    difficulty: 'MEDIUM',
    explanation: 'Public clients (SPAs/mobile) cannot keep client secrets safe. PKCE ensures that only the client instance that initiated the request can exchange the authorization code.',
  },
  {
    id: 'Q018',
    question: 'In Kubernetes, what is the fundamental difference between a `livenessProbe` and a `readinessProbe`?',
    options: [
      'Failure of a livenessProbe causes kubelet to restart the container; failure of a readinessProbe isolates the pod from Service endpoint traffic',
      'Failure of a readinessProbe terminates the entire worker node',
      'Liveness probes only test HTTP endpoints, while readiness probes test TCP sockets',
      'Readiness probes run once on container boot, while liveness probes run only on shutdown',
    ],
    correct: 0,
    skill: 'Kubernetes Cloud Architecture',
    difficulty: 'EASY',
    explanation: 'Liveness probes reboot unhealthy/deadlocked containers, while readiness probes prevent traffic routing to pods that are temporarily warming up or overloaded.',
  },
  {
    id: 'Q019',
    question: 'In Apache Kafka, what condition triggers a consumer group partition rebalance?',
    options: [
      'A consumer joins or leaves the group, or the partition count of a subscribed topic changes',
      'Whenever any message is produced with an empty key',
      'When broker disk utilization reaches 80%',
      'Every 60 seconds regardless of cluster topology',
    ],
    correct: 0,
    skill: 'Event Streaming & Kafka',
    difficulty: 'MEDIUM',
    explanation: 'Kafka consumer groups rebalance partition ownership whenever group membership changes (crashes/joins) or topic partition metadata changes.',
  },
  {
    id: 'Q020',
    question: 'When architecting real-time server-to-client updates for financial tickers, why is Server-Sent Events (SSE) often preferred over WebSockets for simple streaming dashboards?',
    options: [
      'SSE operates over standard HTTP/2, supports automatic reconnection with Last-Event-ID, and is unidirectional, eliminating duplex overhead',
      'SSE supports binary TCP audio/video streaming that WebSockets cannot handle',
      'SSE bypasses all corporate firewall inspections and reverse proxy load balancers',
      'WebSockets do not support JSON serialization',
    ],
    correct: 0,
    skill: 'Real-time Web Architectures',
    difficulty: 'EASY',
    explanation: 'SSE provides native HTTP-based unidirectional streaming with built-in automatic reconnects and message IDs without the complexity of WebSocket connection state management.',
  },
]

// ----------------------------------------------------
// RESISTANCE LEARNING ROADMAP
// ----------------------------------------------------

export interface LearningModule {
  id: string
  phase: string
  title: string
  targetSkill: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  hours: number
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED'
  deliverable: string
  whyItMatters: string
  provider: string
  syllabus: string[]
}

export const mockLearningRoadmap: LearningModule[] = [
  {
    id: 'LR-001',
    phase: 'SPRINT 01',
    title: 'TypeScript Advanced Metaprogramming & ASTs',
    targetSkill: 'TypeScript',
    priority: 'CRITICAL',
    hours: 12,
    status: 'IN_PROGRESS',
    deliverable: 'Author a type-safe microservices communication SDK with mapped types',
    whyItMatters: 'Demanded by 84% of Tier 1 Full Stack and Platform engineering openings.',
    provider: 'La Casa Resistance Academy',
    syllabus: [
      'Conditional & Distributed Mapped Types',
      'Template Literal Types & Type Guards',
      'Abstract Syntax Tree (AST) Transforms',
      'Production Type Testing with tsd',
    ],
  },
  {
    id: 'LR-002',
    phase: 'SPRINT 02',
    title: 'Production Docker Containerization & Multi-Stage Builds',
    targetSkill: 'Docker',
    priority: 'CRITICAL',
    hours: 10,
    status: 'IN_PROGRESS',
    deliverable: 'Deploy hardened, unprivileged multi-stage Alpine images under 45MB',
    whyItMatters: 'Closes your current -1.7 deficit against the market expectation.',
    provider: 'Cloud Native Computing Foundation (CNCF)',
    syllabus: [
      'Multi-stage Dockerfile Optimization',
      'Rootless Container Execution & Security Contexts',
      'Layer Caching Strategies for CI Pipelines',
      'Docker Compose Production Simulation',
    ],
  },
  {
    id: 'LR-003',
    phase: 'SPRINT 03',
    title: 'AWS Cloud Architecture & Event-Driven Serverless',
    targetSkill: 'AWS',
    priority: 'CRITICAL',
    hours: 16,
    status: 'LOCKED',
    deliverable: 'Configure serverless event pipeline with SQS, SNS, and Lambda',
    whyItMatters: 'Increases qualified role match yields by +28% in Tier 1 companies.',
    provider: 'AWS Enterprise Architect Collective',
    syllabus: [
      'AWS IAM Least-Privilege Role Policies',
      'EventBridge, SQS, and Fan-Out Architectures',
      'DynamoDB Single-Table Design',
      'Infrastructure as Code with Terraform',
    ],
  },
  {
    id: 'LR-004',
    phase: 'SPRINT 04',
    title: 'PostgreSQL Advanced Query Optimization & Index Tuning',
    targetSkill: 'SQL',
    priority: 'HIGH',
    hours: 8,
    status: 'LOCKED',
    deliverable: 'Analyze EXPLAIN ANALYZE traces and construct composite B-Tree indexes',
    whyItMatters: 'Essential for passing backend architecture whiteboarding rounds.',
    provider: 'PostgreSQL Global Development Group',
    syllabus: [
      'B-Tree vs GIN vs GiST Indexes',
      'Partitioning & Sharding Fundamentals',
      'Locking Contention & Isolation Levels',
      'Connection Pooling with PgBouncer',
    ],
  },
]

export const mockLearningResources = [
  {
    id: 'LR-001',
    title: 'TypeScript Advanced Patterns',
    type: 'course',
    skill: 'TypeScript',
    difficulty: 'Advanced',
    duration: '4 weeks',
    provider: 'Udemy / TotalTypeScript',
  },
  {
    id: 'LR-002',
    title: 'Docker in Production',
    type: 'course',
    skill: 'Docker',
    difficulty: 'Advanced',
    duration: '3 weeks',
    provider: 'Coursera / Linux Foundation',
  },
  {
    id: 'LR-003',
    title: 'AWS Solutions Architect Associate',
    type: 'certification',
    skill: 'AWS',
    difficulty: 'Advanced',
    duration: '8 weeks',
    provider: 'AWS Training',
  },
]

// ----------------------------------------------------
// INTERVIEW INTELLIGENCE
// ----------------------------------------------------

export interface InterviewRecord {
  id: string
  company: string
  role: string
  question: string
  topic: 'System Design' | 'Live Coding' | 'Behavioral & Leadership' | 'Architecture'
  difficulty: 'MEDIUM' | 'HARD' | 'EXPERT'
  frequency: 'VERY HIGH' | 'HIGH' | 'MODERATE'
  reportedDate: string
  verifiedStatus: 'COMMUNITY REPORTED' | 'OFFICIAL VERIFIED'
  tips: string
  expectedKeyPoints: string[]
}

export const mockInterviewQuestions: InterviewRecord[] = [
  {
    id: 'IQ-001',
    company: 'Google',
    role: 'Staff / Senior Software Engineer',
    question: 'Design a distributed globally distributed rate limiter handling 500,000 requests/second with regional pop failovers.',
    topic: 'System Design',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    reportedDate: '2026-08',
    verifiedStatus: 'OFFICIAL VERIFIED',
    tips: 'Do not just answer with Redis. Discuss token synchronization overhead between transatlantic datacenters.',
    expectedKeyPoints: [
      'Regional token bucket synchronization with Gossip protocol',
      'Graceful degradation mode during WAN partition',
      'Sliding window approximation with minimal CPU overhead',
    ],
  },
  {
    id: 'IQ-002',
    company: 'Microsoft',
    role: 'Full Stack Engineer',
    question: 'Implement an in-memory reactive state manager in TypeScript with subscription batching and dependency graph tracking.',
    topic: 'Live Coding',
    difficulty: 'HARD',
    frequency: 'HIGH',
    reportedDate: '2026-09',
    verifiedStatus: 'COMMUNITY REPORTED',
    tips: 'Demonstrate clean topological sorting or dirty-flag caching to avoid diamond dependency recalculations.',
    expectedKeyPoints: [
      'Signal/Observer pattern implementation',
      'Microtask batching via queueMicrotask',
      'Automatic memory cleanup on unmount',
    ],
  },
  {
    id: 'IQ-003',
    company: 'Amazon',
    role: 'Cloud Systems Engineer',
    question: 'Describe an occasion where you made an architectural tradeoff between immediate deployment speed and long-term tech debt.',
    topic: 'Behavioral & Leadership',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    reportedDate: '2026-09',
    verifiedStatus: 'OFFICIAL VERIFIED',
    tips: 'Use the STAR format (Situation, Task, Action, Result) and map to Amazon Leadership Principles: Bias for Action & Ownership.',
    expectedKeyPoints: [
      'Quantified business outcome vs risk assessment',
      'Post-launch tech debt remediation backlog',
      'Stakeholder communication strategy',
    ],
  },
  {
    id: 'IQ-004',
    company: 'Razorpay',
    role: 'Senior Backend Engineer',
    question: 'How do you guarantee strict idempotency across a payment webhook processing system in the event of upstream network retries?',
    topic: 'Architecture',
    difficulty: 'HARD',
    frequency: 'HIGH',
    reportedDate: '2026-08',
    verifiedStatus: 'OFFICIAL VERIFIED',
    tips: 'Detail unique idempotency key hashing, distributed advisory locks, and atomic database state transitions.',
    expectedKeyPoints: [
      'Distributed key locking (e.g. Redlock with short TTL)',
      'Database unique constraints on idempotency token',
      'Returning cached prior responses on replay',
    ],
  },
]

// ----------------------------------------------------
// RESEARCH INTELLIGENCE
// ----------------------------------------------------

export interface ResearchPaper {
  id: string
  title: string
  authors: string
  date: string
  topic: string
  arxivId: string
  impactScore: string
  summary: string
  takeaways: string[]
  link: string
}

export const mockResearchPapers: ResearchPaper[] = [
  {
    id: 'RP-001',
    title: 'Attention Is All You Need',
    authors: 'Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin',
    date: 'NeurIPS 2017',
    topic: 'Deep Learning & Transformer Foundations',
    arxivId: 'arXiv:1706.03762',
    impactScore: '99.9 // FOUNDATIONAL',
    summary: 'Proposes the Transformer architecture based entirely on self-attention mechanisms, dispensing with recurrence and convolutions, forming the bedrock of modern LLMs.',
    takeaways: [
      'Self-attention layers allow parallelized sequence training',
      'Multi-head attention captures varied representation subspaces',
      'Foundation for GPT, BERT, Claude, and Gemini architectures',
    ],
    link: 'https://arxiv.org/abs/1706.03762',
  },
  {
    id: 'RP-002',
    title: 'Language Models are Few-Shot Learners',
    authors: 'Brown, Mann, Ryder, Subbiah, Kaplan, Dhariwal et al. (OpenAI)',
    date: 'NeurIPS 2020',
    topic: 'In-Context Learning & Scale',
    arxivId: 'arXiv:2005.14165',
    impactScore: '98.5 // LANDMARK',
    summary: 'Demonstrates that scaling autoregressive language models to 175B parameters produces emergent few-shot task adaptation capabilities without fine-tuning weights.',
    takeaways: [
      'Prompt engineering as a primary interface for task execution',
      'Empirical validation of scaling laws across compute and parameters',
      'In-context learning mechanics without gradient descent',
    ],
    link: 'https://arxiv.org/abs/2005.14165',
  },
  {
    id: 'RP-003',
    title: 'RaFT: Reward-rAnked Fine-Tuning for Generative Models',
    authors: 'Dong, Xiong, Goyal, Pan, Diao, Zhang',
    date: 'ICLR 2023',
    topic: 'RLHF & Alignment',
    arxivId: 'arXiv:2304.06767',
    impactScore: '92.1 // ADVANCED',
    summary: 'Introduces a robust alternative to standard PPO for aligning generative models using ranked rewards and filtered demonstration sampling.',
    takeaways: [
      'More stable training dynamics than traditional reinforcement learning',
      'Significantly lowers GPU memory footprint during alignment',
    ],
    link: 'https://arxiv.org/abs/2304.06767',
  },
  {
    id: 'RP-004',
    title: 'Spanner: Google’s Globally-Distributed Database',
    authors: 'Corbett, Dean, Epstein, Fikes, Frost, Furman, Ghemawat et al. (Google)',
    date: 'OSDI 2012',
    topic: 'Distributed Systems & TrueTime',
    arxivId: 'Google Research Paper',
    impactScore: '97.8 // ENTERPRISE ARCHITECTURE',
    summary: 'The seminal engineering blueprint for a globally distributed database providing external consistency at scale using GPS and atomic clocks.',
    takeaways: [
      'TrueTime API bounds clock uncertainty explicitly',
      'Enables globally serialized transactions without central bottlenecks',
    ],
    link: 'https://research.google/pubs/pub39966/',
  },
]

// ----------------------------------------------------
// INTELLIGENCE FEED ("WHAT'S NEW")
// ----------------------------------------------------

export interface IntelligenceBrief {
  id: string
  briefNumber: string
  timestamp: string
  category: 'EMERGING SKILL' | 'MARKET SURGE' | 'COMPENSATION SHIFT' | 'HIRING ALERT'
  urgency: 'HIGH' | 'NORMAL' | 'CRITICAL'
  title: string
  content: string
  momentum: string
  impactedRoles: string[]
}

export const mockIntelligenceFeed: IntelligenceBrief[] = [
  {
    id: 'IB-042',
    briefNumber: 'BRIEF // LC-ROZ-042',
    timestamp: '12 MINUTES AGO',
    category: 'EMERGING SKILL',
    urgency: 'CRITICAL',
    title: 'Kubernetes Adoption Crosses 42% Acceleration in Enterprise Deployments',
    content: 'Live ingestion signals across 12,000 job postings indicate rapid consolidation toward cloud-native microservices. Teams without container orchestration proficiency report 2.8x longer hiring cycles.',
    momentum: '↑ +42.3% Acceleration',
    impactedRoles: ['Cloud Engineer', 'DevOps Specialist', 'Full Stack Lead'],
  },
  {
    id: 'IB-041',
    briefNumber: 'BRIEF // LC-ROZ-041',
    timestamp: '2 HOURS AGO',
    category: 'COMPENSATION SHIFT',
    urgency: 'HIGH',
    title: 'Tier-1 Metro Compensation Bands Shift for TypeScript Specialists',
    content: 'Bangalore and Hyderabad hubs show a 14.8% jump in median base salaries for engineers with verified TypeScript and distributed system benchmark scores.',
    momentum: '↑ ₹18L - ₹25L Median Band',
    impactedRoles: ['Full Stack Developer', 'Frontend Engineer'],
  },
  {
    id: 'IB-040',
    briefNumber: 'BRIEF // LC-ROZ-040',
    timestamp: '5 HOURS AGO',
    category: 'MARKET SURGE',
    urgency: 'NORMAL',
    title: 'AI Agent Architecture Demands Outpace Classical Web Frameworks',
    content: 'Openings requesting LangChain, Vector Database integration, and asynchronous agent orchestration expanded +84% YoY across Indian tech corridors.',
    momentum: '↑ +84.2% YoY Surge',
    impactedRoles: ['AI/ML Engineer', 'Full Stack Developer', 'Backend Specialist'],
  },
  {
    id: 'IB-039',
    briefNumber: 'BRIEF // LC-ROZ-039',
    timestamp: 'YESTERDAY',
    category: 'HIRING ALERT',
    urgency: 'NORMAL',
    title: 'TechCorp India Opens 45 Headcount Across Core Infrastructure Teams',
    content: 'Verified employer target initiated recruiting sprint for Level 4 and Level 5 operatives in cloud architecture and microservice engineering.',
    momentum: '● Active Pipeline',
    impactedRoles: ['Cloud Architect', 'DevOps Engineer', 'Lead Developer'],
  },
]

// ----------------------------------------------------
// ROLE INTELLIGENCE & COMPENSATION INTELLIGENCE DATA
// ----------------------------------------------------

export interface RoleDetailDossier {
  id: string
  name: string
  category: string
  missionCode: string
  demandIndex: number
  growthRate: string
  medianSalary: string
  activeOpenings: number
  description: string
  requiredSkills: { name: string; weight: number }[]
  preferredSkills: { name: string; weight: number }[]
  experienceBands: { level: string; experience: string; salary: string }[]
  careerTransitions: { nextRole: string; feasibility: string; typicalTime: string }[]
  fiveYearOutlook: string
}

export const mockRoleDossiers: Record<string, RoleDetailDossier> = {
  'Software Engineer': {
    id: 'ROLE-SE-01',
    name: 'Software Engineer',
    category: 'Core Engineering',
    missionCode: 'OP-ENG-01',
    demandIndex: 92,
    growthRate: '+18.4%',
    medianSalary: '₹15L',
    activeOpenings: 9240,
    description: 'Designs, implements, and tests resilient software systems across the technology stack with high emphasis on algorithmic efficiency, scalability, and code maintainability.',
    requiredSkills: [
      { name: 'JavaScript / TypeScript', weight: 90 },
      { name: 'Data Structures & Algorithms', weight: 88 },
      { name: 'SQL & Database Systems', weight: 80 },
      { name: 'Git & Version Control', weight: 85 },
    ],
    preferredSkills: [
      { name: 'Docker', weight: 70 },
      { name: 'AWS Cloud Services', weight: 75 },
      { name: 'CI/CD Automation', weight: 68 },
    ],
    experienceBands: [
      { level: 'Entry / Graduate', experience: '0-2 years', salary: '₹5.0L - ₹8.5L' },
      { level: 'Mid-Level', experience: '2-5 years', salary: '₹9.0L - ₹17L' },
      { level: 'Senior Engineer', experience: '5-8+ years', salary: '₹18L - ₹30L+' },
    ],
    careerTransitions: [
      { nextRole: 'Full Stack Developer', feasibility: 'High (88% Match)', typicalTime: '6-12 Months' },
      { nextRole: 'Cloud Solutions Architect', feasibility: 'Moderate (72% Match)', typicalTime: '18-24 Months' },
      { nextRole: 'Engineering Manager', feasibility: 'Moderate (65% Match)', typicalTime: '2-3 Years' },
    ],
    fiveYearOutlook: 'High demand sustained. Increasing automation in boilerplate coding shifts emphasis toward distributed system architecture and AI-assisted workflows.',
  },
  'Full Stack Developer': {
    id: 'ROLE-FS-02',
    name: 'Full Stack Developer',
    category: 'Full Stack',
    missionCode: 'OP-FS-02',
    demandIndex: 88,
    growthRate: '+15.6%',
    medianSalary: '₹16L',
    activeOpenings: 7542,
    description: 'Bridges frontend client experiences with backend service layers. Builds complete product features from user interface components down to database transactions.',
    requiredSkills: [
      { name: 'React / Next.js', weight: 92 },
      { name: 'Node.js / Express', weight: 86 },
      { name: 'TypeScript', weight: 84 },
      { name: 'SQL & Relational DBs', weight: 80 },
    ],
    preferredSkills: [
      { name: 'Docker Containerization', weight: 74 },
      { name: 'AWS / Cloud Deployment', weight: 72 },
      { name: 'Redis Caching', weight: 65 },
    ],
    experienceBands: [
      { level: 'Junior Operative', experience: '1-2 years', salary: '₹5.5L - ₹9.0L' },
      { level: 'Core Operative', experience: '2-5 years', salary: '₹10L - ₹18L' },
      { level: 'Lead Architect', experience: '5-8+ years', salary: '₹20L - ₹34L+' },
    ],
    careerTransitions: [
      { nextRole: 'Cloud Solutions Architect', feasibility: 'High (82% Match)', typicalTime: '12-18 Months' },
      { nextRole: 'Technical Product Lead', feasibility: 'High (85% Match)', typicalTime: '12-24 Months' },
    ],
    fiveYearOutlook: 'Strong trajectory. Full-stack generalists with deep TypeScript and cloud deployment acumen command high hiring premiums.',
  },
  'Cloud Engineer': {
    id: 'ROLE-CE-03',
    name: 'Cloud Engineer',
    category: 'Cloud & Infrastructure',
    missionCode: 'OP-CLOUD-03',
    demandIndex: 94,
    growthRate: '+31.2%',
    medianSalary: '₹18L',
    activeOpenings: 6234,
    description: 'Architects and orchestrates resilient multi-region cloud environments, serverless computing pipelines, security postures, and cost-efficient infrastructure.',
    requiredSkills: [
      { name: 'AWS / Cloud Architecture', weight: 94 },
      { name: 'Terraform (IaC)', weight: 88 },
      { name: 'Docker & Kubernetes', weight: 86 },
      { name: 'Linux System Internals', weight: 82 },
    ],
    preferredSkills: [
      { name: 'Python / Go Automation', weight: 76 },
      { name: 'Prometheus & Grafana', weight: 72 },
    ],
    experienceBands: [
      { level: 'Cloud Associate', experience: '1-3 years', salary: '₹6.5L - ₹11L' },
      { level: 'Cloud Engineer', experience: '3-6 years', salary: '₹12L - ₹22L' },
      { level: 'Principal Cloud Architect', experience: '6+ years', salary: '₹24L - ₹42L+' },
    ],
    careerTransitions: [
      { nextRole: 'Principal Cloud Architect', feasibility: 'Very High (92% Match)', typicalTime: '2-3 Years' },
      { nextRole: 'DevOps & Site Reliability Lead', feasibility: 'High (88% Match)', typicalTime: '12 Months' },
    ],
    fiveYearOutlook: 'Exceptional acceleration. Enterprise multi-cloud migrations and AI cluster requirements create high ongoing talent shortages.',
  },
  'Data Scientist': {
    id: 'ROLE-DS-04',
    name: 'Data Scientist',
    category: 'AI & Data Intelligence',
    missionCode: 'OP-DATA-04',
    demandIndex: 90,
    growthRate: '+22.1%',
    medianSalary: '₹17L',
    activeOpenings: 8156,
    description: 'Extracts predictive signals and trains machine learning models from large-scale structured and unstructured datasets to drive automated decision intelligence.',
    requiredSkills: [
      { name: 'Python & Data Ecosystem', weight: 95 },
      { name: 'Machine Learning & PyTorch', weight: 90 },
      { name: 'SQL & Data Warehousing', weight: 85 },
      { name: 'Statistical Modeling', weight: 84 },
    ],
    preferredSkills: [
      { name: 'LLM Fine-Tuning & Prompting', weight: 82 },
      { name: 'MLOps & Model Serving', weight: 75 },
    ],
    experienceBands: [
      { level: 'Data Analyst / Associate', experience: '0-2 years', salary: '₹5.5L - ₹9.5L' },
      { level: 'Data Scientist', experience: '2-5 years', salary: '₹11L - ₹20L' },
      { level: 'Staff AI Scientist', experience: '5+ years', salary: '₹22L - ₹40L+' },
    ],
    careerTransitions: [
      { nextRole: 'Machine Learning Engineer', feasibility: 'High (85% Match)', typicalTime: '6-12 Months' },
      { nextRole: 'Head of Data & AI', feasibility: 'Moderate (70% Match)', typicalTime: '2-4 Years' },
    ],
    fiveYearOutlook: 'High evolution. Roles transition from basic descriptive reporting toward agentic workflows, fine-tuning, and RAG architectures.',
  },
}

// ----------------------------------------------------
// FUTURE FORECASTING PREDICTIVE MODELS
// ----------------------------------------------------

export interface ForecastModel {
  technology: string
  currentDemand: number
  projectedDemand2027: number
  projectedDemand2028: number
  growthFactor: string
  status: 'EXPLOSIVE' | 'STEADY_CLIMB' | 'DECLINING' | 'PLATEAU'
  riskFactor: string
  recommendation: string
}

export const mockForecastData: ForecastModel[] = [
  {
    technology: 'Cloud AI & Agentic LLMs',
    currentDemand: 42,
    projectedDemand2027: 78,
    projectedDemand2028: 94,
    growthFactor: '+124%',
    status: 'EXPLOSIVE',
    riskFactor: 'Low Obsolescence Risk',
    recommendation: 'Priority upskilling target for all software operatives.',
  },
  {
    technology: 'Kubernetes Container Orchestration',
    currentDemand: 58,
    projectedDemand2027: 82,
    projectedDemand2028: 91,
    growthFactor: '+57%',
    status: 'STEADY_CLIMB',
    riskFactor: 'Very Low Risk (De-facto standard)',
    recommendation: 'Core requirement for mid and senior engineering roles.',
  },
  {
    technology: 'TypeScript Ecosystem',
    currentDemand: 65,
    projectedDemand2027: 86,
    projectedDemand2028: 92,
    growthFactor: '+42%',
    status: 'STEADY_CLIMB',
    riskFactor: 'Near-Zero Risk',
    recommendation: 'Non-negotiable foundation across frontend and backend services.',
  },
  {
    technology: 'Rust for High-Performance Systems',
    currentDemand: 28,
    projectedDemand2027: 52,
    projectedDemand2028: 74,
    growthFactor: '+164%',
    status: 'EXPLOSIVE',
    riskFactor: 'Moderate Learning Curve',
    recommendation: 'High-leverage specialization for systems, WebAssembly, and crypto.',
  },
  {
    technology: 'Legacy Monolithic CMS (PHP/WordPress)',
    currentDemand: 52,
    projectedDemand2027: 36,
    projectedDemand2028: 24,
    growthFactor: '-54%',
    status: 'DECLINING',
    riskFactor: 'High Displacement Risk',
    recommendation: 'Transition legacy talent toward Next.js and headless architectures.',
  },
]
