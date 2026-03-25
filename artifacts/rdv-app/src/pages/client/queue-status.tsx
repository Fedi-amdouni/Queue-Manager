import { useState, useEffect } from "react";
import { ClientLayout } from "@/components/client-layout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Clock, Users, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Organization { id: number; name: string; orgType: string; }
interface Service { id: number; name: string; }
interface QueueTicket {
  id: number; ticketNumber: number; patientName: string;
  status: string; estimatedWaitMinutes?: number;
  serviceDept?: { name: string };
}

export default function ClientQueueStatus() {
  const { token } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [queue, setQueue] = useState<QueueTicket[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    apiFetch<Organization[]>("/organizations").then(setOrgs).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      apiFetch<Service[]>(`/services/organization/${selectedOrgId}`).then(setServices).catch(() => {});
      setSelectedServiceId(null);
      setQueue([]);
    }
  }, [selectedOrgId]);

  useEffect(() => {
    if (selectedServiceId) loadQueue();
    const interval = selectedServiceId ? setInterval(loadQueue, 30000) : null;
    return () => { if (interval) clearInterval(interval); };
  }, [selectedServiceId]);

  async function loadQueue() {
    if (!selectedServiceId) return;
    setLoading(true);
    try {
      const data = await apiFetch<QueueTicket[]>(`/queue/${selectedServiceId}`);
      setQueue(data.filter(t => t.status === "WAITING" || t.status === "CALLED"));
      setLastUpdate(new Date());
    } catch {} finally {
      setLoading(false);
    }
  }

  const waitingCount = queue.filter(t => t.status === "WAITING").length;
  const currentlyServed = queue.find(t => t.status === "CALLED");

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">File d'attente en direct</h1>
        <p className="text-gray-500 mb-6">Suivez la file d'attente et sachez quand passer</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Établissement</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedOrgId ?? ""}
              onChange={e => setSelectedOrgId(e.target.value ? +e.target.value : null)}
            >
              <option value="">-- Choisir --</option>
              {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Service</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedServiceId ?? ""}
              onChange={e => setSelectedServiceId(e.target.value ? +e.target.value : null)}
              disabled={!selectedOrgId}
            >
              <option value="">-- Choisir --</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {selectedServiceId && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-3">
                <Card className="border-blue-100 bg-blue-50">
                  <CardContent className="px-5 py-4 text-center">
                    <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-700">{waitingCount}</p>
                    <p className="text-xs text-blue-600">En attente</p>
                  </CardContent>
                </Card>
                <Card className="border-amber-100 bg-amber-50">
                  <CardContent className="px-5 py-4 text-center">
                    <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-amber-700">
                      {waitingCount > 0 ? `~${waitingCount * 15}` : "0"}
                    </p>
                    <p className="text-xs text-amber-600">min d'attente</p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex items-center gap-2">
                {lastUpdate && (
                  <span className="text-xs text-gray-400">
                    Mis à jour à {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                <Button variant="outline" size="sm" onClick={loadQueue} disabled={loading}>
                  <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {currentlyServed && (
              <Card className="mb-4 border-purple-200 bg-purple-50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {currentlyServed.ticketNumber}
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">En cours d'appel</p>
                    <p className="font-bold text-purple-900">{currentlyServed.patientName}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {queue.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">La file est vide pour le moment</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 mb-3">Tickets en attente</p>
                {queue.filter(t => t.status === "WAITING").map((ticket, idx) => (
                  <div key={ticket.id} className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                      idx === 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {ticket.ticketNumber}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{ticket.patientName}</p>
                      {idx === 0 && <p className="text-xs text-green-600 font-medium">Prochain à passer</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Position</p>
                      <p className="font-bold text-gray-900">{idx + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!selectedServiceId && (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Sélectionnez un établissement et un service pour voir la file d'attente en temps réel</p>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
