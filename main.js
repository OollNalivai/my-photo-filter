'use strict';
// global variables
let btnContainer = document.querySelector(".btn-container");
let buttons = [...btnContainer.querySelectorAll(".btn")];

const image = document.querySelector('.image');
const canvas = document.querySelector('.canvasImage');

const filtersState = {
    saturate: '100%',
};
const defaultFiltersState = Object.freeze({...filtersState});

const resultsOutputs = document.getElementsByName('result');
const root = document.documentElement;
let loadImageName;

const rootValues =
    [
        // [name, rootName, unit, defaultValue]
        ['blur', '--blur', 'px', 0],
        ['invert', '--invert', '%', 0],
        ['sepia', '--sepia', '%', 0],
        ['saturate', '--saturate', '%', 100],
        ['hue', '--hue', 'deg', 0],
    ];

const getCurrentImageSrc = () => image.getAttribute('src');
// btn active style
buttons.forEach(el => {
    el.addEventListener("click", () => {
        const [current] = document.getElementsByClassName("btn-active");

        current.classList.toggle('btn-active', false)
        el.className += " btn-active";
    });
});
// fullscreen
const fullScreen = document.querySelector('.fullscreen');

fullScreen.addEventListener('click', () => {
    !document.fullscreenElement
        ? document.documentElement.requestFullscreen()
        : document.exitFullscreen()
});
// next image
const timesOfDay = () => {

    const currentHours = new Date().getHours();
    const timeMap = [
        [0, 6, 'night'],
        [6, 12, 'morning'],
        [12, 18, 'day'],
        [18, 24, 'evening'],
    ];

    for (const [start, end, result] of timeMap) {
        if (currentHours >= start && currentHours < end) {
            return result;
        }
    }
};

let currentImageNumber = 0;
const totalImagesInPeriod = 20;
const getCurrentImageNumber = () => {
    currentImageNumber = currentImageNumber !== totalImagesInPeriod ? currentImageNumber + 1 : 1;

    return `0${currentImageNumber}`.slice(-2);
};

document.querySelector('.btn-next')
    .addEventListener('click', () => {

        image.setAttribute('src',
            `https://raw.githubusercontent.com/rolling-scopes-school/stage1-tasks/assets/images/${timesOfDay()}/${getCurrentImageNumber()}.jpg`);

        if (getCurrentImageSrc() !== 'assets/img/img.jpg') {
            image.setAttribute('crossorigin', 'anonymous');
        }
    });
// save image
const ctx = canvas.getContext('2d');
const link = document.createElement('a');

const canvasFilter = () => {
    let filters = '';
    const filterParams = Object.entries(filtersState);

    filterParams.forEach(([key, value], index) => {
        filters += `${key}(${value}) `;

        if (index === filterParams.length - 1) {
            filters = filters.trim();
        }
    });
    return filters;
}

const isBase64 = (str) => /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
    .test(str.replace(/.*,/, ''));

const getImageName = () => {
    const imageSrc = getCurrentImageSrc();

    const preResult = isBase64(imageSrc)
        ? loadImageName
        : `${imageSrc.replace(/^.*[\\\/]/, '')}`;

    return preResult.replace('.', '_NEW.');
}

document.querySelector('.btn-save')
    .addEventListener('click', () => {

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        ctx.filter = canvasFilter();
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        link.href = canvas
            .toDataURL('image/jpeg')
            .replace("image/png", "image/octet-stream");

        link.setAttribute('download', getImageName());
        link.click();
    });
// load image
const loadInput = document.querySelector('.btn-load--input');
const fileReader = new FileReader();

fileReader.addEventListener('load', () => {
    image.setAttribute('src', `${fileReader.result}`);
});

loadInput.addEventListener('change', (event) => {

    const target = event.target;
    const [file] = target.files;

    loadImageName = file.name;
    fileReader.readAsDataURL(file);
    target.value = '';
})

// filters
rootValues.forEach(([name, rootName, unit], index) => {
    const [element] = document.getElementsByName(name);

    element.addEventListener('input', (event) => {
        resultsOutputs[index].value = event.target.value;

        root.style.setProperty(`${rootName}`,
            `${resultsOutputs[index].value}${unit}`);
    });

    element.addEventListener('change', (event) => {
        const currentKey = name === 'hue' ? 'hue-rotate' : name;

        filtersState[currentKey] = `${event.target.value}${unit}`;
    });
});
// reset filter image
document.querySelector('.btn-reset').addEventListener('click', () => {

    rootValues.forEach(([name, rootName,
                            unit, defaultValue], index) => {
        const [element] = document.getElementsByName(name);

        root.style.setProperty(`${rootName}`,
            `${defaultValue}${unit}`);

        resultsOutputs[index].value = defaultValue;
        element.value = defaultValue;
    });
    // reset filterState
    Object.keys(filtersState).forEach(key => {
        if (!defaultFiltersState[key]) {
            delete filtersState[key]
        } else {
            filtersState[key] = defaultFiltersState[key];
        }
    });
})
