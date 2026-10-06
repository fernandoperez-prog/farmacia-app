const tbody = document.getElementById('tbody');
const form = document.getElementById('form');
const modal = new bootstrap.Modal(document.getElementById('modal'));
let lista = [];

async function cargar() {
  lista = await api('/api/tipos');
  tbody.innerHTML = lista.map(t => `
    <tr><td>${t.CodTipoMed}</td><td>${esc(t.descripcion)}</td><td>${botonesAccion(t.CodTipoMed)}</td></tr>`).join('')
    || '<tr><td colspan="3" class="text-center text-muted">Sin registros</td></tr>';
}

document.getElementById('btnNuevo').addEventListener('click', () => {
  form.reset();
  form.querySelectorAll('.is-invalid').forEach(e => e.classList.remove('is-invalid'));
  document.getElementById('id').value = '';
  document.getElementById('modalTitulo').textContent = 'Nuevo Tipo';
  modal.show();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validarForm(form)) return;
  const id = document.getElementById('id').value;
  const data = { descripcion: document.getElementById('descripcion').value.trim() };
  try {
    await api(id ? `/api/tipos/${id}` : '/api/tipos', id ? 'PUT' : 'POST', data);
    modal.hide();
    toast(id ? 'Tipo actualizado' : 'Tipo creado');
    cargar();
  } catch (err) { toast(err.message, 'danger'); }
});

tbody.addEventListener('click', async (e) => {
  const edit = e.target.closest('[data-edit]');
  const del = e.target.closest('[data-del]');
  if (edit) {
    const t = lista.find(x => x.CodTipoMed == edit.dataset.edit);
    document.getElementById('id').value = t.CodTipoMed;
    document.getElementById('descripcion').value = t.descripcion;
    document.getElementById('modalTitulo').textContent = 'Editar Tipo';
    modal.show();
  }
  if (del && confirm('¿Eliminar este tipo?')) {
    try { await api(`/api/tipos/${del.dataset.del}`, 'DELETE'); toast('Tipo eliminado'); cargar(); }
    catch (err) { toast(err.message, 'danger'); }
  }
});

cargar();
