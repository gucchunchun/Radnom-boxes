//get random color: To coloring Boxes every time with different colors
enum ColorOption {
    Hue = 'hue',
    Saturation = 'saturation',
    Luminance = 'luminance'
}
type ColorRange = {
    min: number,
    max: number
}
type ColorOptions = {
    [ColorOption.Hue]: ColorRange;
    [ColorOption.Saturation]: ColorRange;
    [ColorOption.Luminance]: ColorRange;
}
type Color =  {
    [ColorOption.Hue]: number;
    [ColorOption.Saturation]: number;
    [ColorOption.Luminance]: number;
}
function getRandomHue(option: ColorOptions[ColorOption.Hue]): Color[ColorOption.Hue] {
    return Math.round(Math.random() * (option.max - option.min) + option.min);
}
function getRandomSaturation(option: ColorOptions[ColorOption.Saturation]): Color[ColorOption.Saturation] {
    return Math.round(Math.random() * (option.max - option.min) + option.min);
}
function getRandomLuminance(option: ColorOptions[ColorOption.Luminance]): Color[ColorOption.Luminance]{
    return Math.round(Math.random() * (option.max - option.min) + option.min);
}
function getRandomColor(option:ColorOptions): Color {
    const hue = getRandomHue(option[ColorOption.Hue]);
    const saturation = getRandomSaturation(option[ColorOption.Saturation]);
    const luminance = getRandomLuminance(option[ColorOption.Luminance]);
    return {
        [ColorOption.Hue]: hue,
        [ColorOption.Saturation]: saturation,
        [ColorOption.Luminance]: luminance,
    };
}

const defaultColorOptions:ColorOptions = {
    hue:{
        min: 0,
        max: 360
    },
    saturation: {
        min: 0,
        max: 100
    },
    luminance: {
        min: 0,
        max: 100
    }
}
type BoxPosition = {
    row: number,
    col: number
}
interface BoxFeature {
    position: BoxPosition
    sketch: HTMLElement
    width: number
    colorOptions:ColorOptions
    color: Color
    classList:string[]
}
class Box {
    public self: (HTMLElement|undefined) = undefined;

    constructor(
        public position: BoxPosition,
        private _sketch: HTMLElement,
        private _width: number = 100,
        private _colorOptions: ColorOptions = defaultColorOptions,
        private _color: Color = getRandomColor(_colorOptions),
        private _classList: string[] = []
    ) {}

    add(insertBeforeElement: (HTMLElement|undefined)=undefined): void {
        let self = document.createElement('div');
        //default className
        self.classList.add('sketch__box');
        //additional className for style changes
        for(const name of this._classList) {
            self.classList.add(name);
        }
        self.style.width = this._width + '%';
        self.style.backgroundColor = `hsl(${this._color.hue}, ${this._color.saturation}%,${this._color.luminance}%)`;
        self.addEventListener('mouseover', () =>{
            this.update({colorOptions: this._colorOptions});
        });
        if(insertBeforeElement) {
            this._sketch.insertBefore(self, insertBeforeElement);
        }else {
             this._sketch.appendChild(self);
        }
        this.self = self;
    }

