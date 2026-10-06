const form = document.getElementById('formLogin');
const errorBox = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.classList.add('d-none');
  if (!validarForm(form)) return;           // validación en el front-end

  try {
    await api('/api/auth/login', 'POST', {
      username: document.getElementById('username').value.trim(),
      password: document.getElementById('password').value,
    });
    location.href = '/menu';
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.remove('d-none');
  }
});
