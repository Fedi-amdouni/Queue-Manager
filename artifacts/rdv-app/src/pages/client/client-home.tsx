import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ClientLayout } from "@/components/client-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Calendar, Clock, CheckCircle, Plus, ArrowRight, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Appointment {
  id: number;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  serviceDept?: { name: string; organization?: { name: string } };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "text-amber-600 bg-amber-50 border-amber-200" },
  CONFIRMED: { label: "Confirmé", color: "text-blue-600 bg-blue-50 border-blue-200" },
  IN_PROGRESS: { label: "En cours", color: "text-purple-600 bg-purple-50 border-purple-200" },
  COMPLETED: { label: "Terminé", color: "text-green-600 bg-green-50 border-green-200" },
  CANCELLED: { label: "Annulé", color: "text-red-600 bg-red-50 border-red-200" },
  NO_SHOW: { label: "Absent", color: "text-gray-600 bg-gray-50 border-gray-200" },
};

export default function ClientHome() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Appointment[]>("/appointments/my", {}, token)
      .then(data => setAppointments(data.slice(0, 3)))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [token]);

  const upcoming = appointments.filter(a => a.status !== "CANCELLED" && a.status !== "COMPLETED");
  const today = new Date().toISOString().split("T")[0];

  return (
    <ClientLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-blue-100 bg-blue-50">
            <CardContent className="pt-5 pb-4">
              <Calendar className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-700">{upcoming.length}</p>
              <p className="text-sm text-blue-600">RDV à venir</p>
            </CardContent>
          </Card>
          <Card className="border-green-100 bg-green-50">
            <CardContent className="pt-5 pb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-700">{appointments.filter(a => a.status === "COMPLETED").length}</p>
              <p className="text-sm text-green-600">Consultations</p>
            </CardContent>
          </Card>
          <Card className="border-amber-100 bg-amber-50">
            <CardContent className="pt-5 pb-4">
              <Clock className="w-6 h-6 text-amber-600 mb-2" />
              <p className="text-2xl font-bold text-amber-700">{appointments.filter(a => a.appointmentDate === today).length}</p>
              <p className="text-sm text-amber-600">Aujourd'hui</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Prochains rendez-vous</h2>
          <Button variant="outline" size="sm" onClick={() => setLocation("/client/appointments")}>
            Voir tout <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : upcoming.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucun rendez-vous à venir</p>
              <p className="text-sm text-gray-400 mt-1">Prenez votre premier rendez-vous</p>
              <Button className="mt-4" onClick={() => setLocation("/client/book")}>
                <Plus className="w-4 h-4 mr-2" /> Prendre un RDV
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.map(apt => {
              const s = STATUS_LABELS[apt.status] ?? STATUS_LABELS.PENDING;
              return (
                <Card key={apt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-700">
                        {format(new Date(apt.appointmentDate), "d MMM", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {apt.serviceDept?.organization?.name ?? "Clinique"}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {apt.serviceDept?.name ?? "Service"} · {apt.appointmentTime?.slice(0,5)}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${s.color}`}>
                      {s.label}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-1">Prendre un nouveau rendez-vous</h3>
            <p className="text-blue-100 text-sm mb-4">Choisissez votre clinique, votre service et votre créneau</p>
            <Button
              variant="secondary"
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => setLocation("/client/book")}
            >
              <Plus className="w-4 h-4 mr-2" /> Réserver maintenant
            </Button>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
