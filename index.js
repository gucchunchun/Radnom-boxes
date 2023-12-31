"use strict";
//get random color: To coloring Boxes every time with different colors
var ColorOption;
(function (ColorOption) {
    ColorOption["Hue"] = "hue";
    ColorOption["Saturation"] = "saturation";
    ColorOption["Luminance"] = "luminance";
})(ColorOption || (ColorOption = {}));
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
    const hue = getRandomHue(option[ColorOption.Hue]);
    const saturation = getRandomSaturation(option[ColorOption.Saturation]);
    const luminance = getRandomLuminance(option[ColorOption.Luminance]);
    return {
        [ColorOption.Hue]: hue,
        [ColorOption.Saturation]: saturation,
        [ColorOption.Luminance]: luminance,
    };
}
const defaultColorOptions = {
    hue: {
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
    add(insertBeforeElement = undefined) {
        let self = document.createElement('div');
        //default className
        self.classList.add('sketch__box');
        //additional className for style changes
        for (const name of this._classList) {
            self.classList.add(name);
        }
        self.style.width = this._width + '%';
        self.style.backgroundColor = `hsl(${this._color.hue}, ${this._color.saturation}%,${this._color.luminance}%)`;
        self.addEventListener('mouseover', () => {
            this.update({ colorOptions: this._colorOptions });
        });
        if (insertBeforeElement) {
            this._sketch.insertBefore(self, insertBeforeElement);
        }
        else {
            this._sketch.appendChild(self);
        }
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
            this._color = getRandomColor(this._colorOptions);
            box.style.backgroundColor = `hsl(${this._color.hue}, ${this._color.saturation}%,${this._color.luminance}%)`;
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
    constructor(_self, _type, _boxInRow = 5, _colorOptions = JSON.parse(JSON.stringify(defaultColorOptions))) {
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
            for (let j = 0; j < this._boxInRow; j++) {
                const box = new Box({ row: i, col: j }, this._self, width, this._colorOptions);
                box.add();
                this._boxes[i].push(box);
            }
        }
    }
    updateColorOptions(value, optionName, isMin = false) {
        let newColorOptions = this._colorOptions;
        if (Object.values(ColorOption).includes(optionName)) {
            if (isMin) {
                newColorOptions[optionName].min = value;
            }
            else {
                newColorOptions[optionName].max = value;
            }
        }
        this._colorOptions = newColorOptions;
        for (let i = 0; i < this._boxes.length; i++) {
            for (let j = 0; j < this._boxes[i].length; j++) {
                this._boxes[i][j].update({ colorOptions: this._colorOptions });
            }
        }
    }
    addRow(addingNumber) {
        if (addingNumber <= 0) {
            throw new Error('Adding number of box must be greater than zero');
        }
        const currentBoxInRow = this._boxInRow;
        this._boxInRow += addingNumber;
        let width = 100;
        if (this._type === ContainerType.Grid) {
            this._self.style.gridTemplate = `repeat(${this._boxInRow}, 1fr) / repeat(${this._boxInRow}, 1fr)`;
        }
        for (let i = 0; i < this._boxInRow; i++) {
            //new column
            if (currentBoxInRow - 1 < i) {
                this._boxes.push([]);
                for (let j = 0; j < this._boxInRow; j++) {
                    const box = new Box({ row: i, col: j }, this._self, width);
                    box.add();
                    this._boxes[i].push(box);
                }
            }
            //already exist column
            else {
                for (let j = 0; j < this._boxes[i].length; j++) {
                    const box = this._boxes[i][j];
                    box.position.row += addingNumber;
                    if (this._type === ContainerType.Flex) {
                        width = 100 / this._boxInRow;
                        box.update({ width: width });
                    }
                    if (j === 0) {
                        for (let k = 0; k < addingNumber; k++) {
                            const new_box = new Box({ row: i, col: k }, this._self, width);
                            new_box.add(box.self);
                            this._boxes[i].splice(k, 0, new_box);
                        }
                    }
                }
            }
        }
    }
    delRow(deletingNumber) {
        if (deletingNumber <= 0) {
            throw new Error('Adding number of box must be greater than zero');
        }
        this._boxInRow -= deletingNumber;
        if (this._type === ContainerType.Grid) {
            this._self.style.gridTemplate = `repeat(${this._boxInRow}, 1fr) / repeat(${this._boxInRow}, 1fr)`;
        }
        let new_boxes = [];
        for (let i = 0; i < this._boxes.length; i++) {
            if (i <= this._boxInRow - 1) {
                new_boxes.push([]);
            }
            for (let j = 0; j < this._boxes[i].length; j++) {
                const box = this._boxes[i][j];
                if (!box.self) {
                    throw new Error(`Box position row:${i}, column:${j} is not available`);
                }
                if (i <= this._boxInRow - 1 && j <= this._boxInRow - 1) {
                    if (this._type == ContainerType.Flex) {
                        box.update({ width: 100 / this._boxInRow });
                    }
                    new_boxes[i].push(box);
                }
                else {
                    //remove from DOM
                    this._self.removeChild(box.self);
                }
            }
        }
        this._boxes = new_boxes;
    }
}
function setProgressBar(input, progressBar, isMin = false, isHue = false) {
    let marginPercent;
    let marginPercentOpposite;
    if (isMin) {
        marginPercent = (isHue)
            ? parseInt(input.value) / 360 * 100
            : parseInt(input.value);
        marginPercentOpposite = parseInt(progressBar.style.marginRight.split('%')[0]);
        progressBar.style.marginLeft = marginPercent + '%';
    }
    else {
        marginPercent = (isHue)
            ? (360 - parseInt(input.value)) / 360 * 100
            : 100 - parseInt(input.value);
        marginPercentOpposite = parseInt(progressBar.style.marginLeft.split('%')[0]);
        progressBar.style.marginRight = marginPercent + '%';
    }
    if (isNaN(marginPercentOpposite)) {
        marginPercentOpposite = 0;
    }
    progressBar.style.width = (100 - (marginPercent + marginPercentOpposite)) + '%';
}
function findOppositeInput(input, isMin) {
    var _a;
    const className = isMin ? '.max' : '.min';
    const oppositeInput = (_a = input.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector(className);
    if (!oppositeInput) {
        throw new Error(`Cannot find corresponding ${isMin ? 'max' : 'min'} element`);
    }
    return oppositeInput;
}
function validateInputValue(input, isMin = false, isHue = false) {
    const oppositeInput = findOppositeInput(input, isMin);
    const newValue = parseInt(input.value);
    const maxValue = isHue ? 360 : 100;
    if (isMin) {
        return Math.max(0, Math.min(newValue, parseInt(oppositeInput.value)));
    }
    else {
        return Math.min(maxValue, Math.max(newValue, parseInt(oppositeInput.value)));
    }
}
const sketches = document.querySelectorAll('.sketch');
const rowManipButtons = document.querySelectorAll('.button--row-manip');
const rangeInputs = document.querySelectorAll('.color-option__range');
const flipBox = document.querySelector('.color-option__flip-box');
const flipManipButtons = document.querySelectorAll('.button--flip-manip');
const root = document.querySelector(':root');
const BOX_NUMBER_IN_ROW = 6;
let sketchFlex;
let sketchGrid;
function resizeFlipBox() {
    if (!flipBox) {
        throw new Error('flip-box is not found');
    }
    if (!root) {
        throw new Error(':root is not found');
    }
    const width = flipBox.clientWidth + 'px';
    root.style.setProperty('--flip--width', width);
}
for (let i = 0; i < sketches.length; i++) {
    const elem = sketches[i];
    let type;
    if (elem.classList.contains(ContainerType.Flex)) {
        type = ContainerType.Flex;
        sketchFlex = new Sketch(elem, type, BOX_NUMBER_IN_ROW);
        sketchFlex.initBoxes();
    }
    else if (elem.classList.contains(ContainerType.Grid)) {
        type = ContainerType.Grid;
        sketchGrid = new Sketch(elem, type, BOX_NUMBER_IN_ROW);
        sketchGrid.initBoxes();
    }
    else {
        throw new Error('not found container type class name');
    }
}
rowManipButtons.forEach((button) => {
    var _a;
    const rowManipButton = button;
    //row-(add/del)--(flex/grid)
    const idNames = rowManipButton.id.split('-');
    const isAdd = idNames[1] == 'add';
    const containerType = idNames[idNames.length - 1];
    const sketch = containerType === 'flex' ? sketchFlex : sketchGrid;
    const delButton = isAdd
        ? (_a = rowManipButton.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector(`#row-del--${containerType}`)
        : rowManipButton;
    if (!delButton) {
        throw new Error(`delete row button for ${containerType} not found`);
    }
    rowManipButton.addEventListener('click', () => {
        if (isAdd) {
            sketch.addRow(1);
            if (sketch.getBoxNumber() === 1) {
                delButton.classList.remove('disabled');
            }
        }
        else {
            if (sketch.getBoxNumber() === 0) {
                return;
            }
            sketch.delRow(1);
            if (sketch.getBoxNumber() === 0) {
                delButton.classList.add('disabled');
            }
        }
    });
});
rangeInputs.forEach((input) => {
    var _a, _b;
    const rangeInput = input;
    //(optionName)-(min/max)--range--(flex/grid)
    const idNames = rangeInput.id.split('-');
    const isMin = idNames[1] === 'min';
    const optionName = idNames[0];
    const sketch = idNames[idNames.length - 1] === 'flex' ? sketchFlex : sketchGrid;
    const searchClassName = (isMin)
        ? '.color-option__num.min'
        : '.color-option__num.max';
    const numInput = (_a = rangeInput.closest('.color-option__ctr')) === null || _a === void 0 ? void 0 : _a.querySelector(searchClassName);
    const progressBar = (_b = rangeInput.parentElement) === null || _b === void 0 ? void 0 : _b.querySelector('.color-option__range__progress');
    if (!numInput) {
        throw new Error('can not find .num--min');
    }
    if (!progressBar) {
        throw new Error('can not find .color-option__range__progress');
    }
    if (!sketch) {
        throw new Error('can not find corresponding sketch');
    }
    rangeInput.addEventListener('input', () => {
        const new_value = validateInputValue(rangeInput, isMin, optionName === 'hue');
        rangeInput.value = new_value.toString();
        numInput.value = rangeInput.value;
        setProgressBar(numInput, progressBar, isMin, optionName === 'hue');
        sketch.updateColorOptions(new_value, optionName, isMin);
    });
    numInput.addEventListener('change', () => {
        const new_value = validateInputValue(numInput, isMin, optionName === 'hue');
        numInput.value = new_value.toString();
        rangeInput.value = numInput.value;
        setProgressBar(numInput, progressBar, isMin, optionName === 'hue');
        sketch.updateColorOptions(new_value, optionName, isMin);
    });
});
resizeFlipBox();
window.addEventListener('resize', resizeFlipBox);
flipManipButtons.forEach((button) => {
    var _a;
    const flipManipButton = button;
    const isLeft = flipManipButton.classList.contains('left');
    const flipBox = (_a = flipManipButton.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector('.color-option__flip-box');
    flipManipButton.addEventListener('click', () => {
        const match = getComputedStyle(flipBox).getPropertyValue('--angle');
        const currentAngle = match
            ? isNaN(parseInt(match))
                ? 0
                : parseInt(match.replace('deg', ''))
            : 0;
        let targetAngle;
        if (isLeft) {
            targetAngle = currentAngle + 90;
        }
        else {
            targetAngle = currentAngle - 90;
        }
        flipBox.style.setProperty('--angle', `${targetAngle}deg`);
    });
});
// min + value % max loop
//# sourceMappingURL=index.js.map