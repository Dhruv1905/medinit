import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  getAllMedicines,
  getInventoryStats,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../../services/medicineService";
import { useAuth } from "../../context/Authcontext";
import { useRealtime } from "../../hooks/useRealtime";

interface Medicine {
  _id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  expiryDate: string;
  reorderLevel: number;
  description?: string;
  sideEffects?: string;
}

interface Stats {
  totalMedicines: number;
  lowStockCount: number;
  expiredCount: number;
  totalValue: number;
}

const categories = [
  { value: "", label: "All Categories" },
  { value: "tablet", label: "Tablet" },
  { value: "capsule", label: "Capsule" },
  { value: "syrup", label: "Syrup" },
  { value: "injection", label: "Injection" },
  { value: "ointment", label: "Ointment" },
  { value: "drops", label: "Drops" },
  { value: "inhaler", label: "Inhaler" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  name: "",
  genericName: "",
  category: "tablet",
  manufacturer: "",
  batchNumber: "",
  quantity: 0,
  unitPrice: 0,
  expiryDate: "",
  reorderLevel: 50,
  description: "",
  sideEffects: "",
};

const Inventory = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpired, setShowExpired] = useState(false);

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (showLowStock) params.lowStock = "true";
      if (showExpired) params.expired = "true";

      const [medRes, statsRes] = await Promise.all([
        getAllMedicines(params),
        getInventoryStats(),
      ]);
      setMedicines(medRes.data.medicines);
      setStats(statsRes.data.stats);
    } catch {
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };
  useRealtime("inventory-update", fetchData);

  useEffect(() => {
    fetchData();
  }, [categoryFilter, showLowStock, showExpired]);

  const handleSearch = () => {
    fetchData();
  };

  const handleOpenAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setFormOpen(true);
  };

  const handleOpenEdit = (med: Medicine) => {
    setForm({
      name: med.name,
      genericName: med.genericName,
      category: med.category,
      manufacturer: med.manufacturer,
      batchNumber: med.batchNumber,
      quantity: med.quantity,
      unitPrice: med.unitPrice,
      expiryDate: new Date(med.expiryDate).toISOString().split("T")[0],
      reorderLevel: med.reorderLevel,
      description: med.description || "",
      sideEffects: med.sideEffects || "",
    });
    setEditingId(med._id);
    setFormError("");
    setFormOpen(true);
  };

  const handleSave = async () => {
    setFormError("");
    setSaving(true);
    try {
      const data = {
        ...form,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
        reorderLevel: Number(form.reorderLevel),
      };

      if (editingId) {
        await updateMedicine(editingId, data);
      } else {
        await createMedicine(data);
      }
      setFormOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await deleteMedicine(deleteDialog);
      setDeleteDialog(null);
      fetchData();
    } catch {
      setError("Failed to delete medicine");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const isLowStock = (qty: number, reorder: number) => qty <= reorder;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Medicine Inventory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage medicine stock, track expiry, and reorder levels
          </Typography>
        </Box>
        {(user?.role === "pharmacist" || user?.role === "admin") && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{
              background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
              "&:hover": { background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" },
            }}
          >
            Add Medicine
          </Button>
        )}
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <InventoryIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800}>{stats.totalMedicines}</Typography>
                  <Typography variant="caption" color="text.secondary">Total Medicines</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <WarningAmberIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="#F59E0B">{stats.lowStockCount}</Typography>
                  <Typography variant="caption" color="text.secondary">Low Stock</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    background: "linear-gradient(135deg, #EF4444, #F87171)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <ErrorOutlineIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="error.main">{stats.expiredCount}</Typography>
                  <Typography variant="caption" color="text.secondary">Expired</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    background: "linear-gradient(135deg, #10B981, #34D399)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <AttachMoneyIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800}>₹{stats.totalValue.toLocaleString()}</Typography>
                  <Typography variant="caption" color="text.secondary">Total Value</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            size="small"
            select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ width: 170 }}
          >
            {categories.map((c) => (
              <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
            ))}
          </TextField>
          <Chip
            label="Low Stock"
            clickable
            onClick={() => setShowLowStock(!showLowStock)}
            sx={{
              fontWeight: 600,
              bgcolor: showLowStock ? "#FFF3E0" : "transparent",
              color: showLowStock ? "#F59E0B" : "text.secondary",
              border: showLowStock ? "1px solid #F59E0B" : "1px solid #ddd",
            }}
          />
          <Chip
            label="Expired"
            clickable
            onClick={() => setShowExpired(!showExpired)}
            sx={{
              fontWeight: 600,
              bgcolor: showExpired ? "#FFEBEE" : "transparent",
              color: showExpired ? "#EF4444" : "text.secondary",
              border: showExpired ? "1px solid #EF4444" : "1px solid #ddd",
            }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} sx={{ bgcolor: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <RefreshIcon sx={{ color: "primary.main" }} />
            </IconButton>
          </Tooltip>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
      )}

      {/* Table */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>
      ) : medicines.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <InventoryIcon sx={{ fontSize: 60, color: "text.secondary", opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No medicines found</Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 1px 15px rgba(0,0,0,0.04)" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(255, 255, 255, 0.12)" }}>
                <TableCell sx={{ fontWeight: 700 }}>Medicine</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Batch</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Qty</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Expiry</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medicines.map((med) => (
                <TableRow
                  key={med._id}
                  sx={{
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.08)" },
                    opacity: isExpired(med.expiryDate) ? 0.6 : 1,
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{med.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{med.genericName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={med.category}
                      size="small"
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: 500,
                        fontSize: "0.7rem",
                        bgcolor: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)",
                        color: "primary.main",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{med.batchNumber}</Typography>
                    <Typography variant="caption" color="text.secondary">{med.manufacturer}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={isLowStock(med.quantity, med.reorderLevel) ? "warning.main" : "text.primary"}
                    >
                      {med.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">₹{med.unitPrice}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={isExpired(med.expiryDate) ? "error.main" : "text.primary"}
                    >
                      {formatDate(med.expiryDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {isExpired(med.expiryDate) && (
                        <Chip label="EXPIRED" size="small" color="error" sx={{ fontWeight: 700, fontSize: "0.65rem" }} />
                      )}
                      {isLowStock(med.quantity, med.reorderLevel) && !isExpired(med.expiryDate) && (
                        <Chip label="LOW" size="small" color="warning" sx={{ fontWeight: 700, fontSize: "0.65rem" }} />
                      )}
                      {!isExpired(med.expiryDate) && !isLowStock(med.quantity, med.reorderLevel) && (
                        <Chip label="OK" size="small" color="success" sx={{ fontWeight: 700, fontSize: "0.65rem" }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenEdit(med)} sx={{ bgcolor: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                          <EditIcon sx={{ fontSize: 18, color: "primary.main" }} />
                        </IconButton>
                      </Tooltip>
                      {user?.role === "admin" && (
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteDialog(med._id)} sx={{ bgcolor: "#FFEBEE" }}>
                            <DeleteIcon sx={{ fontSize: 18, color: "error.main" }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "Edit Medicine" : "Add New Medicine"}
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Medicine Name" name="name" fullWidth required value={form.name} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Generic Name" name="genericName" fullWidth required value={form.genericName} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Category" name="category" select fullWidth value={form.category} onChange={handleChange}>
                {categories.filter((c) => c.value).map((c) => (
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Manufacturer" name="manufacturer" fullWidth required value={form.manufacturer} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Batch Number" name="batchNumber" fullWidth required value={form.batchNumber} onChange={handleChange} disabled={!!editingId} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField label="Quantity" name="quantity" type="number" fullWidth required value={form.quantity} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField label="Unit Price (₹)" name="unitPrice" type="number" fullWidth required value={form.unitPrice} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Expiry Date" name="expiryDate" type="date" fullWidth required value={form.expiryDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Reorder Level" name="reorderLevel" type="number" fullWidth value={form.reorderLevel} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Description (optional)" name="description" fullWidth multiline rows={2} value={form.description} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Side Effects (optional)" name="sideEffects" fullWidth multiline rows={2} value={form.sideEffects} onChange={handleChange} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setFormOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !form.name || !form.genericName || !form.batchNumber}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
              "&:hover": { background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" },
            }}
          >
            {saving ? <CircularProgress size={22} sx={{ color: "white" }} /> : editingId ? "Update" : "Add Medicine"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Medicine</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to remove this medicine from inventory? This action can be undone by admin.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDeleteDialog(null)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;