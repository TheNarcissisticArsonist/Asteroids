//Game settings
var asteroidSizes = [10, 30, 50]; //small, medium, large
var spaceshipSize = 64; //Width and height -- it's a square.
var asteroidMaxSpeed = 5; //In pixels per second
var spaceshipAccelerationRate = 0.4; //In pixels per second per second
var spaceshipRotationRate = 5; //In degrees per second
var epsilon = 0.01;

//Get user interface elements
var newGameButton   = document.getElementById("new");
var levelCont       = document.getElementById("levelCont");
var levelDisplay    = document.getElementById("level");
var scoreCont       = document.getElementById("scoreCont");
var scoreDisplay    = document.getElementById("score");
var livesDisplay    = document.getElementById("lives");

//Get data display elements
var dataPos         = document.getElementById("pos");
var dataVel         = document.getElementById("vel");
var dataAcl         = document.getElementById("acl");
var dataVelM        = document.getElementById("velM");
var dataAclM        = document.getElementById("aclM");
var dataAngle       = document.getElementById("angle");
var dataColliding   = document.getElementById("colliding");

//Get game board element
var gameBoard       = document.getElementById("gameBoard");
c1 = new point(0, 0);
c2 = new point(1200, 0);
c3 = new point(1200, 600);
c4 = new point(0, 600);
var gameBoundaries = [
  new line(c1, c2),
  new line(c2, c3),
  new line(c3, c4),
  new line(c4, c1)
];

//Geometric classes
function point(x, y) {
  this.x = x;
  this.y = y;

  this.convertToPolar = function(cX, cY) {
    newX = this.x - cX;
    newY = this.y - cY;
    r = getC(newX, newY);
    a = arctan(newX, newY);
    p = new polarPoint(r, a, cX, cY);
    return p;
  }
}
function line(point1, point2) {
  this.point1 = point1;
  this.point2 = point2;
  this.m = function() {
    return (this.point2.y-this.point1.y)/(this.point2.x-this.point1.x);
  }
  this.b = function() {
    return (this.point1.y - (this.m() * this.point1.x));
  }
}
function circle(point1, r) {
  this.center = point1;
  this.radius = r;
}
function polygon(points) {
  this.points = [];
  for(i0=0; i0<points.length; ++i0) {
    this.points[i0] = points[i0];
  }
  this.numSides = function() {
    return this.points.length;
  }
  this.listSides = function() {
    sideList = [];
    for(i1=0; i1<this.points.length-1; ++i1) {
      p1 = this.points[i1];
      p2 = this.points[i1+1];
      l = new line(p1, p2);
      sideList.push(l);
    }
    p1 = this.points[this.points.length-1];
    p2 = this.points[0];
    l = new line(p1, p2);
    sideList.push(l);
    return sideList;
  }
}
function polarPoint(r, a, cX, cY) {
  this.r = r;
  this.a = a;
  this.cX = cX;
  this.cY = cY;

  this.convertToRect = function() {
    x = this.cX + (this.r * Math.cos(this.a));
    y = this.cY + (this.r * Math.sin(this.a));
    p = new point(x, y);
    return p;
  }
}

