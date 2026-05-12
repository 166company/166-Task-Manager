import { useUIStore } from '../store/uiStore'

export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useUIStore()
  return { theme, setTheme, toggleTheme }
}
