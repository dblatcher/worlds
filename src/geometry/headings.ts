import { _90deg, _360deg, _extreme } from './definitions';

/**
 * change a number representing a heading to a value between 0 an 2PI
 * @param heading 
 */
 function normaliseHeading(heading: number) {
    if (heading > _360deg) { return heading % _360deg }
    if (heading < _360deg) { heading = heading % _360deg }
    if (heading < 0) { heading = heading + _360deg }
    return heading
}

function reverseHeading(heading: number) {
    let result = heading + Math.PI;
    if (result > Math.PI * 2) { result -= Math.PI * 2 }
    return result;
};

function reflectHeading(heading: number, wallAngle: number) {
    let reflect = 2 * wallAngle - heading;
    if (reflect < (Math.PI) * 0) { reflect += (Math.PI) * 2 };
    if (reflect > (Math.PI) * 2) { reflect -= (Math.PI) * 2 };
    if (reflect === heading) { reflect = reverseHeading(reflect) }
    return reflect;
}


export {normaliseHeading, reverseHeading, reflectHeading}