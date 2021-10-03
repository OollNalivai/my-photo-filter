import './main.css';
import {IFilterState} from './models';

class PhotoFilter {
    readonly #totalImagesInPeriod: Readonly<number> = 20;
    readonly #fileReader: FileReader;
    readonly #state: State;

    #defaultCurrentImageNumber: number = 0;
    #loadImageName: string | undefined;

    constructor() {
        this.#state = new State();
        this.#fileReader = new FileReader();
    }

    static get #imageElement(): HTMLImageElement | null {
        return document.querySelector('.image');
    }

    static get #resultsOutputs(): HTMLOutputElement[] {
        return Array.from(document
            .getElementsByName('result')) as HTMLOutputElement[];
    }

    static get #root(): HTMLElement {
        return document.documentElement as HTMLElement;
    }

    get currentImageSrc(): string | null {
        return PhotoFilter.#imageElement!.getAttribute('src');
    }

    init(): void {
        // fullscreen
        this.#fullScreenListener();
        // btn active style
        this.#btnActiveStyleListener();
        // next image
        this.#btnNextImageListener();
        // save image
        this.#saveImageListener();
        // load image
        this.#loadImageListener();
        // filters
        this.#changeFiltersListener();
        // reset filter image
        this.#resetFilterImageListener();
    }

    //get day of the week
    static #getTimeOfDay(): string | undefined {
        const currentHours: number = new Date().getHours();
        const timeMap: [number, number, string][] = [
            [0, 6, 'night'],
            [6, 12, 'morning'],
            [12, 18, 'day'],
            [18, 24, 'evening'],
        ];

        let preResult;

        for (const [start, end, result] of timeMap) {
            if (currentHours >= start && currentHours < end) {
                preResult = result;
            }
        }

        return preResult;
    };

    // fullscreen
    #fullScreenListener(): void {
        const fullScreenBtn: Element | null = document.querySelector('.fullscreen');

        if (fullScreenBtn) {
            fullScreenBtn.addEventListener('click', () => {
                !document.fullscreenElement
                    ? document.documentElement.requestFullscreen()
                    : document.exitFullscreen();
            });
        }
    }

    // btn active style
    #btnActiveStyleListener(): void {
        const buttons: Element | null = document.querySelector('.btn-container');

        if (buttons) {
            Array.from(buttons.querySelectorAll('.btn'))
                .forEach((btnElement: Element, index: number, currentArr: Element[]) => {
                    btnElement.addEventListener('click', (event: Event) => {

                        const target = event.target as HTMLButtonElement;
                        currentArr.forEach((element: Element) => element.classList.toggle('btn-active', false));
                        target.classList.toggle('btn-active', true);
                    });
                });
        }
    }

    // next image
    #btnNextImageListener(): void {
        const buttonNext: Element | null = document.querySelector('.btn-next');

        if (buttonNext) {
            buttonNext.addEventListener('click', () => {

                if (PhotoFilter.#imageElement) {
                    PhotoFilter.#imageElement.setAttribute('src',
                        `https://raw.githubusercontent.com/rolling-scopes-school/stage1-tasks/assets/images/${PhotoFilter.#getTimeOfDay()}/${this.#currentImageNumber()}.jpg`);

                    if (this.currentImageSrc !== 'assets/img/img.jpg') {
                        PhotoFilter.#imageElement.setAttribute('crossorigin', 'anonymous');
                    }
                }
            });
        }
    }

    #currentImageNumber(): string {
        this.#defaultCurrentImageNumber =
            this.#defaultCurrentImageNumber !== this.#totalImagesInPeriod ? this.#defaultCurrentImageNumber + 1 : 1;

        return `0${this.#defaultCurrentImageNumber}`.slice(-2);
    }

    // save image
    #saveImageListener(): void {
        const canvas = document.querySelector('.canvasImage') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        const buttonSave: Element | null = document.querySelector('.btn-save');

        const link = document.createElement('a');

        if (buttonSave) {
            buttonSave.addEventListener('click', () => {

                canvas.width = PhotoFilter.#imageElement!.naturalWidth;
                canvas.height = PhotoFilter.#imageElement!.naturalHeight;

                if (ctx) {
                    ctx.filter = this.#state.forCanvasFilter();
                    ctx.drawImage(PhotoFilter.#imageElement!, 0, 0, canvas.width, canvas.height)
                }

                link.href = canvas
                    .toDataURL('image/jpeg')
                    .replace('image/png', 'image/octet-stream');

                link.setAttribute('download', this.#getImageName());
                link.click();
            });
        }
    }

    #getImageName(): string {
        const regExp: RegExp = new RegExp(/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/);
        const preResult: string | undefined = regExp.test(this.currentImageSrc!.replace(/.*,/, ''))
            ? this.#loadImageName
            : `${this.currentImageSrc?.replace(/^.*[\\\/]/, '')}`;

        return preResult?.replace('.', '_NEW.') as string;
    }

    // filters
    #changeFiltersListener(): void {
        this.#state.stateValues.forEach(([name, rootName, unit, _]: [string, string, string, number], index: number) => {
            const [element] = Array.from(document.getElementsByName(name)) as Array<HTMLElement>;

            element.addEventListener('input', (event: Event) => {
                const target = event.target as HTMLInputElement;

                PhotoFilter.#resultsOutputs[index].value = target.value;

                PhotoFilter.#root.style.setProperty(`${rootName}`,
                    `${PhotoFilter.#resultsOutputs[index].value}${unit}`);
            });

            element.addEventListener('change', (event: Event) => {
                const target = event.target as HTMLInputElement;

                const currentKey: string = name === 'hue' ? 'hue-rotate' : name;
                this.#state.updateState(currentKey as keyof IFilterState, `${target.value}${unit}`);
            });
        });
    }

    // load image
    #loadImageListener(): void {
        const loadInput: Element | null = document.querySelector('.btn-load--input');

        this.#fileReader.addEventListener('load', () => {
            PhotoFilter.#imageElement?.setAttribute('src', `${this.#fileReader.result}`);
        });

        if (loadInput) {
            loadInput.addEventListener('change', (event) => {

                const target: any = event.target;
                const [file] = target.files;
                this.#loadImageName = file.name;

                this.#fileReader.readAsDataURL(file);
                target.value = '';
            });
        }
    }

    // reset filter image
    #resetFilterImageListener(): void {
        const buttonReset = document.querySelector('.btn-reset');

        if (buttonReset) {
            buttonReset.addEventListener('click', () => {

                this.#state.stateValues.forEach(([name, rootName,
                                                     unit, defaultValue], index) => {
                    const [element] = Array.from(document.getElementsByName(name)) as Array<HTMLInputElement>;

                    PhotoFilter.#root.style.setProperty(`${rootName}`,
                        `${defaultValue}${unit}`);

                    PhotoFilter.#resultsOutputs[index].value = `${defaultValue}`;
                    element.value = `${defaultValue}`;
                });

                this.#state.resetFilterState();
            });
        }
    }
}

