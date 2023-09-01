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
class Box {
    //add decorater
    private id:string
    private sketch:HTMLElement
    private width:number
    private color:HSLColor
    private colorOptions:ColorOptions
    private classList:string[] = [];
    private self:(HTMLElement|undefined);
    constructor(id:string, sketch: HTMLElement, width: number=100, colorOptions:ColorOptions=defaultColorOptions, classList:string[]=[]) {
        this.id = id;
        this.sketch = sketch;
        this.width = width;
        this.color = getRandomColor(colorOptions);
        this.colorOptions = colorOptions;
        this.classList = classList;
        this.self = undefined;
    }
    add() {
        let self = document.createElement('div');
        for(let name of this.classList) {
            self.classList.add(name);
        }
        self.style.width = this.width + '%';
        self.style.backgroundColor = `hsl(${this.color.hue}, ${this.color.saturation},${this.color.luminance})`;
        this.sketch.appendChild(self);
        this.self = self;
    }
}
enum ContainerType {
    Flex = 'sketch--flex',
    Grid = 'sketch--grid'
}
class Sketch {
    public boxNumber: number
    public boxes: Box[]
    public type: ContainerType
    private id:string
    private sketch: HTMLElement
    private colorOptions:ColorOptions
    
    constructor(id:string, sketch: HTMLElement, type: ContainerType, boxNum: number = 5, colorOptions:ColorOptions=defaultColorOptions) {
        this.id = id;
        this.sketch = sketch;
        this.type = type;
        this.boxNumber = boxNum;
        this.boxes = [];
        this.colorOptions = colorOptions;
    }

    initBoxes() {
        let width = 100;
        if(this.type === ContainerType.Flex) {
            width = 100 / this.boxNumber;
        }else if(this.type === ContainerType.Grid) {
            this.sketch.style.gridTemplate = `repeat(${this.boxNumber}, 1fr) / repeat(${this.boxNumber}, 1fr)`;
        }
        for (let i = 0; i < this.boxNumber ** 2; i++) {
            const box = new Box(`${this.id}-${i}`,this.sketch, width, this.colorOptions, ['sketch__box']);
            box.add();
        }  
    }
}

const sketches = document.querySelectorAll('.sketch');
const BOX_NUMBER_IN_ROW = 5;
window.addEventListener('load', () => {
    for(let i=0; i < sketches.length; i++) {
        const elem = sketches[i] as HTMLElement;
        console.log(elem);
        let type:ContainerType;
        if(elem.classList.contains(ContainerType.Flex)) {
            type = ContainerType.Flex;
        } else if(elem.classList.contains(ContainerType.Grid)) {
            type = ContainerType.Grid;
        } else {
            throw new Error('not found container type class name');
        }
        const sketch = new Sketch(`${type}-${i}`, elem, type, BOX_NUMBER_IN_ROW);
        sketch.initBoxes();
    }
});




// min + value % max loop