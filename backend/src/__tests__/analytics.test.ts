import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../server.js';

const app = createApp();

describe('Priority 4: Real Workforce Analytics & Simulation Engine Endpoints', () => {
  it('GET /api/v1/analytics/overview returns macro labor metrics and provenance', async () => {
    const res = await request(app).get('/api/v1/analytics/overview');
    expect(res.status).toBe(200);
    expect(res.body.data.metrics.total_job_openings_represented).toBe(108846);
    expect(res.body.data.metrics.median_salary_lakhs).toBe(11.9);
    expect(res.body.provenance.badge).toBe('REAL DATA');
  });

  it('GET /api/v1/analytics/roles returns 10 role families with salary quartiles', async () => {
    const res = await request(app).get('/api/v1/analytics/roles');
    expect(res.status).toBe(200);
    expect(res.body.data.roles).toHaveLength(10);
    expect(res.body.data.roles[0].salary_metrics.median_lakhs).toBeGreaterThan(0);
    expect(res.body.data.roles[0].top_hiring_companies).toBeInstanceOf(Array);
  });

  it('GET /api/v1/analytics/skills returns canonical skill penetration rates', async () => {
    const res = await request(app).get('/api/v1/analytics/skills');
    expect(res.status).toBe(200);
    expect(res.body.data.top_skills.length).toBeGreaterThanOrEqual(20);
    const sqlSkill = res.body.data.top_skills.find((s: any) => s.skill_name === 'SQL');
    expect(sqlSkill).toBeDefined();
    expect(sqlSkill.demand_count).toBeGreaterThan(1000);
  });

  it('GET /api/v1/analytics/network returns 20x20 skill co-occurrence matrix', async () => {
    const res = await request(app).get('/api/v1/analytics/network');
    expect(res.status).toBe(200);
    expect(res.body.data.nodes).toHaveLength(20);
    expect(Object.keys(res.body.data.matrix)).toHaveLength(20);
    expect(res.body.provenance.badge).toBe('REAL DATA');
  });

  it('POST /api/v1/analytics/simulate/jds executes ML-backed skill-to-salary simulation', async () => {
    const res = await request(app)
      .post('/api/v1/analytics/simulate/jds')
      .send({
        big_data_skills: 4.8,
        maths_stats_skills: 4.9,
        coding_skills: 4.0,
        ai_ml_skills: 4.2,
        storytelling_skills: 4.9,
        current_salary_lpa: 7.0,
      });

    expect(res.status).toBe(200);
    expect(res.body.simulation.predictedHikeProbability).toBeGreaterThan(0.5);
    expect(res.body.simulation.expectedHikePercentage).toBeGreaterThan(20);
    expect(res.body.simulation.projectedNewSalaryLpa).toBeGreaterThan(7.0);
    expect(res.body.simulation.featureContributions).toHaveLength(5);
    expect(res.body.provenance.badge).toBe('REAL MODEL OUTPUT');
  });

  it('POST /api/v1/analytics/simulate/sds executes Big Five psychometric success simulation', async () => {
    const res = await request(app)
      .post('/api/v1/analytics/simulate/sds')
      .send({
        neuroticism: 30,
        extraversion: 52,
        openness: 54,
        agreeableness: 50,
        conscientiousness: 58,
      });

    expect(res.status).toBe(200);
    expect(res.body.simulation.clientSuccessProbability).toBeGreaterThan(0.7);
    expect(res.body.simulation.leadershipReadinessIndex).toBeGreaterThan(70);
    expect(res.body.simulation.ethicalSafeguardNotice).toBeDefined();
    expect(res.body.provenance.badge).toBe('REAL MODEL OUTPUT');
  });

  it('GET /api/v1/analytics/models/metadata returns cross-validation metrics', async () => {
    const res = await request(app).get('/api/v1/analytics/models/metadata');
    expect(res.status).toBe(200);
    expect(res.body.jdsModel.cross_validation_5fold.logistic_regression.mean_accuracy).toBeGreaterThan(0.8);
    expect(res.body.sdsModel.cross_validation_5fold.logistic_regression.mean_accuracy).toBeGreaterThan(0.85);
  });
});
