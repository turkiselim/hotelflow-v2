// src/components/layout/Sidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsAPI } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { getInitials, stringToColor, PROJECT_COLORS } from '../../lib/constants';

export default function Sidebar({ onNewProject }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll().then(r => r.data),
  });

  const navItems = [
    { path: '/',         icon: '📊', label: 'Tableau de bord' },
    { path: '/membres',  icon: '👥', label: 'Équipe & Membres' },
    { path: '/rapports', icon: '📈', label: 'Rapports'         },
    { path: '/settings', icon: '⚙️', label: 'Paramètres'       },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  const s = {
    sidebar: {
      width: 260, minWidth: 260,
      background: 'var(--dark)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    },
    brand: {
      padding: '22px 20px 14px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      marginBottom: 8,
    },
    brandRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
    brandIcon: {
      width: 36, height: 36, borderRadius: 10,
      background: 'linear-gradient(135deg,#d4a017,#b8860b)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
    },
    brandName: { fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#fff', fontWeight: 600 },
    brandSub: { fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginLeft: 46 },
    navGroup: { padding: '4px 12px 8px' },
    navLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '8px 8px 4px', display: 'block' },
    footer: { marginTop: 'auto', padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)' },
    userCard: {
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
      borderRadius: 10, background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
      transition: 'all 0.15s',
    },
  };

  return (
    <aside style={s.sidebar}>
      {/* Brand */}
      <div style={s.brand}>
        <div style={s.brandRow}>
          <div style={s.brandIcon}>🏨</div>
          <span style={s.brandName}>HôtelFlow</span>
        </div>
        <div style={s.brandSub}>Grand Hôtel Méditerranée</div>
      </div>

      {/* Navigation */}
      <div style={s.navGroup}>
        <span style={s.navLabel}>Principal</span>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={active}
              onClick={() => navigate(item.path)}
            />
          );
        })}
      </div>

      {/* Projects */}
      <div style={s.navGroup}>
        <span style={s.navLabel}>Projets actifs</span>
        {projects.map((p, i) => {
          const color = p.color || PROJECT_COLORS[i % PROJECT_COLORS.length];
          const active = location.pathname === `/projet/${p.id}`;
          return (
            <div
              key={p.id}
              onClick={() => navigate(`/projet/${p.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                fontSize: 12.5, transition: 'all 0.15s', marginBottom: 1,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{p._count?.tasks || 0}</span>
            </div>
          );
        })}
        <div
          onClick={onNewProject}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
            color: 'rgba(255,255,255,0.3)', fontSize: 12.5, transition: 'all 0.15s',
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
          + Nouveau projet
        </div>
      </div>

      {/* User footer */}
      <div style={s.footer}>
        <div style={s.userCard} onClick={handleLogout} title="Cliquer pour se déconnecter">
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#d4a017,#b8860b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            {getInitials(user?.name || 'U')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              {user?.role === 'ADMIN' ? '👑 Directeur' : user?.role === 'PROJECT_MANAGER' ? '🎯 Chef de projet' : '👤 Membre'}
            </div>
          </div>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
        color: active ? '#d4a017' : 'rgba(255,255,255,0.55)',
        background: active ? 'rgba(212,160,23,0.15)' : 'transparent',
        fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
        marginBottom: 1, position: 'relative',
        borderLeft: active ? '3px solid #d4a017' : '3px solid transparent',
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 7, fontSize: 15, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(212,160,23,0.2)' : 'rgba(255,255,255,0.05)',
      }}>
        {icon}
      </div>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'var(--red)', color: '#fff' }}>
          {badge}
        </span>
      )}
    </div>
  );
}
