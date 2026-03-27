import { Outlet } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from "@/components/theme-provider"
function App() {
  return <ThemeProvider>
    <Outlet />
  </ThemeProvider>
}

export default App
