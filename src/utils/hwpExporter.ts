import { GeneratedReport } from "../types";

/**
 * Downloads generated report as .hwp (Hancom Office HWP Document)
 * Constructs a fully styled HWP HTML MIME Document that Hancom Office reads cleanly.
 */
export function exportToHWP(report: GeneratedReport) {
  const htmlContent = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns:hp="http://www.hancom.co.kr/hwp"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>${report.title}</title>
<style>
  @page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
  }
  body {
    font-family: '휴먼명조', 'Batang', 'Hangul', serif;
    font-size: 11pt;
    line-height: 160%;
    color: #000000;
  }
  .doc-header {
    text-align: center;
    border-bottom: 2px solid #0032A0;
    padding-bottom: 15px;
    margin-bottom: 20px;
  }
  .doc-title {
    font-size: 20pt;
    font-weight: bold;
    font-family: '신명조', 'Batang', serif;
    color: #0032A0;
    margin-bottom: 10px;
  }
  .meta-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  .meta-table td {
    padding: 6px 10px;
    font-size: 10pt;
    border: 1px solid #D1D5DB;
  }
  .meta-label {
    background-color: #F4F7FA;
    font-weight: bold;
    width: 18%;
    color: #0032A0;
    text-align: center;
  }
  .box-container {
    background-color: #F8FAFC;
    border: 1px solid #00A3E0;
    border-radius: 4px;
    padding: 12px 15px;
    margin-bottom: 20px;
  }
  .box-title {
    font-weight: bold;
    font-size: 11pt;
    color: #0032A0;
    margin-bottom: 8px;
  }
  .section-title {
    font-size: 14pt;
    font-weight: bold;
    color: #0032A0;
    margin-top: 25px;
    margin-bottom: 12px;
    border-left: 4px solid #00A3E0;
    padding-left: 8px;
  }
  ul, ol {
    margin-top: 5px;
    margin-bottom: 15px;
    padding-left: 20px;
  }
  li {
    margin-bottom: 6px;
  }
  .footer {
    margin-top: 40px;
    text-align: center;
    font-size: 9pt;
    color: #64748B;
    border-top: 1px solid #E2E8F0;
    padding-top: 10px;
  }
</style>
</head>
<body>

<div class="doc-header">
  <div style="font-size: 10pt; color: #0032A0; font-weight: bold; margin-bottom: 5px;">부산광역시 공공 데이터 분석 보고서</div>
  <div class="doc-title">${report.title}</div>
</div>

<table class="meta-table">
  <tr>
    <td class="meta-label">문서번호</td>
    <td>${report.docNumber}</td>
    <td class="meta-label">작성일자</td>
    <td>${report.date}</td>
  </tr>
  <tr>
    <td class="meta-label">소속부서</td>
    <td>${report.department}</td>
    <td class="meta-label">작성자</td>
    <td>${report.author}</td>
  </tr>
</table>

<div class="box-container">
  <div class="box-title">📊 1. 현황요약 (Executive Summary)</div>
  <ol style="margin:0; padding-left:20px;">
    ${report.summary2Sentences.map((s) => `<li style="margin-bottom:4px;">${s}</li>`).join("")}
  </ol>
</div>

<div class="box-container" style="border-color: #5B2C6F;">
  <div class="box-title" style="color: #5B2C6F;">🚨 2. 주요특이사항 (Key Findings)</div>
  <ul style="margin:0; padding-left:20px;">
    ${report.keyFindings3Items.map((f) => `<li style="margin-bottom:4px;">${f}</li>`).join("")}
  </ul>
</div>

<div class="box-container" style="border-color: #0032A0;">
  <div class="box-title" style="color: #0032A0;">💡 3. 권고조치 (Recommendations)</div>
  <ul style="margin:0; padding-left:20px;">
    ${report.recommendations2Items.map((r) => `<li style="margin-bottom:4px;">${r}</li>`).join("")}
  </ul>
</div>

<div class="section-title">📄 4. 세부 행정 보고서 본문</div>
<div style="white-space: pre-wrap; font-size: 10.5pt; line-height: 170%;">
${report.fullHtmlContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
</div>

<div class="footer">
  본 보고서는 부산광역시 SafeReport AI 비식별화 시스템을 통해 개인정보가 안전하게 조치된 후 자동 생성된 공공 보고서입니다.
</div>

</body>
</html>
  `;

  const blob = new Blob(["\ufeff" + htmlContent], {
    type: "application/x-hwp;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.title.replace(/[\/\:\*\?\"\<\|\>]/g, "_")}_${report.docNumber}.hwp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads report in .hwpx format
 */
export function exportToHWPX(report: GeneratedReport) {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hwpx:document xmlns:hwpx="http://www.hancom.co.kr/hwpml/2011/paragraph">
  <hwpx:head>
    <hwpx:title>${report.title}</hwpx:title>
    <hwpx:author>${report.author}</hwpx:author>
    <hwpx:department>${report.department}</hwpx:department>
    <hwpx:docNo>${report.docNumber}</hwpx:docNo>
  </hwpx:head>
  <hwpx:body>
    <hwpx:p style="title">${report.title}</hwpx:p>
    <hwpx:p style="meta">문서번호: ${report.docNumber} | 작성자: ${report.author} (${report.department})</hwpx:p>

    <hwpx:section name="현황요약">
      ${report.summary2Sentences.map((s) => `<hwpx:p>📊 ${s}</hwpx:p>`).join("")}
    </hwpx:section>

    <hwpx:section name="주요특이사항">
      ${report.keyFindings3Items.map((f) => `<hwpx:p>🚨 ${f}</hwpx:p>`).join("")}
    </hwpx:section>

    <hwpx:section name="권고조치">
      ${report.recommendations2Items.map((r) => `<hwpx:p>💡 ${r}</hwpx:p>`).join("")}
    </hwpx:section>

    <hwpx:section name="상세본문">
      <hwpx:p>${report.fullHtmlContent}</hwpx:p>
    </hwpx:section>
  </hwpx:body>
</hwpx:document>`;

  const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.title.replace(/[\/\:\*\?\"\<\|\>]/g, "_")}_${report.docNumber}.hwpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download as plain text
 */
export function exportToText(report: GeneratedReport) {
  const text = `=======================================================
[부산광역시 공공 데이터 분석 보고서]
=======================================================
■ 보고서명 : ${report.title}
■ 문서번호 : ${report.docNumber}
■ 소속부서 : ${report.department}
■ 작 성 자 : ${report.author}
■ 작성일자 : ${report.date}
=======================================================

📊 [현황요약] (2문장)
1. ${report.summary2Sentences[0] || ""}
2. ${report.summary2Sentences[1] || ""}

🚨 [주요특이사항] (3가지)
1. ${report.keyFindings3Items[0] || ""}
2. ${report.keyFindings3Items[1] || ""}
3. ${report.keyFindings3Items[2] || ""}

💡 [권고조치] (2가지)
1. ${report.recommendations2Items[0] || ""}
2. ${report.recommendations2Items[1] || ""}

=======================================================
📄 [상세 행정 보고서 본문]
=======================================================
${report.fullHtmlContent}

=======================================================
생성일시: ${report.generatedAt} (SafeReport AI - 부산광역시)
`;

  const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.title}_${report.docNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
