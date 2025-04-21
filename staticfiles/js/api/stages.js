export class StagesAPI {
    static async getByContractId(contractId) {
        return this._fetch(`/api/contracts/${contractId}/stages/`);
    }

    static async create(contractId, stageData) {
        return this._fetch(`/api/contracts/${contractId}/stages/`, {
            method: 'POST',
            body: JSON.stringify(stageData)
        });
    }

    static async update(contractId, stageId, stageData) {
        return this._fetch(`/api/contracts/${contractId}/stages/${stageId}/`, {
            method: 'PUT',
            body: JSON.stringify(stageData)
        });
    }

    static async delete(contractId, stageId) {
        return this._fetch(`/api/contracts/${contractId}/stages/${stageId}/`, {
            method: 'DELETE'
        });
    }

    static async markComplete(contractId, stageId) {
        return this._fetch(`/api/contracts/${contractId}/stages/${stageId}/complete/`, {
            method: 'PATCH'
        });
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