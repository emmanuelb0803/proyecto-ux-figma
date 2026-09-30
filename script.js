const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.main-nav');
menuButton?.addEventListener('click', () => { const isOpen = nav.classList.toggle('is-open'); menuButton.setAttribute('aria-expanded', String(isOpen)); });
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { nav.classList.remove('is-open'); menuButton?.setAttribute('aria-expanded', 'false'); }));
document.querySelector('.profile-button')?.addEventListener('click', () => { window.location.href = 'nosotros.html'; });
const fallbackData = [{ nombre: 'Hotel La Candelaria', municipio: 'Dovio', tipo_servicio: 'Hotel', departamento: 'Valle del Cauca', estado: 'Activo' }, { nombre: 'Café del Valle Tours', municipio: 'Guacarí', tipo_servicio: 'Tour guiado', departamento: 'Valle del Cauca', estado: 'Activo' }, { nombre: 'Aventura Los Andes', municipio: 'Buga', tipo_servicio: 'Aventura', departamento: 'Valle del Cauca', estado: 'Activo' }, { nombre: 'Mirador del Río', municipio: 'Yotoco', tipo_servicio: 'Restaurante', departamento: 'Valle del Cauca', estado: 'Activo' }, { nombre: 'Parque de la Cultura', municipio: 'Palmira', tipo_servicio: 'Cultural', departamento: 'Valle del Cauca', estado: 'Activo' }];
let tourismData = fallbackData;
const officialDataUrl = 'https://www.datos.gov.co/resource/96r6-c6gb.json?$limit=50000&$where=departamento=%27VALLE%20DEL%20CAUCA%27';
const officialDataRequest = fetch(officialDataUrl).then((response) => {
	if (!response.ok) throw new Error('No fue posible consultar Datos Abiertos Colombia.');
	return response.json();
}).then((rows) => {
	if (Array.isArray(rows) && rows.length) tourismData = rows;
	return tourismData;
}).catch(() => tourismData);

const renderDatasetDetails = (rows) => {
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
	tableBody.innerHTML = Object.keys(rows[0]).map((key) => `<tr><td>${key}</td><td>Texto / Número</td><td>${descriptions[key] || 'Campo del registro oficial'}</td></tr>`).join('');
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
document.querySelectorAll('.data-button').forEach((button) => button.addEventListener('click', async () => {
	await officialDataRequest;
	const action = button.dataset.action;
	if (action === 'view') {
		const win = window.open('', '_blank');
		if (win) {
			win.document.write(`<pre>${JSON.stringify(tourismData, null, 2)}</pre>`);
			win.document.close();
		}
	}
	if (action === 'json') downloadFile(JSON.stringify(tourismData, null, 2), 'prestadores_turisticos.json', 'application/json;charset=utf-8');
	if (action === 'csv') {
		const headers = Object.keys(tourismData[0]);
		const escapeCSV = (value) => `"${String(value).replace(/"/g, '""')}"`;
		const csv = `\uFEFF${[headers.join(','), ...tourismData.map((row) => headers.map((key) => escapeCSV(row[key])).join(','))].join('\n')}`;
		downloadFile(csv, 'prestadores_turisticos.csv', 'text/csv;charset=utf-8');
	}
}));
const form = document.querySelector('#regionalForm'); const status = document.querySelector('#formStatus'); const requiredNote = document.querySelector('.required-note');
form?.addEventListener('submit', (event) => { event.preventDefault(); if (!form.checkValidity()) { requiredNote.style.display = 'block'; status.textContent = 'Completa los campos obligatorios antes de enviar.'; status.className = 'form-status error'; form.reportValidity(); return; } const records = JSON.parse(localStorage.getItem('regionalRegistrations') || '[]'); records.push(Object.fromEntries(new FormData(form).entries())); localStorage.setItem('regionalRegistrations', JSON.stringify(records)); form.reset(); requiredNote.style.display = 'none'; status.textContent = '¡Solicitud enviada correctamente!'; status.className = 'form-status success'; });
