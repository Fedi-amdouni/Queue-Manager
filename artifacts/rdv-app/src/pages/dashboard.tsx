import { useGetDashboardStats } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, CheckCircle2, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export function Dashboard() {
  const { data: stats, isLoading, isError } = useGetDashboardStats({
    query: { refetchInterval: 30000 } // real-time updates every 30s
  });

  if (isLoading) return <Layout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div></Layout>;
  if (isError) return <Layout><div className="text-red-500 p-4 bg-red-50 rounded-xl">Erreur de chargement des statistiques.</div></Layout>;

  const statCards = [
    { title: "Patients en attente", value: stats?.totalWaiting || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Patients servis (Aujourd'hui)", value: stats?.totalServedToday || 0, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
    { title: "Temps d'attente moyen", value: `${stats?.avgWaitMinutes || 0} min`, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
    { title: "RDV Aujourd'hui", value: stats?.totalAppointmentsToday || 0, icon: Calendar, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Organisations", value: stats?.totalOrganizations || 0, icon: Building2, color: "text-slate-600", bg: "bg-slate-100" },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-2 text-lg">Aperçu en temps réel de l'activité.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover-lift overflow-hidden border-none shadow-lg shadow-slate-200/40">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${stat.bg}`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <h3 className="text-3xl font-display font-bold text-slate-900 mb-1">{stat.value}</h3>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-gradient-to-br from-primary to-blue-600 rounded-3xl shadow-xl shadow-primary/20 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-bold mb-4">Gérez vos files d'attente intelligemment</h2>
          <p className="text-blue-100 max-w-2xl text-lg leading-relaxed">
            WaitLess permet de réduire l'attente en salle et d'optimiser le flux des patients dans vos différents services. 
            Naviguez vers "File d'attente" pour prendre le contrôle en temps réel.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-400/20 rounded-full blur-2xl"></div>
      </div>
    </Layout>
  );
}
