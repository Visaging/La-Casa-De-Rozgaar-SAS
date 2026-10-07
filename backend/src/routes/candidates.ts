import { Router, Request, Response } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate, auditLog } from '../middleware/auth.js';

const router = Router();

// All candidate routes require authentication
router.use(authenticate);

// ---- GET PROFILE ----
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    let profile = await db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as any;
    
    // If not found, auto-create a profile from user record
    if (!profile) {
      const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.userId) as any;
      if (!user) {
        return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile was not found', requestId: req.requestId } });
      }
      const newProfileId = generateId();
      const defaultName = user.name || (user.email ? user.email.split('@')[0] : 'Candidate');
      await db.prepare('INSERT INTO candidate_profiles (id, user_id, name) VALUES (?, ?, ?)').run(newProfileId, user.id, defaultName);
      profile = await db.prepare('SELECT * FROM candidate_profiles WHERE id = ?').get(newProfileId) as any;
    }

    // Parse JSON fields
    try {
      profile.target_roles = typeof profile.target_roles === 'string' ? JSON.parse(profile.target_roles || '[]') : (profile.target_roles || []);
    } catch { profile.target_roles = []; }
    try {
      profile.preferred_locations = typeof profile.preferred_locations === 'string' ? JSON.parse(profile.preferred_locations || '[]') : (profile.preferred_locations || []);
    } catch { profile.preferred_locations = []; }
    try {
      profile.employment_preferences = typeof profile.employment_preferences === 'string' ? JSON.parse(profile.employment_preferences || '[]') : (profile.employment_preferences || []);
    } catch { profile.employment_preferences = []; }
    try {
      profile.portfolio_links = typeof profile.portfolio_links === 'string' ? JSON.parse(profile.portfolio_links || '[]') : (profile.portfolio_links || []);
    } catch { profile.portfolio_links = []; }

    // Attach skills, experience, and education
    const skills = await db.prepare('SELECT * FROM candidate_skills WHERE candidate_id = ?').all(profile.id) || [];
    const experience = (await db.prepare('SELECT * FROM candidate_experience WHERE candidate_id = ? ORDER BY start_date DESC').all(profile.id) || []) as any[];
    experience.forEach((e: any) => {
      try {
        e.skills_used = typeof e.skills_used === 'string' ? JSON.parse(e.skills_used || '[]') : (e.skills_used || []);
      } catch { e.skills_used = []; }
    });
    const education = await db.prepare('SELECT * FROM candidate_education WHERE candidate_id = ? ORDER BY start_date DESC').all(profile.id) || [];

    const nameParts = (profile.name || '').trim().split(' ');
    profile.firstName = nameParts[0] || '';
    profile.lastName = nameParts.slice(1).join(' ') || '';
    profile.skills = skills;
    profile.experience = experience;
    profile.education = education;

    return res.json({ data: profile, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'PROFILE_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- UPDATE PROFILE ----
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    let profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) {
      const newProfileId = generateId();
      await db.prepare('INSERT INTO candidate_profiles (id, user_id, name) VALUES (?, ?, ?)').run(newProfileId, req.user!.userId, req.body.name || 'Candidate');
      profile = { id: newProfileId };
    }
    const { name, headline, bio, location, targetRoles, preferredLocations, employmentPreferences, portfolioLinks } = req.body;
    
    await db.prepare(`
      UPDATE candidate_profiles SET
        name = COALESCE(?, name),
        headline = COALESCE(?, headline),
        bio = COALESCE(?, bio),
        location = COALESCE(?, location),
        target_roles = COALESCE(?, target_roles),
        preferred_locations = COALESCE(?, preferred_locations),
        employment_preferences = COALESCE(?, employment_preferences),
        portfolio_links = COALESCE(?, portfolio_links),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name !== undefined ? name : null,
      headline !== undefined ? headline : null,
      bio !== undefined ? bio : null,
      location !== undefined ? location : null,
      targetRoles ? JSON.stringify(targetRoles) : null,
      preferredLocations ? JSON.stringify(preferredLocations) : null,
      employmentPreferences ? JSON.stringify(employmentPreferences) : null,
      portfolioLinks ? JSON.stringify(portfolioLinks) : null,
      profile.id
    );

    // Sync users name if provided
    if (name) {
      try {
        await db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.user!.userId);
      } catch {}
    }

    auditLog(req.user!.userId, 'PROFILE_UPDATED', 'candidate_profile', profile.id);

    const updated = await db.prepare('SELECT * FROM candidate_profiles WHERE id = ?').get(profile.id) as any;
    try { updated.target_roles = JSON.parse(updated.target_roles || '[]'); } catch { updated.target_roles = []; }
    try { updated.preferred_locations = JSON.parse(updated.preferred_locations || '[]'); } catch { updated.preferred_locations = []; }
    try { updated.employment_preferences = JSON.parse(updated.employment_preferences || '[]'); } catch { updated.employment_preferences = []; }
    try { updated.portfolio_links = JSON.parse(updated.portfolio_links || '[]'); } catch { updated.portfolio_links = []; }

    const nameParts = (updated.name || '').trim().split(' ');
    updated.firstName = nameParts[0] || '';
    updated.lastName = nameParts.slice(1).join(' ') || '';

    return res.json({ data: { message: 'Profile updated', ...updated }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'PROFILE_UPDATE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- SKILLS ----
router.get('/skills', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

    const skills = await db.prepare('SELECT * FROM candidate_skills WHERE candidate_id = ?').all(profile.id);
    return res.json({ data: skills || [], meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SKILLS_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.post('/skills', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    let profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) {
      const newProfileId = generateId();
      await db.prepare('INSERT INTO candidate_profiles (id, user_id, name) VALUES (?, ?, ?)').run(newProfileId, req.user!.userId, 'Candidate');
      profile = { id: newProfileId };
    }

    const { skillId, skillName, selfReportedScore } = req.body;
    if (!skillId || !skillName) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'skillId and skillName are required', requestId: req.requestId } });
    }

    const existing = await db.prepare('SELECT id FROM candidate_skills WHERE candidate_id = ? AND skill_id = ?').get(profile.id, skillId);
    if (existing) {
      await db.prepare('UPDATE candidate_skills SET self_reported_score = ?, source = ? WHERE candidate_id = ? AND skill_id = ?')
        .run(selfReportedScore || null, 'SELF_REPORTED', profile.id, skillId);
    } else {
      await db.prepare('INSERT INTO candidate_skills (id, candidate_id, skill_id, skill_name, self_reported_score, source) VALUES (?, ?, ?, ?, ?, ?)')
        .run(generateId(), profile.id, skillId, skillName, selfReportedScore || null, 'SELF_REPORTED');
    }

    return res.status(201).json({ data: { message: 'Skill added/updated' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SKILL_SAVE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.delete('/skills/:skillId', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

    await db.prepare('DELETE FROM candidate_skills WHERE candidate_id = ? AND skill_id = ?').run(profile.id, req.params.skillId);
    return res.json({ data: { message: 'Skill removed' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SKILL_DELETE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- EXPERIENCE ----
router.get('/experience', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

    const experiences = (await db.prepare('SELECT * FROM candidate_experience WHERE candidate_id = ?').all(profile.id) || []) as any[];
    experiences.forEach((e: any) => {
      try { e.skills = JSON.parse(e.skills || '[]'); } catch { e.skills = []; }
    });
    return res.json({ data: experiences, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'EXPERIENCE_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.post('/experience', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    let profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) {
      const newProfileId = generateId();
      await db.prepare('INSERT INTO candidate_profiles (id, user_id, name) VALUES (?, ?, ?)').run(newProfileId, req.user!.userId, 'Candidate');
      profile = { id: newProfileId };
    }

    const { title, company, location, startDate, endDate, current, description, skills } = req.body;
    if (!title || !company || !startDate) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'title, company, and startDate are required', requestId: req.requestId } });
    }

    const id = generateId();
    await db.prepare('INSERT INTO candidate_experience (id, candidate_id, title, company, location, start_date, end_date, current, description, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, profile.id, title, company, location || null, startDate, endDate || null, current ? 1 : 0, description || null, JSON.stringify(skills || []));

    return res.status(201).json({ data: { id, message: 'Experience added' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'EXPERIENCE_SAVE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.delete('/experience/:id', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

    await db.prepare('DELETE FROM candidate_experience WHERE id = ? AND candidate_id = ?').run(req.params.id, profile.id);
    return res.json({ data: { message: 'Experience removed' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'EXPERIENCE_DELETE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- EDUCATION ----
router.get('/education', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

    const education = await db.prepare('SELECT * FROM candidate_education WHERE candidate_id = ?').all(profile.id) || [];
    return res.json({ data: education, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'EDUCATION_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.post('/education', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    let profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) {
      const newProfileId = generateId();
      await db.prepare('INSERT INTO candidate_profiles (id, user_id, name) VALUES (?, ?, ?)').run(newProfileId, req.user!.userId, 'Candidate');
      profile = { id: newProfileId };
    }

    const { degree, institution, field, startDate, endDate, current, grade } = req.body;
    if (!degree || !institution || !field || !startDate) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'degree, institution, field, startDate are required', requestId: req.requestId } });
    }

    const id = generateId();
    await db.prepare('INSERT INTO candidate_education (id, candidate_id, degree, institution, field, start_date, end_date, current, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, profile.id, degree, institution, field, startDate, endDate || null, current ? 1 : 0, grade || null);

    return res.status(201).json({ data: { id, message: 'Education added' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'EDUCATION_SAVE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- CERTIFICATIONS ----
router.get('/certifications', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

    const certs = await db.prepare('SELECT * FROM candidate_certifications WHERE candidate_id = ?').all(profile.id) || [];
    return res.json({ data: certs, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'CERTS_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.post('/certifications', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    let profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) {
      const newProfileId = generateId();
      await db.prepare('INSERT INTO candidate_profiles (id, user_id, name) VALUES (?, ?, ?)').run(newProfileId, req.user!.userId, 'Candidate');
      profile = { id: newProfileId };
    }

    const { name, issuer, issuedAt, expiresAt, credentialId, url } = req.body;
    if (!name || !issuer || !issuedAt) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'name, issuer, issuedAt are required', requestId: req.requestId } });
    }

    const id = generateId();
    await db.prepare('INSERT INTO candidate_certifications (id, candidate_id, name, issuer, issued_at, expires_at, credential_id, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, profile.id, name, issuer, issuedAt, expiresAt || null, credentialId || null, url || null);

    return res.status(201).json({ data: { id, message: 'Certification added' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'CERT_SAVE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- TARGET ROLES ----
router.get('/target-roles', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

    const roles = await db.prepare('SELECT * FROM target_roles WHERE candidate_id = ? ORDER BY priority').all(profile.id) || [];
    return res.json({ data: roles, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'TARGET_ROLES_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.post('/target-roles', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    let profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) {
      const newProfileId = generateId();
      await db.prepare('INSERT INTO candidate_profiles (id, user_id, name) VALUES (?, ?, ?)').run(newProfileId, req.user!.userId, 'Candidate');
      profile = { id: newProfileId };
    }

    const { roleId, roleName, priority } = req.body;
    if (!roleId || !roleName) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'roleId and roleName are required', requestId: req.requestId } });
    }

    const id = generateId();
    await db.prepare('INSERT INTO target_roles (id, candidate_id, role_id, role_name, priority) VALUES (?, ?, ?, ?, ?)')
      .run(id, profile.id, roleId, roleName, priority || 1);

    return res.status(201).json({ data: { id, message: 'Target role added' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'TARGET_ROLE_SAVE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.delete('/target-roles/:id', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

    await db.prepare('DELETE FROM target_roles WHERE id = ? AND candidate_id = ?').run(req.params.id, profile.id);
    return res.json({ data: { message: 'Target role removed' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'TARGET_ROLE_DELETE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- PREFERENCES ----
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

    let prefs = await db.prepare('SELECT * FROM candidate_preferences WHERE candidate_id = ?').get(profile.id) as any;
    if (prefs) {
      try { prefs.preferred_company_sizes = JSON.parse(prefs.preferred_company_sizes || '[]'); } catch { prefs.preferred_company_sizes = []; }
      try { prefs.preferred_industries = JSON.parse(prefs.preferred_industries || '[]'); } catch { prefs.preferred_industries = []; }
    }
    return res.json({ data: prefs || null, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'PREFERENCES_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    let profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) {
      const newProfileId = generateId();
      await db.prepare('INSERT INTO candidate_profiles (id, user_id, name) VALUES (?, ?, ?)').run(newProfileId, req.user!.userId, 'Candidate');
      profile = { id: newProfileId };
    }

    const { remotePreference, salaryExpectationMin, salaryExpectationMax, salaryCurrency, noticePeriodDays, willingToRelocate, preferredCompanySizes, preferredIndustries } = req.body;

    const existing = await db.prepare('SELECT id FROM candidate_preferences WHERE candidate_id = ?').get(profile.id);
    if (existing) {
      await db.prepare(`UPDATE candidate_preferences SET
        remote_preference = COALESCE(?, remote_preference),
        salary_expectation_min = COALESCE(?, salary_expectation_min),
        salary_expectation_max = COALESCE(?, salary_expectation_max),
        salary_currency = COALESCE(?, salary_currency),
        notice_period_days = COALESCE(?, notice_period_days),
        willing_to_relocate = COALESCE(?, willing_to_relocate),
        preferred_company_sizes = COALESCE(?, preferred_company_sizes),
        preferred_industries = COALESCE(?, preferred_industries)
      WHERE candidate_id = ?`).run(
        remotePreference || null, salaryExpectationMin || null, salaryExpectationMax || null,
        salaryCurrency || null, noticePeriodDays || null, willingToRelocate != null ? (willingToRelocate ? 1 : 0) : null,
        preferredCompanySizes ? JSON.stringify(preferredCompanySizes) : null,
        preferredIndustries ? JSON.stringify(preferredIndustries) : null,
        profile.id
      );
    } else {
      await db.prepare('INSERT INTO candidate_preferences (id, candidate_id, remote_preference, salary_expectation_min, salary_expectation_max, salary_currency, notice_period_days, willing_to_relocate, preferred_company_sizes, preferred_industries) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(generateId(), profile.id, remotePreference || 'ANY', salaryExpectationMin || null, salaryExpectationMax || null,
          salaryCurrency || 'INR', noticePeriodDays || null, willingToRelocate ? 1 : 0,
          JSON.stringify(preferredCompanySizes || []), JSON.stringify(preferredIndustries || []));
    }

    return res.json({ data: { message: 'Preferences updated' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'PREFERENCES_SAVE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

export default router;
