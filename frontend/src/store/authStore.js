import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => set({ user, token }),

      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData },
      })),

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('neuro-auth');
      },

      isAuthenticated: () => !!get().token,

      isPremium: () => {
        const plan = get().user?.subscription?.plan;
        return plan === 'premium' || plan === 'enterprise';
      },

      hasNeuroProfile: () => !!get().user?.neuroProfile?.brainType,
    }),
    {
      name: 'neuro-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
