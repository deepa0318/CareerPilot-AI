import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Bell, Key, Globe, Save, LogOut, AlertTriangle } from 'lucide-react';
import { profileAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    theme: 'dark',
    email_notifications: true,
    push_notifications: false,
    gemini_api_key: '',
    language: 'en',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    profileAPI.getSettings().then(res => {
      setSettings(prev => ({ ...prev, ...res.data }));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    finally { setSaving(false); }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Toggle = ({ checked, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-white/40 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-all duration-300 flex-shrink-0 ${checked ? 'bg-cyan-500' : 'bg-white/10'}`}
        style={{ height: '22px', width: '40px' }}
      >
        <motion.div
          animate={{ x: checked ? 18 : 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
        />
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Settings</h1>
        <p className="text-white/50 text-sm">Customize your CareerPilot experience</p>
      </div>

      <div className="space-y-4">
        {/* Notifications */}
        <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-cyan-400" />
            <h2 className="font-bold text-sm">Notifications</h2>
          </div>
          <div className="divide-y divide-white/5">
            <Toggle
              checked={settings.email_notifications}
              onChange={val => setSettings(p => ({ ...p, email_notifications: val }))}
              label="Email Notifications"
              desc="Receive career tips and updates via email"
            />
            <Toggle
              checked={settings.push_notifications}
              onChange={val => setSettings(p => ({ ...p, push_notifications: val }))}
              label="Push Notifications"
              desc="Browser push notifications"
            />
          </div>
        </div>

        {/* AI Configuration */}
        <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key size={16} className="text-cyan-400" />
            <h2 className="font-bold text-sm">AI Configuration</h2>
          </div>
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">Custom Gemini API Key (Optional)</label>
            <input
              type="password"
              value={settings.gemini_api_key || ''}
              onChange={e => setSettings(p => ({ ...p, gemini_api_key: e.target.value }))}
              placeholder="Enter your Gemini API key for higher limits"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
            />
            <p className="text-xs text-white/30 mt-2">Using your own key increases rate limits. Get one at <span className="text-cyan-400">aistudio.google.com</span></p>
          </div>
        </div>

        {/* Language */}
        <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-cyan-400" />
            <h2 className="font-bold text-sm">Language</h2>
          </div>
          <select
            value={settings.language}
            onChange={e => setSettings(p => ({ ...p, language: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
            saved ? 'bg-emerald-500 text-white' : 'bg-cyan-500 hover:bg-cyan-400 text-black'
          } disabled:opacity-50`}
        >
          {saving ? <motion.div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : <><Save size={14} /> {saved ? 'Saved!' : 'Save Settings'}</>}
        </button>

        {/* Logout */}
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-400" />
            <h2 className="font-bold text-sm text-red-400">Danger Zone</h2>
          </div>
          <p className="text-xs text-white/40 mb-4">This will end your session and redirect you to the homepage.</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-red-500/30 hover:bg-red-500/10 text-red-400 font-semibold px-4 py-2 rounded-xl text-sm transition-all"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}