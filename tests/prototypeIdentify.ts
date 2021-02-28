import { Thing } from "../src";


export default function propotypeTest() {

    const testThing = new Thing({x:100,y:100})
    
    const proto = Object.getPrototypeOf(testThing)
    
    console.log ({
        testThing,
        proto,
        Thing,
    })

    console.log( proto.constructor == Thing)
}