import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Stack,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SubjectIcon from "@mui/icons-material/Subject";
import SendIcon from "@mui/icons-material/Send";
import InputAdornment from "@mui/material/InputAdornment";

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await api.post("/contact", { name, email, subject, message });
      setSuccess(res.data.message);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const textFieldSx = {
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
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#60A5FA" },
  };

  const contactItems = [
    {
      icon: <EmailOutlinedIcon sx={{ fontSize: 22, color: "#60A5FA" }} />,
      label: "Email Us",
      value: "admin@nitw.ac.in",
      subtext: "We'll respond within 24 hours",
      href: "mailto:admin@nitw.ac.in",
    },
    {
      icon: <PhoneOutlinedIcon sx={{ fontSize: 22, color: "#60A5FA" }} />,
      label: "Call Us",
      value: "+91-870-246-2020",
      subtext: "Mon-Sat, 9 AM – 5 PM IST",
      href: "tel:+918702462020",
    },
    {
      icon: <LocationOnOutlinedIcon sx={{ fontSize: 22, color: "#60A5FA" }} />,
      label: "Visit Us",
      value: "NIT Warangal Health Center",
      subtext: "Warangal, Telangana 506004",
      href: undefined,
    },
    {
      icon: <AccessTimeOutlinedIcon sx={{ fontSize: 22, color: "#60A5FA" }} />,
      label: "Working Hours",
      value: "Mon – Sat: 9 AM – 5 PM",
      subtext: "Emergency: 24/7 Available",
      href: undefined,
    },
  ];

  return (
    <Box className="auth-bg" sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Floating glass orbs */}
      <div className="glass-orb glass-orb-1" />
      <div className="glass-orb glass-orb-2" />
      <div className="glass-orb glass-orb-3" />
      <div className="glass-orb glass-orb-4" />
      <div className="glass-orb glass-orb-5" />

      {/* Left panel - Contact Info */}
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
        {/* Logo */}
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
          Get in Touch
        </Typography>
        <Typography
          variant="h6"
          fontWeight={300}
          textAlign="center"
          sx={{ opacity: 0.85, maxWidth: 400, mb: 1 }}
        >
          We're here to help you
        </Typography>

        <Divider sx={{ width: 60, borderColor: "rgba(255,255,255,0.3)", my: 4 }} />

        {/* Contact cards */}
        <Stack spacing={2} sx={{ maxWidth: 340, width: "100%" }}>
          {contactItems.map((item, i) => (
            <Box
              key={i}
              component={item.href ? "a" : "div"}
              href={item.href}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                px: 2.5,
                py: 2,
                borderRadius: 3,
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.25s ease",
                textDecoration: "none",
                color: "inherit",
                cursor: item.href ? "pointer" : "default",
                "&:hover": item.href
                  ? {
                      background: "rgba(255,255,255,0.14)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      transform: "translateY(-2px)",
                    }
                  : {},
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  background: "rgba(96, 165, 250, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.6, fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.4 }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.5 }}>
                  {item.subtext}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Right panel - Contact Form */}
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
            maxWidth: 480,
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
            {/* Mobile header */}
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
              Send us a Message
            </Typography>
            <Typography
              variant="body2"
              textAlign="center"
              mb={4}
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              Fill out the form and we'll get back to you shortly
            </Typography>

            {/* Mobile contact info cards */}
            <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1, mb: 3, flexWrap: "wrap" }}>
              <Box
                component="a"
                href="mailto:admin@nitw.ac.in"
                sx={{
                  flex: 1,
                  minWidth: "45%",
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  textDecoration: "none",
                  color: "inherit",
                  textAlign: "center",
                }}
              >
                <EmailOutlinedIcon sx={{ fontSize: 18, color: "#60A5FA", mb: 0.5 }} />
                <Typography variant="caption" display="block" sx={{ opacity: 0.8, fontSize: "0.65rem" }}>
                  admin@nitw.ac.in
                </Typography>
              </Box>
              <Box
                component="a"
                href="tel:+918702462020"
                sx={{
                  flex: 1,
                  minWidth: "45%",
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  textDecoration: "none",
                  color: "inherit",
                  textAlign: "center",
                }}
              >
                <PhoneOutlinedIcon sx={{ fontSize: 18, color: "#60A5FA", mb: 0.5 }} />
                <Typography variant="caption" display="block" sx={{ opacity: 0.8, fontSize: "0.65rem" }}>
                  +91-870-246-2020
                </Typography>
              </Box>
            </Box>

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
            {success && (
              <Alert
                severity="success"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  background: "rgba(34, 197, 94, 0.15)",
                  backdropFilter: "blur(8px)",
                  color: "#86efac",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  "& .MuiAlert-icon": { color: "#86efac" },
                }}
              >
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Your Name"
                  fullWidth
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={textFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={textFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <TextField
                label="Subject"
                fullWidth
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                sx={textFieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SubjectIcon sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Your Message"
                fullWidth
                required
                multiline
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                inputProps={{ maxLength: 2000 }}
                helperText={`${message.length}/2000`}
                sx={{
                  ...textFieldSx,
                  mb: 3,
                  "& .MuiFormHelperText-root": { color: "rgba(255,255,255,0.4)", textAlign: "right" },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                startIcon={!loading && <SendIcon />}
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
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Send Message"}
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

            <Typography variant="body2" textAlign="center" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Back to{" "}
              <Link to="/login" style={{ color: "#60A5FA", fontWeight: 600, textDecoration: "none" }}>
                Sign In
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ContactUs;
