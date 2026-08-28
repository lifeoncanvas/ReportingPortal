import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PURPLE = [79, 70, 229];
const LIGHT  = [245, 243, 255];
const GRAY   = [107, 114, 128];
const DARK   = [31, 41, 55];
const GREEN  = [22, 163, 74];
const WHITE  = [255, 255, 255];

const KEY_LABELS = {
  zoneName: "Name of Zone",
  zonalManager: "Zonal Manager",
  partnershipRemittance: "Total Partnership Remittance",
  remittancePurpose: "Purpose for each remittance",
  trumpetsBlown: "Trumpets Blown this week",
  greatShouts: "Great Shouts made this week",
  newPartners: "New partners recruited",
  testimoniesSubmitted: "Testimonies submitted to the Department",
  healingTranslations: "Total number of outreaches done this week",
  healingOutreaches: "Healing outreaches held this week",
  healingPicturesVideos: "Pictures and videos from Healing outreaches submitted",
  pastoralAttendanceDirector: "Zonal Pastor attendance in Executive Minister's meeting",
  managerAttendanceDirector: "Zonal Manager attendance in Executive Minister's meeting",
  managerAttendanceStrategy: "Zonal Manager attendance in strategy meeting",
  testimonyClarificationConcern: "Testimony, Clarification or Concern",
  submittedByEmail: "Submitted By Email",
  participationPrayWithMe: "Total number of participation pray with me",
  totalRegistrationHslhs: "Total Registration for HSLHS",
  heraldConference: "Brief report for Herald Conference",
  totalPartnershipRemittance: "Total Partnership Remittance",
  newPartnersRecruited: "New Partners Recruited",
  zonalPastorExecutiveMinistersMeeting: "Zonal Pastor attendance in Executive Minister's meeting",
  zonalManagerExecutiveMinistersMeeting: "Zonal Manager attendance in Executive Minister's meeting",
  zonalManagerStrategyMeeting: "Zonal Manager attendance in strategy meeting",
  zonalManagerStrategyMeetingAttendance: "Zonal Manager attendance in strategy meeting",
  regionName: "Region Name",
  submittedBy: "Submitted By",
  testimony: "Share a testimony",
  testimoniesCount: "Testimonies received this week",
  prayWithMeTestimonies: "Pray With Me Testimonies",
  translationTestimonies: "Translation Testimonies",
  partnershipTestimonies: "Partnership Testimonies",
  salvationTestimonies: "Salvation Testimonies",
  healingTestimonies: "Healing Testimonies",
  othersTestimonies: "Others Testimonies",
  zonalPartnership: "Zonal Partnership",
  zonalPartnershipDetails: "Zonal Partnership Details",
  groupsPartnership: "Group Partnership",
  churchesPartnership: "Church Partnership",
  cellPartnership: "Cell Partnership",
  sponsoredTeenspiration: "Teenspiration (300 espees) Sponsored",
  sponsoredKidspiration: "Kidspiration (300 espees) Sponsored",
  adultCopies: "Adult Copies Ordered",
  adultLanguages: "Adult Language(s)",
  teensCopies: "Teens Copies Ordered",
  teensLanguages: "Teens Language(s)",
  kidsCopies: "Kids Copies Ordered",
  kidsLanguages: "Kids Language(s)",
  ordered: "Total Ordered Copies",
  language: "Languages",
  received: "Total Received Copies",
  receiptStatus: "Receipt Status",
  reason: "Not received reason",
  sponsoredCopies: "Sponsored Copies",
  monthlyMinimumOrder: "Monthly Minimum Magazine Order",
  monthlyCopiesOrdered: "Cumulative number of copies sponsored for the month",
  praiseReports: "Praise Reports",
  datesReceived: "Dates Received",
  outreachLocations: "Outreach Locations",
  date: "Date of Outreach",
  category: "Outreach Category",
  locations: "Outreach Location(s)",
  story: "Outreach Story",
  images: "Outreach Images Count",
  magazinesUsed: "Magazines Used",
  peopleInvolved: "People Involved",
  totalAttendance: "Total Attendance",
  soulsSaved: "Souls Saved",
  outreachTestimonies: "Testimonies from the outreach(es)",
  followUpPlan: "Further plans for soul retention",
};

