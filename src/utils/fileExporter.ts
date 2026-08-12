import * as XLSX from "xlsx";
import { ProcessedDataSet } from "../types";

/**
 * Exports masked dataset to Excel (.xlsx) file
 */
export function exportMaskedDataToExcel(dataset: ProcessedDataSet) {
  if (!dataset || !dataset.maskedRows || dataset.maskedRows.length === 0) {
    alert("다운로드할 마스킹 데이터가 없습니다.");
    return;
  }

  // Create worksheet from maskedRows
  const worksheet = XLSX.utils.json_to_sheet(dataset.maskedRows, {
    header: dataset.headers,
  });

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "비식별화_데이터");

  // Determine base file name
  const baseName = dataset.fileName.replace(/\.[^/.]+$/, "");
  const exportFileName = `${baseName}_마스킹완료.xlsx`;

  // Write and download
  XLSX.writeFile(workbook, exportFileName);
}

/**
 * Exports masked dataset to CSV (.csv) file
 */
export function exportMaskedDataToCSV(dataset: ProcessedDataSet) {
  if (!dataset || !dataset.maskedRows || dataset.maskedRows.length === 0) {
    alert("다운로드할 마스킹 데이터가 없습니다.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(dataset.maskedRows, {
    header: dataset.headers,
  });

  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  // Add UTF-8 BOM for Korean Excel compatibility
  const blob = new Blob(["\ufeff" + csvOutput], {
    type: "text/csv;charset=utf-8;",
  });

  const baseName = dataset.fileName.replace(/\.[^/.]+$/, "");
  const exportFileName = `${baseName}_마스킹완료.csv`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = exportFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Auto-detects original file format and exports accordingly
 */
export function exportMaskedDataToOriginalFormat(dataset: ProcessedDataSet) {
  const isCSV = dataset.fileName.toLowerCase().endsWith(".csv");
  if (isCSV) {
    exportMaskedDataToCSV(dataset);
  } else {
    exportMaskedDataToExcel(dataset);
  }
}
