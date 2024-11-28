// Github : https://github.com/openmarmot/mars_lander

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');

// Load lander images
const landerImage = new Image();
landerImage.src = 'images/lander.png';
const landerThruster = new Image();
landerThruster.src = 'images/landerThruster.png'

// Load background image. 
const backgroundImage = new Image();
backgroundImage.src = 'images/background.png';

// minimum distance where gravity starts affecting the ship
const gravityDistance=300
const gravity=40

const xBounds=[0,400]

// Game objects
let lander = {};

let ground = {
    y: canvas.height - 10,
    height: 10
};

// Game state
let gameOver = false;
let crashed=false;
let crash_message=''
let lastTime = 0; // To keep track of the last update time

function resetGame() {
    lander = {
        x: canvas.width / 2 - 25,
        y: 50,
        width: 50,
        height: 50,
        speedX: -10,
        speedY: 0,
        rotation: 1.5, //radians. start ~ horizontal
        rotationSpeed: Math.PI / 2,
        thrust: 90,  // Now this is speed per second
        fuel: 1000,
        fuelConsumption: 100,
        isThrusting: false
    };
    gameOver = false;
    crashed = false;
    lastTime = 0;
    keys={};
    restartButton.style.display = 'none';
}

function drawLander() {
    ctx.save();
    ctx.translate(lander.x + lander.width / 2, lander.y + lander.height / 2);
    ctx.rotate(lander.rotation);
    if (lander.isThrusting) {
        ctx.drawImage(landerThruster, -lander.width / 2, -lander.height / 2, lander.width, lander.height);
    } else {
        ctx.drawImage(landerImage, -lander.width / 2, -lander.height / 2, lander.width, lander.height);
    }
    ctx.restore();
}

function drawGround() {
    // for now skip this. it looks better without it
    //ctx.fillStyle = 'grey';
    //ctx.fillRect(0, ground.y, canvas.width, ground.height);
}

function radiansToDegreesNormalized(radians) {
    // Convert radians to degrees
    let degrees = radians * (180 / Math.PI);
    
    // Normalize the angle to be between 0 and 360
    degrees = degrees % 360;
    if (degrees < 0) {
        degrees += 360;  // Handle negative angles by adding 360
    }
    
    return degrees;
}

function update(currentTime) {
    if (!gameOver) {
        if (lastTime === 0) lastTime = currentTime;  // First frame
        let deltaTime = (currentTime - lastTime) / 1000;  // Convert to seconds
        
        // Rotation based on 'a' and 'd' keys
        if (keys['d']) {
            lander.rotation += lander.rotationSpeed * deltaTime;
        }
        if (keys['a']) {
            lander.rotation -= lander.rotationSpeed * deltaTime;
        }

        lander.isThrusting = keys['w'] && lander.fuel > 0;
        if (lander.isThrusting) {
            // Thrust in the direction the lander is facing
            lander.speedX -= Math.sin(lander.rotation) * lander.thrust * deltaTime;
            lander.speedY -= Math.cos(lander.rotation) * lander.thrust * deltaTime;
            lander.fuel -= lander.fuelConsumption * deltaTime;
        }
        
        // Adjust speed based on deltaTime
        lander.x -= lander.speedX * deltaTime;
        lander.y += lander.speedY * deltaTime;

        if (lander.y>gravityDistance*0.5 && lander.y<gravityDistance){
            lander.speedY += (gravity*(lander.y/gravityDistance))*0.5 * deltaTime;
        }  
        else if (lander.y>=gravityDistance){
            lander.speedY += gravity* deltaTime;
        }


        // - check bounds - 
        if (lander.x>xBounds[1]){
            lander.x=xBounds[0]+5
        }
        // a little farther than zero so the ship exits the screen first
        if (lander.x<xBounds[0]-15){
            lander.x=xBounds[1]-5
        }
        // bounce off the .. firmament ?
        if (lander.y<0){
            lander.y=0
        }
        

        // Collision detection
        if (lander.y + lander.height >= ground.y) {
            gameOver=true
            if (lander.speedY > 20 || lander.speedX>10) { // Too fast for safe landing
                crashed = true;
                crash_message='Speed exceeded structural limits.'
            }
            angle=radiansToDegreesNormalized(lander.rotation)
            if (angle>5 && angle<355){
                crashed = true
                crash_message+=' Angle exceeded limits'
            }

            restartButton.style.display = 'block'; // Show restart button on game over
        }

        lastTime = currentTime;
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    
    drawGround();
    drawLander();
    ctx.fillStyle = 'white';
    let textY=20
    ctx.fillText(`Fuel: ${Math.round(lander.fuel)}`, 10, textY);
    ctx.fillText(`Altitude: ${-(Math.round(lander.y )-540)}`, 10, textY+=15);
    ctx.fillText(`Vertical Speed: ${Math.round(lander.speedY)}`, 10, textY+=15);
    ctx.fillText(`Horizontal Speed: ${Math.round(lander.speedX)}`, 10, textY+=15);
    ctx.fillText(`Angle: ${Math.round(radiansToDegreesNormalized(lander.rotation))}`, 10, textY+=15);
    //ctx.fillText(`radians: ${lander.rotation}`, 10, textY+=15);
    //ctx.fillText(`x: ${lander.x}`, 10, textY+=15);
    //ctx.fillText(`y: ${lander.y}`, 10, textY+=15);
    if (gameOver) {
        ctx.fillText(`You Landed !`, 10, textY+=30);

        if (crashed) {
            ctx.fillText(`.. poorly`, 10, textY+=15);
            ctx.fillText(crash_message, 10, textY+=15);
        }
    }
}

// Game loop using requestAnimationFrame for smoother animation
function gameLoop(currentTime) {
    update(currentTime);
    render();
    if (!gameOver) requestAnimationFrame(gameLoop);
}

// Keyboard controls
let keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

restartButton.addEventListener('click', () => {
    resetGame();
    requestAnimationFrame(gameLoop); // Restart the game loop
});

resetGame()
requestAnimationFrame(gameLoop);