import ExcelJS from 'exceljs';

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function sanitizeCell(value) {
  if (typeof value !== 'string') return value;
  return FORMULA_PREFIX.test(value) ? `'${value}` : value;
}

function sanitizeRow(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) out[k] = sanitizeCell(v);
  return out;
}

function buildWorkbook(data) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Unidades');
  const safe = data.map(sanitizeRow);
  if (safe.length === 0) return workbook;
  const headers = Object.keys(safe[0]);
  sheet.columns = headers.map((h) => ({ header: h, key: h }));
  safe.forEach((row) => sheet.addRow(row));
  return workbook;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportToExcel(data, filename = 'ELAM_Dashboard') {
  const workbook = buildWorkbook(data);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const fecha = new Date().toISOString().split('T')[0];
  triggerDownload(blob, `${filename}_${fecha}.xlsx`);
}

export async function exportToCSV(data, filename = 'ELAM_Dashboard') {
  const workbook = buildWorkbook(data);
  const buffer = await workbook.csv.writeBuffer();
  const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
  const fecha = new Date().toISOString().split('T')[0];
  triggerDownload(blob, `${filename}_${fecha}.csv`);
}
