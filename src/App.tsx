import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import AppPage from "./pages/AppPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import PricingPage from "./pages/Pricing.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import AccessCodes from "./pages/admin/AccessCodes.tsx";
import Users from "./pages/admin/Users.tsx";
import PostHistoryAdmin from "./pages/admin/PostHistoryAdmin.tsx";
import Referrals from "./pages/admin/Referrals.tsx";
import Coupons from "./pages/admin/Coupons.tsx";
import Revenue from "./pages/admin/Revenue.tsx";
import Analytics from "./pages/admin/Analytics.tsx";
import Settings from "./pages/admin/Settings.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="codes" element={<AccessCodes />} />
            <Route path="users" element={<Users />} />
            <Route path="history" element={<PostHistoryAdmin />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
