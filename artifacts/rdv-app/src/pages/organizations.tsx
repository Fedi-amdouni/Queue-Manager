import * as React from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetOrganizations, 
  useCreateOrganization, 
  getGetOrganizationsQueryKey,
  OrgType
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function Organizations() {
  const queryClient = useQueryClient();
  const { data: orgs, isLoading } = useGetOrganizations();
  const createMutation = useCreateOrganization();
  
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    type: "CLINIC" as OrgType,
    address: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetOrganizationsQueryKey() });
          setIsAddModalOpen(false);
          setFormData({ name: "", type: "CLINIC" as OrgType, address: "", phone: "" });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Organisations</h1>
          <p className="text-slate-500 mt-2">Gérez les cliniques, laboratoires et cabinets.</p>
        </div>
        <Button variant="gradient" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une organisation
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : orgs?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">Aucune organisation</h3>
          <p className="text-slate-500 mt-2">Commencez par créer votre première organisation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs?.map((org, i) => (
            <motion.div key={org.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/organizations/${org.id}`}>
                <Card className="h-full hover-lift cursor-pointer group">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 border-none">{org.type}</Badge>
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{org.name}</h3>
                    
                    <div className="space-y-2 mt-auto pt-4 border-t border-slate-100">
                      {org.address && (
                        <div className="flex items-center text-slate-500 text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-slate-400" /> {org.address}
                        </div>
                      )}
                      {org.phone && (
                        <div className="flex items-center text-slate-500 text-sm">
                          <Phone className="w-4 h-4 mr-2 text-slate-400" /> {org.phone}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 flex items-center text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      Voir détails <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nouvelle Organisation">
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'organisation</Label>
            <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Clinique Pasteur" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select 
              id="type"
              className="flex h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all"
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value as OrgType})}
            >
              {Object.values(OrgType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Adresse complète" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Ex: +216 71..." />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
            <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Création..." : "Créer"}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
