export class ContractsAPI {
    static async getAll() {
        return this._fetch('/api/contracts/');
    }

    static async getById(id) {
        return this._fetch(`/api/contracts/${id}/`);
    }

    static async create(data) {
        return this._fetch('/api/contracts/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async update(id, data) {
        return this._fetch(`/api/contracts/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async delete(id) {
        return this._fetch(`/api/contracts/${id}/`, {
            method: 'DELETE'
        });
    }

    static async getReport(id) {
        return this._fetch(`/api/contracts/${id}/report/`);
    }

    static async _fetch(url, options = {}) {
        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            await Auth.refreshToken();
            return this._fetch(url, options);
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}