// src/components/ui/Avatar.jsx
import { getInitials, stringToColor } from '../../lib/constants';

export default function Avatar({ name, size = 'sm', online = false, className = '' }) {
  const { bg, color } = stringToColor(name);
  const sizes = { xs: 22, sm: 30, md: 38, lg: 48, xl: 60 };
  const px = sizes[size] || 30;
  const fs = Math.round(px * 0.36);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <div
        className={className}
        style={{
          width: px, height: px, borderRadius: '50%',
          background: bg, color: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: fs, fontWeight: 700, flexShrink: 0,
        }}
      >
        {getInitials(name)}
      </div>
      {online && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: Math.max(8, px * 0.22), height: Math.max(8, px * 0.22),
          borderRadius: '50%', background: 'var(--green)',
          border: '2px solid var(--surface)',
        }} />
      )}
    </div>
  );
}

// Stacked avatars list
export function AvatarGroup({ names = [], max = 3, size = 'xs' }) {
  const sizes = { xs: 22, sm: 28 };
  const px = sizes[size] || 22;
  const visible = names.slice(0, max);
  const extra = names.length - max;
  return (
    <div style={{ display: 'flex' }}>
      {visible.map((name, i) => {
        const { bg, color } = stringToColor(name);
        return (
          <div
            key={i}
            title={name}
            style={{
              width: px, height: px, borderRadius: '50%',
              background: bg, color: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: Math.round(px * 0.38), fontWeight: 700,
              border: '2px solid var(--surface)',
              marginLeft: i > 0 ? -(px * 0.3) : 0, zIndex: visible.length - i,
              flexShrink: 0,
            }}
          >
            {getInitials(name)}
          </div>
        );
      })}
      {extra > 0 && (
        <div style={{
          width: px, height: px, borderRadius: '50%',
          background: 'var(--surface2)', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: Math.round(px * 0.35), fontWeight: 700,
          border: '2px solid var(--surface)',
          marginLeft: -(px * 0.3),
        }}>
          +{extra}
        </div>
      )}
    </div>
  );
}
