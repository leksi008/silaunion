import { AuthAPI } from '/static/js/api/auth.js';
import { Notifications } from '/static/js/utils/notifications.js';

// loginForm.js
export  class LoginForm {
    render() {
        return `
            <div class="auth-container">
                <div class="auth-form">
                    <h2><i class="fas fa-sign-in-alt"></i> Вход в систему</h2>
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="username">Логин</label>
                            <input type="text" id="username" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Пароль</label>
                            <input type="password" id="password" required>
                        </div>
                        <button type="submit" class="btn-primary">Войти</button>
                        <div class="auth-links">
                            Нет аккаунта? <a href="#" id="showRegister">Зарегистрироваться</a>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    bindEvents(app) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // 1. Выполняем вход через API
            const tokens = await AuthAPI.login(username, password);

            // 2. Сохраняем токены и данные пользователя
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
            localStorage.setItem('username', username);

            // 3. Показываем уведомление об успехе
            Notifications.showSuccess('Вход выполнен успешно!');

            // 4. Обновляем интерфейс
            app.init(); // Перезагружаем приложение

        } catch (error) {
            // 5. Обрабатываем ошибки
            console.error('Ошибка входа:', error);
            Notifications.showError(error.message || 'Ошибка входа');

            // 6. Очищаем поле пароля при ошибке
            document.getElementById('password').value = '';
        }
    });

    // Обработчик для перехода к регистрации
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        app.showRegister();
    });
    }
}