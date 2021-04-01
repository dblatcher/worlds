
import { StarField } from '../../BackGround'
import { World, Body, Force, shapes } from '../../index'


const worldHeight = 10000
const worldWidth = 9000


const whiteStar = new Body({ x: worldWidth * .5, y: worldHeight * .5, fillColor: 'ghostwhite', size: 400, density: 2, immobile: true })
const blueStar = new Body({ x: worldWidth * .25, y: worldHeight * .8, fillColor: 'skyblue', size: 300, density: 2, immobile: true })
const redStar = new Body({ x: worldWidth * .65, y: worldHeight * .2, fillColor: 'darkred', size: 600, density: 2, immobile: true })

function makeSquare(x: number, y: number, heading = .5) {
    return new Body({
        x: worldWidth * x, y: worldHeight * y,
        fillColor: 'gray', color: 'white', renderHeadingIndicator: true,
        size: 200, density: .1, immobile: true, heading,
        shape: shapes.square
    })
}


const redPlanet = new Body({
    x: 300,
    y: 600,
    size: 150,
    density: 5,
    color: 'white',
    fillColor: 'crimson',
    elasticity: .8,
    renderHeadingIndicator: true,
})

const starOffEdge = new Body({
    x: -300,
    y: 0,
    size: 150,
    fillColor: 'blue',
    immobile: true,
})

const bigWorld = new World([
    redPlanet,
    whiteStar,
    blueStar,
    redStar,
    starOffEdge,
    makeSquare(.1, .4),
    makeSquare(.4, .45, 1),
    makeSquare(.84, .25, 2),
    makeSquare(.74, .65, 2),
    makeSquare(.71, .35, 2),
], {
    gravitationalConstant: .1,
    width: worldWidth,
    height: worldHeight,
    bodiesExertGravity: true,
    hasHardEdges: true,
    name: "Galaxy",
    airDensity: 20,
    backGrounds: [
        new StarField({ numberOfStars: 300, width: worldWidth, height: worldHeight, depth: 5 }),
        new StarField({ numberOfStars: 300, width: worldWidth, height: worldHeight, depth: 10 }),
    ]
});

export { bigWorld, redPlanet }