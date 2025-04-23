import { AuthAPI } from '/static/js/api/auth.js';
import { DocumentsAPI } from '/static/js/api/documents.js';
import { StagesAPI } from '/static/js/api/stages.js';
import { ContractsAPI } from '/static/js/api/contracts.js';
import { LoginForm } from '/static/js/components/loginForm.js';
import { RegisterForm } from '/static/js/components/registerForm.js';
import { ContractDetail } from '/static/js/components/contractDetail.js';
import { Header } from '/static/js/components/header.js';
import { Notifications } from '/static/js/utils/notifications.js';
import { ContractList } from '/static/js/components/contractList.js';
import { ContractForm } from '/static/js/components/contractForm.js';
import { StageList } from '/static/js/components/stageList.js';
import { StageForm } from '/static/js/components/stageForm.js';

class App {
    showLogin() {
        const loginForm = new LoginForm();
        document.getElementById('content').innerHTML = loginForm.render();
        loginForm.bindEvents(this);
    }

    showRegister() {
        const registerForm = new RegisterForm();
        document.getElementById('content').innerHTML = registerForm.render();
        registerForm.bindEvents(this);
    }

    constructor() {
        this.currentContract = null;
        this.init();
    }

    async init() {
        if (!AuthAPI.isLoggedIn()) {
            this.showLogin();  // Показываем форму входа, если пользователь не авторизован
            return;
        }
        localStorage.setItem('previousUrl', window.location.pathname);
        this.renderHeader();
        this.showContractList();  // Показываем список контрактов
    }

    renderHeader() {
        const header = new Header();
        document.getElementById('header').innerHTML = header.render();
        header.bindEvents();
    }

    async showContractList() {
        try {
            const contracts = await ContractsAPI.getAll();
            const contractList = new ContractList(contracts);
            document.getElementById('content').innerHTML = contractList.render();
            contractList.bindEvents(this);
        } catch (error) {
            Notifications.showError('Не удалось загрузить список договоров');
            console.error(error);
        }
    }

    async showContractDetail(contractId) {
        try {
            const contract = await ContractsAPI.getById(contractId);
            this.currentContract = contract;

            const [stages, documents] = await Promise.all([
                StagesAPI.getByContractId(contractId),
                DocumentsAPI.getByContractId(contractId)
            ]);

            const contractDetail = new ContractDetail(contract, stages, documents, this);

            document.getElementById('content').innerHTML = contractDetail.render();
            contractDetail.bindEvents();

        } catch (error) {
            Notifications.showError('Не удалось загрузить данные договора');
            console.error(error);
        }
    }



    bindEvents() {
        const self = this;

        document.getElementById('backToListBtn')?.addEventListener('click', () => {
            self.showContractList();
        });

        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const fileInput = uploadForm.querySelector('input[name="file"]');
                if (!fileInput || fileInput.files.length === 0) {
                    alert('Пожалуйста, выберите файл для загрузки.');
                    return;
                }

                const file = fileInput.files[0];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('contract', self.currentContract.id);
                formData.append('name', file.name);


                try {
                    const response = await fetch(`/api/contracts/${self.currentContract.id}/documents/`, {
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

                    self.showContractDetail(self.currentContract.id);
                } catch (err) {
                    console.error('❌ Ошибка при загрузке файла:', err);
                    alert(err.message);
                }
            });
        }

        document.querySelectorAll('.delete-doc-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const docId = btn.dataset.id;
                try {
                    await fetch(`/api/contracts/${self.currentContract.id}/documents/${docId}/`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        }
                    });
                    self.showContractDetail(self.currentContract.id);
                } catch (err) {
                    console.error('Ошибка при удалении документа:', err);
                    alert('Ошибка при удалении документа');
                }
            });
        });
    }

}

document.addEventListener('DOMContentLoaded', () => {
    new App();  // Инициализация приложения при загрузке страницы
});
