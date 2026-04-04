import { Router } from "express";
import multer from "multer";
import path from "path";
import {
    createReimbursement,
    getMyReimbursements,
    getAllReimbursements,
    updateReimbursementStatus
} from "../controllers/reimbursement.controller";
import { protect, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, "../../uploads"));
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\\s+/g, "_")}`);
    }
});
const upload = multer({ storage });

router.post("/", protect, authorize("student", "faculty"), upload.single("document"), createReimbursement);
router.get("/my", protect, authorize("student", "faculty"), getMyReimbursements);
router.get("/all", protect, authorize("admin"), getAllReimbursements);
router.patch("/:id/status", protect, authorize("admin"), updateReimbursementStatus);

export default router;
