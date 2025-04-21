export const Notifications = {
    show(type, message) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },
    showSuccess(msg) { this.show('success', msg); },
    showError(msg) { this.show('error', msg); }
};
