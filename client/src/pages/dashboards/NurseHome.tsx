import { Box, Typography, Grid, Card, CardContent, CardActionArea } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EmergencyIcon from "@mui/icons-material/Emergency";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    label: "Triage Queue",
    desc: "Assess patients and record vitals",
    path: "/dashboard/triage",
    icon: <PeopleIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #1B6DA1, #4BA3D8)",
  },
  {
    label: "Record Vitals",
    desc: "Enter patient vital signs",
    path: "/dashboard/vitals",
    icon: <MedicalServicesIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #43A047, #66BB6A)",
  },
  {
    label: "Emergency Cases",
    desc: "View and manage emergency patients",
    path: "/dashboard/emergency",
    icon: <EmergencyIcon sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #E53935, #EF5350)",
  },
];

const NurseHome = () => {
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
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            Nurse Station
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Patient triage and vitals management
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" fontWeight={600} mb={2.5} color="text.primary">
        Quick Actions
      </Typography>

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

export default NurseHome;