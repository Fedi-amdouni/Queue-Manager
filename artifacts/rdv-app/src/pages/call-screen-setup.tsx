import * as React from "react";
import { useLocation } from "wouter";
import { 
  useGetOrganizations,
  useGetServicesByOrganization,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MonitorPlay } from "lucide-react";

export function CallScreenSetup() {
  const [, setLocation] = useLocation();
  const [selectedOrg, setSelectedOrg] = React.useState<number | "">("");
  const [selectedSvc, setSelectedSvc] = React.useState<number | "">("");

  const { data: orgs } = useGetOrganizations();
  const { data: services } = useGetServicesByOrganization(selectedOrg as number, { query: { enabled: !!selectedOrg } });

  const launchScreen = () => {
    if (selectedSvc) {
      // Open in a new window/tab ideally, but wouter location works too
      window.open(`/call-screen/${selectedSvc}`, '_blank');
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Configuration Écran d'appel</h1>
        <p className="text-slate-500 mt-2">Lancez l'affichage plein écran pour la salle d'attente.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="border-none shadow-xl">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-blue-100 text-primary rounded-2xl flex items-center justify-center mb-6">
              <MonitorPlay className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-6">Sélectionnez le service à afficher</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Organisation</Label>
                <select 
                  className="flex h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-base focus-visible:outline-none focus-visible:border-primary transition-all"
                  value={selectedOrg} onChange={e => { setSelectedOrg(Number(e.target.value) || ""); setSelectedSvc(""); }}
                >
                  <option value="">Sélectionnez...</option>
                  {orgs?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Service</Label>
                <select 
                  className="flex h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-base focus-visible:outline-none focus-visible:border-primary transition-all disabled:opacity-50"
                  value={selectedSvc} onChange={e => setSelectedSvc(Number(e.target.value) || "")} disabled={!selectedOrg}
                >
                  <option value="">Sélectionnez...</option>
                  {services?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              
              <Button size="lg" className="w-full text-lg h-14" variant="gradient" disabled={!selectedSvc} onClick={launchScreen}>
                Lancer l'écran (Nouvel onglet)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
