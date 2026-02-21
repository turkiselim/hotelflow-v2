// src/components/projects/ProjectModal.jsx
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsAPI, usersAPI } from '../../api/client';
import { PROJECT_COLORS } from '../../lib/constants';
import { useToast } from '../../lib/toast';
import Avatar from '../ui/Avatar';

export default function ProjectModal({ project, onClose }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!project;

  const [form, setForm] = useState({
    name:        project?.name        || '',
    description: project?.description || '',
    color:       project?.color       || PROJECT_COLORS[0],
    memberIds:   project?.members?.map(m => m.id) || [],
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const { data: team = [] } = useQuery({
    queryKey: ['team'],
    queryFn: () => usersAPI.getTeam().then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? projectsAPI.update(project.id, data)
      : projectsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast(isEdit ? '✏️ Projet modifié !' : '🎉 Projet créé avec succès !');
      onClose();
    },
    onError: () => toast('❌ Erreur lors de la sauvegarde', 'error'),
  });

  const toggleMember = (id) => {
    set('memberIds', form.memberIds.includes(id)
      ? form.memberIds.filter(i => i !== id)
      : [...form.memberIds, id]
    );
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'var(--surface)', borderRadius:18, border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)', width:520, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto' }} className="animate-slideIn">

        <div style={{ padding:'24px 24px 0', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:600 }}>
            {isEdit ? 'Modifier le projet' : 'Nouveau projet'}
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding:'5px 10px' }}>×</button>
        </div>

        <div style={{ padding:'0 24px' }}>
          <div style={{ marginBottom:16 }}>
            <label className="form-label">Nom du projet *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Refonte Restaurant Panorama..." />
          </div>

          <div style={{ marginBottom:16 }}>
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Objectifs, périmètre, livrable attendu..." />
          </div>

          <div style={{ marginBottom:16 }}>
            <label className="form-label">Couleur du projet</label>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:4 }}>
              {PROJECT_COLORS.map(c => (
                <div key={c} onClick={() => set('color', c)} style={{ width:30, height:30, borderRadius:'50%', background:c, cursor:'pointer', transition:'transform 0.15s', outline: form.color===c ? `3px solid ${c}` : 'none', outlineOffset:2, transform: form.color===c ? 'scale(1.15)' : 'scale(1)' }} />
              ))}
            </div>
          </div>

          <div style={{ marginBottom:24 }}>
            <label className="form-label">Membres de l'équipe</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, padding:10, background:'var(--surface2)', border:'1.5px solid var(--border)', borderRadius:9 }}>
              {team.map(member => {
                const selected = form.memberIds.includes(member.id);
                return (
                  <button key={member.id} type="button" onClick={() => toggleMember(member.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px 5px 5px', borderRadius:20, border:`1.5px solid ${selected?'var(--gold-bright)':'var(--border)'}`, background: selected?'var(--gold-light)':'var(--surface)', color: selected?'var(--gold)':'var(--text-muted)', cursor:'pointer', fontSize:12, fontWeight:500, fontFamily:'inherit', transition:'all 0.15s' }}>
                    <Avatar name={member.name} size="xs" />
                    {member.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ padding:'0 24px 24px', display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-gold" disabled={!form.name || mutation.isPending} onClick={() => mutation.mutate(form)}>
            {mutation.isPending ? '...' : isEdit ? '✓ Enregistrer' : '✓ Créer le projet'}
          </button>
        </div>
      </div>
    </div>
  );
}
