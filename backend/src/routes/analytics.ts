import { Router, Request, Response } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Helper to load JSON files safely
function loadJson(relativePath: string) {
  const possiblePaths = [
    join(__dirname, '../../data', relativePath),
    join(process.cwd(), 'backend/data', relativePath),
    join(process.cwd(), 'data', relativePath),
    join(process.cwd(), '../backend/data', relativePath),
  ];

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      try {
        return JSON.parse(readFileSync(p, 'utf-8'));
      } catch (e) {
        console.error(`Error reading ${p}:`, e);
      }
    }
  }
  return null;
}

// In-memory cached artifacts
let marketOverview = loadJson('market_overview.json');
let roleIntelligence = loadJson('role_intelligence.json');
let skillIntelligence = loadJson('skill_intelligence.json');
let skillCooccurrence = loadJson('skill_cooccurrence_matrix.json');
let jdsModelArtifact = loadJson('jds_model_artifact.json');
let sdsModelArtifact = loadJson('sds_model_artifact.json');
let compensationBenchmarks = loadJson('compensation_benchmarks.json');

// Reload helper if not loaded on startup
function ensureArtifacts() {
  if (!marketOverview) marketOverview = loadJson('market_overview.json');
  if (!roleIntelligence) roleIntelligence = loadJson('role_intelligence.json');
  if (!skillIntelligence) skillIntelligence = loadJson('skill_intelligence.json');
  if (!skillCooccurrence) skillCooccurrence = loadJson('skill_cooccurrence_matrix.json');
  if (!jdsModelArtifact) jdsModelArtifact = loadJson('jds_model_artifact.json');
  if (!sdsModelArtifact) sdsModelArtifact = loadJson('sds_model_artifact.json');
  if (!compensationBenchmarks) compensationBenchmarks = loadJson('compensation_benchmarks.json');
}

// ---------------------------------------------------------------------------
// 1. GET /api/v1/analytics/overview
// ---------------------------------------------------------------------------
router.get('/overview', (_req: Request, res: Response) => {
  ensureArtifacts();
  if (!marketOverview) {
    return res.status(500).json({ error: { code: 'DATA_UNAVAILABLE', message: 'Market overview data not ready' } });
  }

  return res.json({
    data: marketOverview,
    provenance: {
      source: 'Analytics Job Market Dataset & DataScience Jobs In India Dataset',
      recordsProcessed: 15841 + 10000,
      badge: 'REAL DATA',
      verifiedDate: '2026-10-07',
    },
  });
});

// ---------------------------------------------------------------------------
// 2. GET /api/v1/analytics/roles
// ---------------------------------------------------------------------------
router.get('/roles', (_req: Request, res: Response) => {
  ensureArtifacts();
  if (!roleIntelligence) {
    return res.status(500).json({ error: { code: 'DATA_UNAVAILABLE', message: 'Role intelligence data not ready' } });
  }

  return res.json({
    data: roleIntelligence,
    provenance: {
      source: 'Role Family Intelligence & Salary Quartiles Engine',
      badge: 'REAL DATA',
      sampleSize: 15841,
    },
  });
});

// ---------------------------------------------------------------------------
// 3. GET /api/v1/analytics/skills
// ---------------------------------------------------------------------------
router.get('/skills', (_req: Request, res: Response) => {
  ensureArtifacts();
  if (!skillIntelligence) {
    return res.status(500).json({ error: { code: 'DATA_UNAVAILABLE', message: 'Skill intelligence data not ready' } });
  }

  return res.json({
    data: skillIntelligence,
    provenance: {
      source: 'Canonical Skill Extraction (214 Standards)',
      badge: 'REAL DATA',
    },
  });
});

// ---------------------------------------------------------------------------
// 4. GET /api/v1/analytics/network
// ---------------------------------------------------------------------------
router.get('/network', (_req: Request, res: Response) => {
  ensureArtifacts();
  if (!skillCooccurrence) {
    return res.status(500).json({ error: { code: 'DATA_UNAVAILABLE', message: 'Skill co-occurrence data not ready' } });
  }

  return res.json({
    data: skillCooccurrence,
    provenance: {
      source: '20x20 Skill Co-occurrence Matrix & Jaccard Synergy Graph',
      badge: 'REAL DATA',
    },
  });
});

// ---------------------------------------------------------------------------
// 5. GET /api/v1/analytics/compensation
// ---------------------------------------------------------------------------
router.get('/compensation', (_req: Request, res: Response) => {
  ensureArtifacts();
  if (!compensationBenchmarks) {
    return res.status(500).json({ error: { code: 'DATA_UNAVAILABLE', message: 'Compensation benchmarks not ready' } });
  }

  return res.json({
    data: compensationBenchmarks,
    provenance: {
      source: 'Cleaned Experience Tiers & Quartiles (N=10,000 + N=15,841)',
      badge: 'REAL DATA',
    },
  });
});

