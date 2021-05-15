const myPackage = require('../dist/physics-worlds');

console.log('required module in packageTest',myPackage)
const testWorld = new myPackage.World([],{})
console.log ({testWorld})

