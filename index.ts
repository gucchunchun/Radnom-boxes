const sketches = document.querySelectorAll('.sketch');

enum Saturation {
    Mono,
    Random
}
interface Options {
    box:number
    color: {
        saturation: Saturation,
        luminance: {
            min: number,
            max: number
        }
    }

}
const Options:Options = {
    box: 5,
    color :{
        saturation: Saturation.Random,
        luminance: {
            min: 0,
            max: 100
        }
    }

}

//get random color: To coloring Boxes every time with different colors



function getRandomColor() {
    
}

function addBoxes(sketch: HTMLElement, width: number = 100) {
    //add 5*5 boxes
    for (let i = 0; i < Options.box ** 2; i++) {
        let box = document.createElement('div');
        box.className = 'sketch__box';
        box.style.width = `${width}%`;
        sketch.appendChild(box);
    }  
}

window.addEventListener('load', () => {
    sketches.forEach((elem)=>{
        const sketch = elem as HTMLElement;
        if (sketch.classList.contains('sketch--flex')){
            addBoxes(sketch, 100/Options.box);
        }else if (sketch.classList.contains('sketch--grid')) {
            addBoxes(sketch);
            sketch.style.gridTemplate = `repeat(${Options.box}, 1fr) / repeat(${Options.box}, 1fr)`;
        }
        else {
            throw new Error('found sketch without flex/grid');
        }
    })
});