import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";

import ClientHome from "@/pages/client/client-home";
import BookAppointment from "@/pages/client/book-appointment";
import MyAppointments from "@/pages/client/my-appointments";
import ClientQueueStatus from "@/pages/client/queue-status";

import ClinicDashboard from "@/pages/clinic/clinic-dashboard";
import ClinicQueue from "@/pages/clinic/clinic-queue";
import ClinicAppointments from "@/pages/clinic/clinic-appointments";
import ClinicCallScreen from "@/pages/clinic/clinic-call-screen";

import AdminDashboard from "@/pages/admin/admin-dashboard";
import AdminOrganizations from "@/pages/admin/admin-organizations";
import AdminUsers from "@/pages/admin/admin-users";

import { CallScreen } from "@/pages/call-screen";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function ProtectedRoute({
  component: Component,
  allowedRoles,
}: {
  component: React.ComponentType;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "ADMIN") return <Redirect to="/admin" />;
    if (user.role === "CLINIC") return <Redirect to="/clinic" />;
    return <Redirect to="/client" />;
  }

  return <Component />;
}

function AuthRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect to="/login" />;
  if (user.role === "ADMIN") return <Redirect to="/admin" />;
  if (user.role === "CLINIC") return <Redirect to="/clinic" />;
  return <Redirect to="/client" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      <Route path="/client">
        <ProtectedRoute component={ClientHome} allowedRoles={["CLIENT"]} />
      </Route>
      <Route path="/client/book">
        <ProtectedRoute component={BookAppointment} allowedRoles={["CLIENT"]} />
      </Route>
      <Route path="/client/appointments">
        <ProtectedRoute component={MyAppointments} allowedRoles={["CLIENT"]} />
      </Route>
      <Route path="/client/queue">
        <ProtectedRoute component={ClientQueueStatus} allowedRoles={["CLIENT"]} />
      </Route>

      <Route path="/clinic">
        <ProtectedRoute component={ClinicDashboard} allowedRoles={["CLINIC"]} />
      </Route>
      <Route path="/clinic/queue">
        <ProtectedRoute component={ClinicQueue} allowedRoles={["CLINIC"]} />
      </Route>
      <Route path="/clinic/appointments">
        <ProtectedRoute component={ClinicAppointments} allowedRoles={["CLINIC"]} />
      </Route>
      <Route path="/clinic/call-screen">
        <ProtectedRoute component={ClinicCallScreen} allowedRoles={["CLINIC"]} />
      </Route>

      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRoles={["ADMIN"]} />
      </Route>
      <Route path="/admin/organizations">
        <ProtectedRoute component={AdminOrganizations} allowedRoles={["ADMIN"]} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsers} allowedRoles={["ADMIN"]} />
      </Route>

      <Route path="/call-screen/:serviceId" component={CallScreen} />

      <Route path="/" component={AuthRedirect} />
      <Route path="/dashboard" component={AuthRedirect} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
