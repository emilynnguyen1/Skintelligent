import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import LoadingScreen from "./components/LoadingScreen";
import Nav from "./components/Nav";
import { ProtectedRoute, PublicOnlyRoute } from "./components/RouteGuards";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import LookupPage from "./pages/LookupPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage from "./pages/ProfilePage";
import SavedPage from "./pages/SavedPage";
import SignupPage from "./pages/SignupPage";
import { useAuth } from "./providers/AuthProvider";

const navHiddenRoutes = new Set(["/login", "/signup", "/onboarding"]);

export default function App() {
  const location = useLocation();
  const { isLoading } = useAuth();
  const showNav = !navHiddenRoutes.has(location.pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="app-shell">
      {showNav ? <Nav /> : null}
      <main className="route-stage">
        <div key={`${location.pathname}${location.search}`} className="route-stage__page">
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />

            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/lookup" element={<LookupPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/products/:productId" element={<ProductDetailPage />} />
            </Route>
          </Routes>
        </div>
      </main>
      <LoadingScreen
        active={isLoading}
        eyebrow="Opening Skintelligent"
        title="Give Us a Moment While We Prepare Your Dashboard"
        message="We’re checking your session and getting the right experience ready for you."
        chips={["Restoring your session", "Preparing your route", "Loading your workspace"]}
      />
    </div>
  );
}
