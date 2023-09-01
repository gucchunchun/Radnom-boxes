"use strict";
function getRandomHue(option) {
    return Math.round(Math.random() * (option.max - option.min) + option.min);
}
function getRandomSaturation(option) {
    return Math.round(Math.random() * (option.max - option.min) + option.min);
}
function getRandomLuminance(option) {
    return Math.round(Math.random() * (option.max - option.min) + option.min);
}
function getRandomColor(option) {
    const hue = getRandomHue(option['hue']);
    const saturation = getRandomSaturation(option['saturation']);
    const luminance = getRandomLuminance(option['luminance']);
    return { hue: hue, saturation: saturation, luminance: luminance };
}
const defaultColorOptions = {
    hue: {
        min: 0,
        max: 360
    },
    saturation: {
        min: 30,
        max: 70
    },
    luminance: {
        min: 30,
        max: 70
    }
};
class Box {
    constructor(id, sketch, width = 100, colorOptions = defaultColorOptions, classList = []) {
        this.classList = [];
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
        for (let name of this.classList) {
            self.classList.add(name);
        }
        self.style.width = this.width + '%';
        self.style.backgroundColor = `hsl(${this.color.hue}, ${this.color.saturation}%,${this.color.luminance}%)`;
        this.sketch.appendChild(self);
        this.self = self;
    }
}
var ContainerType;
(function (ContainerType) {
    ContainerType["Flex"] = "sketch--flex";
    ContainerType["Grid"] = "sketch--grid";
})(ContainerType || (ContainerType = {}));
class Sketch {
    constructor(id, sketch, type, boxNum = 5, colorOptions = defaultColorOptions) {
        this.id = id;
        this.sketch = sketch;
        this.type = type;
        this.boxNumber = boxNum;
        this.boxes = [];
        this.colorOptions = colorOptions;
    }
    initBoxes() {
        let width = 100;
        if (this.type === ContainerType.Flex) {
            width = 100 / this.boxNumber;
        }
        else if (this.type === ContainerType.Grid) {
            this.sketch.style.gridTemplate = `repeat(${this.boxNumber}, 1fr) / repeat(${this.boxNumber}, 1fr)`;
        }
        for (let i = 0; i < this.boxNumber ** 2; i++) {
            const box = new Box(`${this.id}-${i}`, this.sketch, width, this.colorOptions, ['sketch__box']);
            box.add();
        }
    }
}
const sketches = document.querySelectorAll('.sketch');
const BOX_NUMBER_IN_ROW = 5;
window.addEventListener('load', () => {
    for (let i = 0; i < sketches.length; i++) {
        const elem = sketches[i];
        console.log(elem);
        let type;
        if (elem.classList.contains(ContainerType.Flex)) {
            type = ContainerType.Flex;
        }
        else if (elem.classList.contains(ContainerType.Grid)) {
            type = ContainerType.Grid;
        }
        else {
            throw new Error('not found container type class name');
        }
        const sketch = new Sketch(`${type}-${i}`, elem, type, BOX_NUMBER_IN_ROW);
        sketch.initBoxes();
    }
});
// min + value % max loop
