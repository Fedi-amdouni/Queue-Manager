import { useState, useEffect } from "react";
import { ClinicLayout } from "@/components/clinic-layout";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Monitor, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Service { id: number; name: string; }

export default function ClinicCallScreen() {
  const { user, token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.organizationId) {
      apiFetch<Service[]>(`/services/organization/${user.organizationId}`, {}, token)
        .then(svcs => { setServices(svcs); if (svcs.length > 0) setSelectedServiceId(svcs[0].id); })
        .catch(() => {});
    }
  }, [user, token]);

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const screenUrl = selectedServiceId ? `${window.location.origin}${base}/call-screen/${selectedServiceId}` : null;

  return (
    <ClinicLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Écran d'appel</h1>
        <p className="text-gray-500 mb-6">Affichez cet écran dans la salle d'attente sur un moniteur</p>

        <Card className="mb-6">
          <CardContent className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner le service</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
              value={selectedServiceId ?? ""}
              onChange={e => setSelectedServiceId(e.target.value ? +e.target.value : null)}
            >
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            {screenUrl && (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">URL de l'écran d'appel</p>
                  <p className="text-sm font-mono text-gray-800 break-all">{screenUrl}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => window.open(screenUrl, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> Ouvrir l'écran d'appel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Monitor className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Comment utiliser l'écran d'appel</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Ouvrez l'URL sur un moniteur dans la salle d'attente</li>
                <li>• L'écran se met à jour automatiquement toutes les 5 secondes</li>
                <li>• Il affiche le numéro appelé et les prochains en attente</li>
                <li>• Gérez la file depuis "File d'attente" pour appeler les patients</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ClinicLayout>
  );
}
