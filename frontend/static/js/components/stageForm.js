import { StagesAPI } from '../api/stages.js';
import { Notifications } from '../utils/notifications.js';

export class StageForm {
    constructor(contractId, stage = null) {
        this.contractId = contractId;
        this.stage = stage;  // если передан, значит редактируем
    }

    render() {
        return `
            <div class="stage-form">
                <h4>${this.stage ? 'Редактировать этап' : 'Добавить этап'}</h4>
                <form id="stageForm">
                    <label>Название</label>
                    <input type="text" name="name" value="${this.stage ? this.stage.name : ''}" required>

                    <label>Описание</label>
                    <textarea name="description">${this.stage ? this.stage.description : ''}</textarea>

                    <label>Планируемая дата</label>
                    <input type="date" name="planned_date" value="${this.stage ? this.stage.planned_date : ''}" required>

                    <label>Фактическая дата</label>
                    <input type="date" name="actual_date" value="${this.stage ? this.stage.actual_date || '' : ''}">

                    <label>
                        <input type="checkbox" name="is_completed" ${this.stage?.is_completed ? 'checked' : ''}>
                        Завершен
                    </label>

                    <button type="submit" class="btn-primary">
                        ${this.stage ? 'Сохранить' : 'Добавить'}
                    </button>
                </form>
            </div>
        `;
    }

    bindEvents(app) {
        const form = document.getElementById('stageForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const payload = {
                name: formData.get('name'),
                description: formData.get('description'),
                planned_date: formData.get('planned_date'),
                actual_date: formData.get('actual_date') || null,
                is_completed: formData.get('is_completed') === 'on',
                contract: this.contractId
            };

            try {
                if (this.stage) {
                    await StagesAPI.update(this.contractId, this.stage.id, payload);
                    Notifications.showSuccess('Этап обновлён');
                } else {
                    await StagesAPI.create(this.contractId, payload);
                    Notifications.showSuccess('Этап добавлен');
                }
                app.showContractDetail(this.contractId);  // перезагрузим детали договора
            } catch (err) {
                console.error(err);
                Notifications.showError('Ошибка при сохранении этапа');
            }
        });
    }
}
