// ============================================================================
// SKILL DEMAND AGGREGATOR
// Analyzes job postings to calculate skill demand trends
// ============================================================================

import { getDb } from '../../../database/connection.js';
import { MarketSkillDemand, SkillMomentum, SkillUrgency } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

export class SkillDemandAggregator {
  /**
   * Calculate skill demand from recent job postings
   */
  async calculateSkillDemand(params: {
    daysBack?: number;
    calculationPeriod?: string;
    minSampleSize?: number;
  } = {}): Promise<MarketSkillDemand[]> {
    const { daysBack = 30, calculationPeriod = '30d', minSampleSize = 1 } = params;

    const db = getDb();
    const cutoffDate = new Date(Date.now() - daysBack * 86400000).toISOString();

    // Get all jobs from the period
    const jobs = (await db
      .prepare(
        `SELECT 
          id, skills, required_skills, preferred_skills,
          salary_min, salary_max, experience_min, experience_max,
          posted_at, collected_at, title, location, city
         FROM job_postings
         WHERE (posted_at >= ? OR collected_at >= ?)
         AND (skills_extracted = 1 OR skills IS NOT NULL)`
      )
      .all(cutoffDate, cutoffDate)) as any[] || [];

    if (jobs.length === 0) {
      console.warn('No jobs found for skill demand calculation');
      return [];
    }

    // Count skill occurrences
    const skillCounts = new Map<string, {
      count: number;
      salaries: number[];
      experiences: number[];
      roles: Map<string, number>;
      locations: Map<string, number>;
      pairedWith: Map<string, number>;
    }>();

    for (const job of jobs) {
      const parseSkills = (val: any) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try { return JSON.parse(val); } catch { return []; }
      };

      const allSkills = [
        ...parseSkills(job.skills),
        ...parseSkills(job.required_skills),
        ...parseSkills(job.preferred_skills),
      ];

      const uniqueSkills = [...new Set(allSkills)];

      for (const skill of uniqueSkills) {
        if (!skillCounts.has(skill)) {
          skillCounts.set(skill, {
            count: 0,
            salaries: [],
            experiences: [],
            roles: new Map(),
            locations: new Map(),
            pairedWith: new Map(),
          });
        }

        const data = skillCounts.get(skill)!;
        data.count++;

        // Track salary
        if (job.salary_min && job.salary_max) {
          data.salaries.push((job.salary_min + job.salary_max) / 2);
        }

        // Track experience
        if (job.experience_min !== null || job.experience_max !== null) {
          const exp = ((job.experience_min || 0) + (job.experience_max || 0)) / 2;
          data.experiences.push(exp);
        }

        // Track roles (simplified from title)
        const role = this.extractRole(job.title || '');
        data.roles.set(role, (data.roles.get(role) || 0) + 1);

        // Track locations
        const location = job.city || job.location || 'Remote';
        data.locations.set(location, (data.locations.get(location) || 0) + 1);

        // Track paired skills
        for (const otherSkill of uniqueSkills) {
          if (otherSkill !== skill) {
            data.pairedWith.set(otherSkill, (data.pairedWith.get(otherSkill) || 0) + 1);
          }
        }
      }
    }

    const previousCounts = new Map<string, number>();

    // Build skill demand records
    const demands: MarketSkillDemand[] = [];
    const totalJobs = jobs.length;
    const lastCalculated = new Date().toISOString();

