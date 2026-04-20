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
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { getAllReimbursements, updateReimbursementStatus, processUPIPayment } from "../../services/reimbursementService";

interface Reimbursement {
    _id: string;
    student: { _id: string; name: string; instituteId: string; email: string };
    appointment: { _id: string; date: string; reason: string; doctor: string };
    externalHospitalName: string;
    amount: number;
    documentUrl: string;
    upiId?: string;
    phone?: string;
    status: "pending" | "verified" | "reimbursed" | "rejected";
    createdAt: string;
    bankDetails: { accountNo: string; ifsc: string; bankName: string };
    paymentDetails?: {
        razorpayPaymentLinkId?: string;
        razorpayPaymentId?: string;
        utrNumber?: string;
        paidAt?: string;
        method?: string;
    };
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
    const [successMsg, setSuccessMsg] = useState("");
    const [detailDialog, setDetailDialog] = useState<Reimbursement | null>(null);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentLink, setPaymentLink] = useState("");

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
            await updateReimbursementStatus(id, status);
            setDetailDialog(null);
            fetchReimbursements();
        } catch {
            setError("Failed to update status");
        }
    };

    const handleProcessPayment = async (id: string) => {
        setProcessingPayment(true);
        setError("");
        setPaymentLink("");
        try {
            const res = await processUPIPayment(id);
            setPaymentLink(res.data.paymentLink || "");
            setSuccessMsg(`Payment link created successfully! Amount: ₹${detailDialog?.amount}`);
            setDetailDialog(null);
            fetchReimbursements();
        } catch (err: any) {
            setError(err.response?.data?.message || "Payment processing failed");
        } finally {
            setProcessingPayment(false);
        }
    };

    if (loading) {
        return <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>Reimbursements</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Process external reference reimbursements via UPI
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>{error}</Alert>}
            {successMsg && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() => { setSuccessMsg(""); setPaymentLink(""); }}
                    action={
                        paymentLink ? (
                            <Button
                                color="inherit"
                                size="small"
                                startIcon={<OpenInNewIcon />}
                                href={paymentLink}
                                target="_blank"
                            >
                                Open Payment Link
                            </Button>
                        ) : undefined
                    }
                >
                    {successMsg}
                </Alert>
            )}

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
                                <TableCell sx={{ fontWeight: 700 }}>UPI ID</TableCell>
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
                                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                                            {item.upiId || "—"}
                                        </Typography>
                                    </TableCell>
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

                            {/* UPI & Contact Details */}
                            <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(96, 165, 250, 0.1)", border: "1px solid rgba(96, 165, 250, 0.25)", borderRadius: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                    <AccountBalanceWalletIcon sx={{ color: "#60A5FA", fontSize: 20 }} />
                                    <Typography variant="subtitle2">UPI & Contact Details</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                    <Typography variant="caption">UPI ID:</Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: "monospace" }}>{detailDialog.upiId || "Not provided"}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="caption">Phone:</Typography>
                                    <Typography variant="body2" fontWeight={600}>{detailDialog.phone || "Not provided"}</Typography>
                                </Box>
                            </Box>

                            {/* Bank Details */}
                            <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2 }}>
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

                            {/* Payment Details (if paid) */}
                            {detailDialog.paymentDetails?.razorpayPaymentLinkId && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom sx={{ color: "#10B981" }}>Payment Processed ✓</Typography>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                        <Typography variant="caption">Razorpay Link ID:</Typography>
                                        <Typography variant="body2" fontWeight={600} sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                                            {detailDialog.paymentDetails.razorpayPaymentLinkId}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                        <Typography variant="caption">Method:</Typography>
                                        <Typography variant="body2" fontWeight={600}>{detailDialog.paymentDetails.method?.toUpperCase() || "UPI"}</Typography>
                                    </Box>
                                    {detailDialog.paymentDetails.paidAt && (
                                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                            <Typography variant="caption">Paid At:</Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {new Date(detailDialog.paymentDetails.paidAt).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            <Box sx={{ mt: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Typography variant="body2" fontWeight={600}>Proof Document:</Typography>
                                <Button
                                    startIcon={<FileDownloadIcon />}
                                    variant="outlined"
                                    size="small"
                                    href={`http://localhost:5000${detailDialog.documentUrl}`}
                                    target="_blank"
                                    sx={{ borderRadius: 2 }}
                                >
                                    Download Invoice
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1, justifyContent: "space-between" }}>
                    <Button onClick={() => setDetailDialog(null)} variant="outlined" sx={{ borderRadius: 2 }}>Close</Button>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        {detailDialog?.status === "pending" && (
                            <>
                                <Button
                                    variant="outlined" color="error" startIcon={<CancelIcon />}
                                    onClick={() => handleUpdateStatus(detailDialog._id, "rejected")}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Reject
                                </Button>
                                <Button
                                    variant="contained" startIcon={<CheckCircleOutlineIcon />}
                                    onClick={() => handleUpdateStatus(detailDialog._id, "verified")}
                                    sx={{
                                        borderRadius: 2,
                                        background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
                                        "&:hover": { background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" },
                                    }}
                                >
                                    Verify Documents
                                </Button>
                            </>
                        )}
                        {detailDialog?.status === "verified" && (
                            <Button
                                variant="contained"
                                startIcon={processingPayment ? <CircularProgress size={18} sx={{ color: "white" }} /> : <PaymentIcon />}
                                disabled={processingPayment}
                                onClick={() => handleProcessPayment(detailDialog._id)}
                                sx={{
                                    borderRadius: 2,
                                    background: "linear-gradient(135deg, #10B981, #34D399)",
                                    "&:hover": { background: "linear-gradient(135deg, #059669, #10B981)" },
                                }}
                            >
                                {processingPayment ? "Processing via Razorpay..." : "Pay via UPI (Razorpay)"}
                            </Button>
                        )}
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Reimbursements;
