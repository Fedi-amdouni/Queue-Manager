import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ClientLayout } from "@/components/client-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Calendar, MapPin, Plus, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Appointment {
  id: number;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes?: string;
  serviceDept?: { id: number; name: string; organization?: { name: string; city?: string } };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "text-amber-600 bg-amber-50 border-amber-200" },
  CONFIRMED: { label: "Confirmé", color: "text-blue-600 bg-blue-50 border-blue-200" },
  IN_PROGRESS: { label: "En cours", color: "text-purple-600 bg-purple-50 border-purple-200" },
  COMPLETED: { label: "Terminé", color: "text-green-600 bg-green-50 border-green-200" },
  CANCELLED: { label: "Annulé", color: "text-red-500 bg-red-50 border-red-200" },
  NO_SHOW: { label: "Absent", color: "text-gray-500 bg-gray-50 border-gray-200" },
};

export default function MyAppointments() {
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    apiFetch<Appointment[]>("/appointments/my", {}, token)
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [token]);

  async function cancelAppointment(id: number) {
    if (!confirm("Annuler ce rendez-vous ?")) return;
    setCancelling(id);
    try {
      await apiFetch(`/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CANCELLED" }),
      }, token);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "CANCELLED" } : a));
    } catch {} finally {
      setCancelling(null);
    }
  }

  const filtered = appointments.filter(a => {
    if (filter === "upcoming") return a.appointmentDate >= today && a.status !== "CANCELLED";
    if (filter === "past") return a.appointmentDate < today || a.status === "COMPLETED" || a.status === "CANCELLED";
    return true;
  });

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mes rendez-vous</h1>
          <Button size="sm" onClick={() => setLocation("/client/book")}>
            <Plus className="w-4 h-4 mr-1" /> Nouveau RDV
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { key: "upcoming", label: "À venir" },
            { key: "past", label: "Passés" },
            { key: "all", label: "Tous" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >{label}</button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucun rendez-vous</p>
            <Button className="mt-4" size="sm" onClick={() => setLocation("/client/book")}>
              Prendre un RDV
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(apt => {
              const s = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG.PENDING;
              const canCancel = apt.status === "PENDING" || apt.status === "CONFIRMED";
              return (
                <Card key={apt.id} className={apt.status === "CANCELLED" ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-blue-700 leading-none">
                          {new Date(apt.appointmentDate).getDate()}
                        </span>
                        <span className="text-xs text-blue-500 capitalize">
                          {format(new Date(apt.appointmentDate), "MMM", { locale: fr })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {apt.serviceDept?.organization?.name ?? "Clinique"}
                          </p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${s.color}`}>
                            {s.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {apt.serviceDept?.name}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {apt.appointmentTime?.slice(0,5)}
                          {apt.serviceDept?.organization?.city && ` · ${apt.serviceDept.organization.city}`}
                        </p>
                        {apt.notes && <p className="text-xs text-gray-400 mt-1 truncate">{apt.notes}</p>}
                      </div>
                      {canCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => cancelAppointment(apt.id)}
                          disabled={cancelling === apt.id}
                        >
                          <XCircle className="w-4 h-4" />
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
    </ClientLayout>
  );
}
