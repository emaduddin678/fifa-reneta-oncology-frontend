import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import Root from "./components/Root";
import ProtectedRoute from "./components/ProtectedRoute";
import ToffeeCoupon from "./components/screens/ToffeeCoupon";

const SplashScreen = lazy(() => import("./components/screens/SplashScreen"));
const LoginScreen = lazy(() => import("./components/screens/LoginScreen"));
const ForgotPasswordScreen = lazy(
  () => import("./components/screens/ForgotPasswordScreen"),
);
const RegistrationScreen = lazy(
  () => import("./components/screens/RegistrationScreen"),
);
const HomeDashboard = lazy(() => import("./components/screens/HomeDashboard"));
const LiveStreamScreen = lazy(
  () => import("./components/screens/LiveStreamScreen"),
);
const HighlightsScreen = lazy(
  () => import("./components/screens/HighlightsScreen"),
);
const PredictionScreen = lazy(
  () => import("./components/screens/PredictionScreen"),
);
const QuizScreen = lazy(() => import("./components/screens/QuizScreen"));
const PhotoboothScreen = lazy(
  () => import("./components/screens/PhotoboothScreen"),
);
const MiniGameScreen = lazy(
  () => import("./components/screens/MiniGameScreen"),
);
const LeaderboardScreen = lazy(
  () => import("./components/screens/LeaderboardScreen"),
);
const AdminDashboard = lazy(
  () => import("./components/screens/AdminDashboard"),
);
const FinalCTAScreen = lazy(
  () => import("./components/screens/FinalCTAScreen"),
);
const FixtureScreen = lazy(() => import("./components/screens/FixtureScreen"));
const LiveDashboard = lazy(() => import("./components/screens/LiveDashboard"));

const wrap = (Component: React.ComponentType) => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#1A1A2E]/60">Loading...</div>
      </div>
    }
  >
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      // Public routes
      { index: true, element: wrap(SplashScreen) },
      { path: "login", element: wrap(LoginScreen) },
      { path: "forgot-password", element: wrap(ForgotPasswordScreen) },

      // Authenticated but not yet registered
      {
        element: <ProtectedRoute requireRegistered={false} />,
        children: [{ path: "register", element: wrap(RegistrationScreen) }],
      },

      // Fully authenticated + registered
      {
        element: <ProtectedRoute />,
        children: [
          { path: "home", element: wrap(HomeDashboard) },
          { path: "live", element: wrap(LiveStreamScreen) },
          { path: "highlights", element: wrap(HighlightsScreen) },
          { path: "predict", element: wrap(PredictionScreen) },
          { path: "quiz", element: wrap(QuizScreen) },
          { path: "photobooth", element: wrap(PhotoboothScreen) },
          { path: "game", element: wrap(MiniGameScreen) },
          { path: "leaderboard", element: wrap(LeaderboardScreen) },
          // { path: "admin", element: wrap(AdminDashboard) },
          { path: "cta", element: wrap(FinalCTAScreen) },
          { path: "fixture", element: wrap(FixtureScreen) },
          { path: "live-dashboard", element: wrap(LiveDashboard) },
          { path: "toffee-coupon", element: wrap(ToffeeCoupon) },
        ],
      },
    ],
  },
]);
