import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EscolherPlano from "./pages/EscolherPlano";
import CriarEmpresa from "./pages/CriarEmpresa";
import Convite from "./pages/Convite";
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
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/escolher-plano" element={<EscolherPlano />} />
            <Route path="/criar-empresa" element={<CriarEmpresa />} />
            <Route path="/convite/:token" element={<Convite />} />
            <Route
              path="/diagnostico"
              element={
                <ProtectedRoute>
                  <Diagnostico />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/modelo-de-negocio"
              element={
                <ProtectedRoute>
                  <ModeloDeNegocio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mapa-de-empatia"
              element={
                <ProtectedRoute>
                  <MapaDeEmpatia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/filosofia"
              element={
                <ProtectedRoute>
                  <Filosofia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/swot"
              element={
                <ProtectedRoute>
                  <Swot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/okrs"
              element={
                <ProtectedRoute>
                  <Okrs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/indicadores"
              element={
                <ProtectedRoute>
                  <Indicadores />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plano-de-acao"
              element={
                <ProtectedRoute>
                  <PlanoDeAcao />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rotinas"
              element={
                <ProtectedRoute>
                  <Rotinas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
