# La Casa De Rozgaar — Data Architecture & Strategy

**Last Updated:** 2026-10-06  
**Project:** Intelligent Workforce Ecosystem (Module 2)  
**Scope:** User, Talent & Career Intelligence Platform

---

## 1. Executive Summary

La Casa De Rozgaar is a dual-layer talent intelligence platform that orchestrates:
- **Candidate-facing intelligence:** Skill assessments, career pathways, job matching, learning recommendations, interview prep
- **Employer-facing intelligence:** Workforce gap analysis, talent discovery, compensation benchmarking, hiring forecasting

The data architecture spans:
- **Backend:** PostgreSQL (Neon Cloud) + SQLite (local dev) with dual-sync capability
- **Frontend:** React 18 with localStorage persistence + live sync via custom event dispatchers
- **API Layer:** REST (Express.js) with 16 route modules covering 50+ endpoints
- **State:** Hybrid localStorage + in-memory context (Auth, Theme, Candidate Profile)

---

## 2. Database Schema Architecture

### 2.1 Core Tables by Domain

#### **Users & Authentication** (4 tables)
```
users
├── id (TEXT PRIMARY KEY)
├── email (UNIQUE)
├── password_hash
├── name, role (CANDIDATE|RECRUITER|EMPLOYER_ADMIN|ADMIN)
├── email_verified, is_active
├── created_at, updated_at

sessions
├── id (PRIMARY KEY)
├── user_id (FK → users)
├── token (UNIQUE)
├── refresh_token
├── expires_at
├── revoked (INTEGER 0|1)

organization_users
├── id (PRIMARY KEY)
├── organization_id (FK)
├── user_id (FK)
├── role (VIEWER|EDITOR|ADMIN)
├── UNIQUE(organization_id, user_id)

users → sessions (1:N deletion cascade)
users → organization_users (1:N deletion cascade)
```

**Indexes:** `idx_users_email`, `idx_sessions_user`, `idx_sessions_token`

---

#### **Candidate Profiles** (6 tables)
```
candidate_profiles
├── id, user_id (1:1 UNIQUE FK)
├── name, headline, bio, location, phone
├── visibility (public|private)
├── total_experience_years (REAL)
├── target_roles (JSON [])
├── preferred_locations (JSON [])
├── employment_preferences (JSON [])
├── portfolio_links (JSON [])
├── created_at, updated_at

candidate_skills
├── id, candidate_id (FK), skill_id, skill_name
├── self_reported_score, assessment_score, verified_score (REAL)
├── confidence (0-1)
├── last_assessed_at
├── source (SELF_REPORTED|ASSESSMENT|VERIFIED)
├── UNIQUE(candidate_id, skill_id)

candidate_experience
├── id, candidate_id (FK)
├── title, company, location
├── start_date, end_date (TEXT)
├── current (INTEGER 0|1)
├── description
├── skills (JSON [])

candidate_education
├── id, candidate_id (FK)
├── degree, institution, field
├── start_date, end_date
├── current, grade

candidate_certifications
├── id, candidate_id (FK)
├── name, issuer
├── issued_at, expires_at
├── credential_id, url

candidate_preferences
├── id, candidate_id (1:1 UNIQUE FK)
├── remote_preference (ANY|REMOTE|HYBRID|ONSITE)
├── salary_expectation_{min,max}, salary_currency
├── notice_period_days
├── willing_to_relocate
├── preferred_company_sizes (JSON [])
├── preferred_industries (JSON [])

target_roles
├── id, candidate_id (FK)
├── role_id, role_name
├── priority (INTEGER 1-5)
├── added_at
```

**Indexes:** `idx_candidate_profiles_user`, `idx_candidate_skills_candidate`

---

#### **Assessments & Skill Verification** (4 tables)
```
assessments
├── id, title, description
├── target_role_id
├── skills (JSON [])
├── difficulty (EASY|INTERMEDIATE|HARD)
├── duration_minutes, question_count
├── rules (JSON [])
├── created_at, created_by (FK → users)

assessment_questions
├── id, assessment_id (FK)
├── type (MCQ|CODE|ESSAY|SYSTEM_DESIGN)
├── text
├── options (JSON [])
├── correct_answers (JSON [])
├── skill_ids (JSON [])
├── difficulty (1-10 scale)
├── points, sort_order

assessment_attempts
├── id, user_id (FK), assessment_id (FK)
├── started_at, submitted_at
├── status (CREATED|IN_PROGRESS|SUBMITTED|GRADED)
├── score, skill_scores (JSON)
├── integrity_summary (JSON)

assessment_answers
├── id, attempt_id (FK), question_id (FK)
├── answer (TEXT)
├── is_correct, score
├── answered_at
```

