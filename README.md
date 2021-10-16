# Worlds
A typeScript library for creating 2d physics simulations within self-contained 'Worlds' which can be rendered on HTML canvas elements.

## Installation
```npm i worlds```

## Example usage
```
//create a world with two bodies.
const  world = new  World([
	new  Body({ x:  10, y:  10, density:2 }),
	new  Body({ x:  10, y:  100, size:  50, fillColor:  'blue' })
], {
	width:  200,
	height:  200,
	airDensity:  4,
	globalGravityForce:  new  Force(1, 0),
});

//find a canvas element on the document
const myCanvas = document.querySelector('canvas');

//create a ViewPort to render the world on the canvas
const viewPort = ViewPort.fitToSize(world, myCanvas, 300,200);

//Start the world's timer 
world.ticksPerSecond = 10;
```
