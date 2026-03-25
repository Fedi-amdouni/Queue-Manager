import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Users, Search } from "lucide-react";

interface User {
  id: number; name: string; email: string; role: string;
  organizationId?: number; createdAt?: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-violet-100 text-violet-700",
  CLINIC: "bg-emerald-100 text-emerald-700",
  CLIENT: "bg-blue-100 text-blue-700",
};
const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur", CLINIC: "Clinique", CLIENT: "Patient",
};

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch<User[]>("/admin/users", {}, token)
      .then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <div className="text-sm text-gray-500">{users.length} compte(s)</div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(user => (
              <Card key={user.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${ROLE_COLORS[user.role] ?? "bg-gray-100"}`}>
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                    {user.organizationId && (
                      <span className="text-xs text-gray-400">Org #{user.organizationId}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