**Indexes:** `idx_assessment_attempts_user`, `idx_assessment_attempts_assessment`

---

#### **Skill Gap & Job Matching** (4 tables)
```
skill_gaps
├── id, candidate_id (FK), role_id
├── skill_id, skill_name
├── current_score, required_score, gap (REAL)
├── priority (LOW|MEDIUM|HIGH|CRITICAL)
├── market_demand (0-100)
├── reason (TEXT)
├── calculated_at

job_matches
├── id, candidate_id (FK), job_id
├── overall_match, skill_match, experience_match, role_match, location_match (0-100)
├── matched_skills (JSON [])
├── missing_skills (JSON [])
├── explanation
├── calculated_at
├── UNIQUE(candidate_id, job_id) — deduplicate matches

saved_jobs
├── id, candidate_id (FK), job_id
├── saved_at
├── notes
├── UNIQUE(candidate_id, job_id)

job_interactions
├── id, candidate_id (FK), job_id
├── interaction_type (VIEW|SAVE|APPLY|REJECT|SHARE)
├── timestamp, metadata (JSON)
```

**Indexes:** `idx_skill_gaps_candidate`, `idx_job_matches_candidate`

---

#### **Career Simulation** (1 table)
```
career_scenarios
├── id, user_id (FK)
├── name
├── target_role_id
├── skill_changes (JSON [])
├── result (JSON {readiness, timeline, cost, recommendation})
├── model_version
├── created_at

— No FK on target_role_id (roles from Module 1 intelligence provider)
— Scenarios are user-scoped transient what-if models
```

---

#### **Learning & Development** (3 tables)
```
learning_resources
├── id, title, type (COURSE|BOOK|ARTICLE|VIDEO|CERTIFICATION)
├── url, provider
├── skill_ids (JSON [])
├── role_ids (JSON [])
├── difficulty (BEGINNER|INTERMEDIATE|ADVANCED)
├── estimated_duration_hours
├── source (CURATED|COMMUNITY|PLATFORM)
├── created_at

learning_paths
├── id, user_id (FK), target_role_id
├── resources (JSON [])
├── created_at

learning_progress
├── id, user_id (FK), resource_id (FK)
├── status (NOT_STARTED|IN_PROGRESS|COMPLETED|PAUSED)
├── progress (0-100)
├── time_spent_minutes
├── started_at, completed_at
├── UNIQUE(user_id, resource_id)
```

**Indexes:** `idx_learning_progress_user`

---

#### **Interview Intelligence** (2 tables)
```
interview_questions
├── id, company, role_id
├── question, topic
├── difficulty (EASY|MEDIUM|HARD)
├── type (TECHNICAL|BEHAVIORAL|SYSTEM_DESIGN|CODING)
├── reported_at, source (REPORTED|OFFICIAL_VERIFIED)
├── reported_by (FK → users)

interview_reports
├── id, user_id (FK)
├── company, role_id
├── experience_summary, difficulty
├── topics (JSON [])
├── outcome (PASSED|FAILED|PENDING)
├── reported_at
```

**Indexes:** `idx_interview_questions_role`

---

#### **Research & Market Intelligence** (1 table)
```
research_items
├── id, title, authors (JSON [])
├── abstract, summary
├── published_at, source (arXiv|IEEE|Company Blog)
├── original_url
├── topics (JSON [])
├── skill_ids (JSON [])
├── role_ids (JSON [])
├── type (ORIGINAL_PAPER|INDUSTRY_ARTICLE|SURVEY|TECHNICAL_REPORT)
├── created_at
```

**Indexes:** `idx_research_items_type`

---

