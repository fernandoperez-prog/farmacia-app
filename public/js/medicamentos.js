const tbody = document.getElementById('tbody');
const form = document.getElementById('form');
const modal = new bootstrap.Modal(document.getElementById('modal'));
const selTipo = document.getElementById('CodTipoMed');
const campos = ['descripcionMed', 'CodTipoMed', 'Marca', 'Presentacion', 'stock',
  'precioVentaUni', 'precioVentaPres', 'fechaFabricacion', 'fechaVencimiento'];
let lista = [];

function pintar(filtro = '') {
  const f = filtro.toLowerCase();
  const filas = lista.filter(m =>
    `${m.descripcionMed} ${m.Marca} ${m.TipoMedic?.descripcion}`.toLowerCase().includes(f));
  tbody.innerHTML = filas.map(m => `
    <tr>
      <td>${m.CodMedicamento}</td><td>${esc(m.descripcionMed)}</td>
      <td>${esc(m.TipoMedic?.descripcion)}</td><td>${esc(m.Marca)}</td>
      <td>${esc(m.Presentacion)}</td><td>${m.stock}</td>
      <td>S/ ${Number(m.precioVentaUni).toFixed(2)}</td><td>S/ ${Number(m.precioVentaPres).toFixed(2)}</td>
      <td>${m.fechaVencimiento}</td><td class="text-nowrap">${botonesAccion(m.CodMedicamento)}</td>
    </tr>`).join('') || '<tr><td colspan="10" class="text-center text-muted">Sin registros</td></tr>';
}

async function cargar() {
  const [tipos, meds] = await Promise.all([api('/api/tipos'), api('/api/medicamentos')]);
  selTipo.innerHTML = '<option value="">Seleccione...</option>' +
    tipos.map(t => `<option value="${t.CodTipoMed}">${esc(t.descripcion)}</option>`).join('');
  lista = meds;
  pintar(document.getElementById('buscar').value);
}

document.getElementById('buscar').addEventListener('input', e => pintar(e.target.value));

// La fecha de vencimiento debe ser posterior a la de fabricación
function validarFechas() {
  const fab = document.getElementById('fechaFabricacion').value;
  const ven = document.getElementById('fechaVencimiento');
  ven.setCustomValidity(fab && ven.value && ven.value <= fab ? 'Fecha inválida' : '');
}
['fechaFabricacion', 'fechaVencimiento'].forEach(id => document.getElementById(id).addEventListener('input', validarFechas));

document.getElementById('btnNuevo').addEventListener('click', () => {
  form.reset();
  form.querySelectorAll('.is-invalid').forEach(e => e.classList.remove('is-invalid'));
  document.getElementById('id').value = '';
  document.getElementById('modalTitulo').textContent = 'Nuevo Medicamento';
  modal.show();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  validarFechas();
  if (!validarForm(form)) return;
  const id = document.getElementById('id').value;
  const data = {};
  campos.forEach(c => (data[c] = document.getElementById(c).value.trim()));
  try {
    await api(id ? `/api/medicamentos/${id}` : '/api/medicamentos', id ? 'PUT' : 'POST', data);
    modal.hide();
    toast(id ? 'Medicamento actualizado' : 'Medicamento creado');
    cargar();
  } catch (err) { toast(err.message, 'danger'); }
});

tbody.addEventListener('click', async (e) => {
  const edit = e.target.closest('[data-edit]');
  const del = e.target.closest('[data-del]');
  if (edit) {
    const m = lista.find(x => x.CodMedicamento == edit.dataset.edit);
    document.getElementById('id').value = m.CodMedicamento;
    campos.forEach(c => (document.getElementById(c).value = m[c] ?? ''));
    document.getElementById('modalTitulo').textContent = 'Editar Medicamento';
    modal.show();
  }
  if (del && confirm('¿Eliminar este medicamento?')) {
    try { await api(`/api/medicamentos/${del.dataset.del}`, 'DELETE'); toast('Medicamento eliminado'); cargar(); }
    catch (err) { toast(err.message, 'danger'); }
  }
});

cargar();
