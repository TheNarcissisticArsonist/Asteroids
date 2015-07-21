var newGame = document.getElementById("new");
var levelDisp = document.getElementById("currentLevel");
var levelCont = document.getElementById("level");
var scoreDisp = document.getElementById("currentScore");
var scoreCont = document.getElementById("score");
var livesDisp = document.getElementById("lives");
var gameBoard = document.getElementById("gameBoard");
var infoCont = document.getElementById("spaceshipInfo");
var alertBox;
var score;
var level;
var lives;

var inTimeoutSequence = false;
var firstGame = true;

var maxLives = 3;
var levelAsteroids = 3;
var maxAsteroidVelocity = 4;
var minAsteroidVelocity = 1.5;
var spaceshipAcceleration = 0.4;
var spaceshipRotationSpeed = 5;

var hitboxAngles = [toPolar(0, 32).a, toPolar(32, -27).a, toPolar(-27, -27).a];

var spaceship = {};
function asteroid(size, pos, vel, acl) {
  this.size = size;
  switch(size) {
    case 3:
      this.width = 50;
      this.height = 50;
      radius = 25;
      break;
    case 2:
      this.width = 25;
      this.height = 25;
      radius = 12.5;
      break;
    case 1:
      this.width = 10;
      this.height = 10;
      radius = 5;
  }
  this.pos = pos;
  this.vel = vel;
  this.acl = acl;
  this.velM = Math.sqrt(Math.pow(vel[0], 2) + Math.pow(vel[1], 2));
  this.aclM = Math.sqrt(Math.pow(acl[0], 2) + Math.pow(acl[1], 2));
  this.angle = Math.floor(Math.random() * 360);
  center = new point(pos[0], pos[1]);
  this.hitbox = new circle(center, radius);
}
var asteroids = [];
function point(x, y) {
  this.x = x;
  this.y = y;
}
function line(point1, point2) {
  this.point1 = point1;
  this.point2 = point2;
}
function circle(center, radius) {
  this.center = center;
  this.radius = radius;
}
function polygon(points) {
  this.numSides = points.length;
  this.points = [];
  for(i=0; i<points.length; ++i) {
    this.points[i] = points[i];
  }
  this.lines = [];
  for(i=0; i<points.length - 1; ++i) {
    this.lines[i] = new line(points[i], points[i+1]);
  }
  this.lines.push(new line(points[points.length-1], points[0]));
}
function polarPoint(r, a) {
  this.r = r;
  this.a = a;
}
//The units used in these geometric objects are pixels

keys = {
  w: false,
  a: false,
  d: false
};

