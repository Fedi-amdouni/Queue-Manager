import { useState, useEffect } from "react";
import { ClinicLayout } from "@/components/clinic-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Plus, Pencil, Trash2, Clock, Users, CheckCircle2, AlertCircle, X } from "lucide-react";

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

export default function ClinicServices() {
  const { user, token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(s: Service) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description ?? "",
      avgDurationMinutes: String(s.avgDurationMinutes),
      maxQueueSize: String(s.maxQueueSize),
    });
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
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
          <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            Nouveau service
          </Button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <Card className="mb-6 border-emerald-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">
                {editingId ? "Modifier le service" : "Ajouter un service"}
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
                    {saving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer le service"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeForm}>Annuler</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Liste des services */}
        {loading ? (
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
              <p className="text-gray-500 text-sm mb-6">Commencez par ajouter les services proposés par votre établissement.</p>
              <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un service
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(s)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(s.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ClinicLayout>
  );
}
