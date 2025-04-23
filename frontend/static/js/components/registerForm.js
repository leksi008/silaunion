import { AuthAPI } from '/static/js/api/auth.js';
import { Notifications } from '/static/js/utils/notifications.js';

export class RegisterForm {
  constructor() {
    this.isLoading = false;
  }

  render() {
    return `
      <div class="auth-container">
        <div class="auth-form">
          <h2><i class="fas fa-user-plus"></i> Регистрация</h2>
          <form id="registerForm">
            <div class="form-group">
              <label for="username">Логин*</label>
              <input type="text" id="username" required>
            </div>

            <div class="form-group">
              <label for="password">Пароль*</label>
              <input type="password" id="password" required minlength="8">
            </div>

            <div class="form-group">
              <label for="email">Email*</label>
              <input type="email" id="email" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="first_name">Имя</label>
                <input type="text" id="first_name">
              </div>
              <div class="form-group">
                <label for="last_name">Фамилия</label>
                <input type="text" id="last_name">
              </div>
            </div>

            <button type="submit" class="btn-primary" ${this.isLoading ? 'disabled' : ''}>
              ${this.isLoading ? '<i class="fas fa-spinner fa-spin"></i> Регистрация...' : 'Зарегистрироваться'}
            </button>

            <div class="auth-link">
              Уже есть аккаунт? <a href="#" id="loginLink">Войти</a>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  bindEvents(app) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      this.isLoading = true;
      this._updateFormState();

      try {
        const userData = {
          username: document.getElementById('username').value,
          password: document.getElementById('password').value,
          email: document.getElementById('email').value,
          first_name: document.getElementById('first_name').value,
          last_name: document.getElementById('last_name').value
        };

        await AuthAPI.register(userData);
        Notifications.showSuccess('Регистрация прошла успешно!');
        app.showLogin();
      } catch (error) {
        Notifications.showError(error.message || 'Ошибка регистрации');
      } finally {
        this.isLoading = false;
        this._updateFormState();
      }
    });

    document.getElementById('loginLink').addEventListener('click', (e) => {
      e.preventDefault();
      app.showLogin();
    });
  }

  _updateFormState() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = this.isLoading;
      submitBtn.innerHTML = this.isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Регистрация...'
        : 'Зарегистрироваться';
    }
  }
}