#### **Organizations & Employer Intelligence** (6 tables)
```
organizations
├── id, name, industry, size
├── location
├── created_at

organization_users
├── id, organization_id (FK), user_id (FK)
├── role (VIEWER|EDITOR|ADMIN)
├── UNIQUE(organization_id, user_id)

organization_roles
├── id, organization_id (FK)
├── role_id, role_name
├── requirements (JSON {})
├── created_at

talent_searches
├── id, organization_id (FK), searched_by (FK → users)
├── query (JSON {skills, roles, location, etc})
├── result_count
├── searched_at

candidate_shortlists
├── id, organization_id (FK), candidate_id (FK)
├── status (DISCOVERED|CONTACTED|INTERVIEWED|OFFERED|REJECTED)
├── notes
├── recruiter_id (FK → users)
├── created_at, updated_at
├── UNIQUE(organization_id, candidate_id)

workforce_profiles
├── id, organization_id (FK)
├── department, role_id
├── employee_count
├── current_skills, target_skills (JSON [])
├── employee_ref, skills (JSON [])
├── role (TEXT), experience_years (REAL)
├── location, metadata (JSON)
├── created_by (FK), created_at, updated_at
```

**Indexes:**  
- `idx_org_users_org`, `idx_org_users_user`
- `idx_workforce_profiles_org`, `idx_shortlists_org`

---

#### **Workforce Gap Analysis** (1 table)
```
workforce_gaps
├── id, profile_id, organization_id (FK)
├── skill_id, skill_name
├── current_avg, target_score, gap (REAL)
├── coverage (0-1)
├── impacted_employees
├── priority (LOW|MEDIUM|HIGH|CRITICAL)
├── analysis_data (JSON {trends, benchmark, cohorts})
├── calculated_at
```

---

#### **Workforce Planning** (1 table)
```
workforce_plans
├── id, organization_id (FK)
├── name
├── target_roles (JSON [])
├── future_skills (JSON [])
├── demand_horizon (3m|6m|12m|24m)
├── current_capability (JSON {})
├── gaps (JSON {})
├── hiring_requirements (JSON [])
├── development_requirements (JSON [])
├── created_at, created_by (FK)
```

---

#### **Notifications & Audit** (2 tables)
```
notifications
├── id, user_id (FK)
├── type (MATCH|MILESTONE|ALERT|RECOMMENDATION)
├── title, message
├── read (INTEGER 0|1)
├── created_at
├── metadata (JSON)

audit_log
├── id, user_id
├── action (CREATE|UPDATE|DELETE|VIEW)
├── entity_type, entity_id
├── metadata (JSON)
├── timestamp
├── ip_address
```

**Indexes:** `idx_notifications_user`, `idx_audit_log_user`, `idx_audit_log_entity`

---

### 2.2 Total Schema Statistics

| Domain | Tables | Total Columns | Foreign Keys | Indexes |
|--------|--------|---------------|--------------|---------|
| Auth & Users | 4 | ~20 | 4 | 4 |
| Candidate Profiles | 6 | ~50 | 6 | 2 |
| Assessments | 4 | ~25 | 4 | 2 |
| Skill Gaps & Matching | 4 | ~25 | 4 | 2 |
| Career Simulation | 1 | ~8 | 1 | 0 |
| Learning | 3 | ~15 | 3 | 1 |
| Interview Intelligence | 2 | ~12 | 2 | 1 |
| Research | 1 | ~10 | 0 | 1 |
| Organizations | 6 | ~30 | 8 | 3 |
| Notifications & Audit | 2 | ~12 | 2 | 3 |
| **TOTAL** | **33** | **207** | **34** | **19** |

---

## 3. Backend API Architecture

### 3.1 Route Modules & Endpoints

| Module | File | Endpoints | Purpose |
|--------|------|-----------|---------|
| **Auth** | `routes/auth.ts` | POST /auth/login, /register, GET /auth/me | User authentication & session mgmt |
| **Users** | `routes/users.ts` | GET /users/profile, PUT /profile | User account mgmt |
| **Candidates** | `routes/candidates.ts` | GET /profile, PUT /profile, POST /skills, GET /skills | Candidate profile & skill inventory |
| **Assessments** | `routes/assessments.ts` | GET /assessments, GET /:id/questions, POST /:id/attempt, POST /attempts/:id/submit | Skill assessments & scoring |
| **Skill Gaps** | `routes/skillGaps.ts` | POST /calculate | Gap analysis engine |
| **Matching** | `routes/matching.ts` | GET /jobs/recommended, GET /jobs/:id, POST /saved/:id, DELETE /saved/:id | Job-candidate matching |
| **Simulation** | `routes/simulation.ts` | POST /simulate, GET /scenarios, POST /scenarios, DELETE /scenarios/:id | Career what-if scenarios |
| **Learning** | `routes/learning.ts` | GET /recommended, GET /resources, GET /roadmap | Learning path recommendations |
| **Interviews** | `routes/interviews.ts` | GET /questions, POST /questions, GET /preparation | Interview prep intelligence |
| **Research** | `routes/research.ts` | GET /items, GET /market-data, GET /role-dossiers, GET /forecast | Market research & trends |
| **Recommendations** | `routes/recommendations.ts` | GET /career, GET /learning, GET /jobs | Personalized recommendations engine |
| **Employer** | `routes/employer.ts` | GET /organization, PUT /organization, POST /search | Employer org management |
| **Talent** | `routes/talent.ts` | POST /search, GET /employer-data, POST /workforce/gaps/analyze, POST /workforce/gaps/recommendation | Talent discovery & workforce analytics |
| **Workforce** | `routes/workforce.ts` | GET /profiles, POST /profiles, POST /gaps/analyze, PUT /plans/:id | Workforce planning & gap management |
| **Compensation** | `routes/compensation.ts` | GET /benchmarks, POST /calculate | Compensation intelligence |
| **Notifications** | `routes/notifications.ts` | GET /notifications, PATCH /:id/read | Notification center |

