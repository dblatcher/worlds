import { describe, it, expect } from "bun:test"
import * as G from '../src/geometry'

describe('findIntersectionPointOfLineSegments', () => {
    it("finds intersection between two lines", () => {

        const l1: [G.Point, G.Point] = [
            { x: 10, y: 0 },
            { x: 10, y: 50 },
        ]

        const l2: [G.Point, G.Point] = [
            { x: 0, y: 0 },
            { x: 20, y: 40 },
        ]

        expect(G.findIntersectionPointOfLineSegments(l1, l2)).toEqual({
            x: 10,
            y: 20,
        })
    })
    it("finds intersection between two other lines", () => {

        const l3: [G.Point, G.Point] = [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
        ]
        const l4: [G.Point, G.Point] = [
            { x: 5, y: 5 },
            { x: 20, y: 20 },
        ]

        expect(G.findIntersectionPointOfLineSegments(l3, l4)).toEqual({
            x: 7.5,
            y: 7.5,
        })
    })
})

