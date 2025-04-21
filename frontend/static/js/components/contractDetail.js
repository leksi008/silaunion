import { StageList } from '/static/js/components/stageList.js';
import { StageForm } from '/static/js/components/stageForm.js';
import { StagesAPI } from '../api/stages.js';


export class ContractDetail {
    constructor(contract, stages = [], documents = [], app) {
        this.contract = contract;
        this.stages = stages;
        this.documents = documents;
        this.app = app;
        this.stageList = new StageList(this.stages);
    }

    render() {
        const documentsHtml = this.documents.length
            ? `<ul>${this.documents.map(d => `
                <li class="document-card">
                    <a href="${d.file_url}" target="_blank">${d.name}</a>
                    <button class="delete-doc-btn" data-id="${d.id}">🗑️</button>
                </li>`).join('')}</ul>`
            : '<p>Нет документов</p>';

        return `
            <div id="contract-detail" data-contract-id="${this.contract.id}">
                <h2>Договор №${this.contract.number}</h2>
                <p><strong>Название:</strong> ${this.contract.name}</p>
                <p><strong>Заказчик:</strong> ${this.contract.customer}</p>
                <p><strong>Ответственный:</strong> ${this.contract.responsible_name || '—'}</p>
                <p><strong>Дата начала:</strong> ${this.contract.start_date}</p>
                <p><strong>Дата окончания:</strong> ${this.contract.end_date}</p>
                <p><strong>Статус:</strong> ${ContractDetail.getStatusDisplay(this.contract.status)}</p>
                <p><strong>Прогресс:</strong> ${this.contract.progress}%</p>

                <div id="stages-section">
                    ${this.stageList.render()}
                </div>

                <h3>Документы</h3>
                <div id="documentsSection">
                    ${documentsHtml}
                </div>

                <form id="uploadForm" enctype="multipart/form-data">
                    <input type="file" name="file" required />
                    <button type="submit">Загрузить</button>
                </form>

                <button id="backToListBtn" class="btn-outline" style="margin-top: 20px;">
                    <i class="fas fa-arrow-left"></i> Назад к списку
                </button>
            </div>
        `;

    }

    bindEvents() {

        document.getElementById('backToListBtn')?.addEventListener('click', () => {
            this.app.showContractList();
        });

        document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const fileInput = form.querySelector('input[name="file"]');
            const file = fileInput.files[0];

            if (!file) {
                alert('Выберите файл');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name);
            formData.append('contract', this.contract.id);

            try {
                const response = await fetch(`/api/contracts/${this.contract.id}/documents/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Ошибка загрузки файла');
                }

                this.app.showContractDetail(this.contract.id); // обновим интерфейс

            } catch (err) {
                console.error(err);
                alert('Ошибка при загрузке файла');
            }
        });

        document.querySelectorAll('.delete-doc-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const docId = btn.dataset.id;
                try {
                    const response = await fetch(`/api/contracts/${this.contract.id}/documents/${docId}/`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Ошибка при удалении');
                    }

                    this.app.showContractDetail(this.contract.id); // обновим интерфейс

                } catch (err) {
                    console.error(err);
                    alert('Ошибка при удалении документа');
                }
            });
        });

        this.stageList.bindEvents(this.app);

        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-stage-btn')) {
                const stageId = e.target.dataset.stageId;
                const contractId = document.getElementById('contract-detail').dataset.contractId;
                console.log(`Contract ID: ${contractId}, Stage ID: ${stageId}`);

                if (confirm('Удалить эту стадию?')) {
                    try {
                        await StagesAPI.delete(contractId, stageId);
                        location.reload(); // или перерисовать список стадий
                    } catch (err) {
                        console.error('Ошибка при удалении стадии:', err);
                    }
                }
            }
        });

        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('complete-stage-btn')) {
                const stageId = e.target.dataset.stageId;
                const contractId = document.getElementById('contract-detail').dataset.contractId;

                try {
                    await StagesAPI.markComplete(contractId, stageId);
                    location.reload();
                } catch (err) {
                    console.error('Ошибка при отметке стадии выполненной:', err);
                }
            }
        });

    }







    static getStatusDisplay(status) {
        const map = {
            draft: 'Черновик',
            active: 'Активен',
            completed: 'Завершён'
        };
        return map[status] || status;
    }
}
