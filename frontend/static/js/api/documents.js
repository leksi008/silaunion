export class DocumentsAPI {
    static async getByContractId(contractId) {
        return this._fetch(`/api/contracts/${contractId}/documents/`);
    }

    static async upload(contractId, file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);

        return this._fetch(`/api/contracts/${contractId}/documents/`, {
            method: 'POST',
            body: formData
        }, false);
    }

    static async delete(contractId, documentId) {
        return this._fetch(`/api/contracts/${contractId}/documents/${documentId}/`, {
            method: 'DELETE'
        });
    }

    static async download(contractId, documentId, filename) {
        const url = `/api/contracts/${contractId}/documents/${documentId}/download/`;
        await Helpers.downloadFile(url, filename);
    }

    static async _fetch(url, options = {}, json = true) {
        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        };

        if (json) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            await Auth.refreshToken();
            return this._fetch(url, options, json);
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return json ? response.json() : response;
    }
}