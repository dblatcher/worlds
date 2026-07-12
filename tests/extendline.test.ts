import { expect, test } from "bun:test";
import { extendLineSegment, type Point } from '../src/geometry'

test('extendLineSegment should extend diagonals', () => {
    const diagonalLine: [Point, Point] = [
        { x: 5, y: 0 },
        { x: 0, y: 10 },
    ]
    const extendedLineByZero = extendLineSegment(diagonalLine, 0);
    expect(extendedLineByZero).toEqual(diagonalLine)
    const extendedLineByOne = extendLineSegment(diagonalLine, 1);
    expect(extendedLineByOne).toEqual([
        { x: 10, y: -10 },
        { x: -5, y: 20 },
    ])
})


test('extendLineSegment should extend horizontals', () => {
    const horizontalLine: [Point, Point] = [
        { x: 14, y: 0 },
        { x: 18, y: 0 },
    ]
    const extendedLineByZero = extendLineSegment(horizontalLine, 0);
    expect(extendedLineByZero).toEqual(horizontalLine)
    const extendedLineByOne = extendLineSegment(horizontalLine, 1);
    expect(extendedLineByOne).toEqual([
        { x: 10, y: 0 },
        { x: 22, y: 0 },
    ])
    const extendedLineByHalf = extendLineSegment(horizontalLine, .5);
    expect(extendedLineByHalf).toEqual([
        { x: 12, y: 0 },
        { x: 20, y: 0 },
    ])
})

test('extendLineSegment should extend veticals', () => {
    const verticalLine: [Point, Point] = [
        { y: 14, x: 0 },
        { y: 18, x: 0 },
    ]
    const extendedLineByZero = extendLineSegment(verticalLine, 0);
    expect(extendedLineByZero).toEqual(verticalLine)
    const extendedLineByOne = extendLineSegment(verticalLine, 1);
    expect(extendedLineByOne).toEqual([
        { y: 10, x: 0 },
        { y: 22, x: 0 },
    ])
    const extendedLineByHalf = extendLineSegment(verticalLine, .5);
    expect(extendedLineByHalf).toEqual([
        { y: 12, x: 0 },
        { y: 20, x: 0 },
    ])
})