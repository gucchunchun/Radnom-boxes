// NumericRange Utility
type CreateArrayWithLengthX<
	LENGTH extends number,
	ACC extends unknown[] = [],
> = ACC['length'] extends LENGTH
	? ACC
	: CreateArrayWithLengthX<LENGTH, [...ACC, 1]>

// To define color saturation and luminance range
type NumericRange<
   START_ARR extends number[], 
   END extends number, 
   ACC extends number = never
> = START_ARR['length'] extends END 
   ? ACC | END
   : NumericRange<[...START_ARR,1], END, ACC | START_ARR['length']>
	

//get random color: To coloring Boxes every time with different colors
type hueRange = {
    min: NumericRange<CreateArrayWithLengthX<0>, 360>,
    max: NumericRange<CreateArrayWithLengthX<0>, 360>,
}
type colorRange = {
    min: NumericRange<CreateArrayWithLengthX<0>, 100>,
    max: NumericRange<CreateArrayWithLengthX<0>, 100>,
}
type ColorOptions = {
    hue: hueRange,
    saturation: colorRange,
    luminance: colorRange
}
type HSLColor =  {
    hue:  NumericRange<CreateArrayWithLengthX<0>, 360>,
    saturation:  NumericRange<CreateArrayWithLengthX<0>, 100>,
    luminance:  NumericRange<CreateArrayWithLengthX<0>, 100>,
}
function getRandomHue(option: ColorOptions['hue']): HSLColor['hue'] {
    return Math.round(Math.random() * (option.max - option.min) + option.min) as HSLColor['hue'];
}
function getRandomSaturation(option:ColorOptions['saturation']): HSLColor['saturation'] {
    return Math.round(Math.random() * (option.max - option.min) + option.min) as HSLColor['saturation'];
}
function getRandomLuminance(option:ColorOptions['luminance']): HSLColor['luminance']{
    return Math.round(Math.random() * (option.max - option.min) + option.min) as HSLColor['luminance'];
}
function getRandomColor(option:ColorOptions): HSLColor {
    const hue = getRandomHue(option['hue']);
    const saturation = getRandomSaturation(option['saturation']);
    const luminance = getRandomLuminance(option['luminance']);
    return {hue: hue, saturation:saturation, luminance:luminance}
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
    color: HSLColor
    classList:string[]
}
class Box {
    public self: (HTMLElement|undefined) = undefined;

    constructor(
        public position: BoxPosition,
        private _sketch: HTMLElement,
        private _width: number = 100,
        private _colorOptions: ColorOptions = defaultColorOptions,
        private _color: HSLColor = getRandomColor(_colorOptions),
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
    
    updateBoxes(updateFeature:Partial<Omit<BoxFeature, 'id'|'sketch'|'width'>>, ...positions:BoxPosition[]) {
        if(positions) {
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
            for(let i = 0; i < this._boxes.length; i++) {
                for(let j = 0; j < this._boxes[i].length; j++){
                    this._boxes[i][j].update(updateFeature);
                }
                
            }
        }
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

function setColorOption() {
    //get value from input
    //set value depends on id name color-segment/container-type
}


const sketches = document.querySelectorAll('.sketch');
const addRowFlex = document.querySelector('#add-row--flex');
const delRowFlex = document.querySelector('#del-row--flex');
const addRowGrid = document.querySelector('#add-row--grid');
const delRowGrid = document.querySelector('#del-row--grid');
const rangeMin = document.querySelectorAll('.range--min');
const rangeMax = document.querySelectorAll('.range--max');

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
rangeMin?.forEach((elem)=> {
    const rangeInput = elem as HTMLInputElement;
    const numMin = rangeInput.closest('.color-option--ctr')?.querySelector('.num--min') as HTMLInputElement;    
    const progress = rangeInput.parentElement?.querySelector('.color-option__range__progress') as HTMLElement;
    if(!numMin) {
        throw new Error('can not find .num--min');
    }
    if(!progress) {
        throw new Error('can not find .color-option__range__progress');
    }
    rangeInput.addEventListener('input', () =>{
        numMin.value = rangeInput.value;
        let percent = parseInt(numMin.value);
        if(numMin.id.split('-')[0] === 'hue'){
            percent = percent / 360 * 100;
        }
        progress.style.marginLeft = percent + '%';
        let marginRight = parseInt(progress.style.marginRight.split('%')[0]);
        if(isNaN(marginRight)) {
            marginRight = 0
        }
        progress.style.width = (100 - marginRight - percent) + '%';
    });
    numMin.addEventListener('change', () =>{
        rangeInput.value = numMin.value;
        rangeInput.dispatchEvent(inputEvent);
    });
});
rangeMax?.forEach((elem)=> {
    const rangeInput = elem as HTMLInputElement;
    const numMax = rangeInput.closest('.color-option--ctr')?.querySelector('.num--max') as HTMLInputElement;    
    const progress = rangeInput.parentElement?.querySelector('.color-option__range__progress') as HTMLElement;
    if(!numMax) {
        throw new Error('can not find .num--max');
    }
    if(!progress) {
        throw new Error('can not find .color-option__range__progress');
    }
    rangeInput.addEventListener('input', () =>{
        numMax.value = rangeInput.value;
        let percent = 360 - parseInt(numMax.value);
        if(numMax.id.split('-')[0] === 'hue'){
            percent = percent / 360 * 100;
        }
        progress.style.marginRight = percent + '%';
        let marginLeft = parseInt(progress.style.marginLeft.split('%')[0]);
        if(isNaN(marginLeft)) {
            marginLeft = 0
        }
        progress.style.width = (100 - marginLeft - percent) + '%';
    });
    numMax.addEventListener('change', () =>{
        rangeInput.value = numMax.value;
        rangeInput.dispatchEvent(inputEvent);
    });
});



// min + value % max loop