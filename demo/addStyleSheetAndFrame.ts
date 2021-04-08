const styleSheet = document.createElement('style')
styleSheet.textContent = `

body {
    margin:0;
}

.frame {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    margin: 0;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

canvas {
    border: 20px outset gray;
    box-sizing: border-box;
    max-height: inherit;
}
`
document.head.appendChild(styleSheet)
const frame = document.createElement('div')
frame.classList.add('frame')
document.body.appendChild(frame);