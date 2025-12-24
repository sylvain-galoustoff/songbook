import type { JSX } from "react";
import { useNavigate } from "react-router"

interface PrivateRouteProps {
  children: JSX.Element;
  isAuthenticated: boolean;
}

const PrivateRoute = ({ children, isAuthenticated }: PrivateRouteProps) => {
	const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate("/login");
  }
  return children;
};

export default PrivateRoute;
