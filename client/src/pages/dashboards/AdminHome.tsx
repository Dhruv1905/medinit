import { Box, Typography, Grid, Card, CardContent, CardActionArea } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InventoryIcon from "@mui/icons-material/Inventory";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";

const sections = [
  { label: "User Management", desc: "Manage accounts & roles", path: "/dashboard/users", icon: <PeopleIcon sx={{ fontSize: 28 }} />, gradient: "linear-gradient(135deg, #3B82F6, #60A5FA)", shadow: "rgba(59, 130, 246, 0.25)" },
  { label: "Appointments", desc: "View all clinic bookings", path: "/dashboard/appointments", icon: <CalendarMonthIcon sx={{ fontSize: 28 }} />, gradient: "linear-gradient(135deg, #06B6D4, #22D3EE)", shadow: "rgba(6, 182, 212, 0.25)" },
  { label: "Inventory", desc: "Medicine & equipment stock", path: "/dashboard/inventory", icon: <InventoryIcon sx={{ fontSize: 28 }} />, gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)", shadow: "rgba(245, 158, 11, 0.25)" },
  { label: "Certificates", desc: "Verify & manage certificates", path: "/dashboard/certificates", icon: <DescriptionIcon sx={{ fontSize: 28 }} />, gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)", shadow: "rgba(139, 92, 246, 0.25)" },
  { label: "Reports", desc: "Analytics & insights", path: "/dashboard/reports", icon: <AssignmentIcon sx={{ fontSize: 28 }} />, gradient: "linear-gradient(135deg, #10B981, #34D399)", shadow: "rgba(16, 185, 129, 0.25)" },
  { label: "Settings", desc: "System configuration", path: "/dashboard/settings", icon: <SettingsIcon sx={{ fontSize: 28 }} />, gradient: "linear-gradient(135deg, #64748B, #94A3B8)", shadow: "rgba(100, 116, 139, 0.25)" },
];

const AdminHome = () => {
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
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            top: -60,
            right: -40,
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
            right: 120,
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h5" fontWeight={700} mb={0.5} sx={{ fontFamily: "'Outfit', sans-serif" }}>
            Admin Control Panel
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            System management and oversight
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2.5}>
        {sections.map((section, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={section.path}>
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

export default AdminHome;