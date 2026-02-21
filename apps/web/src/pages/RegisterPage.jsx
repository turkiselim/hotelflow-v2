// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--dark)' }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 80% 50%, rgba(212,160,23,0.08) 0%, transparent 60%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, padding:20, position:'relative' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#d4a017,#b8860b)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:26, marginBottom:12 }}>🏨</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, color:'#fff', fontWeight:600, marginBottom:4 }}>HôtelFlow</h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', letterSpacing:'1px', textTransform:'uppercase' }}>Créer un compte</p>
        </div>

        <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:18, padding:32, backdropFilter:'blur(12px)' }}>
          <h2 style={{ fontSize:18, color:'#fff', fontWeight:600, marginBottom:24 }}>Inscription</h2>

          <form onSubmit={handleSubmit}>
            {[
              { key:'name',     label:'Prénom & Nom',  type:'text',     placeholder:'Alex Martin' },
              { key:'email',    label:'Email',         type:'email',    placeholder:'vous@hotel.com' },
              { key:'password', label:'Mot de passe',  type:'password', placeholder:'Minimum 6 caractères' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color:'rgba(255,255,255,0.4)', marginBottom:6 }}>{field.label}</label>
                <input type={field.type} required value={form[field.key]} onChange={e=>setForm(f=>({...f,[field.key]:e.target.value}))} placeholder={field.placeholder}
                  style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(255,255,255,0.12)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', fontFamily:'inherit' }}
                  onFocus={e=>e.target.style.borderColor='var(--gold-bright)'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.12)'} />
              </div>
            ))}

            {error && (
              <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(192,57,43,0.15)', border:'1px solid rgba(192,57,43,0.3)', marginBottom:14, fontSize:13, color:'#ff7b6b' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width:'100%', padding:'12px', marginTop:4, borderRadius:10, background:'linear-gradient(135deg,#d4a017,#b8860b)', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:14, border:'none', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1 }}>
              {loading ? 'Création...' : 'Créer mon compte →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'rgba(255,255,255,0.35)' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color:'var(--gold-bright)', fontWeight:600, textDecoration:'none' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
