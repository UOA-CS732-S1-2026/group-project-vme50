import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { isAuthenticated } from "../../utils/auth.util";

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