//Game piece classes
function asteroid(size, number) {
  //Game and display attributes
  this.size = size;
  this.sideLength = function() {
    switch(this.size) {
      case 1:
        return asteroidSizes[0];
        break;
      case 2:
        return asteroidSizes[1];
        break;
      case 3:
        return asteroidSizes[2];
        break;
    }
  }

  //Physics attributes
  this.pos = [0, 0];
  this.vel = [0, 0];
  this.acl = [0, 0];
  this.velM = 0;
  this.aclM = 0;
  this.angle = 0;

  this.element = number; //Used for updating display and such

  //Hitbox attributes
  this.hitbox = function() {
    center = new point(this.pos[0], this.pos[1]);
    c = new circle(center, this.sideLength()/2);
    return c;
  }

  //Visual attributes
  this.display = function() {
    document.getElementById("asteroid"+this.element).style.left = String(this.pos[0] - (this.sideLength()/2)) + "px";
    document.getElementById("asteroid"+this.element).style.top  = String(600 - this.pos[1] - (this.sideLength()/2)) + "px";
    document.getElementById("asteroid"+this.element).style.transform = "rotate(" + this.angle + "rad)";
  }
}
function spaceship(element) {
  this.pos = [0, 0];
  this.vel = [0, 0];
  this.acl = [0, 0];
  this.velM = 0;
  this.aclM = 0;
  this.angle = 0;
  this.sideLength = spaceshipSize;

  this.element = element; //Used for updating display and such

  this.hitbox = function() {
    p1 = new point(this.pos[0], this.pos[1]+(this.sideLength/2));
    p2 = new point(this.pos[0]+(this.sideLength/2), this.pos[1]-(this.sideLength/2));
    p3 = new point(this.pos[0]-(this.sideLength/2), this.pos[1]-(this.sideLength/2));
    poly = new polygon([p1, p2, p3]);
    return poly;
  }

  //Visual attributes
  this.display = function() {
    this.element.style.left = String(this.pos[0] - (spaceshipSize/2)) + "px";
    this.element.style.top  = String(600 - this.pos[1] - (spaceshipSize/2)) + "px";
    this.element.style.transform = "rotate(" + this.angle + "rad)";
  }
}

