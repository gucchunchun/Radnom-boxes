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
    constructor(position, _sketch, _width = 100, _colorOptions = defaultColorOptions, _color = getRandomColor(_colorOptions), _classList = []) {
        this.position = position;
        this._sketch = _sketch;
        this._width = _width;
        this._colorOptions = _colorOptions;
        this._color = _color;
        this._classList = _classList;
        this.self = undefined;
    }
    add() {
        let self = document.createElement('div');
        //default className
        self.classList.add('sketch__box');
        //additional className for style changes
        for (const name of this._classList) {
            self.classList.add(name);
        }
        self.style.width = this._width + '%';
        self.style.backgroundColor = `hsl(${this._color.hue}, ${this._color.saturation}%,${this._color.luminance}%)`;
        self.addEventListener('click', () => {
            this.update({ color: { hue: 10, saturation: 50, luminance: 70 } });
        });
        this._sketch.appendChild(self);
        this.self = self;
    }
    update(updateFeature) {
        let box = this.self;
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
var ContainerType;
(function (ContainerType) {
    ContainerType["Flex"] = "sketch--flex";
    ContainerType["Grid"] = "sketch--grid";
})(ContainerType || (ContainerType = {}));
class Sketch {
    constructor(_id, _self, _type, _boxInRow = 5, _colorOptions = defaultColorOptions) {
        this._id = _id;
        this._self = _self;
        this._type = _type;
        this._boxInRow = _boxInRow;
        this._colorOptions = _colorOptions;
        this._boxes = [];
    }
    getBoxNumber() {
        return this._boxInRow;
    }
    initBoxes() {
        let width = 100;
        if (this._type === ContainerType.Flex) {
            width = 100 / this._boxInRow;
        }
        else if (this._type === ContainerType.Grid) {
            this._self.style.gridTemplate = `repeat(${this._boxInRow}, 1fr) / repeat(${this._boxInRow}, 1fr)`;
        }
        for (let i = 0; i < this._boxInRow; i++) {
            this._boxes.push([]);
            for (let k = 0; k < this._boxInRow; k++) {
                const box = new Box({ row: i, col: k }, this._self, width, this._colorOptions);
                box.add();
                this._boxes[i].push(box);
            }
        }
    }
    updateBoxes(updateFeature, ...positions) {
        if (positions) {
            for (let i = 0; i < positions.length; i++) {
                const row = positions[i].row;
                const col = positions[i].col;
                const targetBox = this._boxes[row][col];
                if (targetBox.position === positions[i]) {
                    targetBox.update(updateFeature);
                }
                else {
                    throw new Error(`can not find Box with position:${positions[i]}`);
                }
            }
        }
        else {
            for (let i = 0; i < this._boxes.length; i++) {
                for (let k = 0; k < this._boxes[i].length; k++) {
                    this._boxes[i][k].update(updateFeature);
                }
            }
        }
    }
    addRow(addingNumber) {
        const currentBoxInRow = this._boxInRow;
        this._boxInRow += addingNumber;
        const edgeBoxes = this._boxes.filter((box, index) => index % currentBoxInRow === currentBoxInRow - 1);
        for (let i = 0; i < this._boxes.length; i++) {
            for (let k = 0; k < this._boxes[i].length; k++) {
                const box = this._boxes[i][k];
                if (this._type === ContainerType.Flex) {
                    box.update({ width: 100 / this._boxInRow });
                }
                if (k % currentBoxInRow === currentBoxInRow - 1) {
                    // const newBox = new Box()
                }
            }
        }
    }
}
const sketches = document.querySelectorAll('.sketch');
const BOX_NUMBER_IN_ROW = 10;
window.addEventListener('load', () => {
    for (let i = 0; i < sketches.length; i++) {
        const elem = sketches[i];
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
