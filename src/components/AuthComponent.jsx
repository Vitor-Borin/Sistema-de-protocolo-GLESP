import { useState } from "react"
import { GlespLogo } from "./GlespLogo"
import { Eye, EyeOff, LogIn } from "lucide-react"

export default function AuthComponent({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login
    setTimeout(() => {
      onLogin({
        displayName: "Eduardo Silva",
        email: email || "eduardo@glesp.org.br",
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <GlespLogo className="mx-auto h-16 w-auto mb-6" />
            <h1 className="text-3xl font-bold text-card-foreground mb-2">Sistema de Protocolos</h1>
            <p className="text-muted-foreground">Grande Loja Maçônica do Estado de São Paulo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-card-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-border rounded-xl bg-input focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-card-foreground mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-border rounded-xl bg-input focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:bg-primary/50 transition-all duration-200 hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Sistema desenvolvido para a Grande Loja Maçônica do Estado de São Paulo
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
