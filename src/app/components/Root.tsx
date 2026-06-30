import { Outlet, useNavigate } from "react-router";
import { Toaster, toast } from "sonner";
import { useEffect } from "react";
import BgDesktop from "@/imports/Fifa_Worldcup_bg_Desktop.png";
import BgMobile from "@/imports/Fifa_Worldcup_bg_mobile.png";
import { clearAuth } from "@/app/lib/auth";

export default function Root() {
  const navigate = useNavigate();

  // Auto-logout when any API call returns 401 (token revoked or expired)
  useEffect(() => {
    function handleUnauthenticated() {
      clearAuth();
      toast.error("Session expired. Please log in again.");
      navigate("/login", { replace: true });
    }
    window.addEventListener("auth:unauthenticated", handleUnauthenticated);
    return () =>
      window.removeEventListener("auth:unauthenticated", handleUnauthenticated);
  }, [navigate]);

  return (
    <div className="min-h-screen relative">
      <img
        src={BgMobile}
        alt=""
        className="fixed inset-0 w-full h-full object-cover z-0 sm:hidden"
      />
      <img
        src={BgDesktop}
        alt=""
        className="fixed inset-0 w-full h-full object-cover z-0 hidden sm:block"
      />
      <div className="relative z-10 min-h-screen">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(247, 245, 240, 0.95)",
              color: "#1A1A2E",
              border: "1px solid rgba(30, 144, 255, 0.3)",
              backdropFilter: "blur(12px)",
            },
          }}
        />
        <Outlet />
      </div>
    </div>
  );
}
