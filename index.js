"use strict";
const sketches = document.querySelectorAll('.sketch');
const BOX_IN_A_ROW = 5;
function addBoxes(sketch) {
    //add 5*5 boxes
    for (let i = 0; i < BOX_IN_A_ROW ** 2; i++) {
        let box = document.createElement('div');
        box.className = 'sketch__box';
        sketch.appendChild(box);
    }
}
window.addEventListener('load', () => {
    sketches.forEach((elem) => {
        const sketch = elem;
        addBoxes(sketch);
    });
});