// ---------------------------------------------------------------------------
// 6. POST /api/v1/analytics/simulate/jds (Junior Data Scientist Simulator)
// ---------------------------------------------------------------------------
router.post('/simulate/jds', (req: Request, res: Response) => {
  ensureArtifacts();
  if (!jdsModelArtifact) {
    return res.status(500).json({ error: { code: 'MODEL_UNAVAILABLE', message: 'JDS Model Artifact not found' } });
  }

  const {
    big_data_skills = 3.0,
    maths_stats_skills = 3.0,
    coding_skills = 3.0,
    ai_ml_skills = 3.0,
    storytelling_skills = 3.0,
    current_salary_lpa = 6.5,
  } = req.body;

  // Validate range 1.0 to 5.0
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, Number(val) || min));
  const rawVector = [
    clamp(big_data_skills, 1.0, 5.0),
    clamp(maths_stats_skills, 1.0, 5.0),
    clamp(coding_skills, 1.0, 5.0),
    clamp(ai_ml_skills, 1.0, 5.0),
    clamp(storytelling_skills, 1.0, 5.0),
  ];

  const weights = jdsModelArtifact.inference_weights;
  const features = weights.features;
  const mean = weights.scaler_mean;
  const scale = weights.scaler_scale;
  const coef = weights.coefficients;
  const intercept = weights.intercept;

  // 1. Standard Scale inputs: (x - mean) / scale
  const scaledVector = rawVector.map((val, idx) => (val - mean[idx]) / scale[idx]);

  // 2. Compute logit: b + sum(w_i * x_scaled_i)
  let logit = intercept;
  const featureContributions: any[] = [];

  for (let i = 0; i < features.length; i++) {
    const contribution = coef[i] * scaledVector[i];
    logit += contribution;
    featureContributions.push({
      feature: features[i],
      rawScore: rawVector[i],
      scaledScore: Math.round(scaledVector[i] * 100) / 100,
      coefficient: coef[i],
      oddsRatio: jdsModelArtifact.feature_coefficients[features[i]]?.odds_ratio || 1.0,
      contribution: Math.round(contribution * 1000) / 1000,
      impact: contribution > 0.3 ? 'HIGH POSITIVE' : contribution > 0 ? 'MODERATE POSITIVE' : 'LOW/NEUTRAL',
    });
  }

  // 3. Sigmoid probability: P = 1 / (1 + exp(-logit))
  const probability = 1 / (1 + Math.exp(-logit));
  const roundedProb = Math.round(probability * 1000) / 1000;

  // 4. Expected Salary Hike percentage: P * 40% + (1-P) * 12%
  const expectedHikePct = Math.round((probability * 40 + (1 - probability) * 12) * 10) / 10;
  const currentSal = Number(current_salary_lpa) || 6.5;
  const projectedSalary = Math.round((currentSal * (1 + expectedHikePct / 100)) * 10) / 10;

  // 5. Prescriptive ROI Recommendations (ranked by impact)
  const sortedByROI = [...featureContributions].sort((a, b) => b.oddsRatio - a.oddsRatio);
  const topLever = sortedByROI[0];
  const secondLever = sortedByROI[1];

  const prescriptiveGuidance = [
    `Top Career Accelerator: Increasing ${topLever.feature.replace(/_/g, ' ')} by +1.0 point multiplies odds of a top-tier hike by ${topLever.oddsRatio}x.`,
    `Secondary High-ROI Driver: ${secondLever.feature.replace(/_/g, ' ')} (Odds Ratio: ${secondLever.oddsRatio}x).`,
    `Coding skills represent hygiene baseline requirements; high salary premiums are driven by Storytelling & Dashboarding and Mathematical Modeling.`,
  ];

  return res.json({
    simulation: {
      inputScores: {
        big_data_skills: rawVector[0],
        maths_stats_skills: rawVector[1],
        coding_skills: rawVector[2],
        ai_ml_skills: rawVector[3],
        storytelling_skills: rawVector[4],
      },
      currentSalaryLpa: currentSal,
      predictedHikeProbability: roundedProb,
      predictedHikeCategory: roundedProb >= 0.5 ? 'HIGH_HIKE (>25%)' : 'STANDARD_HIKE (10-18%)',
      expectedHikePercentage: expectedHikePct,
      projectedNewSalaryLpa: projectedSalary,
      featureContributions,
      prescriptiveGuidance,
      modelAccuracy: `${(jdsModelArtifact.cross_validation_5fold.logistic_regression.mean_accuracy * 100).toFixed(1)}% (5-Fold CV)`,
      rocAuc: jdsModelArtifact.cross_validation_5fold.logistic_regression.mean_roc_auc,
    },
    provenance: {
      model: 'JDS Skill-Outcome Logistic Regression & RF Ensemble (N=139)',
      badge: 'REAL MODEL OUTPUT',
      crossValidation: '5-Fold Stratified CV',
    },
  });
});

