import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Building2, Plus, Search, Pencil, Trash2, X, Check } from "lucide-react";

interface Organization {
  id: number; name: string; orgType: string; city?: string;
  address?: string; phone?: string; email?: string; isActive: boolean;
}

const ORG_TYPES = [
  { value: "CLINIC", label: "Clinique" }, { value: "HOSPITAL", label: "Hôpital" },
  { value: "LAB", label: "Laboratoire" }, { value: "RADIOLOGY", label: "Radiologie" },
  { value: "DENTAL", label: "Dentaire" }, { value: "PARAMEDICAL", label: "Paramédical" },
  { value: "OTHER", label: "Autre" },
];

const TYPE_COLORS: Record<string, string> = {
  CLINIC: "bg-blue-100 text-blue-700", HOSPITAL: "bg-red-100 text-red-700",
  LAB: "bg-green-100 text-green-700", RADIOLOGY: "bg-purple-100 text-purple-700",
  DENTAL: "bg-cyan-100 text-cyan-700", PARAMEDICAL: "bg-amber-100 text-amber-700",
  OTHER: "bg-gray-100 text-gray-600",
};

interface OrgForm { name: string; orgType: string; city: string; address: string; phone: string; email: string; }
const EMPTY_FORM: OrgForm = { name: "", orgType: "CLINIC", city: "", address: "", phone: "", email: "" };

export default function AdminOrganizations() {
  const { token } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<OrgForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrgs();
  }, []);

  async function loadOrgs() {
    setLoading(true);
    try { setOrgs(await apiFetch<Organization[]>("/organizations")); } catch {} finally { setLoading(false); }
  }

  function openCreate() { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); setError(""); }
  function openEdit(org: Organization) {
    setForm({ name: org.name, orgType: org.orgType, city: org.city ?? "", address: org.address ?? "", phone: org.phone ?? "", email: org.email ?? "" });
    setEditingId(org.id); setShowForm(true); setError("");
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Le nom est obligatoire"); return; }
    setSaving(true); setError("");
    try {
      if (editingId) {
        await apiFetch(`/organizations/${editingId}`, { method: "PUT", body: JSON.stringify(form) }, token);
      } else {
        await apiFetch("/organizations", { method: "POST", body: JSON.stringify(form) }, token);
      }
      await loadOrgs();
      setShowForm(false);
    } catch (e: any) { setError(e.message || "Erreur lors de la sauvegarde"); } finally { setSaving(false); }
  }

  async function toggleActive(org: Organization) {
    try {
      await apiFetch(`/organizations/${org.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...org, isActive: !org.isActive }),
      }, token);
      setOrgs(prev => prev.map(o => o.id === org.id ? { ...o, isActive: !o.isActive } : o));
    } catch {}
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
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? "Modifier l'organisation" : "Nouvelle organisation"}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Nom *</Label>
                  <Input placeholder="Clinique El Menzah" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Type d'établissement</Label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={form.orgType}
                    onChange={e => setForm(p => ({...p, orgType: e.target.value}))}
                  >
                    {ORG_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Ville</Label>
                  <Input placeholder="Tunis" value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Adresse</Label>
                  <Input placeholder="Rue, Quartier" value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Téléphone</Label>
                  <Input placeholder="+216 XX XXX XXX" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input placeholder="contact@clinique.tn" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
                </div>
              </div>
              {error && <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-3 mt-5 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
                  {saving ? "Sauvegarde..." : <><Check className="w-4 h-4 mr-1" /> {editingId ? "Modifier" : "Créer"}</>}
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
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune organisation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(org => (
              <Card key={org.id} className={!org.isActive ? "opacity-60" : ""}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-900">{org.name}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[org.orgType] ?? TYPE_COLORS.OTHER}`}>
                        {ORG_TYPES.find(t => t.value === org.orgType)?.label ?? org.orgType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {[org.city, org.address, org.phone].filter(Boolean).join(" · ") || "Pas d'infos supplémentaires"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(org)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                        org.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {org.isActive ? "Actif" : "Inactif"}
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(org)}>
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </Button>
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
