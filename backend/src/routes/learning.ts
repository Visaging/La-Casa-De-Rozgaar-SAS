import { Router, Request, Response } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';
import { getIntelligenceProvider } from '../intelligence/index.js';

const router = Router();
router.use(authenticate);

// ---- LIST RESOURCES ----
router.get('/resources', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 25;
    const offset = (page - 1) * pageSize;
    const skillId = req.query.skillId as string;
    const difficulty = req.query.difficulty as string;

    let query = 'SELECT * FROM learning_resources WHERE 1=1';
    const params: any[] = [];

    if (skillId) {
      query += ` AND (skills LIKE ? OR title LIKE ?)`;
      params.push(`%${skillId}%`, `%${skillId}%`);
    }
    if (difficulty) {
      query += ` AND difficulty = ?`;
      params.push(difficulty);
    }

    const totalQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countRes = await db.prepare(totalQuery).get(...params) as { count: number | string };
    const total = Number(countRes?.count || 0);

    query += ` ORDER BY title ASC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    const resources = (await db.prepare(query).all(...params) || []) as any[];
    resources.forEach(r => {
      try { r.skills = typeof r.skills === 'string' ? JSON.parse(r.skills || '[]') : (r.skills || []); } catch { r.skills = []; }
      r.skill_ids = r.skills;
    });

    return res.json({ data: resources, meta: { requestId: req.requestId, page, pageSize, total } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'RESOURCES_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- PERSONALIZED RECOMMENDATIONS ----
router.get('/recommended', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const intel = getIntelligenceProvider();

    const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

    // Get skill gaps
    const gaps = (await db.prepare('SELECT * FROM skill_gaps WHERE candidate_id = ? ORDER BY gap DESC').all(profile.id) || []) as any[];

    // Get all resources
    const allResources = (await db.prepare('SELECT * FROM learning_resources').all() || []) as any[];

    // Match resources to gaps
    interface ScoredResource {
      resource: any;
      relevantSkillGap: string;
      gapSize: number;
      reason: string;
      score: number;
    }
    const scored: ScoredResource[] = [];

    for (const resource of allResources) {
      let skillIds = [];
      try { skillIds = typeof resource.skill_ids === 'string' ? JSON.parse(resource.skill_ids || '[]') : (resource.skill_ids || []); } catch { skillIds = []; }
      for (const gap of gaps) {
        if (gap.gap > 0 && skillIds.includes(gap.skill_id)) {
          const marketSignal = await intel.getMarketSkillSignal(gap.skill_id);
          const marketDemand = marketSignal?.demand || 50;

          // Score: gap_size * 0.4 + market_demand * 0.3 + difficulty_match * 0.3
          const difficultyMatch = getDifficultyMatch(gap.current_score, resource.difficulty);
          const score = (gap.gap / 10) * 0.4 + (marketDemand / 100) * 0.3 + difficultyMatch * 0.3;

          const reasons: string[] = [];
          if (gap.gap > 2) reasons.push(`Significant gap in ${gap.skill_name} (${(gap.gap || 0).toFixed(1)} points)`);
          else reasons.push(`Gap in ${gap.skill_name} (${(gap.gap || 0).toFixed(1)} points)`);
          if (gap.priority === 'CRITICAL' || gap.priority === 'HIGH') reasons.push(`${gap.priority} priority for target role`);
          if (marketSignal?.trend === 'GROWING' || marketSignal?.trend === 'EMERGING') reasons.push(`${marketSignal.trend} market demand`);

          let roleIds = [];
          try { roleIds = typeof resource.role_ids === 'string' ? JSON.parse(resource.role_ids || '[]') : (resource.role_ids || []); } catch { roleIds = []; }

          scored.push({
            resource: { ...resource, skill_ids: skillIds, role_ids: roleIds },
            relevantSkillGap: gap.skill_name,
            gapSize: gap.gap,
            reason: reasons.join('. ') + '.',
            score,
          });
          break; // One match per resource
        }
      }
    }

    scored.sort((a, b) => b.score - a.score);

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const start = (page - 1) * pageSize;

    return res.json({
      data: scored.slice(start, start + pageSize),
      meta: { requestId: req.requestId, page, pageSize, total: scored.length }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'LEARNING_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- LEARNING PATHS ----
router.get('/paths', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const paths = (await db.prepare('SELECT * FROM learning_paths WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.userId) || []) as any[];
    paths.forEach(p => {
      try { p.resources = typeof p.resources === 'string' ? JSON.parse(p.resources || '[]') : (p.resources || []); } catch { p.resources = []; }
    });
    return res.json({ data: paths, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'PATHS_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.post('/paths', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { targetRoleId, resources } = req.body;
    if (!targetRoleId) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'targetRoleId is required', requestId: req.requestId } });
    }

    const id = generateId();
    await db.prepare('INSERT INTO learning_paths (id, user_id, target_role_id, resources) VALUES (?, ?, ?, ?)')
      .run(id, req.user!.userId, targetRoleId, JSON.stringify(resources || []));

    return res.status(201).json({ data: { id, message: 'Learning path created' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'PATH_CREATE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- PROGRESS ----
router.get('/progress', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const progress = (await db.prepare(`
      SELECT lp.*, lr.title as resource_title, lr.type as resource_type, lr.url as resource_url
      FROM learning_progress lp
      JOIN learning_resources lr ON lp.resource_id = lr.id
      WHERE lp.user_id = ?
      ORDER BY lp.started_at DESC
    `).all(req.user!.userId) || []) as any[];
    return res.json({ data: progress, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'PROGRESS_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.put('/progress/:resourceId', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { status, progress, timeSpentMinutes } = req.body;

    const existing = await db.prepare('SELECT id FROM learning_progress WHERE user_id = ? AND resource_id = ?').get(req.user!.userId, req.params.resourceId) as { id: string } | undefined;

    if (existing) {
      const updates: string[] = [];
      const params: any[] = [];
      if (status) { updates.push('status = ?'); params.push(status); }
      if (progress !== undefined) { updates.push('progress = ?'); params.push(progress); }
      if (timeSpentMinutes !== undefined) { updates.push('time_spent_minutes = ?'); params.push(timeSpentMinutes); }
      if (status === 'IN_PROGRESS') { updates.push(`started_at = COALESCE(started_at, datetime('now'))`); }
      if (status === 'COMPLETED') { updates.push(`completed_at = datetime('now')`); updates.push('progress = 100'); }
      params.push(existing.id);
      await db.prepare(`UPDATE learning_progress SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    } else {
      await db.prepare("INSERT INTO learning_progress (id, user_id, resource_id, status, progress, time_spent_minutes, started_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))")
        .run(generateId(), req.user!.userId, req.params.resourceId, status || 'IN_PROGRESS', progress || 0, timeSpentMinutes || 0);
    }

    return res.json({ data: { message: 'Progress updated' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'PROGRESS_UPDATE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

function getDifficultyMatch(currentScore: number, difficulty: string): number {
  if (currentScore < 4 && difficulty === 'BEGINNER') return 1.0;
  if (currentScore >= 4 && currentScore < 7 && difficulty === 'INTERMEDIATE') return 1.0;
  if (currentScore >= 7 && difficulty === 'ADVANCED') return 1.0;
  return 0.5;
}

export default router;