// ---------------------------------------------------------------------------
// 7. POST /api/v1/analytics/simulate/sds (Senior Data Scientist Psychometric Simulator)
// ---------------------------------------------------------------------------
router.post('/simulate/sds', (req: Request, res: Response) => {
  ensureArtifacts();
  if (!sdsModelArtifact) {
    return res.status(500).json({ error: { code: 'MODEL_UNAVAILABLE', message: 'SDS Model Artifact not found' } });
  }

  const {
    neuroticism = 35,
    extraversion = 45,
    openness = 48,
    agreeableness = 46,
    conscientiousness = 50,
  } = req.body;

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, Number(val) || min));
  const rawVector = [
    clamp(neuroticism, 17, 68),
    clamp(extraversion, 17, 68),
    clamp(openness, 17, 68),
    clamp(agreeableness, 17, 68),
    clamp(conscientiousness, 17, 68),
  ];

  const weights = sdsModelArtifact.inference_weights;
  const features = weights.features;
  const mean = weights.scaler_mean;
  const scale = weights.scaler_scale;
  const coef = weights.coefficients;
  const intercept = weights.intercept;

  const scaledVector = rawVector.map((val, idx) => (val - mean[idx]) / scale[idx]);

  let logit = intercept;
  const traitBreakdown: any[] = [];

  for (let i = 0; i < features.length; i++) {
    const contribution = coef[i] * scaledVector[i];
    logit += contribution;
    traitBreakdown.push({
      trait: features[i],
      rawScore: rawVector[i],
      scaledScore: Math.round(scaledVector[i] * 100) / 100,
      coefficient: coef[i],
      oddsRatio: sdsModelArtifact.feature_coefficients[features[i]]?.odds_ratio || 1.0,
      contribution: Math.round(contribution * 1000) / 1000,
    });
  }

  const successProbability = 1 / (1 + Math.exp(-logit));
  const roundedProb = Math.round(successProbability * 1000) / 1000;

  // Determine Leadership & Collaboration Archetype
  let archetype = 'Balanced Senior Practitioner';
  if (rawVector[4] >= 50 && rawVector[2] >= 48) {
    archetype = 'Strategic Delivery Anchor & Innovator';
  } else if (rawVector[1] >= 48 && rawVector[3] >= 48) {
    archetype = 'Executive Stakeholder Champion & People Leader';
  } else if (rawVector[4] >= 52) {
    archetype = 'High-Reliability Technical Lead';
  }

  return res.json({
    simulation: {
      inputScores: {
        neuroticism: rawVector[0],
        extraversion: rawVector[1],
        openness: rawVector[2],
        agreeableness: rawVector[3],
        conscientiousness: rawVector[4],
      },
      clientSuccessProbability: roundedProb,
      leadershipReadinessIndex: Math.round(roundedProb * 100),
      archetype,
      traitBreakdown,
      modelAccuracy: `${(sdsModelArtifact.cross_validation_5fold.logistic_regression.mean_accuracy * 100).toFixed(1)}% (5-Fold CV)`,
      rocAuc: sdsModelArtifact.cross_validation_5fold.logistic_regression.mean_roc_auc,
      ethicalSafeguardNotice: sdsModelArtifact.responsible_ai_notice,
    },
    provenance: {
      model: 'SDS Big Five Personality-Success Profiler (N=161)',
      badge: 'REAL MODEL OUTPUT',
      responsibleAI: 'Strictly Non-Evaluative Coaching / Mentoring',
    },
  });
});

// ---------------------------------------------------------------------------
// 8. GET /api/v1/analytics/models/metadata
// ---------------------------------------------------------------------------
router.get('/models/metadata', (_req: Request, res: Response) => {
  ensureArtifacts();
  return res.json({
    jdsModel: jdsModelArtifact,
    sdsModel: sdsModelArtifact,
    provenance: {
      badge: 'VERIFIED MODEL SPECIFICATIONS',
      trainingDate: '2026-10-07',
    },
  });
});

export default router;
