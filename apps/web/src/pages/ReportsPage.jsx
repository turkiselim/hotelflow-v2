import { useQuery } from '@tanstack/react-query';
import { projectsAPI, usersAPI } from '../api/client';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { STATUS_CONFIG, PRIORITY_CONFIG, DEPT_COLORS, isOverdue } from '../lib/constants';

export default function ReportsPage() {
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => projectsAPI.getAll().then(r => r.data) });
  const { data: team = [] } = useQuery({ queryKey: ['team'], queryFn: () => usersAPI.getTeam().then(r => r.data) });

  const allTasks = projects.flatMap(p => (p.tasks || []).map(t => ({ ...t, projectName: p.name, projectColor: p.color })));

  const stats = {
    total: allTasks.length,
    done: allTasks.filter(t => t.status === 'DONE').length,
    inProgress: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
    todo: allTasks.filter(t => t.status === 'TODO').length,
    overdue: allTasks.filter(t => isOverdue(t.dueDate, t.status)).length,
    urgent: allTasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').length,
  };

  const tasksByStatus = Object.entries(STATUS_CONFIG).map(([key, val]) => ({
    name: val.label,
    value: allTasks.filter(t => t.status === key).length,
    color: val.color,
  }));

  const tasksByPriority = Object.entries(PRIORITY_CONFIG).map(([key, val]) => ({
    name: val.label,
    value: allTasks.filter(t => t.priority === key).length,
    color: val.color,
  }));

  const depts = [...new Set(allTasks.map(t => t.department).filter(Boolean))];
  const tasksByDept = depts.map(d => ({
    name: d,
    value: allTasks.filter(t => t.department === d).length,
    color: DEPT_COLORS[d]?.color || '#7a7670',
  }));

  const teamPerf = team.map(m => {
    const tasks = allTasks.filter(t => t.assignees?.some(a => a.id === m.id));
    return {
      name: m.name.split(' ')[0],
      total: tasks.length,
      done: tasks.filter(t => t.status === 'DONE').length,
      active: tasks.filter(t => t.status !== 'DONE').length,
    };
  }).sort((a, b) => b.done - a.done);

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', height: 58, minHeight: 58, background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 600 }}>Rapports & Statistiques</div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stats.total} tâches · {projects.length} projets · {team.length} membres</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <KpiCard label="Total tâches" value={stats.total} color="var(--accent)" icon="📋" />
          <KpiCard label="Terminées" value={stats.done} sub={`${completionRate}%`} color="var(--green)" icon="✅" />
          <KpiCard label="En cours" value={stats.inProgress} color="var(--accent)" icon="⏳" />
          <KpiCard label="En retard" value={stats.overdue} color={stats.overdue > 0 ? 'var(--red)' : 'var(--green)'} icon="⚠️" alert={stats.overdue > 0} />
          <KpiCard label="Urgentes" value={stats.urgent} color="var(--orange)" icon="🔥" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          
          <ChartCard title="Répartition par statut">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={tasksByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {tasksByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Répartition par priorité">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={tasksByPriority} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {tasksByPriority.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          
          {tasksByDept.length > 0 && (
            <ChartCard title="Tâches par département">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={tasksByDept}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" style={{ fontSize: 12 }} />
                  <YAxis style={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--accent)">
                    {tasksByDept.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          <ChartCard title="Performance de l'équipe">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={teamPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" style={{ fontSize: 12 }} />
                <YAxis style={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="done" name="Terminées" fill="var(--green)" />
                <Bar dataKey="active" name="Actives" fill="var(--accent)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>

        <ChartCard title="Avancement des projets">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {projects.map(p => {
              const tasks = p.tasks || [];
              const done = tasks.filter(t => t.status === 'DONE').length;
              const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: p.color, borderRadius: 3, transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      {done}/{tasks.length} tâches · {tasks.filter(t => t.status !== 'DONE').length} restantes
                    </div>
                  </div>
                </div>
              );
            })}
            {projects.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>Aucun projet</div>
            )}
          </div>
        </ChartCard>

      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, color, icon, alert }) {
  return (
    <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display',serif", lineHeight: 1, marginBottom: 6, color: alert ? 'var(--red)' : 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
      <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 36, opacity: 0.08 }}>{icon}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>{title}</h3>
      {children}
    </div>
  );
}