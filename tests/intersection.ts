import * as G from '../src/geometry'


function intersectionTest() {

    const l1:[G.Point, G.Point] = [
        {x:10,y:0},
        {x:10, y:50},
    ]

    const l2:[G.Point, G.Point] = [
        {x:0,y:0},
        {x:20, y:40},
    ]

    console.log('INTERSECTIONS')
    console.log({l1,l2})
    console.log (G.findIntersectionPointOfLineSegments(l1,l2) )


    const l3:[G.Point, G.Point] = [
        {x:0,y:0},
        {x:10, y:10},
    ]
    const l4:[G.Point, G.Point] = [
        {x:5,y:5},
        {x:20, y:20},
    ]

    console.log('INTERSECTIONS')
    console.log({l3,l4})
    console.log (G.findIntersectionPointOfLineSegments(l3,l4) )
}


export default intersectionTest