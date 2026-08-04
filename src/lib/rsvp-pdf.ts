export type RsvpPdfRow = {
  eventTitle: string;
  eventDate: string;
  fullName: string;
  email: string;
  phone: string;
  membership: string;
  status: string;
  guests: number;
  note: string;
  submitted: string;
  updated: string;
};

export type RsvpPdfCoverSheet = {
  managerName: string;
  organisation: string;
  note: string;
};

export type RsvpPdfOptions = {
  title: string;
  filterSummary: string;
  totals: { responses: number; going: number; interested: number; attendees: number };
  rows: RsvpPdfRow[];
  generatedAt: string;
  coverSheet?: RsvpPdfCoverSheet | null;
  fileName: string;
};

const HEAD = [
  "Event",
  "Event date",
  "Name",
  "Email",
  "Phone",
  "Membership",
  "Response",
  "Extra guests",
  "Total attendees",
  "Note",
  "Submitted",
  "Last updated",
];

/** Builds the RSVP PDF (optionally with a cover sheet) and triggers a download. */
export async function downloadRsvpPdf(options: RsvpPdfOptions) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const cover = options.coverSheet;
  if (cover && (cover.managerName || cover.organisation || cover.note)) {
    doc.setFontSize(11);
    doc.text("RSVP report", 40, 70);
    doc.setFontSize(26);
    doc.text(options.title, 40, 105);

    let y = 150;
    const line = (label: string, value: string) => {
      if (!value) return;
      doc.setFontSize(9);
      doc.text(label.toUpperCase(), 40, y);
      doc.setFontSize(13);
      doc.text(doc.splitTextToSize(value, pageWidth - 80) as string[], 40, y + 18);
      y += 18 + 22 * Math.max(1, (doc.splitTextToSize(value, pageWidth - 80) as string[]).length);
    };
    line("Event manager", cover.managerName);
    line("Organisation", cover.organisation);
    line("Note", cover.note);

    doc.setFontSize(9);
    doc.text(options.filterSummary, 40, doc.internal.pageSize.getHeight() - 60);
    doc.text(`Generated ${options.generatedAt}`, 40, doc.internal.pageSize.getHeight() - 46);
    doc.addPage();
  }

  const t = options.totals;
  doc.setFontSize(16);
  doc.text(options.title, 40, 40);
  doc.setFontSize(9);
  doc.text(options.filterSummary, 40, 58);
  doc.text(
    `Responses: ${t.responses}   |   Going: ${t.going}   |   Interested: ${t.interested}   |   Expected attendees: ${t.attendees}`,
    40,
    72,
  );
  doc.text(`Generated ${options.generatedAt}`, 40, 86);

  autoTable(doc, {
    startY: 100,
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [16, 94, 74], textColor: 255 },
    head: [HEAD],
    body: options.rows.map((row) => [
      row.eventTitle,
      row.eventDate || "—",
      row.fullName,
      row.email,
      row.phone || "—",
      row.membership || "—",
      row.status,
      String(row.guests),
      String(1 + row.guests),
      row.note || "—",
      row.submitted,
      row.updated || "—",
    ]),
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.text(
        `Page ${doc.getNumberOfPages()}`,
        doc.internal.pageSize.getWidth() - 60,
        doc.internal.pageSize.getHeight() - 20,
      );
    },
  });

  doc.save(options.fileName);
}