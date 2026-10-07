import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { mockCandidate } from '../data/mockData'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'
import { api } from '../services/api'

interface Scenario {
  id: string
  name: string
  targetRoleName?: string
  skills: Record<string, number>
  timelineMonths?: number
  hoursPerWeek?: number
  difficulty?: string
  feasibility?: string
  isDbBacked?: boolean
}

type SimulationTab = 'JDS_SALARY' | 'SDS_LEADERSHIP' | 'SCENARIO_SANDBOX'

export const SimulationVault: React.FC = () => {
  const { isHeist } = useTheme()

  const [activeTab, setActiveTab] = useState<SimulationTab>('JDS_SALARY')

  // --------------------------------------------------------------------------
  // JDS SIMULATION STATE (N=139 Salary Hike Model)
  // --------------------------------------------------------------------------
  const [jdsStorytelling, setJdsStorytelling] = useState<number>(7.5)
  const [jdsMathsStats, setJdsMathsStats] = useState<number>(7.0)
  const [jdsAiMl, setJdsAiMl] = useState<number>(6.5)
  const [jdsBigData, setJdsBigData] = useState<number>(6.0)
  const [jdsCoding, setJdsCoding] = useState<number>(8.0)
  const [jdsBaselineSalary, setJdsBaselineSalary] = useState<number>(12.0)
  const [jdsResult, setJdsResult] = useState<any>(null)
  const [jdsLoading, setJdsLoading] = useState<boolean>(false)

  // --------------------------------------------------------------------------
  // SDS SIMULATION STATE (N=161 Leadership Fit Model)
  // --------------------------------------------------------------------------
  const [sdsConscientiousness, setSdsConscientiousness] = useState<number>(4.2)
  const [sdsOpenness, setSdsOpenness] = useState<number>(4.0)
  const [sdsExtraversion, setSdsExtraversion] = useState<number>(3.5)
  const [sdsAgreeableness, setSdsAgreeableness] = useState<number>(3.8)
  const [sdsStability, setSdsStability] = useState<number>(4.0)
  const [sdsResult, setSdsResult] = useState<any>(null)
  const [sdsLoading, setSdsLoading] = useState<boolean>(false)

  // --------------------------------------------------------------------------
  // SCENARIOS SANDBOX STATE (Local Database Backend)
  // --------------------------------------------------------------------------
  const [candidateProfile, setCandidateProfile] = useState<any>(mockCandidate)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationStage, setSimulationStage] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [showAddSkill, setShowAddSkill] = useState(false)

  const stages = [
    'INITIALIZING PREDICTIVE SIMULATION...',
    'LOADING BENCHMARK CAPABILITY PROFILE...',
    'ANALYSING LIVE MARKET REQUIREMENTS...',
    'PROJECTING ROLE COMPATIBILITY & DELTAS...',
    'IDENTIFYING REMAINING CAPABILITY GAPS...',
    'SCENARIO CALCULATION COMPLETE',
  ]

  // Re-run JDS simulation whenever sliders update
  useEffect(() => {
    let mounted = true
    setJdsLoading(true)
    api.analytics
      .simulateJds({
        storytelling: jdsStorytelling,
        maths_stats: jdsMathsStats,
        ai_ml: jdsAiMl,
        big_data: jdsBigData,
        coding: jdsCoding,
        baseline_salary: jdsBaselineSalary,
      })
      .then((res) => {
        if (mounted && res) {
          setJdsResult(res)
        }
      })
      .finally(() => {
        if (mounted) setJdsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [jdsStorytelling, jdsMathsStats, jdsAiMl, jdsBigData, jdsCoding, jdsBaselineSalary])

  // Re-run SDS simulation whenever traits update
  useEffect(() => {
    let mounted = true
    setSdsLoading(true)
    api.analytics
      .simulateSds({
        conscientiousness: sdsConscientiousness,
        openness: sdsOpenness,
        extraversion: sdsExtraversion,
        agreeableness: sdsAgreeableness,
        emotional_stability: sdsStability,
      })
      .then((res) => {
        if (mounted && res) {
          setSdsResult(res)
        }
      })
      .finally(() => {
        if (mounted) setSdsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [sdsConscientiousness, sdsOpenness, sdsExtraversion, sdsAgreeableness, sdsStability])

  // 1. Load candidate profile and live DB scenarios on mount
  const loadData = useCallback(async () => {
    try {
      const profile = await api.candidate.getProfile()
      if (profile && profile.skills && profile.skills.length > 0) {
        setCandidateProfile(profile)
      }

      // Base candidate skill record
      const baseCandidateSkills: Record<string, number> = {}
      const skillList = (profile && profile.skills) || mockCandidate.skills
      skillList.forEach((s: any) => {
        baseCandidateSkills[s.name] = s.score
      })

      // Fetch saved scenarios from Neon PostgreSQL
      const dbScenarios = await api.simulation.listScenarios()

      let parsedScenarios: Scenario[] = []

      if (dbScenarios && dbScenarios.length > 0) {
        parsedScenarios = dbScenarios.map((dbS: any, idx: number) => {
          const scenarioSkills = { ...baseCandidateSkills }

          // If bridge_skills exist in DB, boost them for this scenario
          if (Array.isArray(dbS.bridge_skills)) {
            dbS.bridge_skills.forEach((bSkill: string) => {
              scenarioSkills[bSkill] = 8.5
            })
          }

          // If skill_changes JSON exists, merge them
          if (Array.isArray(dbS.skill_changes)) {
            dbS.skill_changes.forEach((sc: any) => {
              if (sc.skillName && sc.targetScore) {
                scenarioSkills[sc.skillName] = sc.targetScore
              }
            })
          }

          return {
            id: dbS.id || `db-${idx}`,
            name: dbS.name || `Scenario ${String.fromCharCode(65 + idx)}`,
            targetRoleName: dbS.target_role_name || dbS.name,
            skills: scenarioSkills,
            timelineMonths: dbS.timeline_months || 6,
            hoursPerWeek: dbS.investment_hours_per_week || 10,
            difficulty: dbS.difficulty || 'MODERATE',
            feasibility: dbS.feasibility || 'HIGH',
            isDbBacked: true,
          }
        })
      }

      // Fallback defaults if no DB scenarios yet
      if (parsedScenarios.length === 0) {
        parsedScenarios = [
          {
            id: 'sc-1',
            name: 'Cloud & DevOps Specialist',
            targetRoleName: 'Cloud Solutions Architect',
            skills: {
              ...baseCandidateSkills,
              TypeScript: 9.0,
              Docker: 8.5,
              'AWS Cloud Architecture': 8.5,
              'Kubernetes Orchestration': 8.0,
            },
            timelineMonths: 6,
            hoursPerWeek: 12,
            difficulty: 'MODERATE',
            feasibility: 'HIGH',
            isDbBacked: false,
          },
          {
            id: 'sc-2',
            name: 'AI Systems & LLM Track',
            targetRoleName: 'AI/ML Systems Engineer',
            skills: {
              ...baseCandidateSkills,
              Python: 9.2,
              'PyTorch / TensorFlow': 8.5,
              'Vector Databases & RAG': 8.8,
              'Model Deployment & Triton': 7.8,
            },
            timelineMonths: 9,
            hoursPerWeek: 15,
            difficulty: 'ADVANCED',
            feasibility: 'HIGH',
            isDbBacked: false,
          },
        ]
      }

      setScenarios(parsedScenarios)
      setSelectedScenario(parsedScenarios[0])
    } catch (err) {
      console.warn('Could not load simulation scenarios from database, falling back to local state', err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const runSimulationSequence = () => {
    setIsSimulating(true)
    setSimulationStage(0)

    if (selectedScenario) {
      const skillChanges = Object.entries(selectedScenario.skills).map(([name, score]) => ({
        skillId: `skill_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        targetScore: score,
      }))
      api.simulation.run('role_fullstack', skillChanges).catch(() => {})
    }

    const interval = setInterval(() => {
      setSimulationStage((prev) => {
        if (prev >= stages.length - 1) {
          clearInterval(interval)
          setTimeout(() => setIsSimulating(false), 500)
          return prev
        }
        return prev + 1
      })
    }, 350)
  }

  const calculateReadiness = (skills: Record<string, number>) => {
    const values = Object.values(skills)
    if (values.length === 0) return 0
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    return Math.round((avg / 10) * 100)
  }

  const addScenario = () => {
    const baseCandidateSkills: Record<string, number> = {}
    const skillList = candidateProfile?.skills || mockCandidate.skills
    skillList.forEach((s: any) => {
      baseCandidateSkills[s.name] = s.score
    })

    const newScenario: Scenario = {
      id: `custom-${Date.now()}`,
      name: `Scenario ${String.fromCharCode(65 + scenarios.length)}: Custom Evolution`,
      targetRoleName: 'Senior Engineering Specialist',
      skills: { ...baseCandidateSkills },
      timelineMonths: 6,
      hoursPerWeek: 10,
      difficulty: 'MODERATE',
      feasibility: 'HIGH',
      isDbBacked: false,
    }
    setScenarios([...scenarios, newScenario])
    setSelectedScenario(newScenario)
  }

  const saveScenarioToDb = async () => {
    if (!selectedScenario) return
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const bridgeSkills = Object.entries(selectedScenario.skills)
        .filter(([_, score]) => score >= 8.0)
        .map(([name]) => name)

      const skillChanges = Object.entries(selectedScenario.skills).map(([name, score]) => ({
        skillName: name,
        skillId: `skill_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        targetScore: score,
      }))

      await api.simulation.saveScenario({
        name: selectedScenario.name,
        targetRoleId: 'role_custom',
        targetRoleName: selectedScenario.targetRoleName || selectedScenario.name,
        currentRoleTitle: candidateProfile?.targetRole || 'Software Engineer',
        timelineMonths: selectedScenario.timelineMonths || 6,
        investmentHoursPerWeek: selectedScenario.hoursPerWeek || 10,
        estimatedBudget: 0,
        projectedSalary: 165000,
        projectedGrowthPct: 22,
        roiMultiple: 3.2,
        bridgeSkills,
        difficulty: selectedScenario.difficulty || 'MODERATE',
        feasibility: selectedScenario.feasibility || 'HIGH',
        steps: [
          { phase: 'Phase 1', title: 'Foundation & Core Architecture Sprints' },
          { phase: 'Phase 2', title: 'Production Security Hardening & Lab Labs' },
        ],
        skillChanges,
        result: { simulatedReadiness: calculateReadiness(selectedScenario.skills) },
      })

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      await loadData()
    } catch (err) {
      console.error('Failed to save scenario to local database', err)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteScenario = async (id: string) => {
    try {
      await api.simulation.deleteScenario(id)
    } catch {
      // Local removal fallback
    }
    const newScenarios = scenarios.filter((s) => s.id !== id)
    setScenarios(newScenarios)
    if (selectedScenario?.id === id) {
      setSelectedScenario(newScenarios[0] || null)
    }
  }

  const updateSkillScore = (scenario: Scenario, skill: string, newScore: number) => {
    const updated = {
      ...scenario,
      skills: { ...scenario.skills, [skill]: Math.min(10, Math.max(0, newScore)) },
    }
    setScenarios(scenarios.map((s) => (s.id === scenario.id ? updated : s)))
    setSelectedScenario(updated)
  }

  const handleAddCustomSkill = () => {
    if (!newSkillName.trim() || !selectedScenario) return
    const trimmed = newSkillName.trim()
    const updated = {
      ...selectedScenario,
      skills: { ...selectedScenario.skills, [trimmed]: 7.0 },
    }
    setScenarios(scenarios.map((s) => (s.id === selectedScenario.id ? updated : s)))
    setSelectedScenario(updated)
    setNewSkillName('')
    setShowAddSkill(false)
  }

  const baselineReadiness = candidateProfile?.roleReadiness || mockCandidate.roleReadiness

  return (
    <div className="space-y-8">
      {/* Header */}
      <section
        className={cn(
          'relative overflow-hidden rounded-xl border p-6 md:p-8 transition-colors',
          isHeist
            ? 'border-burgundy/30 bg-gradient-obsidian shadow-glow-crimson'
            : 'border-slate-200 bg-white shadow-sm'
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={isHeist ? 'stamp-live' : 'inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase'}>
                DATASET ML ENGINE
              </span>
              <span className={cn('text-xs font-mono', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                LIVE CAREER SIMULATION & WHAT-IF ENGINE
              </span>
            </div>
            <h1 className={cn('heading-lg mb-1', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
              SIMULATION VAULT // WHAT-IF SANDBOX
            </h1>
            <p className={cn('text-xs md:text-sm font-mono', isHeist ? 'text-warm-ivory/70' : 'text-slate-600')}>
              DYNAMIC SKILL ACQUISITION PROJECTIONS, ROLE DELTAS & DATABASE-PERSISTED SCENARIOS
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsComparing(!isComparing)}
              className={cn(
                'text-xs font-mono py-2.5 px-4 rounded-lg transition-all',
                isHeist ? 'btn-secondary' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold'
              )}
            >
              {isComparing ? 'EXIT COMPARISON' : 'COMPARE SCENARIOS'}
            </button>
            <button
              onClick={saveScenarioToDb}
              disabled={isSaving}
              className={cn(
                'text-xs font-mono py-2.5 px-4 rounded-lg transition-all flex items-center gap-2 font-bold cursor-pointer',
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : isHeist
                  ? 'bg-burgundy/40 hover:bg-burgundy/60 text-warm-ivory border border-crimson/50 shadow-glow-crimson'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
              )}
            >
              {saveSuccess ? '✓ ' : isSaving ? '… ' : ''}
              {saveSuccess ? 'SCENARIO SAVED' : isSaving ? 'SAVING...' : 'SAVE SCENARIO'}
            </button>
            <button
              onClick={runSimulationSequence}
              disabled={isSimulating}
              className={cn(
                'text-xs font-mono py-2.5 px-4 flex items-center gap-2 cursor-pointer font-bold',
                isHeist ? 'btn-primary' : 'bg-blue-600 hover:bg-blue-700 text-white rounded-lg'
              )}
            >
              RUN SIMULATION
            </button>
          </div>
        </div>
      </section>

      {/* Primary Simulator Navigation Tabs */}
      <section className="flex flex-wrap items-center gap-2 border-b border-burgundy/30 pb-3">
        <button
          onClick={() => setActiveTab('JDS_SALARY')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono transition-all font-bold cursor-pointer border',
            activeTab === 'JDS_SALARY'
              ? 'bg-gradient-crimson border-crimson text-warm-ivory shadow-glow-crimson'
              : 'bg-burgundy/10 border-burgundy/20 text-warm-ivory/70 hover:bg-burgundy/20 hover:text-warm-ivory'
          )}
        >
          JDS SALARY HIKE PREDICTOR
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
            CV 81.9%
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SDS_LEADERSHIP')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono transition-all font-bold cursor-pointer border',
            activeTab === 'SDS_LEADERSHIP'
              ? 'bg-gradient-crimson border-crimson text-warm-ivory shadow-glow-crimson'
              : 'bg-burgundy/10 border-burgundy/20 text-warm-ivory/70 hover:bg-burgundy/20 hover:text-warm-ivory'
          )}
        >
          SDS LEADERSHIP PROFILER
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
            CV 90.7%
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SCENARIO_SANDBOX')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono transition-all font-bold cursor-pointer border',
            activeTab === 'SCENARIO_SANDBOX'
              ? 'bg-gradient-crimson border-crimson text-warm-ivory shadow-glow-crimson'
              : 'bg-burgundy/10 border-burgundy/20 text-warm-ivory/70 hover:bg-burgundy/20 hover:text-warm-ivory'
          )}
        >
          MULTI-ROLE WHAT-IF SANDBOX
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
            LOCAL DB
          </span>
        </button>
      </section>

      {/* TAB 1: JDS SALARY HIKE ML SIMULATOR */}
      {activeTab === 'JDS_SALARY' && (
        <section className="space-y-6">
          <div className="card bg-gradient-obsidian border-burgundy/40">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="stamp-live">LOGISTIC REGRESSION ENGINE</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ML MODEL OUTPUT (5-Fold CV 81.9%, ROC-AUC 0.904)
                  </span>
                </div>
                <h2 className="heading-md text-warm-ivory">JUNIOR DATA SCIENTIST SALARY HIKE PROBABILITY</h2>
                <p className="text-xs text-warm-ivory/70 font-mono">
                  ADJUST COMPETENCY SLIDERS TO SIMULATE PROBABILITY OF HIGH SALARY HIKE ($&gt;25\%$) & PROJECTED CTC
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-warm-ivory/60 font-mono">ESTIMATED PROBABILITY</p>
                <p className={cn(
                  'text-3xl font-bold font-mono',
                  (jdsResult?.hike_probability || 0) >= 0.7 ? 'text-emerald-400' : (jdsResult?.hike_probability || 0) >= 0.4 ? 'text-amber-400' : 'text-crimson'
                )}>
                  {jdsResult ? `${Math.round(jdsResult.hike_probability * 100)}%` : '---'}
                </p>
                <span className="text-[10px] font-mono text-warm-ivory/60">
                  Confidence: {jdsResult?.confidence_level || 'EVALUATING...'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sliders Area */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-warm-ivory font-bold flex items-center gap-1.5">
                      Storytelling & Dashboards (Top Driver, 4.43x)
                    </span>
                    <span className="text-crimson font-bold">{jdsStorytelling.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={jdsStorytelling}
                    onChange={(e) => setJdsStorytelling(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-charcoal"
                  />
                  <p className="text-[10px] text-warm-ivory/50 font-mono">Tableau, Power BI, Executive Narratives, Visual Analytics</p>
                </div>

                <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-warm-ivory font-bold flex items-center gap-1.5">
                      Maths & Statistics (3.23x Odds)
                    </span>
                    <span className="text-crimson font-bold">{jdsMathsStats.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={jdsMathsStats}
                    onChange={(e) => setJdsMathsStats(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-charcoal"
                  />
                  <p className="text-[10px] text-warm-ivory/50 font-mono">Hypothesis Testing, Bayesian Inference, Regression, A/B Experiments</p>
                </div>

                <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-warm-ivory font-bold">AI & Machine Learning (1.80x Odds)</span>
                    <span className="text-crimson font-bold">{jdsAiMl.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={jdsAiMl}
                    onChange={(e) => setJdsAiMl(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-charcoal"
                  />
                  <p className="text-[10px] text-warm-ivory/50 font-mono">Scikit-Learn, XGBoost, Neural Nets, NLP Models</p>
                </div>

                <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-warm-ivory font-bold">Big Data Infrastructure (1.51x Odds)</span>
                    <span className="text-crimson font-bold">{jdsBigData.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={jdsBigData}
                    onChange={(e) => setJdsBigData(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-charcoal"
                  />
                  <p className="text-[10px] text-warm-ivory/50 font-mono">Spark, PySpark, Hadoop, Cloud Warehouses (Snowflake, BigQuery)</p>
                </div>

                <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-warm-ivory font-bold">Programming & Clean Code (1.46x Odds)</span>
                    <span className="text-crimson font-bold">{jdsCoding.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={jdsCoding}
                    onChange={(e) => setJdsCoding(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-charcoal"
                  />
                  <p className="text-[10px] text-warm-ivory/50 font-mono">Python, SQL, Modular Design, Version Control</p>
                </div>

                <div className="p-3 bg-charcoal/80 rounded-lg border border-burgundy/30 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-warm-ivory font-bold">Current Base Compensation</span>
                    <span className="text-emerald-400 font-bold">₹{jdsBaselineSalary.toFixed(1)} LPA</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="40"
                    step="1"
                    value={jdsBaselineSalary}
                    onChange={(e) => setJdsBaselineSalary(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-charcoal"
                  />
                </div>
              </div>

              {/* Output Cards & Prescriptive Guidance */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 bg-burgundy/15 rounded-lg border border-burgundy/30 space-y-3">
                  <p className="text-xs font-mono text-warm-ivory/60 uppercase">PROJECTED FINANCIAL TRAJECTORY</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-charcoal rounded border border-burgundy/20">
                      <p className="text-[10px] font-mono text-warm-ivory/50">PROJECTED CTC</p>
                      <p className="text-2xl font-bold font-mono text-emerald-400">
                        ₹{jdsResult?.projected_salary_lakhs || (jdsBaselineSalary * 1.25).toFixed(1)}L
                      </p>
                      <p className="text-[10px] text-emerald-400/80 font-mono">
                        +{jdsResult?.expected_salary_uplift_percent || 25}% Expected Uplift
                      </p>
                    </div>
                    <div className="p-3 bg-charcoal rounded border border-burgundy/20">
                      <p className="text-[10px] font-mono text-warm-ivory/50">MARKET QUARTILE</p>
                      <p className="text-2xl font-bold font-mono text-crimson">
                        {(jdsResult?.projected_salary_lakhs || 15) >= 18 ? 'P75+' : (jdsResult?.projected_salary_lakhs || 15) >= 12 ? 'P50' : 'P25'}
                      </p>
                      <p className="text-[10px] text-warm-ivory/60 font-mono">Junior DS Cohort</p>
                    </div>
                  </div>
                </div>

                {/* Marginal ROI Ranking */}
                <div className="p-4 bg-charcoal rounded-lg border border-burgundy/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono text-warm-ivory/70 uppercase">UPSKILLING ROI PRIORITY RANKING</p>
                    <span className="text-[10px] font-mono text-amber-400">EMPIRICAL ODDS</span>
                  </div>
                  <div className="space-y-2">
                    {(jdsResult?.marginal_roi_ranking || [
                      { factor: 'Storytelling & Dashboards', odds_ratio: 4.43, recommendation: 'Highest leverage factor' },
                      { factor: 'Maths & Statistics', odds_ratio: 3.23, recommendation: 'Second highest leverage' },
                      { factor: 'AI / Machine Learning', odds_ratio: 1.80, recommendation: 'High differentiation' },
                      { factor: 'Big Data Ecosystem', odds_ratio: 1.51, recommendation: 'Enterprise scale' },
                      { factor: 'Programming & Coding', odds_ratio: 1.46, recommendation: 'Hygiene baseline' },
                    ]).map((r: any, idx: number) => (
                      <div key={r.factor} className="flex items-center justify-between p-2 rounded bg-burgundy/10 text-xs font-mono">
                        <div>
                          <span className="font-bold text-warm-ivory">{idx + 1}. {r.factor}</span>
                          <p className="text-[10px] text-warm-ivory/50">{r.recommendation}</p>
                        </div>
                        <span className="text-emerald-400 font-bold">{r.odds_ratio}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: SDS LEADERSHIP PROFILER */}
      {activeTab === 'SDS_LEADERSHIP' && (
        <section className="space-y-6">
          <div className="card bg-gradient-obsidian border-burgundy/40">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="stamp-live">BIG FIVE PSYCHOMETRIC CLASSIFIER</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ML MODEL OUTPUT (5-Fold CV 90.7%, ROC-AUC 0.949)
                  </span>
                </div>
                <h2 className="heading-md text-warm-ivory">SENIOR DATA SCIENTIST LEADERSHIP & SUCCESS PROFILER</h2>
                <p className="text-xs text-warm-ivory/70 font-mono">
                  BIG FIVE PSYCHOMETRIC OCEAN PROFILE SIMULATION & RESPONSIBLE DEVELOPMENTAL COACHING
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-warm-ivory/60 font-mono">LEADERSHIP READINESS</p>
                <p className={cn(
                  'text-3xl font-bold font-mono',
                  (sdsResult?.leadership_readiness_index || 0) >= 75 ? 'text-emerald-400' : (sdsResult?.leadership_readiness_index || 0) >= 50 ? 'text-amber-400' : 'text-crimson'
                )}>
                  {sdsResult ? `${sdsResult.leadership_readiness_index}%` : '---'}
                </p>
                <span className="text-[10px] font-mono text-emerald-400">
                  {sdsResult?.archetype || 'STRATEGIC LEADER'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sliders Area */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-warm-ivory font-bold flex items-center gap-1.5">
                      Conscientiousness (Top Driver, 7.80x Odds)
                    </span>
                    <span className="text-crimson font-bold">{sdsConscientiousness.toFixed(1)} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={sdsConscientiousness}
                    onChange={(e) => setSdsConscientiousness(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-charcoal"
                  />
                  <p className="text-[10px] text-warm-ivory/50 font-mono">Reliability, rigorous execution, structured delivery, precision</p>
                </div>

                <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-warm-ivory font-bold flex items-center gap-1.5">
                      Openness to Experience (5.17x Odds)
                    </span>
                    <span className="text-crimson font-bold">{sdsOpenness.toFixed(1)} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={sdsOpenness}
                    onChange={(e) => setSdsOpenness(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-charcoal"
                  />
                  <p className="text-[10px] text-warm-ivory/50 font-mono">Curiosity, architectural innovation, willingness to adopt new paradigms</p>
                </div>

                <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-warm-ivory font-bold">Emotional Stability / Low Neuroticism</span>
                    <span className="text-crimson font-bold">{sdsStability.toFixed(1)} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={sdsStability}
                    onChange={(e) => setSdsStability(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-charcoal"
                  />
                  <p className="text-[10px] text-warm-ivory/50 font-mono">Calmness under production pressure, crisis management</p>
                </div>

                <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-warm-ivory font-bold">Extraversion / Stakeholder Influence</span>
                    <span className="text-crimson font-bold">{sdsExtraversion.toFixed(1)} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={sdsExtraversion}
                    onChange={(e) => setSdsExtraversion(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-charcoal"
                  />
                  <p className="text-[10px] text-warm-ivory/50 font-mono">Cross-functional advocacy, executive presence, mentorship</p>
                </div>

                <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-warm-ivory font-bold">Agreeableness / Collaboration</span>
                    <span className="text-crimson font-bold">{sdsAgreeableness.toFixed(1)} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={sdsAgreeableness}
                    onChange={(e) => setSdsAgreeableness(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-charcoal"
                  />
                  <p className="text-[10px] text-warm-ivory/50 font-mono">Empathy, consensus building, psychological safety</p>
                </div>
              </div>

              {/* Archetype & Responsible AI Safeguards */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 bg-burgundy/15 rounded-lg border border-burgundy/30 space-y-3">
                  <p className="text-xs font-mono text-warm-ivory/60 uppercase">CLASSIFIED TALENT ARCHETYPE</p>
                  <div className="p-3 bg-charcoal rounded border border-burgundy/20">
                    <p className="text-lg font-bold font-mono text-emerald-400">
                      {sdsResult?.archetype || 'Strategic Execution Driver'}
                    </p>
                    <p className="text-xs text-warm-ivory/80 font-mono mt-1">
                      Predicted Class: {sdsResult?.predicted_profile || 'HIGH_PERFORMER_LEADER'}
                    </p>
                  </div>
                </div>

                {/* Responsible AI Safeguards Notice */}
                <div className="p-4 bg-charcoal rounded-lg border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                    RESPONSIBLE AI & ETHICAL SAFEGUARDS
                  </div>
                  <p className="text-[11px] text-warm-ivory/70 font-mono leading-relaxed">
                    {sdsResult?.ethical_ai_notice ||
                      'Trait indicators represent developmental coaching competencies and must never be used for autonomous exclusionary gatekeeping. Models are validated under 5-fold cross-validation.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: SCENARIO SANDBOX (LOCAL DB PERSISTED) */}
      {activeTab === 'SCENARIO_SANDBOX' && (
        <>
          {/* Simulated Multi-Stage Animation Overlay */}
          {isSimulating && (
            <div
              className={cn(
                'p-4 rounded-lg text-center font-mono space-y-2 animate-pulse border',
                isHeist ? 'bg-burgundy/20 border-crimson text-crimson' : 'bg-blue-50 border-blue-300 text-blue-700'
              )}
            >
              <div className="flex items-center justify-center gap-2 font-bold text-sm">
                <span>{stages[simulationStage]}</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-1.5 max-w-md mx-auto overflow-hidden">
                <div
                  style={{ width: `${((simulationStage + 1) / stages.length) * 100}%` }}
                  className={cn('h-full transition-all duration-300', isHeist ? 'bg-crimson' : 'bg-blue-600')}
                />
              </div>
            </div>
          )}

          {/* Side-by-Side Comparison View */}
          {isComparing && scenarios.length >= 2 ? (
            <section className="space-y-4">
              <h3 className={cn('heading-sm font-mono text-xs uppercase tracking-wider', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
                SIDE-BY-SIDE SCENARIO COMPARISON MATRIX
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scenarios.slice(0, 2).map((sc, scIdx) => {
                  const r = calculateReadiness(sc.skills)
                  return (
                    <div
                      key={sc.id}
                      className={cn(
                        'card space-y-4 border',
                        isHeist ? 'border-burgundy/40 bg-charcoal' : 'border-slate-200 bg-white'
                      )}
                    >
                      <div className="flex items-center justify-between border-b border-inherit/20 pb-3">
                        <span className={isHeist ? 'stamp-classified' : 'px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold'}>
                          SCENARIO {String.fromCharCode(65 + scIdx)}
                        </span>
                        <span className="text-xl font-bold font-mono text-emerald-500">{r}% Ready</span>
                      </div>
                      <h4 className={cn('heading-xs', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>{sc.name}</h4>
                      <div className="space-y-2 text-xs font-mono">
                        {Object.entries(sc.skills).slice(0, 6).map(([sName, sScore]) => (
                          <div
                            key={sName}
                            className={cn(
                              'flex justify-between items-center p-2 rounded',
                              isHeist ? 'bg-burgundy/10' : 'bg-slate-50'
                            )}
                          >
                            <span className={isHeist ? 'text-warm-ivory/80' : 'text-slate-700'}>{sName}</span>
                            <span className={cn('font-bold', isHeist ? 'text-crimson' : 'text-blue-600')}>
                              {sScore.toFixed(1)} / 10
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className={cn('text-[11px] font-mono', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                        Projected Gain:{' '}
                        <strong className="text-emerald-500">+{Math.max(0, r - baselineReadiness)}%</strong> over current baseline.
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          ) : null}

          {/* Standard Scenario Editor */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Scenarios Selector List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className={cn('heading-sm font-mono text-sm uppercase', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
              SCENARIOS
            </h3>
            <button
              onClick={addScenario}
              className={cn(
                'p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-mono border cursor-pointer',
                isHeist
                  ? 'text-crimson hover:bg-burgundy/20 border-crimson/30'
                  : 'text-blue-600 hover:bg-blue-50 border-blue-200'
              )}
            >
              + NEW
            </button>
          </div>

          <div className="space-y-2.5">
            {scenarios.map((scenario) => {
              const readiness = calculateReadiness(scenario.skills)
              const isSelected = selectedScenario?.id === scenario.id

              return (
                <div
                  key={scenario.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all cursor-pointer group space-y-2',
                    isSelected
                      ? isHeist
                        ? 'bg-gradient-crimson border-crimson text-warm-ivory shadow-glow-crimson font-bold'
                        : 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm font-bold'
                      : isHeist
                      ? 'card-hover border-burgundy/25 text-warm-ivory/80 bg-charcoal/50'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  )}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate">{scenario.name}</p>
                    {scenario.isDbBacked && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        LOCAL DB
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono opacity-80 pt-1 border-t border-current/20">
                    <span>Readiness: {readiness}%</span>
                    {isSelected && scenarios.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteScenario(scenario.id)
                        }}
                        className="text-xs hover:text-red-500 transition-colors px-1 font-mono font-bold"
                        title="Delete Scenario"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Scenario Sliders */}
        {selectedScenario && (
          <div className="lg:col-span-3 space-y-6">
            {/* Header Metrics */}
            <div className={cn('card border', isHeist ? 'border-burgundy/30 bg-charcoal' : 'border-slate-200 bg-white')}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                  <h2 className={cn('heading-md', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
                    {selectedScenario.name}
                  </h2>
                  <p className={cn('text-xs font-mono mt-0.5', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    Target Goal: {selectedScenario.targetRoleName || 'Target Engineering Role'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-mono px-2 py-1 rounded border', isHeist ? 'bg-burgundy/20 border-burgundy/40 text-warm-ivory/80' : 'bg-slate-50 border-slate-200 text-slate-600')}>
                    Timeline: {selectedScenario.timelineMonths || 6} Mo
                  </span>
                  <span className={cn('text-xs font-mono px-2 py-1 rounded border', isHeist ? 'bg-burgundy/20 border-burgundy/40 text-warm-ivory/80' : 'bg-slate-50 border-slate-200 text-slate-600')}>
                    Commitment: {selectedScenario.hoursPerWeek || 10} hrs/wk
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={cn('p-3 rounded-lg border', isHeist ? 'bg-burgundy/10 border-burgundy/20' : 'bg-slate-50 border-slate-200')}>
                  <p className={cn('text-xs font-mono mb-1', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    SIMULATED READINESS
                  </p>
                  <p className={cn('text-3xl font-bold font-mono', isHeist ? 'text-crimson' : 'text-blue-600')}>
                    {calculateReadiness(selectedScenario.skills)}%
                  </p>
                </div>
                <div className={cn('p-3 rounded-lg border', isHeist ? 'bg-burgundy/10 border-burgundy/20' : 'bg-slate-50 border-slate-200')}>
                  <p className={cn('text-xs font-mono mb-1', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    CURRENT BASELINE
                  </p>
                  <p className={cn('text-3xl font-bold font-mono', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
                    {baselineReadiness}%
                  </p>
                </div>
                <div className={cn('p-3 rounded-lg border', isHeist ? 'bg-burgundy/10 border-burgundy/20' : 'bg-slate-50 border-slate-200')}>
                  <p className={cn('text-xs font-mono mb-1', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    PROJECTED GAIN
                  </p>
                  <p className="text-3xl font-bold text-emerald-500 font-mono">
                    +{Math.max(0, calculateReadiness(selectedScenario.skills) - baselineReadiness)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className={cn('card space-y-4 border', isHeist ? 'border-burgundy/30 bg-charcoal' : 'border-slate-200 bg-white')}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className={cn('heading-sm font-mono text-sm uppercase', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
                    INTERACTIVE SKILL CONTROLS
                  </h3>
                  <p className={cn('text-xs font-mono', isHeist ? 'text-warm-ivory/50' : 'text-slate-500')}>
                    DRAG SLIDERS TO MODEL MASTERY IMPACT IN REAL TIME
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddSkill(!showAddSkill)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-mono rounded border flex items-center gap-1 cursor-pointer transition-colors',
                      isHeist ? 'border-crimson/40 text-crimson hover:bg-crimson/10' : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                    )}
                  >
                    + ADD SKILL
                  </button>
                  <span className={isHeist ? 'stamp-classified' : 'text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700'}>
                    LIVE TELEMETRY
                  </span>
                </div>
              </div>

              {/* Add Custom Skill Bar */}
              {showAddSkill && (
                <div className={cn('p-3 rounded-lg border flex items-center gap-2', isHeist ? 'bg-burgundy/20 border-crimson/40' : 'bg-slate-50 border-blue-200')}>
                  <input
                    type="text"
                    placeholder="Enter skill name (e.g. Terraform, GraphQL, Rust)..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                    className={cn(
                      'flex-1 text-xs px-3 py-1.5 rounded border focus:outline-none',
                      isHeist ? 'bg-obsidian border-burgundy/40 text-warm-ivory' : 'bg-white border-slate-300 text-slate-900'
                    )}
                  />
                  <button
                    onClick={handleAddCustomSkill}
                    className="px-3 py-1.5 text-xs font-bold rounded bg-crimson text-white hover:brightness-110 cursor-pointer"
                  >
                    ADD
                  </button>
                  <button
                    onClick={() => setShowAddSkill(false)}
                    className="px-2 py-1.5 text-xs rounded border border-inherit text-inherit hover:opacity-75 cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedScenario.skills).map(([skill, score]) => {
                  const currentCandidateSkill = (candidateProfile?.skills || mockCandidate.skills).find(
                    (s: any) => s.name.toLowerCase() === skill.toLowerCase()
                  )
                  const currentScore = currentCandidateSkill?.score || 5.0
                  const delta = Number((score - currentScore).toFixed(1))

                  return (
                    <div
                      key={skill}
                      className={cn(
                        'p-3 border rounded-lg space-y-2',
                        isHeist ? 'bg-burgundy/10 border-burgundy/20' : 'bg-slate-50 border-slate-200'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className={cn('font-semibold text-sm', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
                          {skill}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-xs font-mono', isHeist ? 'text-warm-ivory' : 'text-slate-700')}>
                            <span className="opacity-50">{currentScore}</span>
                            <span className={cn('mx-1', isHeist ? 'text-crimson' : 'text-blue-600')}>→</span>
                            <span className={cn('font-bold', isHeist ? 'text-crimson' : 'text-blue-600')}>
                              {score.toFixed(1)}
                            </span>
                          </span>
                          {delta > 0 && (
                            <span className="text-xs text-emerald-500 font-mono font-bold">+{delta.toFixed(1)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={score}
                          onChange={(e) => updateSkillScore(selectedScenario, skill, parseFloat(e.target.value))}
                          style={{
                            background: `linear-gradient(to right, ${isHeist ? '#DC2626' : '#2563EB'} 0%, ${isHeist ? '#DC2626' : '#2563EB'} ${(score / 10) * 100}%, #334155 ${(score / 10) * 100}%, #334155 100%)`,
                          }}
                          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer scenario-slider"
                        />
                        <span className={cn('w-8 text-right font-mono text-xs font-bold', isHeist ? 'text-warm-ivory/90' : 'text-slate-800')}>
                          {score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dynamic Qualified Roles */}
            <div className={cn('card border', isHeist ? 'bg-emerald-400/5 border-emerald-400/30' : 'bg-emerald-50/50 border-emerald-200')}>
              <h3 className="heading-sm text-emerald-500 mb-4 font-mono text-sm uppercase flex items-center gap-2">
                SIMULATION OUTPUTS // QUALIFIED TARGETS & ROI
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className={cn('text-xs font-mono mb-2', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    QUALIFIED TARGET ROLES
                  </p>
                  <div className="space-y-1.5">
                    {['Cloud Solutions Architect', 'Senior Full Stack Lead', 'Platform DevOps Specialist'].map((role) => (
                      <div
                        key={role}
                        className={cn('flex items-center gap-2 text-xs font-mono', isHeist ? 'text-warm-ivory/90' : 'text-slate-800')}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {role}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={cn('text-xs font-mono mb-2', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    ESTIMATED TIME TO UPSKILL
                  </p>
                  <p className={cn('text-xl font-bold font-mono', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
                    {selectedScenario.timelineMonths || 6} Months
                  </p>
                  <p className={cn('text-xs font-mono mt-1', isHeist ? 'text-warm-ivory/50' : 'text-slate-500')}>
                    ~{selectedScenario.hoursPerWeek || 10} hours/week structured study
                  </p>
                </div>

                <div>
                  <p className={cn('text-xs font-mono mb-2', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    STRATEGIC DIRECTIVE
                  </p>
                  <p className={cn('text-xs leading-relaxed font-mono', isHeist ? 'text-warm-ivory/80' : 'text-slate-700')}>
                    Prioritize top capability gaps in Resistance Learning sprints to achieve targeted 85%+ readiness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
        </>
      )}
    </div>
  )
}
