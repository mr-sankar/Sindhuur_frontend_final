// components/PrivateRoute.tsx
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const storedUser = localStorage.getItem("loggedInUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Not logged in → send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction → redirect based on user type
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return user.role === "admin"
      ? <Navigate to="/admin" replace />
      : <Navigate to="/home" replace />;
  }

  return children;
};

export default PrivateRoute;
