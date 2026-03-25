import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { Building2, Users, Calendar, TrendingUp, ArrowRight } from "lucide-react";

interface Organization { id: number; name: string; orgType: string; city?: string; isActive: boolean; }
interface DashboardStats { totalPatientsInQueue: number; totalPatientsServedToday: number; averageWaitTimeMinutes: number; totalAppointmentsToday: number; totalOrganizations: number; }

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Organization[]>("/organizations"),
      apiFetch<DashboardStats>("/dashboard/stats"),
    ]).then(([o, s]) => { setOrgs(o); setStats(s); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord administrateur</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de la plateforme WaitLess</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Organisations", value: stats?.totalOrganizations ?? orgs.length, icon: Building2, color: "violet" },
            { label: "En attente", value: stats?.totalPatientsInQueue ?? 0, icon: Users, color: "blue" },
            { label: "RDV aujourd'hui", value: stats?.totalAppointmentsToday ?? 0, icon: Calendar, color: "emerald" },
            { label: "Temps moyen", value: stats ? `${stats.averageWaitTimeMinutes} min` : "—", icon: TrendingUp, color: "amber" },
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

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Organisations</h2>
          <Button size="sm" onClick={() => setLocation("/admin/organizations")}>
            Gérer <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : orgs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune organisation</p>
              <Button className="mt-4" onClick={() => setLocation("/admin/organizations")}>Ajouter une organisation</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {orgs.slice(0, 6).map(org => (
              <Card key={org.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation("/admin/organizations")}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{org.name}</p>
                    <p className="text-sm text-gray-500">{org.orgType}{org.city ? ` · ${org.city}` : ""}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${org.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {org.isActive ? "Actif" : "Inactif"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
