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
    gradient: "linear-gradient(135deg, #1B6DA1, #4BA3D8)",
  },
  {
    label: "My Appointments",
    desc: "View upcoming & past visits",
    path: "/dashboard/appointments",
    icon: <AssignmentIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #0097A7, #00BCD4)",
  },
  {
    label: "Visit History",
    desc: "Complete medical visit log",
    path: "/dashboard/history",
    icon: <HistoryIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #43A047, #66BB6A)",
  },
  {
    label: "Medical Certificates",
    desc: "Request & download certificates",
    path: "/dashboard/certificates",
    icon: <DescriptionIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #7B1FA2, #AB47BC)",
  },
  {
    label: "Emergency",
    desc: "Report an emergency case",
    path: "/dashboard/emergency",
    icon: <EmergencyIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #E53935, #EF5350)",
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
          borderRadius: 4,
          background: "linear-gradient(135deg, #0E4D73 0%, #1B6DA1 50%, #4BA3D8 100%)",
          color: "white",
          mb: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative shapes */}
        <Box
          sx={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            top: -60,
            right: -40,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            bottom: -30,
            right: 100,
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <WavingHandIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700}>
              {getGreeting()}, {user?.name?.split(" ")[0]}!
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 500 }}>
            Welcome to MediNIT clinic portal. How can we help you today?
          </Typography>
          <Chip
            label={`ID: ${user?.instituteId}`}
            size="small"
            sx={{
              mt: 2,
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              fontWeight: 500,
              fontSize: "0.75rem",
            }}
          />
        </Box>
      </Box>

      {/* Quick actions */}
      <Typography variant="h6" fontWeight={600} mb={2.5} color="text.primary">
        Quick Actions
      </Typography>

      <Grid container spacing={2.5}>
        {quickActions.map((action) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={action.path}>
            <Card
              sx={{
                transition: "all 0.25s ease",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 28px rgba(27, 109, 161, 0.15)",
                },
              }}
            >
              <CardActionArea onClick={() => navigate(action.path)} sx={{ p: 3 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: 3,
                      background: action.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      mb: 2.5,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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