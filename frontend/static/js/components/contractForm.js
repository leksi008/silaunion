import { Notifications } from '/static/js/utils/notifications.js';
import { ContractsAPI } from '/static/js/api/contracts.js';

export class ContractForm {
    constructor(contract = null) {
        this.contract = contract;
        this.isEditMode = !!contract;
    }

    render() {
        return `
            <div class="form-container">
                <h2>${this.isEditMode ? 'Редактирование договора' : 'Новый договор'}</h2>
                <form id="contractForm">
                    <div class="form-group">
                        <label for="number">Номер договора</label>
                        <input type="text" id="number" value="${this.contract?.number || ''}" required>
                    </div>

                    <div class="form-group">
                        <label for="name">Название</label>
                        <input type="text" id="name" value="${this.contract?.name || ''}" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="start_date">Дата начала</label>
                            <input type="date" id="start_date" value="${this.contract?.start_date || ''}" required>
                        </div>

                        <div class="form-group">
                            <label for="end_date">Дата окончания</label>
                            <input type="date" id="end_date" value="${this.contract?.end_date || ''}" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="customer">Заказчик</label>
                        <input type="text" id="customer" value="${this.contract?.customer || ''}" required>
                    </div>

                    <div class="form-group">
                        <label for="status">Статус</label>
                        <select id="status">
                            <option value="active" ${this.contract?.status === 'active' ? 'selected' : ''}>Активный</option>
                            <option value="suspended" ${this.contract?.status === 'suspended' ? 'selected' : ''}>Приостановлен</option>
                            <option value="completed" ${this.contract?.status === 'completed' ? 'selected' : ''}>Завершен</option>
                        </select>
                    </div>

                    <div class="form-actions">
                        <button type="button" id="cancelBtn" class="btn-secondary">Отмена</button>
                        <button type="submit" class="btn-primary">
                            ${this.isEditMode ? 'Сохранить изменения' : 'Создать договор'}
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    bindEvents(app) {
        document.getElementById('contractForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const contractData = {
                number: document.getElementById('number').value,
                name: document.getElementById('name').value,
                start_date: document.getElementById('start_date').value,
                end_date: document.getElementById('end_date').value,
                customer: document.getElementById('customer').value,
                status: document.getElementById('status').value
            };

            try {
                if (this.isEditMode) {
                    await ContractsAPI.update(this.contract.id, contractData);
                    Notifications.showSuccess('Договор успешно обновлен');
                } else {
                    await ContractsAPI.create(contractData);
                    Notifications.showSuccess('Договор успешно создан');
                }
                app.showContractList();
            } catch (error) {
                Notifications.showError(`Ошибка: ${error.message}`);
            }
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            app.showContractList();
        });
    }
}