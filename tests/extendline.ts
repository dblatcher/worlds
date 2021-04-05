
import {extendLineSegment, Point} from '../src/geometry'


export default function extendLineSegmentTest () {
    console.log(extendLineSegment)

    const line:[Point, Point] = [
        {x:5, y:0},
        {x:0, y:10},
    ]

    const extendedLine = extendLineSegment(line,1);
    console.log({line,extendedLine})
}