**Total Endpoints:** ~50+ REST routes

---

### 3.2 Request/Response Flow

```
Client Request
    ↓
CORS + Rate Limit Middleware
    ↓
Request ID + Auth Middleware
    ↓
Route Handler (16 modules)
    ↓
Database Query (SQLite/PostgreSQL dual-dialect)
    ↓
Mock Fallback (if offline)
    ↓
localStorage Update (candidate profile sync)
    ↓
Response JSON
    ↓
Client State Update + Event Dispatch
```

---

### 3.3 Error Handling & Response Envelope

**Success Response:**
```json
{
  "data": { /* actual payload */ },
  "meta": {
    "requestId": "uuid",
    "page": 1,
    "pageSize": 25,
    "total": 100
  }
}
```

**Error Response:**
```json
{
  "error": {
    "code": "SKILL_GAPS_CALCULATION_FAILED",
    "message": "Failed to calculate skill gaps for candidate",
    "requestId": "uuid",
    "details": { /* optional */ }
  }
}
```

---

## 4. Frontend Data Layer Architecture

### 4.1 State Management Hierarchy

```
Global State (localStorage + Context)
├── Auth (token, user, role)
│   ├── token: string | null
│   ├── user: AuthUser { id, email, role, name, headline, organization }
│   ├── isAuthenticated: boolean
│   └── DEMO_PRESETS (4 quick-login accounts)
│
├── Theme (isHeist, isProfessional, mode, isDark)
│   ├── isHeist: boolean
│   ├── isProfessional: boolean
│   └── Custom CSS classes + DOM theme application
│
└── Candidate Profile (localStorage + sync events)
    ├── lcdr_candidate_profile: {
    │   ├── id, name, codeName, email, phone
    │   ├── title, bio, location, avatarUrl
    │   ├── skills: [{name, score, market, gap, tier}]
    │   ├── experience, education, certifications
    │   ├── projects: [{title, description, skills, link}]
    │   ├── roleReadiness: number (0-99)
    │   ├── targetRole, secondaryRole
    │   ├── compensation: {current, expected, currency}
    │   ├── socialLinks: {github, linkedin, portfolio, leetcode}
    │   └── lastAssessment, assessment: {score, category, percentile, ...}
    │   └── Event: 'candidate-profile-updated'
    │
    ├── lcdr_auth_token: string (JWT)
    ├── lcdr_auth_user: {email, role, name, headline, organization}
    └── lcdr_company_profile_data (employer organizations)
```

### 4.2 API Service Layer (`src/services/api.ts`)

**Class:** `ApiService` with static singleton instance `api`

**Sub-services (9 namespaced APIs):**

1. **`api.auth`** — Login, register, me, logout, token management
   - Auto re-auth on 401 with ensureAuth()
   - Fallback to demo preset accounts

2. **`api.candidate`** — Profile CRUD, skills, assessment scoring
   - localStorage persistence with merge strategy
   - Auto-compute roleReadiness from skill averages
   - Window event dispatcher for reactive updates

3. **`api.assessments`** — Assessment CRUD, questions, attempts, scoring
   - Secure submission with proctoring metadata
   - Dual write: backend + localStorage

4. **`api.matching`** — Job recommendations, skill gaps, job saves
   - 4-factor match scoring (skill, experience, role, location)
   - Dynamic fit categorization (Immediate-Fit vs Growth-Fit)

5. **`api.simulation`** — What-if career scenarios, save/load
   - Transient scenario models (not persisted to DB on error)

