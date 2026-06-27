import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Zap, TrendingUp, Calendar, BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { skillsAPI } from '../services/api';
import CircularProgress from '../components/CircularProgress';
import { getPriorityColor } from '../utils/helpers';

export default function SkillGap() {
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [gapResult, setGapResult] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [activeTab, setActiveTab] = useState('gap');

  const addSkill = () => {
    if (skillInput.trim() && !currentSkills.includes(skillInput.trim())) {
      setCurrentSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setCurrentSkills(prev => prev.filter(s => s !== skill));

  const handleAnalyze = async () => {
    if (!targetRole) return;
    setLoading(true);
    try {
      const res = await skillsAPI.gapAnalysis({ target_role: targetRole, current_skills: currentSkills });
      setGapResult(res.data);
      setActiveTab('gap');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoadmap = async () => {
    if (!gapResult) return;
    setRoadmapLoading(true);
    try {
      const missingSkills = gapResult.missing_skills?.map(s => s.skill) || [];
      const res = await skillsAPI.generateRoadmap({ target_role: targetRole, missing_skills: missingSkills, timeline_weeks: 12 });
      setRoadmap(res.data);
      setActiveTab('roadmap');
    } catch (err) {
      console.error(err);
    } finally {
      setRoadmapLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Skill Gap Analyzer</h1>
        <p className="text-white/50 text-sm">Identify missing skills and get your personalized learning roadmap</p>
      </div>

      {/* Input Panel */}
      <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">Target Role</label>
            <input
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Data Scientist"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">Your Current Skills</label>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill()}
                placeholder="Add a skill..."
                className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              />
              <button onClick={addSkill} className="w-9 h-9 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 transition-all flex-shrink-0">
                <Plus size={14} />
              </button>
            </div>
            {currentSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {currentSkills.map(skill => (
                  <span key={skill} className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/70 text-xs px-2.5 py-1 rounded-lg">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-white/30 hover:text-red-400 transition-colors"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleAnalyze}
            disabled={!targetRole || loading}
            className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
          >
            {loading ? <motion.div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : <><Zap size={14} /> Analyze Gap</>}
          </button>
          {gapResult && (
            <button
              onClick={handleRoadmap}
              disabled={roadmapLoading}
              className="flex-1 border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-40"
            >
              {roadmapLoading ? <motion.div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : <><Calendar size={14} /> Generate Roadmap</>}
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {(gapResult || roadmap) && (
        <div>
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 w-fit">
            {[{ key: 'gap', label: 'Skill Gap' }, { key: 'roadmap', label: 'Roadmap' }].filter(t => t.key === 'gap' || roadmap).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-[#080f1e] text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Gap Tab */}
          {activeTab === 'gap' && gapResult && (
            <div className="space-y-6">
              {/* Readiness */}
              <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-6 flex items-center gap-6">
                <CircularProgress score={gapResult.readiness_score} size={110} label="Readiness" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Role Readiness for <span className="text-cyan-400">{gapResult.target_role}</span></h3>
                  <p className="text-sm text-white/60 mb-3">{gapResult.summary}</p>
                  {gapResult.quick_wins?.length > 0 && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Quick Wins (learnable this week)</p>
                      <div className="flex flex-wrap gap-2">
                        {gapResult.quick_wins.map((qw, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">{qw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              {gapResult.missing_skills?.length > 0 && (
                <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-5">
                  <h3 className="font-bold mb-4">Missing Skills</h3>
                  <div className="space-y-3">
                    {gapResult.missing_skills.map((skill, i) => (
                      <div key={i} className="flex items-start justify-between p-3 bg-white/3 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-white">{skill.skill}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded font-bold uppercase" style={{ color: getPriorityColor(skill.priority), backgroundColor: getPriorityColor(skill.priority) + '15' }}>
                              {skill.priority}
                            </span>
                          </div>
                          <p className="text-xs text-white/50">{skill.reason}</p>
                        </div>
                        <span className="text-xs text-white/40 ml-3 flex-shrink-0">{skill.time_to_learn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Strengths */}
              {gapResult.existing_strengths?.length > 0 && (
                <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-5">
                  <h3 className="font-bold mb-3">Your Existing Strengths</h3>
                  <div className="flex flex-wrap gap-2">
                    {gapResult.existing_strengths.map((s, i) => (
                      <span key={i} className="text-sm px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Roadmap Tab */}
          {activeTab === 'roadmap' && roadmap && (
            <div className="space-y-6">
              <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-5">
                <h3 className="font-bold text-lg mb-1">{roadmap.title}</h3>
                <p className="text-sm text-white/60 mb-2">{roadmap.overview}</p>
                {roadmap.estimated_job_ready && (
                  <span className="text-xs px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                    🎯 Job Ready: {roadmap.estimated_job_ready}
                  </span>
                )}
              </div>

              {/* Monthly Milestones */}
              {roadmap.monthly_milestones?.length > 0 && (
                <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-5">
                  <h3 className="font-bold mb-4">Monthly Milestones</h3>
                  <div className="space-y-3">
                    {roadmap.monthly_milestones.map((m, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0 text-cyan-400 font-black text-sm">M{m.month}</div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{m.milestone}</p>
                          {m.skills_covered?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {m.skills_covered.map((s, j) => <span key={j} className="text-xs px-1.5 py-0.5 bg-white/5 text-white/50 rounded">{s}</span>)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weekly Plan */}
              {roadmap.weekly_plan?.length > 0 && (
                <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-5">
                  <h3 className="font-bold mb-4">Weekly Plan</h3>
                  <div className="space-y-2">
                    {roadmap.weekly_plan.map((week, i) => (
                      <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedWeek(expandedWeek === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-white/3 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">W{week.week}</span>
                            <div>
                              <p className="text-sm font-semibold text-white">{week.theme}</p>
                              <p className="text-xs text-white/40">{week.milestone}</p>
                            </div>
                          </div>
                          {expandedWeek === i ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
                        </button>
                        <AnimatePresence>
                          {expandedWeek === i && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/5">
                              <div className="p-4 space-y-4">
                                {week.goals?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-white/40 mb-2">Goals</p>
                                    {week.goals.map((g, j) => <p key={j} className="text-xs text-white/70 flex items-start gap-2"><span className="text-cyan-400">•</span>{g}</p>)}
                                  </div>
                                )}
                                {week.tasks?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-white/40 mb-2">Tasks</p>
                                    {week.tasks.map((t, j) => <p key={j} className="text-xs text-white/70 flex items-start gap-2"><span className="text-purple-400">→</span>{t}</p>)}
                                  </div>
                                )}
                                {week.resources?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-white/40 mb-2">Resources</p>
                                    <div className="space-y-1">
                                      {week.resources.map((r, j) => (
                                        <div key={j} className="flex items-center gap-2">
                                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${r.free ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                            {r.free ? 'Free' : 'Paid'}
                                          </span>
                                          <span className="text-xs text-white/70">{r.name}</span>
                                          {r.url && <ExternalLink size={10} className="text-white/30" />}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}