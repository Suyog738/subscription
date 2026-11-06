import { MotionConfig } from "framer-motion";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { DemoClockProvider } from "./contexts/DemoClockContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { BankPage } from "./pages/dashboard/BankPage";
import { OutboxPage } from "./pages/dashboard/OutboxPage";
import { OverviewPage } from "./pages/dashboard/OverviewPage";
import { RenewalsPage } from "./pages/dashboard/RenewalsPage";
import { SettingsPage } from "./pages/dashboard/SettingsPage";
import { SubscriptionDetailPage } from "./pages/dashboard/SubscriptionDetailPage";
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
      <DemoClockProvider>
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
                <Route path="subscriptions/:id" element={<SubscriptionDetailPage />} />
                <Route path="bank" element={<BankPage />} />
                <Route path="outbox" element={<OutboxPage />} />
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
      </DemoClockProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
