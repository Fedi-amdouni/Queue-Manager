import { useState, useEffect } from "react";
import { ClinicLayout } from "@/components/clinic-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Calendar, Search, Filter, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Appointment {
  id: number; patientName: string; patientPhone?: string;
  appointmentDate: string; appointmentTime: string;
  status: string; priority: string; notes?: string;
  serviceDept?: { id: number; name: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "En attente", color: "text-amber-700", bg: "bg-amber-100" },
  CONFIRMED: { label: "Confirmé", color: "text-blue-700", bg: "bg-blue-100" },
  IN_PROGRESS: { label: "En cours", color: "text-purple-700", bg: "bg-purple-100" },
  COMPLETED: { label: "Terminé", color: "text-green-700", bg: "bg-green-100" },
  CANCELLED: { label: "Annulé", color: "text-red-600", bg: "bg-red-100" },
  NO_SHOW: { label: "Absent", color: "text-gray-600", bg: "bg-gray-100" },
};

export default function ClinicAppointments() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, user, token]);

  async function loadAppointments() {
    if (!user?.organizationId) return;
    setLoading(true);
    try {
      const data = await apiFetch<Appointment[]>(
        `/appointments?orgId=${user.organizationId}&date=${selectedDate}`,
        {}, token
      );
      setAppointments(data);
    } catch {} finally {
      setLoading(false);
    }
  }

  async function changeStatus(id: number, status: string) {
    setActionLoading(id);
    try {
      await apiFetch(`/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }, token);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch {} finally {
      setActionLoading(null);
    }
  }

  const filtered = appointments.filter(a =>
    a.patientName.toLowerCase().includes(search.toLowerCase()) ||
    (a.serviceDept?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-44"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher un patient..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-sm text-gray-500">
            {format(new Date(selectedDate), "EEEE d MMMM", { locale: fr })} · {filtered.length} rendez-vous
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucun rendez-vous pour cette date</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(apt => {
              const s = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG.PENDING;
              const canComplete = apt.status === "PENDING" || apt.status === "CONFIRMED" || apt.status === "IN_PROGRESS";
              const canCancel = apt.status !== "COMPLETED" && apt.status !== "CANCELLED";
              return (
                <Card key={apt.id} className={apt.status === "CANCELLED" ? "opacity-60" : ""}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-14 text-center flex-shrink-0">
                      <p className="text-base font-bold text-gray-900">{apt.appointmentTime?.slice(0,5)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{apt.patientName}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>
                          {s.label}
                        </span>
                        {apt.priority !== "NORMAL" && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            {apt.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {apt.serviceDept?.name}
                        {apt.patientPhone && ` · ${apt.patientPhone}`}
                      </p>
                      {apt.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{apt.notes}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {canComplete && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() => changeStatus(apt.id, "COMPLETED")}
                          disabled={actionLoading === apt.id}
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Terminé
                        </Button>
                      )}
                      {canCancel && apt.status !== "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => changeStatus(apt.id, "CANCELLED")}
                          disabled={actionLoading === apt.id}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ClinicLayout>
  );
}
