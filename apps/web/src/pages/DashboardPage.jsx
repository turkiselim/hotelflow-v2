// src/pages/DashboardPage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, usersAPI } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { PRIORITY_CONFIG, STATUS_CONFIG, isOverdue, formatDate, stringToColor } from '../lib/constants';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import TaskModal from '../components/tasks/TaskModal';
import ProjectModal from '../components/projects/ProjectModal';
import Avatar from '../components/ui/Avatar';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);

  const { data: projects = [] } = useQuery({ queryKey:['projects'], queryFn:()=>projectsAPI.getAll().then(r=>r.data) });
  const { data: team = [] } = useQuery({ queryKey:['team'], queryFn:()=>usersAPI.getTeam().then(r=>r.data) });

  // Aggregate all tasks across projects
  const allTasks = projects.flatMap(p => (p.tasks||[]).map(t=>({...t, projectName:p.name, projectColor:p.color, projectId:p.id})));
  const urgent   = allTasks.filter(t => (t.priority==='URGENT'||t.priority==='HIGH') && t.status!=='DONE');
  const overdue  = allTasks.filter(t => isOverdue(t.dueDate, t.status));
  const inProgress = allTasks.filter(t => t.status==='IN_PROGRESS');
  const done     = allTasks.filter(t => t.status==='DONE');

  // Member workload
  const memberWorkload = team.map(m => ({
    ...m,
    activeTasks: allTasks.filter(t => t.assignees?.some(a=>a.id===m.id) && t.status!=='DONE').length,
    doneTasks:   allTasks.filter(t => t.assignees?.some(a=>a.id===m.id) && t.status==='DONE').length,
    lateTasks:   allTasks.filter(t => t.assignees?.some(a=>a.id===m.id) && isOverdue(t.dueDate,t.status)).length,
  }));

  const greetHour = new Date().getHours();
  const greet = greetHour < 12 ? 'Bonjour' : greetHour < 18 ? 'Bonsoir' : 'Bonsoir';
  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const s = {
    topbar: { display:'flex', alignItems:'center', gap:12, padding:'0 24px', height:58, minHeight:58, background:'var(--surface)', borderBottom:'1px solid var(--border)', flexShrink:0 },
    content: { flex:1, overflowY:'auto', padding:24 },
    kpiGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
    grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 },
    grid3: { display:'grid', gridTemplateColumns:'1fr 1fr 300px', gap:16, marginBottom:16 },
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:600, flex:1 }}>Tableau de Bord</div>
        <button className="btn btn-outline btn-sm" onClick={() => setShowNewProject(true)}>+ Projet</button>
        <button className="btn btn-gold" onClick={() => setShowNewTask(true)}>+ Nouvelle tâche</button>
      </div>

      {/* Content */}
      <div style={s.content}>
        {/* Welcome */}
        <div style={{ marginBottom:24 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:600, marginBottom:4 }}>{greet}, {user?.name?.split(' ')[0]} 👋</h2>
          <p style={{ color:'var(--text-muted)', fontSize:14, textTransform:'capitalize' }}>{dateStr}</p>
        </div>

        {/* KPIs */}
        <div style={s.kpiGrid}>
          <KpiCard label="Tâches actives"   value={inProgress.length} sub={`${allTasks.length} au total`}        color="var(--accent)"      icon="📋" />
          <KpiCard label="Projets actifs"   value={projects.length}   sub="en cours d'exécution"                  color="var(--gold-bright)" icon="🏗" />
          <KpiCard label="Terminées"        value={done.length}       sub="tâches complétées"                     color="var(--green)"       icon="✅" />
          <KpiCard label="En retard"        value={overdue.length}    sub="nécessitent attention"                  color="var(--red)"         icon="⚠️" alert={overdue.length>0} />
        </div>

        {/* Row 1: Projets + Activité */}
        <div style={s.grid3}>
          {/* Avancement projets */}
          <DashCard title="Avancement des projets">
            {projects.length === 0 ? (
              <EmptyState icon="📂" text="Aucun projet — Créez votre premier projet" />
            ) : projects.map(p => {
              const tasks = p.tasks || [];
              const pct = tasks.length ? Math.round(tasks.filter(t=>t.status==='DONE').length / tasks.length * 100) : 0;
              return (
                <div key={p.id} style={{ marginBottom:14, cursor:'pointer' }} onClick={()=>navigate(`/projet/${p.id}`)}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:500 }}>
                      <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:p.color, marginRight:7 }} />
                      {p.name}
                    </span>
                    <span style={{ fontSize:12, fontWeight:700, color:p.color||'var(--gold)' }}>{pct}%</span>
                  </div>
                  <div style={{ height:6, background:'var(--surface2)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:p.color||'var(--gold-bright)', borderRadius:3, transition:'width 0.6s' }} />
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:3 }}>{tasks.filter(t=>t.status!=='DONE').length} tâches restantes · {p.members?.length||0} membres</div>
                </div>
              );
            })}
          </DashCard>

          {/* Urgentes aujourd'hui */}
          <DashCard title="À traiter en priorité 🔥">
            {urgent.length === 0 ? (
              <EmptyState icon="🎉" text="Aucune tâche urgente !" />
            ) : urgent.slice(0,5).map(t => {
              const p = PRIORITY_CONFIG[t.priority];
              return (
                <div key={t.id} onClick={()=>setSelectedTask(t)} style={{ padding:'10px 12px', borderRadius:10, background: t.priority==='URGENT'?'var(--red-light)':'var(--orange-light)', borderLeft:`3px solid ${p.color}`, marginBottom:8, cursor:'pointer', transition:'opacity 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                  <div style={{ fontSize:12, fontWeight:700, color:p.color, marginBottom:2 }}>{p.icon} {p.label} · {t.projectName}</div>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{t.title}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                    {t.assignees?.[0]?.name||'Non assigné'} · Échéance {isOverdue(t.dueDate,t.status)?'⚠ dépassée':formatDate(t.dueDate)}
                  </div>
                </div>
              );
            })}
          </DashCard>

          {/* Charge équipe */}
          <DashCard title="Charge de l'équipe">
            {memberWorkload.slice(0,6).map(m => {
              const max = Math.max(...memberWorkload.map(x=>x.activeTasks), 1);
              const pct = (m.activeTasks / max) * 100;
              return (
                <div key={m.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <Avatar name={m.name} size="sm" online={m.isOnline} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name.split(' ')[0]}</div>
                    <div style={{ height:5, background:'var(--surface2)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background: pct>80?'var(--red)':pct>60?'var(--orange)':'var(--accent)', borderRadius:3 }} />
                    </div>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color: m.activeTasks>7?'var(--red)':'var(--text-muted)', whiteSpace:'nowrap' }}>{m.activeTasks} tâches</div>
                </div>
              );
            })}
          </DashCard>
        </div>

        {/* Row 2: Toutes les tâches actives */}
        <DashCard title={`Toutes les tâches actives (${inProgress.length})`} action={{ label:'Voir par projet →', onClick:()=>navigate(projects[0]?`/projet/${projects[0].id}`:'/') }}>
          {inProgress.length === 0 ? (
            <EmptyState icon="🎯" text="Aucune tâche en cours" />
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:10 }}>
              {inProgress.slice(0,6).map(t => {
                const p = PRIORITY_CONFIG[t.priority];
                return (
                  <div key={t.id} onClick={()=>setSelectedTask(t)} style={{ padding:'12px 14px', borderRadius:10, background:'var(--surface2)', border:'1px solid var(--border)', cursor:'pointer', transition:'all 0.15s', position:'relative', overflow:'hidden' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold-bright)';e.currentTarget.style.background='var(--gold-light)'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--surface2)'}}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:p.color }} />
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4, display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:t.projectColor }} />
                      {t.projectName}
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>{t.title}</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span className="tag" style={{ background:p.bg, color:p.color }}>{p.label}</span>
                      <span style={{ fontSize:11, color: isOverdue(t.dueDate,t.status)?'var(--red)':'var(--text-muted)', fontWeight: isOverdue(t.dueDate,t.status)?700:400 }}>
                        {isOverdue(t.dueDate,t.status)?'⚠ Retard':formatDate(t.dueDate)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashCard>
      </div>

      {/* Modals */}
      {selectedTask && <TaskDetailModal task={selectedTask} projectId={selectedTask.projectId} onClose={()=>setSelectedTask(null)} />}
      {showNewTask && <TaskModal projectId={projects[0]?.id} onClose={()=>setShowNewTask(false)} />}
      {showNewProject && <ProjectModal onClose={()=>setShowNewProject(false)} />}
    </div>
  );
}

function KpiCard({ label, value, sub, color, icon, alert }) {
  return (
    <div className="card" style={{ padding:20, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:color }} />
      <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:'var(--text-muted)', marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:36, fontWeight:700, fontFamily:"'Playfair Display',serif", lineHeight:1, marginBottom:6, color: alert&&value>0?'var(--red)':'var(--text)' }}>{value}</div>
      <div style={{ fontSize:12, color:'var(--text-muted)' }}>{sub}</div>
      <div style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontSize:36, opacity:0.08 }}>{icon}</div>
    </div>
  );
}

function DashCard({ title, children, action }) {
  return (
    <div className="card" style={{ padding:20 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:700 }}>{title}</div>
        {action && <span onClick={action.onClick} style={{ fontSize:12, color:'var(--accent)', fontWeight:500, cursor:'pointer' }}>{action.label}</span>}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-dim)', fontSize:13 }}>
      <div style={{ fontSize:28, marginBottom:6 }}>{icon}</div>
      {text}
    </div>
  );
}
