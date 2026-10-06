const tbody = document.getElementById('tbody');

async function cargar() {
  const users = await api('/api/usuarios');
  tbody.innerHTML = users.map(u => `
    <tr><td>${u.id}</td><td>${esc(u.username)}</td><td>${esc(u.email)}</td>
    <td><span class="badge bg-primary">${u.role}</span></td>
    <td><button class="btn btn-outline-danger btn-sm" data-del="${u.id}"><i class="bi bi-trash"></i></button></td></tr>`).join('');
}

tbody.addEventListener('click', async (e) => {
  const del = e.target.closest('[data-del]');
  if (del && confirm('¿Eliminar este usuario?')) {
    try { await api(`/api/usuarios/${del.dataset.del}`, 'DELETE'); toast('Usuario eliminado'); cargar(); }
    catch (err) { toast(err.message, 'danger'); }
  }
});

cargar();