    update(updateFeature:Partial<Omit<BoxFeature, 'id'|'sketch'>>) {
        let box = this.self
        if(!box) {
            throw new Error('Target box element can not be found')
        }
        if(updateFeature.width) {
            this._width = updateFeature.width;
            box.style.width = this._width + '%';
        }
        // color is more primary than getting random color with colorOptions
        if(updateFeature.color) {
            this._color = updateFeature.color;
            box.style.backgroundColor = `hsl(${this._color.hue}, ${this._color.saturation}%,${this._color.luminance}%)`;
            this._colorOptions = {
                hue: {
                    min: updateFeature.color.hue,
                    max: updateFeature.color.hue
                },
                saturation: {
                    min: updateFeature.color.saturation,
                    max: updateFeature.color.saturation
                },
                luminance: {
                    min: updateFeature.color.luminance,
                    max: updateFeature.color.luminance
                },
            }
        }else if(updateFeature.colorOptions) {
            this._colorOptions = updateFeature.colorOptions;
            this._color = getRandomColor(this._colorOptions);
            box.style.backgroundColor = `hsl(${this._color.hue}, ${this._color.saturation}%,${this._color.luminance}%)`;
        }   
        if(updateFeature.classList) {
            this._classList = updateFeature.classList;
            const boxClassList = box.classList;
    
            // Remove any class not present in the updated class list
            for (const name of boxClassList) {
                if (name !== 'sketch__box' && !this._classList.includes(name)) {
                    boxClassList.remove(name);
                }
            }
            
            // Add any new classes from the updated class list
            for (const newName of this._classList) {
                if (newName !== 'sketch__box' && !boxClassList.contains(newName)) {
                    boxClassList.add(newName);
                }
            }
        }
    }
}
enum ContainerType {
    Flex = 'sketch--flex',
    Grid = 'sketch--grid'
}

interface SketchFeature {
    sketch:HTMLElement
    type: ContainerType
    boxInRow: number
    colorOptions:ColorOptions
}
class Sketch {
    private _boxes:Box[][] = [];
    constructor(
        private _self: HTMLElement,
        private _type: ContainerType,
        private _boxInRow: number = 5,
        private _colorOptions: ColorOptions = defaultColorOptions
    ) {}

    getBoxNumber(): number {
        return this._boxInRow;
    }

    initBoxes() {
        let width = 100;
        if(this._type === ContainerType.Flex) {
            width = 100 / this._boxInRow;
        }else if(this._type === ContainerType.Grid) {
            this._self.style.gridTemplate = `repeat(${this._boxInRow}, 1fr) / repeat(${this._boxInRow}, 1fr)`;
        }
        for (let i = 0; i < this._boxInRow; i++) {
            this._boxes.push([]);
            for (let j = 0; j < this._boxInRow; j++) {
                const box = new Box({row: i, col:j},this._self, width, this._colorOptions);
                box.add();
                this._boxes[i].push(box);
            }
        }  
    }
    
    updateBoxes(updateFeature:Partial<Omit<BoxFeature, 'sketch'|'width'>>, ...positions:BoxPosition[]) {
        if(0 < positions.length) {
            for(let i = 0; i < positions.length; i++) {
                const row = positions[i].row;
                const col = positions[i].col;
                const targetBox = this._boxes[row][col];
                if(targetBox.position === positions[i]){
                    targetBox.update(updateFeature);
                }else {
                    throw new Error(`can not find Box with position:${positions[i]}`)
                }
            }
        }else {
            if(updateFeature.colorOptions) {
                this._colorOptions = updateFeature.colorOptions;
            }
            for(let i = 0; i < this._boxes.length; i++) {
                for(let j = 0; j < this._boxes[i].length; j++){
                    this._boxes[i][j].update(updateFeature);
                }
                
            }
        }
    }
    updateColorOptions(value: number, optionName:string, isMin: boolean=false) {
        let newColorOptions = this._colorOptions;
        // newColorOptions[optionName]
    }

    addRow(addingNumber: number) {
        if(addingNumber <= 0) {
            throw new Error('Adding number of box must be greater than zero');
        }
        const currentBoxInRow = this._boxInRow;
        this._boxInRow += addingNumber;
        let width = 100;
        if(this._type === ContainerType.Grid) {
            this._self.style.gridTemplate = `repeat(${this._boxInRow}, 1fr) / repeat(${this._boxInRow}, 1fr)`;
        }
        for(let i=0; i<this._boxInRow; i++) {
            //new column
            if(currentBoxInRow-1 < i) {
                this._boxes.push([]);
                for(let j = 0; j < this._boxInRow; j++) {
                    const box = new Box({row: i, col:j},this._self, width);
                    box.add();
                    this._boxes[i].push(box);
                }
            }
            //already exist column
            else {
                for(let j = 0; j < this._boxes[i].length; j++){
                    const box = this._boxes[i][j];
                    box.position.row += addingNumber;
                    if(this._type === ContainerType.Flex) {
                        width = 100 / this._boxInRow;
                        box.update({width: width});
                    }
                    if(j === 0) {
                        for(let k = 0; k < addingNumber; k++) {
                            const new_box = new Box({row: i, col:k},this._self, width);
                            new_box.add(box.self);
                            this._boxes[i].splice(k,0,new_box);
                        }
                    }
                }
            }
            
        }

    }

