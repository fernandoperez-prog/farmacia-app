const form = document.getElementById('formRegister');
const errorBox = document.getElementById('error');
const pass = document.getElementById('password');
const pass2 = document.getElementById('password2');

function coinciden() {
  pass2.setCustomValidity(pass.value === pass2.value ? '' : 'No coinciden');
}
pass.addEventListener('input', coinciden);
pass2.addEventListener('input', coinciden);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.classList.add('d-none');
  coinciden();
  if (!validarForm(form)) return;           // validación en el front-end

  try {
    await api('/api/auth/register', 'POST', {
      username: document.getElementById('username').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: pass.value,
      role: document.getElementById('role').value,
    });
    location.href = '/login';
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.remove('d-none');
  }
});
