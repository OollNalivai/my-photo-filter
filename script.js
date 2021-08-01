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
const filtersStore = {
    saturate: '100%',
};
const canvas = document.querySelector('.canvasImage');
const ctx = canvas.getContext('2d');
const link = document.createElement('a');


saveBtn.addEventListener('click', () => {
    let filters = '';
    const filterParams = Object.entries(filtersStore);
    const newFileName = `${image.src
        .replace(/^.*[\\\/]/, '')
        .replace('.', '_NEW.')}`;

    filterParams.forEach(([key, value], index) => {
        filters += `${key}(${value}) `;

        if (index === filterParams.length - 1) {
            filters = filters.trim();
        }
    });

    ctx.filter = filters;
    ctx.drawImage(image,0,0, canvas.width, canvas.height);

    this.src = canvas.toDataURL('image/jpeg')
        .replace("image/png", "image/octet-stream");
    link.href = this.src;

    link.setAttribute('download', newFileName);
    link.click();
});


// load image

const loadInput = document.querySelector('.btn-load--input');
const fileReader = new FileReader();

loadInput.addEventListener('change', (event) => {
    fileReader.readAsDataURL(event.target.files[0]);

    loadInput.value = '';
    fileReader.onload = () => {
        image.setAttribute('src', `${fileReader.result}`)
    }
})


// filters

const resultsOutputs = document.getElementsByName('result');
const root = document.documentElement;
const valueRoots =
    [
        [0, 'blur', '--blur', 'px', 0],
        [1, 'invert', '--invert', '%', 0],
        [2, 'sepia', '--sepia', '%', 0],
        [3, 'saturate', '--saturate', '%', 100],
        [4, 'hue', '--hue', 'deg', 0],
    ];

const addEventRange = ([indexRange, name, rootName, unit]) => {
    const [element] = document.getElementsByName(name);

    element.addEventListener('input', (event) => {

        resultsOutputs[indexRange].value = event.target.value;

        root.style.setProperty(`${rootName}`,
            `${resultsOutputs[indexRange].value}${unit}`);
    });

    element.addEventListener('change', (event) => {
        const currentKey = name === 'hue' ? 'hue-rotate' : name;

        filtersStore[currentKey] = `${event.target.value}${unit}`;
    });
};

valueRoots.forEach((el) => addEventRange(el));


// reset filter image

const resetBtn = document.querySelector('.btn-reset');

resetBtn.addEventListener('click', () => {
    const resetEventRange = ([indexRange, name, rootName, unit, defaultValue]) => {

        root.style.setProperty(`${rootName}`,
            `${defaultValue}${unit}`);

        resultsOutputs[indexRange].value = defaultValue;
        document.getElementsByName(name)[0].value = defaultValue;
    }
    valueRoots.forEach((el) => resetEventRange(el));
})
