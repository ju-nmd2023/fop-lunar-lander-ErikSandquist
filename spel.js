let starsX = [];
let starsY = [];
let gravity = 0.05;
let gameState = 0;
// Menu = 0, Game = 1, Game over = 2
let userName = "";
let score = 0;
let highscore = 0;
let thrust = 0.15;
let particles = [];
let ground = 550;
let win = false;

let spaceship = {
  size: {
    width: 50,
    height: 90,
  },
  position: {
    x: 0,
    y: 0,
  },
  angle: 0,
  velocity: {
    x: 0,
    y: 0,
  },
  engine: {
    on: false,
    duration: 0,
  },
  rotatingLeft: false, // TODO implement rotating visuals
  rotatingRight: false, // TODO implement rotating visuals
};

function preload() {
  img = loadImage("images/rocket.png");
  wKey = loadImage("images/letter_w.png");
  aKey = loadImage("images/letter_a.png");
  dKey = loadImage("images/letter_d.png");
}

function setup() {
  highscore = localStorage.getItem("highscore") || 0;
  createCanvas(1280, 600);
  frameRate(60);
  for (let i = 0; i < 100; i++) {
    starsX.push(random(0, width));
    starsY.push(random(0, height));
  }
  rect(0, ground, 1280, 50);
  spaceship.position.x = 640;
  spaceship.position.y = 10;
}

function createParticles(direction) {
  const velocity = 4 + Math.random() * 2;
  const maxLife = 30 + Math.floor(Math.random() * 10);
  let angle;

  // This is annoying as f, but we calculate the bottom middle of the spaceship when rotated so the particles line up
  let x =
    spaceship.position.x + // Spaceship x from top left
    Math.random() + // Add some random so it doesnt look like it comes out as a circle
    spaceship.size.width / 2 + // Spaceship x middle
    (Math.sin(-spaceship.angle) * (spaceship.size.height - 30)) / 2; // Calculate from the rotation real x position
  let y =
    spaceship.position.y + // Spaceship y from top left
    spaceship.size.height / 2 + // Spaceship y middle
    (Math.cos(-spaceship.angle) * (spaceship.size.height - 30)) / 2; // Calculate from the rotation real y position

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
    opacity: 255,
  };
}

function updateParticle(particle) {
  // This took a while but when particle hits the ground (550) it should bounce off and change direction
  if (particle.y > ground) {
    particle.y = ground - Math.random() * 2;

    particle.angle = particle.angle % Math.PI;
    particle.angle =
      particle.angle < 0 ? particle.angle + Math.PI : particle.angle; // Make sure angle is positive, math.abs doesnt work because the angle is pi - angle

    // Bounce right or left
    if (particle.angle > Math.PI / 2 && particle.angle < Math.PI) {
      particle.angle = particle.angle + Math.PI / 2;
    } else if (particle.angle < Math.PI / 2 && particle.angle > 0) {
      particle.angle = particle.angle - Math.PI / 2;
    }
  }

  particle.x = particle.x + Math.cos(particle.angle) * particle.velocity;
  particle.y = particle.y + Math.sin(particle.angle) * particle.velocity;
  particle.life++;

  // Fade out the particle over time
  particle.opacity -= 255 / particle.maxLife;

  if (particle.life > particle.maxLife) {
    particles.splice(particles.indexOf(particle), 1);
  }
}

function drawParticle(particle) {
  push();
  translate(particle.x, particle.y);
  noStroke();
  fill(255, 255, 255, particle.opacity);
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
  translate(
    spaceship.position.x + spaceship.size.width / 2,
    spaceship.position.y + spaceship.size.height / 2
  ); // Move the origin to the center of the rocket

  rotate(spaceship.angle); // Rotate the rocket

  image(
    img,
    -spaceship.size.width / 2,
    -spaceship.size.height / 2,
    spaceship.size.width,
    spaceship.size.height
  ); // Draw the rocket centered at the new origin

  pop(); // Restore the transformation matrix
}

function drawMenu() {
  fill(255);
  textSize(32);
  background(0, 0, 0, 200);
  textAlign(CENTER, TOP);
  text("Highscore: " + highscore, 640, 40);
  text("Name: " + userName, 640, 80);
  textSize(24);
  text("Use WAD to control your rocket", 640, 280);
  image(wKey, 640 - 25, 320, 50, 50);
  image(aKey, 640 - 75, 370, 50, 50);
  image(dKey, 640 + 25, 370, 50, 50);

  let infoText = "Enter your name";
  if (userName.length > 0) {
    infoText = "Press Enter to start";
  }
  text(infoText, 640, 120);

  textSize(24);
  text("Get 400 points to win!", 640, 430);
}

