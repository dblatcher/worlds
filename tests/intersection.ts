import * as G from '../src/geometry'


function intersectionTest() {

    const l1:[G.Point, G.Point] = [
        {x:0,y:50},
        {x:100, y:60},
    ]

    const l2:[G.Point, G.Point] = [
        {x:10,y:0},
        {x:20, y:100},
    ]

    console.log('INTERSECTIONS')
    console.log({l1,l2})
    console.log (G.findIntersectionPointOfLineSegments(l1,l2) )
}


export default intersectionTest