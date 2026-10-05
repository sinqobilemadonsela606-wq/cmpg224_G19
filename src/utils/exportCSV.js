export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const keys = Object.keys(data[0]);
  const headers = keys.join(',');

  const rows = data.map(item => 
    keys.map(key => {
      let val = item[key];
      if (typeof val === 'object' && val !== null) {
        val = `${val.first_name || ''} ${val.last_name || ''}`.trim() || JSON.stringify(val);
      }
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  );

  const csvContent = [headers, ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}