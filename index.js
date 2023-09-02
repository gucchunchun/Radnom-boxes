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
};
class Box {
    constructor(id, _sketch, _width = 100, _colorOptions = defaultColorOptions, _color = getRandomColor(_colorOptions), _classList = []) {
        this.id = id;
        this._sketch = _sketch;
        this._width = _width;
        this._colorOptions = _colorOptions;
        this._color = _color;
        this._classList = _classList;
        this._self = undefined;
    }
    add() {
        let self = document.createElement('div');
        //default className
        self.classList.add('sketch__box');
        //additional className for style changes
        for (let name of this._classList) {
            self.classList.add(name);
        }
        self.style.width = this._width + '%';
        self.style.backgroundColor = `hsl(${this._color.hue}, ${this._color.saturation}%,${this._color.luminance}%)`;
        self.addEventListener('click', () => {
            this.update({ color: { hue: 10, saturation: 50, luminance: 70 } });
        });
        this._sketch.appendChild(self);
        this._self = self;
    }
    update(updateFeature) {
        let box = this._self;
        if (!box) {
            throw new Error('Target box element can not be found');
        }
        if (updateFeature.width) {
            this._width = updateFeature.width;
            box.style.width = this._width + '%';
        }
        // color is more primary than getting random color with colorOptions
        if (updateFeature.color) {
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
            };
        }
        else if (updateFeature.colorOptions) {
            this._colorOptions = updateFeature.colorOptions;
        }
        if (updateFeature.classList) {
            this._classList = updateFeature.classList;
            for (let name of box.classList) {
                if (name === 'sketch__box') {
                    return;
                }
                else if (updateFeature.classList.includes(name)) {
                    const index = updateFeature.classList.indexOf(name);
                    updateFeature.classList.splice(index, 1);
                    return;
                }
                else {
                    box.classList.remove(name);
                }
            }
            for (let newName of updateFeature.classList) {
                box.classList.add(newName);
            }
        }
    }
}
var ContainerType;
(function (ContainerType) {
    ContainerType["Flex"] = "sketch--flex";
    ContainerType["Grid"] = "sketch--grid";
})(ContainerType || (ContainerType = {}));
class Sketch {
    constructor(_id, _self, _type, _boxNumber = 5, _colorOptions = defaultColorOptions) {
        this._id = _id;
        this._self = _self;
        this._type = _type;
        this._boxNumber = _boxNumber;
        this._colorOptions = _colorOptions;
        this._boxes = [];
    }
    getBoxNumber() {
        return this._boxNumber;
    }
    initBoxes() {
        let width = 100;
        if (this._type === ContainerType.Flex) {
            width = 100 / this._boxNumber;
        }
        else if (this._type === ContainerType.Grid) {
            this._self.style.gridTemplate = `repeat(${this._boxNumber}, 1fr) / repeat(${this._boxNumber}, 1fr)`;
        }
        for (let i = 0; i < this._boxNumber ** 2; i++) {
            const box = new Box(`${this._id}-${i}`, this._self, width, this._colorOptions);
            box.add();
            this._boxes.push(box);
        }
    }
    updateBoxes(updateFeature, ...ids) {
        if (ids) {
            for (let i = 0; i < ids.length; i++) {
                const id = `${this._id}-${ids[i]}`;
                const targetBox = this._boxes[ids[i]];
                if (targetBox.id === id) {
                    targetBox.update(updateFeature);
                }
                else {
                    throw new Error('something wrong with naming ID');
                }
            }
        }
        else {
            for (let i = 0; i < this._boxes.length; i++) {
                this._boxes[i].update(updateFeature);
            }
        }
    }
}
const sketches = document.querySelectorAll('.sketch');
const BOX_NUMBER_IN_ROW = 10;
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
