// fullscreen
const fullScreen = document.querySelector('.fullscreen');

fullScreen.addEventListener('click', () => {
    !document.fullscreenElement
        ? document.documentElement.requestFullscreen()
        : document.exitFullscreen()
});

// next image
const nextBtn = document.querySelector('.btn-next');
let image = document.querySelector('.image');
let result;

const timesOfDay = () => {
    let whatTime = new Date().getHours();
    if (whatTime >= 18 && whatTime < 24) {
        result = 'evening';
    }
    if (whatTime >= 12 && whatTime < 18) {
        result = 'day';
    }
    if (whatTime >= 6 && whatTime < 12) {
        result = 'morning';
    }
    if (whatTime >= 0 && whatTime < 6) {
        result = 'night';
    }
    return result;
}

let imageNumber = 1;
const imageSrc = image.src;
const currentImageNumber = () => {
    if (imageNumber < 20) {
        imageNumber++;
        return ('0' + imageNumber).slice(-2);
    } else {
        imageNumber = 1;
        return ('0' + imageNumber).slice(-2);
    }
}

nextBtn.addEventListener('click', () => {
    timesOfDay();
    if (imageSrc !== 'assets/img/img.jpg') {
        return image.src = `https://raw.githubusercontent.com/rolling-scopes-school/stage1-tasks/assets/images/${result}/${currentImageNumber()}.jpg`;
    }
});

// save image
const saveBtn = document.querySelector('.btn-save');
saveBtn.addEventListener('click', (Event) => {
    document.getElementById('save')
        .setAttribute("href",`${image.src}`);
    document.getElementById('save').click();
})

