import * as XLSX from 'xlsx';

/**
 * Exporta datos a archivo Excel
 * @param {Array} data - Array de objetos con los datos
 * @param {string} filename - Nombre del archivo sin extensión
 */
export function exportToExcel(data, filename = 'ELAM_Dashboard') {
  // Preparar datos para Excel
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Unidades');

  // Generar archivo con fecha
  const fecha = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filename}_${fecha}.xlsx`);
}

/**
 * Exporta datos a archivo CSV
 * @param {Array} data - Array de objetos con los datos
 * @param {string} filename - Nombre del archivo sin extensión
 */
export function exportToCSV(data, filename = 'ELAM_Dashboard') {
  // Convertir a CSV
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  // Crear blob y descargar
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const fecha = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${fecha}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
