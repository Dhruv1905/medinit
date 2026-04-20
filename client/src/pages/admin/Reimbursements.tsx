import { useState, useEffect } from "react";
import {
    Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, IconButton, Tooltip, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PaymentIcon from "@mui/icons-material/Payment";
import CancelIcon from "@mui/icons-material/Cancel";
import { getAllReimbursements, updateReimbursementStatus } from "../../services/reimbursementService";

interface Reimbursement {
    _id: string;
    student: { _id: string; name: string; instituteId: string; email: string };
    appointment: { _id: string; date: string; reason: string; doctor: string };
    externalHospitalName: string;
    amount: number;
    documentUrl: string;
    status: "pending" | "verified" | "reimbursed" | "rejected";
    createdAt: string;
    bankDetails: { accountNo: string; ifsc: string; bankName: string };
}

const statusColors: Record<string, "warning" | "info" | "success" | "error"> = {
    pending: "warning",
    verified: "info",
    reimbursed: "success",
    rejected: "error"
};

const Reimbursements = () => {
    const [data, setData] = useState<Reimbursement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [detailDialog, setDetailDialog] = useState<Reimbursement | null>(null);
    const [simulatingPayment, setSimulatingPayment] = useState(false);

    const fetchReimbursements = async () => {
        setLoading(true);
        try {
            const res = await getAllReimbursements();
            setData(res.data.reimbursements);
        } catch {
            setError("Failed to load reimbursements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReimbursements();
    }, []);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            if (status === "reimbursed") {
                setSimulatingPayment(true);
                // Simulate payment gateway delay
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
            await updateReimbursementStatus(id, status);
            setDetailDialog(null);
            fetchReimbursements();
        } catch {
            setError("Failed to update status");
        } finally {
            setSimulatingPayment(false);
        }
    };

    if (loading) {
        return <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>Reimbursements</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Process external reference reimbursements
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {data.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: "center", py: 6 }}>
                        <Typography variant="h6" color="text.secondary">No reimbursement requests</Typography>
                    </CardContent>
                </Card>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 1px 15px rgba(0,0,0,0.04)" }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "rgba(255, 255, 255, 0.12)" }}>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Hospital</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item._id} sx={{ "&:hover": { bgcolor: "rgba(255, 255, 255, 0.08)" } }}>
                                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>{item.student.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{item.student.instituteId}</Typography>
                                    </TableCell>
                                    <TableCell>{item.externalHospitalName}</TableCell>
                                    <TableCell>₹{item.amount}</TableCell>
                                    <TableCell>
                                        <Chip label={item.status.toUpperCase()} size="small" color={statusColors[item.status]} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="View Details">
                                            <IconButton onClick={() => setDetailDialog(item)} sx={{ bgcolor: "rgba(255, 255, 255, 0.12)" }}>
                                                <VisibilityIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Detail Dialog */}
            <Dialog open={!!detailDialog} onClose={() => setDetailDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Process Reimbursement</DialogTitle>
                <DialogContent>
                    {detailDialog && (
                        <Box sx={{ pt: 1 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption">Student</Typography>
                                    <Typography variant="body1" fontWeight={600}>{detailDialog.student.name} ({detailDialog.student.instituteId})</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption">Amount</Typography>
                                    <Typography variant="body1" fontWeight={600} sx={{ color: "#60A5FA" }}>₹{detailDialog.amount}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption">External Hospital</Typography>
                                    <Typography variant="body2">{detailDialog.externalHospitalName}</Typography>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Bank Details</Typography>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="caption">Bank:</Typography>
                                    <Typography variant="body2" fontWeight={600}>{detailDialog.bankDetails.bankName}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="caption">A/C No:</Typography>
                                    <Typography variant="body2" fontWeight={600}>{detailDialog.bankDetails.accountNo}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="caption">IFSC:</Typography>
                                    <Typography variant="body2" fontWeight={600}>{detailDialog.bankDetails.ifsc}</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mt: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Typography variant="body2" fontWeight={600}>Proof Document:</Typography>
                                <Button
                                    startIcon={<FileDownloadIcon />}
                                    variant="outlined"
                                    size="small"
                                    href={`http://localhost:5000${detailDialog.documentUrl}`}
                                    target="_blank"
                                >
                                    Download Invoice
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1, justifyContent: "space-between" }}>
                    <Button onClick={() => setDetailDialog(null)}>Close</Button>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        {detailDialog?.status === "pending" && (
                            <>
                                <Button
                                    variant="outlined" color="error" startIcon={<CancelIcon />}
                                    onClick={() => handleUpdateStatus(detailDialog._id, "rejected")}
                                >
                                    Reject
                                </Button>
                                <Button
                                    variant="contained" color="info" startIcon={<CheckCircleOutlineIcon />}
                                    onClick={() => handleUpdateStatus(detailDialog._id, "verified")}
                                >
                                    Verify Documents
                                </Button>
                            </>
                        )}
                        {detailDialog?.status === "verified" && (
                            <Button
                                variant="contained" color="success" startIcon={<PaymentIcon />}
                                disabled={simulatingPayment}
                                onClick={() => handleUpdateStatus(detailDialog._id, "reimbursed")}
                            >
                                {simulatingPayment ? "Processing Gateway..." : "Pay via Gateway"}
                            </Button>
                        )}
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Reimbursements;
