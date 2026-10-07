import { Router, Request, Response } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate, authorize, auditLog } from '../middleware/auth.js';
import { config } from '../config.js';

const router = Router();
router.use(authenticate);

// ---- LIST ASSESSMENTS ----
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 25;
    const offset = (page - 1) * pageSize;

    const countRes = await db.prepare('SELECT COUNT(*) as count FROM assessments').get() as { count: number | string };
    const total = Number(countRes?.count || 0);
    const assessments = (await db.prepare('SELECT * FROM assessments ORDER BY created_at DESC LIMIT ? OFFSET ?').all(pageSize, offset) || []) as any[];
    assessments.forEach(a => {
      try { a.skills = typeof a.skills === 'string' ? JSON.parse(a.skills || '[]') : (a.skills || []); } catch { a.skills = []; }
      try { a.rules = typeof a.rules === 'string' ? JSON.parse(a.rules || '[]') : (a.rules || []); } catch { a.rules = []; }
    });

    return res.json({ data: assessments, meta: { requestId: req.requestId, page, pageSize, total } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ASSESSMENTS_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- GET ASSESSMENT ----
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const assessment = await db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id) as any;
    if (!assessment) {
      return res.status(404).json({ error: { code: 'ASSESSMENT_NOT_FOUND', message: 'Assessment not found', requestId: req.requestId } });
    }
    try { assessment.skills = typeof assessment.skills === 'string' ? JSON.parse(assessment.skills || '[]') : (assessment.skills || []); } catch { assessment.skills = []; }
    try { assessment.rules = typeof assessment.rules === 'string' ? JSON.parse(assessment.rules || '[]') : (assessment.rules || []); } catch { assessment.rules = []; }
    return res.json({ data: assessment, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ASSESSMENT_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- CREATE ASSESSMENT (admin only) ----
router.post('/', authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { title, description, targetRoleId, skills, difficulty, durationMinutes, rules } = req.body;
    if (!title) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Title is required', requestId: req.requestId } });
    }

    const id = generateId();
    await db.prepare(`INSERT INTO assessments (id, title, description, target_role_id, skills, difficulty, duration_minutes, question_count, rules, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, title, description || null, targetRoleId || null, JSON.stringify(skills || []), difficulty || 'INTERMEDIATE', durationMinutes || 60, 0, JSON.stringify(rules || []), req.user!.userId);

    auditLog(req.user!.userId, 'ASSESSMENT_CREATED', 'assessment', id);
    return res.status(201).json({ data: { id, message: 'Assessment created' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ASSESSMENT_CREATE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- GET QUESTIONS (for an assessment during attempt) ----
router.get('/:id/questions', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    // Check active attempt
    const attempt = await db.prepare('SELECT id, status FROM assessment_attempts WHERE assessment_id = ? AND user_id = ? AND status IN (?, ?)').get(req.params.id, req.user!.userId, 'CREATED', 'IN_PROGRESS') as any;

    const questions = (await db.prepare('SELECT id, assessment_id, type, text, options, skill_ids, difficulty, points, sort_order FROM assessment_questions WHERE assessment_id = ? ORDER BY sort_order').all(req.params.id) || []) as any[];
    questions.forEach(q => {
      try { q.options = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []); } catch { q.options = []; }
      try { q.skill_ids = typeof q.skill_ids === 'string' ? JSON.parse(q.skill_ids || '[]') : (q.skill_ids || []); } catch { q.skill_ids = []; }
    });

    return res.json({ data: questions, meta: { requestId: req.requestId, attemptId: attempt?.id, attemptStatus: attempt?.status } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'QUESTIONS_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- START ATTEMPT ----
router.post('/:id/attempt', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const assessmentId = req.params.id;

    const assessment = await db.prepare('SELECT id, duration_minutes FROM assessments WHERE id = ?').get(assessmentId) as any;
    if (!assessment) {
      return res.status(404).json({ error: { code: 'ASSESSMENT_NOT_FOUND', message: 'Assessment not found', requestId: req.requestId } });
    }

    const questions = (await db.prepare('SELECT id, assessment_id, type, text, options, skill_ids, difficulty, points, sort_order FROM assessment_questions WHERE assessment_id = ? ORDER BY sort_order').all(assessmentId) || []) as any[];
    questions.forEach(q => {
      try { q.options = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : q.options; } catch { q.options = []; }
      try { q.skill_ids = typeof q.skill_ids === 'string' ? JSON.parse(q.skill_ids || '[]') : q.skill_ids; } catch { q.skill_ids = []; }
    });

    // Check for existing active attempt
    const existing = await db.prepare('SELECT id FROM assessment_attempts WHERE assessment_id = ? AND user_id = ? AND status IN (?, ?)').get(assessmentId, req.user!.userId, 'CREATED', 'IN_PROGRESS') as any;
    if (existing) {
      return res.status(201).json({ data: { attemptId: existing.id, assessmentId, questions, message: 'Existing attempt found' }, meta: { requestId: req.requestId } });
    }

    const attemptId = generateId();
    await db.prepare('INSERT INTO assessment_attempts (id, user_id, assessment_id, status) VALUES (?, ?, ?, ?)').run(attemptId, req.user!.userId, assessmentId, 'IN_PROGRESS');

    auditLog(req.user!.userId, 'ASSESSMENT_STARTED', 'assessment_attempt', attemptId);
    return res.status(201).json({ data: { attemptId, assessmentId, questions, message: 'Assessment started' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'START_ATTEMPT_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- SUBMIT ANSWER ----
router.post('/attempts/:attemptId/answers', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const attempt = await db.prepare('SELECT id, assessment_id, status FROM assessment_attempts WHERE id = ? AND user_id = ?').get(req.params.attemptId, req.user!.userId) as any;

    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: { code: 'INVALID_ATTEMPT', message: 'No active attempt found', requestId: req.requestId } });
    }

    const { questionId, answer } = req.body;
    if (!questionId || answer === undefined) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'questionId and answer are required', requestId: req.requestId } });
    }

    // Check answer correctness
    const question = await db.prepare('SELECT correct_answers, points FROM assessment_questions WHERE id = ? AND assessment_id = ?').get(questionId, attempt.assessment_id) as any;
    if (!question) {
      return res.status(404).json({ error: { code: 'QUESTION_NOT_FOUND', message: 'Question not found', requestId: req.requestId } });
    }

    let correctAnswers = [];
    try { correctAnswers = JSON.parse(question.correct_answers || '[]'); } catch { correctAnswers = []; }
    let isCorrect = false;
    let score = 0;

    if (correctAnswers.length > 0) {
      if (Array.isArray(answer)) {
        isCorrect = correctAnswers.length === answer.length && correctAnswers.every((a: string) => answer.includes(a));
      } else {
        isCorrect = correctAnswers.includes(answer);
      }
      score = isCorrect ? (question.points || 1) : 0;
    }

    // Upsert answer
    const existing = await db.prepare('SELECT id FROM assessment_answers WHERE attempt_id = ? AND question_id = ?').get(req.params.attemptId, questionId) as any;
    if (existing) {
      await db.prepare("UPDATE assessment_answers SET answer = ?, is_correct = ?, score = ?, answered_at = datetime('now') WHERE id = ?")
        .run(JSON.stringify(answer), isCorrect ? 1 : 0, score, existing.id);
    } else {
      await db.prepare('INSERT INTO assessment_answers (id, attempt_id, question_id, answer, is_correct, score) VALUES (?, ?, ?, ?, ?, ?)')
        .run(generateId(), req.params.attemptId, questionId, JSON.stringify(answer), isCorrect ? 1 : 0, score);
    }

    return res.json({ data: { message: 'Answer recorded' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ANSWER_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- REPORT INTEGRITY EVENT ----
router.post('/attempts/:attemptId/integrity', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const attempt = await db.prepare('SELECT id, status FROM assessment_attempts WHERE id = ? AND user_id = ?').get(req.params.attemptId, req.user!.userId) as any;

    if (!attempt || !['IN_PROGRESS', 'CREATED'].includes(attempt.status)) {
      return res.status(400).json({ error: { code: 'INVALID_ATTEMPT', message: 'No active attempt found', requestId: req.requestId } });
    }

    const { eventType, metadata, details, severity, source } = req.body;
    if (!eventType) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'eventType is required', requestId: req.requestId } });
    }

    const eventMetadata = metadata || details || null;
    await db.prepare('INSERT INTO assessment_integrity_signals (id, attempt_id, event_type, metadata, severity, source) VALUES (?, ?, ?, ?, ?, ?)')
      .run(generateId(), req.params.attemptId, eventType, eventMetadata ? JSON.stringify(eventMetadata) : null, severity || 'LOW', source || 'CLIENT');

    return res.json({ data: { message: 'Integrity event logged' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'INTEGRITY_LOG_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- SUBMIT ASSESSMENT ----
router.post('/attempts/:attemptId/submit', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const attempt = await db.prepare('SELECT id, assessment_id, user_id, status FROM assessment_attempts WHERE id = ? AND user_id = ?').get(req.params.attemptId, req.user!.userId) as any;

    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: { code: 'INVALID_ATTEMPT', message: 'No active attempt to submit', requestId: req.requestId } });
    }

    // Calculate scores
    const answers = (await db.prepare('SELECT aa.score, aa.is_correct, aq.skill_ids, aq.points FROM assessment_answers aa JOIN assessment_questions aq ON aa.question_id = aq.id WHERE aa.attempt_id = ?').all(req.params.attemptId) || []) as any[];

    let totalScore = 0;
    let totalPoints = 0;
    const skillScores: Record<string, { earned: number; total: number }> = {};

    for (const ans of answers) {
      totalScore += ans.score || 0;
      totalPoints += ans.points || 0;
      let skills = [];
      try { skills = JSON.parse(ans.skill_ids || '[]'); } catch { skills = []; }
      for (const skillId of skills) {
        if (!skillScores[skillId]) skillScores[skillId] = { earned: 0, total: 0 };
        skillScores[skillId].earned += ans.score || 0;
        skillScores[skillId].total += ans.points || 0;
      }
    }

    const normalizedScore = totalPoints > 0 ? (totalScore / totalPoints) * 10 : 0;
    const normalizedSkillScores: Record<string, number> = {};
    for (const [skillId, scores] of Object.entries(skillScores)) {
      normalizedSkillScores[skillId] = scores.total > 0 ? (scores.earned / scores.total) * 10 : 0;
    }

    // Integrity summary
    const integrityEvents = (await db.prepare('SELECT event_type, severity FROM assessment_integrity_signals WHERE attempt_id = ?').all(req.params.attemptId) || []) as any[];
    const eventsByType: Record<string, number> = {};
    let highSeverityCount = 0;
    for (const ev of integrityEvents) {
      eventsByType[ev.event_type] = (eventsByType[ev.event_type] || 0) + 1;
      if (ev.severity === 'HIGH') highSeverityCount++;
    }
    const integritySummary = {
      totalEvents: integrityEvents.length,
      eventsByType,
      highSeverityCount,
      overallRisk: highSeverityCount >= config.assessment.integrityThreshold ? 'HIGH' : integrityEvents.length > 5 ? 'MEDIUM' : 'LOW',
      integrityStatus: highSeverityCount >= config.assessment.integrityThreshold ? 'FLAGGED' : 'CLEAR',
    };

    const status = highSeverityCount >= config.assessment.integrityThreshold ? 'FLAGGED' : 'COMPLETED';

    await db.prepare(`UPDATE assessment_attempts SET
      submitted_at = datetime('now'),
      status = ?,
      score = ?,
      skill_scores = ?,
      integrity_summary = ?
      WHERE id = ?
    `).run(status, Math.round(normalizedScore * 100) / 100, JSON.stringify(normalizedSkillScores), JSON.stringify(integritySummary), req.params.attemptId);

    // Update candidate skill profile with assessment scores
    const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (profile) {
      for (const [skillId, score] of Object.entries(normalizedSkillScores)) {
        const existing = await db.prepare('SELECT id FROM candidate_skills WHERE candidate_id = ? AND skill_id = ?').get(profile.id, skillId) as any;
        const roundedScore = Math.round(score * 10) / 10;
        if (existing) {
          await db.prepare("UPDATE candidate_skills SET assessment_score = ?, verified_score = ?, confidence = ?, last_assessed_at = datetime('now'), source = ? WHERE id = ?")
            .run(roundedScore, roundedScore, 0.85, 'ASSESSMENT', existing.id);
        }
      }
    }

    auditLog(req.user!.userId, 'ASSESSMENT_SUBMITTED', 'assessment_attempt', req.params.attemptId, { score: normalizedScore, status });

    return res.json({
      data: {
        attemptId: req.params.attemptId,
        status,
        score: Math.round(normalizedScore * 100) / 100,
        passed: normalizedScore >= 6.0,
        skillScores: normalizedSkillScores,
        integritySummary,
      },
      meta: { requestId: req.requestId }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SUBMIT_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- GET ATTEMPT RESULTS ----
router.get('/attempts/:attemptId', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const attempt = await db.prepare('SELECT * FROM assessment_attempts WHERE id = ?').get(req.params.attemptId) as any;

    if (!attempt) {
      return res.status(404).json({ error: { code: 'ATTEMPT_NOT_FOUND', message: 'Attempt not found', requestId: req.requestId } });
    }

    // Authorization: only own attempts or admin
    if (attempt.user_id !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied', requestId: req.requestId } });
    }

    try { attempt.skill_scores = attempt.skill_scores ? JSON.parse(attempt.skill_scores) : null; } catch { attempt.skill_scores = null; }
    try { attempt.integrity_summary = attempt.integrity_summary ? JSON.parse(attempt.integrity_summary) : null; } catch { attempt.integrity_summary = null; }

    return res.json({ data: attempt, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ATTEMPT_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- MY ATTEMPTS ----
router.get('/my/attempts', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const attempts = (await db.prepare(`
      SELECT aa.*, a.title as assessment_title
      FROM assessment_attempts aa
      JOIN assessments a ON aa.assessment_id = a.id
      WHERE aa.user_id = ?
      ORDER BY aa.started_at DESC
    `).all(req.user!.userId) || []) as any[];

    attempts.forEach(a => {
      try { a.skill_scores = a.skill_scores ? JSON.parse(a.skill_scores) : null; } catch { a.skill_scores = null; }
      try { a.integrity_summary = a.integrity_summary ? JSON.parse(a.integrity_summary) : null; } catch { a.integrity_summary = null; }
    });

    return res.json({ data: attempts, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'MY_ATTEMPTS_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- DIRECT SUBMIT PROCTORED ASSESSMENT ----
router.post('/submit-direct', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { score, percentage, trustScore, integrityStatus, strikes, violationsCount } = req.body;

    const attemptId = generateId();
    const status = (integrityStatus === 'FLAGGED' || (strikes || 0) >= 3) ? 'FLAGGED' : 'COMPLETED';

    let profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) {
      const newProfileId = generateId();
      await db.prepare('INSERT INTO candidate_profiles (id, user_id, name) VALUES (?, ?, ?)').run(newProfileId, req.user!.userId, 'Candidate');
      profile = { id: newProfileId };
    }

    const integritySummary = {
      trustScore: trustScore ?? 100,
      integrityStatus: integrityStatus || 'CLEAN',
      strikes: strikes ?? 0,
      violationsCount: violationsCount ?? 0,
    };

    let assessment = await db.prepare('SELECT id FROM assessments LIMIT 1').get() as { id: string } | undefined;
    let assessmentId = assessment?.id;
    if (!assessmentId) {
      assessmentId = generateId();
      await db.prepare(`INSERT INTO assessments (id, title, description, difficulty, duration_minutes, question_count, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(assessmentId, 'Secure Diagnostic Assessment', 'Proctored engineering skill assessment', 'INTERMEDIATE', 60, 20, req.user!.userId);
    }

    await db.prepare(`INSERT INTO assessment_attempts (id, user_id, assessment_id, started_at, submitted_at, status, score, integrity_summary) VALUES (?, ?, ?, datetime('now'), datetime('now'), ?, ?, ?)`).run(attemptId, req.user!.userId, assessmentId, status, score || 0, JSON.stringify(integritySummary));

    auditLog(req.user!.userId, 'ASSESSMENT_SUBMITTED', 'assessment_attempt', attemptId, { score, percentage, trustScore, status });

    return res.json({
      data: {
        attemptId,
        score,
        percentage,
        trustScore,
        status,
        message: 'Assessment submitted successfully'
      },
      meta: { requestId: req.requestId }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ASSESSMENT_SUBMIT_ERROR', message: err.message, requestId: req.requestId } });
  }
});

export default router;
