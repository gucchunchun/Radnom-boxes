"use strict";
const sketches = document.querySelectorAll('.sketch');
const BOX_IN_A_ROW = 5;
function addBoxes(sketch, width = 100) {
    //add 5*5 boxes
    for (let i = 0; i < BOX_IN_A_ROW ** 2; i++) {
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
            addBoxes(sketch, 100 / BOX_IN_A_ROW);
        }
        else if (sketch.classList.contains('sketch--grid')) {
            addBoxes(sketch);
            sketch.style.gridTemplate = `repeat(${BOX_IN_A_ROW}, 1fr) / repeat(${BOX_IN_A_ROW}, 1fr)`;
        }
        else {
            throw new Error('found sketch without flex/grid');
        }
    });
});
