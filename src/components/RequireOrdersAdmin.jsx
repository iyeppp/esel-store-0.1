import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const RequireOrdersAdmin = ({ children }) => {
  const { customer, isOrdersAdmin } = useAuth();
  const location = useLocation();

  if (!customer) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (!isOrdersAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm">
            You do not have permission to access the orders admin area.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default RequireOrdersAdmin;
