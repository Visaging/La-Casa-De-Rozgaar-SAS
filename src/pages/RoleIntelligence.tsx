import React, { useState } from 'react'
import { mockRoleDossiers } from '../data/mockData'
import { formatNumber, cn } from '../lib/utils'

interface RoleIntelligenceProps {
  onNavigate?: (page: string) => void
}

export const RoleIntelligence: React.FC<RoleIntelligenceProps> = ({ onNavigate }) => {
  const roles = Object.keys(mockRoleDossiers)
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>(roles[0] || 'Software Engineer')
  const role = mockRoleDossiers[selectedRoleKey] || mockRoleDossiers['Software Engineer']

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">LIVE INTELLIGENCE</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // ROLE-INTEL-08</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                REAL DATA
              </span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">ROLE INTELLIGENCE DOSSIERS</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              COMPREHENSIVE COMPETENCY BLUEPRINTS, SALARY BRACKETS & CAREER PROGRESSION VECTORS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate?.('job-finder')}
              className="btn-primary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
            >
              LOCATE OPEN ROLES →
            </button>
          </div>
        </div>
      </section>

      {/* Role Selector Tabs */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-warm-ivory/60 uppercase">CLASSIFIED ROLES REGISTER</span>
          <span className="text-[10px] font-mono text-emerald-400">● 4 PROFILES ACTIVE</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {roles.map((roleName) => {
            const isSelected = selectedRoleKey === roleName
            const item = mockRoleDossiers[roleName]
            return (
              <button
                key={roleName}
                onClick={() => setSelectedRoleKey(roleName)}
                className={cn(
                  'p-3 rounded-lg text-left transition-all border font-mono',
                  isSelected
                    ? 'bg-gradient-crimson border-crimson text-warm-ivory shadow-glow-crimson font-bold'
                    : 'bg-burgundy/10 border-burgundy/25 text-warm-ivory/80 hover:bg-burgundy/20 hover:border-crimson/40'
                )}
              >
                <div className="flex items-center justify-between text-[11px] mb-1 opacity-70">
                  <span>{item.missionCode}</span>
                  <span className="text-emerald-400 font-bold">{item.growthRate}</span>
                </div>
                <p className="text-xs md:text-sm font-semibold truncate">{roleName}</p>
                <p className="text-[10px] opacity-60 mt-1">{formatNumber(item.activeOpenings)} listings</p>
              </button>
            )
          })}
        </div>
      </section>

      {/* Detailed Dossier Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Dossier Overview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="card border-burgundy/30 bg-charcoal/70">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="stamp-classified">CLASSIFIED DOSSIER</span>
                  <span className="text-xs font-mono text-crimson font-bold">{role.missionCode}</span>
                </div>
                <h2 className="heading-md text-warm-ivory mt-2">{role.name}</h2>
                <p className="text-xs font-mono text-warm-ivory/60">{role.category} • Demand Index: {role.demandIndex}/100</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-warm-ivory/50">MEDIAN BASE</span>
                <p className="text-2xl font-bold font-mono text-emerald-400">{role.medianSalary}</p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-warm-ivory/80 font-mono leading-relaxed mb-6 p-3.5 bg-burgundy/10 rounded-lg border border-burgundy/20">
              {role.description}
            </p>

            {/* Core Required Competencies */}
            <div className="space-y-4">
              <h3 className="heading-sm text-warm-ivory font-mono text-xs uppercase tracking-wider">
                CORE REQUIRED COMPETENCIES (MARKET MANDATE)
              </h3>
              <div className="space-y-3">
                {role.requiredSkills.map((skill) => (
                  <div key={skill.name} className="p-3 bg-burgundy/10 border border-burgundy/20 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="text-warm-ivory font-semibold">{skill.name}</span>
                      <span className="text-crimson font-bold">{skill.weight}% Market Weight</span>
                    </div>
                    <div className="w-full bg-burgundy/30 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{ width: `${skill.weight}%` }}
                        className="h-full bg-gradient-crimson rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred / Emerging Stacks */}
            <div className="mt-6 pt-4 border-t border-burgundy/20">
              <h4 className="text-xs font-mono text-warm-ivory/70 uppercase mb-3">PREFERRED & DIFFERENTIATING TECH</h4>
              <div className="flex flex-wrap gap-2">
                {role.preferredSkills.map((pref) => (
                  <span
                    key={pref.name}
                    className="px-3 py-1 bg-burgundy/20 border border-burgundy/40 rounded text-xs font-mono text-warm-ivory/90 flex items-center gap-1.5"
                  >
                    {pref.name} ({pref.weight}%)
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Experience Tiers Table */}
          <div className="card">
            <h3 className="heading-sm text-warm-ivory mb-4 font-mono text-sm">EXPERIENCE & COMPENSATION BRACKETS</h3>
            <div className="space-y-2.5">
              {role.experienceBands.map((band) => (
                <div
                  key={band.level}
                  className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-warm-ivory">{band.level}</span>
                    <span className="text-warm-ivory/50 ml-2">({band.experience})</span>
                  </div>
                  <div className="text-emerald-400 font-bold sm:text-right">
                    {band.salary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Transitions & Outlook */}
        <div className="lg:col-span-4 space-y-6">
          {/* Career Transition Pathways */}
          <div className="card bg-charcoal/80 border-burgundy/30">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="heading-sm text-warm-ivory font-mono text-sm">NATURAL CAREER VECTORS</h3>
            </div>
            <p className="text-[11px] font-mono text-warm-ivory/60 mb-4">
              COMMON PROMOTIONAL & PIVOT TRAJECTORIES BASED ON SKILL OVERLAP
            </p>
            <div className="space-y-3">
              {role.careerTransitions.map((trans) => (
                <div key={trans.nextRole} className="p-3 bg-burgundy/15 border border-burgundy/25 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-warm-ivory">{trans.nextRole}</span>
                    <span className="text-emerald-400 font-bold">{trans.feasibility}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-warm-ivory/60">
                    <span>Transition Window</span>
                    <span>{trans.typicalTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Year Industry Outlook */}
          <div className="card bg-emerald-400/5 border-emerald-400/30">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="heading-sm text-emerald-400 font-mono text-sm">5-YEAR MACRO OUTLOOK</h3>
            </div>
            <p className="text-xs font-mono text-warm-ivory/80 leading-relaxed mb-4">
              {role.fiveYearOutlook}
            </p>
            <div className="pt-3 border-t border-emerald-400/20 flex items-center justify-between text-[11px] font-mono text-warm-ivory/60">
              <span>Risk of Obsolescence</span>
              <span className="text-emerald-400 font-bold">LOW (12%)</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card bg-gradient-obsidian border-crimson/30 space-y-3">
            <h4 className="text-xs font-mono text-crimson font-bold uppercase tracking-wider">TACTICAL DIRECTIVES</h4>
            <button
              onClick={() => onNavigate?.('skill-heist')}
              className="w-full btn-secondary text-xs font-mono py-2.5 flex items-center justify-center gap-2"
            >
              RUN SKILL GAP AUDIT →
            </button>
            <button
              onClick={() => onNavigate?.('simulation')}
              className="w-full btn-secondary text-xs font-mono py-2.5 flex items-center justify-center gap-2"
            >
              SIMULATE THIS ROLE IN VAULT
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
