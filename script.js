const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const tourismData = [
  {
    nombre: 'Hotel La Candelaria',
    municipio: 'Dovio',
    tipo_servicio: 'Hotel',
    departamento: 'Valle del Cauca',
    estado: 'Activo'
  },
  {
    nombre: 'Café del Valle Tours',
    municipio: 'Guacarí',
    tipo_servicio: 'Tour guiado',
    departamento: 'Valle del Cauca',
    estado: 'Activo'
  },
  {
    nombre: 'Aventura Los Andes',
    municipio: 'Buga',
    tipo_servicio: 'Aventura',
    departamento: 'Valle del Cauca',
    estado: 'Activo'
  },
  {
    nombre: 'Mirador del Río',
    municipio: 'Yotoco',
    tipo_servicio: 'Restaurant',
    departamento: 'Valle del Cauca',
    estado: 'Activo'
  },
  {
    nombre: 'Parque de la Cultura',
    municipio: 'Palmira',
    tipo_servicio: 'Cultural',
    departamento: 'Valle del Cauca',
    estado: 'Activo'
  }
];

const toCSV = (rows) => {
  const headers = ['nombre', 'municipio', 'tipo_servicio', 'departamento', 'estado'];
  const csvRows = [headers.join(',')];

  rows.forEach((row) => {
    const values = headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`);
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
};

const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

document.querySelectorAll('.data-button').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;

    if (action === 'view') {
      const json = JSON.stringify(tourismData, null, 2);
      const newWindow = window.open('', '_blank');

      if (newWindow) {
        newWindow.document.write(`<!doctype html><html><head><title>Ver datos</title><style>body{font-family:Arial,sans-serif;padding:24px;line-height:1.5;}pre{white-space:pre-wrap;word-break:break-word;}</style></head><body><pre>${json}</pre></body></html>`);
        newWindow.document.close();
      }
      return;
    }

    if (action === 'csv') {
      downloadFile(toCSV(tourismData), 'prestadores_turisticos.csv', 'text/csv;charset=utf-8;');
      return;
    }

    if (action === 'json') {
      downloadFile(JSON.stringify(tourismData, null, 2), 'prestadores_turisticos.json', 'application/json;charset=utf-8;');
    }
  });
});
