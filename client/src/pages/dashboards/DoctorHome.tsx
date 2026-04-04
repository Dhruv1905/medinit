import { useAuth } from "../../context/Authcontext";
import { Box, Typography, Grid, Card, CardContent, CardActionArea } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    label: "Patient Queue",
    desc: "View and manage today's patients",
    path: "/dashboard/queue",
    icon: <PeopleIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #3B82F6, #60A5FA)",
    shadow: "rgba(59, 130, 246, 0.25)",
  },
  {
    label: "Consultations",
    desc: "Start or complete consultations",
    path: "/dashboard/consultations",
    icon: <MedicalServicesIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #06B6D4, #22D3EE)",
    shadow: "rgba(6, 182, 212, 0.25)",
  },
  {
    label: "Certificates",
    desc: "Issue medical certificates",
    path: "/dashboard/certificates",
    icon: <DescriptionIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
    shadow: "rgba(139, 92, 246, 0.25)",
  },
  {
    label: "My Schedule",
    desc: "View your appointment schedule",
    path: "/dashboard/schedule",
    icon: <CalendarMonthIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #10B981, #34D399)",
    shadow: "rgba(16, 185, 129, 0.25)",
  },
];

const DoctorHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box>
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
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            bottom: -20,
            right: 150,
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h5" fontWeight={700} mb={0.5} sx={{ fontFamily: "'Outfit', sans-serif" }}>
            Dr. {user?.name}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Here's your clinic overview for today
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" fontWeight={600} mb={2.5} color="text.primary" sx={{ fontFamily: "'Outfit', sans-serif" }}>
        Quick Actions
      </Typography>

      <Grid container spacing={2.5}>
        {sections.map((section, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={section.path}>
            <Card
              className={`animate-fade-in stagger-${index + 1}`}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: `0 20px 40px ${section.shadow}`,
                },
              }}
            >
              <CardActionArea onClick={() => navigate(section.path)} sx={{ p: 3 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      background: section.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      mb: 2.5,
                      boxShadow: `0 8px 20px ${section.shadow}`,
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                    {section.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.desc}
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

export default DoctorHome;