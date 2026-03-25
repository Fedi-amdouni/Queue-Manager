import { useState, useEffect } from "react";
import { ClinicLayout } from "@/components/clinic-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Users, Phone, CheckCircle, XCircle, RefreshCcw, AlertCircle } from "lucide-react";

interface Service { id: number; name: string; }
interface QueueTicket {
  id: number; ticketNumber: number; patientName: string; patientPhone?: string;
  status: string; priority: string; estimatedWaitMinutes?: number;
  joinedAt?: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  NORMAL: "bg-gray-100 text-gray-600",
  URGENT: "bg-red-100 text-red-700",
  ELDERLY: "bg-amber-100 text-amber-700",
  PREGNANT: "bg-pink-100 text-pink-700",
  DISABLED: "bg-blue-100 text-blue-700",
};
const PRIORITY_LABELS: Record<string, string> = {
  NORMAL: "Normal", URGENT: "Urgent", ELDERLY: "Personnes âgées",
  PREGNANT: "Femme enceinte", DISABLED: "Handicapé",
};

export default function ClinicQueue() {
  const { user, token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [queue, setQueue] = useState<QueueTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (user?.organizationId) {
      apiFetch<Service[]>(`/organizations/${user.organizationId}/services`, {}, token)
        .then(svcs => {
          setServices(svcs);
          if (svcs.length > 0) setSelectedServiceId(svcs[0].id);
        }).catch(() => {});
    }
  }, [user, token]);

  useEffect(() => {
    if (selectedServiceId) {
      loadQueue();
      const interval = setInterval(loadQueue, 15000);
      return () => clearInterval(interval);
    }
  }, [selectedServiceId]);

  async function loadQueue() {
    if (!selectedServiceId) return;
    setLoading(true);
    try {
      const data = await apiFetch<QueueTicket[]>(`/queue/${selectedServiceId}`, {}, token);
      setQueue(data);
    } catch {} finally {
      setLoading(false);
    }
  }

  async function callNext() {
    if (!selectedServiceId) return;
    setActionLoading(-1);
    try {
      await apiFetch(`/queue/${selectedServiceId}/call-next`, { method: "POST" }, token);
      await loadQueue();
    } catch {} finally {
      setActionLoading(null);
    }
  }

  async function updateTicketStatus(ticketId: number, status: string) {
    setActionLoading(ticketId);
    try {
      await apiFetch(`/queue/tickets/${ticketId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }, token);
      await loadQueue();
    } catch {} finally {
      setActionLoading(null);
    }
  }

  const waiting = queue.filter(t => t.status === "WAITING");
  const called = queue.filter(t => t.status === "CALLED");
  const done = queue.filter(t => t.status === "COMPLETED" || t.status === "NO_SHOW" || t.status === "SKIPPED");

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
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestion de la file d'attente</h1>
          <div className="flex items-center gap-3">
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={selectedServiceId ?? ""}
              onChange={e => setSelectedServiceId(e.target.value ? +e.target.value : null)}
            >
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={loadQueue} disabled={loading}>
              <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

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
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateTicketStatus(ticket.id, "COMPLETED")}
                      disabled={actionLoading === ticket.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Terminé
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => updateTicketStatus(ticket.id, "NO_SHOW")}
                      disabled={actionLoading === ticket.id}
                    >
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
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={callNext}
            disabled={waiting.length === 0 || actionLoading === -1}
          >
            {actionLoading === -1 ? "Appel..." : `Appeler le suivant${waiting[0] ? ` (N°${waiting[0].ticketNumber})` : ""}`}
          </Button>
        </div>

        {waiting.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed mb-6">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">File d'attente vide</p>
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            {waiting.map((ticket, idx) => (
              <Card key={ticket.id} className={idx === 0 ? "border-emerald-200 shadow-sm" : ""}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
                    idx === 0 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}>{ticket.ticketNumber}</div>
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
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Terminés aujourd'hui ({done.length})
            </h2>
            <div className="space-y-2">
              {done.slice(0, 5).map(ticket => (
                <div key={ticket.id} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl opacity-70">
                  <span className="text-sm font-bold text-gray-500 w-8">{ticket.ticketNumber}</span>
                  <span className="text-sm text-gray-600 flex-1">{ticket.patientName}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    ticket.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                    ticket.status === "NO_SHOW" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {ticket.status === "COMPLETED" ? "Consulté" : ticket.status === "NO_SHOW" ? "Absent" : "Ignoré"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ClinicLayout>
  );
}
