import { useState, useEffect } from "react";
import { ClinicLayout } from "@/components/clinic-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Plus, Pencil, Trash2, Clock, Users, CheckCircle2, AlertCircle, X, Search } from "lucide-react";

interface Service {
  id: number;
  name: string;
  description: string;
  avgDurationMinutes: number;
  maxQueueSize: number;
  active: boolean;
}

interface ServiceForm {
  name: string;
  description: string;
  avgDurationMinutes: string;
  maxQueueSize: string;
}

const emptyForm: ServiceForm = {
  name: "",
  description: "",
  avgDurationMinutes: "15",
  maxQueueSize: "50",
};

const PREDEFINED_SERVICES: { name: string; description: string; duration: number }[] = [
  { name: "Consultation générale", description: "Consultation médicale générale", duration: 20 },
  { name: "Consultation spécialisée", description: "Consultation avec un médecin spécialiste", duration: 30 },
  { name: "Pédiatrie", description: "Consultation pour enfants", duration: 20 },
  { name: "Gynécologie", description: "Consultation gynécologique", duration: 30 },
  { name: "Cardiologie", description: "Consultation cardiologique", duration: 30 },
  { name: "Dermatologie", description: "Consultation dermatologique", duration: 20 },
  { name: "Ophtalmologie", description: "Consultation ophtalmologique", duration: 25 },
  { name: "ORL", description: "Oto-rhino-laryngologie", duration: 25 },
  { name: "Neurologie", description: "Consultation neurologique", duration: 30 },
  { name: "Orthopédie", description: "Consultation orthopédique", duration: 30 },
  { name: "Psychiatrie", description: "Consultation psychiatrique", duration: 45 },
  { name: "Endocrinologie", description: "Consultation endocrinologique", duration: 30 },
  { name: "Gastrologie", description: "Consultation gastro-entérologique", duration: 30 },
  { name: "Pneumologie", description: "Consultation pneumologique", duration: 30 },
  { name: "Urologie", description: "Consultation urologique", duration: 30 },
  { name: "Rhumatologie", description: "Consultation rhumatologique", duration: 30 },
  { name: "Prise de sang", description: "Prélèvement sanguin et analyses biologiques", duration: 10 },
  { name: "Analyse d'urine", description: "Examen cyto-bactériologique des urines", duration: 10 },
  { name: "NFS - Numération Formule Sanguine", description: "Bilan sanguin complet", duration: 10 },
  { name: "Bilan lipidique", description: "Cholestérol, triglycérides", duration: 10 },
  { name: "Glycémie à jeun", description: "Dosage du glucose sanguin", duration: 10 },
  { name: "Bilan hépatique", description: "Transaminases, bilirubine", duration: 10 },
  { name: "Bilan thyroïdien", description: "TSH, T3, T4", duration: 10 },
  { name: "Radiographie", description: "Examen radiographique standard", duration: 15 },
  { name: "Échographie abdominale", description: "Échographie de l'abdomen", duration: 20 },
  { name: "Échographie pelvienne", description: "Échographie pelvienne", duration: 20 },
  { name: "Échographie thyroïdienne", description: "Échographie de la glande thyroïde", duration: 20 },
  { name: "Mammographie", description: "Dépistage du cancer du sein", duration: 20 },
  { name: "IRM", description: "Imagerie par résonance magnétique", duration: 45 },
  { name: "Scanner", description: "Tomodensitométrie (CT scan)", duration: 30 },
  { name: "ECG", description: "Électrocardiogramme", duration: 15 },
  { name: "Vaccination", description: "Administration de vaccins", duration: 10 },
  { name: "Injection / Perfusion", description: "Soins infirmiers - injection ou perfusion", duration: 15 },
  { name: "Pansement", description: "Soins de plaie et pansement", duration: 15 },
  { name: "Soins dentaires", description: "Consultation et soins bucco-dentaires", duration: 30 },
  { name: "Détartrage", description: "Nettoyage et détartrage dentaire", duration: 30 },
  { name: "Extraction dentaire", description: "Extraction de dent", duration: 30 },
  { name: "Kinésithérapie", description: "Séance de rééducation physique", duration: 45 },
  { name: "Urgence", description: "Prise en charge urgente", duration: 15 },
  { name: "Renouvellement d'ordonnance", description: "Renouvellement de prescription médicale", duration: 10 },
];

