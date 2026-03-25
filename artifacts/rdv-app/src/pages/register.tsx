import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserRole = "ADMIN" | "CLINIC" | "CLIENT";

interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: number;
}

const ROLES: { value: UserRole; label: string; desc: string; color: string }[] = [
  { value: "CLIENT", label: "Patient / Client", desc: "Prendre des rendez-vous", color: "blue" },
  { value: "CLINIC", label: "Clinique / Cabinet", desc: "Gérer patients et file", color: "emerald" },
  { value: "ADMIN", label: "Administrateur", desc: "Gérer la plateforme", color: "violet" },
];

export default function RegisterPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("CLIENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
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
      setError(err.message || "Erreur lors de l'inscription.");
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
          <p className="text-gray-500 mt-2">Créez votre compte</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center text-gray-800">Inscription</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Type de compte</Label>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        role === r.value
                          ? r.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                            r.color === 'emerald' ? 'border-emerald-500 bg-emerald-50' :
                            'border-violet-500 bg-violet-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`font-semibold text-sm ${
                        role === r.value ?
                          r.color === 'blue' ? 'text-blue-700' :
                          r.color === 'emerald' ? 'text-emerald-700' :
                          'text-violet-700'
                        : 'text-gray-700'
                      }`}>{r.label}</span>
                      <span className="text-xs text-gray-500 block">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" placeholder="Prénom Nom" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" placeholder="Min. 6 caractères" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création..." : "Créer mon compte"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Déjà un compte ?{" "}
                <a href="#" onClick={e => { e.preventDefault(); setLocation("/login"); }} className="text-blue-600 font-medium hover:underline">
                  Se connecter
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
