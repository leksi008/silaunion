import { ContractForm } from '/static/js/components/contractForm.js';
import { Notifications } from '/static/js/utils/notifications.js';
import { ContractsAPI } from '/static/js/api/contracts.js';
import { AuthAPI } from '/static/js/api/auth.js';

export class ContractList {
    constructor(contracts) {
        this.allContracts = contracts;
        this.contracts = contracts;
    }

    render() {
        return `
            <div class="contracts-container">
                <div class="contracts-header">
                    <div class="search-bar">
                        <input type="text" id="contractSearch" placeholder="Поиск по номеру договора" />
                    </div>
                    <h2><i class="fas fa-file-contract"></i> Список Договоров</h2>
                    <button id="addContract" class="btn-primary">
                        <i class="fas fa-plus"></i> Добавить
                    </button>
                </div>

                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>Название</th>
                                <th>Клиент</th>
                                <th>Дата начала</th>
                                <th>Дата окончания</th>
                                <th>Статус</th>
                                <th>Прогресс</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.contracts.map(contract => this._renderContractRow(contract)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    _renderContractRow(contract) {
        return `
            <tr>
                <td>${contract.number}</td>
                <td>${contract.name}</td>
                <td>${contract.customer}</td>
                <td>${Helpers.formatDate(contract.start_date)}</td>
                <td>${Helpers.formatDate(contract.end_date)}</td>
                <td>${this._renderStatusBadge(contract.status)}</td>
                <td>${this._renderProgressBar(contract.progress)}</td>
                <td class="actions">
                    <button class="btn-view" data-id="${contract.id}" title="Просмотр">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-edit" data-id="${contract.id}" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-report" data-id="${contract.id}" title="Отчет">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                    <button class="btn-delete" data-id="${contract.id}" title="Удалить">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    _updateTable(app) {
        const tbody = document.querySelector('.contracts-container tbody');
        if (tbody) {
            tbody.innerHTML = this.contracts.map(contract => this._renderContractRow(contract)).join('');
            this._bindRowEvents(app);
        }
    }

    bindEvents(app) {
        document.getElementById('addContract').addEventListener('click', () => {
            const contractForm = new ContractForm();
            document.getElementById('content').innerHTML = contractForm.render();
            contractForm.bindEvents(app);
        });

        const searchInput = document.getElementById('contractSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                this.contracts = this.allContracts.filter(contract =>
                    contract.number.toLowerCase().includes(query)
                );
                this._updateTable(app);
            });
        }

        this._bindRowEvents(app);
    }

    _bindRowEvents(app) {
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                app.showContractDetail(e.target.closest('button').dataset.id);
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.closest('button').dataset.id;
                try {
                    const contract = await ContractsAPI.getById(id);
                    const contractForm = new ContractForm(contract);
                    document.getElementById('content').innerHTML = contractForm.render();
                    contractForm.bindEvents(app);
                } catch (err) {
                    Notifications.showError('Не удалось загрузить данные договора');
                }
            });
        });

        document.querySelectorAll('.btn-report').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const contractId = btn.dataset.id;
                const token = localStorage.getItem('access_token');
                try {
                    const response = await fetch(`/api/contracts/${contractId}/report-pdf/`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('Ошибка при получении отчета');
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, '_blank');
                } catch (error) {
                    Notifications.showError('Не удалось получить отчет');
                }
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const contractId = btn.dataset.id;
                if (!confirm('Удалить договор?')) return;
                try {
                    const response = await fetch(`/api/contracts/${contractId}/`, {
                        method: 'DELETE',
                        headers: AuthAPI.getAuthHeader(),
                    });
                    if (!response.ok) throw new Error();
                    btn.closest('tr').remove();
                    Notifications.showSuccess('Договор удалён');
                } catch {
                    Notifications.showError('Ошибка при удалении');
                }
            });
        });
    }

    _renderStatusBadge(status) {
        const statusText = {
            'active': 'Активный',
            'completed': 'Завершен',
            'suspended': 'Приостановлен'
        };
        return `<span class="status-badge ${status}">${statusText[status]}</span>`;
    }

    _renderProgressBar(progress) {
        return `
            <div class="progress-container">
                <div class="progress-bar" style="width: ${progress}%"></div>
                <span class="progress-text">${progress}%</span>
            </div>
        `;
    }
}