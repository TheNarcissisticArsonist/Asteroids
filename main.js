var newGame = document.getElementById("new");
var levelDisp = document.getElementById("currentLevel");
var levelCont = document.getElementById("level");
var scoreDisp = document.getElementById("currentScore");
var scoreCont = document.getElementById("score");
var livesDisp = document.getElementById("lives");
var gameBoard = document.getElementById("gameBoard");
var score;
var level;
var lives;

var maxLives = 3;
var levelAsteroids = 3;
var maxAsteroidVelocity = 2;

var spaceship = {
  pos: [0, 0],
  vel: [0, 0],
  acl: [0, 0],
  velM: 0,
  aclM: 0,
  angle: 0
};
function asteroid(size, pos, vel, acl) {
  this.size = size;
  this.pos = pos;
  this.vel = vel;
  this.acl = acl;
  this.velM = Math.sqrt(Math.pow(vel[0], 2) + Math.pow(vel[1], 2));
  this.aclM = Math.sqrt(Math.pow(acl[0], 2) + Math.pow(acl[1], 2));
  this.angle = Math.floor(Math.random() * 360);
}
var asteroids = [];

function setUpLevelHTML(numAsteroids) {
  htmlString = "<img class=\"gameObject\" id=\"ship\" src=\"Spaceship.png\"></img>"
  for(i=0; i<numAsteroids; ++i) {
    htmlString += "<img class=\"gameObject bigAsteroid\" id=\"bigAsteroid"+i+"\"src=\"Asteroid.png\"></img>";
  }
  return htmlString;
}
function updateUserDisplay() {
  levelDisp.innerHTML = String(level);
  scoreDisp.innerHTML = String(score);
  livesDisp.innerHTML = "";
  for(i=0; i<lives; ++i) {
    livesDisp.innerHTML += "<img src=\"Spaceship.png\"></img>";
  }
}
function updateGameBoard() {
  for(i=0; i<asteroids.length; ++i) {
    asteroids[i][1].style.left = String(asteroids[i][0].pos[0]) + "px";
    asteroids[i][1].style.top = String(asteroids[i][0].pos[1]) + "px";
  }
  spaceship[1].style.left = String(spaceship[0].pos[0]) + "px";
  spaceship[1].style.top = String(spaceship[0].pos[1]) + "px";
}
function generateGameObjects() {
  for(i=0; i<levelAsteroids; ++i) {
    asteroids[i] = new asteroid(3, [0, 0], [0, 0], [0, 0]);
    asteroids[i] = [asteroids[i], document.getElementById("bigAsteroid"+i)];
  }
  spaceship = [spaceship, document.getElementById("ship")];
}
function startingStateObjects() {
  asteroidsRandomPosition();
  asteroidsRandomVelocity();
  updateMagnitude();
  spaceship[0].pos = [600, 300];
}
function asteroidsRandomPosition() {
  for(i=0; i<levelAsteroids; ++i) {
    do {
      asteroids[i][0].pos[0] = Math.floor(Math.random() * 1200 + 1);
      asteroids[i][0].pos[1] = Math.floor(Math.random() * 600 + 1);
    }
    while(
      !(
        (asteroids[i][0].pos[0] > 800 || asteroids[i][0].pos[0] < 400)
        &&
        (asteroids[i][0].pos[0] < (1200-50) && asteroids[i][0].pos[0] > (0+50))
        &&
        (asteroids[i][0].pos[1] > 500 || asteroids[i][0].pos[1] < 100)
        &&
        (asteroids[i][0].pos[1] < (600-50) && asteroids[i][0].pos[1] > (0+50))
      )
    );
  }
}
function asteroidsRandomVelocity() {
  for(i=0; i<levelAsteroids; ++i) {
    asteroids[i][0].vel[0] = Math.random() * maxAsteroidVelocity;
    asteroids[i][0].vel[1] = Math.sqrt(Math.pow(maxAsteroidVelocity, 2) - Math.pow(asteroids[i][0].vel[0], 2));
    constant = Math.random();
    asteroids[i][0].vel[0] *= constant;
    asteroids[i][0].vel[1] *= constant;
  }
}
function updateMagnitude() {
  for(i=0; i<asteroids.length; ++i) {
    asteroids[i][0].velM = Math.sqrt(Math.pow(asteroids[i][0].vel[0], 2) + Math.pow(asteroids[i][0].vel[1], 2));
    asteroids[i][0].aclM = Math.sqrt(Math.pow(asteroids[i][0].acl[0], 2) + Math.pow(asteroids[i][0].acl[1], 2));
  }
  spaceship[0].velM = Math.sqrt(Math.pow(spaceship[0].vel[0], 2) + Math.pow(spaceship[0].vel[1], 2));
  spaceship[0].aclM = Math.sqrt(Math.pow(spaceship[0].acl[0], 2) + Math.pow(spaceship[0].acl[1], 2));
}

newGame.addEventListener("click", function() {
  levelCont.style.display = "inline-block";
  scoreCont.style.display = "inline-block";
  gameBoard.style.display = "inline-block";

  score = 0;
  level = 1;
  lives = maxLives;

  gameBoard.innerHTML = setUpLevelHTML(levelAsteroids);
  generateGameObjects();
  startingStateObjects();

  updateUserDisplay();
  updateGameBoard();
});
