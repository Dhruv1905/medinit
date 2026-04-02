import { Box, Typography, Grid, Card, CardContent, CardActionArea } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InventoryIcon from "@mui/icons-material/Inventory";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";

const sections = [
  { label: "User Management", desc: "Manage accounts & roles", path: "/dashboard/users", icon: <PeopleIcon sx={{ fontSize: 28 }} />, gradient: "linear-gradient(135deg, #1B6DA1, #4BA3D8)" },
  { label: "Appointments", desc: "View all clinic bookings", path: "/dashboard/appointments", icon: <CalendarMonthIcon sx={{ fontSize: 28 }} />, gradient: "linear-gradient(135deg, #0097A7, #00BCD4)" },
  { label: "Inventory", desc: "Medicine & equipment stock", path: "/dashboard/inventory", icon: <InventoryIcon sx={{ fontSize: 28 }} />, gradient: "linear-gradient(135deg, #FB8C00, #FFA726)" },
  { label: "Certificates", desc: "Verify & manage certificates", path: "/dashboard/certificates", icon: <DescriptionIcon sx={{ fontSize: 28 }} />, gradient: "linear-gradient(135deg, #7B1FA2, #AB47BC)" },
  { label: "Reports", desc: "Analytics & insights", path: "/dashboard/reports", icon: <AssignmentIcon sx={{ fontSize: 28 }} />, gradient: "linear-gradient(135deg, #43A047, #66BB6A)" },
  { label: "Settings", desc: "System configuration", path: "/dashboard/settings", icon: <SettingsIcon sx={{ fontSize: 28 }} />, gradient: "linear-gradient(135deg, #455A64, #78909C)" },
];

const AdminHome = () => {
  const navigate = useNavigate();

  return (
    <Box>
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
        <Box
          sx={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            top: -50,
            right: -30,
          }}
        />
        <Typography variant="h5" fontWeight={700} mb={0.5}>
          Admin Control Panel
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.85 }}>
          System management and oversight
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {sections.map((section) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={section.path}>
            <Card
              sx={{
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 28px rgba(27, 109, 161, 0.15)",
                },
              }}
            >
              <CardActionArea onClick={() => navigate(section.path)} sx={{ p: 3 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: 3,
                      background: section.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      mb: 2.5,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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