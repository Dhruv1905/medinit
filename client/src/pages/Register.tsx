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
  MenuItem,
  Divider,
  Grid,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import InputAdornment from "@mui/material/InputAdornment";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BloodtypeOutlinedIcon from "@mui/icons-material/BloodtypeOutlined";

const roles = [
  { value: "student", label: "Student" },
  { value: "faculty", label: "Faculty / Staff" },
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "pharmacist", label: "Pharmacist" },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    instituteId: "",
    role: "student",
    phone: "",
    bloodGroup: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #0D6E6E 0%, #2D82B7 50%, #0D6E6E 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          top: -100,
          right: -100,
        }}
      />

      {/* Left panel */}
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
          Join the campus healthcare network
        </Typography>
        <Divider sx={{ width: 60, borderColor: "rgba(255,255,255,0.4)", my: 3 }} />
        <Typography variant="body2" sx={{ opacity: 0.75, maxWidth: 350, textAlign: "center" }}>
          Register with your institute email to access appointments, prescriptions, medical certificates, and more.
        </Typography>
      </Box>

      {/* Right panel - Register form */}
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
        <Card sx={{ width: "100%", maxWidth: 500, p: { xs: 2, sm: 3 } }}>
          <CardContent>
            <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 2 }}>
              <LocalHospitalIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </Box>

            <Typography variant="h5" textAlign="center" color="primary.dark" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" textAlign="center" color="text.secondary" mb={3}>
              Fill in your details to get started
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Full Name"
                name="name"
                fullWidth
                required
                value={form.name}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <TextField
                    label="Institute Email"
                    name="email"
                    type="email"
                    fullWidth
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@nitw.ac.in"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    label="Institute ID"
                    name="instituteId"
                    fullWidth
                    required
                    value={form.instituteId}
                    onChange={handleChange}
                    placeholder="CS2021001"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                required
                value={form.password}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Role"
                name="role"
                select
                fullWidth
                value={form.role}
                onChange={handleChange}
                sx={{ mb: 2 }}
              >
                {roles.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </TextField>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Phone (optional)"
                    name="phone"
                    fullWidth
                    value={form.phone}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Blood Group (optional)"
                    name="bloodGroup"
                    fullWidth
                    value={form.bloodGroup}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BloodtypeOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  background: "linear-gradient(135deg, #0D6E6E, #2D82B7)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #094F4F, #1A5F8A)",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Create Account"}
              </Button>
            </form>

            <Divider sx={{ my: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Typography variant="body2" textAlign="center">
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#1B6DA1", fontWeight: 600, textDecoration: "none" }}>
                Sign In
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Register;