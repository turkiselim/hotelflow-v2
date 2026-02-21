import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api, { usersAPI } from '../api/client';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/ui/Avatar';
import InviteModal from '../components/members/InviteModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import { useToast } from '../lib/toast';
import { PRIORITY_CONFIG, STATUS_CONFIG, isOverdue, formatDate } from '../lib/constants';

// ── Modale profil membre ──────────────────────────────────
function MemberProfileModal({ memberId, onClose, isAdmin, currentUserId }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState('tasks'); // tasks | projects | info

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', memberId],
    queryFn: () => api.get(`/users/${memberId}`).then(r => r.data),
  });

  const changeRole = useMutation({
    mutationFn: (role) => api.patch(`/users/${memberId}/role`, { role }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['member', memberId] });
      toast(`✅ Rôle mis à jour : ${res.data.role}`);
    },
    onError: (e) => toast(e.response?.data?.error || 'Erreur', 'error'),
  });

  const deleteMember = useMutation({
    mutationFn: () => api.delete(`/users/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast('🗑️ Membre supprimé');
      onClose();
    },
    onError: (e) => toast(e.response?.data?.error || 'Erreur', 'error'),
  });

  const tasks = member?.assignedTasks || [];
  const doneTasks = tasks.filter(t => t.status === 'DONE');
  const activeTasks = tasks.filter(t => t.status !== 'DONE');
  const overdueTasks = tasks.filter(t => isOverdue(t.dueDate, t.status));

  const ROLES_CONFIG = {
    ADMIN:           { label: 'Administrateur', icon: '👑', color: '#b8860b', bg: '#f5f0e0' },
    PROJECT_MANAGER: { label: 'Chef de projet',  icon: '🎯', color: '#2c5f8a', bg: '#e8f0f7' },
    MEMBER:          { label: 'Membre',          icon: '👤', color: '#7a7670', bg: '#f3f2ef' },
  };

  const role = ROLES_CONFIG[member?.role] || ROLES_CONFIG.MEMBER;
  const isMe = memberId === currentUserId;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{ background:'var(--surface)', borderRadius:18, border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)', width:700, maxWidth:'95vw', maxHeight:'92vh', display:'flex', flexDirection:'column', overflow:'hidden' }} className="animate-slideIn">

        {isLoading ? (
          <div style={{ padding:60, textAlign:'center', color:'var(--text-dim)' }}>Chargement...</div>
        ) : (
          <>
            {/* ── Header ── */}
            <div style={{ padding:'24px 24px 0', background:'linear-gradient(135deg, var(--dark) 0%, var(--dark2) 100%)', borderRadius:'18px 18px 0 0' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:16, paddingBottom:20 }}>
                <Avatar name={member.name} size="xl" online={member.isOnline} />
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:600, color:'#fff' }}>{member.name}</h2>
                    {isMe && <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:600 }}>(vous)</span>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:13, padding:'3px 10px', borderRadius:20, background:role.bg, color:role.color, fontWeight:700 }}>{role.icon} {role.label}</span>
                    <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>✉️ {member.email}</span>
                  </div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>
                    Membre depuis {new Date(member.createdAt).toLocaleDateString('fr-FR', { month:'long', year:'numeric' })}
                  </div>
                </div>
                <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', color:'#fff', fontSize:16 }}>×</button>
              </div>

              {/* KPIs */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'rgba(255,255,255,0.05)', borderRadius:10, overflow:'hidden', marginBottom:0 }}>
                {[
                  { label:'Tâches actives', value:activeTasks.length, color:'#2c5f8a' },
                  { label:'Terminées',      value:doneTasks.length,   color:'#27694a' },
                  { label:'En retard',      value:overdueTasks.length,color:overdueTasks.length>0?'#c0392b':'#27694a' },
                  { label:'Projets',        value:member.memberProjects?.length||0, color:'#b8860b' },
                ].map((k,i) => (
                  <div key={i} style={{ padding:'12px 16px', background:'rgba(255,255,255,0.03)', textAlign:'center' }}>
                    <div style={{ fontSize:22, fontWeight:700, color:k.color, fontFamily:"'Playfair Display',serif" }}>{k.value}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{k.label}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display:'flex', gap:0, marginTop:16 }}>
                {[['tasks','📋 Tâches'],['projects','📂 Projets'],['info','⚙️ Gestion']].map(([k,l]) => (
                  <button key={k} onClick={() => setTab(k)} style={{ padding:'10px 18px', border:'none', background:'transparent', cursor:'pointer', fontSize:13, fontWeight:600, color: tab===k?'#d4a017':'rgba(255,255,255,0.4)', borderBottom: tab===k?'2px solid #d4a017':'2px solid transparent', transition:'all 0.15s', fontFamily:'inherit' }}>{l}</button>
                ))}
              </div>
            </div>

            {/* ── Body ── */}
            <div style={{ flex:1, overflowY:'auto', padding:20 }}>

              {/* TAB: Tâches */}
              {tab === 'tasks' && (
                <div>
                  {/* Filter bar */}
                  <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                    {[
                      { label:`Toutes (${tasks.length})`,      filter: ()=>tasks },
                      { label:`Actives (${activeTasks.length})`, filter: ()=>activeTasks },
                      { label:`En retard (${overdueTasks.length})`, filter: ()=>overdueTasks, red: overdueTasks.length>0 },
                      { label:`Terminées (${doneTasks.length})`, filter: ()=>doneTasks },
                    ].map((btn, i) => (
                      <span key={i} style={{ fontSize:12, padding:'4px 10px', borderRadius:20, background: btn.red?'var(--red-light)':'var(--surface2)', color: btn.red?'var(--red)':'var(--text-muted)', fontWeight:600 }}>{btn.label}</span>
                    ))}
                  </div>

                  {tasks.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-dim)' }}>
                      <div style={{ fontSize:36, marginBottom:8 }}>📭</div>
                      Aucune tâche assignée
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {tasks.map(t => {
                        const p = PRIORITY_CONFIG[t.priority]||PRIORITY_CONFIG.NORMAL;
                        const s = STATUS_CONFIG[t.status]||STATUS_CONFIG.TODO;
                        const over = isOverdue(t.dueDate, t.status);
                        return (
                          <div key={t.id} onClick={() => setSelectedTask(t)} style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 120px', alignItems:'center', padding:'10px 14px', borderRadius:10, background:'var(--surface2)', border:`1px solid ${over?'rgba(192,57,43,0.3)':'var(--border)'}`, cursor:'pointer', transition:'all 0.15s', gap:12 }}
                            onMouseEnter={e=>{e.currentTarget.style.background='var(--gold-light)';e.currentTarget.style.borderColor='var(--gold-bright)'}}
                            onMouseLeave={e=>{e.currentTarget.style.background='var(--surface2)';e.currentTarget.style.borderColor=over?'rgba(192,57,43,0.3)':'var(--border)'}}>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>{t.title}</div>
                              <div style={{ fontSize:11, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6 }}>
                                <div style={{ width:7, height:7, borderRadius:'50%', background:t.project?.color||'var(--gold)' }} />
                                {t.project?.name}
                              </div>
                            </div>
                            <span className="pill" style={{ background:s.bg, color:s.color, fontSize:11 }}>{s.label}</span>
                            <span className="pill" style={{ background:p.bg, color:p.color, fontSize:11 }}>{p.label}</span>
                            <span style={{ fontSize:11, color:over?'var(--red)':'var(--text-muted)', fontWeight:over?700:400, textAlign:'right' }}>
                              {over?'⚠ ':''}{formatDate(t.dueDate)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Projets */}
              {tab === 'projects' && (
                <div>
                  {(member.memberProjects?.length||0) === 0 ? (
                    <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-dim)' }}>
                      <div style={{ fontSize:36, marginBottom:8 }}>📂</div>
                      Aucun projet assigné
                    </div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      {member.memberProjects.map(p => (
                        <div key={p.id} onClick={() => { navigate(`/projet/${p.id}`); onClose(); }} style={{ padding:'14px 16px', borderRadius:12, background:'var(--surface2)', border:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', gap:12, transition:'all 0.15s' }}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold-bright)';e.currentTarget.style.background='var(--gold-light)'}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--surface2)'}}>
                          <div style={{ width:36, height:36, borderRadius:10, background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>📂</div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600 }}>{p.name}</div>
                            <div style={{ fontSize:11, color:'var(--text-muted)' }}>Voir le projet →</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Gestion (admin only) */}
              {tab === 'info' && (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {/* Infos */}
                  <div className="card" style={{ padding:16 }}>
                    <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color:'var(--text-muted)', marginBottom:12 }}>Informations</div>
                    {[
                      { label:'Nom complet', value:member.name },
                      { label:'Email', value:member.email },
                      { label:'Rôle actuel', value:`${role.icon} ${role.label}` },
                      { label:'Membre depuis', value:new Date(member.createdAt).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }) },
                    ].map((row,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                        <span style={{ fontSize:13, color:'var(--text-muted)' }}>{row.label}</span>
                        <span style={{ fontSize:13, fontWeight:600 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {isAdmin && !isMe && (
                    <>
                      {/* Changer rôle */}
                      <div className="card" style={{ padding:16 }}>
                        <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color:'var(--text-muted)', marginBottom:12 }}>Changer le rôle</div>
                        <div style={{ display:'flex', gap:8 }}>
                          {[['MEMBER','👤 Membre'],['PROJECT_MANAGER','🎯 Chef de projet'],['ADMIN','👑 Admin']].map(([r,l]) => (
                            <button key={r} onClick={() => changeRole.mutate(r)} disabled={member.role===r||changeRole.isPending} style={{ flex:1, padding:'10px', borderRadius:9, border:`1.5px solid ${member.role===r?'var(--gold-bright)':'var(--border)'}`, background:member.role===r?'var(--gold-light)':'var(--surface)', color:member.role===r?'var(--gold)':'var(--text-muted)', fontFamily:'inherit', fontWeight:600, fontSize:12, cursor:member.role===r?'default':'pointer', transition:'all 0.15s' }}>
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Supprimer */}
                      <div className="card" style={{ padding:16, border:'1px solid rgba(192,57,43,0.25)', background:'var(--red-light)' }}>
                        <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color:'var(--red)', marginBottom:8 }}>⚠️ Zone dangereuse</div>
                        <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:12 }}>
                          La suppression du membre est irréversible. Ses tâches resteront dans les projets mais sans assignation.
                        </div>
                        {!confirmDelete ? (
                          <button onClick={() => setConfirmDelete(true)} style={{ padding:'10px 16px', borderRadius:9, background:'transparent', border:'1.5px solid var(--red)', color:'var(--red)', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                            🗑️ Supprimer {member.name}
                          </button>
                        ) : (
                          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                            <span style={{ fontSize:13, color:'var(--red)', fontWeight:600 }}>Confirmer la suppression ?</span>
                            <button onClick={() => deleteMember.mutate()} disabled={deleteMember.isPending} style={{ padding:'8px 16px', borderRadius:9, background:'var(--red)', border:'none', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                              {deleteMember.isPending ? '...' : 'Oui, supprimer'}
                            </button>
                            <button onClick={() => setConfirmDelete(false)} style={{ padding:'8px 14px', borderRadius:9, background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', fontFamily:'inherit', fontSize:13, cursor:'pointer' }}>
                              Annuler
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {(!isAdmin || isMe) && (
                    <div style={{ padding:16, borderRadius:12, background:'var(--surface2)', border:'1px solid var(--border)', fontSize:13, color:'var(--text-muted)', textAlign:'center' }}>
                      Seul un administrateur peut modifier les rôles et supprimer des membres.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal task={selectedTask} projectId={selectedTask.project?.id} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}

// ── Page principale Membres ───────────────────────────────
export default function MembersPage() {
  const { user } = useAuthStore();
  const [showInvite, setShowInvite] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [search, setSearch] = useState('');
  const isAdmin = user?.role === 'ADMIN';

  const { data: team = [], isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => api.get('/users/team').then(r => r.data),
  });

  const filtered = team.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const ROLES_CONFIG = {
    ADMIN:           { label:'Administrateur', icon:'👑', color:'#b8860b', bg:'#f5f0e0' },
    PROJECT_MANAGER: { label:'Chef de projet',  icon:'🎯', color:'#2c5f8a', bg:'#e8f0f7' },
    MEMBER:          { label:'Membre',          icon:'👤', color:'#7a7670', bg:'#f3f2ef' },
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Topbar */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 24px', height:58, minHeight:58, background:'var(--surface)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:600, flex:1 }}>Équipe & Membres</div>
        <span style={{ fontSize:13, color:'var(--text-muted)' }}>{team.length} membres</span>
        {isAdmin && (
          <button className="btn btn-gold" onClick={() => setShowInvite(true)}>✉️ Inviter un membre</button>
        )}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:24 }}>
        {/* Recherche */}
        <div style={{ marginBottom:20 }}>
          <input placeholder="🔍 Rechercher un membre..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding:'10px 16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, fontSize:13, outline:'none', width:300, fontFamily:'inherit' }} />
        </div>

        {/* Grille */}
        {isLoading ? (
          <div style={{ textAlign:'center', padding:60, color:'var(--text-dim)' }}>Chargement...</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
            {filtered.map((m, idx) => {
              const role = ROLES_CONFIG[m.role] || ROLES_CONFIG.MEMBER;
              const isMe = m.id === user?.id;
              const totalTasks = m._count?.assignedTasks || 0;
              return (
                <div key={m.id} className={`card animate-fadeUp stagger-${Math.min(idx+1,5)}`} style={{ padding:20, transition:'all 0.15s', cursor:'pointer', position:'relative', overflow:'hidden' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold-bright)';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='var(--shadow)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='var(--shadow-sm)'}}>

                  {/* Bande rôle */}
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:role.color }} />

                  {/* Header */}
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                    <Avatar name={m.name} size="lg" online={m.isOnline} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:15, fontWeight:700, marginBottom:3, display:'flex', alignItems:'center', gap:6 }}>
                        {m.name}
                        {isMe && <span style={{ fontSize:10, color:'var(--gold)', fontWeight:700 }}>VOUS</span>}
                      </div>
                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:role.bg, color:role.color, fontWeight:700 }}>{role.icon} {role.label}</span>
                    </div>
                    <div style={{ width:9, height:9, borderRadius:'50%', background:m.isOnline?'var(--green)':'var(--border)', flexShrink:0 }} title={m.isOnline?'En ligne':'Hors ligne'} />
                  </div>

                  {/* Email */}
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>✉️ {m.email}</div>

                  {/* Stats */}
                  <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                    <div style={{ flex:1, padding:'8px', borderRadius:8, background:'var(--surface2)', textAlign:'center' }}>
                      <div style={{ fontSize:18, fontWeight:700, color:'var(--accent)' }}>{totalTasks}</div>
                      <div style={{ fontSize:10, color:'var(--text-dim)', fontWeight:600, textTransform:'uppercase' }}>Tâches</div>
                    </div>
                    <div style={{ flex:1, padding:'8px', borderRadius:8, background:'var(--surface2)', textAlign:'center' }}>
                      <div style={{ fontSize:18, fontWeight:700, color:'var(--text-muted)' }}>{m._count?.comments||0}</div>
                      <div style={{ fontSize:10, color:'var(--text-dim)', fontWeight:600, textTransform:'uppercase' }}>Commentaires</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => setSelectedMember(m.id)} className="btn btn-outline btn-sm" style={{ flex:1, justifyContent:'center' }}>
                      👁 Voir le profil
                    </button>
                    {isAdmin && !isMe && (
                      <button onClick={() => { setSelectedMember(m.id); }} className="btn btn-outline btn-sm" style={{ padding:'5px 10px' }} title="Gérer">
                        ⚙️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Carte invitation */}
            {isAdmin && (
              <div onClick={() => setShowInvite(true)} className="card animate-fadeUp" style={{ padding:20, borderStyle:'dashed', borderColor:'var(--gold-bright)', background:'var(--gold-light)', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:200, transition:'all 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ fontSize:36, marginBottom:10 }}>✉️</div>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--gold)', marginBottom:4 }}>Inviter un collaborateur</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', textAlign:'center' }}>Envoyez une invitation par email</div>
              </div>
            )}

            {filtered.length === 0 && search && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40, color:'var(--text-dim)' }}>
                Aucun membre pour "{search}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      {selectedMember && (
        <MemberProfileModal
          memberId={selectedMember}
          onClose={() => setSelectedMember(null)}
          isAdmin={isAdmin}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}
