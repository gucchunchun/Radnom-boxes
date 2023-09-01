"use strict";
const sketches = document.querySelectorAll('.sketch');
var Saturation;
(function (Saturation) {
    Saturation[Saturation["Mono"] = 0] = "Mono";
    Saturation[Saturation["Random"] = 1] = "Random";
})(Saturation || (Saturation = {}));
const Options = {
    box: 5,
    color: {
        saturation: Saturation.Random,
        luminance: {
            min: 0,
            max: 100
        }
    }
};
//get random color: To coloring Boxes every time with different colors
function getRandomColor() {
}
function addBoxes(sketch, width = 100) {
    //add 5*5 boxes
    for (let i = 0; i < Options.box ** 2; i++) {
        let box = document.createElement('div');
        box.className = 'sketch__box';
        box.style.width = `${width}%`;
        sketch.appendChild(box);
    }
}
window.addEventListener('load', () => {
    sketches.forEach((elem) => {
        const sketch = elem;
        if (sketch.classList.contains('sketch--flex')) {
            addBoxes(sketch, 100 / Options.box);
        }
        else if (sketch.classList.contains('sketch--grid')) {
            addBoxes(sketch);
            sketch.style.gridTemplate = `repeat(${Options.box}, 1fr) / repeat(${Options.box}, 1fr)`;
        }
        else {
            throw new Error('found sketch without flex/grid');
        }
    });
});
