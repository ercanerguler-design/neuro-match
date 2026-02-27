// Clean PDF generator — handles Turkish characters + professional layout

const BRAIN_TYPE_LABELS = {
  analytical: 'Analitik',
  creative: 'Yaratici',
  empathetic: 'Empatik',
  strategic: 'Stratejik',
};

const BRAIN_TYPE_COLORS = {
  analytical: [0, 212, 255],
  creative: [124, 58, 237],
  empathetic: [16, 185, 129],
  strategic: [245, 158, 11],
};

// Sanitize Turkish characters — jsPDF Helvetica does not support Unicode
function tr(str = '') {
  return String(str)
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U');
}

function drawBox(doc, x, y, w, h, fillRGB, borderRGB, radius = 4) {
  if (fillRGB) {
    doc.setFillColor(...fillRGB);
    doc.roundedRect(x, y, w, h, radius, radius, 'F');
  }
  if (borderRGB) {
    doc.setDrawColor(...borderRGB);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, w, h, radius, radius, 'S');
  }
}

function checkPage(doc, y, needed = 30) {
  if (y + needed > 275) {
    doc.addPage();
    doc.setFillColor(10, 10, 26);
    doc.rect(0, 0, 210, 297, 'F');
    return 20;
  }
  return y;
}

export function generatePDF(report, user, onDone, onError) {
  import('jspdf')
    .then(({ jsPDF }) => {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210;
      const P = 20; // horizontal padding
      const CW = W - P * 2; // content width

      // ── Background ──────────────────────────────────────────────────────
      doc.setFillColor(10, 10, 26);
      doc.rect(0, 0, W, 297, 'F');

      // ── Top accent bar ───────────────────────────────────────────────────
      doc.setFillColor(0, 212, 255);
      doc.rect(0, 0, W, 3, 'F');

      // ── Logo / brand ─────────────────────────────────────────────────────
      let y = 18;
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 212, 255);
      doc.text('X-Neu', P, y);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('x-neu.com  |  SCE INNOVATION LTD.', W - P, y, { align: 'right' });

      // divider
      y += 5;
      doc.setDrawColor(30, 40, 70);
      doc.setLineWidth(0.4);
      doc.line(P, y, W - P, y);

      // ── Report title + user ───────────────────────────────────────────────
      y += 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(226, 232, 240);
      doc.text(tr(report.title || 'Norolojik Profil Raporu'), P, y);

      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const userName = tr(user?.name || report?.user?.name || 'Kullanici');
      const dateStr = new Date(report.createdAt).toLocaleDateString('tr-TR');
      doc.text(`${userName}  ·  ${dateStr}`, P, y);

      // ── Brain Type + Score box ────────────────────────────────────────────
      y += 10;
      const bt = (user?.neuroProfile?.brainType || report?.user?.neuroProfile?.brainType || 'analytical');
      const btColor = BRAIN_TYPE_COLORS[bt] || [0, 212, 255];
      const btLabel = BRAIN_TYPE_LABELS[bt] || bt;
      const score = report.overallScore || 0;

      drawBox(doc, P, y, CW, 34, [14, 18, 38], btColor);

      // Brain type label
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...btColor);
      doc.text('Beyin Tipi', P + 8, y + 9);
      doc.setFontSize(14);
      doc.setTextColor(226, 232, 240);
      doc.text(tr(btLabel), P + 8, y + 18);

      // Score
      const sX = P + CW * 0.45;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('Noro Skoru', sX, y + 9);
      doc.setFontSize(18);
      doc.setTextColor(...btColor);
      doc.text(score > 0 ? `${score}/100` : '--', sX, y + 20);

      // Score bar
      if (score > 0) {
        const bX = sX + 28, bW = CW - (sX - P) - 30, bY = y + 14;
        doc.setFillColor(30, 35, 65);
        doc.roundedRect(bX, bY, bW, 5, 2, 2, 'F');
        doc.setFillColor(...btColor);
        doc.roundedRect(bX, bY, (score / 100) * bW, 5, 2, 2, 'F');
      }

      y += 42;

      // ── Summary ──────────────────────────────────────────────────────────
      if (report.summary) {
        y = checkPage(doc, y, 25);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(148, 163, 184);
        doc.text('OZET', P, y);
        y += 5;
        const summaryLines = doc.splitTextToSize(tr(report.summary), CW - 6);
        const summaryH = summaryLines.length * 5.5 + 8;
        drawBox(doc, P, y, CW, summaryH, [14, 18, 38], null, 3);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(summaryLines, P + 4, y + 6);
        y += summaryH + 8;
      }

      // ── Sections ─────────────────────────────────────────────────────────
      const sections = report.sections || [];
      sections.forEach((section) => {
        y = checkPage(doc, y, 40);

        // Section header band
        drawBox(doc, P, y, CW, 11, [16, 20, 45], null, 2);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(226, 232, 240);
        const secTitle = tr(`${section.icon || ''} ${section.title || ''}`.trim());
        doc.text(secTitle, P + 4, y + 7.5);
        y += 14;

        // Section content
        if (section.content) {
          y = checkPage(doc, y, 15);
          const cLines = doc.splitTextToSize(tr(section.content), CW - 8);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(148, 163, 184);
          doc.text(cLines, P + 4, y);
          y += cLines.length * 5 + 6;
        }

        // Recommendations
        const recs = (section.recommendations || []).slice(0, 5);
        recs.forEach((rec, i) => {
          y = checkPage(doc, y, 12);
          const rLines = doc.splitTextToSize(tr(rec), CW - 18);
          const rH = rLines.length * 4.5 + 6;

          // Alternating tint
          if (i % 2 === 0) {
            drawBox(doc, P, y - 1, CW, rH, [12, 16, 36], null, 2);
          }

          // Bullet
          doc.setFontSize(9);
          doc.setTextColor(...btColor);
          doc.text('>', P + 4, y + 3.5);

          doc.setTextColor(148, 163, 184);
          doc.setFont('helvetica', 'normal');
          doc.text(rLines, P + 10, y + 3.5);
          y += rH;
        });

        y += 6;
      });

      // ── Footer ────────────────────────────────────────────────────────────
      doc.setDrawColor(30, 40, 70);
      doc.setLineWidth(0.3);
      doc.line(P, 283, W - P, 283);
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text(
        '© 2026 X-Neu  ·  SCE INNOVATION LTD. STI.  ·  x-neu.com',
        W / 2, 289,
        { align: 'center' }
      );

      // Bottom accent bar
      doc.setFillColor(124, 58, 237);
      doc.rect(0, 294, W, 3, 'F');

      const safeTitle = tr(report.title || 'rapor').toLowerCase().replace(/\s+/g, '-');
      doc.save(`x-neu-${safeTitle}-${new Date().toISOString().slice(0, 10)}.pdf`);
      if (onDone) onDone();
    })
    .catch(() => { if (onError) onError(); });
}
