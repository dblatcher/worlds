import { describe, it, expect } from "bun:test"
import * as G from '../src/geometry'


describe('getSortedIntersectionInfoWithCircle', () => {

    it("finds no points when the line does not touch the circle", () => {
        const circle: G.Circle = {
            x: 350,
            y: 40,
            radius: 10
        }
        const line1: [G.Point, G.Point] = [
            { x: 50, y: 0 },
            { x: 50, y: 40 },
        ]

        const intersections = G.getSortedIntersectionInfoWithCircle(line1, circle)
        expect(intersections).toEqual([])
    })
    it("finds the point where a line betwen a point inside and a point outside a circle crosses the edge", () => {
        const circle: G.Circle = {
            x: 50,
            y: 40,
            radius: 10
        }
        const line1: [G.Point, G.Point] = [
            { x: 50, y: 0 },
            { x: 50, y: 40 },
        ]

        const intersections = G.getSortedIntersectionInfoWithCircle(line1, circle)
        expect(intersections).toEqual([
            {
                edge: null,
                edgeIndex: -1,
                point: {
                    x: 50,
                    y: 30,
                },
                edgeAngle: 1.5707963267948966,
            }
        ])

        intersections.forEach(intersection => {
            expect(G.getDistanceBetweenPoints(intersection.point, circle)).toEqual(circle.radius)
        })
    })

})