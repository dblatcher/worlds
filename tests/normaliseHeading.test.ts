import { expect, test, describe } from "bun:test";
import { normaliseHeading } from "../src/geometry"

describe("normaliseHeading", () => {
    function toDegrees(rads: number) { return rads * (180 / Math.PI) }
    const headings: [number, number][] = [
        [1, 1],
        [2, 2],
        [Math.PI / 4, 0.7853981633974483],
        [10, 3.7168146928204138],
        [15, 2.4336293856408275],
        [0, 0],
        [-1, 5.283185307179586],
        [-Math.PI / 3, 5.235987755982989]
    ]
    headings.forEach(([heading, expectedValue]) => {
        test(`${heading} rads = ${expectedValue} rads (${toDegrees(expectedValue)} degrees) `, () => {
            expect(normaliseHeading(heading)).toEqual(expectedValue)
        })
    })
})