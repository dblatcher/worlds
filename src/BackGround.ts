import { RenderFunctions, ViewPort } from ".";


class BackGround {
    tick() { }
    renderOnCanvas(ctx: CanvasRenderingContext2D, viewPort: ViewPort) { }
}

interface StarFieldData {
    numberOfStars: number
    depth: number
    height: number
    width: number
}

interface StarFieldStar {
    x: number
    y: number
    depth: number
}

class StarField extends BackGround {
    stars: StarFieldStar[]

    constructor(data: StarFieldData) {
        super()
        const { width, height, depth } = data

        this.stars = []
        let midPoint = { x: width / 2, y: height / 2 }

        for (let i = 0; i < data.numberOfStars; i++) {
            this.stars.push({
                x: midPoint.x + Math.floor(Math.random() * width * depth) - (width / 2 * depth),
                y: midPoint.y + Math.floor(Math.random() * height * depth) - (height / 2 * depth),
                depth,
            })
        }
    }

    renderOnCanvas(ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        function plotStar(star: StarFieldStar) {
            RenderFunctions.renderPoint.onCanvas(ctx, star, { fillColor: 'white', parallax: star.depth }, viewPort)
        }
        this.stars.forEach(star => { plotStar(star) })
    }

}

export { BackGround, StarField, StarFieldData }