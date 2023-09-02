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
        min: 160,
        max: 220
    },
    saturation: {
        min: 30,
        max: 90
    },
    luminance: {
        min: 30,
        max: 80
    }
}
interface BoxFeature {
    id: string
    sketch: HTMLElement
    width: number
    colorOptions:ColorOptions
    color: HSLColor
    classList:string[]
}
class Box {
    private _self: HTMLElement | undefined;

    constructor(
        public id: string,
        private _sketch: HTMLElement,
        private _width: number = 100,
        private _colorOptions: ColorOptions = defaultColorOptions,
        private _color: HSLColor = getRandomColor(_colorOptions),
        private _classList: string[] = []
    ) {
        this._self = undefined;
    }

    add() {
        let self = document.createElement('div');
        //default className
        self.classList.add('sketch__box');
        //additional className for style changes
        for(let name of this._classList) {
            self.classList.add(name);
        }
        self.style.width = this._width + '%';
        self.style.backgroundColor = `hsl(${this._color.hue}, ${this._color.saturation}%,${this._color.luminance}%)`;
        self.addEventListener('click', () =>{
            this.update({color: {hue: 10, saturation: 50, luminance: 70}});
        });
        this._sketch.appendChild(self);
        this._self = self;
    }

    update(updateFeature:Partial<Omit<BoxFeature, 'id'|'sketch'>>) {
        let box = this._self
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
        }   
        if(updateFeature.classList) {
            this._classList = updateFeature.classList;
            for(let name of box.classList) {
                if(name === 'sketch__box') {
                    return
                }else if(updateFeature.classList.includes(name)){
                    const index = updateFeature.classList.indexOf(name);
                    updateFeature.classList.splice(index,1);
                    return
                }else {
                    box.classList.remove(name);
                }
            }
            for(let newName of updateFeature.classList) {
                box.classList.add(newName);
            }
        }
        
    }
}
enum ContainerType {
    Flex = 'sketch--flex',
    Grid = 'sketch--grid'
}
interface SketchFeature {
    id:string
    sketch:HTMLElement
    type: ContainerType
    boxNumber: number
    colorOptions:ColorOptions
}
class Sketch {
    private _boxes:Box[];
    constructor(
        private _id: string,
        private _self: HTMLElement,
        private _type: ContainerType,
        private _boxNumber: number = 5,
        private _colorOptions: ColorOptions = defaultColorOptions
    ) {
        this._boxes = [];
    }

    getBoxNumber(): number {
        return this._boxNumber;
    }

    initBoxes() {
        let width = 100;
        if(this._type === ContainerType.Flex) {
            width = 100 / this._boxNumber;
        }else if(this._type === ContainerType.Grid) {
            this._self.style.gridTemplate = `repeat(${this._boxNumber}, 1fr) / repeat(${this._boxNumber}, 1fr)`;
        }
        for (let i = 0; i < this._boxNumber ** 2; i++) {
            const box = new Box(`${this._id}-${i}`,this._self, width, this._colorOptions);
            box.add();
            this._boxes.push(box);
        }  
    }
    
    updateBoxes(updateFeature:Partial<Omit<BoxFeature, 'id'|'sketch'|'width'>>, ...ids:number[]) {
        if(ids) {
            for(let i = 0; i < ids.length; i++) {
                const id = `${this._id}-${ids[i]}`;
                const targetBox = this._boxes[ids[i]];
                if(targetBox.id === id){
                    targetBox.update(updateFeature);
                }else {
                    throw new Error('something wrong with naming ID')
                }
            }
        }else {
            for(let i = 0; i < this._boxes.length; i++) {
                this._boxes[i].update(updateFeature);
            }
        }
    }
}

const sketches = document.querySelectorAll('.sketch');
const BOX_NUMBER_IN_ROW = 10;
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