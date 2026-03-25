import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Building2, Plus, Search, Pencil, X, Check, Lock, Unlock, Eye, EyeOff } from "lucide-react";

interface OrgWithAccount {
  id: number;
  name: string;
  type: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  userId?: number;
  blocked?: boolean;
}

const ORG_TYPES = [
  { value: "CLINIC",         label: "Clinique" },
  { value: "HOSPITAL",       label: "Hôpital" },
  { value: "LABORATORY",     label: "Laboratoire" },
  { value: "RADIOLOGY",      label: "Radiologie" },
  { value: "DENTAL",         label: "Dentaire" },
  { value: "PARAMEDICAL",    label: "Paramédical" },
  { value: "ADMINISTRATION", label: "Administration" },
  { value: "OTHER",          label: "Autre" },
];

const TYPE_COLORS: Record<string, string> = {
  CLINIC:         "bg-blue-100 text-blue-700",
  HOSPITAL:       "bg-red-100 text-red-700",
  LABORATORY:     "bg-green-100 text-green-700",
  RADIOLOGY:      "bg-purple-100 text-purple-700",
  DENTAL:         "bg-cyan-100 text-cyan-700",
  PARAMEDICAL:    "bg-amber-100 text-amber-700",
  ADMINISTRATION: "bg-orange-100 text-orange-700",
  OTHER:          "bg-gray-100 text-gray-600",
};

const TUNISIAN_CITIES = [
  "Tunis", "Sfax", "Sousse", "Ettadhamen", "Kairouan", "Bizerte",
  "Gabès", "Ariana", "Gafsa", "Monastir", "Ben Arous", "Kasserine",
  "Médenine", "Nabeul", "Tataouine", "Béja", "Jendouba", "El Kef",
  "Mahdia", "Sidi Bouzid", "Siliana", "Zaghouan", "Tozeur", "Kebili",
  "Manouba", "La Marsa", "Hammam-Lif", "Hammam Sousse", "Msaken",
  "Zarzis", "Djerba", "Tabarka", "Hammamet",
];

interface OrgForm {
  name: string; type: string; city: string;
  address: string; phone: string; email: string; password: string;
}
const EMPTY_FORM: OrgForm = {
  name: "", type: "CLINIC", city: "", address: "", phone: "", email: "", password: "",
};

export default function AdminOrganizations() {
  const { token } = useAuth();
  const [orgs, setOrgs] = useState<OrgWithAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<OrgForm>(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [blockingId, setBlockingId] = useState<number | null>(null);

  useEffect(() => { loadOrgs(); }, []);

  async function loadOrgs() {
    setLoading(true);
    try {
      const data = await apiFetch<OrgWithAccount[]>("/admin/organizations/accounts", {}, token);
      setOrgs(data);
    } catch { setOrgs([]); } finally { setLoading(false); }
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Le nom est obligatoire"); return; }
    if (!form.email.trim()) { setError("L'email est obligatoire"); return; }
    if (!form.password || form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères"); return;
    }
    setSaving(true); setError("");
    try {
      await apiFetch("/admin/organizations", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          city: form.city,
          address: form.address,
          phone: form.phone,
          email: form.email,
          password: form.password,
        }),
      }, token);
      await loadOrgs();
      setShowForm(false);
    } catch (e: any) {
      setError(e.message || "Erreur lors de la création");
    } finally { setSaving(false); }
  }

  async function handleToggleBlock(org: OrgWithAccount) {
    if (!org.userId) return;
    setBlockingId(org.id);
    try {
      const res = await apiFetch<{ blocked: boolean }>(
        `/admin/organizations/${org.id}/toggle-block`,
        { method: "PUT" },
        token
      );
      setOrgs(prev => prev.map(o =>
        o.id === org.id ? { ...o, blocked: res.blocked } : o
      ));
    } catch {} finally { setBlockingId(null); }
  }

  const filtered = orgs.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    (o.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter une organisation
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6 border-violet-200 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Nouvelle organisation</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Nom de l'établissement *</Label>
                  <Input
                    placeholder="Clinique El Menzah"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Type d'établissement</Label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  >
                    {ORG_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Ville</Label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={form.city}
                    onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                  >
                    <option value="">-- Sélectionner une ville --</option>
                    {TUNISIAN_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label>Adresse</Label>
                  <Input
                    placeholder="Rue, Quartier"
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Téléphone</Label>
                  <Input
                    placeholder="+216 XX XXX XXX"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Email du compte *</Label>
                  <Input
                    placeholder="contact@clinique.tn"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label>Mot de passe du compte *</Label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="Minimum 6 caractères"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Ces identifiants seront utilisés par l'organisation pour se connecter
                  </p>
                </div>
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex gap-3 mt-5 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
                  {saving ? "Création..." : (
                    <><Check className="w-4 h-4 mr-1" /> Créer</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom ou ville..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune organisation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(org => (
              <Card key={org.id} className={org.blocked ? "opacity-60 border-red-200" : ""}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    org.blocked ? "bg-red-100" : "bg-violet-100"
                  }`}>
                    <Building2 className={`w-5 h-5 ${org.blocked ? "text-red-500" : "text-violet-600"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-semibold text-gray-900">{org.name}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[org.type] ?? TYPE_COLORS.OTHER}`}>
                        {ORG_TYPES.find(t => t.value === org.type)?.label ?? org.type}
                      </span>
                      {org.blocked && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Bloqué
                        </span>
                      )}
                      {!org.blocked && org.userId && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          Actif
                        </span>
                      )}
                      {!org.userId && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          Sans compte
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {[org.city, org.address, org.email].filter(Boolean).join(" · ") || "Pas d'infos supplémentaires"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {org.userId && (
                      <button
                        onClick={() => handleToggleBlock(org)}
                        disabled={blockingId === org.id}
                        title={org.blocked ? "Débloquer le compte" : "Bloquer le compte"}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                          org.blocked
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                        } ${blockingId === org.id ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {org.blocked
                          ? <><Unlock className="w-3 h-3" /> Débloquer</>
                          : <><Lock className="w-3 h-3" /> Bloquer</>
                        }
                      </button>
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
