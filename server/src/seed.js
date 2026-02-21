const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...\n');
  const password = await bcrypt.hash('password123', 12);

  // ── Utilisateurs ──
  const alex   = await prisma.user.upsert({ where:{ email:'alex@teamflow.dev'   }, update:{}, create:{ name:'Alex Martin',    email:'alex@teamflow.dev',   password, role:'ADMIN'           } });
  const sophie = await prisma.user.upsert({ where:{ email:'sophie@teamflow.dev' }, update:{}, create:{ name:'Sophie Laurent',  email:'sophie@teamflow.dev', password, role:'PROJECT_MANAGER' } });
  const thomas = await prisma.user.upsert({ where:{ email:'thomas@teamflow.dev' }, update:{}, create:{ name:'Thomas Durand',   email:'thomas@teamflow.dev', password, role:'MEMBER'          } });
  const lucas  = await prisma.user.upsert({ where:{ email:'lucas@teamflow.dev'  }, update:{}, create:{ name:'Lucas Martin',   email:'lucas@teamflow.dev',  password, role:'MEMBER'          } });
  const karim  = await prisma.user.upsert({ where:{ email:'karim@teamflow.dev'  }, update:{}, create:{ name:'Karim Ayari',    email:'karim@teamflow.dev',  password, role:'MEMBER'          } });
  console.log('✅ Utilisateurs créés');

  // ── Projet 1 : Refonte Site Web ──
  const p1 = await prisma.project.upsert({
    where:{ id:'proj-site-web' }, update:{},
    create:{ id:'proj-site-web', name:'Refonte Site Web', description:'Refonte complète du site avec nouveau design', color:'#6c63ff', owner:{ connect:{ id:alex.id } }, members:{ connect:[{ id:sophie.id },{ id:thomas.id },{ id:lucas.id }] } }
  });

  // ── Projet 2 : Rénovation Lobby ──
  const p2 = await prisma.project.upsert({
    where:{ id:'proj-lobby' }, update:{},
    create:{ id:'proj-lobby', name:'Rénovation Lobby', description:'Travaux de rénovation complets du lobby principal', color:'#2c5f8a', owner:{ connect:{ id:alex.id } }, members:{ connect:[{ id:karim.id },{ id:thomas.id }] } }
  });

  // ── Projet 3 : Saison Été 2025 ──
  const p3 = await prisma.project.upsert({
    where:{ id:'proj-ete' }, update:{},
    create:{ id:'proj-ete', name:'Saison Été 2025', description:'Préparation de la saison haute', color:'#27694a', owner:{ connect:{ id:alex.id } }, members:{ connect:[{ id:sophie.id },{ id:karim.id },{ id:lucas.id }] } }
  });

  console.log('✅ Projets créés');

  // ── Tâches projet 1 (Refonte Site Web) ──
  await prisma.task.createMany({ skipDuplicates:true, data:[
    { title:'Maquette page d\'accueil',           status:'DONE',        priority:'NORMAL', tag:'Design', department:'Commercial', projectId:p1.id, progress:100, startDate:new Date('2025-01-05'), dueDate:new Date('2025-01-20') },
    { title:'Développer l\'API authentification', status:'IN_PROGRESS', priority:'URGENT', tag:'Dev',    department:'Technique',  projectId:p1.id, progress:65,  startDate:new Date('2025-01-15'), dueDate:new Date('2025-02-18') },
    { title:'Corriger le bug du panier mobile',   status:'TODO',        priority:'HIGH',   tag:'Bug',    department:'Technique',  projectId:p1.id, progress:0,   startDate:new Date('2025-02-10'), dueDate:new Date('2025-02-25') },
    { title:'Optimiser les images (WebP)',         status:'IN_REVIEW',   priority:'LOW',    tag:'Dev',    department:'Technique',  projectId:p1.id, progress:90,  startDate:new Date('2025-01-20'), dueDate:new Date('2025-02-15') },
    { title:'Définir l\'architecture technique',  status:'DONE',        priority:'NORMAL', tag:'Dev',    department:'Direction',  projectId:p1.id, progress:100, startDate:new Date('2025-01-01'), dueDate:new Date('2025-01-10') },
    { title:'Mise en ligne du nouveau site',       status:'TODO',        priority:'URGENT', tag:'Dev',    department:'Commercial', projectId:p1.id, progress:0,   startDate:new Date('2025-02-20'), dueDate:new Date('2025-03-05') },
    { title:'Tests de performance et SEO',         status:'TODO',        priority:'NORMAL', tag:'Dev',    department:'Commercial', projectId:p1.id, progress:0,   startDate:new Date('2025-02-25'), dueDate:new Date('2025-03-10') },
    { title:'Rédaction des contenus',             status:'IN_PROGRESS', priority:'NORMAL', tag:'Design', department:'Commercial', projectId:p1.id, progress:40,  startDate:new Date('2025-01-25'), dueDate:new Date('2025-02-20') },
  ]});

  // ── Tâches projet 2 (Rénovation Lobby) ──
  await prisma.task.createMany({ skipDuplicates:true, data:[
    { title:'Devis architecte et maître d\'œuvre', status:'DONE',        priority:'URGENT', tag:'Travaux',  department:'Direction',  projectId:p2.id, progress:100, startDate:new Date('2025-01-02'), dueDate:new Date('2025-01-15') },
    { title:'Sélection des matériaux et mobilier', status:'IN_REVIEW',   priority:'HIGH',   tag:'Achats',   department:'Hébergement',projectId:p2.id, progress:80,  startDate:new Date('2025-01-10'), dueDate:new Date('2025-02-05') },
    { title:'Travaux peinture et revêtements',     status:'IN_PROGRESS', priority:'URGENT', tag:'Travaux',  department:'Technique',  projectId:p2.id, progress:55,  startDate:new Date('2025-01-20'), dueDate:new Date('2025-03-15') },
    { title:'Installation éclairage LED',          status:'TODO',        priority:'NORMAL', tag:'Technique',department:'Technique',  projectId:p2.id, progress:0,   startDate:new Date('2025-03-01'), dueDate:new Date('2025-03-20') },
    { title:'Mobilier réception sur mesure',       status:'TODO',        priority:'HIGH',   tag:'Achats',   department:'Hébergement',projectId:p2.id, progress:0,   startDate:new Date('2025-02-15'), dueDate:new Date('2025-03-10') },
    { title:'Audit sécurité incendie',             status:'DONE',        priority:'URGENT', tag:'Sécurité', department:'Technique',  projectId:p2.id, progress:100, startDate:new Date('2025-01-05'), dueDate:new Date('2025-01-12') },
  ]});

  // ── Tâches projet 3 (Saison Été 2025) ──
  await prisma.task.createMany({ skipDuplicates:true, data:[
    { title:'Révision tarifs saison haute',         status:'IN_PROGRESS', priority:'HIGH',   tag:'Commercial',department:'Commercial', projectId:p3.id, progress:60,  startDate:new Date('2025-01-15'), dueDate:new Date('2025-02-15') },
    { title:'Recrutement équipe saisonnière',       status:'TODO',        priority:'URGENT', tag:'RH',       department:'RH',          projectId:p3.id, progress:0,   startDate:new Date('2025-02-01'), dueDate:new Date('2025-03-01') },
    { title:'Refonte carte restaurant panorama',    status:'TODO',        priority:'NORMAL', tag:'F&B',      department:'F&B',          projectId:p3.id, progress:0,   startDate:new Date('2025-02-16'), dueDate:new Date('2025-03-10') },
    { title:'Plan de communication printemps',     status:'TODO',        priority:'NORMAL', tag:'Marketing',department:'Commercial', projectId:p3.id, progress:0,   startDate:new Date('2025-02-18'), dueDate:new Date('2025-03-01') },
    { title:'Rapport mensuel F&B Janvier',          status:'IN_PROGRESS', priority:'URGENT', tag:'F&B',      department:'F&B',          projectId:p3.id, progress:45,  startDate:new Date('2025-02-01'), dueDate:new Date('2025-02-14') },
    { title:'Formation accueil nouvelle équipe',    status:'TODO',        priority:'NORMAL', tag:'RH',       department:'RH',          projectId:p3.id, progress:0,   startDate:new Date('2025-03-01'), dueDate:new Date('2025-03-15') },
    { title:'Mise à jour système de réservation',  status:'IN_PROGRESS', priority:'HIGH',   tag:'Digital',  department:'Technique',  projectId:p3.id, progress:35,  startDate:new Date('2025-01-20'), dueDate:new Date('2025-02-28') },
  ]});

  console.log('✅ Tâches créées');

  // ── Assigner les tâches ──
  const allTasks = await prisma.task.findMany({ where:{ projectId:{ in:[p1.id,p2.id,p3.id] } } });
  const assignments = [
    [0, alex.id], [1, thomas.id], [2, thomas.id], [3, sophie.id], [4, alex.id], [5, lucas.id], [6, lucas.id], [7, sophie.id],
    [8, karim.id], [9, sophie.id], [10, thomas.id], [11, karim.id], [12, thomas.id], [13, karim.id],
    [14, sophie.id], [15, karim.id], [16, thomas.id], [17, sophie.id], [18, karim.id], [19, lucas.id], [20, karim.id],
  ];
  for (const [i, userId] of assignments) {
    if (allTasks[i]) {
      await prisma.task.update({ where:{ id:allTasks[i].id }, data:{ assignees:{ connect:[{ id:userId }] } } });
    }
  }
  console.log('✅ Assignations créées');

  console.log('\n🎉 Seed terminé !');
  console.log('   alex@teamflow.dev    / password123 (Admin 👑)');
  console.log('   sophie@teamflow.dev  / password123');
  console.log('   thomas@teamflow.dev  / password123');
  console.log('   karim@teamflow.dev   / password123');
  console.log('   lucas@teamflow.dev   / password123\n');
}

main()
  .catch(e => { console.error('❌ Erreur seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