6. **`api.learning`** — Resource recommendations, roadmaps, progress
   - Curated + community learning paths
   - 4-week sprint templates per skill gap

7. **`api.interviews`** — Question filtering, reporting, prep
   - Dual source: OFFICIAL_VERIFIED + COMMUNITY_REPORTED
   - Role-based question filtering

8. **`api.research`** — Market papers, role dossiers, forecasts
   - Mock data fallback for offline mode

9. **`api.talent`** — Employer talent search, workforce gaps
   - Org-scoped candidate pools
   - Gap analysis with remediation recommendations

**Request Method:**
```typescript
private async request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>>
```

**Features:**
- Bearer token auto-inject in headers
- 401 token refresh logic
- Offline detection (isOnline: boolean | null)
- Mock data fallback on network failure

---

### 4.3 Mock Data Architecture (`src/data/mockData.ts`)

**Mock Objects (15+ curated datasets):**

| Mock | Purpose | Records | Type |
|------|---------|---------|------|
| `mockCandidate` | Candidate Rahul Sharma profile template | 1 | Profile + Skills |
| `mockCandidatePriya` | Candidate Priya Patel profile template | 1 | Profile + Skills |
| `mockJobs` | Job listings with match scores | 5 | Job array |
| `mockMarketData` | Market roles, skills, trends, compensation | - | Market analytics |
| `mockRoleDossiers` | Role competency profiles (5 roles) | 5 | Role specs |
| `mockForecastData` | 3-year skill/role demand forecast | - | Predictions |
| `mockEmployer` | Employer TechCorp organization profile | 1 | Org profile |
| `mockLearningRoadmap` | Career learning paths (5 target roles) | 5 | Learning paths |
| `mockLearningResources` | Curated courses & certifications | 12 | Resources |
| `mockInterviewQuestions` | Sample interview questions | 15 | Questions |
| `mockResearchPapers` | Research papers & industry articles | 8 | Papers |
| `mockIntelligenceFeed` | Market intelligence wire briefings | 6 | Feed items |
| `mockTalentVaultCandidates` | Candidate pool in Talent Vault | 6 | Candidates |
| `mockAssessmentQuestions` | Assessment MCQ/coding problems | 20 | Questions |

**Mock Data Flow:**
```
API Call
    ↓
Backend Up? → Yes: Fetch from DB
              → No: Return mock data from mockData.ts
    ↓
Merge Mock + Real Data if partial match
    ↓
localStorage Update
    ↓
Return to Component
```

---

### 4.4 Data Hydration Strategies

#### **Page Initialization Pattern:**

```typescript
// 1. Load from localStorage (fast)
const stored = getStoredCandidate()

// 2. Attempt API fetch (live)
api.candidate.getProfile().then(data => {
  if (mounted && data) {
    // 3. Merge API data with storage
    const merged = { ...stored, ...data }
    
    // 4. Update localStorage
    saveStoredCandidate(merged)
    
    // 5. Dispatch window event
    window.dispatchEvent(new Event('candidate-profile-updated'))
    
    // 6. Update React state
    setCandidate(merged)
  }
})
```

#### **Assessment Scoring Pattern:**

```typescript
// 1. Calculate score locally
const score = (correctCount / totalQuestions) * 100

// 2. Update localStorage immediately
api.candidate.applyAssessmentScore({
  score,
  percentage,
  integrityStatus
})

// 3. Post to backend (fire-and-forget)
api.request('/assessments/submit-direct', {
  method: 'POST',
  body: JSON.stringify(data)
}).catch(() => {
  // Fallback: data is already in localStorage
})

// 4. Return updated candidate profile
return updatedCandidate
```

---

## 5. Data Flow Patterns

### 5.1 Candidate Profile Update Flow

```
User edits profile (CandidateDossier)
    ↓
Local State Update (React)
    ↓
saveStoredCandidate(profile) → localStorage
    ↓
api.candidate.updateProfile(data) → POST /candidates/profile
    ↓
Backend persists to DB
    ↓
Response with merged data
    ↓
window.dispatchEvent('candidate-profile-updated')
    ↓
Other components listen & refresh
    ↓
Notification: "Profile saved"
```

### 5.2 Job Matching Flow

