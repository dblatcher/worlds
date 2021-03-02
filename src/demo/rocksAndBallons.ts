import { World, shapes, Thing, Force } from '../index'


function makeRock() {

    let x = 50 + Math.floor(Math.random() * 500)
    let y = 50 + Math.floor(Math.random() * 300)
    let size = 10 + Math.floor(Math.random() * 20)
    let density = 4
    let elasticity = .25
    let headingFollowsDirection = true
    let color = 'gray'
    let direction = Math.random() > .25
        ? Math.random() > .5
            ? .25
            : 1.75
        : 0

    return new Thing({ x, y, size, density, color, elasticity, headingFollowsDirection })
}

function makeBallon() {

    let x = 50 + Math.floor(Math.random() * 500)
    let y = 50 + Math.floor(Math.random() * 300)
    let size = 10 + Math.floor(Math.random() * 20)
    let density = 1
    let elasticity = .8
    let headingFollowsDirection = true
    let color = 'red'
    let direction = Math.random() > .25
        ? Math.random() > .5
            ? .25
            : 1.75
        : 0

    return new Thing({ x, y, size, density, color, elasticity, headingFollowsDirection })
}

function makeRocksAndBallons(amount: number) {
    let things: Thing[] = []
    for (let i = 0; i < amount; i++) { things.push(makeRock()) }
    for (let i = 0; i < amount; i++) { things.push(makeBallon()) }
    return things
}

const slope = new Thing({shape:shapes.square, x:-100, y:900, size:400, heading:-2.1,immobile:true})

const rocksAndBallons = new World([
    slope,
    ...makeRocksAndBallons(10),
], {
    globalGravityForce: new Force(1, 0),
    hasHardEdges: true,
    gravitationalConstant: 1,
    name: "Rocks and Ballons",
})

export { rocksAndBallons }