    delRow(deletingNumber: number) {
        if(deletingNumber <= 0) {
            throw new Error('Adding number of box must be greater than zero');
        }
        this._boxInRow -= deletingNumber;
        if(this._type === ContainerType.Grid) {
            this._self.style.gridTemplate = `repeat(${this._boxInRow}, 1fr) / repeat(${this._boxInRow}, 1fr)`;
        }
        let new_boxes: Box[][] = [];
        for(let i=0; i<this._boxes.length; i++) {
            if(i <= this._boxInRow-1) {
                new_boxes.push([]);
            }
            for(let j=0; j<this._boxes[i].length; j++) {
                const box = this._boxes[i][j];
                if(!box.self) {
                    throw new Error(`Box position row:${i}, column:${j} is not available`);
                }
                if(i <= this._boxInRow-1 && j <= this._boxInRow-1) {
                    if(this._type == ContainerType.Flex) {
                        box.update({width: 100 / this._boxInRow});
                    }
                    new_boxes[i].push(box);
                }else {
                    //remove from DOM
                    this._self.removeChild(box.self);
                }
            }
        }
        this._boxes = new_boxes;
    }
}

function setProgressBar(input: HTMLInputElement, progressBar: HTMLElement, isMin: boolean=false, isHue: boolean=false) {
    let marginPercent:number;
    let marginPercentOpposite:number;
    if(isMin){
        marginPercent = (isHue)
                            ? parseInt(input.value)/360*100
                            : parseInt(input.value);
        marginPercentOpposite = parseInt(progressBar.style.marginRight.split('%')[0]);
        progressBar.style.marginLeft = marginPercent + '%';
    } else {
        marginPercent = (isHue)
                            ? (360 - parseInt(input.value))/360*100
                            : 100 - parseInt(input.value);
        marginPercentOpposite = parseInt(progressBar.style.marginLeft.split('%')[0]);
        progressBar.style.marginRight = marginPercent + '%';
    }
    if(isNaN(marginPercentOpposite)) {
        marginPercentOpposite = 0;
    }
    progressBar.style.width = (100 - (marginPercent + marginPercentOpposite)) + '%';
}
function findOppositeInput(input: HTMLInputElement, isMin: boolean): HTMLInputElement {
    const className = isMin ? '.max' : '.min';
    const oppositeInput = input.parentElement?.querySelector(className) as HTMLInputElement;

    if (!oppositeInput) {
        throw new Error(`Cannot find corresponding ${isMin ? 'max' : 'min'} element`);
    }

    return oppositeInput;
}
function validateInputValue(input: HTMLInputElement, isMin: boolean=false, isHue: boolean=false): number {
    const oppositeInput = findOppositeInput(input, isMin);
    const newValue:number = parseInt(input.value);
    const maxValue:number = isHue? 360: 100;

    if(isMin) {
        return Math.max(0, Math.min(newValue, parseInt(oppositeInput.value)));
    }else {
        return Math.min(maxValue, Math.max(newValue, parseInt(oppositeInput.value)));
    }
}


const sketches = document.querySelectorAll('.sketch');
const addRowFlex = document.querySelector('#add-row--flex');
const delRowFlex = document.querySelector('#del-row--flex');
const addRowGrid = document.querySelector('#add-row--grid');
const delRowGrid = document.querySelector('#del-row--grid');
const rangeInputs = document.querySelectorAll('.color-option__range');
const colorOptionSetButton = document.querySelectorAll('.color-option__set');