```
User filters job preferences (JobFinder)
    ↓
api.matching.getRecommendedJobs()
    ↓
Backend:
  1. Fetch candidate skills & preferences
  2. Query job database
  3. Calculate 4-factor match score
  4. Rank & return top 5
    ↓
Transform to UI format:
  - Append match breakdown
  - Categorize (Immediate vs Growth)
  - Compute gap analysis
    ↓
Display in JobFinder grid
    ↓
User clicks "SAVE JOB"
    ↓
api.matching.saveJob(jobId) → POST /matching/saved/{id}
    ↓
localStorage + DB update
```

### 5.3 Workforce Gap Analysis Flow

```
Employer views Workforce Gaps (WorkforceGaps page)
    ↓
api.talent.analyzeWorkforceGaps(profileId)
    ↓
Backend:
  1. Load org workforce profiles
  2. Benchmark current skills vs market
  3. Identify gaps & priority
  4. Query talent vault for fills
    ↓
Return gaps array:
  [{
    skillId, skillName,
    currentAvg, targetScore, gap,
    priority, impactedEmployees,
    recommendations: [{action, cost, timeline}]
  }]
    ↓
UI renders gap cards with action buttons
    ↓
User clicks "ALLOCATE COHORT"
    ↓
Trigger learning path or hiring req creation
```

---

## 6. Data Persistence & Sync Strategy

### 6.1 Multi-Layer Persistence

```
Layer 1: In-Memory (React State)
├── FastestAccess (0ms)
├── Lost on page refresh
└── Used for immediate UI updates

Layer 2: localStorage (Browser Storage)
├── PersistentAccess (1-5ms)
├── ~5MB limit per domain
├── Keys:
│   ├── lcdr_auth_token (JWT)
│   ├── lcdr_auth_user (JSON {id, email, role, name})
│   ├── lcdr_candidate_profile (Full profile)
│   └── lcdr_company_profile_data (Org data)
└── Event-based sync with other tabs

Layer 3: Backend Database (PostgreSQL/SQLite)
├── PersistentAccess (50-200ms)
├── Unlimited capacity
├── Dual-dialect support
├── Transactional ACID guarantees
└── Server-side validation & business logic
```

### 6.2 Conflict Resolution

**Strategy:** Client Last-Write Wins (LWW) with version tagging

```
Scenario: User edits profile on 2 tabs simultaneously

Tab A: Updates candidate.skills[0].score = 8.5
Tab B: Updates candidate.skills[0].score = 9.0

Resolution:
1. Both POST to /candidates/profile
2. Server receives Tab B second → writes Tab B value
3. Server response includes updated_at timestamp
4. Client compares: if local updatedAt < server updatedAt
   → Accept server value
5. If local newer → Show merge conflict UI
   → User chooses which version to keep
```

---

## 7. Frontend Component Data Requirements

### 7.1 Page-to-Data Mapping

| Page | Data Source | Update Trigger | Sync Method |
|------|-------------|-----------------|-------------|
| **War Room** | mockMarketData | On load | Mock fallback |
| **Market Intelligence** | api.research.getMarketData() | Hourly cache | REST |
| **Skill Intelligence** | api.research.getRoleDossiers() | On load | REST + mock |
| **Role Intelligence** | api.research.getRoleDossiers() | On load | REST + mock |
| **Compensation Intel** | api.research.getForecastData() | On load | REST + mock |
| **Future Forecast** | api.research.getForecastData() | On load | REST + mock |
| **Candidate Dossier** | api.candidate.getProfile() | User edit | REST + localStorage |
| **Shared Dossier** | localStorage + api.candidate.getProfile() | On load | REST merge |
| **Assessment** | api.assessments.getQuestions() | On load | REST |
| **Skill Heist** | localStorage (roadmap) | On complete | localStorage |
| **AI Job Finder** | api.matching.getRecommendedJobs() | Filter change | REST |
| **Career Pathways** | api.learning.getResources() | On load | REST + mock |
| **Simulation Vault** | api.simulation.listScenarios() | Create/save | REST + localStorage |
| **Employer Dashboard** | api.research.getMarketData() | On load | Mock + REST |
| **Talent Vault** | api.talent.search() | Filter change | REST |
| **Workforce Simulator** | api.simulation.run() | On calculate | REST |
| **Company Profile** | localStorage + api.request() | User edit | localStorage + REST |
| **Workforce Gaps** | api.talent.analyzeWorkforceGaps() | On load | REST |
| **Learning Paths** | api.learning.getRecommended() | On load | REST + mock |
| **Technical Interviews** | api.interviews.getQuestions() | Filter change | REST + seed data |
| **Research Papers** | api.research.getItems() | Filter change | REST + mock |
| **Intelligence Feed** | mockIntelligenceFeed | On load | Mock only |

