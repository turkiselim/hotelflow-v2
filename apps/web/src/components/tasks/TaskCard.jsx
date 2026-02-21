// src/components/tasks/TaskCard.jsx
import { PRIORITY_CONFIG, TAG_COLORS, isOverdue, formatDateShort } from '../../lib/constants';
import { AvatarGroup } from '../ui/Avatar';

export default function TaskCard({ task, onClick, index = 0 }) {
  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.NORMAL;
  const overdue = isOverdue(task.dueDate, task.status);
  const tagColor = TAG_COLORS[task.tag] || '#7a7670';
  const assigneeNames = task.assignees?.map(a => a.name) || [];

  return (
    <div
      className={`animate-fadeUp stagger-${Math.min(index + 1, 5)}`}
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '14px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--gold-bright)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Priority bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: p.color }} />

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, flex: 1 }}>{task.title}</div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0, marginTop: 5 }} title={p.label} />
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {task.tag && (
          <span className="tag" style={{ background: `${tagColor}18`, color: tagColor }}>
            {task.tag}
          </span>
        )}
        <span className="tag" style={{ background: p.bg, color: p.color }}>{p.label}</span>
        {task.department && (
          <span className="tag" style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
            {task.department}
          </span>
        )}
      </div>

      {/* Progress */}
      {task.progress > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600 }}>PROGRESSION</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{task.progress}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              width: `${task.progress}%`, height: '100%', borderRadius: 2,
              background: task.progress === 100
                ? 'var(--green)'
                : `linear-gradient(90deg, var(--gold-bright), var(--accent))`,
            }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <AvatarGroup names={assigneeNames} max={3} size="xs" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>💬 {task._count?.comments || 0}</span>
          {task.dueDate && (
            <span style={{ fontSize: 11, color: overdue ? 'var(--red)' : 'var(--text-muted)', fontWeight: overdue ? 700 : 400 }}>
              {overdue ? '⚠ Retard' : `📅 ${formatDateShort(task.dueDate)}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
