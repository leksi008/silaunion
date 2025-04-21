export class StagesAPI {
    static async getByContractId(contractId) {
        return this._fetch(`/api/contracts/${contractId}/stages/`);
    }

    static async create(contractId, stageData) {
        console.log('Create Stage Data:', stageData);  // Логирование данных для создания
        const data = { ...stageData, contract: contractId };
        return this._fetch(`/api/contracts/${contractId}/stages/`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async update(contractId, stageId, stageData) {
        console.log('Update Stage Data:', stageData);  // Логирование данных для обновления
        return this._fetch(`/api/contracts/${contractId}/stages/${stageId}/`, {
            method: 'PUT',
            body: JSON.stringify(stageData)
        });
    }


    static async delete(contractId, stageId) {
        console.log(`Deleting stage with ID: ${stageId} for contract with ID: ${contractId}`);
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
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Ошибка запроса');
        }

        // ✅ Безопасно разбираем JSON только если тело есть
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return null;
    }

}