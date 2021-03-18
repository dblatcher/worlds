import { Body } from "../src";


export default function propotypeTest() {

    const testThing = new Body({x:100,y:100})
    
    const proto = Object.getPrototypeOf(testThing)
    
    console.log ({
        testThing,
        proto,
        Body,
    })

    console.log( proto.constructor == Body)
}