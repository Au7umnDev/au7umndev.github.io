class ModalsManager {
    init() {
        Array.from(document.querySelectorAll('[data-function="open-modal"]')).forEach((button) => {
            button.addEventListener('click', this.__openModalHandler);
        });
    
        //кнопки закрытия модалок
        Array.from(document.querySelectorAll('[data-function="close-modal"]')).forEach((button) => {
            button.addEventListener('click', this.__closeModalButtonHandler);
        });
    
        //закрытие модалок на нажатие вне ее
        Array.from(document.querySelectorAll('.modal .overlay')).forEach((modalOverlay) => {
            modalOverlay.addEventListener('click', this.__closeModalOverlayHandler);
        });
    
        //настройка какие выше модалки
        Array.from(document.querySelectorAll('.modal')).forEach((modal) => {
            modal.style.zIndex = modal.dataset.zIndex;
        })
    }


    __openModalHandler(event) {
        console.log(1);
        const modalName = event.target.getAttribute('data-modal-name');
        const modal = document.querySelector(`.modal[data-name="${modalName}"]`);
        modal.classList.replace('closed', 'opened');
        console.log(event.target, modal);
    }

    __closeModalButtonHandler(event) {
        const modalName = event.target.getAttribute('data-modal-name');
        const modal = document.querySelector(`.modal[data-name="${modalName}"]`);
        modal.classList.replace('opened', 'closed');
    }

    __closeModalOverlayHandler(event) {
        event.target.parentElement.classList.replace('opened', 'closed');
    }
}


const modalsManager = new ModalsManager();
modalsManager.init();