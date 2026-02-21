// src/lib/constants.js

export const STATUS_CONFIG = {
  TODO:        { label: 'À faire',     color: '#7a7670', bg: '#f3f2ef' },
  IN_PROGRESS: { label: 'En cours',    color: '#2c5f8a', bg: '#e8f0f7' },
  IN_REVIEW:   { label: 'En révision', color: '#c45e1a', bg: '#fdf2e8' },
  DONE:        { label: 'Terminé',     color: '#27694a', bg: '#e8f5ee' },
};

export const PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', color: '#c0392b', bg: '#fdf0ee', icon: '🔴' },
  HIGH:   { label: 'Haute',  color: '#c45e1a', bg: '#fdf2e8', icon: '🟠' },
  NORMAL: { label: 'Normale',color: '#2c5f8a', bg: '#e8f0f7', icon: '🔵' },
  LOW:    { label: 'Faible', color: '#27694a', bg: '#e8f5ee', icon: '🟢' },
};

export const DEPT_COLORS = {
  Direction:   { bg: '#f5f0e0', color: '#b8860b' },
  'F&B':       { bg: '#e8f5ee', color: '#27694a' },
  Hébergement: { bg: '#e8f0f7', color: '#2c5f8a' },
  Commercial:  { bg: '#f2ecfa', color: '#6b3fa0' },
  RH:          { bg: '#fdf2e8', color: '#c45e1a' },
  Technique:   { bg: '#e8f5f5', color: '#1a7a8a' },
  Marketing:   { bg: '#fdf0ee', color: '#c0392b' },
};

export const PROJECT_COLORS = [
  '#2c5f8a', '#27694a', '#6b3fa0', '#c45e1a',
  '#c0392b', '#d4a017', '#1a7a8a', '#7a6518',
];

export const TAG_COLORS = {
  'F&B':       '#27694a',
  Achats:      '#2c5f8a',
  Commercial:  '#6b3fa0',
  RH:          '#c45e1a',
  Technique:   '#1a7a8a',
  Digital:     '#6b3fa0',
  Sécurité:    '#c0392b',
  Direction:   '#b8860b',
  Marketing:   '#c45e1a',
  Travaux:     '#7a6518',
  Design:      '#6b3fa0',
  Dev:         '#27694a',
  Bug:         '#c0392b',
};

export const ROLES = [
  { value: 'ADMIN',           label: 'Administrateur', icon: '👑' },
  { value: 'PROJECT_MANAGER', label: 'Chef de projet',  icon: '🎯' },
  { value: 'MEMBER',          label: 'Membre',          icon: '👤' },
];

export const DEPARTMENTS = [
  'Direction', 'F&B', 'Hébergement', 'Commercial', 'RH', 'Technique', 'Marketing',
];

export const TAGS = [
  'F&B', 'Achats', 'Commercial', 'RH', 'Technique', 'Digital',
  'Sécurité', 'Direction', 'Marketing', 'Travaux', 'Design', 'Dev', 'Bug',
];

// Format a date string to French readable format
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function isOverdue(dateStr, status) {
  if (!dateStr || status === 'DONE') return false;
  return new Date(dateStr) < new Date();
}

// Generate avatar initials from name
export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Generate a consistent color from a string
export function stringToColor(str) {
  const colors = [
    { bg: '#e8f0f7', color: '#2c5f8a' },
    { bg: '#e8f5ee', color: '#27694a' },
    { bg: '#f2ecfa', color: '#6b3fa0' },
    { bg: '#fdf2e8', color: '#c45e1a' },
    { bg: '#fdf0ee', color: '#c0392b' },
    { bg: '#f5f0e0', color: '#b8860b' },
    { bg: '#e8f5f5', color: '#1a7a8a' },
  ];
  if (!str) return colors[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
