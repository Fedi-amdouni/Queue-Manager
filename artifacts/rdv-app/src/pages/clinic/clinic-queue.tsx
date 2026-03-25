import { useState, useEffect, useCallback } from "react";
import { ClinicLayout } from "@/components/clinic-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Users, Phone, CheckCircle, XCircle, RefreshCcw, AlertCircle, LayoutGrid, List } from "lucide-react";

interface Service { id: number; name: string; avgDurationMinutes?: number; }
interface QueueTicket {
  id: number; ticketNumber: number; patientName: string; patientPhone?: string;
  status: string; priority: string; estimatedWaitMinutes?: number;
  joinedAt?: string;
}
interface ServiceQueue { service: Service; tickets: QueueTicket[]; loading: boolean; }

const PRIORITY_COLORS: Record<string, string> = {
  NORMAL: "bg-gray-100 text-gray-600",
  URGENT: "bg-red-100 text-red-700",
  ELDERLY: "bg-amber-100 text-amber-700",
  PREGNANT: "bg-pink-100 text-pink-700",
  DISABLED: "bg-blue-100 text-blue-700",
};
const PRIORITY_LABELS: Record<string, string> = {
  NORMAL: "Normal", URGENT: "Urgent", ELDERLY: "Âgé",
  PREGNANT: "Enceinte", DISABLED: "Handicapé",
};

const ALL_SERVICES_ID = -1;

