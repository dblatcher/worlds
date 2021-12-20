import { Fluid, Force, RenderFunctions } from "../../src";
import { Circle, getVectorX, getVectorY, getXYVector, Point, reverseHeading, translatePoint, Vector, Wedge, _360deg, _90deg } from "../../src/geometry";
import { LinearGradientFill, RadialGradientFill } from "../../src/AbstractFill"
import { shapes } from "../../src/Shape";
import { Body } from "../../src/Body";
import { ViewPort, World } from "../../src/World";


const ball = {
    size: 30,
    density: 1,
    elasticity: .75,
    color: "transparent",
}

const greenStripes = new LinearGradientFill({
    fallbackColor: "lime",
    canvasFunction: (ctx: CanvasRenderingContext2D, line: [Point, Point]) => {
        const gradient = ctx.createLinearGradient(line[0].x, line[0].y, line[1].x, line[1].y);
        let i;
        for (i = 0; i < 10; i++) {
            gradient.addColorStop(i * .1, 'lime');
            gradient.addColorStop((i + .5) * .1, 'green');
        }
        return gradient
    }

})

const redCircles = new RadialGradientFill({
    fallbackColor: "pink",
    canvasFunction: (ctx: CanvasRenderingContext2D, circle: Circle, heading: number) => {

        const offCenter: Vector = {
            x: getVectorX(circle.radius * .25, heading),
            y: getVectorY(circle.radius * .25, heading)
        }

        const innerCircle: Circle = {
            x: circle.x + offCenter.x,
            y: circle.y + offCenter.y,
            radius: circle.radius * (1 / 2)
        }

        const gradient = ctx.createRadialGradient(innerCircle.x, innerCircle.y, innerCircle.radius, circle.x, circle.y, circle.radius);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(.1, 'pink');
        gradient.addColorStop(.2, 'red');
        gradient.addColorStop(.3, 'pink');
        gradient.addColorStop(.4, 'red');
        gradient.addColorStop(.5, 'pink');
        gradient.addColorStop(.6, 'red');
        gradient.addColorStop(.7, 'pink');
        gradient.addColorStop(.8, 'red');
        gradient.addColorStop(.9, 'pink');
        gradient.addColorStop(1, 'red');

        return gradient;
    }
})

const greenBall = new Body(Object.assign({
    x: 10, y: 10, fillColor: greenStripes
}, ball))

const redBall = new Body(Object.assign({
    x: 40, y: 150, fillColor: redCircles, shape: shapes.circle
}, ball))

const blueBall = new Body(Object.assign({
    x: 120, y: 130, fillColor: 'blue'
}, ball))


class WedgedBody extends Body {

    renderOnCanvas(ctx: CanvasRenderingContext2D, viewPort: ViewPort) {

        const { shapeValues, data } = this

        const wedge1: Wedge = Object.assign({
            angle: _90deg, heading: data.heading
        }, shapeValues)

        const wedge2: Wedge = Object.assign({
            angle: _90deg, heading: reverseHeading(data.heading)
        }, shapeValues)

        RenderFunctions.renderCircle.onCanvas(ctx, shapeValues, { fillColor: 'grey', strokeColor: data.color }, viewPort)
        RenderFunctions.renderWedge.onCanvas(ctx, wedge1, { fillColor: data.fillColor, strokeColor: data.color }, viewPort)
        RenderFunctions.renderWedge.onCanvas(ctx, wedge2, { fillColor: data.fillColor, strokeColor: data.color }, viewPort)
    }

}

const yellowBall = new WedgedBody(Object.assign({
    x: 420, y: 230, fillColor: 'yellow', color: 'white'
}, ball, { size: 40, density: 5 }))


const world = new World([
    greenBall, redBall, blueBall, yellowBall
], {
    width: 800,
    height: 400,
    airDensity: .5,
    gravitationalConstant: 0.05,
    globalGravityForce: new Force(1, 0),
    edges: {
        left: "WRAP",
        bottom: "HARD",
        right: "WRAP",
    }
})

export { world, greenStripes, redCircles }