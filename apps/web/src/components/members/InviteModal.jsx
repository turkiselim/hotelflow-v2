import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../lib/toast';
import { DEPARTMENTS } from '../../lib/constants';
import api from '../../api/client';

export default function InviteModal({ onClose }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name:'', email:'', role:'MEMBER', department:'' });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const mutation = useMutation({
    mutationFn: (data) => api.post('/users/invite', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast(`✉️ Invitation envoyée à ${form.email} avec succès !`);
      onClose();
    },
    onError: (e) => {
      toast(e.response?.data?.error || '❌ Erreur lors de l\'envoi', 'error');
    },
  });

  const handleSend = () => {
    if (!form.email) return toast('⚠️ L\'email est requis', 'warning');
    mutation.mutate(form);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'var(--surface)', borderRadius:18, border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)', width:500, maxWidth:'95vw' }} className="animate-slideIn">

        <div style={{ padding:'24px 24px 0', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:600 }}>Inviter un collaborateur</div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding:'5px 10px' }}>×</button>
        </div>

        <div style={{ padding:'0 24px' }}>
          <div style={{ background:'var(--gold-light)', borderRadius:10, padding:'12px 14px', marginBottom:16, border:'1px solid rgba(212,160,23,0.25)' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--gold)', marginBottom:3 }}>✉️ Invitation par email</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>Un email professionnel avec les identifiants sera envoyé automatiquement.</div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div>
              <label className="form-label">Prénom & Nom</label>
              <input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ahmed Ben Ali" />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="ahmed@hotel.com" />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
            <div>
              <label className="form-label">Rôle</label>
              <select className="form-input" value={form.role} onChange={e=>set('role',e.target.value)}>
                <option value="MEMBER">👤 Membre</option>
                <option value="PROJECT_MANAGER">🎯 Chef de projet</option>
                <option value="ADMIN">👑 Administrateur</option>
              </select>
            </div>
            <div>
              <label className="form-label">Département</label>
              <select className="form-input" value={form.department} onChange={e=>set('department',e.target.value)}>
                <option value="">Sélectionner...</option>
                {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ padding:'0 24px 24px', display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-gold" disabled={mutation.isPending} onClick={handleSend}>
            {mutation.isPending ? 'Envoi en cours...' : '✉️ Envoyer l\'invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}