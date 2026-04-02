import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

const Settings = () => {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    clinicName: "MediNIT Health Center",
    clinicEmail: "clinic@nitw.ac.in",
    clinicPhone: "+91 870 2462999",
    address: "NIT Warangal, Telangana, India - 506004",
    openTime: "09:00",
    closeTime: "17:00",
    lunchStart: "12:30",
    lunchEnd: "14:00",
    slotDuration: "30",
    maxBookingsPerSlot: "1",
    enableEmergency: true,
    enableCertificates: true,
    enableOnlineBooking: true,
    maintenanceMode: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    // In a real app, this would call an API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>Settings</Typography>
          <Typography variant="body1" color="text.secondary">
            Configure clinic system settings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{
            background: "linear-gradient(135deg, #1B6DA1, #4BA3D8)",
            "&:hover": { background: "linear-gradient(135deg, #0E4D73, #1B6DA1)" },
          }}
        >
          Save Changes
        </Button>
      </Box>

      {saved && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Settings saved successfully</Alert>}

      <Grid container spacing={3}>
        {/* Clinic info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2.5}>Clinic Information</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField label="Clinic Name" name="clinicName" fullWidth value={settings.clinicName} onChange={handleChange} />
                <TextField label="Email" name="clinicEmail" fullWidth value={settings.clinicEmail} onChange={handleChange} />
                <TextField label="Phone" name="clinicPhone" fullWidth value={settings.clinicPhone} onChange={handleChange} />
                <TextField label="Address" name="address" fullWidth multiline rows={2} value={settings.address} onChange={handleChange} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Schedule */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2.5}>Schedule Configuration</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Opening Time" name="openTime" type="time" fullWidth value={settings.openTime} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Closing Time" name="closeTime" type="time" fullWidth value={settings.closeTime} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Lunch Start" name="lunchStart" type="time" fullWidth value={settings.lunchStart} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Lunch End" name="lunchEnd" type="time" fullWidth value={settings.lunchEnd} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Slot Duration (min)" name="slotDuration" type="number" fullWidth value={settings.slotDuration} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Max Bookings/Slot" name="maxBookingsPerSlot" type="number" fullWidth value={settings.maxBookingsPerSlot} onChange={handleChange} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Feature toggles */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Feature Toggles</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControlLabel
                    control={<Switch checked={settings.enableOnlineBooking} onChange={handleChange} name="enableOnlineBooking" color="primary" />}
                    label={<Typography variant="body2">Online Booking</Typography>}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControlLabel
                    control={<Switch checked={settings.enableEmergency} onChange={handleChange} name="enableEmergency" color="primary" />}
                    label={<Typography variant="body2">Emergency Module</Typography>}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControlLabel
                    control={<Switch checked={settings.enableCertificates} onChange={handleChange} name="enableCertificates" color="primary" />}
                    label={<Typography variant="body2">Certificates</Typography>}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControlLabel
                    control={<Switch checked={settings.maintenanceMode} onChange={handleChange} name="maintenanceMode" color="error" />}
                    label={<Typography variant="body2" color={settings.maintenanceMode ? "error.main" : "text.primary"}>Maintenance Mode</Typography>}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;