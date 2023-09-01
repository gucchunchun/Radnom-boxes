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
	
type colorRange = {
    min: NumericRange<CreateArrayWithLengthX<0>, 99>,
    max: NumericRange<CreateArrayWithLengthX<1>, 100>,
}
interface Options {
    box:number
    color: {
        saturation: colorRange,
        luminance: colorRange
    }
}
const Options:Options = {
    box: 5,
    color :{
        saturation: {
            min: 0,
            max: 100
        },
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

const sketches = document.querySelectorAll('.sketch');
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



