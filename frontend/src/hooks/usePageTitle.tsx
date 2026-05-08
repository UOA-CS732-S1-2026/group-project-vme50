import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

function PageTitle({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (path === "/") {
      document.title = "Login - Platemates";
    } else if (path === "/register") {
      document.title = "Register - Platemates";
    } else if (path === "/dashboard") {
      document.title = "Dashboard - Platemates";
    } else {
      document.title = "";
    }
  }, [location.pathname]);

  return <>{children}</>;
}

export default PageTitle;