function setUpLevelHTML(numAsteroids) {
  htmlString = "<img class=\"gameObject\" id=\"ship\" src=\"Spaceship.png\" style=\"display: none;\"></img>"
  for(i=0; i<numAsteroids; ++i) {
    htmlString += "<img class=\"gameObject bigAsteroid\" id=\"bigAsteroid"+i+"\"src=\"Asteroid.png\" style=\"display: none;\"></img>";
  }
  htmlString += "<div id=\"alertBox\" style=\"display: none;\">Alert Box</div>"
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
    asteroids[i][1].style.left = String(asteroids[i][0].pos[0]-(asteroids[i][0].width/2)) + "px";
    asteroids[i][1].style.top = String(600-asteroids[i][0].pos[1]-(asteroids[i][0].width/2)) + "px";
    asteroids[i][1].style.display = "inline-block";
  }
  spaceship[1].style.left = String(spaceship[0].pos[0]-32) + "px";
  spaceship[1].style.top = String(600-spaceship[0].pos[1]-32) + "px";
  spaceship[1].style.display = "inline-block";
}
function generateGameObjects() {
  for(i=0; i<levelAsteroids; ++i) {
    asteroids[i] = new asteroid(3, [0, 0], [0, 0], [0, 0]);
    asteroids[i] = [asteroids[i], document.getElementById("bigAsteroid"+i)];
  }
  spaceship = [spaceship, document.getElementById("ship")];
  p1 = new point(0, 32);
  p2 = new point(32, -27);
  p3 = new point(-32, -27);
  poly = new polygon([p1, p2, p3]);
  spaceship[0].hitbox = poly;
}
function startingStateObjects() {
  asteroidsRandomPosition();
  asteroidsRandomVelocity();
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
  for(j=0; j<levelAsteroids; ++j) {
    do {
      asteroids[j][0].vel[0] = Math.random() * maxAsteroidVelocity;
      asteroids[j][0].vel[1] = Math.sqrt(Math.pow(maxAsteroidVelocity, 2) - Math.pow(asteroids[j][0].vel[0], 2));
      constant = Math.random();
      asteroids[j][0].vel[0] *= constant;
      asteroids[j][0].vel[1] *= constant;
      updateMagnitude();
    }
    while(asteroids[j][0].velM < minAsteroidVelocity);
  }
}
function updateMagnitude() {
  for(k=0; k<asteroids.length; ++k) {
    asteroids[k][0].velM = Math.sqrt(Math.pow(asteroids[k][0].vel[0], 2) + Math.pow(asteroids[k][0].vel[1], 2));
    asteroids[k][0].aclM = Math.sqrt(Math.pow(asteroids[k][0].acl[0], 2) + Math.pow(asteroids[k][0].acl[1], 2));
  }
  spaceship[0].velM = Math.sqrt(Math.pow(spaceship[0].vel[0], 2) + Math.pow(spaceship[0].vel[1], 2));
  spaceship[0].aclM = Math.sqrt(Math.pow(spaceship[0].acl[0], 2) + Math.pow(spaceship[0].acl[1], 2));
}
function levelIntro(levelNum) {
  alertBox.innerHTML = "Level " + String(levelNum);
  alertBox.style.display = "inline-block"
  inTimeoutSequence = true;
  window.setTimeout(function() {
    alertBox.innerHTML = "";
    alertBox.style.display = "none";
    window.setTimeout(function() {
      alertBox.innerHTML = "Get ready...";
      alertBox.style.display = "inline-block";
      window.setTimeout(function() {
        alertBox.innerHTML = "";
        alertBox.style.display = "none";
        window.setTimeout(function() {
          alertBox.innerHTML = "Go!";
          alertBox.style.display = "inline-block";
          updateUserDisplay();
          updateGameBoard();
          inTimeoutSequence = false;
          mainLoop = window.setInterval(physicsLoop, 33);
          window.setTimeout(function() {
            alertBox.innerHTML = "";
            alertBox.style.display = "none";
          }, 750);
        }, 750);
      }, 750);
    }, 750);
  }, 750);
}
function updateComponents() {
  for(k=0; k<asteroids.length; ++k) {
    asteroids[k][0].acl[0] = -1 * asteroids[k][0].aclM * Math.sin(asteroids[k][0].angle * Math.PI / 180);
    asteroids[k][0].acl[1] = asteroids[k][0].aclM * Math.cos(asteroids[k][0].angle * Math.PI / 180);
  }
  spaceship[0].acl[0] = spaceship[0].aclM * Math.sin(spaceship[0].angle * Math.PI / 180);
  spaceship[0].acl[1] = spaceship[0].aclM * Math.cos(spaceship[0].angle * Math.PI / 180);
}
function updateData() {
  document.getElementById("pos").innerHTML = "pos:" + spaceship[0].pos;
  document.getElementById("vel").innerHTML = "vel:" + spaceship[0].vel;
  document.getElementById("acl").innerHTML = "acl:" + spaceship[0].acl;
  document.getElementById("velM").innerHTML = "velM:" + spaceship[0].velM;
  document.getElementById("aclM").innerHTML = "aclM:" + spaceship[0].aclM;
  document.getElementById("angle").innerHTML = "angle:" + spaceship[0].angle;
}
function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}
function lineLineCollision(line1, line2) {
  if(
        (((line2.point1.x >= line1.point1.x) && (line2.point2.x <= line1.point2.x))
      ||
        ((line2.point1.x <= line1.point1.x) && (line2.point2.x >= line1.point2.x)))
    &&
        (((line2.point1.y >= line1.point1.y) && (line2.point2.y <= line1.point2.y))
      ||
        ((line2.point1.y <= line1.point1.y) && (line2.point2.y >= line1.point2.y)))
    ) {
      return true;
    }
    else {
      return false;
    }
}
function lineCircleCollision(testLine, testCircle) {
  mtestLine = (testLine.point2.y-testLine.point1.y)/(testLine.point2.x-testLine.point1.x);
  mDiameter1 = -1/mtestLine;

  if(!(mtestLine == 0 || mDiameter1 == 0)) {
    b = Math.sqrt((Math.pow(testCircle.radius, 2)) / (Math.pow(mDiameter1, 2)+1));
    a = b * mDiameter1;
  }
  else {
    if(mtestLine == 0) {
      a = 0;
      b = mDiameter1;
    }
    else if(mDiameter1 == 0) {
      a = mDiameter1;
      b = 0;
    }
  }

  p1 = new point(testCircle.center.x-b, testCircle.center.y-a);
  p2 = new point(testCircle.center.x+b, testCircle.center.y+a);
  p3 = new point(testCircle.center.x-b, testCircle.center.y+a);
  p4 = new point(testCircle.center.x+b, testCircle.center.y-a);
  diameter1 = new line(p1, p2);
  diameter2 = new line(p3, p4);
  if(lineLineCollision(testLine, diameter1) || lineLineCollision(testLine, diameter2)) {
    return true;
  }
  else {
    return false;
  }
}
function pointFromAngleAndMagnitude(angle, magnitude) {//angle in degrees
  return new point(magnitude * Math.sin(angle * Math.PI / 180), magnitude * Math.cos(angle * Math.PI / 180))
}
function toPolar(x, y) {
  if(x>0) {
    return new polarPoint(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), Math.atan(y/x) * 180 / Math.PI);
  }
  else if(x<0) {
    return new polarPoint(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), 180 + (Math.atan(y/x) * 180 / Math.PI));
  }
  else if(y != 0) {
    return new polarPoint(y, 0);
  }
  else {
    return new polarPoint(0, 0);
  }
}