---

## 8. Data Validation & Constraints

### 8.1 Candidate Profile Constraints

```
Field              | Type   | Constraint             | Validation
-------------------|--------|------------------------|------------------
id                 | TEXT   | NOT NULL, PK           | UUID v4
user_id            | TEXT   | NOT NULL, UNIQUE FK    | Exists in users
name               | TEXT   | NOT NULL, LENGTH(1-255)| Non-empty
headline           | TEXT   | NULL, LENGTH(0-200)   | Optional
email              | TEXT   | Format check via FK    | Valid email
location           | TEXT   | NULL, LENGTH(0-100)   | City, Country
total_experience_  | REAL   | >= 0, <= 60            | Positive number
  years            |        |                        | Max 60 years
target_roles       | JSON[] | 1-5 items              | Role IDs exist
portfolio_links    | JSON[] | 0-10 items             | Valid URLs
role_readiness     | INT    | 0-99 (computed)        | Formula: avg(skills) * 0.9 + 5
```

### 8.2 Skill Score Validation

```
Score Source           | Range    | Trust Weight | Verification
------------------------|----------|--------------|------------------
self_reported_score    | 1-10     | 40%          | User entry (lowest trust)
assessment_score       | 1-10     | 60%          | Graded exam (medium trust)
verified_score         | 1-10     | 100%         | Proctored exam (highest trust)

Composite Score = 
  (self_reported * 0.4 + assessment * 0.6 + verified * 1.0) / applicable_weights
```

### 8.3 Match Score Formula

```
overall_match = (
  skill_match * 0.40 +
  experience_match * 0.25 +
  role_match * 0.20 +
  location_match * 0.15
) / 100

Categorization:
- Immediate-Fit: >= 80
- Growth-Fit: 60-79
- Stretch: < 60
```

---

## 9. Performance & Scaling Considerations

### 9.1 Pagination Strategy

```
GET /matching/jobs/recommended?page=1&pageSize=25
    ↓
Response:
{
  data: [25 jobs],
  meta: {
    page: 1,
    pageSize: 25,
    total: 1250,
    hasNext: true
  }
}
```

### 9.2 Caching Strategy

```
Client-Side Cache (localStorage):
├── Candidate profile: 5 min TTL
├── Job recommendations: 10 min TTL
├── Mock market data: No expire
└── User sessions: Until logout

Backend Cache (Redis planned):
├── User profiles: 30 min
├── Market intelligence: 6 hours
├── Skill demand signals: 24 hours
└── Job matches: 5 min (frequently changes)
```

### 9.3 Indexing Strategy

```
Hot Query Indexes (created):
├── idx_users_email (auth lookups)
├── idx_candidate_skills_candidate (profile hydration)
├── idx_assessment_attempts_user (candidate history)
├── idx_skill_gaps_candidate (gap analysis)
├── idx_job_matches_candidate (match retrieval)
├── idx_notifications_user (notification center)
└── idx_org_users_org (employer org data)

Compound indexes (future):
├── (user_id, created_at DESC) on assessment_attempts
├── (candidate_id, skill_id) on candidate_skills
└── (organization_id, status) on candidate_shortlists
```

---

## 10. Data Quality & Integrity

### 10.1 Referential Integrity

```
Cascade Delete Rules:
├── users → sessions (DELETE CASCADE)
├── users → candidate_profiles (DELETE CASCADE)
├── candidate_profiles → candidate_skills (DELETE CASCADE)
├── organizations → organization_users (DELETE CASCADE)
└── assessments → assessment_questions (DELETE CASCADE)

Unique Constraints:
├── users.email (UNIQUE)
├── sessions.token (UNIQUE)
├── candidate_profiles.user_id (UNIQUE 1:1)
├── candidate_preferences.candidate_id (UNIQUE 1:1)
├── candidate_skills (UNIQUE candidate_id, skill_id)
├── learning_progress (UNIQUE user_id, resource_id)
└── candidate_shortlists (UNIQUE organization_id, candidate_id)
```

### 10.2 Data Audit Trail

```
All mutations tracked in audit_log:
├── user_id (who made change)
├── action (CREATE|UPDATE|DELETE|VIEW)
├── entity_type (candidate_profile, assessment, etc)
├── entity_id (target record)
├── metadata (JSON: old_value, new_value, reason)
├── timestamp (when)
└── ip_address (from where)

Retention Policy:
├── 90 days: Full audit detail
├── 1 year: Aggregated audit summary
└── >1 year: Deleted (GDPR compliance)
```

