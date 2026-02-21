// src/components/views/AllViews.jsx
import { useState } from 'react';
import TaskCard from '../tasks/TaskCard';
import TaskDetailModal from '../tasks/TaskDetailModal';
import { AvatarGroup } from '../ui/Avatar';
import { PRIORITY_CONFIG, STATUS_CONFIG, isOverdue, formatDate } from '../../lib/constants';

const KANBAN_COLS = [
  { key:'TODO', label:'À faire', color:'#7a7670' },
  { key:'IN_PROGRESS', label:'En cours', color:'#2c5f8a' },
  { key:'IN_REVIEW', label:'En révision', color:'#c45e1a' },
  { key:'DONE', label:'Terminé', color:'#27694a' },
];

export function KanbanView({ tasks, projectId, onAddTask }) {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ display:'flex', gap:14, height:'100%' }}>
      {KANBAN_COLS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        return (
          <div key={col.key} style={{ width:272, minWidth:272, display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'var(--shadow-sm)' }}>
              <div style={{ width:9, height:9, borderRadius:'50%', background:col.color }} />
              <span style={{ fontSize:13, fontWeight:700, flex:1 }}>{col.label}</span>
              <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:'var(--surface2)', color:'var(--text-muted)' }}>{colTasks.length}</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:9, flex:1, overflowY:'auto', paddingRight:2 }}>
              {colTasks.map((t, i) => <TaskCard key={t.id} task={t} index={i} onClick={() => setSelected(t)} />)}
            </div>
            <button onClick={onAddTask} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 12px', border:'1.5px dashed var(--border)', borderRadius:12, fontSize:12.5, color:'var(--text-dim)', cursor:'pointer', background:'transparent', transition:'all 0.15s', fontFamily:'inherit', fontWeight:500, width:'100%' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold-bright)';e.currentTarget.style.color='var(--gold)';e.currentTarget.style.background='var(--gold-light)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-dim)';e.currentTarget.style.background='transparent'}}>
              + Ajouter une tâche
            </button>
          </div>
        );
      })}
      {selected && <TaskDetailModal task={selected} projectId={projectId} onClose={() => setSelected(null)} />}
    </div>
  );
}

