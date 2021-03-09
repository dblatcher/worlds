import { normaliseHeading } from "../src/geometry"

export default function headingTest() {
    const headings = [1,2,Math.PI/4,10,15,0,-1,-Math.PI/3]

    function toDegrees(rads:number) {return rads * (180 / Math.PI)} 
    
    console.log("****HEADING TEST***")
    headings.forEach(heading => {
        console.log(` ${heading} rads (${toDegrees(heading)} degrees) == ${normaliseHeading(heading)} rads (${toDegrees(normaliseHeading(heading))} degrees)`)
    })
}