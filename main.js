//Game settings
var asteroidSizes = [10, 30, 50]; //small, medium, large
var spaceshipSize = 64; //Width and height -- it's a square.

//Get user interface elements
var newGameButton   = document.getElementById("new");
var levelCont       = document.getElementById("levelCont");
var levelDisplay    = document.getElementById("level");
var scoreCont       = document.getElementById("scoreCont");
var scoreDisplay    = document.getElementById("score");
var lives           = document.getElementById("lives");

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
function asteroid(size) {
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

  //Hitbox attributes
  this.hitbox = function() {
    center = new point(this.pos[0], this.pos[1]);
    c = new circle(center, this.sideLength()/2);
    return c;
  }
}
function spaceship() {
  this.pos = [0, 0];
  this.vel = [0, 0];
  this.acl = [0, 0];
  this.velM = 0;
  this.aclM = 0;
  this.angle = 0;
  this.sideLength = spaceshipSize;

  this.hitbox = function() {
    p1 = new point(this.pos[0], this.pos[1]+(this.sideLength/2));
    p2 = new point(this.pos[0]+(this.sideLength/2), this.pos[1]-(this.sideLength/2));
    p3 = new point(this.pos[0]-(this.sideLength/2), this.pos[1]-(this.sideLength/2));
    poly = new polygon([p1, p2, p3]);
    return poly;
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

//Game variables
var asteroids = [];
var ship;

//Set up level
function setUpLevel(level) {
  for(i2=0; i2<(level+2); ++i2) {
    asteroids.push(new asteroid(3));
  }
  ship = new spaceship();
}