export default function ClinicQueue() {
  const { user, token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(ALL_SERVICES_ID);
  const [queue, setQueue] = useState<QueueTicket[]>([]);
  const [allQueues, setAllQueues] = useState<ServiceQueue[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"single" | "all">("all");

  useEffect(() => {
    if (user?.organizationId) {
      apiFetch<Service[]>(`/organizations/${user.organizationId}/services`, {}, token)
        .then(svcs => {
          setServices(svcs);
          setAllQueues(svcs.map(s => ({ service: s, tickets: [], loading: false })));
        }).catch(() => {});
    }
  }, [user, token]);

  const loadAllQueues = useCallback(async () => {
    if (!services.length) return;
    setLoading(true);
    const updated: ServiceQueue[] = await Promise.all(
      services.map(async (s) => {
        try {
          const tickets = await apiFetch<QueueTicket[]>(`/queue/${s.id}`, {}, token);
          return { service: s, tickets, loading: false };
        } catch {
          return { service: s, tickets: [], loading: false };
        }
      })
    );
    setAllQueues(updated);
    setLoading(false);
  }, [services, token]);

  const loadSingleQueue = useCallback(async () => {
    if (!selectedServiceId || selectedServiceId === ALL_SERVICES_ID) return;
    setLoading(true);
    try {
      const data = await apiFetch<QueueTicket[]>(`/queue/${selectedServiceId}`, {}, token);
      setQueue(data);
    } catch {} finally {
      setLoading(false);
    }
  }, [selectedServiceId, token]);

  useEffect(() => {
    if (selectedServiceId === ALL_SERVICES_ID || viewMode === "all") {
      loadAllQueues();
      const interval = setInterval(loadAllQueues, 15000);
      return () => clearInterval(interval);
    } else {
      loadSingleQueue();
      const interval = setInterval(loadSingleQueue, 15000);
      return () => clearInterval(interval);
    }
  }, [selectedServiceId, viewMode, loadAllQueues, loadSingleQueue]);

  async function callNext(serviceId: number) {
    setActionLoading(-serviceId);
    try {
      await apiFetch(`/queue/${serviceId}/call-next`, { method: "POST" }, token);
      if (viewMode === "all" || selectedServiceId === ALL_SERVICES_ID) {
        await loadAllQueues();
      } else {
        await loadSingleQueue();
      }
    } catch {} finally {
      setActionLoading(null);
    }
  }

  async function updateTicketStatus(ticketId: number, status: string) {
    setActionLoading(ticketId);
    try {
      await apiFetch(`/queue/tickets/${ticketId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
      if (viewMode === "all" || selectedServiceId === ALL_SERVICES_ID) {
        await loadAllQueues();
      } else {
        await loadSingleQueue();
      }
    } catch {} finally {
      setActionLoading(null);
    }
  }

  if (!user?.organizationId) {
    return (
      <ClinicLayout>
        <Card className="max-w-md mx-auto mt-20 border-amber-200 bg-amber-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-amber-700">Compte non associé à une organisation.</p>
          </CardContent>
        </Card>
      </ClinicLayout>
    );
  }

  return (
    <ClinicLayout>
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestion de la file d'attente</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${viewMode === "all" ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                onClick={() => setViewMode("all")}
              >
                <LayoutGrid className="w-4 h-4" /> Vue globale
              </button>
              <button
                className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${viewMode === "single" ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                onClick={() => setViewMode("single")}
              >
                <List className="w-4 h-4" /> Par service
              </button>
            </div>
            {viewMode === "single" && (
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={selectedServiceId}
                onChange={e => setSelectedServiceId(+e.target.value)}
              >
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
            <Button variant="outline" size="sm" onClick={viewMode === "all" ? loadAllQueues : loadSingleQueue} disabled={loading}>
              <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {viewMode === "all" ? (
          <AllServicesView
            allQueues={allQueues}
            loading={loading}
            actionLoading={actionLoading}
            onCallNext={callNext}
            onUpdateStatus={updateTicketStatus}
          />
        ) : (
          <SingleServiceView
            queue={queue}
            loading={loading}
            actionLoading={actionLoading}
            serviceId={selectedServiceId}
            onCallNext={callNext}
            onUpdateStatus={updateTicketStatus}
          />
        )}
      </div>
    </ClinicLayout>
  );
}

function AllServicesView({
  allQueues, loading, actionLoading, onCallNext, onUpdateStatus
}: {
  allQueues: ServiceQueue[];
  loading: boolean;
  actionLoading: number | null;
  onCallNext: (serviceId: number) => void;
  onUpdateStatus: (ticketId: number, status: string) => void;
}) {
  if (loading && allQueues.every(q => q.tickets.length === 0)) {
    return (
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const totalWaiting = allQueues.reduce((sum, q) => sum + q.tickets.filter(t => t.status === "WAITING").length, 0);
  const totalCalled = allQueues.reduce((sum, q) => sum + q.tickets.filter(t => t.status === "CALLED").length, 0);
  const totalDone = allQueues.reduce((sum, q) => sum + q.tickets.filter(t => t.status === "COMPLETED" || t.status === "ABSENT").length, 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{totalWaiting}</p>
              <p className="text-xs text-blue-600">En attente</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-100 bg-purple-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">{totalCalled}</p>
              <p className="text-xs text-purple-600">Appelés</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-100 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{totalDone}</p>
              <p className="text-xs text-green-600">Terminés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
        {allQueues.map(({ service, tickets }) => {
          const waiting = tickets.filter(t => t.status === "WAITING");
          const called = tickets.filter(t => t.status === "CALLED");
          const done = tickets.filter(t => t.status === "COMPLETED" || t.status === "ABSENT");
          return (
            <Card key={service.id} className="overflow-hidden">
              <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{service.name}</p>
                  <p className="text-emerald-100 text-xs">{waiting.length} en attente · {done.length} terminés</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/20 text-xs h-7 px-2 bg-transparent"
                  onClick={() => onCallNext(service.id)}
                  disabled={waiting.length === 0 || actionLoading === -service.id}
                >
                  {actionLoading === -service.id ? "..." : `Appeler N°${waiting[0]?.ticketNumber ?? "–"}`}
                </Button>
              </div>
              <CardContent className="p-3 space-y-2 max-h-72 overflow-y-auto">
                {called.length > 0 && called.map(ticket => (
                  <div key={ticket.id} className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {ticket.ticketNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-purple-900 truncate">{ticket.patientName}</p>
                      <p className="text-xs text-purple-500">En cours d'appel</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        className="w-7 h-7 rounded-md bg-green-100 hover:bg-green-200 flex items-center justify-center"
                        onClick={() => onUpdateStatus(ticket.id, "COMPLETED")}
                        disabled={actionLoading === ticket.id}
                        title="Terminé"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-green-700" />
                      </button>
                      <button
                        className="w-7 h-7 rounded-md bg-red-100 hover:bg-red-200 flex items-center justify-center"
                        onClick={() => onUpdateStatus(ticket.id, "ABSENT")}
                        disabled={actionLoading === ticket.id}
                        title="Absent"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
                {waiting.length === 0 && called.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="w-8 h-8 text-gray-200 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">File vide</p>
                  </div>
                ) : (
                  waiting.map((ticket, idx) => (
                    <div key={ticket.id} className={`flex items-center gap-2 p-2 border rounded-lg ${idx === 0 ? "border-emerald-200 bg-emerald-50" : "border-gray-100 bg-white"}`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${idx === 0 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                        {ticket.ticketNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{ticket.patientName}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full inline-block ${PRIORITY_COLORS[ticket.priority] ?? PRIORITY_COLORS.NORMAL}`}>
                          {PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">#{idx + 1}</span>
                    </div>
                  ))
                )}
                {done.length > 0 && (
                  <div className="pt-1 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Terminés ({done.length})</p>
                    {done.slice(0, 3).map(ticket => (
                      <div key={ticket.id} className="flex items-center gap-2 py-1 opacity-60">
                        <span className="text-xs font-bold text-gray-400 w-6">{ticket.ticketNumber}</span>
                        <span className="text-xs text-gray-500 flex-1 truncate">{ticket.patientName}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${ticket.status === "COMPLETED" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                          {ticket.status === "COMPLETED" ? "✓" : "✗"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SingleServiceView({
  queue, loading, actionLoading, serviceId, onCallNext, onUpdateStatus
}: {
  queue: QueueTicket[];
  loading: boolean;
  actionLoading: number | null;
  serviceId: number;
  onCallNext: (id: number) => void;
  onUpdateStatus: (ticketId: number, status: string) => void;
}) {
  const waiting = queue.filter(t => t.status === "WAITING");
  const called = queue.filter(t => t.status === "CALLED");
  const done = queue.filter(t => t.status === "COMPLETED" || t.status === "ABSENT" || t.status === "CANCELLED");

  return (
    <div className="max-w-2xl">
      {called.length > 0 && (
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardContent className="p-5">
            <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-2">En cours d'appel</p>
            {called.map(ticket => (
              <div key={ticket.id} className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {ticket.ticketNumber}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-purple-900">{ticket.patientName}</p>
                  {ticket.patientPhone && (
                    <p className="text-sm text-purple-600 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {ticket.patientPhone}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700"
                    onClick={() => onUpdateStatus(ticket.id, "COMPLETED")} disabled={actionLoading === ticket.id}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Terminé
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => onUpdateStatus(ticket.id, "ABSENT")} disabled={actionLoading === ticket.id}>
                    <XCircle className="w-4 h-4 mr-1" /> Absent
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-4 h-4" /> En attente ({waiting.length})
        </h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => onCallNext(serviceId)}
          disabled={waiting.length === 0 || actionLoading === -serviceId}>
          {actionLoading === -serviceId ? "Appel..." : `Appeler le suivant${waiting[0] ? ` (N°${waiting[0].ticketNumber})` : ""}`}
        </Button>
      </div>

      {loading && waiting.length === 0 ? (
        <div className="space-y-2 mb-6">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : waiting.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed mb-6">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">File d'attente vide</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {waiting.map((ticket, idx) => (
            <Card key={ticket.id} className={idx === 0 ? "border-emerald-200 shadow-sm" : ""}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${idx === 0 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  {ticket.ticketNumber}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{ticket.patientName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {ticket.patientPhone && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {ticket.patientPhone}
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[ticket.priority] ?? PRIORITY_COLORS.NORMAL}`}>
                      {PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Position</p>
                  <p className="font-bold text-gray-700">{idx + 1}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Terminés aujourd'hui ({done.length})</h2>
          <div className="space-y-2">
            {done.slice(0, 5).map(ticket => (
              <div key={ticket.id} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl opacity-70">
                <span className="text-sm font-bold text-gray-500 w-8">{ticket.ticketNumber}</span>
                <span className="text-sm text-gray-600 flex-1">{ticket.patientName}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  ticket.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  ticket.status === "ABSENT" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {ticket.status === "COMPLETED" ? "Consulté" : ticket.status === "ABSENT" ? "Absent" : "Annulé"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
