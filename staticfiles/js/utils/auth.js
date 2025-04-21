// auth.js
import { AuthAPI } from '../api/auth.js';  // Исправляем импорт

class Auth {
    static async login(username, password) {
        const data = await AuthAPI.login(username, password);
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('username', username);
        return data;
    }

    static async refreshToken() {
        try {
            const data = await AuthAPI.refreshToken();
            localStorage.setItem('access_token', data.access);
            return data;
        } catch (error) {
            this.logout();
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
    }

    static isLoggedIn() {
        return !!localStorage.getItem('access_token');
    }

    static getAuthHeader() {
        return {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        };
    }
}

window.Auth = Auth;
export { Auth };
