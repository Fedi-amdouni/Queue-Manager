import * as React from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetOrganizations,
  useGetServicesByOrganization,
  useGetAppointments,
  useCreateAppointment,
  useUpdateAppointmentStatus,
  getGetAppointmentsQueryKey,
  Priority,
  AppointmentStatus
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, User, Clock, Phone } from "lucide-react";
import { cn, PRIORITY_COLORS, STATUS_COLORS } from "@/lib/utils";
import { motion } from "framer-motion";

export function Appointments() {
  const queryClient = useQueryClient();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const [selectedOrg, setSelectedOrg] = React.useState<number | "">("");
  const [selectedSvc, setSelectedSvc] = React.useState<number | "">("");
  const [selectedDate, setSelectedDate] = React.useState(todayStr);

  const { data: orgs } = useGetOrganizations();
  const { data: services } = useGetServicesByOrganization(selectedOrg as number, { query: { enabled: !!selectedOrg } });
  
  const { data: appointments, isLoading } = useGetAppointments(
    { serviceDeptId: selectedSvc as number, date: selectedDate },
    { query: { enabled: !!selectedSvc } }
  );

  const createMutation = useCreateAppointment();
  const updateStatusMutation = useUpdateAppointmentStatus();

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    patientName: "", patientPhone: "", appointmentDate: todayStr, appointmentTime: "09:00", priority: "NORMAL" as Priority, notes: ""
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSvc) return;
    createMutation.mutate(
      { data: { ...formData, serviceDeptId: selectedSvc as number } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAppointmentsQueryKey({ serviceDeptId: selectedSvc as number, date: selectedDate }) });
          setIsAddModalOpen(false);
          setFormData({ patientName: "", patientPhone: "", appointmentDate: todayStr, appointmentTime: "09:00", priority: "NORMAL" as Priority, notes: "" });
        }
      }
    );
  };

  const handleStatusChange = (id: number, status: AppointmentStatus) => {
    updateStatusMutation.mutate(
      { ticketId: id, data: { status } } as any, // backend actually uses id, typings might map it via ticketId due to path params naming overlapping in spec
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAppointmentsQueryKey({ serviceDeptId: selectedSvc as number, date: selectedDate }) });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Rendez-vous</h1>
          <p className="text-slate-500 mt-2">Planifiez et gérez les consultations.</p>
        </div>
        {selectedSvc && (
          <Button variant="gradient" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" /> Nouveau RDV
          </Button>
        )}
      </div>

      <Card className="mb-8 border-none shadow-md overflow-visible">
        <CardContent className="p-6 bg-white rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Organisation</Label>
            <select 
              className="flex h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary transition-all"
              value={selectedOrg} onChange={e => { setSelectedOrg(Number(e.target.value) || ""); setSelectedSvc(""); }}
            >
              <option value="">Sélectionnez...</option>
              {orgs?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Service</Label>
            <select 
              className="flex h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary transition-all disabled:opacity-50"
              value={selectedSvc} onChange={e => setSelectedSvc(Number(e.target.value) || "")} disabled={!selectedOrg}
            >
              <option value="">Sélectionnez...</option>
              {services?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {!selectedSvc ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">Sélectionnez un service</h3>
          <p className="text-slate-500 mt-2">Choisissez l'organisation et le service pour voir les rendez-vous.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center h-32 items-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : appointments?.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl">
          <p className="text-slate-500 font-medium">Aucun rendez-vous planifié pour cette date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments?.map((apt, i) => (
            <motion.div key={apt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover-lift">
                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-50 text-primary font-display font-bold text-xl rounded-xl flex items-center justify-center border border-blue-100">
                      {apt.appointmentTime.substring(0, 5)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" /> {apt.patientName}
                      </h4>
                      {apt.patientPhone && <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3"/> {apt.patientPhone}</p>}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={cn("px-3 py-1 text-xs", PRIORITY_COLORS[apt.priority || 'NORMAL'])}>{apt.priority}</Badge>
                    <Badge className={cn("px-3 py-1 text-xs", STATUS_COLORS[apt.status || 'PENDING'])}>{apt.status}</Badge>
                    
                    {apt.status === 'PENDING' && (
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleStatusChange(apt.id, 'CONFIRMED' as AppointmentStatus)}>Confirmer</Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusChange(apt.id, 'CANCELLED' as AppointmentStatus)}>Annuler</Button>
                      </div>
                    )}
                    {apt.status === 'CONFIRMED' && (
                      <Button size="sm" onClick={() => handleStatusChange(apt.id, 'IN_PROGRESS' as AppointmentStatus)}>Commencer</Button>
                    )}
                    {apt.status === 'IN_PROGRESS' && (
                      <Button size="sm" variant="outline" className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => handleStatusChange(apt.id, 'COMPLETED' as AppointmentStatus)}>Terminer</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nouveau Rendez-vous">
        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Nom du patient</Label>
            <Input required value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} placeholder="Nom complet" />
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input value={formData.patientPhone} onChange={e => setFormData({...formData, patientPhone: e.target.value})} placeholder="Numéro" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" required value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Heure</Label>
              <Input type="time" required value={formData.appointmentTime} onChange={e => setFormData({...formData, appointmentTime: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Priorité</Label>
            <select 
              className="flex h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary transition-all"
              value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
            >
              {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
            <Button type="submit" variant="gradient" disabled={createMutation.isPending}>Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
