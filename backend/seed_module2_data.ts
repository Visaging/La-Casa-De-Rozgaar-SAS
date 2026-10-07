import pg from 'pg';
import { config } from './src/config.js';

const pool = new pg.Pool({
  connectionString: config.database.url,
  ssl: { rejectUnauthorized: false }
});

async function populateMissingSeeds() {
  console.log('[SEED] Checking and populating learning_resources and interview_questions...');

  // 1. Learning Resources
  const lrCount = await pool.query('SELECT COUNT(*) as count FROM learning_resources');
  if (Number(lrCount.rows[0]?.count || 0) === 0) {
    const resources = [
      {
        id: 'lr_system_design_mastery',
        title: 'Distributed Systems & Microservices Architecture at Scale',
        provider: 'MIT Open Learning & La Casa Intelligence',
        url: 'https://ocw.mit.edu/courses/6-824-distributed-systems-spring-2020/',
        type: 'COURSE',
        difficulty: 'ADVANCED',
        duration_hours: 32,
        rating: 4.9,
        cost: 0,
        skills: JSON.stringify(['System Design', 'Distributed Systems', 'Go', 'Docker', 'Kubernetes'])
      },
      {
        id: 'lr_react_performance_patterns',
        title: 'Advanced React 19 Concurrent Rendering & Fiber Internals',
        provider: 'Frontend Masters',
        url: 'https://frontendmasters.com/courses/react-performance',
        type: 'COURSE',
        difficulty: 'INTERMEDIATE',
        duration_hours: 14,
        rating: 4.8,
        cost: 0,
        skills: JSON.stringify(['React', 'TypeScript', 'JavaScript', 'Web Performance'])
      },
      {
        id: 'lr_genai_rag_pipelines',
        title: 'Production RAG, Vector Search & LLM Agent Orchestration',
        provider: 'DeepLearning.AI & Stanford Online',
        url: 'https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llamaindex/',
        type: 'COURSE',
        difficulty: 'ADVANCED',
        duration_hours: 20,
        rating: 4.95,
        cost: 0,
        skills: JSON.stringify(['Python', 'Machine Learning', 'Vector Databases', 'LangChain', 'FastAPI'])
      },
      {
        id: 'lr_postgresql_internals',
        title: 'PostgreSQL Query Optimization & High-Throughput Indexing',
        provider: 'Database Systems Lab',
        url: 'https://use-the-index-luke.com/',
        type: 'ARTICLE',
        difficulty: 'INTERMEDIATE',
        duration_hours: 8,
        rating: 4.75,
        cost: 0,
        skills: JSON.stringify(['PostgreSQL', 'SQL', 'Database Optimization', 'Backend'])
      },
      {
        id: 'lr_cloud_native_kubernetes',
        title: 'Cloud-Native DevOps & Zero-Downtime Multi-Cluster Kubernetes',
        provider: 'Linux Foundation',
        url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/',
        type: 'CERTIFICATION',
        difficulty: 'ADVANCED',
        duration_hours: 40,
        rating: 4.85,
        cost: 0,
        skills: JSON.stringify(['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'])
      }
    ];

    for (const r of resources) {
      await pool.query(`
        INSERT INTO learning_resources (id, title, provider, url, type, difficulty, duration_hours, rating, cost, skills)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [r.id, r.title, r.provider, r.url, r.type, r.difficulty, r.duration_hours, r.rating, r.cost, r.skills]);
    }
    console.log(`[OK] Seeded ${resources.length} learning resources.`);
  }

  // 2. Interview Questions
  const iqCount = await pool.query('SELECT COUNT(*) as count FROM interview_questions');
  if (Number(iqCount.rows[0]?.count || 0) === 0) {
    const questions = [
      {
        id: 'iq_sys_1',
        role_id: 'role_fullstack',
        skill_id: 'skill_system_design',
        question: 'How would you architect a globally resilient real-time stock and crypto ticker feeding 2 million concurrent WebSocket clients?',
        sample_answer: 'Utilize an edge cache layer with Redis Pub/Sub clusters or Kafka partition brokers feeding distributed Node.js/Go WebSocket gateways with heartbeat management and sticky load balancing.',
        difficulty: 'HARD',
        key_points: 'WebSocket connection handling, Redis Pub/Sub fan-out, horizontal scaling, edge CDN acceleration.',
        evaluation_criteria: 'Capacity planning, failover mechanisms, latency degradation mitigation.'
      },
      {
        id: 'iq_react_1',
        role_id: 'role_fullstack',
        skill_id: 'skill_react',
        question: 'Explain how React 19 Server Components and Server Actions change data mutations and client-side bundle boundaries.',
        sample_answer: 'Server Components execute exclusively on the server without sending runtime JS dependencies to the client. Server Actions provide direct RPC-like form submissions with automatic optimistic UI revalidation without custom API boilerplate.',
        difficulty: 'MEDIUM',
        key_points: 'Zero bundle size, server actions, progressive enhancement, stream rendering.',
        evaluation_criteria: 'Understanding of rendering pipelines and hydration boundaries.'
      },
      {
        id: 'iq_db_1',
        role_id: 'role_fullstack',
        skill_id: 'skill_sql',
        question: 'How do you detect and fix deadlocks and high table contention in a high-concurrency PostgreSQL transactional ledger?',
        sample_answer: 'Analyze pg_stat_activity and lock monitoring queries. Ensure uniform acquisition order of locks across concurrent transactions, utilize optimistic row versioning, and implement advisory locks or queue-based updates for hot rows.',
        difficulty: 'HARD',
        key_points: 'pg_stat_activity, lock ordering, transaction isolation levels (SERIALIZABLE vs READ COMMITTED).',
        evaluation_criteria: 'Database concurrency control and mitigation techniques.'
      },
      {
        id: 'iq_sec_1',
        role_id: 'role_fullstack',
        skill_id: 'skill_security',
        question: 'Describe Zero-Trust authentication and session management design for distributed microservices.',
        sample_answer: 'Every request is signed via asymmetric JWT or mTLS with short-lived tokens and cryptographic claims verified at the API gateway layer with centralized token revocation lists in memory.',
        difficulty: 'MEDIUM',
        key_points: 'mTLS, JWT validation, refresh token rotation, asymmetric cryptography.',
        evaluation_criteria: 'Security best practices and microservice communication safety.'
      }
    ];

    for (const q of questions) {
      await pool.query(`
        INSERT INTO interview_questions (id, role_id, skill_id, question, sample_answer, difficulty, key_points, evaluation_criteria)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
      `, [q.id, q.role_id, q.skill_id, q.question, q.sample_answer, q.difficulty, q.key_points, q.evaluation_criteria]);
    }
    console.log(`[OK] Seeded ${questions.length} interview questions.`);
  }

  await pool.end();
}

populateMissingSeeds().catch(err => {
  console.error('[SEED-ERROR]', err);
  process.exit(1);
});
