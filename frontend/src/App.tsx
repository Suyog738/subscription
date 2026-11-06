import { MotionConfig } from "framer-motion";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { OverviewPage } from "./pages/dashboard/OverviewPage";
import { RenewalsPage } from "./pages/dashboard/RenewalsPage";
import { SettingsPage } from "./pages/dashboard/SettingsPage";
import { SubscriptionsPage } from "./pages/dashboard/SubscriptionsPage";
import { LandingPage } from "./pages/LandingPage";
import { LegalPage } from "./pages/LegalPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RedirectIfAuthenticated, RequireAuth } from "./routes/guards";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/login"
                element={
                  <RedirectIfAuthenticated>
                    <LoginPage />
                  </RedirectIfAuthenticated>
                }
              />
              <Route
                path="/app"
                element={
                  <RequireAuth>
                    <DashboardLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<OverviewPage />} />
                <Route path="subscriptions" element={<SubscriptionsPage />} />
                <Route path="renewals" element={<RenewalsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="/privacy" element={<LegalPage kind="privacy" />} />
              <Route path="/terms" element={<LegalPage kind="terms" />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
      </ThemeProvider>
    </MotionConfig>
  );
}
