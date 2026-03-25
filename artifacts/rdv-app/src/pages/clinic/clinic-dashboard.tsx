import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ClinicLayout } from "@/components/clinic-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Users, Calendar, Clock, CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Appointment {
  id: number; patientName: string; appointmentDate: string;
  appointmentTime: string; status: string;
  serviceDept?: { name: string };
}
interface QueueTicket {
  id: number; ticketNumber: number; patientName: string; status: string;
}
interface Organization {
  id: number; name: string;
}
interface Service {
  id: number; name: string;
}

const today = new Date().toISOString().split("T")[0];

export default function ClinicDashboard() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const [services, setServices] = useState<Service[]>([]);
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [queue, setQueue] = useState<QueueTicket[]>([]);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (user?.organizationId) {
          const [orgsData, svcs] = await Promise.all([
            apiFetch<Organization>(`/organizations/${user.organizationId}`, {}, token),
            apiFetch<Service[]>(`/organizations/${user.organizationId}/services`, {}, token),
          ]);
          setOrg(orgsData);
          setServices(svcs);

          const [appts, queueData] = await Promise.all([
            apiFetch<Appointment[]>(`/appointments?orgId=${user.organizationId}&date=${today}`, {}, token),
            svcs.length > 0
              ? apiFetch<QueueTicket[]>(`/queue/${svcs[0].id}`, {}, token)
              : Promise.resolve([]),
          ]);
          setTodayAppts(appts);
          setQueue(queueData);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [user, token]);

  const waiting = queue.filter(t => t.status === "WAITING").length;
  const confirmed = todayAppts.filter(a => a.status === "CONFIRMED" || a.status === "PENDING").length;
  const completed = todayAppts.filter(a => a.status === "COMPLETED").length;

  if (!user?.organizationId) {
    return (
      <ClinicLayout>
        <Card className="max-w-md mx-auto mt-20 border-amber-200 bg-amber-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-amber-800 mb-2">Aucune organisation liée</h2>
            <p className="text-amber-700 text-sm">Votre compte clinique n'est pas encore associé à une organisation. Contactez l'administrateur.</p>
          </CardContent>
        </Card>
      </ClinicLayout>
    );
  }

  return (
    <ClinicLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{org?.name ?? "Tableau de bord"}</h1>
          <p className="text-gray-500 mt-1">{format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "En attente", value: waiting, icon: Users, color: "blue" },
            { label: "RDV du jour", value: todayAppts.length, icon: Calendar, color: "indigo" },
            { label: "À recevoir", value: confirmed, icon: Clock, color: "amber" },
            { label: "Consultés", value: completed, icon: CheckCircle, color: "green" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className={`border-${color}-100 bg-${color}-50`}>
              <CardContent className="pt-5 pb-4">
                <Icon className={`w-5 h-5 text-${color}-600 mb-2`} />
                <p className={`text-2xl font-bold text-${color}-700`}>{loading ? "—" : value}</p>
                <p className={`text-xs text-${color}-600`}>{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">File d'attente</h2>
              <Button variant="outline" size="sm" onClick={() => setLocation("/clinic/queue")}>
                Gérer <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
            ) : queue.filter(t => t.status === "WAITING").length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">File vide</p>
              </div>
            ) : (
              <div className="space-y-2">
                {queue.filter(t => t.status === "WAITING").slice(0, 5).map((ticket, idx) => (
                  <div key={ticket.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                      idx === 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                    }`}>{ticket.ticketNumber}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{ticket.patientName}</p>
                      {idx === 0 && <p className="text-xs text-emerald-600">Prochain</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Rendez-vous du jour</h2>
              <Button variant="outline" size="sm" onClick={() => setLocation("/clinic/appointments")}>
                Voir tout <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
            ) : todayAppts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun RDV aujourd'hui</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayAppts.slice(0, 5).map(apt => (
                  <div key={apt.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                    <div className="w-12 text-center flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{apt.appointmentTime?.slice(0,5)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{apt.patientName}</p>
                      <p className="text-xs text-gray-500">{apt.serviceDept?.name}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      apt.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                      apt.status === "CANCELLED" ? "bg-red-100 text-red-600" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {apt.status === "COMPLETED" ? "✓" : apt.status === "CANCELLED" ? "✗" : "···"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ClinicLayout>
  );
}
