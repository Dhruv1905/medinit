import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { getVisitHistory } from "../../services/appointmentService";

interface Visit {
  _id: string;
  doctor: { _id: string; name: string; email: string };
  date: string;
  timeSlot: string;
  reason: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  vitals?: {
    bloodPressure?: string;
    temperature?: number;
    pulse?: number;
    weight?: number;
    spo2?: number;
  };
  completedAt?: string;
  queueNumber?: number;
}

const VisitHistory = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailDialog, setDetailDialog] = useState<Visit | null>(null);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await getVisitHistory();
        setVisits(res.data.visits);
      } catch {
        setError("Failed to load visit history");
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (loading) {
    return <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Visit History</Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Your complete medical visit records
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {visits.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <HistoryIcon sx={{ fontSize: 60, color: "text.secondary", opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No visit history yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Your completed appointments will appear here
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ position: "relative" }}>
          {/* Timeline line */}
          <Box
            sx={{
              position: "absolute",
              left: { xs: 20, md: 24 },
              top: 0,
              bottom: 0,
              width: 3,
              bgcolor: "#E3EFF8",
              borderRadius: 2,
              display: { xs: "none", sm: "block" },
            }}
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {visits.map((visit, index) => (
              <Box key={visit._id} sx={{ display: "flex", gap: { xs: 0, sm: 3 } }}>
                {/* Timeline dot */}
                <Box
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: 48,
                  }}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #1B6DA1, #4BA3D8)",
                      border: "3px solid #E3EFF8",
                      zIndex: 1,
                    }}
                  />
                </Box>

                {/* Visit card */}
                <Card
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateX(4px)",
                      boxShadow: "0 8px 24px rgba(27, 109, 161, 0.1)",
                    },
                  }}
                  onClick={() => setDetailDialog(visit)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            background: "linear-gradient(135deg, #43A047, #66BB6A)",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                          }}
                        >
                          {visit.doctor.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            Dr. {visit.doctor.name}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 2, mt: 0.3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <EventIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary">{formatDate(visit.date)}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary">{visit.timeSlot}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Chip label="Completed" size="small" color="success" sx={{ fontWeight: 600, fontSize: "0.7rem" }} />
                    </Box>

                    <Typography variant="body2" color="text.secondary" mb={1}>
                      <strong>Reason:</strong> {visit.reason}
                    </Typography>

                    {visit.diagnosis && (
                      <Typography variant="body2" color="text.primary">
                        <strong>Diagnosis:</strong> {visit.diagnosis}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onClose={() => setDetailDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Visit Details</DialogTitle>
        <DialogContent>
          {detailDialog && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Doctor</Typography>
                  <Typography variant="body1" fontWeight={600}>Dr. {detailDialog.doctor.name}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body2">{formatDate(detailDialog.date)} at {detailDialog.timeSlot}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="caption" color="text.secondary" fontWeight={600}>REASON</Typography>
              <Typography variant="body2" mb={2}>{detailDialog.reason}</Typography>

              {detailDialog.diagnosis && (
                <>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>DIAGNOSIS</Typography>
                  <Box sx={{ p: 2, bgcolor: "#EBF4FA", borderRadius: 2, mb: 2, mt: 0.5 }}>
                    <Typography variant="body2">{detailDialog.diagnosis}</Typography>
                  </Box>
                </>
              )}

              {detailDialog.prescription && (
                <>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>PRESCRIPTION</Typography>
                  <Box sx={{ p: 2, bgcolor: "#E8F5E9", borderRadius: 2, mb: 2, mt: 0.5 }}>
                    <Typography variant="body2">{detailDialog.prescription}</Typography>
                  </Box>
                </>
              )}

              {detailDialog.notes && (
                <>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>NOTES</Typography>
                  <Typography variant="body2" mb={2}>{detailDialog.notes}</Typography>
                </>
              )}

              {detailDialog.vitals && Object.values(detailDialog.vitals).some((v) => v) && (
                <>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>VITALS</Typography>
                  <Box sx={{ p: 2, bgcolor: "#F4F7FC", borderRadius: 2, mt: 0.5, display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {detailDialog.vitals.bloodPressure && <Typography variant="body2"><strong>BP:</strong> {detailDialog.vitals.bloodPressure}</Typography>}
                    {detailDialog.vitals.temperature && <Typography variant="body2"><strong>Temp:</strong> {detailDialog.vitals.temperature}°F</Typography>}
                    {detailDialog.vitals.pulse && <Typography variant="body2"><strong>Pulse:</strong> {detailDialog.vitals.pulse} bpm</Typography>}
                    {detailDialog.vitals.spo2 && <Typography variant="body2"><strong>SpO2:</strong> {detailDialog.vitals.spo2}%</Typography>}
                    {detailDialog.vitals.weight && <Typography variant="body2"><strong>Weight:</strong> {detailDialog.vitals.weight} kg</Typography>}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDetailDialog(null)} variant="outlined" sx={{ borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VisitHistory;