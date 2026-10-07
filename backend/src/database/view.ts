import { getDb } from './connection.js';
import { config } from '../config.js';
import pg from 'pg';

async function viewDatabase() {
  const dbUrl = config.database.url || process.env.DATABASE_URL;

  console.log('\n===============================================================');
  console.log('       LA CASA DE ROZGAAR — DATABASE USER ACCOUNTS');
  console.log('===============================================================\n');

  if (dbUrl) {
    console.log(`[CLOUD] Connected to: Neon PostgreSQL (Cloud)\n`);
    const pool = new pg.Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    try {
      const users = await pool.query(`SELECT id, email, name, role, email_verified, created_at FROM users ORDER BY created_at ASC`);
      console.log('[TABLE] USERS TABLE (Neon Postgres):');
      console.table(users.rows);

      console.log('\n[TABLE] CANDIDATE PROFILES TABLE (Neon Postgres):');
      const profiles = await pool.query(`
        SELECT p.id, p.name, p.headline, p.location, p.total_experience_years, u.email, u.role
        FROM candidate_profiles p
        JOIN users u ON p.user_id = u.id
      `);
      console.table(profiles.rows);

      console.log('\n[TABLE] CANDIDATE SKILLS TABLE (Neon Postgres):');
      const skills = await pool.query(`
        SELECT p.name, s.skill_name, s.self_reported_score, s.assessment_score, s.verified_score, s.source
        FROM candidate_skills s
        JOIN candidate_profiles p ON s.candidate_id = p.id
        LIMIT 15
      `);
      console.table(skills.rows);

      console.log('\n[TABLE] ORGANIZATIONS TABLE (Neon Postgres):');
      const orgs = await pool.query(`SELECT id, name, industry, size, location FROM organizations`);
      console.table(orgs.rows);
    } catch (err: any) {
      console.error('Error querying Neon PostgreSQL:', err.message);
    } finally {
      await pool.end();
    }
  } else {
    console.log(`[LOCAL] Connected to: Local SQLite (${config.database.path})\n`);
    const db = getDb();
    try {
      const users = db.prepare(`SELECT id, email, name, role, email_verified, created_at FROM users ORDER BY created_at ASC`).all();
      console.log('[TABLE] USERS TABLE (SQLite):');
      console.table(users);

      console.log('\n[TABLE] CANDIDATE PROFILES TABLE (SQLite):');
      const profiles = db.prepare(`
        SELECT p.id, p.name, p.headline, p.location, p.total_experience_years, u.email, u.role
        FROM candidate_profiles p
        JOIN users u ON p.user_id = u.id
      `).all();
      console.table(profiles);

      console.log('\n[TABLE] CANDIDATE SKILLS TABLE (SQLite):');
      const skills = db.prepare(`
        SELECT p.name, s.skill_name, s.self_reported_score, s.assessment_score, s.verified_score, s.source
        FROM candidate_skills s
        JOIN candidate_profiles p ON s.candidate_id = p.id
        LIMIT 15
      `).all();
      console.table(skills);

      console.log('\n[TABLE] ORGANIZATIONS TABLE (SQLite):');
      const orgs = db.prepare(`SELECT id, name, industry, size, location FROM organizations`).all();
      console.table(orgs);
    } catch (err: any) {
      console.error('Error viewing SQLite database:', err.message);
    }
  }
}

viewDatabase();
