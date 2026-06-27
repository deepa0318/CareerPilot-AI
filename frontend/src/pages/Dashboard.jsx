import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Mic, TrendingUp, MessageSquare, ArrowRight, Target, Clock, Award, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { resumeAPI, interviewAPI } from '../services/api';
import { formatDate, getScoreColor } from '../utils/helpers';

const quickActions = [
  { path: '/dashboard/resume', icon: FileText, label: 'Analyze Resume', color: 'from-cyan-500 to-blue-600', desc: 'Upload & get ATS score' },
  { path: '/dashboard/interview', icon: Mic, label: 'Practice Interview', color: 'from-purple-500 to-pink-600', desc: 'AI-powered mock interview' },
  { path: '/dashboard/skills', icon: TrendingUp, label: 'Skill Gap', color: 'from-amber-500 to-orange-500', desc: 'Find missing skills' },
  { path: '/dashboard/chat', icon: MessageSquare, label: 'Career Chat', color: 'from-emerald-500 to-teal-500', desc: 'Ask anything' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [interviewStats, setInterviewStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      resumeAPI.list(),
      interviewAPI.getStats()
    ]).then(([resumeRes, statsRes]) => {
      setResumes(resumeRes.data || []);
      setInterviewStats(statsRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const topResume = resumes[0];
  const avgScore = interviewStats?.average_score || 0;

  const stats = [
    { label: 'Resumes Analyzed', value: resumes.length, icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'ATS Score', value: topResume ? `${Math.round(topResume.ats_score || 0)}%` : 'N/A', icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Interviews Done', value: interviewStats?.total || 0, icon: Mic, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Avg Interview Score', value: avgScore ? `${avgScore}%` : 'N/A', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">👋</span>
          <h1 className="text-2xl font-black text-white">
            {greeting()}, <span className="text-cyan-400">{user?.name?.split(' ')[0]}</span>
          </h1>
        </div>
        <p className="text-white/50 text-sm ml-9">Your AI-powered career command center</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#080f1e] border border-white/5 rounded-2xl p-4"
          >
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-black text-white">{loading ? '—' : value}</p>
            <p className="text-xs text-white/40 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(({ path, icon: Icon, label, color, desc }, i) => (
            <motion.div key={path} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to={path}
                className="flex flex-col p-5 bg-[#080f1e] border border-white/5 hover:border-white/10 rounded-2xl group transition-all duration-200 h-full"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold text-white mb-1">{label}</p>
                <p className="text-xs text-white/40 flex-1">{desc}</p>
                <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 mt-2 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Resumes */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-[#080f1e] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Recent Resumes</h3>
            <Link to="/dashboard/resume" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-white/30 text-sm">No resumes uploaded yet</p>
              <Link to="/dashboard/resume" className="text-cyan-400 text-xs mt-2 inline-block hover:text-cyan-300">Upload your first resume →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.slice(0, 4).map(resume => (
                <div key={resume.id} className="flex items-center justify-between p-3 bg-white/3 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate max-w-[150px]">{resume.filename}</p>
                      <p className="text-xs text-white/40">{formatDate(resume.created_at)}</p>
                    </div>
                  </div>
                  {resume.ats_score && (
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 flex-shrink-0">
                      {Math.round(resume.ats_score)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Interview History */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-[#080f1e] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Interview Stats</h3>
            <Link to="/dashboard/interview" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              Practice <ArrowRight size={12} />
            </Link>
          </div>
          {interviewStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Sessions', value: interviewStats.total },
                  { label: 'Avg Score', value: `${interviewStats.average_score}%` },
                  { label: 'Best', value: `${Math.round(interviewStats.best_score || 0)}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 bg-white/3 rounded-xl">
                    <p className="text-lg font-black text-white">{value}</p>
                    <p className="text-xs text-white/40">{label}</p>
                  </div>
                ))}
              </div>
              {interviewStats.roles?.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 mb-2">Practiced Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {interviewStats.roles.slice(0, 4).map(role => (
                      <span key={role} className="text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded-lg">{role}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mic className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-white/30 text-sm">No interviews yet</p>
              <Link to="/dashboard/interview" className="text-purple-400 text-xs mt-2 inline-block hover:text-purple-300">Start practicing →</Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}