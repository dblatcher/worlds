interface Point { x: number, y: number }
interface Circle { x: number, y: number, radius: number }
interface Vector { x: number, y: number }
interface Wedge { x: number, y: number, radius: number, heading: number, angle: number }


const _extreme = 10 ** 30
const _90deg = Math.PI * .5
const _360deg = Math.PI * 2
const originPoint: Point = { x: 0, y: 0 }


export {
    Point, Circle, Vector, Wedge,
    _90deg, _360deg, _extreme, originPoint
}