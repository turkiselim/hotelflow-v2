import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../lib/toast';
import api from '../api/client';
import Avatar from '../components/ui/Avatar';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();

  // État pour modification du profil
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  
  // État pour changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const ROLES = {
    ADMIN: { label: 'Administrateur', icon: '👑', color: '#b8860b', bg: '#f5f0e0' },
    PROJECT_MANAGER: { label: 'Chef de projet', icon: '🎯', color: '#2c5f8a', bg: '#e8f0f7' },
    MEMBER: { label: 'Membre', icon: '👤', color: '#7a7670', bg: '#f3f2ef' },
  };

  const role = ROLES[user?.role] || ROLES.MEMBER;

  // Mutation pour mettre à jour le profil
  const updateProfile = useMutation({
    mutationFn: (data) => api.patch('/users/me', data),
    onSuccess: (res) => {
      updateUser(res.data);
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast('✅ Profil mis à jour !');
    },
    onError: () => toast('❌ Erreur lors de la mise à jour', 'error'),
  });

  // Mutation pour changer le mot de passe
  const changePassword = useMutation({
    mutationFn: (data) => api.patch('/users/me/password', data),
    onSuccess: () => {
      toast('🔑 Mot de passe modifié avec succès !');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (e) => {
      toast(e.response?.data?.error || '❌ Erreur lors du changement', 'error');
    },
  });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast('⚠️ Les mots de passe ne correspondent pas', 'warning');
    }
    
    if (passwordForm.newPassword.length < 6) {
      return toast('⚠️ Le mot de passe doit contenir au moins 6 caractères', 'warning');
    }

    changePassword.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', height: 58, minHeight: 58, background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 600 }}>Paramètres</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Section Profil */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              👤 Informations du profil
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, padding: 20, background: 'var(--surface2)', borderRadius: 12 }}>
              <Avatar name={user?.name} size="xl" online={user?.isOnline} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{user?.name}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>{user?.email}</div>
                <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: role.bg, color: role.color, fontWeight: 700 }}>
                  {role.icon} {role.label}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Nom complet</label>
              <input
                className="form-input"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ name: e.target.value })}
                placeholder="Votre nom"
              />
            </div>

            <button
              className="btn btn-gold"
              disabled={updateProfile.isPending || profileForm.name === user?.name}
              onClick={() => updateProfile.mutate(profileForm)}
            >
              {updateProfile.isPending ? 'Enregistrement...' : '✓ Enregistrer les modifications'}
            </button>
          </div>

          {/* Section Mot de passe */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              🔑 Changer le mot de passe
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Pour votre sécurité, utilisez un mot de passe fort d'au moins 6 caractères.
            </p>

            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Mot de passe actuel</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Entrez votre mot de passe actuel"
                  required
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Nouveau mot de passe</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Minimum 6 caractères"
                  required
                  minLength={6}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Retapez le nouveau mot de passe"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-gold"
                disabled={changePassword.isPending || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                {changePassword.isPending ? 'Modification...' : '🔑 Changer le mot de passe'}
              </button>
            </form>
          </div>

          {/* Section Compte */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              ℹ️ Informations du compte
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Adresse email</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.email}</div>

              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Rôle</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{role.icon} {role.label}</div>

              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Membre depuis</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}