const LONG_TEXT_KEYS = [
  'notes', 'story', 'outreachTestimonies', 'testimonyClarificationConcern', 
  'zonalPartnershipDetails', 'others', 'praiseReports', 'challengesFaced', 
  'notReceivedReason', 'prayWithMeTestimonies', 'translationTestimonies', 
  'partnershipTestimonies', 'salvationTestimonies', 'healingTestimonies', 
  'othersTestimonies', 'categoryDetails', 'followUpPlan'
];

function urlToBase64(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function downloadReportPDF(report, formatDate) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw  = doc.internal.pageSize.getWidth();
  const ph  = doc.internal.pageSize.getHeight();
  let   y   = 0;

  const checkPage = (needed = 20) => {
    if (y + needed > ph - 15) { doc.addPage(); y = 20; }
  };

  // ── Header banner ────────────────────────────────────────────
  doc.setFillColor(...PURPLE);
  doc.rect(0, 0, pw, 28, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Loveworld Reports Platform', 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Report Document', 14, 19);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pw - 14, 19, { align: 'right' });
  y = 36;

  // ── Report ID + status ───────────────────────────────────────
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(`Report ${report.id}`, 14, y);

  const statusColor = report.status === 'reviewed' ? GREEN : PURPLE;
  doc.setFillColor(...statusColor);
  doc.roundedRect(pw - 50, y - 7, 36, 9, 2, 2, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(report.status.toUpperCase(), pw - 32, y - 1, { align: 'center' });
  y += 10;

  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(0.5);
  doc.line(14, y, pw - 14, y);
  y += 8;

  // ── Report details ───────────────────────────────────────────
  doc.setFillColor(...LIGHT);
  doc.roundedRect(14, y, pw - 28, 8, 2, 2, 'F');
  doc.setTextColor(...PURPLE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT DETAILS', 18, y + 5.5);
  y += 13;

  const skip = ['id', 'media', 'mediaFiles', 'rawDate', 'formData', 'formName', ...LONG_TEXT_KEYS];
  const entries = Object.entries(report).filter(([k, v]) => !skip.includes(k) && v !== undefined && v !== null && v !== '');

  const details = [
    ['Report ID', report.id],
    ['Date', formatDate(report.rawDate)],
  ];

  entries.forEach(([k, v]) => {
    const label = KEY_LABELS[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
    details.push([label, v]);
  });

  const colW = (pw - 28) / 2;
  details.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x   = 14 + col * colW;
    const ry  = y + row * 10;
    checkPage(12);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY);
    doc.text(label.toUpperCase(), x + 2, ry);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    let strVal = String(value || '—');
    if (strVal.length > 50) strVal = strVal.substring(0, 47) + '...';
    doc.text(strVal, x + 2, ry + 5);
  });
  y += Math.ceil(details.length / 2) * 10 + 6;

  // ── Long Text Sections ───────────────────────────────────────
  LONG_TEXT_KEYS.forEach(k => {
    if (report[k] && String(report[k]).trim() !== '') {
      const label = KEY_LABELS[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      checkPage(20);
      doc.setFillColor(...LIGHT);
      doc.roundedRect(14, y, pw - 28, 8, 2, 2, 'F');
      doc.setTextColor(...PURPLE);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(label.toUpperCase(), 18, y + 5.5);
      y += 12;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...DARK);
      const lines = doc.splitTextToSize(String(report[k]), pw - 32);
      
      for (let l = 0; l < lines.length; l++) {
        if (y > ph - 20) { doc.addPage(); y = 20; }
        doc.text(lines[l], 16, y);
        y += 5;
      }
      y += 6;
    }
  });

  // ── Analytics summary ────────────────────────────────────────
  checkPage(55);
  doc.setFillColor(...LIGHT);
  doc.roundedRect(14, y, pw - 28, 8, 2, 2, 'F');
  doc.setTextColor(...PURPLE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('ANALYTICS SUMMARY', 18, y + 5.5);
  y += 13;

  let kpis = [
    { label: 'Media Files',      value: (report.media || []).length,    color: [2, 132, 199]   },
    { label: 'Status',           value: report.status,                  color: statusColor     },
  ];

  if (report.totalAttendance !== undefined || report.attendance !== undefined) {
    kpis.unshift({ label: 'Total Attendance', value: report.totalAttendance || report.attendance || 0, color: PURPLE });
  } else if (report.ordered !== undefined) {
    kpis.unshift({ label: 'Total Ordered', value: report.ordered, color: PURPLE });
    kpis.splice(1, 0, { label: 'Total Received', value: report.received, color: GREEN });
  } else if (report.testimoniesCount !== undefined) {
    kpis.unshift({ label: 'Testimonies', value: report.testimoniesCount, color: PURPLE });
  } else if (report.totalRemittance !== undefined) {
    kpis.unshift({ label: 'Remittance', value: report.totalRemittance, color: PURPLE });
  } else if (report.totalRegistrationHslhs !== undefined) {
    kpis.unshift({ label: 'HSLHS Reg', value: report.totalRegistrationHslhs, color: PURPLE });
  }

  if (report.soulsSaved !== undefined) {
    kpis.splice(1, 0, { label: 'Souls Saved', value: report.soulsSaved, color: GREEN });
  } else if (report.newPartnersRecruited !== undefined || report.newPartners !== undefined) {
    kpis.splice(1, 0, { label: 'New Partners', value: report.newPartnersRecruited || report.newPartners || 0, color: GREEN });
  }

  kpis = kpis.slice(0, 4);

  const kpiW = (pw - 28) / kpis.length;
  kpis.forEach((k, i) => {
    const x = 14 + i * kpiW;
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...k.color);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, kpiW - 3, 18, 2, 2, 'FD');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY);
    doc.text(k.label.toUpperCase(), x + 3, y + 5);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...k.color);
    const val = String(k.value);
    doc.text(val.length > 12 ? val.substring(0, 12) + '…' : val, x + 3, y + 13);
  });
  y += 24;

  // Attendance bar
  const att = parseInt(String(report.totalAttendance || report.attendance).replace(/,/g, '')) || 0;
  if (att > 0) {
    checkPage(25);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Attendance Overview', 14, y);
    y += 5;

    const barMaxW = pw - 80;
    const barH    = 8;
    const barW    = Math.min((att / Math.max(att, 1)) * barMaxW, barMaxW);
    doc.setFillColor(230, 228, 250);
    doc.roundedRect(14, y, barMaxW, barH, 2, 2, 'F');
    doc.setFillColor(...PURPLE);
    doc.roundedRect(14, y, barW, barH, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text(`${att} attendees`, 14 + barMaxW + 4, y + 5.5);
    y += 16;
  }

  // ── Supporting images ────────────────────────────────────────
  const media = (report.media || []).filter(f => f.type?.startsWith('image'));

  if (media.length > 0) {
    checkPage(20);
    doc.setFillColor(...LIGHT);
    doc.roundedRect(14, y, pw - 28, 8, 2, 2, 'F');
    doc.setTextColor(...PURPLE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`SUPPORTING IMAGES (${media.length})`, 18, y + 5.5);
    y += 13;

    const base64Images = await Promise.all(media.map(f => urlToBase64(f.url)));
    const imgW = (pw - 28 - 6) / 3;
    const imgH = imgW * 0.75;
    let   col  = 0;

    for (let i = 0; i < base64Images.length; i++) {
      const b64 = base64Images[i];
      if (!b64) continue;
      if (col === 0) checkPage(imgH + 14);
      const x = 14 + col * (imgW + 3);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, imgW, imgH, 2, 2, 'S');
      try { doc.addImage(b64, 'JPEG', x + 0.5, y + 0.5, imgW - 1, imgH - 1); } catch (_) {}
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      const name = media[i].name || `Image ${i + 1}`;
      doc.text(name.length > 18 ? name.substring(0, 18) + '…' : name, x, y + imgH + 4);
      col++;
      if (col === 3) { col = 0; y += imgH + 10; }
    }
    if (col > 0) y += imgH + 10;
  }

  // ── Footer on every page ─────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(...PURPLE);
    doc.rect(0, ph - 10, pw, 10, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Loveworld Reports Platform — Confidential', 14, ph - 4);
    doc.text(`Page ${p} of ${totalPages}`, pw - 14, ph - 4, { align: 'right' });
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const personName = (report.submittedBy || report.submitterEmail || 'User').replace(/[^a-zA-Z0-9]/g, '_');
  const formName = (report.formName || 'Summary').replace(/\s+/g, '_');
  doc.save(`${personName}_${formName}_${dateStr}.pdf`);
}