// filters State
class State {
    readonly #defaultState: Partial<IFilterState>;
    readonly #state: Partial<IFilterState>;

    constructor() {
        this.#defaultState = {
            saturate: '100%',
        };

        this.#state = {
            ...this.#defaultState,
        };
    }

    get state(): Partial<IFilterState> {
        return this.#state || {} as Partial<IFilterState>;
    }

    get stateValues(): Array<[string, string, string, number]> {
        return ([
            ['blur', '--blur', 'px', 0],
            ['invert', '--invert', '%', 0],
            ['sepia', '--sepia', '%', 0],
            ['saturate', '--saturate', '%', 100],
            ['hue', '--hue', 'deg', 0],
        ]);
    }

    forCanvasFilter(): string {
        const filterParams: [string, string][] = Object.entries(this.#state);
        let filters: string = '';

        filterParams.forEach(([key, value], index) => {
            filters += `${key}(${value}) `;

            if (index === filterParams.length - 1) {
                filters = filters.trim();
            }
        });

        return filters;
    }

    updateState(key: keyof IFilterState, value: string): void {
        this.#state[key] = value;
    }

    resetFilterState(): void {

        (Object.keys(this.state) as Array<keyof IFilterState>)
            .forEach((key: keyof IFilterState): void => {

                if (!this.#defaultState[key]) {
                    delete this.#state[key];
                } else {
                    this.#state[key] = this.#defaultState[key];
                }
            });
    }
}

new PhotoFilter().init();
