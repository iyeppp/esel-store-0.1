import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import RequireAdmin from "./components/RequireAdmin";
import RequireOrdersAdmin from "./components/RequireOrdersAdmin";

import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import GameDetail from "./pages/GameDetail";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import AdminOrders from "./pages/AdminOrders";
import AdminCategories from "./pages/AdminCategories";
import AdminProducts from "./pages/AdminProducts";
import AdminHome from "./pages/AdminHome";
import AdminDailyReport from "./pages/AdminDailyReport";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/game/:gameId" element={<GameDetail />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:invoiceNumber" element={<OrderDetail />} />
            <Route
              path="/admin"
              element={(
                <RequireAdmin>
                  <AdminHome />
                </RequireAdmin>
              )}
            />
            <Route
              path="/admin/orders"
              element={(
                <RequireOrdersAdmin>
                  <AdminOrders />
                </RequireOrdersAdmin>
              )}
            />
            <Route
              path="/admin/categories"
              element={(
                <RequireAdmin>
                  <AdminCategories />
                </RequireAdmin>
              )}
            />
            <Route
              path="/admin/products"
              element={(
                <RequireAdmin>
                  <AdminProducts />
                </RequireAdmin>
              )}
            />
            <Route
              path="/admin/reports/daily"
              element={(
                <RequireAdmin>
                  <AdminDailyReport />
                </RequireAdmin>
              )}
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;