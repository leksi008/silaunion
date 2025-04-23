export class AuthAPI {
    static async login(username, password) {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Ошибка авторизации');
            }

            const data = await response.json();

            // Сохраняем токены в localStorage
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('username', username);

            // Если пользователь был перенаправлен на страницу входа, сохраняем URL, на который нужно вернуть.
            const previousUrl = localStorage.getItem('previousUrl') || '/'; // главная страница как fallback

            // После успешной авторизации перенаправляем на нужный URL
            window.location.href = previousUrl;

            // Удаляем сохраненный URL
            localStorage.removeItem('previousUrl');

            return data;
        } catch (error) {
            throw error;
        }
    }

    static async register(userData) {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.detail || 'Ошибка регистрации';
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }



    static async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('Нет токена для обновления');
            }

            const response = await fetch('http://127.0.0.1:8000/api/auth/token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${refreshToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка обновления токена');
            }

            const data = await response.json();

            // Обновляем токен в localStorage
            localStorage.setItem('access_token', data.access);

            return data;
        } catch (error) {
            // Если не удается обновить токен, необходимо выполнить выход
            this.logout();
            throw error;
        }
    }

    static logout() {
        // Удаляем все данные из localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
    }

    static isLoggedIn() {
        // Проверяем, есть ли access_token в localStorage
        return !!localStorage.getItem('access_token');
    }

    static getAuthHeader() {
        // Возвращаем заголовок с токеном авторизации
        return {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
        };
    }
}
