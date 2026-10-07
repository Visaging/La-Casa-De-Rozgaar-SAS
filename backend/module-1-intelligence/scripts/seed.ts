import { pool, query, closePool } from '../src/db/index.js';

async function seed() {
  console.log('[SEED] Starting Module 1 database seed...');

  try {
    const client = await pool.connect();
    client.release();
  } catch (err: any) {
    console.warn('[SEED] Could not connect to database, skipping seed:', err.message);
    return;
  }

  try {
    // Check if skills table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'skills'
      );
    `);

    if (!tableCheck.rows[0]?.exists) {
      console.log('[SEED] Tables not yet created. Please run `npm run migrate:up` first.');
      return;
    }

    // Check if already seeded
    const countRes = await query('SELECT COUNT(*) as count FROM skills');
    if (parseInt(countRes.rows[0].count, 10) > 0) {
      console.log('[SEED] Database already contains skill data, skipping seed.');
      return;
    }

    console.log('[SEED] Inserting initial skills, roles, jobs, and market intelligence...');

    // 1. Insert Skills
    const skills = [
      { name: 'React', category: 'framework', desc: 'Declarative UI library for JavaScript' },
      { name: 'TypeScript', category: 'programming-language', desc: 'Typed superset of JavaScript' },
      { name: 'Node.js', category: 'framework', desc: 'JavaScript runtime environment' },
      { name: 'Python', category: 'programming-language', desc: 'High-level programming language for ML and backend' },
      { name: 'PostgreSQL', category: 'tool', desc: 'Open source relational database' },
      { name: 'AWS', category: 'tool', desc: 'Amazon Web Services cloud computing platform' },
      { name: 'Docker', category: 'tool', desc: 'Containerization platform' },
      { name: 'GraphQL', category: 'framework', desc: 'Query language for APIs' },
      { name: 'Tailwind CSS', category: 'framework', desc: 'Utility-first CSS framework' },
      { name: 'Machine Learning', category: 'domain', desc: 'Algorithms that improve through experience' },
      { name: 'Next.js', category: 'framework', desc: 'React framework for production' },
      { name: 'System Design', category: 'domain', desc: 'Architecture of complex distributed systems' },
    ];

    const skillMap: Record<string, string> = {};

    for (const s of skills) {
      const res = await query(
        `INSERT INTO skills (canonical_name, category, description) VALUES ($1, $2, $3) RETURNING id`,
        [s.name, s.category, s.desc]
      );
      skillMap[s.name] = res.rows[0].id;
    }

    // 2. Insert Roles
    const roles = [
      { name: 'Full Stack Developer', family: 'engineering', level: 'mid', desc: 'End-to-end web application engineer' },
      { name: 'Senior Frontend Engineer', family: 'engineering', level: 'senior', desc: 'Modern reactive frontend specialist' },
      { name: 'Backend Architect', family: 'engineering', level: 'lead', desc: 'Distributed systems and API designer' },
      { name: 'AI / Machine Learning Engineer', family: 'data', level: 'mid', desc: 'ML models, LLM workflows, and data pipelines' },
      { name: 'DevOps & Cloud Engineer', family: 'engineering', level: 'mid', desc: 'CI/CD, Kubernetes, cloud infrastructure automation' },
    ];

    const roleMap: Record<string, string> = {};

    for (const r of roles) {
      const res = await query(
        `INSERT INTO roles (canonical_name, role_family, seniority_level, description) VALUES ($1, $2, $3, $4) RETURNING id`,
        [r.name, r.family, r.level, r.desc]
      );
      roleMap[r.name] = res.rows[0].id;
    }

    // 3. Insert Sample Jobs
    const jobs = [
      {
        source: 'direct',
        externalId: 'job_direct_1',
        title: 'Senior Full Stack Engineer',
        roleId: roleMap['Full Stack Developer'],
        company: 'TechCorp India',
        location: 'Bangalore, India',
        isRemote: true,
        salaryMin: 2200000,
        salaryMax: 3500000,
        expMin: 3,
        expMax: 6,
      },
      {
        source: 'direct',
        externalId: 'job_direct_2',
        title: 'Lead AI Engineer',
        roleId: roleMap['AI / Machine Learning Engineer'],
        company: 'Nexus Intelligence Labs',
        location: 'Hyderabad, India',
        isRemote: true,
        salaryMin: 3000000,
        salaryMax: 5000000,
        expMin: 4,
        expMax: 8,
      },
      {
        source: 'direct',
        externalId: 'job_direct_3',
        title: 'Cloud & DevOps Specialist',
        roleId: roleMap['DevOps & Cloud Engineer'],
        company: 'Quantum Systems',
        location: 'Pune, India',
        isRemote: false,
        salaryMin: 1800000,
        salaryMax: 2800000,
        expMin: 2,
        expMax: 5,
      },
    ];

    for (const j of jobs) {
      await query(
        `INSERT INTO jobs (
          source, external_id, title, role_id, company_name, location,
          is_remote, salary_min, salary_max, salary_currency,
          experience_min, experience_max, processing_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'INR', $10, $11, 'processed')`,
        [j.source, j.externalId, j.title, j.roleId, j.company, j.location, j.isRemote, j.salaryMin, j.salaryMax, j.expMin, j.expMax]
      );
    }

    console.log('[SEED] Module 1 seed completed successfully!');
  } catch (err: any) {
    console.error('[SEED] Seed error:', err.message);
  } finally {
    await closePool();
  }
}

seed();
