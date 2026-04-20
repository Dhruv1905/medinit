import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  IconButton,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InputAdornment from "@mui/material/InputAdornment";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSuccess(res.data.message);
      setStep(2);
      setCountdown(60);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email, otp: otpString });
      setSuccess("OTP verified! Set your new password.");
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const otpString = otp.join("");
      await api.post("/auth/reset-password", { email, otp: otpString, newPassword });
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess("A new OTP has been sent to your email.");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // OTP input handling
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasteData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasteData[i] || "";
      }
      setOtp(newOtp);
      const nextEmpty = pasteData.length < 6 ? pasteData.length : 5;
      otpRefs.current[nextEmpty]?.focus();
    }
  };

  // Common text field styles
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

  // Step titles/descriptions
  const stepInfo = {
    1: { title: "Forgot Password?", desc: "Enter your institute email to receive a verification OTP" },
    2: { title: "Verify OTP", desc: `Enter the 6-digit code sent to ${email}` },
    3: { title: "New Password", desc: "Create a strong password for your account" },
    4: { title: "Password Reset!", desc: "Your password has been reset successfully" },
  };

  // Progress indicator
  const StepIndicator = () => (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
      {[1, 2, 3].map((s) => (
        <Box
          key={s}
          sx={{
            width: step >= s ? 32 : 8,
            height: 8,
            borderRadius: 4,
            background:
              step >= s
                ? "linear-gradient(135deg, #3B82F6, #60A5FA)"
                : "rgba(255,255,255,0.15)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: step >= s ? "0 0 12px rgba(96,165,250,0.4)" : "none",
          }}
        />
      ))}
    </Box>
  );

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

        <Divider sx={{ width: 60, borderColor: "rgba(255,255,255,0.3)", my: 4 }} />

        {/* Security info */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderRadius: 3,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.1)",
            maxWidth: 320,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.7 }}>
            🔒 Your OTP is valid for <strong>10 minutes</strong> and can only be used once.
            We never share your data with third parties.
          </Typography>
        </Box>
      </Box>

      {/* Right panel - Form */}
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
            {/* Back button */}
            {step < 4 && (
              <IconButton
                onClick={() => {
                  if (step === 1) navigate("/login");
                  else setStep((step - 1) as 1 | 2 | 3);
                }}
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  mb: 1,
                  "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}

            {step < 4 && <StepIndicator />}

            <Typography
              variant="h5"
              textAlign="center"
              fontWeight={700}
              gutterBottom
              sx={{ color: "white", fontFamily: "'Outfit', sans-serif" }}
            >
              {stepInfo[step].title}
            </Typography>
            <Typography
              variant="body2"
              textAlign="center"
              mb={4}
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              {stepInfo[step].desc}
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
            {success && step !== 4 && (
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

            {/* Step 1: Email input */}
            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <TextField
                  label="Institute Email"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@nitw.ac.in"
                  sx={textFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
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
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
                    boxShadow: "0 8px 32px rgba(59, 130, 246, 0.35)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
                      boxShadow: "0 12px 40px rgba(59, 130, 246, 0.45)",
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Send OTP"}
                </Button>
              </form>
            )}

            {/* Step 2: OTP input */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                    mb: 3,
                  }}
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, i) => (
                    <TextField
                      key={i}
                      inputRef={(el) => (otpRefs.current[i] = el)}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      inputProps={{
                        maxLength: 1,
                        style: {
                          textAlign: "center",
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          fontFamily: "'Courier New', monospace",
                          padding: "12px 0",
                          width: "100%",
                        },
                      }}
                      sx={{
                        width: 50,
                        "& .MuiOutlinedInput-root": {
                          background: digit
                            ? "rgba(96, 165, 250, 0.15)"
                            : "rgba(255,255,255,0.08)",
                          backdropFilter: "blur(8px)",
                          color: "white",
                          borderRadius: 2,
                          transition: "all 0.2s ease",
                          "& fieldset": {
                            borderColor: digit
                              ? "rgba(96, 165, 250, 0.5)"
                              : "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                          "&.Mui-focused fieldset": {
                            borderColor: "#60A5FA",
                            boxShadow: "0 0 0 3px rgba(96,165,250,0.2)",
                          },
                        },
                      }}
                    />
                  ))}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading || otp.join("").length !== 6}
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
                  {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Verify OTP"}
                </Button>

                <Typography
                  variant="body2"
                  textAlign="center"
                  mt={2}
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {countdown > 0 ? (
                    <>Resend OTP in <strong style={{ color: "#60A5FA" }}>{countdown}s</strong></>
                  ) : (
                    <Button
                      onClick={handleResendOtp}
                      disabled={loading}
                      sx={{
                        color: "#60A5FA",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { background: "rgba(96,165,250,0.1)" },
                      }}
                    >
                      Resend OTP
                    </Button>
                  )}
                </Typography>
              </form>
            )}

            {/* Step 3: New password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword}>
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  sx={textFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{ ...textFieldSx, mb: 3.5 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
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
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
                    boxShadow: "0 8px 32px rgba(59, 130, 246, 0.35)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
                      boxShadow: "0 12px 40px rgba(59, 130, 246, 0.45)",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "rgba(34, 197, 94, 0.15)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                    animation: "pulse-glow 2s ease-in-out infinite",
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 40, color: "#86efac" }} />
                </Box>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
                  Your password has been reset successfully. You can now sign in with your new
                  password.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => navigate("/login")}
                  sx={{
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #22c55e, #4ade80)",
                    boxShadow: "0 8px 32px rgba(34, 197, 94, 0.35)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #16a34a, #22c55e)",
                      boxShadow: "0 12px 40px rgba(34, 197, 94, 0.45)",
                    },
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            )}

            {step === 1 && (
              <>
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
                <Typography
                  variant="body2"
                  textAlign="center"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    style={{ color: "#60A5FA", fontWeight: 600, textDecoration: "none" }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
