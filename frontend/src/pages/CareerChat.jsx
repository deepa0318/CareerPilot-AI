import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Trash2, MessageSquare, Bot, User } from 'lucide-react';
import { chatAPI } from '../services/api';
import { TypingDots } from '../components/Loader';
import { formatTime } from '../utils/helpers';
import ReactMarkdown from 'react-markdown';

export default function CareerChat() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const loadSessions = async () => {
    try {
      const res = await chatAPI.getSessions();
      setSessions(res.data);
    } catch {}
  };

  const loadSession = async (sessionId) => {
    setCurrentSession(sessionId);
    try {
      const res = await chatAPI.getHistory(sessionId);
      setMessages(res.data);
    } catch {}
  };

  const handleNewChat = () => {
    setCurrentSession(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', message: input, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setTyping(true);
    setLoading(true);

    try {
      const res = await chatAPI.send({ message: currentInput, session_id: currentSession });
      const { response, session_id } = res.data;

      if (!currentSession) {
        setCurrentSession(session_id);
        loadSessions();
      }

      setMessages(prev => [...prev, { role: 'assistant', message: response, created_at: new Date().toISOString() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', message: 'Sorry, something went wrong. Please try again.', created_at: new Date().toISOString() }]);
    } finally {
      setTyping(false);
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    await chatAPI.deleteSession(sessionId);
    if (currentSession === sessionId) handleNewChat();
    loadSessions();
  };

  const SUGGESTIONS = [
    'How do I negotiate a higher salary?',
    'What skills do I need for a Product Manager role?',
    'How should I explain a career gap?',
    'Tips for remote job applications?',
  ];

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-white/5 bg-[#080f1e] flex flex-col hidden md:flex">
        <div className="p-3 border-b border-white/5">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-sm font-semibold px-3 py-2.5 rounded-xl transition-all"
          >
            <Plus size={14} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 && (
            <p className="text-xs text-white/20 text-center mt-6 px-2">No sessions yet. Start chatting!</p>
          )}
          {sessions.map(session => (
            <div
              key={session.session_id}
              onClick={() => loadSession(session.session_id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer group transition-all ${
                currentSession === session.session_id ? 'bg-white/8 border border-white/10' : 'hover:bg-white/4'
              }`}
            >
              <MessageSquare size={12} className="text-white/30 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70 truncate">Session</p>
                <p className="text-xs text-white/30">{session.message_count} msgs</p>
              </div>
              <button
                onClick={(e) => handleDeleteSession(session.session_id, e)}
                className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all flex-shrink-0"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !typing && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">CareerPilot AI Chat</h2>
              <p className="text-white/40 text-sm text-center mb-8 max-w-sm">Your personal AI career advisor. Ask me anything about your career journey.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="text-left text-sm text-white/60 hover:text-white/90 bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 px-4 py-2.5 rounded-xl transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                }`}>
                  {msg.role === 'user' ? <User size={12} className="text-white" /> : <Bot size={12} className="text-white" />}
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/10 border border-cyan-500/20 text-white rounded-tr-sm'
                      : 'bg-white/5 border border-white/5 text-white/85 rounded-tl-sm'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{msg.message}</ReactMarkdown>
                      </div>
                    ) : msg.message}
                  </div>
                  <span className="text-xs text-white/25">{formatTime(msg.created_at)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot size={12} className="text-white" />
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm">
                <TypingDots />
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 bg-[#080f1e]/50">
          <div className="flex items-end gap-3 max-w-3xl mx-auto">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-cyan-500/50 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask me anything about your career..."
                rows={1}
                className="w-full bg-transparent text-white placeholder-white/30 px-4 py-3 text-sm resize-none focus:outline-none max-h-32"
                style={{ minHeight: '44px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 rounded-xl flex items-center justify-center text-black transition-all flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-white/20 text-center mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}