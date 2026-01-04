import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Diagnostico from "./pages/Diagnostico";
import Dashboard from "./pages/Dashboard";
import ModeloDeNegocio from "./pages/ModeloDeNegocio";
import MapaDeEmpatia from "./pages/MapaDeEmpatia";
import Filosofia from "./pages/Filosofia";
import Swot from "./pages/Swot";
import Okrs from "./pages/Okrs";
import Indicadores from "./pages/Indicadores";
import PlanoDeAcao from "./pages/PlanoDeAcao";
import Rotinas from "./pages/Rotinas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/diagnostico" element={<Diagnostico />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/modelo-de-negocio" element={<ModeloDeNegocio />} />
          <Route path="/mapa-de-empatia" element={<MapaDeEmpatia />} />
          <Route path="/filosofia" element={<Filosofia />} />
          <Route path="/swot" element={<Swot />} />
          <Route path="/okrs" element={<Okrs />} />
          <Route path="/indicadores" element={<Indicadores />} />
          <Route path="/plano-de-acao" element={<PlanoDeAcao />} />
          <Route path="/rotinas" element={<Rotinas />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
