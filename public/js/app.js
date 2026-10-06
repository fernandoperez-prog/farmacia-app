// ---------- Utilidades compartidas ----------
const ROL = document.body.dataset.role;
const puedeEscribir = ROL === 'admin' || ROL === 'moderator';
const puedeEliminar = ROL === 'admin';

async function api(url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { location.href = '/login'; return; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Error en la solicitud');
  return data;
}

function toast(msg, tipo = 'success') {
  const el = document.createElement('div');
  el.className = `toast align-items-center text-bg-${tipo} border-0 show`;
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div></div>`;
  document.getElementById('toastBox').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// Valida con las reglas HTML5 y marca los campos inválidos (Bootstrap)
function validarForm(form) {
  let ok = true;
  form.querySelectorAll('input, select').forEach(el => {
    if (el.type === 'hidden') return;
    const valido = el.checkValidity();
    el.classList.toggle('is-invalid', !valido);
    if (!valido) ok = false;
  });
  return ok;
}

function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Oculta los botones de escritura según el rol
if (!puedeEscribir) document.querySelectorAll('.solo-escritura').forEach(e => e.classList.add('d-none'));

// Cerrar sesión
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) btnLogout.addEventListener('click', async () => {
  await api('/api/auth/logout', 'POST');
  location.href = '/login';
});

// Botones de acciones de la tabla según permisos
function botonesAccion(id) {
  let h = '';
  if (puedeEscribir) h += `<button class="btn btn-outline-primary btn-sm me-1" data-edit="${id}"><i class="bi bi-pencil"></i></button>`;
  if (puedeEliminar) h += `<button class="btn btn-outline-danger btn-sm" data-del="${id}"><i class="bi bi-trash"></i></button>`;
  return h || '<span class="text-muted">—</span>';
}
