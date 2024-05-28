const initCardsEvents = () => {
    Array.from(document.getElementsByClassName('ring-card')).forEach((ringCardElement) => {
        const modalName = ringCardElement.dataset.modalName;
        const modalContent = document.querySelector(`.modal[data-name="${modalName}"] .content`);
        console.log(modalContent)
        const ringId = parseInt(ringCardElement.getAttribute('data-ring-id'));
        ringCardElement.onclick = () => {
            const html = getRingModalHtml(modalName, ringId);
            modalContent.innerHTML = html;
            modalsManager.init();
        }
    })
}
initCardsEvents();

const getRingModalHtml = (modalName, ringId) => {
    const ringData = ringsRepository[ringId];
    return `<div class="ring-modal">
        <div class="picture">
            <img src="${ringData.imageSrc}"></img>
        </div>
        <div class="title">
            ${ringData.name}
        </div>
        <div class="description">
            ${ringData.decscription}
        </div>
        <div data-function="open-modal" data-modal-name="try-on-modal" onclick="${enableWebcam()}">Try-on</div>
        <div data-function="close-modal" data-modal-name="${modalName}">Закрыть</div>
    </div>`
}

const ringsRepository = {
    1: {
        name: 'ring_black_and_red 1',
        imageSrc: 'google.com',
        modelPath: 'app/models/ring_black_and_red.glb',
        decscription: 'asdasd'
    },
    2: {
        name: 'simple_ring 2',
        imageSrc: 'google.com',
        modelSrc: 'app/models/simple_ring.glb',
        decscription: 'asdasd'
    },
    3: {
        name: 'asdasd 3',
        imageSrc: 'google.com',
        modelSrc: '',
        decscription: 'asdasd'
    },
}