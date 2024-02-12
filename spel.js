let starsX = [];
let starsY = [];
let gravity = 0.1;
let gameStarted = false;
let userName = "";
let score = 0;
let highscore = 0;
let thrust = 0.2;
let particles = [];

let spaceship = {
  position: {
    x: 0,
    y: 0,
  },
  angle: 0,
  velocity: {
    x: 0,
    y: 0,
  },
  engineOn: false,
  rotatingLeft: false,
  rotatingRight: false,
};

function setup() {
  createCanvas(600, 600);
  for (let i = 0; i < 100; i++) {
    starsX.push(random(0, width));
    starsY.push(random(0, height));
  }
  rect(0, 550, 600, 50);
}

function createParticles(x, y, direction) {
  const velocity = 0.8 + Math.random() * 2;
  const maxLife = 100 + Math.floor(Math.random() * 100);
  let angle = 0;
  if (direction === "left") {
    angle = Math.PI * 1.5 + Math.random() * Math.PI * 0.5;
  } else if (direction === "right") {
    angle = Math.PI * 0.5 + Math.random() * Math.PI * 0.5;
  } else {
    angle =
      spaceship.angle +
      0.5 * Math.PI +
      (Math.random() * Math.PI) / 4 -
      Math.PI / 8;
  }
  return {
    x: x,
    y: y,
    velocity: velocity,
    maxLife: maxLife,
    life: 0,
    angle: angle,
    // Opacity?
  };
}

function updateParticle(particle) {
  particle.x = particle.x + Math.cos(particle.angle) * particle.velocity;
  particle.y = particle.y + Math.sin(particle.angle) * particle.velocity;
  particle.life++;

  if (particle.life > particle.maxLife) {
    particles.splice(particles.indexOf(particle), 1);
  }
}

function drawParticle(particle) {
  push();
  translate(particle.x, particle.y);
  noStroke();
  fill(255, 255, 255, 40);
  ellipse(0, 0, 6);
  pop();
}

function drawStars(x, y) {
  // TODO implement stars movig with ship?
  for (let i = 0; i < starsX.length; i++) {
    stroke(255);
    point(starsX[i], starsY[i]);
  }
}

function drawRocket() {
  push(); // Save the current transformation matrix
  translate(spaceship.position.x + 25, spaceship.position.y + 45); // Move the origin to the center of the rocket
  rotate(spaceship.angle); // Rotate the rocket
  rect(-25, -45, 50, 90); // Draw the rocket centered at the new origin
  pop(); // Restore the transformation matrix
}

function calculatePhysics() {
  //Default value for animation status
  spaceship.rotatingLeft = false;
  spaceship.rotatingRight = false;
  spaceship.engineOn = false;

  // Move the spaceship from velocity
  spaceship.position.x += spaceship.velocity.x;
  spaceship.position.y += spaceship.velocity.y;

  // If W is pressed turn on the engine and increase the velocity
  if (keyIsDown(87)) {
    spaceship.engineOn = true;

    // Increase the velocity when the up arrow key is pressed
    spaceship.velocity.x -= thrust * Math.sin(-spaceship.angle);
    spaceship.velocity.y -= thrust * Math.cos(spaceship.angle);
  }

  // Apply gravity
  spaceship.velocity.y += gravity;

  // If A or D is pressed rotate the spaceship and start the animation
  if (keyIsDown(65)) {
    spaceship.rotatingLeft = true;
    spaceship.angle -= 0.1;
  } else if (keyIsDown(68)) {
    spaceship.rotatingRight = true;
    spaceship.angle += 0.1;
  }

  if (spaceship.position.y > 460) {
    spaceship.position.y = 460;
    gameStarted = false;
  }

  if (spaceship.position.y > 100 && spaceship.engineOn) {
    for (let i = 0; i < 20; i++) {
      particles.push(
        createParticles(
          spaceship.position.x + 25,
          spaceship.position.y + 90,
          "none"
        )
      );
    }
  }
}

function drawMenu() {
  fill(255);
  textSize(32);
  text("Highscore: " + highscore, 10, 40);
  text("Name: " + userName, 10, 80);
  if (userName.length > 0) {
    text("Press Enter to start", 10, 120);
  }
  if (score > 0) {
    text("Last score: " + score, 10, 160);
  }
}

function draw() {
  clear();
  background(0);
  rect(0, 550, 600, 50);
  drawStars(100, 100);
  if (gameStarted) {
    calculatePhysics();
    drawRocket();
  } else {
    drawMenu();
  }
  for (let particle of particles) {
    updateParticle(particle);
    drawParticle(particle);
  }
}

function keyPressed() {
  if (!gameStarted) {
    if (key.length === 1) {
      userName += key;
    } else if (key === "Backspace") {
      userName = userName.slice(0, -1);
    } else if (key === "Enter" && userName.length > 0) {
      gameStarted = true;
      score = 0;
      spaceship.position.x = 300;
      spaceship.position.y = 0;
      spaceship.velocity.x = 0;
      spaceship.velocity.y = 0;
      spaceship.angle = 0;
    }
  }
}
