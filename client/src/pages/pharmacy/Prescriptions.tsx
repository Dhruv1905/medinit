import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import { getPrescriptions, fulfillPrescription } from "../../services/appointmentService";
import { useRealtime } from "../../hooks/useRealtime";

interface Prescription {
  _id: string;
  patient: { _id: string; name: string; email: string; instituteId: string; phone?: string };
  doctor: { _id: string; name: string };
  date: string;
  timeSlot: string;
  reason: string;
  diagnosis?: string;
  prescription: string;
  prescriptionItems?: {
    medicineName: string;
    quantity: number;
    dose: string;
    timing: string;
    schedule: string[];
  }[];
  prescriptionFulfilled?: boolean;
  prescriptionFulfilledAt?: string;
  pharmacistNotes?: string;
  completedAt?: string;
}

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending");

  // Fulfill dialog
  const [fulfillDialog, setFulfillDialog] = useState<Prescription | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPrescriptions(filter || undefined);
      setPrescriptions(res.data.prescriptions);
    } catch {
      setError("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };
  useRealtime("prescription-update", fetchData);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleFulfill = async () => {
    if (!fulfillDialog) return;
    setSaving(true);
    try {
      await fulfillPrescription(fulfillDialog._id, notes);
      setFulfillDialog(null);
      setNotes("");
      fetchData();
    } catch {
      setError("Failed to fulfill prescription");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (loading) {
    return <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>Prescriptions</Typography>
          <Typography variant="body1" color="text.secondary">
            View and fulfill doctor prescriptions
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            size="small"
            select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="fulfilled">Fulfilled</MenuItem>
            <MenuItem value="">All</MenuItem>
          </TextField>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} sx={{ bgcolor: "#EBF4FA" }}>
              <RefreshIcon sx={{ color: "primary.main" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {prescriptions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <LocalPharmacyIcon sx={{ fontSize: 60, color: "text.secondary", opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No prescriptions found</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {prescriptions.map((rx) => (
            <Card
              key={rx._id}
              sx={{
                transition: "all 0.2s",
                borderLeft: `4px solid ${rx.prescriptionFulfilled ? "#43A047" : "#1B6DA1"}`,
                opacity: rx.prescriptionFulfilled ? 0.75 : 1,
                "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                  {/* Patient info */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        background: rx.prescriptionFulfilled
                          ? "linear-gradient(135deg, #43A047, #66BB6A)"
                          : "linear-gradient(135deg, #1B6DA1, #4BA3D8)",
                        fontWeight: 700,
                      }}
                    >
                      {rx.patient?.name?.charAt(0) || "?"}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {rx.patient?.name || "Unknown Patient"}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2, mt: 0.3 }}>
                        <Typography variant="caption" color="text.secondary">
                          {rx.patient?.instituteId || "N/A"}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <PersonIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            Dr. {rx.doctor?.name || "Unknown"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <EventIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">{formatDate(rx.date)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    {rx.prescriptionFulfilled ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Fulfilled"
                        size="small"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => setFulfillDialog(rx)}
                        sx={{
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #43A047, #66BB6A)",
                          "&:hover": { background: "linear-gradient(135deg, #2E7D32, #43A047)" },
                        }}
                      >
                        Dispense
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Diagnosis */}
                {rx.diagnosis && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: "#EBF4FA", borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight={600} color="primary.main">DIAGNOSIS</Typography>
                    <Typography variant="body2">{rx.diagnosis}</Typography>
                  </Box>
                )}

                {/* Prescription */}
                <Box sx={{ mt: 1.5, p: 2, bgcolor: "#F4F7FC", borderRadius: 2 }}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">PRESCRIPTION</Typography>
                  {rx.prescription && <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: rx.prescriptionItems?.length ? 1 : 0 }}>{rx.prescription}</Typography>}
                  {rx.prescriptionItems && rx.prescriptionItems.length > 0 && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {rx.prescriptionItems.map((item, idx) => (
                        <Box key={idx} sx={{ display: "flex", gap: 2, bgcolor: "#EBF4FA", p: 1, borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{item.medicineName}</Typography>
                          <Typography variant="body2">Qty: {item.quantity}</Typography>
                          <Typography variant="body2">Dose: {item.dose}</Typography>
                          <Typography variant="body2">{item.timing}</Typography>
                          <Typography variant="body2">{item.schedule.join(", ")}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Pharmacist notes */}
                {rx.pharmacistNotes && (
                  <Box sx={{ mt: 1.5, p: 2, bgcolor: "#E8F5E9", borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight={600} color="success.dark">PHARMACIST NOTES</Typography>
                    <Typography variant="body2">{rx.pharmacistNotes}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Fulfill Dialog */}
      <Dialog open={!!fulfillDialog} onClose={() => setFulfillDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Dispense Prescription</DialogTitle>
        <DialogContent>
          {fulfillDialog && (
            <Box sx={{ pt: 1 }}>
              <Box sx={{ p: 2, bgcolor: "#F4F7FC", borderRadius: 2, mb: 3 }}>
                <Typography variant="body2"><strong>Patient:</strong> {fulfillDialog.patient?.name || "Unknown"} ({fulfillDialog.patient?.instituteId || "N/A"})</Typography>
                <Typography variant="body2"><strong>Doctor:</strong> Dr. {fulfillDialog.doctor?.name || "Unknown"}</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary">PRESCRIPTION</Typography>
                {fulfillDialog.prescription && <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: fulfillDialog.prescriptionItems?.length ? 1 : 0 }}>{fulfillDialog.prescription}</Typography>}
                {fulfillDialog.prescriptionItems && fulfillDialog.prescriptionItems.length > 0 && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {fulfillDialog.prescriptionItems.map((item, idx) => (
                      <Box key={idx} sx={{ display: "flex", gap: 2, bgcolor: "#EBF4FA", p: 1, borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{item.medicineName}</Typography>
                        <Typography variant="body2">Qty: {item.quantity}</Typography>
                        <Typography variant="body2">Dose: {item.dose}</Typography>
                        <Typography variant="body2">{item.timing}</Typography>
                        <Typography variant="body2">{item.schedule}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              <TextField
                label="Pharmacist Notes (optional)"
                fullWidth
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about dispensed medicines, substitutions, dosage instructions..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setFulfillDialog(null)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={handleFulfill}
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #43A047, #66BB6A)",
              "&:hover": { background: "linear-gradient(135deg, #2E7D32, #43A047)" },
            }}
          >
            {saving ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Confirm Dispensed"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Prescriptions;