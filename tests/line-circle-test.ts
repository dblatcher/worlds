import * as G from '../src/geometry'

export default function lineCircleTest() {
    console.log('lineCircleTest')

    const circle: G.Circle = {
        x: 50,
        y: 40,
        radius: 10
    }

    const line1: [G.Point, G.Point] = [
        { x: 50, y: 0 },
        { x: 50, y: 40 },
    ]
    console.log({ circle, line: line1 })

    console.log('looking for intersections...')
    const intersections1 = G.getSortedIntersectionInfoWithCircle(line1, circle)
    console.log('RESULTS:')
    console.log(intersections1)

    intersections1.forEach(intersection => {
        const distance = G.getDistanceBetweenPoints(intersection.point,circle)
        const correct = distance == circle.radius
        console.log ({distance, correct})
    })
}