newGame.addEventListener("click", function() {
  if(inTimeoutSequence) {
    return;
  }
  startNewGame();
});
function startNewGame() {
  if(!firstGame) {
    window.clearInterval(mainLoop);
  }
  firstGame = false;

  levelCont.style.display = "inline-block";
  scoreCont.style.display = "inline-block";
  gameBoard.style.display = "inline-block";

  spaceship = {
    pos: [0, 0],
    vel: [0, 0],
    acl: [0, 0],
    velM: 0,
    aclM: 0,
    angle: 0
  };

  score = 0;
  level = 1;
  lives = maxLives;

  gameBoard.innerHTML = setUpLevelHTML(levelAsteroids);
  generateGameObjects();
  startingStateObjects();

  /* Make hitbox
   * p1 0, 32
   * p2 32, -27
   * p3 -32, -27
   */

  alertBox = document.getElementById("alertBox");

  levelIntro(1);
};

document.addEventListener("keydown", function(event) {
  if(inTimeoutSequence) {
    return;
  }
  switch(event.which) {
    case 78: //n
      startNewGame();
      break;
    case 87: //w
      keys.w = true;
      break;
    case 65: //a
      keys.a = true;
      break;
    case 68: //d
      keys.d = true;
      break;
  }
});
document.addEventListener("keyup", function(event) {
  if(inTimeoutSequence) {
    return;
  }
  switch(event.which) {
    case 87: //w
      keys.w = false;
      break;
    case 65: //a
      keys.a = false;
      break;
    case 68: //d
      keys.d = false;
      break;
  }
});

function physicsLoop() {
  physicsLoopSpaceshipMovement();
  physicsLoopAsteroidMovement();
  //document.getElementById("colliding").innerHTML = testForCollisions();
  updateData();
}
function physicsLoopSpaceshipMovement() {
  //Acceleration
  if(keys.w) {
    spaceship[0].aclM = spaceshipAcceleration;
  }
  else{
    spaceship[0].aclM = 0;
  }
  updateComponents();
  //Velocity
  spaceship[0].vel[0] += spaceship[0].acl[0];
  spaceship[0].vel[1] += spaceship[0].acl[1];
  updateMagnitude();
  //Position
  spaceship[0].pos[0] += spaceship[0].vel[0];
  spaceship[0].pos[1] += spaceship[0].vel[1];
  //Test if off screen
  if(spaceship[0].pos[0] > 1200 - 32) {
    spaceship[0].pos[0] -= 1200 - 64;
  }
  else if(spaceship[0].pos[0] < 0  + 32) {
    spaceship[0].pos[0] += 1200 - 64;
  }
  if(spaceship[0].pos[1] > 600 - 32) {
    spaceship[0].pos[1] -= 600 - 64;
  }
  else if(spaceship[0].pos[1] < 0 + 32) {
    spaceship[0].pos[1] += 600 - 64;
  }
  //Display position
  spaceship[1].style.left = String(spaceship[0].pos[0]-32) + "px";
  spaceship[1].style.top = String(600-spaceship[0].pos[1]-32) + "px";
  //Rotation
  if(keys.a && !keys.d) {
    spaceship[0].angle -= spaceshipRotationSpeed;
  }
  else if(keys.d && !keys.a) {
    spaceship[0].angle += spaceshipRotationSpeed;
  }
  spaceship[1].style.transform = "rotate(" + spaceship[0].angle + "deg)";
}
function physicsLoopAsteroidMovement() {
  for(i=0; i<asteroids.length; ++i) {
    //Acceleration
    asteroids[i][0].aclM = 0;
    asteroids[i][0].acl[0] = 0;
    asteroids[i][0].acl[1] = 0;
    updateComponents();
    //Velocity
    asteroids[i][0].vel[0] += asteroids[i][0].acl[0];
    asteroids[i][0].vel[1] += asteroids[i][0].acl[1];
    updateMagnitude();
    //Position
    asteroids[i][0].pos[0] += asteroids[i][0].vel[0];
    asteroids[i][0].pos[1] += asteroids[i][0].vel[1];
    //Test if off screen
    if(asteroids[i][0].pos[0] > 1200 - 32) {
      asteroids[i][0].pos[0] -= 1200 - 64;
    }
    else if(asteroids[i][0] < 0 + 32) {
      asteroids[i][0].pos[0] += 1200 -64;
    }
    if(asteroids[i][0].pos[1] > 600 - 32) {
      asteroids[i][0].pos[1] -= 600 - 64;
    }
    else if(asteroids[i][0].pos[1] < 0 + 32) {
      asteroids[i][0].pos[1] += 600 - 64;
    }
    //Display Position
    asteroids[i][1].style.left = String(asteroids[i][0].pos[0] - (asteroids[i][0].width/2)) + "px";
    asteroids[i][1].style.top = String(600-asteroids[i][0].pos[1] - (asteroids[i][0].height/2)) + "px";
  }
}
