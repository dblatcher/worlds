import { World, Thing, Force, LinedThing, shapes } from '../index'


const bigWhiteSquare = new LinedThing({
    heading: .7,
    x: 200, y: 200,
    size: 100, density: 1,
    immobile: true,
    color: 'antiquewhite',
    shape: shapes.square,
    headingFollowsDirection: true,
})

const litteWhiteSquare = new Thing({
    heading: 1,
    x: 500,
    y: 525,
    size: 20,
    density: .1,
    immobile: true,
    color: 'antiquewhite',
    shape: shapes.square,
    headingFollowsDirection: true,
})

const redPlanet = new Thing({
    x: 280,
    y: 500,
    size: 50,
    density: 1,
    color: 'red',
    elasticity: 1,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
}, new Force(15, Math.PI * 1))

const blueMatter = {
    density: 1,
    color: 'blue',
    fillColor: 'purple',
    elasticity: 1,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
}

const bluePlanets = [
    new Thing(
        Object.assign({ x: 250, y: 210, size: 10, }, blueMatter),
        new Force(0, Math.PI * 1.5)
    ),
    new Thing(
        Object.assign({ x: 250, y: 100, size: 30, }, blueMatter),
        new Force(0, Math.PI * 1.5)
    ),
    new Thing(
        Object.assign({ x: 100, y: 260, size: 35, }, blueMatter),
        new Force(0, Math.PI * 1.5)
    ),
]

const squareTestWorld = new World([
    bigWhiteSquare,
    litteWhiteSquare,
    ...bluePlanets,
    redPlanet,
], {
    height: 800,
    width: 800,

    gravitationalConstant: 0,
    thingsExertGravity: true,
    minimumMassToExertGravity: 1000,
    hasHardEdges: true,
    name: "squareTestWorld",
});

console.log({ bigWhiteSquare, redPlanet, bluePlanets, litteWhiteSquare })

export { squareTestWorld }