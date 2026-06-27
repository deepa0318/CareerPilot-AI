import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2, Zap, CheckCircle, AlertCircle, TrendingUp, X } from 'lucide-react';
import { resumeAPI } from '../services/api';
import CircularProgress from '../components/CircularProgress';
import { getScoreColor, getPriorityColor } from '../utils/helpers';

export default function ResumeAnalyzer() {
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [atsResult, setAtsResult] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState('analysis');
  const [error, setError] = useState('');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const res = await resumeAPI.list();
      setResumes(res.data);
    } catch {}
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await resumeAPI.upload(formData);
      await loadResumes();
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleAnalyze = async () => {
    if (!selectedResume) return;
    setAnalyzing(true);
    setError('');
    try {
      const res = await resumeAPI.analyze(selectedResume.id);
      setAnalysis(res.data.analysis);
      setActiveTab('analysis');
      loadResumes();
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleATS = async () => {
    if (!selectedResume) return;
    setAnalyzing(true);
    setError('');
    try {
      const res = await resumeAPI.ats(selectedResume.id, jobDescription);
      setAtsResult(res.data.ats_result);
      setActiveTab('ats');
      loadResumes();
    } catch (err) {
      setError(err.response?.data?.detail || 'ATS analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await resumeAPI.delete(id);
      if (selectedResume?.id === id) { setSelectedResume(null); setAnalysis(null); setAtsResult(null); }
      loadResumes();
    } catch {}
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Resume Analyzer</h1>
        <p className="text-white/50 text-sm">AI-powered resume analysis with ATS scoring</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="space-y-4">
          {/* Upload */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
              isDragActive ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/10 hover:border-white/20 bg-white/2'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              {uploading ? (
                <motion.div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
              ) : (
                <Upload className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            <p className="text-sm font-semibold text-white">{uploading ? 'Uploading...' : isDragActive ? 'Drop your PDF here' : 'Upload Resume'}</p>
            <p className="text-xs text-white/40 mt-1">PDF only, max 10MB</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Resume List */}
          {resumes.length > 0 && (
            <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-4">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Your Resumes</p>
              <div className="space-y-2">
                {resumes.map(resume => (
                  <div
                    key={resume.id}
                    onClick={() => { setSelectedResume(resume); setAnalysis(null); setAtsResult(null); }}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedResume?.id === resume.id ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <FileText className={`w-4 h-4 flex-shrink-0 ${selectedResume?.id === resume.id ? 'text-cyan-400' : 'text-white/40'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{resume.filename}</p>
                      {resume.ats_score && <p className="text-xs text-white/40">Score: {Math.round(resume.ats_score)}%</p>}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(resume.id); }}
                      className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {selectedResume && (
            <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Analyze</p>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
              >
                {analyzing ? <motion.div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : <><Zap size={14} /> Analyze Resume</>}
              </button>

              <div>
                <textarea
                  placeholder="Paste job description for ATS analysis (optional)"
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:border-cyan-500/50 transition-all"
                />
                <button
                  onClick={handleATS}
                  disabled={analyzing}
                  className="w-full mt-2 border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
                >
                  {analyzing ? <motion.div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : <><TrendingUp size={14} /> ATS Check</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-2">
          {!selectedResume && !analysis && !atsResult && (
            <div className="h-full min-h-[400px] flex items-center justify-center bg-[#080f1e] border border-white/5 rounded-2xl">
              <div className="text-center">
                <FileText className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">Upload a resume to get started</p>
              </div>
            </div>
          )}

          {(analysis || atsResult) && (
            <div className="bg-[#080f1e] border border-white/5 rounded-2xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-white/5">
                {[
                  { key: 'analysis', label: 'Analysis', show: !!analysis },
                  { key: 'ats', label: 'ATS Report', show: !!atsResult },
                ].filter(t => t.show).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-3 text-sm font-semibold transition-all ${activeTab === tab.key ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-white/40 hover:text-white/70'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-y-auto max-h-[600px]">
                {/* Analysis Tab */}
                {activeTab === 'analysis' && analysis && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <CircularProgress score={analysis.overall_score} size={110} />
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-2">Overall Assessment</h3>
                        <p className="text-sm text-white/60 leading-relaxed">{analysis.summary}</p>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div>
                      <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Score Breakdown</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Formatting', score: analysis.formatting_score },
                          { label: 'Content', score: analysis.content_score },
                          { label: 'Experience', score: analysis.experience_score },
                          { label: 'Skills', score: analysis.skills_score },
                        ].map(({ label, score }) => (
                          <div key={label} className="bg-white/3 rounded-xl p-3">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-white/60">{label}</span>
                              <span className="text-xs font-bold" style={{ color: getScoreColor(score) }}>{score}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: getScoreColor(score) }}
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strengths */}
                    {analysis.strengths?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Strengths</h4>
                        <div className="space-y-2">
                          {analysis.strengths.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Improvements */}
                    {analysis.improvements?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Improvements</h4>
                        <div className="space-y-3">
                          {analysis.improvements.map((item, i) => (
                            <div key={i} className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
                              <p className="text-xs font-semibold text-amber-400 mb-1">{item.section}</p>
                              <p className="text-xs text-white/60 mb-1">Issue: {item.issue}</p>
                              <p className="text-xs text-white/80">Fix: {item.fix}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Recommendations */}
                    {analysis.top_recommendations?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Top Recommendations</h4>
                        <div className="space-y-2">
                          {analysis.top_recommendations.map((r, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <span className="w-5 h-5 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                              <span className="text-white/70">{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ATS Tab */}
                {activeTab === 'ats' && atsResult && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <CircularProgress score={atsResult.ats_score} size={110} label="ATS Score" />
                      <div className="flex-1 space-y-2">
                        {[
                          { label: 'Parse Score', score: atsResult.parse_score },
                          { label: 'Keyword Score', score: atsResult.keyword_score },
                          { label: 'Format Score', score: atsResult.format_score },
                        ].map(({ label, score }) => (
                          <div key={label}>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-white/60">{label}</span>
                              <span className="text-xs font-bold" style={{ color: getScoreColor(score) }}>{score}%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full">
                              <motion.div className="h-full rounded-full" style={{ backgroundColor: getScoreColor(score) }} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {atsResult.missing_keywords?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {atsResult.missing_keywords.map((kw, i) => (
                            <span key={i} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${atsResult.high_priority_missing?.includes(kw) ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-white/5 text-white/60'}`}>
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {atsResult.matched_keywords?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Matched Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {atsResult.matched_keywords.map((kw, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {atsResult.suggestions?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Suggestions</h4>
                        <div className="space-y-2">
                          {atsResult.suggestions.map((s, i) => (
                            <div key={i} className={`flex items-start gap-2 p-3 rounded-xl text-sm border ${
                              s.priority === 'high' ? 'bg-red-500/5 border-red-500/15' : s.priority === 'medium' ? 'bg-amber-500/5 border-amber-500/15' : 'bg-white/3 border-white/5'
                            }`}>
                              <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
                                s.priority === 'high' ? 'bg-red-500/20 text-red-400' : s.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/50'
                              }`}>{s.priority}</span>
                              <span className="text-white/70">{s.suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}