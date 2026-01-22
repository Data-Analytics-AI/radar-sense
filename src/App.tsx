import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import LiveMonitoring from "./pages/LiveMonitoring";
import Alerts from "./pages/Alerts";
import Cases from "./pages/Cases";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Rules from "./pages/Rules";
import Models from "./pages/Models";
import Graph from "./pages/Graph";
import AIAssistant from "./pages/AIAssistant";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/monitoring" element={<LiveMonitoring />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/models" element={<Models />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
