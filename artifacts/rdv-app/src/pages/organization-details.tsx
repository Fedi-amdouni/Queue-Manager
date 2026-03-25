import * as React from "react";
import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetOrganizationById, 
  useGetServicesByOrganization,
  useCreateService,
  getGetServicesByOrganizationQueryKey
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Users, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function OrganizationDetails() {
  const { id } = useParams();
  const orgId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();
  
  const { data: org, isLoading: orgLoading } = useGetOrganizationById(orgId);
  const { data: services, isLoading: svcLoading } = useGetServicesByOrganization(orgId);
  const createSvcMutation = useCreateService();

  const [isAddSvcModalOpen, setIsAddSvcModalOpen] = React.useState(false);
  const [svcData, setSvcData] = React.useState({
    name: "",
    description: "",
    avgDurationMinutes: 15,
    maxQueueSize: 50
  });

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    createSvcMutation.mutate(
      { orgId, data: svcData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetServicesByOrganizationQueryKey(orgId) });
          setIsAddSvcModalOpen(false);
          setSvcData({ name: "", description: "", avgDurationMinutes: 15, maxQueueSize: 50 });
        }
      }
    );
  };

  if (orgLoading) return <Layout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div></Layout>;
  if (!org) return <Layout>Organisation introuvable</Layout>;

  return (
    <Layout>
      <Link href="/organizations" className="inline-flex items-center text-slate-500 hover:text-primary font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux organisations
      </Link>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-8">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="mb-3 bg-blue-50 text-primary border-blue-100">{org.type}</Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">{org.name}</h1>
            <p className="text-slate-500">{org.address} • {org.phone}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-display font-bold text-slate-900">Services & Départements</h2>
        <Button variant="gradient" onClick={() => setIsAddSvcModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un service
        </Button>
      </div>

      {svcLoading ? (
        <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : services?.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500">Aucun service défini pour cette organisation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services?.map((svc, i) => (
            <motion.div key={svc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover-lift overflow-hidden group">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{svc.name}</h3>
                  <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{svc.description || "Aucune description"}</p>
                  
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-1 text-primary" /> {svc.avgDurationMinutes} min/rdv</div>
                    <div className="flex items-center"><Users className="w-4 h-4 mr-1 text-primary" /> Max {svc.maxQueueSize}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isAddSvcModalOpen} onClose={() => setIsAddSvcModalOpen(false)} title="Nouveau Service">
        <form onSubmit={handleCreateService} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="sname">Nom du service</Label>
            <Input id="sname" required value={svcData.name} onChange={e => setSvcData({...svcData, name: e.target.value})} placeholder="Ex: Radiologie" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" value={svcData.description} onChange={e => setSvcData({...svcData, description: e.target.value})} placeholder="Description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dur">Durée moy. (min)</Label>
              <Input id="dur" type="number" required min="1" value={svcData.avgDurationMinutes} onChange={e => setSvcData({...svcData, avgDurationMinutes: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">File max</Label>
              <Input id="max" type="number" required min="1" value={svcData.maxQueueSize} onChange={e => setSvcData({...svcData, maxQueueSize: parseInt(e.target.value)})} />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsAddSvcModalOpen(false)}>Annuler</Button>
            <Button type="submit" variant="gradient" disabled={createSvcMutation.isPending}>
              {createSvcMutation.isPending ? "Création..." : "Créer le service"}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
