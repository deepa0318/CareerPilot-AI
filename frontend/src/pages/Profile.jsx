import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, User, MapPin, Briefcase, Clock, Mail } from 'lucide-react';
import { profileAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '', email: '', bio: '', location: '', target_role: '', experience_years: 0
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    profileAPI.get().then(res => {
      setProfile(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.update({
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        target_role: profile.target_role,
        experience_years: Number(profile.experience_years),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await profileAPI.uploadPhoto(formData);
      setProfile(prev => ({ ...prev, profile_photo: res.data.photo_url }));
    } catch {}
  };

  const fields = [
    { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Your full name' },
    { key: 'location', label: 'Location', icon: MapPin, type: 'text', placeholder: 'City, Country' },
    { key: 'target_role', label: 'Target Role', icon: Briefcase, type: 'text', placeholder: 'e.g. Senior Data Scientist' },
    { key: 'experience_years', label: 'Years of Experience', icon: Clock, type: 'number', placeholder: '0' },
  ];

  if (loading) return <div className="p-6 flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Profile</h1>
        <p className="text-white/50 text-sm">Manage your personal information</p>
      </div>

      <div className="bg-[#080f1e] border border-white/5 rounded-2xl p-6 space-y-6">
        {/* Photo */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-black text-white overflow-hidden">
              {profile.profile_photo ? (
                <img src={`http://localhost:8000${profile.profile_photo}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-cyan-500 hover:bg-cyan-400 rounded-lg flex items-center justify-center text-black transition-all"
            >
              <Camera size={12} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">{profile.name || 'Your Name'}</h2>
            <div className="flex items-center gap-1.5 text-white/50 text-sm mt-0.5">
              <Mail size={12} />
              {profile.email}
            </div>
            {profile.target_role && <div className="flex items-center gap-1.5 text-cyan-400 text-xs mt-1"><Briefcase size={10} />{profile.target_role}</div>}
          </div>
        </div>

        {/* Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                <Icon size={10} /> {label}
              </label>
              <input
                type={type}
                value={profile[key] || ''}
                onChange={e => setProfile(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          ))}
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">Bio</label>
          <textarea
            value={profile.bio || ''}
            onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            saved ? 'bg-emerald-500 text-white' : 'bg-cyan-500 hover:bg-cyan-400 text-black'
          } disabled:opacity-50`}
        >
          {saving ? (
            <motion.div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
          ) : (
            <><Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}</>
          )}
        </button>
      </div>
    </div>
  );
}