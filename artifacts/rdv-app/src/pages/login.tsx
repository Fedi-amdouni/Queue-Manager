import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: "ADMIN" | "CLINIC" | "CLIENT";
  organizationId?: number;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      login(res.token, {
        userId: res.userId,
        name: res.name,
        email: res.email,
        role: res.role,
        organizationId: res.organizationId,
      });
      if (res.role === "ADMIN") setLocation("/admin");
      else if (res.role === "CLINIC") setLocation("/clinic");
      else setLocation("/client");
    } catch (err: any) {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">W</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">WaitLess</h1>
          <p className="text-gray-500 mt-2">Gestion intelligente des rendez-vous</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center text-gray-800">Connexion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Pas encore de compte ?{" "}
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); setLocation("/register"); }}
                  className="text-blue-600 font-medium hover:underline"
                >
                  S'inscrire
                </a>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3 font-medium">Comptes de démonstration</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: "Admin", email: "admin@waitless.tn", pass: "admin123", color: "violet" },
                  { role: "Clinique", email: "clinic@waitless.tn", pass: "clinic123", color: "emerald" },
                  { role: "Client", email: "client@waitless.tn", pass: "client123", color: "blue" },
                ].map(d => (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => { setEmail(d.email); setPassword(d.pass); }}
                    className={`text-xs px-2 py-2 rounded-lg border transition-colors text-center
                      ${d.color === 'violet' ? 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100' :
                        d.color === 'emerald' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :
                        'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                  >
                    <span className="font-semibold block">{d.role}</span>
                    <span className="opacity-75 text-[10px]">Remplir</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
