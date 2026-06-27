import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, RefreshCw, ChevronRight, Star, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import { interviewAPI } from '../services/api';
import { getScoreColor, getGradeColor } from '../utils/helpers';
import CircularProgress from '../components/CircularProgress';

const ROLES = ['Software Engineer', 'Data Scientist', 'Product Manager', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'ML Engineer', 'Data Analyst', 'Business Analyst', 'UI/UX Designer', 'Project Manager'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function InterviewCoach() {
  const [step, setStep] = useState('setup');
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const recognitionRef = useRef(null);

  const selectedRole = role === 'custom' ? customRole : role;

  const handleGenerateQuestions = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const res = await interviewAPI.generateQuestions({ role: selectedRole, difficulty, count: 5 });
      setQuestions(res.data.questions || []);
      setCurrentQIndex(0);
      setStep('interview');
      setAnswer('');
      setEvaluation(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !questions[currentQIndex]) return;
    setLoading(true);
    try {
      const res = await interviewAPI.evaluate({
        role: selectedRole,
        question: questions[currentQIndex].question,
        answer,
      });
      setEvaluation(res.data);
      setStep('result');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(i => i + 1);
      setAnswer('');
      setEvaluation(null);
      setShowHints(false);
      setStep('interview');
    } else {
      setStep('setup');
      setQuestions([]);
    }
  };

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
        setAnswer(transcript);
      };
      recognition.onend = () => setIsRecording(false);
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Interview Coach</h1>
        <p className="text-white/50 text-sm">AI-powered mock interviews with instant feedback</p>
      </div>

      {/* Setup */}
      {step === 'setup' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Configure Your Session</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-3">Select Role</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                        role === r ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'border-white/5 text-white/50 hover:border-white/15 hover:text-white/80'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                  <button
                    onClick={() => setRole('custom')}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${role === 'custom' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'border-white/5 text-white/50 hover:border-white/15 hover:text-white/80'}`}
                  >
                    Custom...
                  </button>
                </div>
                {role === 'custom' && (
                  <input
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                    placeholder="Enter your target role"
                    className="mt-3 w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-3">Difficulty</label>
                <div className="flex gap-3">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                        difficulty === d
                          ? d === 'easy' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : d === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'border-white/5 text-white/50 hover:border-white/15'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateQuestions}
              disabled={!selectedRole || loading}
              className="mt-6 w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
            >
              {loading ? <motion.div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : <><Mic size={14} /> Generate Questions</>}
            </button>
          </div>
        </motion.div>
      )}

      {/* Interview */}
      {step === 'interview' && currentQ && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {/* Progress */}
          <div className="flex items-center gap-3">
            {questions.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < currentQIndex ? 'bg-cyan-500' : i === currentQIndex ? 'bg-cyan-500/50' : 'bg-white/10'}`} />
            ))}
            <span className="text-xs text-white/40 flex-shrink-0">{currentQIndex + 1}/{questions.length}</span>
          </div>

          <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    currentQ.type === 'technical' ? 'bg-blue-500/15 text-blue-400' :
                    currentQ.type === 'behavioral' ? 'bg-purple-500/15 text-purple-400' : 'bg-amber-500/15 text-amber-400'
                  }`}>{currentQ.type}</span>
                  <span className="text-xs text-white/30">{currentQ.category}</span>
                </div>
                <h3 className="text-white font-semibold leading-relaxed">{currentQ.question}</h3>
              </div>
            </div>

            {/* Hints */}
            {currentQ.hints?.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Lightbulb size={12} />
                  {showHints ? 'Hide hints' : 'Show hints'}
                </button>
                <AnimatePresence>
                  {showHints && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 overflow-hidden">
                      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 space-y-1">
                        {currentQ.hints.map((h, i) => <p key={i} className="text-xs text-amber-300/80">• {h}</p>)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="relative">
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here or use voice input..."
                rows={6}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-cyan-500/50 transition-all"
              />
              <button
                onClick={toggleRecording}
                className={`absolute right-3 bottom-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white' : 'bg-white/10 text-white/50 hover:text-white'}`}
              >
                {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            </div>
            {isRecording && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <motion.div className="w-1.5 h-1.5 bg-red-500 rounded-full" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                Recording...
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep('setup')} className="flex-1 border border-white/10 hover:border-white/20 text-white/60 hover:text-white py-2.5 rounded-xl text-sm transition-all">
                Cancel
              </button>
              <button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || loading}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
              >
                {loading ? <motion.div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : <><Send size={14} /> Submit</>}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Result */}
      {step === 'result' && evaluation && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {/* Score Card */}
          <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-6 mb-6">
              <CircularProgress score={evaluation.score} size={100} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black" style={{ color: getGradeColor(evaluation.grade) }}>Grade: {evaluation.grade}</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{evaluation.feedback}</p>
              </div>
            </div>

            {/* Sub Scores */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Communication', score: evaluation.communication_score },
                { label: 'Technical', score: evaluation.technical_accuracy },
                { label: 'Structure', score: evaluation.structure_score },
              ].map(({ label, score }) => (
                <div key={label} className="bg-white/3 rounded-xl p-3 text-center">
                  <p className="text-lg font-black" style={{ color: getScoreColor(score) }}>{score}%</p>
                  <p className="text-xs text-white/40">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {evaluation.strengths?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Strengths</h4>
                  <div className="space-y-1">
                    {evaluation.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                        <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" /> {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {evaluation.improvements?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Improve</h4>
                  <div className="space-y-1">
                    {evaluation.improvements.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                        <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" /> {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ideal Answer */}
          {evaluation.ideal_answer && (
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-5">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">Ideal Answer</h4>
              <p className="text-sm text-white/70 leading-relaxed">{evaluation.ideal_answer}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep('setup')} className="flex-1 border border-white/10 hover:border-white/20 text-white/60 hover:text-white py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              <RefreshCw size={14} /> New Session
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {currentQIndex < questions.length - 1 ? 'Next Question' : 'Finish'} <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
