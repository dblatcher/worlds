import { World } from '../World'
import { Thing } from '../Thing'
import { Force } from '../Force'
import { shapes } from '../Shape'


function makeRock() {

    let x = 50 + Math.floor(Math.random() * 900)
    let y = 50 + Math.floor(Math.random() * 300)
    let size = 10 + Math.floor(Math.random() * 20)
    let density = 4
    let elasticity = .25
    let color = 'gray'
    let direction = Math.random() > .25
        ? Math.random() > .5
            ? .25
            : 1.75
        : 0

    return new Thing({ x, y, size, density, color, elasticity })
}

function makeBallon() {

    let x = 50 + Math.floor(Math.random() * 900)
    let y = 50 + Math.floor(Math.random() * 300)
    let size = 10 + Math.floor(Math.random() * 20)
    let density = 0.1
    let elasticity = .90
    let color = 'red'
    let direction = Math.random() > .25
        ? Math.random() > .5
            ? .25
            : 1.75
        : 0

    return new Thing({ x, y, size, density, color, elasticity })
}

function makeRocksAndBallons(amount: number) {
    let things: Thing[] = []
    for (let i = 0; i < amount; i++) { things.push(makeRock()) }
    for (let i = 0; i < amount; i++) { things.push(makeBallon()) }
    return things
}

const slope = new Thing({shape:shapes.square, x:-100, y:1100, size:400, heading:-2,immobile:true})

const rocksAndBallons = new World([
    ...makeRocksAndBallons(5),
    slope,
], {
    globalGravityForce: new Force(1, 0),
    hasHardEdges: true,
    gravitationalConstant: 1,
    name: "Rocks and Ballons",
})

export { rocksAndBallons }