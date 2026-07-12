import index from './index.html';
import demo from './demo.html';
import demo2 from './demo2.html';
import demo3 from './demo3.html';
import demo4 from './demo4.html';
import imageDemo from './imageDemo.html';

const server = Bun.serve({
    port: 3000,
    routes: {
        "/": index,
        "/demo": demo,
        "/demo2": demo2,
        "/demo3": demo3,
        "/demo4": demo4,
        "/imageDemo": imageDemo,
    }
});

console.log(`Listening on ${server.url}`);