//Important math functions I've made
function arctan(x, y) {
  if(!isNaN(Math.atan(x/y))) {
    temp = Math.atan(x/y);
  }
  else {
    temp = 0;
  }
  if(x < 0)  {
    temp += Math.PI;
  }
  return temp;
}
function getC(a, b) {
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}
function equal(num1, num2) {
  return Math.abs(num1 - num2) < epsilon;
}
function twoLinesColliding(line1, line2) {
  m1 = (line1.point1.y-line1.point2.y)/(line1.point1.x-line1.point2.x);
  m2 = (line2.point1.y-line2.point2.y)/(line2.point1.x-line2.point2.x);

  b1 = line1.point1.y - (m1 * line1.point1.x);
  b2 = line2.point1.y - (m2 * line2.point1.x);

  if(equal(m1, m2)) {
    if(!equal(b1, b2)) {
      return false;
    }
    else {
      if((line1.point1.x >= line2.point1.x && line1.point1.x <= line2.point2.x) || (line1.point2.x >= line2.point1.x && line1.point1.x <= line2.point2.x)) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  x = (b2-b1)/(m1-m2);

  if((x >= line1.point1.x && x <= line1.point2.x) && (x >= line2.point1.x && x <= line2.point2.x)) {
    return true;
  }
  else {
    return false;
  }
}
function lineCircleColliding(line1, circle1) {

}

//Game variables
var asteroids = [];
var ship;
var level;
var score;
var lives;
var firstGame = true;

//Set up level
function setUpLevel(level) {
  gameBoard.innerHTML = "";
  for(i2=0; i2<level+2; ++i2) {
    gameBoard.innerHTML += "<img id=\"asteroid" + i2 + "\" class=\"gameObject\" src=\"Asteroid.png\"></img>";
    asteroids.push(new asteroid(3, i2));
  }
  gameBoard.innerHTML += "<img id=\"spaceship\" class=\"gameObject\" src=\"Spaceship.png\"></img>";
  ship = new spaceship(document.getElementById("spaceship"));

  asteroidsRandom();

  ship.pos = [600, 300];
  ship.vel = [0, 0];
  ship.acl = [0, 0];
  ship.velM = 0;
  ship.aclM = 0;

  ship.display();

  levelDisplay.innerHTML = level;
}

//Randomly place and start asteroids
function asteroidsRandom() {
  for(i4=0; i4<asteroids.length; ++i4) {
    //Position
    temp = Math.random() * 2;
    if(temp < 1) {
      temp = Math.random() * 2;
      if(temp < 1) {
        asteroids[i4].pos[0] = Math.random() * (400 - (asteroids[i4].sideLength()/2)) + (asteroids[i4].sideLength()/2);
        asteroids[i4].pos[1] = Math.random() * 600;
      }
      else {
        asteroids[i4].pos[0] = 1200 - (Math.random() * (400 - (asteroids[i4].sideLength()/2)) + (asteroids[i4].sideLength()/2));
        asteroids[i4].pos[1] = Math.random() * 600;
      }
    }
    else {
      temp = Math.random() * 2;
      if(temp < 1) {
        asteroids[i4].pos[1] = Math.random() * (100 - (asteroids[i4].sideLength()/2)) + (asteroids[i4].sideLength()/2);
        asteroids[i4].pos[0] = Math.random() * 1200;
      }
      else {
        asteroids[i4].pos[1] = 600 - (Math.random() * (100 - (asteroids[i4].sideLength()/2)) + (asteroids[i4].sideLength()/2));
        asteroids[i4].pos[0] = Math.random() * 1200;
      }
    }

    //Velocity
    asteroids[i4].velM = Math.random() * asteroidMaxSpeed;
    dir = Math.random() * Math.PI;
    asteroids[i4].vel[0] = asteroids[i4].velM * Math.cos(dir);
    asteroids[i4].vel[1] = asteroids[i4].velM * Math.sin(dir);

    //Acceleration
    asteroids[i4].aclM = 0;
    asteroids[i4].acl = [0, 0];

    //Display
    asteroids[i4].display();
  }
}

//New game function
function newGame() {
  if(!firstGame) {
    window.clearInterval(mainLoop);
  }
  firstGame = false;

  level = 0;
  score = 1;
  asteroids = [];
  ship = null;
  lives = 4;

  levelCont.style.display = "inline-block";
  scoreCont.style.display = "inline-block";
  gameBoard.style.display = "inline-block";

  livesDisplay.innerHTML = "";
  for(i3=0; i3<lives-1; ++i3) {
    livesDisplay.innerHTML += "<img src=\"Spaceship.png\" style=\"transform: rotate(45deg);\"></img>";
  }

  setUpLevel(1);

  mainLoop = window.setInterval(physicsLoop, 33);
}

function physicsLoop() {
  spaceshipPhysics();
  asteroidPhysics();
  testForCollisions();
  testIfRoundOver();
}
function asteroidPhysics() {
  for(i5=0; i5<asteroids.length; ++i5) {
    //Acceleration
    asteroids[i5].acl = [0, 0];
    asteroids[i5].aclM = 0;

    //Velocity
    asteroids[i5].vel[0] += asteroids[i5].acl[0];
    asteroids[i5].vel[1] += asteroids[i5].acl[1];
    asteroids[i5].velM = getC(asteroids[i5].vel[0], asteroids[i5].vel[1]);

    //Position
    asteroids[i5].pos[0] += asteroids[i5].vel[0];
    asteroids[i5].pos[1] += asteroids[i5].vel[1];
      //Edge collision

    //Rotation
    asteroids[i5].angle = 0;

    //Display
    asteroids[i5].display();
  }
}
function spaceshipPhysics() {
  //Acceleration
  if(keys.w) {
    ship.aclM = spaceshipAccelerationRate;
    ship.acl[0] = spaceshipAccelerationRate * Math.sin(ship.angle);
    ship.acl[1] = spaceshipAccelerationRate * Math.cos(ship.angle);
  }
  else {
    ship.aclM = 0;
    ship.acl = [0, 0];
  }

  //Velocity
  ship.vel[0] += ship.acl[0];
  ship.vel[1] += ship.acl[1];
  ship.velM = getC(ship.vel[0], ship.vel[1]);

  //Position
  ship.pos[0] += ship.vel[0];
  ship.pos[1] += ship.vel[1];
    //Edge collision

  //Rotation
  if(keys.a && !keys.d) {
    ship.angle -= spaceshipRotationRate * Math.PI / 180;
  }
  else if(keys.d && !keys.a) {
    ship.angle += spaceshipRotationRate * Math.PI / 180;
  }

  //Display
  ship.display();
}
function testForCollisions() {

}
function testIfRoundOver() {

}

//User input...
newGameButton.addEventListener("click", newGame);
var keys = {
  w: false,
  a: false,
  d: false
};
document.addEventListener("keydown", function(event) {
  switch(event.which) {
    case 78: //n
      newGame();
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
