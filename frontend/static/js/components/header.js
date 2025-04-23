import { Auth } from '/static/js/utils/auth.js';


export class Header {
  render() {
    return `
      <div class="header-container">
        <h1><i class="fas fa-file-contract"></i> Мониторинг Договоров</h1>
        <div class="user-actions">
          ${this._renderAuthButtons()}
        </div>
      </div>
    `;
  }

  _renderAuthButtons() {
    if (Auth.isLoggedIn()) {
      return `
        <span class="username">${localStorage.getItem('username')}</span>
        <button id="logoutBtn" class="btn-logout">
          <i class="fas fa-sign-out-alt"></i> Выйти
        </button>
      `;
    } else {
      return `
        <button id="loginBtn" class="btn-outline">
          <i class="fas fa-sign-in-alt"></i> Вход
        </button>
        <button id="registerBtn" class="btn-primary">
          <i class="fas fa-user-plus"></i> Регистрация
        </button>
      `;
    }
  }

  bindEvents(app) {
    document.getElementById('loginBtn')?.addEventListener('click', () => {
      app.showLogin();
    });

    document.getElementById('registerBtn')?.addEventListener('click', () => {
      app.showRegister();
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      Auth.logout();
      window.location.reload();
    });
  }
}