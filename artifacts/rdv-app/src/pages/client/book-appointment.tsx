import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ClientLayout } from "@/components/client-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Building2, Stethoscope, Calendar, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Organization {
  id: number; name: string; orgType: string; city?: string; address?: string;
}
interface Service {
  id: number; name: string; description?: string;
}

const ORG_TYPE_LABELS: Record<string, string> = {
  CLINIC: "Clinique", HOSPITAL: "Hôpital", LAB: "Laboratoire",
  RADIOLOGY: "Radiologie", DENTAL: "Dentaire", PARAMEDICAL: "Paramédical", OTHER: "Autre"
};

const TIMES = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];

export default function BookAppointment() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(1);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Organization[]>("/organizations").then(setOrgs).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      apiFetch<Service[]>(`/services/organization/${selectedOrg.id}`).then(setServices).catch(() => {});
    }
  }, [selectedOrg]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  async function handleBook() {
    if (!selectedService || !selectedDate || !selectedTime || !user) return;
    setLoading(true);
    setError("");
    try {
      await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          patientName: user.name,
          patientPhone: "",
          appointmentDate: selectedDate,
          appointmentTime: selectedTime + ":00",
          serviceDeptId: selectedService.id,
          notes,
          userId: user.userId,
        }),
      }, token);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Erreur lors de la réservation.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <ClientLayout>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rendez-vous confirmé !</h2>
          <p className="text-gray-500 mb-2">
            {selectedOrg?.name} — {selectedService?.name}
          </p>
          <p className="text-blue-600 font-semibold text-lg mb-8">
            {selectedDate} à {selectedTime}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setSuccess(false); setStep(1); setSelectedOrg(null); setSelectedService(null); setSelectedDate(""); setSelectedTime(""); }}>
              Nouveau RDV
            </Button>
            <Button onClick={() => setLocation("/client/appointments")}>
              Mes rendez-vous
            </Button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const steps = ["Établissement", "Service", "Date & Heure", "Confirmer"];

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Prendre un rendez-vous</h1>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                step > i + 1 ? "bg-blue-600 text-white" :
                step === i + 1 ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                "bg-gray-200 text-gray-500"
              )}>
                {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${step === i + 1 ? "text-blue-600" : step > i + 1 ? "text-gray-700" : "text-gray-400"}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${step > i + 1 ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Choisir l'établissement
            </h2>
            {orgs.length === 0 ? (
              <p className="text-gray-500 text-center py-12">Aucun établissement disponible</p>
            ) : (
              <div className="grid gap-3">
                {orgs.map(org => (
                  <Card
                    key={org.id}
                    className={cn("cursor-pointer transition-all hover:shadow-md", selectedOrg?.id === org.id && "border-blue-500 ring-2 ring-blue-100")}
                    onClick={() => setSelectedOrg(org)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{org.name}</p>
                        <p className="text-sm text-gray-500">{ORG_TYPE_LABELS[org.orgType] ?? org.orgType}{org.city ? ` · ${org.city}` : ""}</p>
                      </div>
                      {selectedOrg?.id === org.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <Button disabled={!selectedOrg} onClick={() => setStep(2)}>
                Suivant <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" /> Choisir le service
            </h2>
            {services.length === 0 ? (
              <p className="text-gray-500 text-center py-12">Aucun service disponible</p>
            ) : (
              <div className="grid gap-3">
                {services.map(svc => (
                  <Card
                    key={svc.id}
                    className={cn("cursor-pointer transition-all hover:shadow-md", selectedService?.id === svc.id && "border-blue-500 ring-2 ring-blue-100")}
                    onClick={() => setSelectedService(svc)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{svc.name}</p>
                        {svc.description && <p className="text-sm text-gray-500">{svc.description}</p>}
                      </div>
                      {selectedService?.id === svc.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4 mr-1" /> Retour</Button>
              <Button disabled={!selectedService} onClick={() => setStep(3)}>Suivant <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Choisir la date et l'heure
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Date du rendez-vous</Label>
                <Input type="date" min={minDate} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
              </div>
              {selectedDate && (
                <div className="space-y-2">
                  <Label>Heure disponible</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIMES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={cn(
                          "py-2 text-sm rounded-lg border font-medium transition-colors",
                          selectedTime === t
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        )}
                      >{t}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Notes (optionnel)</Label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Symptômes, informations utiles..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4 mr-1" /> Retour</Button>
              <Button disabled={!selectedDate || !selectedTime} onClick={() => setStep(4)}>Suivant <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirmer votre rendez-vous</h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Établissement</span>
                  <span className="font-semibold text-gray-900 text-sm">{selectedOrg?.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Service</span>
                  <span className="font-semibold text-gray-900 text-sm">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Date</span>
                  <span className="font-semibold text-gray-900 text-sm">{selectedDate}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Heure</span>
                  <span className="font-semibold text-gray-900 text-sm">{selectedTime}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-500 text-sm">Patient</span>
                  <span className="font-semibold text-gray-900 text-sm">{user?.name}</span>
                </div>
              </CardContent>
            </Card>
            {error && <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(3)}><ChevronLeft className="w-4 h-4 mr-1" /> Retour</Button>
              <Button onClick={handleBook} disabled={loading}>
                {loading ? "Réservation..." : "Confirmer le rendez-vous"} <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
