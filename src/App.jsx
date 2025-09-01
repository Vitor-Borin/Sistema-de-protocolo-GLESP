"use client"

import { useState } from "react"
import AuthComponent from "./components/AuthComponent"
import Dashboard from "./components/Dashboard"
import { Loader } from "lucide-react"

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader className="animate-spin h-12 w-12 text-primary" />
      </div>
    )
  }

  return user ? <Dashboard user={user} onLogout={handleLogout} /> : <AuthComponent onLogin={handleLogin} />
}