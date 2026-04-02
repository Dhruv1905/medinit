import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { getAllAppointments, updateVitals } from "../../services/appointmentService";
import { useRealtime } from "../../hooks/useRealtime";
interface Appointment {
  _id: string;
  patient: { _id: string; name: string; email: string; instituteId: string };
  doctor: { _id: string; name: string };
  date: string;
  timeSlot: string;
  reason: string;
  status: string;
  priority: string;
  queueNumber?: number;
  vitals?: {
    bloodPressure?: string;
    temperature?: number;
    pulse?: number;
    weight?: number;
    spo2?: number;
  };
}

const TriageQueue = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Vitals dialog
  const [vitalsDialog, setVitalsDialog] = useState<Appointment | null>(null);
  const [vitals, setVitals] = useState({
    bloodPressure: "",
    temperature: "",
    pulse: "",
    weight: "",
    spo2: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getAllAppointments({ date: selectedDate });
      const filtered = res.data.appointments.filter(
        (a: Appointment) => !["completed", "cancelled", "no_show"].includes(a.status)
      );
      setAppointments(filtered);
    } catch {
      setError("Failed to load appointments. Make sure you have admin or nurse access.");
    } finally {
      setLoading(false);
    }
  };
  useRealtime("appointment-update", fetchAppointments);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const handleOpenVitals = (apt: Appointment) => {
    setVitalsDialog(apt);
    setVitals({
      bloodPressure: apt.vitals?.bloodPressure || "",
      temperature: apt.vitals?.temperature?.toString() || "",
      pulse: apt.vitals?.pulse?.toString() || "",
      weight: apt.vitals?.weight?.toString() || "",
      spo2: apt.vitals?.spo2?.toString() || "",
    });
  };

  const handleSaveVitals = async () => {
    if (!vitalsDialog) return;
    setSaving(true);
    try {
      const data: any = {};
      if (vitals.bloodPressure) data.bloodPressure = vitals.bloodPressure;
      if (vitals.temperature) data.temperature = parseFloat(vitals.temperature);
      if (vitals.pulse) data.pulse = parseInt(vitals.pulse);
      if (vitals.weight) data.weight = parseFloat(vitals.weight);
      if (vitals.spo2) data.spo2 = parseInt(vitals.spo2);

      await updateVitals(vitalsDialog._id, data);
      setVitalsDialog(null);
      fetchAppointments();
    } catch {
      setError("Failed to save vitals");
    } finally {
      setSaving(false);
    }
  };

  const hasVitals = (apt: Appointment) => {
    return apt.vitals && Object.values(apt.vitals).some((v) => v);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Triage Queue
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Record patient vitals before consultation
          </Typography>
        </Box>
        <TextField
          type="date"
          size="small"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ width: 180 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {appointments.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              No active patients for this date
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {appointments.map((apt) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={apt._id}>
              <Card
                sx={{
                  transition: "all 0.2s",
                  "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
                  border: hasVitals(apt) ? "2px solid #43A047" : "2px solid transparent",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        background: "linear-gradient(135deg, #1B6DA1, #4BA3D8)",
                        fontWeight: 700,
                      }}
                    >
                      {apt.patient.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {apt.patient.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {apt.patient.instituteId} • {apt.timeSlot}
                      </Typography>
                    </Box>
                    {apt.priority !== "normal" && (
                      <Chip
                        label={apt.priority.toUpperCase()}
                        size="small"
                        color={apt.priority === "emergency" ? "error" : "warning"}
                        sx={{ fontWeight: 700, fontSize: "0.65rem" }}
                      />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Dr. {apt.doctor.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {apt.reason}
                  </Typography>

                  {hasVitals(apt) && (
                    <Box sx={{ p: 1.5, bgcolor: "#E8F5E9", borderRadius: 2, mb: 2 }}>
                      <Typography variant="caption" fontWeight={600} color="success.dark">
                        VITALS RECORDED
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 0.5 }}>
                        {apt.vitals?.bloodPressure && (
                          <Typography variant="caption">BP: {apt.vitals.bloodPressure}</Typography>
                        )}
                        {apt.vitals?.temperature && (
                          <Typography variant="caption">Temp: {apt.vitals.temperature}°F</Typography>
                        )}
                        {apt.vitals?.pulse && (
                          <Typography variant="caption">Pulse: {apt.vitals.pulse}</Typography>
                        )}
                        {apt.vitals?.spo2 && (
                          <Typography variant="caption">SpO2: {apt.vitals.spo2}%</Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant={hasVitals(apt) ? "outlined" : "contained"}
                    onClick={() => handleOpenVitals(apt)}
                    sx={{
                      borderRadius: 2,
                      ...(!hasVitals(apt) && {
                        background: "linear-gradient(135deg, #1B6DA1, #4BA3D8)",
                        "&:hover": { background: "linear-gradient(135deg, #0E4D73, #1B6DA1)" },
                      }),
                    }}
                  >
                    {hasVitals(apt) ? "Update Vitals" : "Record Vitals"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Vitals Dialog */}
      <Dialog
        open={!!vitalsDialog}
        onClose={() => setVitalsDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Record Vitals
          {vitalsDialog && (
            <Typography variant="body2" color="text.secondary">
              {vitalsDialog.patient.name} ({vitalsDialog.patient.instituteId})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Blood Pressure"
                fullWidth
                value={vitals.bloodPressure}
                onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                placeholder="e.g. 120/80"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Temperature (°F)"
                fullWidth
                type="number"
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                placeholder="e.g. 98.6"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Pulse (bpm)"
                fullWidth
                type="number"
                value={vitals.pulse}
                onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                placeholder="e.g. 72"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="SpO2 (%)"
                fullWidth
                type="number"
                value={vitals.spo2}
                onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                placeholder="e.g. 98"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Weight (kg)"
                fullWidth
                type="number"
                value={vitals.weight}
                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                placeholder="e.g. 65"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setVitalsDialog(null)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveVitals}
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #43A047, #66BB6A)",
              "&:hover": { background: "linear-gradient(135deg, #2E7D32, #43A047)" },
            }}
          >
            {saving ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Save Vitals"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TriageQueue;