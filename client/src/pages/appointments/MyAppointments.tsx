import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import { getMyAppointments, cancelAppointment, getAllAppointments } from "../../services/appointmentService";
import { useAuth } from "../../context/Authcontext";
import { useRealtime } from "../../hooks/useRealtime";
interface Appointment {
  _id: string;
  doctor: { _id: string; name: string; email: string };
  patient?: { _id: string; name: string; instituteId: string };
  date: string;
  timeSlot: string;
  reason: string;
  status: string;
  priority: string;
  queueNumber?: number;
  diagnosis?: string;
  prescription?: string;
}

const statusColors: Record<string, "default" | "primary" | "success" | "error" | "warning" | "info"> = {
  scheduled: "primary",
  in_queue: "info",
  in_consultation: "warning",
  completed: "success",
  cancelled: "error",
  no_show: "default",
};

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled",
  in_queue: "In Queue",
  in_consultation: "In Consultation",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      const res = user?.role === "admin" ? await getAllAppointments() : await getMyAppointments();
      setAppointments(res.data.appointments);
    } catch {
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };
  useRealtime("appointment-update", fetchAppointments);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async () => {
    if (!cancelDialog) return;
    try {
      await cancelAppointment(cancelDialog, cancelReason);
      setCancelDialog(null);
      setCancelReason("");
      fetchAppointments();
    } catch {
      setError("Failed to cancel appointment");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Appointments
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        View and manage clinic appointments
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {appointments.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <EventIcon sx={{ fontSize: 60, color: "text.secondary", opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No appointments yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Book your first appointment to get started
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {appointments.map((apt) => (
            <Grid size={{ xs: 12, md: 6 }} key={apt._id}>
              <Card
                sx={{
                  transition: "all 0.2s",
                  borderLeft: `4px solid`,
                  borderLeftColor:
                    apt.status === "completed"
                      ? "success.main"
                      : apt.status === "cancelled"
                        ? "error.main"
                        : "primary.main",
                  "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 18, color: "primary.main" }} />
                        <Typography variant="subtitle1" fontWeight={700}>
                          Dr. {apt.doctor?.name || "Unknown"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <EventIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(apt.date)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            {apt.timeSlot}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {apt.priority !== "normal" && (
                        <Chip
                          label={apt.priority}
                          size="small"
                          color={apt.priority === "emergency" ? "error" : "warning"}
                          sx={{ fontWeight: 600, fontSize: "0.7rem", textTransform: "capitalize" }}
                        />
                      )}
                      <Chip
                        label={statusLabels[apt.status] || apt.status}
                        size="small"
                        color={statusColors[apt.status] || "default"}
                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                      />
                    </Box>
                  </Box>

                  {user?.role === "admin" && apt.patient && (
                    <Typography variant="body2" color="primary.main" mb={1} fontWeight={600}>
                      Patient: {apt.patient?.name} ({apt.patient?.instituteId})
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary" mb={1}>
                    <strong>Reason:</strong> {apt.reason}
                  </Typography>

                  {apt.diagnosis && (
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      <strong>Diagnosis:</strong> {apt.diagnosis}
                    </Typography>
                  )}

                  {apt.prescription && (
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      <strong>Prescription:</strong> {apt.prescription}
                    </Typography>
                  )}

                  {apt.queueNumber && apt.status !== "completed" && apt.status !== "cancelled" && (
                    <Chip
                      label={`Queue #${apt.queueNumber}`}
                      size="small"
                      sx={{ mt: 1, bgcolor: "#EBF4FA", color: "primary.main", fontWeight: 600 }}
                    />
                  )}

                  {apt.status === "scheduled" && user?.role !== "admin" && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => setCancelDialog(apt._id)}
                        sx={{ borderRadius: 2 }}
                      >
                        Cancel Appointment
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Cancel Dialog */}
      <Dialog open={!!cancelDialog} onClose={() => setCancelDialog(null)}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Are you sure you want to cancel this appointment?
          </Typography>
          <TextField
            label="Reason (optional)"
            fullWidth
            multiline
            rows={2}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(null)}>Keep Appointment</Button>
          <Button color="error" variant="contained" onClick={handleCancel}>
            Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyAppointments;