import { StageForm } from './stageForm.js';
import { Notifications } from '../utils/notifications.js';
import { StagesAPI } from '../api/stages.js';

export class StageList {
    constructor(stages) {
        this.stages = stages;
    }

    render() {
        return `
            <div id="contract-detail" data-contract-id="${this.contractId}">
                <div class="stages-container">
                    <h3><i class="fas fa-tasks"></i> Этапы Договора</h3>
                    <button id="addStage" class="btn-primary btn-small">
                        <i class="fas fa-plus"></i> Добавить этап
                    </button>

                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>Планируемая дата</th>
                                    <th>Фактическая дата</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.stages.map(stage => this._renderStageRow(stage)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    _renderStageRow(stage) {
        return `
            <tr>
                <td>${stage.name}</td>
                <td>${Helpers.formatDate(stage.planned_date)}</td>
                <td>${Helpers.formatDate(stage.actual_date)}</td>
                <td>${this._renderStatus(stage.is_completed, stage.actual_date)}</td>
                <td class="actions">
                    ${stage.is_completed ? '' : `
                        <button class="complete-stage-btn" data-stage-id="${stage.id}">Отметить выполненным</button>
                    `}
                    <button class="btn-edit" data-id="${stage.id}" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-stage-btn" data-stage-id="${stage.id}">Удалить</button>
                </td>
            </tr>
        `;
    }

    bindEvents(app) {
        document.getElementById('addStage')?.addEventListener('click', () => {
            const stageForm = new StageForm(app.currentContract.id);
            document.getElementById('stages-section').innerHTML = stageForm.render();
            stageForm.bindEvents(app);
        });

        document.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const stageId = e.target.closest('button').dataset.id;
                try {
                    await StagesAPI.markComplete(app.currentContract.id, stageId);
                    Notifications.showSuccess('Этап успешно завершен');
                    app.showContractDetail(app.currentContract.id);
                } catch (error) {
                    Notifications.showError(`Ошибка: ${error.message}`);
                }
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const stageId = e.target.closest('button').dataset.id;
                try {
                    const stage = await StagesAPI._fetch(`/api/contracts/${app.currentContract.id}/stages/${stageId}/`);
                    const stageForm = new StageForm(app.currentContract.id, stage);
                    document.getElementById('stages-section').innerHTML = stageForm.render();
                    stageForm.bindEvents(app);
                } catch (error) {
                    Notifications.showError(`Ошибка при загрузке этапа: ${error.message}`);
                }
            });
        });

        // Добавьте обработчики для других кнопок...
    }

    _renderStatus(isCompleted, actualDate) {
        if (isCompleted) {
            return '<span class="status-badge completed"><i class="fas fa-check-circle"></i> Завершен</span>';
        } else if (!actualDate) {
            return '<span class="status-badge not-started"><i class="fas fa-hourglass-start"></i> Не начат</span>';
        } else {
            return '<span class="status-badge active"><i class="fas fa-spinner"></i> В работе</span>';
        }
    }

}