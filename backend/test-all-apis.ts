process.env.NODE_ENV = 'test';
import request from 'supertest';
import { createApp } from './src/server.js';
import { getDb } from './src/database/connection.js';

const app = createApp();

interface TestSuiteResult {
  route: string;
  method: string;
  status: number;
  expectedStatus: number[];
  success: boolean;
  message?: string;
}

const results: TestSuiteResult[] = [];

async function runTests() {
  console.log('================================================================');
  console.log('[TEST] COMPREHENSIVE END-TO-END API TEST SUITE');
  console.log('================================================================\n');

  let token = '';
  let candidateToken = '';
  let adminToken = '';

  // 1. Health & Root
  console.log('--- 1. Base & Health Endpoints ---');
  try {
    const res = await request(app).get('/health');
    record('GET', '/health', res.status, [200]);
  } catch (e: any) { record('GET', '/health', 500, [200], e.message); }

  try {
    const res = await request(app).get('/');
    record('GET', '/', res.status, [200]);
  } catch (e: any) { record('GET', '/', 500, [200], e.message); }

  // 2. Authentication Flow
  console.log('\n--- 2. Auth Flow ---');
  try {
    const testEmail = `test_user_${Date.now()}@example.com`;
    const regRes = await request(app).post('/api/v1/auth/register').send({
      email: testEmail,
      password: 'Password123!',
      name: 'Automated Tester',
      role: 'CANDIDATE'
    });
    record('POST', '/api/v1/auth/register', regRes.status, [201, 200]);
    token = regRes.body.data?.token || '';
    candidateToken = token;
  } catch (e: any) { record('POST', '/api/v1/auth/register', 500, [201, 200], e.message); }

  try {
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'rahul@example.com',
      password: 'password123'
    });
    record('POST', '/api/v1/auth/login (Candidate)', loginRes.status, [200]);
    if (loginRes.body.data?.token) candidateToken = loginRes.body.data.token;
  } catch (e: any) { record('POST', '/api/v1/auth/login (Candidate)', 500, [200], e.message); }

  try {
    const adminLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@lacasaderozgaar.in',
      password: 'adminpassword123'
    });
    record('POST', '/api/v1/auth/login (Admin)', adminLoginRes.status, [200, 401]);
    if (adminLoginRes.body.data?.token) adminToken = adminLoginRes.body.data.token;
  } catch (e: any) { record('POST', '/api/v1/auth/login (Admin)', 500, [200], e.message); }

  try {
    const meRes = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${candidateToken}`);
    record('GET', '/api/v1/auth/me', meRes.status, [200]);
  } catch (e: any) { record('GET', '/api/v1/auth/me', 500, [200], e.message); }

  // 3. Candidate Profiles & Skills
  console.log('\n--- 3. Candidate Profile & Skills ---');
  try {
    const profRes = await request(app).get('/api/v1/candidates/profile').set('Authorization', `Bearer ${candidateToken}`);
    record('GET', '/api/v1/candidates/profile', profRes.status, [200]);
  } catch (e: any) { record('GET', '/api/v1/candidates/profile', 500, [200], e.message); }

  try {
    const putProfRes = await request(app).put('/api/v1/candidates/profile').set('Authorization', `Bearer ${candidateToken}`).send({
      headline: 'Senior Lead Architect',
      location: 'Bengaluru, India'
    });
    record('PUT', '/api/v1/candidates/profile', putProfRes.status, [200]);
  } catch (e: any) { record('PUT', '/api/v1/candidates/profile', 500, [200], e.message); }

  try {
    const skillsRes = await request(app).get('/api/v1/candidates/skills').set('Authorization', `Bearer ${candidateToken}`);
    record('GET', '/api/v1/candidates/skills', skillsRes.status, [200]);
  } catch (e: any) { record('GET', '/api/v1/candidates/skills', 500, [200], e.message); }

  try {
    const addSkillRes = await request(app).post('/api/v1/candidates/skills').set('Authorization', `Bearer ${candidateToken}`).send({
      skillId: 'skill_rust',
      skillName: 'Rust',
      selfReportedScore: 8.5
    });
    record('POST', '/api/v1/candidates/skills', addSkillRes.status, [200, 201]);
  } catch (e: any) { record('POST', '/api/v1/candidates/skills', 500, [200, 201], e.message); }

  // 4. Job Matching Engine
  console.log('\n--- 4. Job Matching & Real Postings ---');
  try {
    const matchRes = await request(app).get('/api/v1/matching/jobs/recommended').set('Authorization', `Bearer ${candidateToken}`);
    record('GET', '/api/v1/matching/jobs/recommended', matchRes.status, [200]);
  } catch (e: any) { record('GET', '/api/v1/matching/jobs/recommended', 500, [200], e.message); }

  // 5. Assessments
  console.log('\n--- 5. Assessments ---');
  try {
    const assessRes = await request(app).get('/api/v1/assessments').set('Authorization', `Bearer ${candidateToken}`);
    record('GET', '/api/v1/assessments', assessRes.status, [200]);
  } catch (e: any) { record('GET', '/api/v1/assessments', 500, [200], e.message); }

  // 6. Research, Live Radar & Feeds
  console.log('\n--- 6. Research & Live Market Radar ---');
  try {
    const radarRes = await request(app).get('/api/v1/research/market-radar').set('Authorization', `Bearer ${candidateToken}`);
    record('GET', '/api/v1/research/market-radar', radarRes.status, [200]);
  } catch (e: any) { record('GET', '/api/v1/research/market-radar', 500, [200], e.message); }

  try {
    const feedRes = await request(app).get('/api/v1/research/feed').set('Authorization', `Bearer ${candidateToken}`);
    record('GET', '/api/v1/research/feed', feedRes.status, [200]);
  } catch (e: any) { record('GET', '/api/v1/research/feed', 500, [200], e.message); }

  try {
    const researchItemsRes = await request(app).get('/api/v1/research').set('Authorization', `Bearer ${candidateToken}`);
    record('GET', '/api/v1/research', researchItemsRes.status, [200]);
  } catch (e: any) { record('GET', '/api/v1/research', 500, [200], e.message); }

  // 7. Compensation & Forecast
  console.log('\n--- 7. Compensation & Forecast ---');
  try {
    const compRes = await request(app).get('/api/v1/compensation?roleId=role_fullstack&location=India').set('Authorization', `Bearer ${candidateToken}`);
    record('GET', '/api/v1/compensation', compRes.status, [200]);
  } catch (e: any) { record('GET', '/api/v1/compensation', 500, [200], e.message); }

  try {
    const fcRes = await request(app).get('/api/v1/compensation/forecast?roleId=role_fullstack&horizon=12m').set('Authorization', `Bearer ${candidateToken}`);
    record('GET', '/api/v1/compensation/forecast', fcRes.status, [200]);
  } catch (e: any) { record('GET', '/api/v1/compensation/forecast', 500, [200], e.message); }

  // 8. Learning Resources
  console.log('\n--- 8. Learning Resources ---');
  try {
    const learnRes = await request(app).get('/api/v1/learning/resources').set('Authorization', `Bearer ${candidateToken}`);
    record('GET', '/api/v1/learning/resources', learnRes.status, [200]);
  } catch (e: any) { record('GET', '/api/v1/learning/resources', 500, [200], e.message); }

  // 9. Interviews
  console.log('\n--- 9. Interview Intelligence ---');
  try {
    const intRes = await request(app).get('/api/v1/interviews/questions').set('Authorization', `Bearer ${candidateToken}`);
    record('GET', '/api/v1/interviews/questions', intRes.status, [200]);
  } catch (e: any) { record('GET', '/api/v1/interviews/questions', 500, [200], e.message); }

  // 10. Talent Search
  console.log('\n--- 10. Talent Vault Search ---');
  try {
    const talentRes = await request(app).post('/api/v1/talent/search').set('Authorization', `Bearer ${candidateToken}`).send({
      roleId: 'role_fullstack'
    });
    record('POST', '/api/v1/talent/search', talentRes.status, [200]);
  } catch (e: any) { record('POST', '/api/v1/talent/search', 500, [200], e.message); }

  // 11. Cron & Data Collection
  console.log('\n--- 11. Cron Endpoints ---');
  try {
    const cronRes = await request(app).get('/api/v1/cron/collect-jobs');
    record('GET', '/api/v1/cron/collect-jobs', cronRes.status, [200, 401]);
  } catch (e: any) { record('GET', '/api/v1/cron/collect-jobs', 500, [200], e.message); }

  // Summary
  console.log('\n================================================================');
  console.log('[SUMMARY] TEST EXECUTION SUMMARY:');
  console.log('================================================================');
  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const icon = r.success ? '[PASS]' : '[FAIL]';
    console.log(`${icon} [${r.method}] ${r.route} -> Status: ${r.status} (Expected: ${r.expectedStatus.join(', ')}) ${r.message || ''}`);
    if (r.success) passed++;
    else failed++;
  }

  console.log(`\nTOTAL: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

function record(method: string, route: string, status: number, expectedStatus: number[], message?: string) {
  const success = expectedStatus.includes(status);
  results.push({ method, route, status, expectedStatus, success, message });
}

runTests();
