export class ContractDetail {
    constructor(contract, stages = [], documents = []) {
        this.contract = contract;
        this.stages = stages;
        this.documents = documents;
    }

    render() {
        const stagesHtml = this.stages.length
            ? `<ul>${this.stages.map(s => `<li>${s.name} (${s.status})</li>`).join('')}</ul>`
            : '<p>Нет этапов</p>';

        const documentsHtml = this.documents.length
            ? `<div class="documents-list">
                ${this.documents.map(d => `
                    <div class="document-card">
                        <div class="document-info">
                            <a href="${d.file_url}" target="_blank" class="document-name">${d.name}</a>
                            <p class="document-size">${this.formatFileSize(d.size)}</p>
                        </div>
                        <div class="document-actions">
                            <button class="delete-doc-btn" data-id="${d.id}">🗑️ Удалить</button>
                        </div>
                    </div>
                `).join('')}
            </div>`
            : '<p>Нет документов</p>';

        return `
            <div class="contract-detail">
                <h2>Договор №${this.contract.number}</h2>
                <p><strong>Название:</strong> ${this.contract.name}</p>
                <p><strong>Заказчик:</strong> ${this.contract.customer}</p>
                <p><strong>Ответственный:</strong> ${this.contract.responsible_name || '—'}</p>
                <p><strong>Дата начала:</strong> ${this.contract.start_date}</p>
                <p><strong>Дата окончания:</strong> ${this.contract.end_date}</p>
                <p><strong>Статус:</strong> ${ContractDetail.getStatusDisplay(this.contract.status)}</p>
                <p><strong>Прогресс:</strong> ${this.contract.progress}%</p>

                <h3>Этапы</h3>
                ${stagesHtml}

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

formatFileSize(size) {
    if (size < 1024) return size + ' Б';
    if (size < 1048576) return (size / 1024).toFixed(2) + ' КБ';
    if (size < 1073741824) return (size / 1048576).toFixed(2) + ' МБ';
    return (size / 1073741824).toFixed(2) + ' ГБ';
}


    bindEvents(app) {
        // Обработчик для кнопки "Назад к списку"
        document.getElementById('backToListBtn')?.addEventListener('click', () => {
            app.showContractList();
        });

        // Обработчик для формы загрузки файлов
        const uploadForm = document.getElementById('uploadForm');
        uploadForm?.addEventListener('submit', async (e) => {
            e.preventDefault();  // Останавливаем стандартную отправку формы

            const fileInput = uploadForm.querySelector('input[name="file"]');
            const file = fileInput.files[0];

            // Проверяем, выбран ли файл
            if (!file) {
                alert('Пожалуйста, выберите файл для загрузки');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name);
            formData.append('contract', this.contract.id);  // Добавляем id контракта

            // Выводим информацию о файле для отладки
            console.log('Загружаемый файл:', file);

            try {
                const response = await fetch(`/api/contracts/${this.contract.id}/documents/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('📛 Ответ от сервера:', errorData);
                    throw new Error(`Ошибка при загрузке файла: ${JSON.stringify(errorData)}`);
                }

                // После успешной загрузки, обновляем список документов
                this.fetchDocuments(app);

            } catch (err) {
                console.error('❌ Ошибка при загрузке файла:', err);
                alert(err.message);
            }
        });

        // Обработчик для кнопок удаления документов
        document.querySelectorAll('.delete-doc-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const docId = btn.dataset.id;
                try {
                    const response = await fetch(`/api/contracts/${app.currentContract.id}/documents/${docId}/`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Ошибка при удалении документа');
                    }

                    // Обновляем список документов после удаления
                    this.fetchDocuments(app);

                } catch (err) {
                    console.error(err);
                    alert('Ошибка при удалении документа');
                }
            });
        });
    }

    updateDocumentList() {
        const documentsHtml = this.documents.length
            ? `<ul>${this.documents.map(d => `
                <li>
                    <a href="${d.file_url}" target="_blank">${d.name}</a>
                    <button class="delete-doc-btn" data-id="${d.id}">🗑️</button>
                </li>`).join('')}</ul>`
            : '<p>Нет документов</p>';

        const section = document.getElementById('documentsSection');
        if (section) {
            section.innerHTML = documentsHtml;

            // Повторно навешиваем события на кнопки удаления
            document.querySelectorAll('.delete-doc-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const docId = btn.dataset.id;
                    try {
                        const response = await fetch(`/api/contracts/${this.contract.id}/documents/${docId}/`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                            }
                        });

                        if (!response.ok) {
                            throw new Error('Ошибка при удалении документа');
                        }

                        await this.fetchDocuments();  // обновим список
                    } catch (err) {
                        console.error(err);
                        alert('Ошибка при удалении документа');
                    }
                });
            });
        }
    }

    // Метод для получения списка документов
    async fetchDocuments() {
        console.log('fetchDocuments вызван');
        try {
            const response = await fetch(`/api/contracts/${this.contract.id}/documents/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                }
            });

            if (response.ok) {
                this.documents = await response.json();
                this.updateDocumentList();  // 🔄 Обновим только часть DOM
            } else {
                throw new Error('Не удалось загрузить документы');
            }

        } catch (err) {
            console.error('❌ Ошибка при получении документов:', err);
            alert('Не удалось загрузить документы');
        }
    }



    static getStatusDisplay(status) {
        switch (status) {
            case 'active': return 'Активный';
            case 'completed': return 'Завершен';
            case 'suspended': return 'Приостановлен';
            default: return status;
        }
    }
}
