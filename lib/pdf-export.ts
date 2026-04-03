import jsPDF from "jspdf";
import type { RecommendationPayload } from "./validators";

const SECTION_LABELS: Record<string, string> = {
  books: "Book Recommendations",
  videos: "Video Tutorials",
  projects: "Hands-on Projects",
  online_resources: "Online Courses & Resources",
  professional_titles: "Professional Titles & Salaries",
};

const LEVEL_COLORS: Record<string, [number, number, number]> = {
  Entry: [4, 120, 87],
  "Mid-Level": [3, 105, 161],
  Senior: [180, 83, 9],
  Lead: [190, 18, 60],
};

const PAGE_WIDTH = 210; // A4 width in mm
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function addBadge(
  doc: jsPDF,
  label: string,
  color: [number, number, number],
  x: number,
  y: number,
  fontSize: number = 7
) {
  const textWidth = doc.getTextWidth(label) + 6;
  const textHeight = fontSize * 0.55;
  const pillH = textHeight + 4;
  const pillW = Math.max(textWidth, 14);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y - pillH / 2, pillW, pillH, pillH / 2, pillH / 2, "F");
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y - pillH / 2, pillW, pillH, pillH / 2, pillH / 2, "S");

  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  doc.text(label, x + pillW / 2, y + 1, { align: "center" });

  return pillW + 4;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = 297;
  if (y + needed > pageHeight - MARGIN - 20) {
    doc.addPage();
    return MARGIN + 4;
  }
  return y;
}

export function exportRecommendationToPDF(payload: RecommendationPayload, region: string, field: string, generatedAt: number | string) {
  const genDate = typeof generatedAt === "number" ? generatedAt : new Date(generatedAt).getTime();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  // ── Header ─
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 20);
  doc.text("Career Atlas", PAGE_WIDTH / 2, y + 6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Career Resource Report \u2022 ${new Date(genDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    PAGE_WIDTH / 2,
    y + 12,
    { align: "center" }
  );

  // Divider
  y += 18;
  doc.setDrawColor(45, 45, 45);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  // Field & Region
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text(field, MARGIN, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text(region, MARGIN, y + 5);

  // ── Sections ──
  const sections: [string, string][] = [
    ["books", "📚"],
    ["videos", "🎬"],
    ["projects", "💻"],
    ["online_resources", "🎓"],
    ["professional_titles", "💼"],
  ];

  for (const [key, icon] of sections) {
    const items = key === "professional_titles"
      ? payload.professional_titles
      : payload[key as keyof RecommendationPayload] || [];

    if (!Array.isArray(items) || items.length === 0) continue;

    y = checkPageBreak(doc, y + 12, 40);

    // Section header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(`${icon} ${SECTION_LABELS[key]}`, MARGIN, y);

    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

    if (key === "professional_titles") {
      y += 6;
      const titles = items as { title: string; level: string; salary_range: string; reason: string }[];

      for (const item of titles) {
        y = checkPageBreak(doc, y, 24);

        // Title + badge
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(20, 20, 20);
        const titleMaxW = CONTENT_WIDTH - 28;
        doc.text(item.title, MARGIN, y, { maxWidth: titleMaxW });

        const color = LEVEL_COLORS[item.level] || [100, 100, 100];
        addBadge(doc, item.level, color, MARGIN + CONTENT_WIDTH - 22, y);

        // Salary
        y += 5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(40, 40, 40);
        doc.text(item.salary_range, MARGIN, y);

        // Reason
        y += 5;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const reasonLines = doc.splitTextToSize(item.reason, CONTENT_WIDTH - 4);
        y = checkPageBreak(doc, y, reasonLines.length * 3.5);
        doc.text(reasonLines, MARGIN + 2, y);
        y += reasonLines.length * 3.5 + 5;
      }
    } else {
      y += 4;
      const resources = items as { title: string; detail: string; url: string | null; reason: string }[];

      for (const item of resources) {
        y = checkPageBreak(doc, y, 18);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(20, 20, 20);
        doc.text(item.title, MARGIN, y, { maxWidth: CONTENT_WIDTH });

        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(90, 90, 90);
        doc.text(item.detail, MARGIN, y, { maxWidth: CONTENT_WIDTH });

        if (item.url) {
          y += 3;
          doc.setFontSize(7);
          doc.setTextColor(37, 99, 235);
          doc.text(item.url, MARGIN, y, { maxWidth: CONTENT_WIDTH });
        }

        y += 4;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(110, 110, 110);
        const reasonLines = doc.splitTextToSize(item.reason, CONTENT_WIDTH - 4);
        y = checkPageBreak(doc, y, reasonLines.length * 3.2);
        doc.text(reasonLines, MARGIN + 2, y);
        y += reasonLines.length * 3.2 + 5;
      }
    }

    // Small gap between sections
    y += 4;
  }

  // ── Footer on every page ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = 297;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `Page ${i} of ${totalPages}`,
      PAGE_WIDTH / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(
      `Generated by Career Atlas \u2022 Ronald Gosso`,
      PAGE_WIDTH - MARGIN,
      pageHeight - 10,
      { align: "right" }
    );
  }

  doc.save(`career-atlas-${field.replace(/\s+/g, "-").toLowerCase()}-${region.replace(/[^a-zA-Z]/g, "").toLowerCase()}.pdf`);
}