    for (const [skillName, data] of skillCounts.entries()) {
      if (data.count < minSampleSize) continue; // Filter low sample sizes

      const jobCount = data.count;
      const demandPercentage = (jobCount / totalJobs) * 100;

      // Calculate trend
      const previousCount = previousCounts.get(skillName) || 0;
      const trendPercentage = previousCount > 0
        ? ((jobCount - previousCount) / previousCount) * 100
        : jobCount > 0 ? 100 : 0;

      // Determine momentum
      const momentum = this.calculateMomentum(trendPercentage, jobCount, totalJobs);

      // Determine urgency
      const urgency = this.calculateUrgency(demandPercentage, trendPercentage, momentum);

      // Calculate averages
      const avgSalaryMin = data.salaries.length > 0
        ? Math.round(data.salaries.reduce((a, b) => a + b, 0) / data.salaries.length * 0.9)
        : undefined;
      
      const avgSalaryMax = data.salaries.length > 0
        ? Math.round(data.salaries.reduce((a, b) => a + b, 0) / data.salaries.length * 1.1)
        : undefined;

      const avgExperience = data.experiences.length > 0
        ? Math.round((data.experiences.reduce((a, b) => a + b, 0) / data.experiences.length) * 10) / 10
        : undefined;

      // Top paired skills
      const pairedSkills = Array.from(data.pairedWith.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skillId, frequency]) => ({ skillId, skillName: skillId, frequency }));

      // Top roles
      const topRoles = Array.from(data.roles.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([roleId, frequency]) => ({ roleId, roleName: roleId, frequency }));

      // Top locations
      const topLocations = Array.from(data.locations.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([location, count]) => ({ location, count }));

      // Determine category (simplified)
      const category = this.categorizeSkill(skillName);

      demands.push({
        id: uuidv4(),
        skillId: this.generateSkillId(skillName),
        skillName,
        jobCount,
        demandPercentage: Math.round(demandPercentage * 10) / 10,
        previousJobCount: previousCount,
        trendPercentage: Math.round(trendPercentage * 10) / 10,
        momentum,
        avgSalaryMin,
        avgSalaryMax,
        avgExperienceRequired: avgExperience,
        pairedSkills,
        topRoles,
        topLocations,
        category,
        urgency,
        sampleSize: jobCount,
        dataQuality: this.calculateDataQuality(jobCount, totalJobs),
        lastCalculated,
        calculationPeriod,
        createdAt: lastCalculated,
        updatedAt: lastCalculated,
      });
    }

    // Sort by job count
    demands.sort((a, b) => b.jobCount - a.jobCount);

    // Save to database
    await this.saveSkillDemands(demands);

    return demands;
  }

  /**
   * Calculate momentum from trend
   */
  private calculateMomentum(trendPercentage: number, jobCount: number, totalJobs: number): SkillMomentum {
    const demandPercentage = (jobCount / totalJobs) * 100;

    if (trendPercentage >= 100 && demandPercentage >= 5) return 'EMERGING';
    if (trendPercentage >= 50) return 'ACCELERATING';
    if (trendPercentage >= 20) return 'GROWING';
    if (trendPercentage >= -10) return 'STABLE';
    if (demandPercentage >= 30) return 'CRITICAL'; // High demand, stable
    return 'DECLINING';
  }

  /**
   * Calculate urgency
   */
  private calculateUrgency(demandPercentage: number, trendPercentage: number, momentum: SkillMomentum): SkillUrgency {
    if (momentum === 'EMERGING' || momentum === 'ACCELERATING') return 'CRITICAL';
    if (demandPercentage >= 30 || trendPercentage >= 40) return 'HIGH';
    if (demandPercentage >= 15 || trendPercentage >= 15) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Calculate data quality score
   */
  private calculateDataQuality(sampleSize: number, totalJobs: number): number {
    const coverage = sampleSize / totalJobs;
    if (sampleSize >= 100) return 1.0;
    if (sampleSize >= 50) return 0.9;
    if (sampleSize >= 20) return 0.8;
    if (sampleSize >= 10) return 0.7;
    return 0.6;
  }

  /**
   * Categorize skill
   */
  private categorizeSkill(skillName: string): string {
    const lower = skillName.toLowerCase();

    if (['react', 'angular', 'vue', 'svelte', 'html', 'css', 'sass', 'tailwind'].some(s => lower.includes(s))) {
      return 'Frontend';
    }
    if (['node', 'express', 'django', 'flask', 'spring', 'laravel', 'rails'].some(s => lower.includes(s))) {
      return 'Backend';
    }
    if (['aws', 'azure', 'gcp', 'google cloud'].some(s => lower.includes(s))) {
      return 'Cloud';
    }
    if (['docker', 'kubernetes', 'jenkins', 'terraform', 'ansible'].some(s => lower.includes(s))) {
      return 'DevOps';
    }
    if (['python', 'pytorch', 'tensorflow', 'ml', 'ai', 'deep learning'].some(s => lower.includes(s))) {
      return 'AI/ML';
    }
    if (['postgresql', 'mysql', 'mongodb', 'redis', 'sql'].some(s => lower.includes(s))) {
      return 'Database';
    }
    if (['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c++'].some(s => lower.includes(s))) {
      return 'Programming Languages';
    }

    return 'Technical';
  }

  /**
   * Generate skill ID from name
   */
  private generateSkillId(skillName: string): string {
    return 'skill_' + skillName.toLowerCase().replace(/[^\w]+/g, '_');
  }

  /**
   * Extract role from job title
   */
  private extractRole(title: string): string {
    const lower = title.toLowerCase();

    if (lower.includes('full stack') || lower.includes('fullstack')) return 'Full Stack Developer';
    if (lower.includes('frontend') || lower.includes('front-end')) return 'Frontend Developer';
    if (lower.includes('backend') || lower.includes('back-end')) return 'Backend Developer';
    if (lower.includes('data scientist')) return 'Data Scientist';
    if (lower.includes('data engineer')) return 'Data Engineer';
    if (lower.includes('devops')) return 'DevOps Engineer';
    if (lower.includes('cloud')) return 'Cloud Engineer';
    if (lower.includes('mobile')) return 'Mobile Developer';
    if (lower.includes('qa') || lower.includes('test')) return 'QA Engineer';
    if (lower.includes('product manager')) return 'Product Manager';

    return 'Software Engineer';
  }

  /**
   * Save skill demands to database
   */
  private async saveSkillDemands(demands: MarketSkillDemand[]): Promise<void> {
    const db = getDb();

    for (const demand of demands) {
      const existing = await db
        .prepare('SELECT id FROM market_skill_demand WHERE skill_name = ?')
        .get(demand.skillName);

      if (existing) {
        await db.prepare(
          `UPDATE market_skill_demand 
           SET job_count = ?, demand_percentage = ?, previous_job_count = ?,
               trend_percentage = ?, momentum = ?, avg_salary_min = ?,
               avg_salary_max = ?, avg_experience_required = ?,
               paired_skills = ?, top_roles = ?, top_locations = ?,
               category = ?, urgency = ?, sample_size = ?, data_quality = ?,
               last_calculated = ?, calculation_period = ?, updated_at = ?
           WHERE id = ?`
        ).run(
          demand.jobCount,
          demand.demandPercentage,
          demand.previousJobCount,
          demand.trendPercentage,
          demand.momentum,
          demand.avgSalaryMin,
          demand.avgSalaryMax,
          demand.avgExperienceRequired,
          JSON.stringify(demand.pairedSkills),
          JSON.stringify(demand.topRoles),
          JSON.stringify(demand.topLocations),
          demand.category,
          demand.urgency,
          demand.sampleSize,
          demand.dataQuality,
          demand.lastCalculated,
          demand.calculationPeriod,
          demand.updatedAt,
          (existing as any).id
        );
      } else {
        await db.prepare(
          `INSERT INTO market_skill_demand (
            id, skill_id, skill_name,
            job_count, demand_percentage,
            previous_job_count, trend_percentage, momentum,
            avg_salary_min, avg_salary_max, avg_experience_required,
            paired_skills, top_roles, top_locations,
            category, urgency,
            sample_size, data_quality, last_calculated, calculation_period,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          demand.id,
          demand.skillId,
          demand.skillName,
          demand.jobCount,
          demand.demandPercentage,
          demand.previousJobCount,
          demand.trendPercentage,
          demand.momentum,
          demand.avgSalaryMin,
          demand.avgSalaryMax,
          demand.avgExperienceRequired,
          JSON.stringify(demand.pairedSkills),
          JSON.stringify(demand.topRoles),
          JSON.stringify(demand.topLocations),
          demand.category,
          demand.urgency,
          demand.sampleSize,
          demand.dataQuality,
          demand.lastCalculated,
          demand.calculationPeriod,
          demand.createdAt,
          demand.updatedAt
        );
      }
    }

    console.log(`[OK] Saved ${demands.length} skill demand records`);
  }

  /**
   * Get top demanded skills
   */
  async getTopSkills(limit: number = 20): Promise<MarketSkillDemand[]> {
    const db = getDb();

    const skills = db
      .prepare(
        `SELECT * FROM market_skill_demand
         ORDER BY job_count DESC
         LIMIT ?`
      )
      .all(limit) as any[];

    return skills.map(this.mapDbToSkillDemand);
  }

  /**
   * Get emerging skills
   */
  async getEmergingSkills(limit: number = 20): Promise<MarketSkillDemand[]> {
    const db = getDb();

    const skills = db
      .prepare(
        `SELECT * FROM market_skill_demand
         WHERE momentum IN ('EMERGING', 'ACCELERATING')
         ORDER BY trend_percentage DESC
         LIMIT ?`
      )
      .all(limit) as any[];

    return skills.map(this.mapDbToSkillDemand);
  }

  /**
   * Map database row to MarketSkillDemand
   */
  private mapDbToSkillDemand(row: any): MarketSkillDemand {
    return {
      id: row.id,
      skillId: row.skill_id,
      skillName: row.skill_name,
      jobCount: row.job_count,
      demandPercentage: row.demand_percentage,
      previousJobCount: row.previous_job_count,
      trendPercentage: row.trend_percentage,
      momentum: row.momentum,
      avgSalaryMin: row.avg_salary_min,
      avgSalaryMax: row.avg_salary_max,
      avgExperienceRequired: row.avg_experience_required,
      pairedSkills: JSON.parse(row.paired_skills || '[]'),
      topRoles: JSON.parse(row.top_roles || '[]'),
      topLocations: JSON.parse(row.top_locations || '[]'),
      category: row.category,
      urgency: row.urgency,
      sampleSize: row.sample_size,
      dataQuality: row.data_quality,
      lastCalculated: row.last_calculated,
      calculationPeriod: row.calculation_period,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
