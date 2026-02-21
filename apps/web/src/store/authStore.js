import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    set => ({
      user:       null,
      token:      null,
      login:      (user, token) => set({ user, token }),
      logout:     () => set({ user: null, token: null }),
      updateUser: u  => set(s => ({ user: { ...s.user, ...u } })),
    }),
    { name: 'hotelflow-auth' }
  )
);
