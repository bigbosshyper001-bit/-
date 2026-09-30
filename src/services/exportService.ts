/**
 * Universal Export Service
 * Supports:
 * - Excel (.xls with UTF-8 BOM, table formatting, and styling)
 * - CSV (RFC 4180 with UTF-8 BOM for Thai language support)
 * - Word (.doc format with standard Thai Government typography, tables, and signature blocks)
 * - PDF (Clean browser print-ready institutional report layout with MCU headers and signatures)
 * - Document Templates (Official Memo, Meeting Minutes, Agenda, Council Resolutions, Orders)
 */

import type { ExportFormat, ExportOptions } from '../types/architecture.ts';
import { auditLogService } from './auditLogService.ts';

export const exportService = {
  /**
   * Export dataset to specified format
   */
  exportData(
    format: ExportFormat,
    options: ExportOptions,
    currentUser?: { id: string; name: string; role: string }
  ): void {
    // 1. Audit log the export event
    if (currentUser) {
      auditLogService.log({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'EXPORT',
        module: options.subject || 'System',
        recordId: options.filename,
        recordTitle: `${options.title} (${format.toUpperCase()})`,
        details: `ส่งออกข้อมูลจำนวน ${options.data.length} รายการ ในรูปแบบไฟล์ ${format.toUpperCase()}`,
      });
    }

    if (format === 'csv') {
      this.exportCsv(options);
    } else if (format === 'excel') {
      this.exportExcel(options);
    } else if (format === 'word') {
      this.exportWord(options);
    } else if (format === 'pdf') {
      this.exportPdf(options);
    }
  },

  /**
   * CSV export with UTF-8 BOM
   */
  exportCsv(options: ExportOptions): void {
    const { filename, columns, data } = options;

    const headers = columns.map((col) => `"${col.title.replace(/"/g, '""')}"`).join(',');
    const rows = data.map((item) =>
      columns
        .map((col) => {
          const val = item[col.key] ?? '';
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    // Prefix with UTF-8 BOM (\uFEFF)
    const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  },

  /**
   * Excel-compatible export with UTF-8 BOM & XML Table
   */
  exportExcel(options: ExportOptions): void {
    const { filename, title, columns, data } = options;

    const headers = columns.map((col) => `<th>${col.title}</th>`).join('');
    const rows = data
      .map((item, idx) => {
        const cells = columns
          .map((col) => {
            const val = item[col.key] ?? '';
            const display = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return `<td>${display}</td>`;
          })
          .join('');
        return `<tr><td style="text-align:center;">${idx + 1}</td>${cells}</tr>`;
      })
      .join('');

    const htmlTable = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${filename.slice(0, 31)}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
        <style>
          table { border-collapse: collapse; width: 100%; font-family: 'TH Sarabun New', 'Noto Sans Thai', sans-serif; font-size: 14px; }
          th { background-color: #FBE7EF; color: #B83B6F; font-weight: bold; border: 1px solid #CBD5E1; padding: 10px; }
          td { border: 1px solid #CBD5E1; padding: 8px 10px; }
          h2 { color: #1E293B; font-family: 'TH Sarabun New', 'Noto Sans Thai', sans-serif; font-size: 18px; margin-bottom: 4px; }
          p { color: #64748B; font-size: 13px; margin-top: 0; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <p>มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (MCU Academic Affairs Management Platform) | วันที่ออกรายงาน: ${new Date().toLocaleDateString('th-TH')}</p>
        <table>
          <thead><tr><th style="width: 50px;">ลำดับ</th>${headers}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + htmlTable], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.xls`);
  },

  /**
   * Word (.doc) export for tabular reports
   */
  exportWord(options: ExportOptions): void {
    const { filename, title, subject, columns, data, department = 'กองวิชาการ สำนักงานอธิการบดี มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย' } = options;

    const headers = columns.map((col) => `<th>${col.title}</th>`).join('');
    const rows = data
      .map((item, idx) => {
        const cells = columns
          .map((col) => {
            const val = item[col.key] ?? '';
            const display = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return `<td>${display}</td>`;
          })
          .join('');
        return `<tr><td style="text-align:center;">${idx + 1}</td>${cells}</tr>`;
      })
      .join('');

    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page WordSection1 {
            size: 210mm 297mm;
            margin: 25.4mm 25.4mm 25.4mm 25.4mm;
            mso-header-margin: 36pt;
            mso-footer-margin: 36pt;
          }
          div.WordSection1 { page: WordSection1; }
          body {
            font-family: 'TH Sarabun New', 'TH SarabunPSK', 'Cordia New', sans-serif;
            font-size: 16pt;
            line-height: 1.25;
            color: #000000;
          }
          h1.doc-title {
            font-size: 20pt;
            font-weight: bold;
            color: #831843;
            text-align: center;
            margin: 0 0 4pt 0;
          }
          p.sub-title {
            font-size: 15pt;
            color: #374151;
            text-align: center;
            margin: 0 0 16pt 0;
          }
          table.report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14pt;
            font-size: 14pt;
          }
          table.report-table th {
            background-color: #F3F4F6;
            border: 1pt solid #4B5563;
            padding: 6pt;
            font-weight: bold;
            text-align: center;
          }
          table.report-table td {
            border: 1pt solid #9CA3AF;
            padding: 5pt 6pt;
            vertical-align: top;
          }
          .sig-container {
            margin-top: 36pt;
            width: 100%;
          }
          .sig-box {
            float: right;
            width: 260pt;
            text-align: center;
            font-size: 15pt;
          }
        </style>
      </head>
      <body>
        <div class="WordSection1">
          <h1 class="doc-title">${title}</h1>
          <p class="sub-title">${department}${subject ? ` | กลุ่ม: ${subject}` : ''}<br>วันที่พิมพ์รายงาน: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} (รวม ${data.length} รายการ)</p>
          
          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 35pt;">ลำดับ</th>
                ${headers}
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="sig-container">
            <div class="sig-box">
              <br><br>
              ลงชื่อ ....................................................<br>
              ( .................................................... )<br>
              ผู้รับรองข้อมูล / ผู้จัดทำรายงาน
            </div>
            <div style="clear: both;"></div>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + wordContent], { type: 'application/msword;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.doc`);
  },

  /**
   * Export Editable Thai Government Document Template to Word (.doc)
   */
  exportDocumentWord(title: string, htmlContent: string, filename: string): void {
    const wordDoc = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page WordSection1 {
            size: 210mm 297mm;
            margin: 25mm 25mm 25mm 25mm;
            mso-header-margin: 36pt;
            mso-footer-margin: 36pt;
          }
          div.WordSection1 { page: WordSection1; }
          body {
            font-family: 'TH Sarabun New', 'TH SarabunPSK', 'Cordia New', sans-serif;
            font-size: 16pt;
            line-height: 1.25;
            color: #000000;
          }
          table { border-collapse: collapse; width: 100%; }
          td, th { border: 1pt solid #000000; padding: 4pt 6pt; font-size: 15pt; }
        </style>
      </head>
      <body>
        <div class="WordSection1">
          ${htmlContent}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + wordDoc], { type: 'application/msword;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.doc`);
  },

  /**
   * Printable PDF generation via browser formatted print window
   */
  exportPdf(options: ExportOptions): void {
    const { title, subject, columns, data, department = 'กองวิชาการ สำนักงานอธิการบดี มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย' } = options;

    const headers = columns.map((col) => `<th>${col.title}</th>`).join('');
    const rows = data
      .map((item, idx) => {
        const cells = columns
          .map((col) => {
            const val = item[col.key] ?? '';
            const display = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return `<td>${display}</td>`;
          })
          .join('');
        return `<tr><td style="text-align:center; color:#64748B;">${idx + 1}</td>${cells}</tr>`;
      })
      .join('');

    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Noto Sans Thai', sans-serif; color: #1E293B; margin: 30px; line-height: 1.5; }
          .header { border-bottom: 2px solid #D94F87; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 18px; font-weight: bold; color: #B83B6F; margin: 0 0 4px 0; }
          .sub { font-size: 12px; color: #64748B; margin: 0; }
          .meta { font-size: 11px; color: #64748B; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; font-weight: 600; color: #334155; }
          td { border: 1px solid #E2E8F0; padding: 7px 10px; vertical-align: top; }
          tr:nth-child(even) { background: #FDFDFE; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; color: #64748B; page-break-inside: avoid; }
          .sig-box { text-align: center; width: 220px; border-top: 1px dotted #94A3B8; padding-top: 8px; margin-top: 50px; }
          @media print {
            body { margin: 15mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background:#FFF1F5; border:1px solid #F8CBDD; padding:10px 16px; margin-bottom:20px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <span style="color:#B83B6F; font-size:13px; font-weight:500;">กดพิมพ์หรือบันทึกเป็น PDF ผ่านหน้าต่างเบราว์เซอร์</span>
          <button onclick="window.print()" style="background:#D94F87; color:white; border:none; padding:6px 14px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:600;">พิมพ์เอกสาร / บันทึก PDF</button>
        </div>

        <div class="header">
          <div>
            <h1 class="title">${title}</h1>
            <p class="sub">${department}</p>
            ${subject ? `<p class="sub" style="color:#D94F87; font-weight:500;">กลุ่มข้อมูล: ${subject}</p>` : ''}
          </div>
          <div class="meta">
            <p>วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p>จำนวนรายการทั้งหมด: ${data.length} รายการ</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">ลำดับ</th>
              ${headers}
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          <div>
            <p>เอกสารรับรองสารสนเทศวิชาการ ออกจากระบบบริหารจัดการกองวิชาการ</p>
            <p>มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (MCU Academic Affairs Platform)</p>
          </div>
          <div class="sig-box">
            ลงชื่อ ....................................................<br>
            ( .................................................... )<br>
            ผู้รับรองข้อมูล
          </div>
        </div>
      </body>
      </html>
    `;

    // Try iframe print first to avoid popup blockers, or open new window
    this.printHtmlContent(html);
  },

  /**
   * Export Editable Thai Government Document Template to PDF
   */
  exportDocumentPdf(title: string, htmlContent: string): void {
    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
            color: #000;
            margin: 25mm 25mm 25mm 25mm;
            line-height: 1.35;
            font-size: 15pt;
          }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          td, th { border: 1px solid #333; padding: 6px 8px; font-size: 14pt; }
          @media print {
            body { margin: 15mm 20mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background:#FFF1F5; border:1px solid #F8CBDD; padding:10px 16px; margin-bottom:20px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <span style="color:#B83B6F; font-size:13px; font-weight:500;">เอกสารราชการ: กดพิมพ์หรือบันทึกเป็น PDF</span>
          <button onclick="window.print()" style="background:#D94F87; color:white; border:none; padding:6px 14px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:600;">พิมพ์เอกสาร / บันทึก PDF</button>
        </div>
        ${htmlContent}
      </body>
      </html>
    `;

    this.printHtmlContent(html);
  },

  /**
   * Helper to print HTML content safely
   */
  printHtmlContent(html: string): void {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    } else {
      // Fallback
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
      }
    }
  },

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
