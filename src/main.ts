import './main.css';
import {IFilterState} from './models';

class PhotoFilter {
    readonly #regExp: RegExp = new RegExp(/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/);
    #currentImageNumber: number = 0;
    readonly #totalImagesInPeriod: Readonly<number> = 20;
    #loadImageName: any;

    #state: State;
    #stateValues =
        ([
            ['blur', '--blur', 'px', 0],
            ['invert', '--invert', '%', 0],
            ['sepia', '--sepia', '%', 0],
            ['saturate', '--saturate', '%', 100],
            ['hue', '--hue', 'deg', 0],
        ] as Array<[string, string, string, number]>);

    readonly #fileReader: FileReader = new FileReader();

    constructor() {
        this.#state = new State();
    }

    get image(): HTMLImageElement | null {
        return document.querySelector('.image');
    }

    get currentImageSrc(): string | null {
        return this.image!.getAttribute('src');
    }

    static get #resultsOutputs(): HTMLOutputElement[] {
        return Array.from(document
            .getElementsByName('result')) as HTMLOutputElement[];
    }

    static get #root(): HTMLElement {
        return document.documentElement as HTMLElement;
    }

    init(): void {
        // fullscreen
        this.#fullScreenListener();
        // btn active style
        this.#btnActiveStyle();
        // next image
        this.#btnNextImage();
        // save image
        this.#getSaveImage();
        // load image
        this.#loadImage();
        // filters
        this.#changeFiltersListener();
        // reset filter image
        this.#resetFilterImage();
    }

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
    #btnActiveStyle(): void {
        const buttons: Element | null = document.querySelector('.btn-container');

        if (buttons) {
            Array.from(buttons.querySelectorAll('.btn'))
                .forEach((btnElement: Element, index: number, currentArr: Element[]) => {
                    btnElement.addEventListener('click', (event: Event) => {

                        currentArr.forEach((element: Element) => element.classList.toggle('btn-active', false));

                        const target = event.target as HTMLButtonElement;
                        target.classList.toggle('btn-active', true);
                    });
                });
        }
    }

    // next image
    #btnNextImage(): void {
        document.querySelector('.btn-next')
            ?.addEventListener('click', () => {

                this.image?.setAttribute('src',
                    `https://raw.githubusercontent.com/rolling-scopes-school/stage1-tasks/assets/images/${PhotoFilter.#timesOfDay()}/${this.#getCurrentImageNumber()}.jpg`);

                if (this.currentImageSrc !== 'assets/img/img.jpg') {
                    this.image?.setAttribute('crossorigin', 'anonymous');
                }
            });
    }

    static #timesOfDay(): string | undefined {
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

        return preResult as string;
    };

    #getCurrentImageNumber(): string {
        this.#currentImageNumber =
            this.#currentImageNumber !== this.#totalImagesInPeriod ? this.#currentImageNumber + 1 : 1;

        return `0${this.#currentImageNumber}`.slice(-2) as string;
    }

    // save image
    #getSaveImage(): void {
        const canvas = <HTMLCanvasElement>document.querySelector('.canvasImage');
        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
        const link:  HTMLAnchorElement | undefined = document.createElement('a');

        document.querySelector('.btn-save')
            ?.addEventListener('click', () => {

                canvas.width = this.image!.naturalWidth;
                canvas.height = this.image!.naturalHeight;

                ctx ? ctx.filter = this.#state.forCanvasFilter : null;
                ctx ? ctx.drawImage(this.image!, 0, 0, canvas.width, canvas.height): null;

                link.href = canvas
                    .toDataURL('image/jpeg')
                    .replace('image/png', 'image/octet-stream');

                link.setAttribute('download', this.#getImageName());
                link.click();
            });
    }

    #getImageName(): string {
        const preResult: string = this.#regExp.test(this.currentImageSrc!.replace(/.*,/, ''))
            ? this.#loadImageName
            : `${this.currentImageSrc?.replace(/^.*[\\\/]/, '')}`;

        return preResult.replace('.', '_NEW.') as string;
    }

    // filters
    #changeFiltersListener(): void {
        this.#stateValues.forEach(([name, rootName, unit, _]: [string, string, string, number], index: number) => {
            const [element]: Array<HTMLElement> = Array.from(document.getElementsByName(name));

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
    #loadImage(): void {
        const loadInput: Element | null = document.querySelector('.btn-load--input');

        this.#fileReader.addEventListener('load', () => {
            this.image?.setAttribute('src', `${this.#fileReader.result}`);
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
    #resetFilterImage(): void {
        document.querySelector('.btn-reset')
            ?.addEventListener('click', () => {

                this.#stateValues.forEach(([name, rootName,
                                               unit, defaultValue], index) => {
                    const [element]: any = document.getElementsByName(name);

                    PhotoFilter.#root.style.setProperty(`${rootName}`,
                        `${defaultValue}${unit}`);

                    PhotoFilter.#resultsOutputs[index].value = `${defaultValue}`;
                    element.value = defaultValue;
                });

                this.#state.resetFilterState();
            });
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

    get forCanvasFilter(): string {
        const filterParams: [string, string][] = Object.entries(this.#state);
        let filters: string = '';

        filterParams.forEach(([key, value], index) => {
            filters += `${key}(${value}) `;

            if (index === filterParams.length - 1) {
                filters = filters.trim();
            }
        });

        return filters as string;
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
