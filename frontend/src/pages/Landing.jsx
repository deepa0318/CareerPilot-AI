import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, FileText, Mic, TrendingUp, MessageSquare, Star,
  ArrowRight, CheckCircle, Shield, Users, Award, ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: FileText, title: 'Resume Analyzer', color: 'from-cyan-500 to-blue-600',
    desc: 'AI-powered ATS scoring, keyword analysis, and actionable improvements to make your resume stand out.'
  },
  {
    icon: Mic, title: 'Interview Coach', color: 'from-purple-500 to-pink-600',
    desc: 'Practice with real interview questions, get AI feedback, and receive ideal answer examples instantly.'
  },
  {
    icon: TrendingUp, title: 'Skill Gap Analyzer', color: 'from-amber-500 to-orange-600',
    desc: 'Identify missing skills for your target role and get a personalized weekly learning roadmap.'
  },
  {
    icon: MessageSquare, title: 'Career Chatbot', color: 'from-emerald-500 to-teal-600',
    desc: 'Your 24/7 AI career advisor for resume tips, salary negotiation, and job search strategies.'
  },
];

const stats = [
  { value: '50K+', label: 'Users Helped' },
  { value: '94%', label: 'Interview Success' },
  { value: '3.2x', label: 'Faster Job Search' },
  { value: '4.9★', label: 'User Rating' },
];

const testimonials = [
  {
    name: 'Sarah Chen', role: 'Software Engineer @ Google',
    text: 'CareerPilot AI helped me land my dream job at Google. The resume analyzer boosted my ATS score from 42 to 91!',
    avatar: 'SC'
  },
  {
    name: 'Rahul Sharma', role: 'Data Scientist @ Microsoft',
    text: 'The interview coach is incredible. I practiced 50+ questions and walked into my interview with total confidence.',
    avatar: 'RS'
  },
  {
    name: 'Emily Johnson', role: 'Product Manager @ Meta',
    text: 'The skill gap analyzer gave me a precise 12-week roadmap. I followed it and got promoted within 3 months.',
    avatar: 'EJ'
  },
];

const pricing = [
  {
    name: 'Starter', price: 'Free', period: '',
    features: ['5 Resume Analyses/month', '10 Interview Questions', 'Basic Chatbot', 'Skill Gap Overview'],
    cta: 'Get Started', highlighted: false
  },
  {
    name: 'Pro', price: '$19', period: '/month',
    features: ['Unlimited Analyses', 'Unlimited Interviews', 'Voice Answers', 'Full Roadmap', 'Priority AI', 'ATS Optimizer'],
    cta: 'Start Free Trial', highlighted: true
  },
  {
    name: 'Team', price: '$49', period: '/month',
    features: ['Everything in Pro', '5 Team Seats', 'Analytics Dashboard', 'Custom AI Training', 'Dedicated Support'],
    cta: 'Contact Sales', highlighted: false
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">
              Career<span className="text-cyan-400">Pilot</span> AI
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing', 'Testimonials', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-white/60 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors px-4 py-1.5">
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
          <div className="absolute top-60 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
          {/* Grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" />
              Powered by Google Gemini AI
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
              Land Your{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                  Dream Job
                </span>
              </span>
              <br />With AI Precision
            </h1>

            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              CareerPilot AI analyzes your resume, coaches you for interviews, identifies skill gaps, and guides your career — all powered by cutting-edge Gemini AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3.5 rounded-xl transition-all duration-200 text-sm"
              >
                Start for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-white/80 hover:text-white px-8 py-3.5 rounded-xl transition-all text-sm"
              >
                View Demo
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-12 border-t border-white/5"
          >
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-cyan-400 mb-1">{value}</div>
                <div className="text-sm text-white/50">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Everything You Need to <span className="text-cyan-400">Succeed</span></h2>
            <p className="text-white/50 max-w-xl mx-auto">Four powerful AI tools, one unified platform for career acceleration.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, color, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-white/2">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Loved by <span className="text-cyan-400">Job Seekers</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, avatar }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-[#080f1e] border border-white/5"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-white/40">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Simple <span className="text-cyan-400">Pricing</span></h2>
            <p className="text-white/50">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map(({ name, price, period, features, cta, highlighted }) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`p-6 rounded-2xl border flex flex-col ${
                  highlighted
                    ? 'bg-cyan-500/10 border-cyan-500/30 relative'
                    : 'bg-white/3 border-white/5'
                }`}
              >
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2">{name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{price}</span>
                    <span className="text-white/50 text-sm">{period}</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`text-center py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    highlighted
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black'
                      : 'border border-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  {cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Launch Your Career?</h2>
            <p className="text-white/60 mb-8">Join 50,000+ professionals who used CareerPilot AI to land their dream jobs.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3.5 rounded-xl transition-all"
            >
              Start Free Today <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-sm">CareerPilot AI</span>
          </div>
          <p className="text-white/30 text-sm">© 2024 CareerPilot AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map(item => (
              <a key={item} href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}