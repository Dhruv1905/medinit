import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import { CircularProgress, Box } from "@mui/material";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
};

export default ProtectedRoute;