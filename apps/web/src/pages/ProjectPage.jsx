// src/pages/ProjectPage.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsAPI } from '../api/client';
import { AvatarGroup } from '../components/ui/Avatar';
import TaskModal from '../components/tasks/TaskModal';
import ProjectModal from '../components/projects/ProjectModal';
import { KanbanView } from '../components/views/AllViews';
import { ListView } from '../components/views/AllViews';
import { TableView } from '../components/views/AllViews';
import { TimelineView } from '../components/views/AllViews';
import { CalendarView } from '../components/views/AllViews';

const VIEWS = [
  { key:'kanban',    label:'▦ Kanban'       },
  { key:'list',      label:'☰ Liste'        },
  { key:'table',     label:'⊞ Tableau'      },
  { key:'timeline',  label:'↔ Chronologie' },
  { key:'calendar',  label:'📅 Calendrier'  },
];

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState('kanban');
  const [showNewTask, setShowNewTask] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsAPI.getById(id).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, color:'var(--text-muted)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:8 }}>⏳</div>
        Chargement du projet...
      </div>
    </div>
  );

  if (!project) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>📂</div>
        <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>Projet introuvable</div>
        <button className="btn btn-outline" onClick={() => navigate('/')}>← Retour</button>
      </div>
    </div>
  );

  const tasks = project.tasks || [];
  const members = project.members || [];
  const donePct = tasks.length ? Math.round(tasks.filter(t => t.status==='DONE').length / tasks.length * 100) : 0;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>

      {/* Topbar */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 20px', height:58, minHeight:58, background:'var(--surface)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        {/* Back + title */}
        <button onClick={() => navigate('/')} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:13, fontFamily:'inherit', padding:'5px 8px', borderRadius:7, transition:'all 0.12s', display:'flex', alignItems:'center', gap:4 }}
          onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}>
          ← Retour
        </button>
        <div style={{ width:1, height:20, background:'var(--border)' }} />
        <div style={{ width:10, height:10, borderRadius:'50%', background:project.color || 'var(--gold)', flexShrink:0 }} />
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:600, flex:1 }}>{project.name}</div>

        {/* Progress pill */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 12px', background:'var(--surface2)', borderRadius:20 }}>
          <div style={{ width:48, height:5, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
            <div style={{ width:`${donePct}%`, height:'100%', background:'var(--green)', borderRadius:3 }} />
          </div>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)' }}>{donePct}%</span>
        </div>

        {/* Members */}
        <AvatarGroup names={members.map(m => m.name)} max={4} size="sm" />

        {/* View switcher */}
        <div style={{ display:'flex', background:'var(--surface2)', borderRadius:9, padding:3, gap:1 }}>
          {VIEWS.map(v => (
            <button key={v.key} onClick={() => setView(v.key)} style={{ padding:'5px 10px', borderRadius:7, fontSize:12, fontWeight:600, color: view===v.key?'var(--text)':'var(--text-muted)', background: view===v.key?'var(--surface)':'transparent', boxShadow: view===v.key?'var(--shadow-sm)':'none', cursor:'pointer', border:'none', fontFamily:'inherit', transition:'all 0.15s', whiteSpace:'nowrap' }}>
              {v.label}
            </button>
          ))}
        </div>

        <button className="btn btn-outline btn-sm" onClick={() => setShowEditProject(true)}>⚙️</button>
        <button className="btn btn-gold btn-sm" onClick={() => setShowNewTask(true)}>+ Tâche</button>
      </div>

      {/* View area */}
      <div style={{ flex:1, overflow: view==='kanban'?'hidden':'auto', padding:20 }}>
        <div style={{ height:'100%' }}>
          {view === 'kanban'   && <KanbanView   tasks={tasks} projectId={id} onAddTask={() => setShowNewTask(true)} />}
          {view === 'list'     && <ListView     tasks={tasks} projectId={id} onAddTask={() => setShowNewTask(true)} />}
          {view === 'table'    && <TableView    tasks={tasks} projectId={id} />}
          {view === 'timeline' && <TimelineView tasks={tasks} />}
          {view === 'calendar' && <CalendarView tasks={tasks} projectId={id} />}
        </div>
      </div>

      {showNewTask    && <TaskModal    projectId={id} onClose={() => setShowNewTask(false)} />}
      {showEditProject && <ProjectModal project={project} onClose={() => setShowEditProject(false)} />}
    </div>
  );
}
