// src/components/tasks/TaskDetailModal.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../api/client';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatDate, isOverdue } from '../../lib/constants';
import Avatar from '../ui/Avatar';
import { useToast } from '../../lib/toast';
import TaskModal from './TaskModal';

export default function TaskDetailModal({ task, projectId, onClose }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', task.id],
    queryFn: () => tasksAPI.getComments(task.id).then(r => r.data),
  });

  const addComment = useMutation({
    mutationFn: () => tasksAPI.addComment(task.id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', task.id] });
      setComment('');
      toast('💬 Commentaire ajouté');
    },
  });

  const updateStatus = useMutation({
    mutationFn: (status) => tasksAPI.update(task.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast('✅ Statut mis à jour');
    },
  });

  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.NORMAL;
  const s = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const overdue = isOverdue(task.dueDate, task.status);

  if (showEdit) return <TaskModal task={task} projectId={projectId} onClose={() => { setShowEdit(false); onClose(); }} />;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', width: 700, maxWidth: '95vw', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} className="animate-slideIn">

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="tag" style={{ background: p.bg, color: p.color }}>{p.icon} {p.label}</span>
            <span className="pill" style={{ background: s.bg, color: s.color }}>{s.label}</span>
            {overdue && <span className="tag" style={{ background: 'var(--red-light)', color: 'var(--red)' }}>⚠ En retard</span>}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowEdit(true)}>✏️ Modifier</button>
              <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: '5px 10px' }}>×</button>
            </div>
          </div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600 }}>{task.title}</div>
        </div>

        {/* Body — two-column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', flex: 1, overflow: 'hidden' }}>

          {/* Left — main content */}
          <div style={{ padding: '20px 24px', overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
            {task.description && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>
                {task.description}
              </p>
            )}

            {/* Progress */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="form-label" style={{ marginBottom: 0 }}>Progression</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>{task.progress || 0}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${task.progress || 0}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,var(--gold-bright),var(--accent))', transition: 'width 0.5s' }} />
              </div>
            </div>

            {/* Change status quick actions */}
            <div style={{ marginBottom: 20 }}>
              <span className="form-label">Déplacer vers</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <button key={k}
                    className="btn btn-sm"
                    disabled={task.status === k}
                    onClick={() => updateStatus.mutate(k)}
                    style={{ background: task.status === k ? v.bg : 'var(--surface2)', color: task.status === k ? v.color : 'var(--text-muted)', border: `1px solid ${task.status === k ? v.color : 'var(--border)'}` }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <span className="form-label">Commentaires ({comments.length})</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                {comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                    <Avatar name={c.author?.name} size="sm" />
                    <div style={{ flex: 1, background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{c.author?.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.content}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                        {new Date(c.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: '16px 0' }}>
                    Aucun commentaire pour l'instant
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="Ajouter un commentaire..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && comment.trim() && addComment.mutate()}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-gold" disabled={!comment.trim()} onClick={() => addComment.mutate()}>↑</button>
              </div>
            </div>
          </div>

          {/* Right — meta */}
          <div style={{ padding: 20, overflowY: 'auto' }}>
            <MetaItem label="Assigné à">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {task.assignees?.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar name={a.name} size="sm" />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</span>
                  </div>
                ))}
                {!task.assignees?.length && <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Non assigné</span>}
              </div>
            </MetaItem>
            <MetaItem label="Échéance">
              <span style={{ fontSize: 13, color: overdue ? 'var(--red)' : 'var(--text)', fontWeight: overdue ? 700 : 400 }}>
                {overdue ? '⚠ ' : '📅 '}{formatDate(task.dueDate)}
              </span>
            </MetaItem>
            <MetaItem label="Priorité">
              <span className="tag" style={{ background: p.bg, color: p.color }}>{p.icon} {p.label}</span>
            </MetaItem>
            {task.department && (
              <MetaItem label="Département">
                <span style={{ fontSize: 13 }}>{task.department}</span>
              </MetaItem>
            )}
            {task.tag && (
              <MetaItem label="Tag">
                <span className="tag" style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>{task.tag}</span>
              </MetaItem>
            )}
            <MetaItem label="Créé le">
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(task.createdAt)}</span>
            </MetaItem>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <span className="form-label">{label}</span>
      <div style={{ marginTop: 4 }}>{children}</div>
    </div>
  );
}