function drawGameOver() {
  fill(255);
  background(0, 0, 0, 200);
  textSize(64);
  if (win) {
    text("You win!", 640, 40);
  } else {
    text("You lose!", 640, 40);
  }
  textSize(32);
  text("Score: " + score, 640, 120);
  text("Highscore: " + highscore, 640, 160);
  text("Press Enter to restart", 640, 200);
}

function gameEngine() {
  //Default value for animation status
  spaceship.rotatingLeft = false;
  spaceship.rotatingRight = false;
  spaceship.engine.on = false;

  // Move the spaceship from velocity
  spaceship.position.x += spaceship.velocity.x;
  spaceship.position.y += spaceship.velocity.y;

  // If W is pressed turn on the engine and increase the velocity
  if (keyIsDown(87)) {
    spaceship.engine.on = true;

    // Increase the velocity when the up arrow key is pressed
    spaceship.velocity.x -= thrust * Math.sin(-spaceship.angle);
    spaceship.velocity.y -= thrust * Math.cos(spaceship.angle);
  }

  // Apply gravity
  spaceship.velocity.y += gravity;

  // If A or D is pressed rotate the spaceship and start the animation
  if (keyIsDown(65)) {
    spaceship.rotatingLeft = true;
    spaceship.angle -= 0.05;
  } else if (keyIsDown(68)) {
    spaceship.rotatingRight = true;
    spaceship.angle += 0.05;
  }

  if (spaceship.engine.on) {
    spaceship.engine.duration =
      spaceship.engine.duration < 0 ? 0 : spaceship.engine.duration;
    spaceship.engine.duration =
      spaceship.engine.duration > 180 ? 180 : spaceship.engine.duration;
    spaceship.engine.duration++;
    for (let i = 0; i < spaceship.engine.duration / 4; i++) {
      particles.push(
        createParticles(
          spaceship.position.x + 25,
          spaceship.position.y + 90,
          "none"
        )
      );
    }
  } else {
    spaceship.engine.duration -= 10;
  }

  // TODO implement check when angled with cos, sin and stuff, probably going to be painful
  if (spaceship.position.y > 460) {
    spaceship.position.y = 460;
    gameState = 2;

    angleInDegrees = spaceship.angle * (180 / Math.PI);

    // The following 6 lines was written by ChatGpt, it converts the angle to a value between -180 and 180
    while (angleInDegrees > 180) {
      angleInDegrees -= 360;
    }
    while (angleInDegrees < -180) {
      angleInDegrees += 360;
    }

    score =
      500 -
      Math.abs(Math.floor(spaceship.velocity.x * 100)) -
      Math.abs(Math.floor(spaceship.velocity.y * 100)) -
      Math.abs(Math.floor((angleInDegrees % 360) * 0.5));

    score = score < 0 ? 0 : score;

    win = score < 400 ? false : true;

    if (score > highscore) {
      highscore = score;
      // save highscore to cookie/localstorage
      localStorage.setItem("highscore", highscore);
    }
  }
}

function keyPressed() {
  switch (gameState) {
    case 0:
      if (key.length === 1) {
        userName += key;
      } else if (key === "Backspace") {
        userName = userName.slice(0, -1);
      } else if (key === "Enter" && userName.length > 0) {
        resetGame();
        gameState = 1;
      }
      break;

    case 2:
      if (key === "Enter") {
        resetGame();
        gameState = 1;
      } else if (key === "Escape") {
        gameState = 0;
      }
      break;

    default:
      break;
  }
}

function draw() {
  clear();
  background(0);
  drawStars(100, 100);

  switch (gameState) {
    case 0:
      drawMenu();
      break;

    case 1:
      gameEngine();
      for (let particle of particles) {
        updateParticle(particle);
        drawParticle(particle);
      }
      drawRocket();
      break;

    case 2:
      drawGameOver();
      break;
  }

  rect(0, ground, 1280, 50);
}

function resetGame() {
  win = false;
  gameState = 1;
  score = 0;
  particles = [];
  spaceship.position.x = 640;
  spaceship.position.y = 0;
  spaceship.velocity.x = Math.random() * 4;
  spaceship.velocity.y = -Math.random() * 2;
  spaceship.angle = Math.random() * Math.PI + Math.PI / 2 - Math.PI / 4;
}
