import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { mockMarketData } from '../data/mockData'
import { formatNumber, getTrendColor } from '../lib/utils'
import { cn } from '../lib/utils'
import { useTheme } from '../hooks/useTheme'
import { api } from '../services/api'

interface WarRoomProps {
  onNavigate?: (page: string) => void
}

// ============================================================================
// ENTERPRISE OVERVIEW DASHBOARD (Strict Anti-Vibecode Enterprise Experience)
// ============================================================================
const EnterpriseOverview: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | 'YTD'>('90D')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    Promise.all([
      api.employer.getDashboardMetrics(),
      api.employer.getWorkforceAnalytics(),
      api.employer.getSkillGaps(),
      api.employer.getMarketRoles()
    ]).then(([metrics, analytics, gaps, roles]) => {
      if (mounted) {
        setDashboardData({ metrics, analytics, gaps, roles })
      }
    }).catch((err) => {
      console.warn('[WarRoom] Failed to load employer data:', err)
    }).finally(() => {
      if (mounted) setLoading(false)
    })

    return () => { mounted = false }
  }, [])

  const kpis = dashboardData?.metrics ? [
    {
      label: 'Total Workforce',
      value: dashboardData.metrics.totalWorkforceFormatted || formatNumber(dashboardData.metrics.totalWorkforce),
      trend: '+4.2%',
      trendUp: true,
      period: 'vs last year',
      tooltip: 'Active FTE and contracted workforce.',
    },
    {
      label: 'Critical Skill Gaps',
      value: String(dashboardData.metrics.criticalGaps || 0),
      trend: '-8.2%',
      trendUp: false,
      period: 'vs last quarter',
      tooltip: 'Competencies with capability deficits > 1.5 points against target demand.',
    },
    {
      label: 'Open Requisitions',
      value: String(dashboardData.metrics.openRequisitions || 0),
      trend: '+15',
      trendUp: true,
      period: 'active this month',
      tooltip: 'Approved vacant positions across active business units.',
    },
    {
      label: 'Talent Coverage',
      value: dashboardData.metrics.talentCoverage || '82%',
      trend: '+3.1%',
      trendUp: true,
      period: 'readiness index',
      tooltip: 'Percentage of strategic positions with qualified internal or pipeline coverage.',
    },
    {
      label: 'Market Demand Growth',
      value: dashboardData.metrics.marketGrowth || '+12.4%',
      trend: 'Accelerating',
      trendUp: true,
      period: 'industry index',
      tooltip: 'Observed vacancy volume growth across benchmark peers.',
    },
  ] : [
    {
      label: 'Total Workforce',
      value: '12,482',
      trend: '+4.2%',
      trendUp: true,
      period: 'vs last year',
      tooltip: 'Active FTE and contracted workforce.',
    },
    {
      label: 'Critical Skill Gaps',
      value: '37',
      trend: '-8.2%',
      trendUp: false,
      period: 'vs last quarter',
      tooltip: 'Competencies with capability deficits > 1.5 points against target demand.',
    },
    {
      label: 'Open Requisitions',
      value: '214',
      trend: '+15',
      trendUp: true,
      period: 'active this month',
      tooltip: 'Approved vacant positions across active business units.',
    },
    {
      label: 'Talent Coverage',
      value: '82%',
      trend: '+3.1%',
      trendUp: true,
      period: 'readiness index',
      tooltip: 'Percentage of strategic positions with qualified internal or pipeline coverage.',
    },
    {
      label: 'Market Demand Growth',
      value: '+12.4%',
      trend: 'Accelerating',
      trendUp: true,
      period: 'industry index',
      tooltip: 'Observed vacancy volume growth across benchmark peers.',
    },
  ]

  const trendData = dashboardData?.analytics?.trendData || [
    { month: 'Apr', capability: 74, projectedDemand: 70 },
    { month: 'May', capability: 76, projectedDemand: 73 },
    { month: 'Jun', capability: 75, projectedDemand: 77 },
    { month: 'Jul', capability: 78, projectedDemand: 81 },
    { month: 'Aug', capability: 80, projectedDemand: 84 },
    { month: 'Sep', capability: 82, projectedDemand: 88 },
  ]

  const capabilitySectors = [
    { name: 'Core Engineering', score: 82, target: 88, gap: '-6%' },
    { name: 'Product Management', score: 74, target: 78, gap: '-4%' },
    { name: 'Data & Analytics', score: 68, target: 80, gap: '-12%' },
    { name: 'Cloud Architecture', score: 61, target: 78, gap: '-17%' },
    { name: 'Cybersecurity', score: 54, target: 76, gap: '-22%' },
  ]

  const criticalGaps = [
    {
      skill: 'Cloud Architecture',
      current: 5.8,
      required: 8.0,
      gap: -2.2,
      priority: 'High',
      cohort: 18,
      action: 'Skill Telemetry',
      targetPage: 'skill-intelligence',
    },
    {
      skill: 'Distributed Systems',
      current: 6.4,
      required: 8.2,
      gap: -1.8,
      priority: 'High',
      cohort: 24,
      action: 'Find Talent',
      targetPage: 'talent-vault',
    },
    {
      skill: 'Kubernetes Orchestration',
      current: 5.2,
      required: 7.0,
      gap: -1.8,
      priority: 'High',
      cohort: 32,
      action: 'Plan Upskilling',
      targetPage: 'skill-heist',
    },
    {
      skill: 'Data Engineering & ETL',
      current: 6.1,
      required: 7.5,
      gap: -1.4,
      priority: 'Medium',
      cohort: 15,
      action: 'View Pathways',
      targetPage: 'career-intelligence',
    },
    {
      skill: 'MLOps & Inference',
      current: 6.8,
      required: 7.8,
      gap: -1.0,
      priority: 'Medium',
      cohort: 12,
      action: 'Curriculum',
      targetPage: 'roadmap',
    },
  ]

  const topMarketRoles = [
    {
      title: 'Senior Software Engineer',
      openings: 9240,
      compensation: '₹1.2M - ₹2.2M',
      growth: '+18.4%',
      keySkills: 'TypeScript, Node.js, Docker',
    },
    {
      title: 'Data Scientist',
      openings: 8156,
      compensation: '₹1.4M - ₹2.6M',
      growth: '+22.1%',
      keySkills: 'Python, PyTorch, SQL',
    },
    {
      title: 'Product Manager',
      openings: 6823,
      compensation: '₹1.6M - ₹2.8M',
      growth: '+12.3%',
      keySkills: 'Product Analytics, System Design',
    },
    {
      title: 'Cloud Solutions Architect',
      openings: 4912,
      compensation: '₹1.8M - ₹3.2M',
      growth: '+26.5%',
      keySkills: 'AWS, Kubernetes, Terraform',
    },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Scope Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Enterprise Overview
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            A real-time view of talent, workforce capability and market demand.
          </p>
        </div>

        {/* Filters and Dataset Disclaimer */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 rounded p-0.5 text-xs font-medium text-slate-600">
            {(['30D', '90D', 'YTD'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={cn(
                  'px-2.5 py-1 rounded transition-colors',
                  timeRange === r ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
                )}
              >
                {r === '30D' ? 'Last 30 Days' : r === '90D' ? 'Last 90 Days' : 'Year to Date'}
              </button>
            ))}
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium" title="Data synthesized for demonstration purposes based on empirical public labor models">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Demo Dataset
          </span>
        </div>
      </div>

      {/* 2. Executive KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1 hover:border-slate-300 transition-colors"
          >
            <div className="text-[11px] font-medium text-slate-500 tracking-normal flex items-center justify-between">
              <span>{kpi.label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {kpi.value}
            </div>
            <div className="text-[11px] flex items-center gap-1.5 text-slate-500">
              <span
                className={cn(
                  'font-semibold',
                  kpi.trendUp ? 'text-emerald-700' : 'text-amber-700'
                )}
              >
                {kpi.trend}
              </span>
              <span>{kpi.period}</span>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Executive Actionable Insights */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Executive Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                Workforce Capability
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                Cloud engineering capability is currently <strong>14% below</strong> projected Q4 demand across core infrastructure teams.
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('skill-intelligence')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 self-start transition-colors"
            >
              Skill Intelligence →
            </button>
          </div>

          <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Role Intelligence
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                Frontend and Data Science engineering talent availability mapped across 10 standardized role families and 642 companies.
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('role-intelligence')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 self-start transition-colors cursor-pointer"
            >
              Explore Role Intelligence →
            </button>
          </div>

          <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Market Analytics
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                17,443 validated postings analyzed across 8 regional hubs with empirical salary quartile distributions.
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('market-intelligence')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 self-start transition-colors cursor-pointer"
            >
              Macro Market Radar →
            </button>
          </div>
        </div>
      </section>

      {/* 4. Analytics Split View: Trend vs Capability Coverage */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Workforce Capability vs Projected Demand */}
        <div className="lg:col-span-7 p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Workforce Capability vs Projected Demand
              </h3>
              <p className="text-[11px] text-slate-500">
                Observed capability index tracked against rolling operational requirements.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#1E3A8A]" /> Current Capability
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-slate-400 border-t border-dashed" /> Projected Demand
              </span>
            </div>
          </div>

          <div className="w-full h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis domain={[60, 100]} stroke="#64748B" tick={{ fill: '#64748B', fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    color: '#0F172A',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="projectedDemand"
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  name="Projected Demand"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="capability"
                  stroke="#1E3A8A"
                  strokeWidth={2.5}
                  name="Current Capability"
                  dot={{ fill: '#1E3A8A', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Key Department Capability Coverage */}
        <div className="lg:col-span-5 p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Departmental Coverage
              </h3>
              <p className="text-[11px] text-slate-500">
                Target benchmark vs current readiness by unit.
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('market-intelligence')}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
            >
              Market View
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {capabilitySectors.map((sector) => (
              <div key={sector.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{sector.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{sector.score}% / {sector.target}%</span>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      {sector.gap}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div
                    style={{ width: `${sector.score}%` }}
                    className="bg-[#1E3A8A] h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Critical Skill Gaps Analytical Table */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Critical Capability Gaps
            </h3>
            <p className="text-xs text-slate-500">
              Prioritized competency deficits requiring targeted recruitment or upskilling interventions.
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('skill-intelligence')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 self-start sm:self-auto"
          >
            Open Skill Intelligence →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Competency Area</th>
                <th className="py-2.5 px-4 font-semibold">Current Index</th>
                <th className="py-2.5 px-4 font-semibold">Target Requirement</th>
                <th className="py-2.5 px-4 font-semibold">Net Deficit</th>
                <th className="py-2.5 px-4 font-semibold">Affected Cohort</th>
                <th className="py-2.5 px-4 font-semibold">Priority</th>
                <th className="py-2.5 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {criticalGaps.map((item) => (
                <tr key={item.skill} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {item.skill}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {item.current.toFixed(1)} / 10
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {item.required.toFixed(1)} / 10
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-amber-700">
                    {item.gap.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {item.cohort} engineers
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-semibold',
                        item.priority === 'High'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigate?.(item.targetPage)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                    >
                      {item.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Market Demand & Talent Velocity Table */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Labor Market Velocity & Compensation
            </h3>
            <p className="text-xs text-slate-500">
              Observed demand across high-volume roles within target sectors.
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('market-intelligence')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 self-start sm:self-auto"
          >
            View Market Intelligence →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Standard Role</th>
                <th className="py-2.5 px-4 font-semibold">Observed Vacancies</th>
                <th className="py-2.5 px-4 font-semibold">Compensation Range</th>
                <th className="py-2.5 px-4 font-semibold">Core Skill Requirements</th>
                <th className="py-2.5 px-4 font-semibold">YoY Trend</th>
                <th className="py-2.5 px-4 text-right font-semibold">Role Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {topMarketRoles.map((role) => (
                <tr key={role.title} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {role.title}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {formatNumber(role.openings)}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {role.compensation}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {role.keySkills}
                  </td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold font-mono">
                    {role.growth}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigate?.('role-intelligence')}
                      className="text-blue-700 hover:text-blue-900 font-medium hover:underline inline-flex items-center gap-0.5"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

// ============================================================================
// MAIN WAR ROOM COMPONENT (Supports dual mode: Heist vs Enterprise)
// ============================================================================
export const WarRoom: React.FC<WarRoomProps> = ({ onNavigate }) => {
  const { isHeist } = useTheme()
  const [selectedRoleIdx, setSelectedRoleIdx] = useState(0)
  // Removed perspective switcher - unified analytics dashboard

  // In Enterprise Mode: render the executive enterprise dashboard
  if (!isHeist) {
    return <EnterpriseOverview onNavigate={onNavigate} />
  }

  // In Heist Mode: render the consumer / candidate Money Heist command center
  const activeRole = mockMarketData.topRoles[selectedRoleIdx] || mockMarketData.topRoles[0]

  return (
    <div className="space-y-8">
      {/* Hero Command Section */}
      <section className="relative overflow-hidden rounded-xl border border-crimson/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <span className="stamp-live">COMMAND HQ ONLINE</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // STRATEGIC-OVERVIEW</span>
            </div>
            
            {/* Unified Analytics Dashboard - No Perspective Split */}
          </div>

          <div>
            <h1 className="heading-xl text-warm-ivory">LA CASA DE ROZGAAR</h1>
            <h2 className="heading-sm text-crimson mt-0.5">
              LABOR MARKET INTELLIGENCE COMMAND CENTER
            </h2>
          </div>

          <p className="text-warm-ivory/80 text-xs md:text-sm font-mono leading-relaxed">
            Real-time labor market analytics powered by 17,443 job postings, 8,208 canonical skills, and ML-backed salary & leadership prediction models.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate?.('market-intelligence')}
              className="btn-primary flex items-center gap-2 text-xs font-mono py-2.5 px-4 cursor-pointer"
            >
              MARKET INTELLIGENCE →
            </button>
            <button
              onClick={() => onNavigate?.('skill-intelligence')}
              className="btn-secondary text-xs font-mono py-2.5 px-4 cursor-pointer"
            >
              SKILL ANALYTICS
            </button>
            <button
              onClick={() => onNavigate?.('role-intelligence')}
              className="btn-secondary text-xs font-mono py-2.5 px-4 cursor-pointer"
            >
              ROLE INSIGHTS
            </button>
            <button
              onClick={() => onNavigate?.('simulation')}
              className="btn-secondary text-xs font-mono py-2.5 px-4 cursor-pointer"
            >
              ML PREDICTIONS
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-warm-ivory/60 font-mono">JOBS ANALYZED</span>
          </div>
          <p className="heading-md text-warm-ivory font-mono">17,443</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">Real Competition Dataset</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-warm-ivory/60 font-mono">ESTIMATED OPENINGS</span>
          </div>
          <p className="heading-md text-warm-ivory font-mono">1.09 Lakh</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">108,846 Positions Represented</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-warm-ivory/60 font-mono">CANONICAL SKILLS TRACKED</span>
          </div>
          <p className="heading-md text-warm-ivory font-mono">8,208</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">Normalized Taxonomy</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-warm-ivory/60 font-mono">MEDIAN SALARY</span>
            <span className="stamp-verified">VERIFIED</span>
          </div>
          <p className="heading-md text-emerald-400 font-mono">₹11.9 Lakhs</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">P25: ₹7.6L • P75: ₹17.2L</p>
        </div>
      </section>

      {/* Main Grid: Interactive Role Selector & Hiring Velocity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Top Roles Ranking */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="heading-sm text-warm-ivory font-mono text-xs uppercase tracking-wider">
              HIGH-DEMAND ROLES PULSE
            </h3>
            <span className="text-[10px] font-mono text-warm-ivory/50">CLICK TO INSPECT</span>
          </div>

          <div className="space-y-2">
            {mockMarketData.topRoles.map((role, idx) => {
              const isSelected = selectedRoleIdx === idx
              return (
                <div
                  key={role.name}
                  onClick={() => setSelectedRoleIdx(idx)}
                  className={cn(
                    'p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between',
                    isSelected
                      ? 'bg-gradient-crimson border-crimson text-warm-ivory shadow-glow-crimson font-bold'
                      : 'card-hover border-burgundy/25 text-warm-ivory/80'
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono opacity-70">#{idx + 1}</span>
                      <h4 className="text-sm font-semibold">{role.name}</h4>
                    </div>
                    <p className="text-[11px] font-mono opacity-70 mt-0.5">
                      {formatNumber(role.openings)} openings • {role.salary}
                    </p>
                  </div>
                  <span className={cn('text-xs font-mono font-bold', getTrendColor(role.trend))}>
                    {role.trend}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Role Chart & High-Velocity Stacks */}
        <div className="lg:col-span-7 card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-burgundy/20 pb-3">
            <div>
              <span className="text-[10px] font-mono text-crimson uppercase tracking-wider font-bold">
                TRAJECTORY ANALYSIS // {activeRole.name}
              </span>
              <h3 className="heading-sm text-warm-ivory font-mono text-sm mt-0.5">
                6-MONTH RECRUITMENT VOLUME INDEX
              </h3>
            </div>
            <button
              onClick={() => onNavigate?.('role-intelligence')}
              className="text-xs font-mono text-crimson hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              Open Role Dossier →
            </button>
          </div>

          {/* Chart */}
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeRole.trajectory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(179,19,43,0.12)" />
                <XAxis dataKey="month" stroke="rgba(242,233,220,0.4)" tick={{ fill: 'rgba(242,233,220,0.6)', fontSize: 11 }} />
                <YAxis stroke="rgba(242,233,220,0.4)" tick={{ fill: 'rgba(242,233,220,0.6)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: isHeist ? 'rgba(21,21,24,0.95)' : '#FFFFFF',
                    border: isHeist ? '1px solid rgba(179,19,43,0.4)' : '1px solid #E2E8F0',
                    borderRadius: '8px',
                    color: isHeist ? '#F2E9DC' : '#0F172A',
                    fontFamily: 'monospace',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isHeist ? '#B3132B' : '#2563EB'}
                  strokeWidth={2.5}
                  dot={{ fill: isHeist ? '#B3132B' : '#2563EB', r: 4 }}
                  activeDot={{ r: 6, fill: isHeist ? '#E63946' : '#1D4ED8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Key Tech Stacks for this role */}
          <div className="pt-2 border-t border-burgundy/20">
            <span className="text-[10px] font-mono text-warm-ivory/60 uppercase block mb-2 font-bold">
              CRITICAL DEMAND STACKS FOR {activeRole.name.toUpperCase()}:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeRole.keySkills.map((s) => (
                <div key={s.name} className="p-2 bg-burgundy/10 rounded border border-burgundy/20 text-xs font-mono">
                  <div className="flex justify-between items-center text-warm-ivory">
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-emerald-400 font-bold">{s.trend}</span>
                  </div>
                  <div className="w-full bg-burgundy/30 rounded-full h-1 mt-1.5 overflow-hidden">
                    <div style={{ width: `${s.demand}%` }} className="h-full bg-crimson rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* High-Velocity Tech Stacks Grid */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase tracking-wider">
            HIGH-MOMENTUM TECH STACKS // MARKET SHARE
          </h3>
          <button
            onClick={() => onNavigate?.('skill-intelligence')}
            className="text-xs font-mono text-crimson hover:underline flex items-center gap-1"
          >
            Explore All Tracked Tech →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {mockMarketData.topSkills.map((skill, idx) => (
            <div
              key={skill.name}
              onClick={() => onNavigate?.('skill-intelligence')}
              className="p-3 bg-burgundy/10 border border-burgundy/20 rounded-lg hover:border-crimson/50 hover:bg-burgundy/15 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-crimson font-bold">#{idx + 1}</span>
                <span className={cn('text-xs font-mono font-bold', getTrendColor(skill.trend))}>
                  {skill.trend}
                </span>
              </div>
              <h4 className="font-semibold text-warm-ivory text-sm mb-1.5">{skill.name}</h4>
              <div className="w-full bg-burgundy/30 rounded-full h-1.5 overflow-hidden">
                <div style={{ width: `${skill.demand}%` }} className="h-full bg-gradient-crimson rounded-full" />
              </div>
              <p className="text-[10px] text-warm-ivory/50 font-mono mt-1.5">{skill.demand}% Adoption Index</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Navigation Gateways */}
      <section className="card bg-gradient-obsidian border-crimson/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => onNavigate?.('skill-intelligence')}
            className="p-4 border border-burgundy/30 rounded-lg card-hover cursor-pointer group"
          >
            <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">SKILL INTELLIGENCE →</h4>
            <p className="text-warm-ivory/70 text-xs font-mono">
              8,208 canonical skills, co-occurrence patterns, and emerging tech stack momentum.
            </p>
          </div>
          <div
            onClick={() => onNavigate?.('role-intelligence')}
            className="p-4 border border-burgundy/30 rounded-lg card-hover cursor-pointer group"
          >
            <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">ROLE PROFILES →</h4>
            <p className="text-warm-ivory/70 text-xs font-mono">
              10 standardized role families with salary quartiles and competency blueprints.
            </p>
          </div>
          <div
            onClick={() => onNavigate?.('simulation')}
            className="p-4 border border-burgundy/30 rounded-lg card-hover cursor-pointer group"
          >
            <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">ML PREDICTIONS →</h4>
            <p className="text-warm-ivory/70 text-xs font-mono">
              JDS salary hike & SDS leadership ML models with validated accuracy metrics.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
