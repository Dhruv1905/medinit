const PDFDocument = require("pdfkit");
import QRCode from "qrcode";
import { ICertificate } from "../models/Certificate";

export const generateCertificatePDF = async (
  certificate: any,
  res: any
): Promise<void> => {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=certificate-${certificate.verificationCode}.pdf`
  );

  doc.pipe(res);

  // Header border
  doc
    .rect(40, 30, 515, 780)
    .lineWidth(2)
    .strokeColor("#1B6DA1")
    .stroke();

  doc
    .rect(45, 35, 505, 770)
    .lineWidth(0.5)
    .strokeColor("#4BA3D8")
    .stroke();

  // Header
  doc
    .fontSize(28)
    .fillColor("#1B6DA1")
    .font("Helvetica-Bold")
    .text("MediNIT", 0, 60, { align: "center" });

  doc
    .fontSize(11)
    .fillColor("#666666")
    .font("Helvetica")
    .text("Institute Clinic Management System", 0, 95, { align: "center" });

  doc
    .fontSize(10)
    .text("NIT Warangal, Telangana, India - 506004", 0, 112, { align: "center" });

  // Divider
  doc
    .moveTo(80, 140)
    .lineTo(515, 140)
    .lineWidth(1)
    .strokeColor("#1B6DA1")
    .stroke();

  // Certificate title
  const typeLabels: Record<string, string> = {
    sick_leave: "SICK LEAVE CERTIFICATE",
    fitness: "FITNESS CERTIFICATE",
    medical_report: "MEDICAL REPORT",
    vaccination: "VACCINATION CERTIFICATE",
    other: "MEDICAL CERTIFICATE",
  };

  doc
    .fontSize(18)
    .fillColor("#1E2A3A")
    .font("Helvetica-Bold")
    .text(typeLabels[certificate.type] || "MEDICAL CERTIFICATE", 0, 160, {
      align: "center",
    });

  // Certificate details
  let y = 210;
  const leftCol = 80;
  const rightCol = 250;

  const addField = (label: string, value: string) => {
    doc
      .fontSize(10)
      .fillColor("#888888")
      .font("Helvetica")
      .text(label, leftCol, y);
    doc
      .fontSize(12)
      .fillColor("#1E2A3A")
      .font("Helvetica-Bold")
      .text(value, rightCol, y);
    y += 28;
  };

  addField("Verification Code:", certificate.verificationCode);
  addField("Patient Name:", certificate.patient?.name || "N/A");
  addField("Institute ID:", certificate.patient?.instituteId || "N/A");
  addField("Issuing Doctor:", `Dr. ${certificate.doctor?.name || "N/A"}`);
  addField(
    "Period:",
    `${new Date(certificate.startDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })} to ${new Date(certificate.endDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`
  );
  addField(
    "Date of Issue:",
    certificate.issuedAt
      ? new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A"
  );

  // Reason
  y += 10;
  doc
    .fontSize(10)
    .fillColor("#888888")
    .font("Helvetica")
    .text("Reason:", leftCol, y);
  y += 18;
  doc
    .fontSize(11)
    .fillColor("#1E2A3A")
    .font("Helvetica")
    .text(certificate.reason, leftCol, y, { width: 420 });
  y += doc.heightOfString(certificate.reason, { width: 420 }) + 15;

  // Diagnosis
  if (certificate.diagnosis) {
    doc
      .fontSize(10)
      .fillColor("#888888")
      .font("Helvetica")
      .text("Diagnosis:", leftCol, y);
    y += 18;
    doc
      .fontSize(11)
      .fillColor("#1E2A3A")
      .font("Helvetica")
      .text(certificate.diagnosis, leftCol, y, { width: 420 });
    y += doc.heightOfString(certificate.diagnosis, { width: 420 }) + 15;
  }

  // Remarks
  if (certificate.remarks) {
    doc
      .fontSize(10)
      .fillColor("#888888")
      .font("Helvetica")
      .text("Remarks:", leftCol, y);
    y += 18;
    doc
      .fontSize(11)
      .fillColor("#1E2A3A")
      .font("Helvetica")
      .text(certificate.remarks, leftCol, y, { width: 420 });
    y += doc.heightOfString(certificate.remarks, { width: 420 }) + 15;
  }

  // QR Code
  const verifyUrl = `http://localhost:5173/verify/${certificate.verificationCode}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 });
  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  const qrY = Math.max(y + 30, 580);
  doc.image(qrBuffer, 220, qrY, { width: 100 });

  doc
    .fontSize(8)
    .fillColor("#888888")
    .font("Helvetica")
    .text("Scan to verify this certificate", 0, qrY + 105, { align: "center" });

  // Footer
  doc
    .moveTo(80, 730)
    .lineTo(515, 730)
    .lineWidth(0.5)
    .strokeColor("#CCCCCC")
    .stroke();

  doc
    .fontSize(8)
    .fillColor("#AAAAAA")
    .font("Helvetica")
    .text(
      "This is a digitally generated certificate from MediNIT Clinic Management System.",
      0,
      740,
      { align: "center" }
    );

  doc
    .fontSize(8)
    .text(
      `Verify at: ${verifyUrl}`,
      0,
      755,
      { align: "center" }
    );

  doc.end();
};