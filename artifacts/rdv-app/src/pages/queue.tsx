import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetOrganizations,
  useGetServicesByOrganization,
  useGetQueue,
  useJoinQueue,
  useCallNextInQueue,
  useUpdateTicketStatus,
  getGetQueueQueryKey,
  Priority,
  TicketStatus
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Megaphone, Clock } from "lucide-react";
import { cn, PRIORITY_COLORS, STATUS_COLORS, formatWaitTime } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Queue() {
  const queryClient = useQueryClient();
  const [selectedOrg, setSelectedOrg] = React.useState<number | "">("");
  const [selectedSvc, setSelectedSvc] = React.useState<number | "">("");

  const { data: orgs } = useGetOrganizations();
  const { data: services } = useGetServicesByOrganization(selectedOrg as number, { query: { enabled: !!selectedOrg } });
  
  // Real-time polling every 5 seconds for queue updates
  const { data: queue, isLoading } = useGetQueue(selectedSvc as number, { 
    query: { enabled: !!selectedSvc, refetchInterval: 5000 } 
  });

  const joinMutation = useJoinQueue();
  const callMutation = useCallNextInQueue();
  const updateStatusMutation = useUpdateTicketStatus();

  const [isJoinModalOpen, setIsJoinModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    patientName: "", patientPhone: "", priority: "NORMAL" as Priority
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSvc) return;
    joinMutation.mutate(
      { data: { ...formData, serviceDeptId: selectedSvc as number } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetQueueQueryKey(selectedSvc as number) });
          setIsJoinModalOpen(false);
          setFormData({ patientName: "", patientPhone: "", priority: "NORMAL" as Priority });
        }
      }
    );
  };

  const handleCallNext = () => {
    if (!selectedSvc) return;
    callMutation.mutate(
      { serviceDeptId: selectedSvc as number },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetQueueQueryKey(selectedSvc as number) }) }
    );
  };

  const handleStatusChange = (ticketId: number, status: TicketStatus) => {
    updateStatusMutation.mutate(
      { ticketId, data: { status } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetQueueQueryKey(selectedSvc as number) }) }
    );
  };

  const currentlyCalled = queue?.find(t => t.status === 'CALLED' || t.status === 'IN_SERVICE');
  const waitingList = queue?.filter(t => t.status === 'WAITING') || [];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">File d'attente Temps Réel</h1>
        <p className="text-slate-500 mt-2">Gérez les arrivées et appelez les patients.</p>
      </div>

      <Card className="mb-8 border-none shadow-md overflow-visible">
        <CardContent className="p-6 bg-white rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </CardContent>
      </Card>

      {!selectedSvc ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">Sélectionnez un service</h3>
          <p className="text-slate-500 mt-2">Activez la gestion de file pour un service spécifique.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center h-32 items-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Call Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-2xl"></div>
              <CardContent className="p-8 flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <Megaphone className="w-8 h-8 text-blue-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">Ticket en cours</h3>
                {currentlyCalled ? (
                  <>
                    <div className="text-7xl font-display font-bold text-white mb-4 leading-none">
                      {currentlyCalled.ticketNumber}
                    </div>
                    <div className="text-xl font-medium mb-6 text-blue-200">{currentlyCalled.patientName}</div>
                    
                    <div className="flex flex-col w-full gap-3">
                      {currentlyCalled.status === 'CALLED' ? (
                        <Button variant="gradient" className="w-full h-12 text-base" onClick={() => handleStatusChange(currentlyCalled.id, 'IN_SERVICE' as TicketStatus)}>
                          En consultation
                        </Button>
                      ) : (
                        <Button className="w-full h-12 bg-green-500 hover:bg-green-600 text-base" onClick={() => handleStatusChange(currentlyCalled.id, 'COMPLETED' as TicketStatus)}>
                          Terminer
                        </Button>
                      )}
                      <Button variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10" onClick={() => handleStatusChange(currentlyCalled.id, 'ABSENT' as TicketStatus)}>
                        Marquer Absent
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="py-8">
                    <p className="text-slate-400 mb-6">Aucun patient appelé.</p>
                    <Button variant="gradient" size="lg" className="w-full" disabled={waitingList.length === 0 || callMutation.isPending} onClick={handleCallNext}>
                      {callMutation.isPending ? "Appel..." : "Appeler le Suivant"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full h-14 text-lg border-dashed border-2 border-primary text-primary hover:bg-blue-50" onClick={() => setIsJoinModalOpen(true)}>
              <UserPlus className="w-5 h-5 mr-2" />
              Ajouter un patient
            </Button>
          </div>

          {/* Waiting List Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-display text-slate-900">En attente ({waitingList.length})</h2>
              {waitingList.length > 0 && !currentlyCalled && (
                 <Button onClick={handleCallNext} disabled={callMutation.isPending}>Appeler Suivant</Button>
              )}
            </div>
            
            {waitingList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-slate-500 font-medium">La file d'attente est vide.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {waitingList.map((ticket, i) => (
                    <motion.div 
                      key={ticket.id} 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.05, 0.5) }}
                    >
                      <Card className="hover-lift">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-100 text-slate-900 font-display font-bold text-2xl rounded-xl flex items-center justify-center border border-slate-200 shadow-inner">
                              {ticket.ticketNumber}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{ticket.patientName}</h4>
                              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                {ticket.estimatedWaitMinutes !== undefined && (
                                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Attente est: {formatWaitTime(ticket.estimatedWaitMinutes)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <Badge className={cn("px-3 py-1", PRIORITY_COLORS[ticket.priority || 'NORMAL'])}>{ticket.priority}</Badge>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleStatusChange(ticket.id, 'CANCELLED' as TicketStatus)}>Retirer</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} title="Ajouter à la file">
        <form onSubmit={handleJoin} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Nom du patient</Label>
            <Input required value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} placeholder="Nom complet" />
          </div>
          <div className="space-y-2">
            <Label>Téléphone (Optionnel)</Label>
            <Input value={formData.patientPhone} onChange={e => setFormData({...formData, patientPhone: e.target.value})} placeholder="Numéro pour SMS" />
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
            <Button type="button" variant="outline" onClick={() => setIsJoinModalOpen(false)}>Annuler</Button>
            <Button type="submit" variant="gradient" disabled={joinMutation.isPending}>Ajouter</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
