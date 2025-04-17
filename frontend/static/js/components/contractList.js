import { ContractForm } from '/static/js/components/contractForm.js';

export class ContractList {
    constructor(contracts) {
        this.contracts = contracts;
    }

    render() {
        return `
            <div class="contracts-container">
                <div class="contracts-header">
                    <h2><i class="fas fa-file-contract"></i> Список договоров</h2>
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
                </td>
            </tr>
        `;
    }

    bindEvents(app) {
        document.getElementById('addContract').addEventListener('click', () => {
            const contractForm = new ContractForm();
            document.getElementById('content').innerHTML = contractForm.render();
            contractForm.bindEvents(app);
        });

        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                app.showContractDetail(e.target.closest('button').dataset.id);
            });
        });

        // Аналогично для других кнопок...
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