---

## 11. Data Migration & Sync

### 11.1 SQLite and PostgreSQL Sync

**SQL Dialect Translation:**
```
SQLite Query          → PostgreSQL Query
────────────────────────────────────────
datetime('now')       → NOW()
?                     → $1, $2, $3 (parameterized)
AUTOINCREMENT         → SERIAL
TEXT COLLATE NOCASE   → (no equivalent, use case-insensitive functions)
```

**Dual-Write Strategy:**
```
On Write:
1. Prepare SQL query
2. Translate to PostgreSQL dialect
3. Execute on PostgreSQL pool
4. On success: Log transaction ID
5. Fallback to SQLite if PG fails

On Read:
1. If PostgreSQL available: Query PG (primary)
2. If offline: Query SQLite (fallback)
3. On reconnect: Sync SQLite → PostgreSQL (merge strategy)
```

### 11.2 Data Seeding

**Initial Seed Population:**
```
Candidates (2):
├── Rahul Sharma (Full Stack)
└── Priya Patel (AI/ML)

Organizations (1):
└── TechCorp India

Interview Questions (6):
├── Google: Rate limiter system design
├── Microsoft: React state manager
├── Amazon: Payment idempotency
├── Razorpay: Webhook reliability
└── Meta + Netflix: Custom questions

Research Papers (2):
├── Attention Is All You Need (arXiv:1706.03762)
└── State of JavaScript 2026 (stateofjs.com)

Learning Resources (12):
├── TypeScript Advanced Patterns
├── Docker in Production
├── AWS Solutions Architect
└── Various Udemy/Coursera courses

User Presets (4):
├── rahul@example.com (Candidate)
├── priya@example.com (Candidate)
├── recruiter@techcorp.in (Recruiter)
└── admin@rozgaar.in (Admin)
```

---

## 12. Future Data Architecture Roadmap

### 12.1 Planned Enhancements

**Phase 1 (Q4 2026):**
- [ ] Redis caching layer for hot data
- [ ] Elasticsearch for full-text search (interview Q's, research papers)
- [ ] Data warehouse (BigQuery) for analytics
- [ ] Incremental sync strategy for large datasets

**Phase 2 (Q1 2027):**
- [ ] Graph database for skill relationship mapping
- [ ] Time-series database (InfluxDB) for market trend tracking
- [ ] Event streaming (Kafka) for real-time workforce updates
- [ ] ML feature store for ML model training data

**Phase 3 (Q2 2027):**
- [ ] Data lake for raw data ingestion
- [ ] Automated data quality pipelines
- [ ] PII anonymization & GDPR compliance automation
- [ ] Multi-region replication for DR

### 12.2 API Versioning Strategy

```
Current: v1 (2026)
├── /api/v1/candidates/*
├── /api/v1/matching/*
└── /api/v1/talent/*

Planned: v2 (2027)
├── New GraphQL endpoint alongside REST
├── Batch operation support
├── WebSocket subscriptions for real-time data
└── Backward compatibility with v1
```

---

## 13. Summary

**La Casa De Rozgaar** implements a **hybrid, resilient data architecture** that bridges:

- **33 database tables** across 10 semantic domains
- **50+ REST API endpoints** with mock fallback
- **3-layer persistence** (memory, localStorage, backend DB)
- **Event-driven state sync** with localStorage & window events
- **Dual SQL dialect support** (SQLite + PostgreSQL)
- **Comprehensive data validation** & referential integrity

This architecture enables:
- Offline-first candidate experience  
- Real-time employer workforce intelligence  
- Seamless skill gap -> learning path -> job match pipeline  
- Audit trail & compliance tracking  
- Flexible scaling to Redis + Elasticsearch + Data Warehouse  

**Key Design Principles:**
1. **Resilience:** Offline fallback to mock data + localStorage
2. **Performance:** 3-layer caching with smart invalidation
3. **Correctness:** ACID transactions, referential integrity, audit trails
4. **Scalability:** Indexed queries, pagination, event-driven updates
5. **Developer Experience:** Centralized `api` service, mock data patterns, clear contracts

---

**Document Version:** 1.0  
**Last Updated:** 2026-10-06  
**Maintainers:** Backend (Neon PG), Frontend (React Context + localStorage)
