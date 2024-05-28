const initModals = () => {
    //кнопки открытия модалок
    Array.from(document.querySelectorAll('[data-function="open-modal"]')).forEach((button) => {
    button.onclick = () => {
        const modalName = button.getAttribute('data-modal-name');
        const modal = document.querySelector(`.modal[data-name="${modalName}"]`);
        modal.classList.replace('closed', 'opened');
        }
    })

    //кнопки закрытия модалок
    Array.from(document.querySelectorAll('[data-function="close-modal"]')).forEach((button) => {
        button.onclick = () => {
            const modalName = button.getAttribute('data-modal-name');
            const modal = document.querySelector(`.modal[data-name="${modalName}"]`);
            modal.classList.replace('opened', 'closed');
        }
    })

    //закрытие модалок на нажатие вне ее
    Array.from(document.querySelectorAll('.modal .overlay')).forEach((modalOverlay) => {
        modalOverlay.onclick = (event) => {
            event.target.parentElement.classList.replace('opened', 'closed');
        }
    })

    //настройка какие выше модалки
    Array.from(document.querySelectorAll('.modal')).forEach((modal) => {
        modal.style.zIndex = modal.dataset.zIndex;
    })
}

initModals();