const BOX_NUMBER_IN_ROW = 6;
let sketchFlex: Sketch;
let sketchGrid: Sketch;
const inputEvent = new Event('input');

window.addEventListener('load', () => {
    for(let i=0; i < sketches.length; i++) {
        const elem = sketches[i] as HTMLElement;
        let type:ContainerType;
        if(elem.classList.contains(ContainerType.Flex)) {
            type = ContainerType.Flex;
            const sketch = new Sketch(elem, type, BOX_NUMBER_IN_ROW);
            sketch.initBoxes();
            sketchFlex = sketch;
            addRowFlex?.addEventListener('click', () =>{
                sketch.addRow(1);
            });
            delRowFlex?.addEventListener('click', () =>{
                sketch.delRow(1);
            });
        } else if(elem.classList.contains(ContainerType.Grid)) {
            type = ContainerType.Grid;
            const sketch = new Sketch(elem, type, BOX_NUMBER_IN_ROW);
            sketch.initBoxes();
            sketchGrid = sketch;
            addRowGrid?.addEventListener('click', () =>{
                sketch.addRow(1);
            });
            delRowGrid?.addEventListener('click', () =>{
                sketch.delRow(1);
            });
        } else {
            throw new Error('not found container type class name');
        }
    }
});
rangeInputs?.forEach((elem)=> {
    const rangeInput = elem as HTMLInputElement;
    
    //(optionName)-(min/max)--range--(flex/grid)
    const idNames = rangeInput.id.split('-');
    const isMin = idNames[1] === 'min';
    const isHue = idNames[0] === 'hue';
    const searchClassName = (isMin)
                                ? '.color-option__num.min'
                                : '.color-option__num.max';
    const numInput = rangeInput.closest('.color-option--ctr')?.querySelector(searchClassName) as HTMLInputElement;    
    const progressBar = rangeInput.parentElement?.querySelector('.color-option__range__progress') as HTMLElement;
    if(!numInput) {
        throw new Error('can not find .num--min');
    }
    if(!progressBar) {
        throw new Error('can not find .color-option__range__progress');
    }
    rangeInput.addEventListener('input', () =>{
        rangeInput.value = validateInputValue(rangeInput, isMin, isHue).toString();
        numInput.value = rangeInput.value
        setProgressBar(numInput, progressBar, isMin, isHue);
        // if(isMin) {
        //     sketchFlex.updateBoxes({colorOptions:{hue: {min:validateInputValue(rangeInput, isMin, isHue) as hueRange['min'] ,max:sketchFlex.colorOptions.hue.max }, saturation: sketchFlex.colorOptions.saturation, luminance:sketchFlex.colorOptions.luminance}})
        // }else {
        //     sketchFlex.updateBoxes({colorOptions:{hue: {min: sketchFlex._colorOptions.hue.min, max:validateInputValue(rangeInput, isMin, isHue) as hueRange['min']}, saturation: sketchFlex.colorOptions.saturation, luminance:sketchFlex.colorOptions.luminance}})
        // }
    });
    numInput.addEventListener('change', () =>{
        numInput.value = validateInputValue(numInput, isMin, isHue).toString();
        rangeInput.value = numInput.value;
        setProgressBar(numInput, progressBar, isMin, isHue);
        // if(isMin) {
        //     sketchFlex.updateBoxes({colorOptions:{hue: {min:validateInputValue(numInput, isMin, isHue) as hueRange['min'] ,max:sketchFlex.colorOptions.hue.max }, saturation: sketchFlex.colorOptions.saturation, luminance:sketchFlex.colorOptions.luminance}})
        // }else {
        //     sketchFlex.updateBoxes({colorOptions:{hue: {min: sketchFlex._colorOptions.hue.min, max:validateInputValue(numInput, isMin, isHue) as hueRange['max']}, saturation: sketchFlex.colorOptions.saturation, luminance:sketchFlex.colorOptions.luminance}})
        // }
    });
});


// min + value % max loop