class StageList {
    constructor(stages) {
        this.stages = stages;
    }

    render() {
        return `
            <div class="stages-container">
                <h3><i class="fas fa-tasks"></i> Этапы договора</h3>
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
        `;
    }

    _renderStageRow(stage) {
        return `
            <tr>
                <td>${stage.name}</td>
                <td>${Helpers.formatDate(stage.planned_date)}</td>
                <td>${Helpers.formatDate(stage.actual_date)}</td>
                <td>${this._renderStatus(stage.is_completed)}</td>
                <td class="actions">
                    ${stage.is_completed ? '' : `
                        <button class="btn-complete" data-id="${stage.id}" title="Завершить">
                            <i class="fas fa-check"></i>
                        </button>
                    `}
                    <button class="btn-edit" data-id="${stage.id}" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" data-id="${stage.id}" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
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

        // Добавьте обработчики для других кнопок...
    }

    _renderStatus(isCompleted) {
        return isCompleted
            ? '<span class="status-badge completed"><i class="fas fa-check-circle"></i> Завершен</span>'
            : '<span class="status-badge active"><i class="fas fa-spinner"></i> В работе</span>';
    }
}