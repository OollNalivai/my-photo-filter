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
let imageSrc = image.src;

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

saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = imageSrc;

    const newFileName = `${image.src
        .replace(/^.*[\\\/]/, '')
        .replace('.', '_NEW.')}`;

    link.setAttribute('download', newFileName);
    link.click();
});

// load image
const loadInput = document.querySelector('.btn-load--input');
const fileReader = new FileReader();

loadInput.addEventListener('change', () => {
    let file = loadInput.files[0];
    fileReader.readAsDataURL(file)
    fileReader.onload = () => {
        image.setAttribute('src', `${fileReader.result}`)
    }
})

// reset filter image
const resetBtn = document.querySelector('.btn-reset');
resetBtn.addEventListener('click', (event) => {

})