export default function ClinicServices() {
  const { user, token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "predefined" | "custom">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    if (!user?.organizationId) return;
    setLoading(true);
    try {
      const data = await apiFetch<Service[]>(`/organizations/${user.organizationId}/services`, {}, token);
      setServices(data);
    } catch {
      setError("Impossible de charger les services.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [user, token]);

  function openEdit(s: Service) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description ?? "",
      avgDurationMinutes: String(s.avgDurationMinutes),
      maxQueueSize: String(s.maxQueueSize),
    });
    setError("");
    setMode("custom");
  }

  function closeForm() {
    setMode("list");
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSearch("");
  }

  function selectPredefined(p: { name: string; description: string; duration: number }) {
    setForm({ name: p.name, description: p.description, avgDurationMinutes: String(p.duration), maxQueueSize: "50" });
    setMode("custom");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Le nom du service est obligatoire."); return; }
    setSaving(true);
    setError("");
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        avgDurationMinutes: parseInt(form.avgDurationMinutes) || 15,
        maxQueueSize: parseInt(form.maxQueueSize) || 50,
      };
      if (editingId) {
        await apiFetch(`/services/${editingId}`, { method: "PUT", body: JSON.stringify(body) }, token);
      } else {
        await apiFetch(`/organizations/${user?.organizationId}/services`, { method: "POST", body: JSON.stringify(body) }, token);
      }
      closeForm();
      await load();
    } catch {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce service ?")) return;
    try {
      await apiFetch(`/services/${id}`, { method: "DELETE" }, token);
      await load();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  }

  const filteredPredefined = PREDEFINED_SERVICES.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  if (!user?.organizationId) {
    return (
      <ClinicLayout>
        <Card className="max-w-md mx-auto mt-20 border-amber-200 bg-amber-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-amber-800 mb-2">Aucune organisation liée</h2>
            <p className="text-amber-700 text-sm">Contactez l'administrateur.</p>
          </CardContent>
        </Card>
      </ClinicLayout>
    );
  }

  return (
    <ClinicLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Services</h1>
            <p className="text-gray-500 mt-1">Gérez les services proposés par votre établissement</p>
          </div>
          {mode === "list" && (
            <div className="flex gap-2">
              <Button onClick={() => setMode("predefined")} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Choisir depuis la liste
              </Button>
              <Button onClick={() => { setMode("custom"); setEditingId(null); setForm(emptyForm); }} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Personnalisé
              </Button>
            </div>
          )}
        </div>

        {/* Mode sélection depuis liste prédéfinie */}
        {mode === "predefined" && (
          <Card className="mb-6 border-emerald-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-gray-800">Choisir un service</CardTitle>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un service..."
                  className="pl-9"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                {filteredPredefined.map(p => (
                  <button
                    key={p.name}
                    onClick={() => selectPredefined(p)}
                    className="text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.description} · {p.duration} min</p>
                  </button>
                ))}
                {filteredPredefined.length === 0 && (
                  <p className="text-gray-500 text-sm col-span-2 text-center py-4">Aucun résultat</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => { setMode("custom"); setEditingId(null); setForm(emptyForm); }}
                  className="text-sm text-emerald-600 hover:underline"
                >
                  + Créer un service personnalisé
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulaire de création/modification */}
        {mode === "custom" && (
          <Card className="mb-6 border-emerald-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">
                {editingId ? "Modifier le service" : "Configurer le service"}
              </CardTitle>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Nom du service *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Ex: Consultation générale, Prise de sang..."
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Description optionnelle"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Durée moyenne (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={5}
                      max={240}
                      value={form.avgDurationMinutes}
                      onChange={e => setForm(f => ({ ...f, avgDurationMinutes: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxQueue">Taille max de la file</Label>
                    <Input
                      id="maxQueue"
                      type="number"
                      min={1}
                      max={500}
                      value={form.maxQueueSize}
                      onChange={e => setForm(f => ({ ...f, maxQueueSize: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {saving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Ajouter ce service"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeForm}>Annuler</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Liste des services existants */}
        {mode === "list" && (
          loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : services.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun service configuré</h3>
                <p className="text-gray-500 text-sm mb-6">Ajoutez les services proposés par votre établissement.</p>
                <Button onClick={() => setMode("predefined")} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Choisir depuis la liste
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {services.map(s => (
                <Card key={s.id} className={`border ${s.active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{s.name}</h3>
                        {!s.active && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactif</span>
                        )}
                      </div>
                      {s.description && <p className="text-sm text-gray-500 truncate mt-0.5">{s.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {s.avgDurationMinutes} min / patient
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          File max : {s.maxQueueSize}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => openEdit(s)} className="h-8 w-8 p-0">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm" variant="outline" onClick={() => handleDelete(s.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </ClinicLayout>
  );
}
