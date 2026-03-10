import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { AppLayout } from "@/components/layout";

// Public pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EscolherPlano from "./pages/EscolherPlano";
import CriarEmpresa from "./pages/CriarEmpresa";
import Convite from "./pages/Convite";
import NotFound from "./pages/NotFound";

// Protected pages (inside AppLayout)
import Dashboard from "./pages/Dashboard";
import Diagnostico from "./pages/Diagnostico";
import ModeloDeNegocio from "./pages/ModeloDeNegocio";
import MapaDeEmpatia from "./pages/MapaDeEmpatia";
import Filosofia from "./pages/Filosofia";
import Swot from "./pages/Swot";
import Okrs from "./pages/Okrs";
import Indicadores from "./pages/Indicadores";
import PlanoDeAcao from "./pages/PlanoDeAcao";
import Rotinas from "./pages/Rotinas";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes - no layout */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/escolher-plano" element={<EscolherPlano />} />
            <Route path="/criar-empresa" element={<CriarEmpresa />} />
            <Route path="/convite/:token" element={<Convite />} />

            {/* Protected routes - with AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/diagnostico" element={<Diagnostico />} />
              <Route path="/modelo-de-negocio" element={<ModeloDeNegocio />} />
              <Route path="/mapa-de-empatia" element={<MapaDeEmpatia />} />
              <Route path="/filosofia" element={<Filosofia />} />
              <Route path="/swot" element={<Swot />} />
              <Route path="/okrs" element={<Okrs />} />
              <Route path="/indicadores" element={<Indicadores />} />
              <Route path="/plano-de-acao" element={<PlanoDeAcao />} />
              <Route path="/rotinas" element={<Rotinas />} />
            </Route>

            {/* Admin routes - with AppLayout */}
            <Route
              element={
                <AdminRoute>
                  <AppLayout />
                </AdminRoute>
              }
            >
              <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
