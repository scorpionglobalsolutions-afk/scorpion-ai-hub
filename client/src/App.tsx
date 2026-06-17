import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Analytics from "./pages/Analytics";
import Webhooks from "./pages/Webhooks";
import Billing from "./pages/Billing";
import Scheduling from "./pages/Scheduling";
import ModulesRouter from "./pages/ModulesRouter";
import ProspectFinder from "./pages/ProspectFinder";
import ClientDetail from "./pages/ClientDetail";
import LeadsInbox from "./pages/LeadsInbox";

function Router() {
  return (
    <Switch>
      {/* Public landing page — no sidebar */}
      <Route path="/" component={Home} />
      {/* All authenticated pages wrapped in DashboardLayout for persistent sidebar */}
      <Route path="/dashboard">
        <DashboardLayout><Dashboard /></DashboardLayout>
      </Route>
      <Route path="/clients">
        <DashboardLayout><Clients /></DashboardLayout>
      </Route>
      <Route path="/clients/:id">
        <DashboardLayout><ClientDetail /></DashboardLayout>
      </Route>
      <Route path="/analytics">
        <DashboardLayout><Analytics /></DashboardLayout>
      </Route>
      <Route path="/webhooks">
        <DashboardLayout><Webhooks /></DashboardLayout>
      </Route>
      <Route path="/billing">
        <DashboardLayout><Billing /></DashboardLayout>
      </Route>
      <Route path="/scheduling">
        <DashboardLayout><Scheduling /></DashboardLayout>
      </Route>
      <Route path="/prospect-finder">
        <DashboardLayout><ProspectFinder /></DashboardLayout>
      </Route>
      <Route path="/leads">
        <DashboardLayout><LeadsInbox /></DashboardLayout>
      </Route>
      <Route path="/modules/:moduleId">
        <DashboardLayout><ModulesRouter /></DashboardLayout>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
