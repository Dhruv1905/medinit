import { useAuth } from "../../context/Authcontext";
import { Box, Typography, Grid, Card, CardContent, CardActionArea, Chip } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HistoryIcon from "@mui/icons-material/History";
import DescriptionIcon from "@mui/icons-material/Description";
import EmergencyIcon from "@mui/icons-material/Emergency";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import { useNavigate } from "react-router-dom";

const quickActions = [
  {
    label: "Book Appointment",
    desc: "Schedule a visit with a doctor",
    path: "/dashboard/appointments/book",
    icon: <CalendarMonthIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #3B82F6, #60A5FA)",
    shadow: "rgba(59, 130, 246, 0.25)",
  },
  {
    label: "My Appointments",
    desc: "View upcoming & past visits",
    path: "/dashboard/appointments",
    icon: <AssignmentIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #06B6D4, #22D3EE)",
    shadow: "rgba(6, 182, 212, 0.25)",
  },
  {
    label: "Visit History",
    desc: "Complete medical visit log",
    path: "/dashboard/history",
    icon: <HistoryIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #10B981, #34D399)",
    shadow: "rgba(16, 185, 129, 0.25)",
  },
  {
    label: "Medical Certificates",
    desc: "Request & download certificates",
    path: "/dashboard/certificates",
    icon: <DescriptionIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
    shadow: "rgba(139, 92, 246, 0.25)",
  },
  {
    label: "Emergency",
    desc: "Report an emergency case",
    path: "/dashboard/emergency",
    icon: <EmergencyIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #EF4444, #F87171)",
    shadow: "rgba(239, 68, 68, 0.25)",
  },
];

const PatientHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <Box>
      {/* Welcome banner */}
      <Box
        sx={{
          p: 4,
          borderRadius: 5,
          background: "linear-gradient(135deg, #1E3A5F 0%, #1D4ED8 50%, #3B82F6 100%)",
          color: "white",
          mb: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glass shapes */}
        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            top: -70,
            right: -50,
            animation: "float-slow 10s ease-in-out infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            bottom: -40,
            right: 120,
            animation: "float-reverse 12s ease-in-out infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            top: 30,
            left: "60%",
            animation: "float 8s ease-in-out infinite",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WavingHandIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{ fontFamily: "'Outfit', sans-serif" }}>
              {getGreeting()}, {user?.name?.split(" ")[0]}!
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 500, ml: 7 }}>
            Welcome to MediNIT clinic portal. How can we help you today?
          </Typography>

          {/* Glass stats pills */}
          <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
            <Chip
              label={`ID: ${user?.instituteId}`}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                fontWeight: 500,
                fontSize: "0.75rem",
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Quick actions */}
      <Typography
        variant="h6"
        fontWeight={600}
        mb={2.5}
        color="text.primary"
        sx={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Quick Actions
      </Typography>

      <Grid container spacing={2.5}>
        {quickActions.map((action, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={action.path}>
            <Card
              className={`animate-fade-in stagger-${index + 1}`}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: `0 20px 40px ${action.shadow}`,
                },
              }}
            >
              <CardActionArea onClick={() => navigate(action.path)} sx={{ p: 3 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      background: action.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      mb: 2.5,
                      boxShadow: `0 8px 20px ${action.shadow}`,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                    {action.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.desc}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PatientHome;