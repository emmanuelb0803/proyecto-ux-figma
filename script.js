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

const form = document.getElementById('regionalForm');
const formStatus = document.getElementById('formStatus');
const requiredNote = document.querySelector('.required-note');

const getStoredRegistrations = () => {
  try {
    const stored = localStorage.getItem('regionalRegistrations');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const saveRegistration = (payload) => {
  const registrations = getStoredRegistrations();
  registrations.push(payload);
  localStorage.setItem('regionalRegistrations', JSON.stringify(registrations));
};

const showFormMessage = (message, type) => {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;
};

const validateRequiredFields = () => {
  const requiredFields = form?.querySelectorAll('input[required], select[required]');

  let isValid = true;

  requiredFields?.forEach((field) => {
    const value = field.value.trim();
    if (!value) {
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

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.checkValidity() || !validateRequiredFields()) {
    showFormMessage('Completa los campos obligatorios antes de enviar.', 'error');
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  saveRegistration(payload);
  form.reset();
  showFormMessage('¡Solicitud enviada correctamente!', 'success');
});