export function ListView({ tasks, projectId, onAddTask }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const filtered = tasks
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))
    .filter(t => filter === 'ALL' ? true : t.priority === 'URGENT' || t.priority === 'HIGH');
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input placeholder="🔍 Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:160, padding:'8px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:9, fontSize:13, outline:'none', fontFamily:'inherit' }} />
        {[['ALL','Toutes'],['URGENT','🔴 Urgent']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding:'7px 12px', borderRadius:8, border:`1px solid ${filter===v?'var(--gold-bright)':'var(--border)'}`, background:filter===v?'var(--gold-light)':'var(--surface)', color:filter===v?'var(--gold)':'var(--text-muted)', fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit' }}>{l}</button>
        ))}
        <button onClick={onAddTask} className="btn btn-gold btn-sm">+ Tâche</button>
      </div>
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2.5fr 1fr 1fr 1fr 130px 60px', background:'var(--surface2)', borderBottom:'1px solid var(--border)' }}>
          {['Tâche','Statut','Priorité','Assigné à','Échéance',''].map((h,i) => (
            <div key={i} style={{ padding:'10px 14px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color:'var(--text-muted)' }}>{h}</div>
          ))}
        </div>
        {filtered.map(t => {
          const s = STATUS_CONFIG[t.status]||STATUS_CONFIG.TODO;
          const p = PRIORITY_CONFIG[t.priority]||PRIORITY_CONFIG.NORMAL;
          const over = isOverdue(t.dueDate,t.status);
          return (
            <div key={t.id} onClick={() => setSelected(t)} style={{ display:'grid', gridTemplateColumns:'2.5fr 1fr 1fr 1fr 130px 60px', borderBottom:'1px solid var(--border)', cursor:'pointer', alignItems:'center', transition:'background 0.1s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--gold-light)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:4, height:28, borderRadius:2, background:p.color, flexShrink:0 }} />
                <span style={{ fontSize:13, fontWeight:600 }}>{t.title}</span>
              </div>
              <div style={{ padding:'12px 14px' }}><span className="pill" style={{ background:s.bg, color:s.color }}>{s.label}</span></div>
              <div style={{ padding:'12px 14px' }}><span className="pill" style={{ background:p.bg, color:p.color }}>{p.label}</span></div>
              <div style={{ padding:'12px 14px' }}><AvatarGroup names={t.assignees?.map(a=>a.name)||[]} max={3} /></div>
              <div style={{ padding:'12px 14px', fontSize:12, color:over?'var(--red)':'var(--text-muted)', fontWeight:over?700:400 }}>{over?'⚠ ':''}{formatDate(t.dueDate)}</div>
              <div style={{ padding:'12px 14px' }}><button onClick={e=>{e.stopPropagation();setSelected(t)}} style={{ width:28,height:28,borderRadius:7,border:'1px solid var(--border)',background:'transparent',cursor:'pointer',fontSize:13 }}>👁</button></div>
            </div>
          );
        })}
        {filtered.length===0 && <div style={{ textAlign:'center', padding:40, color:'var(--text-dim)', fontSize:13 }}>Aucune tâche</div>}
      </div>
      {selected && <TaskDetailModal task={selected} projectId={projectId} onClose={() => setSelected(null)} />}
    </div>
  );
}

export function TableView({ tasks, projectId }) {
  const [selected, setSelected] = useState(null);
  return (
    <div>
      <div className="card" style={{ overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'var(--dark)' }}>
              {['Tâche','Statut','Priorité','Assigné à','Département','Échéance','Progression'].map((h,i) => (
                <th key={i} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color:i===0?'#d4a017':'rgba(255,255,255,0.5)', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => {
              const s=STATUS_CONFIG[t.status]||STATUS_CONFIG.TODO;
              const p=PRIORITY_CONFIG[t.priority]||PRIORITY_CONFIG.NORMAL;
              const over=isOverdue(t.dueDate,t.status);
              return (
                <tr key={t.id} onClick={()=>setSelected(t)} style={{ borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'background 0.1s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--gold-light)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600 }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ color:p.color }}>●</span>{t.title}</div></td>
                  <td style={{ padding:'12px 16px' }}><span className="pill" style={{ background:s.bg, color:s.color }}>{s.label}</span></td>
                  <td style={{ padding:'12px 16px' }}><span className="pill" style={{ background:p.bg, color:p.color }}>{p.label}</span></td>
                  <td style={{ padding:'12px 16px' }}><AvatarGroup names={t.assignees?.map(a=>a.name)||[]} max={3} /></td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'var(--text-muted)' }}>{t.department||'—'}</td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:over?'var(--red)':'var(--text-muted)', fontWeight:over?700:400 }}>{over?'⚠ ':''}{formatDate(t.dueDate)}</td>
                  <td style={{ padding:'12px 16px', minWidth:120 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, height:5, background:'var(--surface2)', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ width:`${t.progress||0}%`, height:'100%', background:(t.progress||0)===100?'var(--green)':(t.progress||0)>60?'var(--accent)':'var(--gold-bright)' }} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>{t.progress||0}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selected && <TaskDetailModal task={selected} projectId={projectId} onClose={()=>setSelected(null)} />}
    </div>
  );
}

export function TimelineView({ tasks }) {
  const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû'];
  const DAYS = 220;
  const START = new Date('2025-01-01');
  const TODAY = new Date();
  const todayPct = Math.min(100, Math.max(0, (TODAY - START) / 86400000 / DAYS * 100));
  const getPos = d => Math.min(100, Math.max(0, (new Date(d || '2025-01-01') - START) / 86400000 / DAYS * 100));
  return (
    <div className="card" style={{ padding:20, overflowX:'auto' }}>
      <div style={{ display:'flex', marginLeft:200, marginBottom:8 }}>
        {MONTHS.map(m => <div key={m} style={{ flex:1, textAlign:'center', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color:'var(--text-muted)' }}>{m}</div>)}
      </div>
      {tasks.map(t => {
        const p = PRIORITY_CONFIG[t.priority]||PRIORITY_CONFIG.NORMAL;
        const left = getPos(t.startDate || t.createdAt);
        const right = getPos(t.dueDate);
        const w = Math.max(4, right - left);
        return (
          <div key={t.id} style={{ display:'flex', alignItems:'center', marginBottom:8 }}>
            <div style={{ width:200, flexShrink:0, paddingRight:16 }}>
              <div style={{ fontSize:12, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>{t.assignees?.[0]?.name?.split(' ')[0]||'—'}</div>
            </div>
            <div style={{ flex:1, height:30, background:'var(--surface2)', borderRadius:6, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, bottom:0, left:`${todayPct}%`, width:2, background:'rgba(192,57,43,0.5)', zIndex:2 }} />
              <div style={{ position:'absolute', top:4, height:22, left:`${left}%`, width:`${w}%`, minWidth:8, background:p.color, borderRadius:5, cursor:'pointer', display:'flex', alignItems:'center', padding:'0 8px', fontSize:10, fontWeight:600, color:'#fff', overflow:'hidden', whiteSpace:'nowrap' }} title={t.title}>
                {w > 8 ? t.title.substring(0,22) : ''}
              </div>
            </div>
          </div>
        );
      })}
      {tasks.length===0 && <div style={{ textAlign:'center', padding:40, color:'var(--text-dim)', fontSize:13 }}>Aucune tâche</div>}
    </div>
  );
}

export function CalendarView({ tasks, projectId }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selected, setSelected] = useState(null);
  const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const P_COLORS = { URGENT:'#c0392b', HIGH:'#c45e1a', NORMAL:'#2c5f8a', LOW:'#27694a' };
  const changeMonth = d => {
    let m=month+d,y=year;
    if(m<0){m=11;y--;} if(m>11){m=0;y++;}
    setMonth(m);setYear(y);
  };
  const first=new Date(year,month,1);
  let startDay=first.getDay()-1; if(startDay<0)startDay=6;
  const daysInMonth=new Date(year,month+1,0).getDate();
  const prevDays=new Date(year,month,0).getDate();
  const today=new Date();
  const trailing=(Math.ceil((startDay+daysInMonth)/7)*7)-(startDay+daysInMonth);
  const getDay=day=>{const d=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;return tasks.filter(t=>t.dueDate?.startsWith(d));};
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <button onClick={()=>changeMonth(-1)} style={{ width:32,height:32,borderRadius:8,border:'1px solid var(--border)',background:'var(--surface)',cursor:'pointer',fontSize:16,color:'var(--text-muted)' }}>‹</button>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:600, minWidth:200, textAlign:'center' }}>{MONTHS_FR[month]} {year}</div>
        <button onClick={()=>changeMonth(1)} style={{ width:32,height:32,borderRadius:8,border:'1px solid var(--border)',background:'var(--surface)',cursor:'pointer',fontSize:16,color:'var(--text-muted)' }}>›</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'var(--border)', borderRadius:12, overflow:'hidden', gap:1 }}>
        {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d=><div key={d} style={{ background:'var(--dark)',padding:'10px',textAlign:'center',fontSize:11,fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.5)' }}>{d}</div>)}
        {Array.from({length:startDay},(_,i)=><div key={`p${i}`} style={{ background:'var(--surface2)',minHeight:90,padding:8,opacity:0.5 }}><div style={{ fontSize:12,color:'var(--text-dim)' }}>{prevDays-startDay+1+i}</div></div>)}
        {Array.from({length:daysInMonth},(_,i)=>{
          const day=i+1;
          const isToday=today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===day;
          const dayTasks=getDay(day);
          return (
            <div key={day} style={{ background:isToday?'var(--gold-light)':'var(--surface)',minHeight:90,padding:8 }}>
              <div style={isToday?{width:24,height:24,borderRadius:'50%',background:'var(--gold-bright)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,marginBottom:4}:{fontSize:12,fontWeight:600,color:'var(--text-muted)',marginBottom:4}}>{day}</div>
              {dayTasks.slice(0,3).map(t=>{const c=P_COLORS[t.priority]||'#2c5f8a';return(<div key={t.id} onClick={()=>setSelected(t)} style={{ fontSize:10,padding:'2px 6px',borderRadius:4,marginBottom:2,background:`${c}20`,color:c,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',cursor:'pointer' }}>{t.title}</div>);})}
              {dayTasks.length>3&&<div style={{ fontSize:10,color:'var(--text-dim)',fontWeight:600 }}>+{dayTasks.length-3} autres</div>}
            </div>
          );
        })}
        {Array.from({length:trailing},(_,i)=><div key={`n${i}`} style={{ background:'var(--surface2)',minHeight:90,padding:8,opacity:0.5 }}><div style={{ fontSize:12,color:'var(--text-dim)' }}>{i+1}</div></div>)}
      </div>
      {selected&&<TaskDetailModal task={selected} projectId={projectId} onClose={()=>setSelected(null)} />}
    </div>
  );
}
