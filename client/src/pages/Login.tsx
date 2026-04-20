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
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

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
    <Box className="auth-bg" sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Floating glass orbs */}
      <div className="glass-orb glass-orb-1" />
      <div className="glass-orb glass-orb-2" />
      <div className="glass-orb glass-orb-3" />
      <div className="glass-orb glass-orb-4" />
      <div className="glass-orb glass-orb-5" />

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
        {/* Glass logo container */}
        <Box
          sx={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            animation: "pulse-glow 3s ease-in-out infinite",
          }}
        >
          <LocalHospitalIcon sx={{ fontSize: 44, color: "white" }} />
        </Box>

        <Typography
          variant="h3"
          fontWeight={800}
          mb={1}
          sx={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}
        >
          MediNIT
        </Typography>
        <Typography
          variant="h6"
          fontWeight={300}
          textAlign="center"
          sx={{ opacity: 0.85, maxWidth: 400 }}
        >
          Institute Clinic Management System
        </Typography>

        <Divider
          sx={{
            width: 60,
            borderColor: "rgba(255,255,255,0.3)",
            my: 4,
          }}
        />

        {/* Feature pills */}
        <Stack spacing={2} sx={{ maxWidth: 320 }}>
          {[
            { icon: <CalendarMonthIcon sx={{ fontSize: 18 }} />, text: "Seamless appointment booking" },
            { icon: <MedicalServicesIcon sx={{ fontSize: 18 }} />, text: "Digital prescriptions & records" },
            { icon: <VerifiedUserIcon sx={{ fontSize: 18 }} />, text: "Emergency priority handling" },
          ].map((item, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2.5,
                py: 1.2,
                borderRadius: 3,
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {item.icon}
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {item.text}
              </Typography>
            </Box>
          ))}
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
          className="animate-scale-in"
          sx={{
            width: "100%",
            maxWidth: 440,
            p: { xs: 2, sm: 3 },
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.15)",
            color: "white",
          }}
        >
          <CardContent>
            {/* Mobile logo */}
            <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LocalHospitalIcon sx={{ fontSize: 28, color: "white" }} />
              </Box>
            </Box>

            <Typography
              variant="h5"
              textAlign="center"
              fontWeight={700}
              gutterBottom
              sx={{ color: "white", fontFamily: "'Outfit', sans-serif" }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body2"
              textAlign="center"
              mb={4}
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              Sign in with your institute credentials
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  background: "rgba(239, 68, 68, 0.15)",
                  backdropFilter: "blur(8px)",
                  color: "#fca5a5",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  "& .MuiAlert-icon": { color: "#fca5a5" },
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, mb: 0.8 }}
              >
                Institute Email <span style={{ color: "#f87171" }}>*</span>
              </Typography>
              <TextField
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@nitw.ac.in"
                sx={{
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#60A5FA",
                      boxShadow: "0 0 0 3px rgba(96,165,250,0.15)",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, mb: 0.8 }}
              >
                Password <span style={{ color: "#f87171" }}>*</span>
              </Typography>
              <TextField
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  mb: 3.5,
                  "& .MuiOutlinedInput-root": {
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#60A5FA",
                      boxShadow: "0 0 0 3px rgba(96,165,250,0.15)",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Forgot password link */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Link
                  to="/forgot-password"
                  style={{
                    color: "white",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
                  boxShadow: "0 8px 32px rgba(59, 130, 246, 0.35)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
                    boxShadow: "0 12px 40px rgba(59, 130, 246, 0.45)",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Sign In"}
              </Button>
            </form>

            <Divider
              sx={{
                my: 3,
                borderColor: "rgba(255,255,255,0.15)",
                "&::before, &::after": { borderColor: "rgba(255,255,255,0.15)" },
              }}
            >
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                OR
              </Typography>
            </Divider>

            <Typography variant="body2" textAlign="center" sx={{ color: "rgba(255,255,255,0.85)" }}>
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "white",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Create Account
              </Link>
            </Typography>

            <Typography
              variant="body2"
              textAlign="center"
              mt={1.5}
              sx={{ color: "rgba(255,255,255,0.85)" }}
            >
              Need help?{" "}
              <Link
                to="/contact"
                style={{
                  color: "white",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Contact Us
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;