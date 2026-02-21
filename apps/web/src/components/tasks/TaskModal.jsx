// src/components/tasks/TaskModal.jsx
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksAPI, usersAPI } from '../../api/client';
import { PRIORITY_CONFIG, DEPARTMENTS, TAGS, PROJECT_COLORS } from '../../lib/constants';
import { useToast } from '../../lib/toast';
import Avatar from '../ui/Avatar';

export default function TaskModal({ projectId, task, onClose }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!task;

  const [form, setForm] = useState({
    title:       task?.title || '',
    description: task?.description || '',
    status:      task?.status || 'TODO',
    priority:    task?.priority || 'NORMAL',
    tag:         task?.tag || '',
    department:  task?.department || '',
    startDate:   task?.startDate ? task.startDate.split('T')[0] : '',
    dueDate:     task?.dueDate ? task.dueDate.split('T')[0] : '',
    progress:    task?.progress || 0,
    assigneeIds: task?.assignees?.map(a => a.id) || [],
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const { data: team = [] } = useQuery({
    queryKey: ['team'],
    queryFn: () => usersAPI.getTeam().then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? tasksAPI.update(task.id, data)
      : tasksAPI.create({ ...data, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast(isEdit ? '✏️ Tâche modifiée !' : '✅ Tâche créée et assignée !');
      onClose();
    },
    onError: () => toast('❌ Une erreur est survenue', 'error'),
  });

  const toggleAssignee = (id) => {
    set('assigneeIds', form.assigneeIds.includes(id)
      ? form.assigneeIds.filter(i => i !== id)
      : [...form.assigneeIds, id]
    );
  };

  const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
    modal: { background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', width: 560, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' },
    header: { padding: '24px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600 },
    body: { padding: '20px 24px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    group: { marginBottom: 16 },
    footer: { padding: '0 24px 24px', display: 'flex', gap: 10, justifyContent: 'flex-end' },
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal} className="animate-slideIn">

        <div style={s.header}>
          <div style={s.title}>{isEdit ? 'Modifier la tâche' : 'Créer une tâche'}</div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: '5px 10px' }}>×</button>
        </div>

        <div style={s.body}>
          {/* Titre */}
          <div style={s.group}>
            <label className="form-label">Titre *</label>
            <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Révision menu carte été..." />
          </div>

          {/* Description */}
          <div style={s.group}>
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Décrivez la tâche en détail..." />
          </div>

          {/* Statut + Priorité */}
          <div style={{ ...s.group, ...s.row }}>
            <div>
              <label className="form-label">Statut</label>
              <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="TODO">À faire</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="IN_REVIEW">En révision</option>
                <option value="DONE">Terminé</option>
              </select>
            </div>
            <div>
              <label className="form-label">Priorité</label>
              <select className="form-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tag + Département */}
          <div style={{ ...s.group, ...s.row }}>
            <div>
              <label className="form-label">Tag</label>
              <select className="form-input" value={form.tag} onChange={e => set('tag', e.target.value)}>
                <option value="">Aucun</option>
                {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Département</label>
              <select className="form-input" value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">Aucun</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div style={{ ...s.group, ...s.row }}>
            <div>
              <label className="form-label">Date de début</label>
              <input type="date" className="form-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Date d'échéance</label>
              <input type="date" className="form-input" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>
          <div style={{ ...s.group, ...s.row }}>
            <div>
              <label className="form-label">Progression ({form.progress}%)</label>
              <input type="range" min={0} max={100} step={5} value={form.progress}
                onChange={e => set('progress', parseInt(e.target.value))}
                style={{ width: '100%', marginTop: 8, accentColor: 'var(--gold-bright)' }} />
            </div>
          </div>

          {/* Assignation */}
          <div style={s.group}>
            <label className="form-label">Assigner à l'équipe</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 10, background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 9 }}>
              {team.map(member => {
                const selected = form.assigneeIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleAssignee(member.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '5px 10px 5px 5px', borderRadius: 20,
                      border: `1.5px solid ${selected ? 'var(--gold-bright)' : 'var(--border)'}`,
                      background: selected ? 'var(--gold-light)' : 'var(--surface)',
                      color: selected ? 'var(--gold)' : 'var(--text-muted)',
                      cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Avatar name={member.name} size="xs" />
                    {member.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={s.footer}>
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-gold"
            disabled={!form.title || mutation.isPending}
            onClick={() => mutation.mutate(form)}
          >
            {mutation.isPending ? '...' : isEdit ? '✓ Enregistrer' : '✓ Créer la tâche'}
          </button>
        </div>
      </div>
    </div>
  );
}
