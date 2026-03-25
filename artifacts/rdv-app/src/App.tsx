import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import { Dashboard } from "@/pages/dashboard";
import { Organizations } from "@/pages/organizations";
import { OrganizationDetails } from "@/pages/organization-details";
import { Appointments } from "@/pages/appointments";
import { Queue } from "@/pages/queue";
import { CallScreenSetup } from "@/pages/call-screen-setup";
import { CallScreen } from "@/pages/call-screen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/organizations" component={Organizations} />
      <Route path="/organizations/:id" component={OrganizationDetails} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/queue" component={Queue} />
      <Route path="/call-screen-setup" component={CallScreenSetup} />
      <Route path="/call-screen/:serviceId" component={CallScreen} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
