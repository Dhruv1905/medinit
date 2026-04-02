import { useState } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import InputAdornment from "@mui/material/InputAdornment";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #0E4D73 0%, #1B6DA1 50%, #4BA3D8 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background circles */}
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          top: -100,
          left: -100,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
          bottom: -50,
          right: -50,
        }}
      />

      {/* Left panel - Branding */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 6,
          color: "white",
          zIndex: 1,
        }}
      >
        <LocalHospitalIcon sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight={700} mb={1}>
          MediNIT
        </Typography>
        <Typography variant="h6" fontWeight={300} textAlign="center" sx={{ opacity: 0.85, maxWidth: 400 }}>
          Institute Clinic Management System
        </Typography>
        <Divider sx={{ width: 60, borderColor: "rgba(255,255,255,0.4)", my: 3 }} />
        <Stack spacing={1.5} sx={{ opacity: 0.75 }}>
          <Typography variant="body2" textAlign="center">
            Seamless appointment booking
          </Typography>
          <Typography variant="body2" textAlign="center">
            Digital prescriptions & medical records
          </Typography>
          <Typography variant="body2" textAlign="center">
            Emergency priority handling
          </Typography>
        </Stack>
      </Box>

      {/* Right panel - Login form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          zIndex: 1,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 440,
            p: { xs: 2, sm: 3 },
            backdropFilter: "blur(10px)",
          }}
        >
          <CardContent>
            {/* Mobile logo */}
            <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 2 }}>
              <LocalHospitalIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </Box>

            <Typography variant="h5" textAlign="center" color="primary.dark" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body2" textAlign="center" color="text.secondary" mb={4}>
              Sign in with your institute credentials
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Institute Email"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@nitw.ac.in"
                sx={{ mb: 2.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  background: "linear-gradient(135deg, #1B6DA1, #4BA3D8)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0E4D73, #1B6DA1)",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Sign In"}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Typography variant="body2" textAlign="center">
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "#1B6DA1",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Create Account
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;