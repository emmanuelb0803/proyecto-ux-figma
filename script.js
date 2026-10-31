// MENÚ DE NAVEGACIÓN
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.main-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

document.querySelectorAll('.profile-button').forEach((button) => {
  button.addEventListener('click', () => {
    const contactCard = document.querySelector('.contact-card');

    if (contactCard) {
      contactCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    window.location.href = 'nosotros.html';
  });
});

// FORMULARIO DE REGISTRO
const form = document.getElementById('regionalForm');
const formStatus = document.getElementById('formStatus');
const requiredNote = document.querySelector('.required-note');

// Obtener registros guardados
const getStoredRegistrations = () => {
  try {
    const stored = localStorage.getItem('regionalRegistrations');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

// Guardar un nuevo registro
const saveRegistration = (payload) => {
  const registrations = getStoredRegistrations();
  registrations.push(payload);
  localStorage.setItem(
    'regionalRegistrations',
    JSON.stringify(registrations)
  );
};

// Mostrar mensajes del formulario
const showFormMessage = (message, type) => {
  if (!formStatus) return;

  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;
};

// Validar campos obligatorios
const validateRequiredFields = () => {
  const fields = form?.querySelectorAll('input, select, textarea');

  let isValid = true;

  fields?.forEach((field) => {
    const fieldIsValid = field.validity.valid
      && (!field.required || field.value.trim().length > 0);

    if (!fieldIsValid) {
      isValid = false;
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.setAttribute('aria-invalid', 'false');
    }
  });

  if (!isValid && requiredNote) {
    requiredNote.style.display = 'block';
  } else if (requiredNote) {
    requiredNote.style.display = 'none';
  }

  return isValid;
};

// Enviar formulario
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const requiredFieldsAreValid = validateRequiredFields();

  if (!form.checkValidity() || !requiredFieldsAreValid) {
    showFormMessage(
      'Completa los campos obligatorios antes de enviar.',
      'error'
    );

    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  saveRegistration(payload);

  form.reset();

  showFormMessage(
    '¡Solicitud enviada correctamente!',
    'success'
  );
});

const hasDatasetControls = document.querySelector(
  '.meta-panel, .table-panel, .product-stats, .data-button'
);

if (hasDatasetControls) {
  let tourismData = [];
  const officialDataUrl = 'https://www.datos.gov.co/resource/96r6-c6gb.json?$limit=50000&$where=departamento=%27VALLE%20DEL%20CAUCA%27';
  const officialDataRequest = fetch(officialDataUrl).then((response) => {
    if (!response.ok) {
      throw new Error('No fue posible consultar Datos Abiertos Colombia.');
    }

    return response.json();
  }).then((rows) => {
    if (!Array.isArray(rows) || !rows.length) {
      throw new Error('La fuente oficial no devolvió registros turísticos.');
    }

    tourismData = rows;
    return tourismData;
  }).catch((error) => {
    console.warn('No fue posible cargar los datos oficiales de turismo.', error);
    return tourismData;
  });

  const renderDatasetDetails = (rows) => {
    if (!rows.length) {
      document.querySelectorAll('.meta-panel dd').forEach((value) => {
        value.textContent = '—';
      });

      const totalProviders = document.querySelector('.product-stats article strong');
      if (totalProviders) totalProviders.textContent = '—';

      const productShell = document.querySelector('.product-shell');
      if (productShell && !productShell.querySelector('.data-source-message')) {
        const message = document.createElement('p');
        message.className = 'data-source-message';
        message.setAttribute('role', 'status');
        message.textContent = 'No fue posible cargar los datos oficiales; las visualizaciones pueden no estar actualizadas.';
        productShell.prepend(message);
      }

      return;
    }

    const metadata = document.querySelectorAll('.meta-panel dd');
    if (metadata[1]) metadata[1].textContent = rows.length.toLocaleString('es-CO');
    if (metadata[2]) metadata[2].textContent = Object.keys(rows[0] || {}).length;

    const totalProviders = document.querySelector('.product-stats article strong');
    if (totalProviders) totalProviders.textContent = rows.length.toLocaleString('es-CO');

    const tableBody = document.querySelector('.table-panel tbody');
    if (!tableBody || !rows[0]) return;

    const descriptions = {
      ano: 'Año del registro',
      codigo_rnt: 'Código del Registro Nacional de Turismo',
      cod_mun: 'Código del municipio',
      cod_dpto: 'Código del departamento',
      estado_rnt: 'Estado del Registro Nacional de Turismo',
      razon_social_establecimiento: 'Nombre del establecimiento o prestador',
      departamento: 'Departamento donde se encuentra',
      municipio: 'Municipio donde se encuentra',
      categoria: 'Categoría del prestador turístico',
      sub_categoria: 'Subcategoría del prestador turístico',
      habitaciones: 'Número de habitaciones',
      camas: 'Número de camas',
      num_emp1: 'Número de empleados'
    };

    tableBody.replaceChildren(...Object.keys(rows[0]).map((key) => {
      const row = document.createElement('tr');

      [key, 'Texto / Número', descriptions[key] || 'Campo del registro oficial']
        .forEach((value) => {
          const cell = document.createElement('td');
          cell.textContent = value;
          row.appendChild(cell);
        });

      return row;
    }));
  };

  officialDataRequest.then(renderDatasetDetails);

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 1000);
  };

  document.querySelectorAll('.data-button').forEach((button) => {
    button.addEventListener('click', async () => {
      await officialDataRequest;
      const action = button.dataset.action;

      if (action === 'view') {
        const win = window.open('', '_blank');
        if (win) {
          const pre = win.document.createElement('pre');
          pre.textContent = JSON.stringify(tourismData, null, 2);
          win.document.body.appendChild(pre);
        }
      }

      if (action === 'json') {
        downloadFile(
          JSON.stringify(tourismData, null, 2),
          'prestadores_turisticos.json',
          'application/json;charset=utf-8'
        );
      }

      if (action === 'csv' && tourismData.length) {
        const headers = Object.keys(tourismData[0]);
        const escapeCSV = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
        const csv = `\uFEFF${[
          headers.join(','),
          ...tourismData.map((row) => headers.map((key) => escapeCSV(row[key])).join(','))
        ].join('\n')}`;

        downloadFile(csv, 'prestadores_turisticos.csv', 'text/csv;charset=utf-8');
      }
    });
  });
}
