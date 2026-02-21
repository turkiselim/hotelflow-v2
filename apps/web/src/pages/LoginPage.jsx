// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants incorrects');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--dark)' }}>
      {/* Decorative BG */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 20% 50%, rgba(212,160,23,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(44,95,138,0.08) 0%, transparent 60%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, padding:20, position:'relative' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#d4a017,#b8860b)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:26, marginBottom:12 }}>🏨</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, color:'#fff', fontWeight:600, marginBottom:4 }}>HôtelFlow</h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', letterSpacing:'1px', textTransform:'uppercase' }}>Grand Hôtel Méditerranée</p>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:18, padding:32, backdropFilter:'blur(12px)' }}>
          <h2 style={{ fontSize:18, color:'#fff', fontWeight:600, marginBottom:6 }}>Connexion</h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:24 }}>Accédez à votre espace de travail</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color:'rgba(255,255,255,0.4)', marginBottom:6 }}>Email</label>
              <input type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="vous@hotel.com" style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(255,255,255,0.12)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', fontFamily:'inherit', transition:'border-color 0.15s' }}
                onFocus={e=>e.target.style.borderColor='var(--gold-bright)'}
                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.12)'} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color:'rgba(255,255,255,0.4)', marginBottom:6 }}>Mot de passe</label>
              <input type="password" required value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(255,255,255,0.12)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', fontFamily:'inherit', transition:'border-color 0.15s' }}
                onFocus={e=>e.target.style.borderColor='var(--gold-bright)'}
                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.12)'} />
            </div>

            {/* Demo hint */}
            <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(212,160,23,0.1)', border:'1px solid rgba(212,160,23,0.2)', marginBottom:16, fontSize:12, color:'rgba(212,160,23,0.9)' }}>
              💡 Démo : <strong>alex@teamflow.dev</strong> · <strong>password123</strong>
            </div>

            {error && (
              <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(192,57,43,0.15)', border:'1px solid rgba(192,57,43,0.3)', marginBottom:14, fontSize:13, color:'#ff7b6b' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width:'100%', padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#d4a017,#b8860b)', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:14, border:'none', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, transition:'all 0.15s' }}>
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'rgba(255,255,255,0.35)' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color:'var(--gold-bright)', fontWeight:600, textDecoration:'none' }}>S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
