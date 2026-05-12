import { create } from 'zustand'
import { authService } from '../services/authService'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  initAuth: () => {
    authService.getSession().then(session => {
      if (session?.user) {
        set({ user: session.user, loading: false })
        authService.getProfile(session.user.id).then(profile => set({ profile }))
      } else {
        set({ loading: false })
      }
    })

    authService.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ user: session.user })
        authService.getProfile(session.user.id).then(profile => set({ profile }))
      } else {
        set({ user: null, profile: null })
      }
    })
  },

  signUp: async (email, password, fullName) => {
    const data = await authService.signUp(email, password, fullName)
    return data
  },

  signIn: async (email, password) => {
    const data = await authService.signIn(email, password)
    set({ user: data.user })
    return data
  },

  signInWithGoogle: () => authService.signInWithGoogle(),
  signInWithGitHub: () => authService.signInWithGitHub(),

  signOut: async () => {
    await authService.signOut()
    set({ user: null, profile: null })
  },

  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return
    const profile = await authService.updateProfile(user.id, updates)
    set({ profile })
    return profile
  },
}))
