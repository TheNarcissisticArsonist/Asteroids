//Variables
var htmlELEMENTS = {
  gameBoardCont:    document.getElementById("gameBoardCont"),
  newGameButton:    document.getElementById("newGame"),
  resetButton:      document.getElementById("reset"),
  level:            document.getElementById("level"),
  score:            document.getElementById("score")
};
var keys = {
  w: false,
  a: false,
  s: false,
  d: false
};
var boardWidth = 900;
var boardHeight = 600;
var minAsteroidSpeed = 50; //pixels/second
var maxAsteroidSpeed = 150; //pixels/second
var spaceshipMaxSpeed = 150; //pixels/second
var asteroidSizeMultiplier = 5; //pixels * r^2
var minAsteroidStartDistance = 75; //pixels
var standardSVGStyle = "stroke: rgba(255,255,255,1);";
var basicBoardOutlineSVG = "<svg id='gameBoard' width='"+boardWidth+"' height='"+boardHeight+"'></svg>"
var spaceshipInitialSVG = "<line id='spaceshipSVGFrontRight' x1='0' y1='0' x2='1' y2='1' style='"+standardSVGStyle+"'></line>\
  <line id='spaceshipSVGBack' x1='1' y1='1' x2='2' y2='2' style='"+standardSVGStyle+"'></line>\
  <line id='spaceshipSVGFrontLeft' x1='2' y1='2' x2='0' y2='0' style='"+standardSVGStyle+"'></line>"
var asteroidInitialSVG = ["<circle cx='0' cy='0' r='1' style='"+standardSVGStyle+"' fill='black' id='", "'></circle>"];
var score = null;
var level = null;
var ship = null;
var asteroids = [];

//Classes (Geometric, Game)
function point(x, y) {
  this.x = x;
  this.y = y;
  this.setX = function(val) {
    this.x = val;
  }
  this.setY = function(val) {
    this.y = val;
  }
}
function line(p1, p2) {
  this.p1 = p1;
  this.p2 = p2;
  this.getDirectionUnitVector = function() {
    var x, y, magnitude;
    x = this.p2.x - this.p1.x;
    y = this.p2.y - this.p1.y;
    magnitude = Math.sqrt((x*x)+(y*y));
    return [x/magnitude, y/magnitude];
  }
  this.setP1 = function(val) {
    this.p1 = val;
  }
  this.setP2 = function(val) {
    this.p2 = val;
  }
  this.setP1X = function(val) {
    this.p1.x = val;
  }
  this.setP1Y = function(val) {
    this.p1.y = val;
  }
  this.setP2X = function(val) {
    this.p2.x = val;
  }
  this.setP2Y = function(val) {
    this.p2.y = val;
  }
}
function circle(c, r) {
  this.c = c;
  this.r = r;
  this.setR = function(val) {
    this.r = val;
  }
}
function spaceship() {
  /*      /\      _   Spaceship location is based off of of the middle point
   *     /  \     |       over 5
   *    /    \    16      up 8
   *   /      \   |
   *  /________\  _
   *
   *  |-- 10 --|
   */
  var p1, p2, p3, l12, l23, l31;
  this.Cpos = [boardWidth/2, boardHeight/2]; //pixels
  this.Cvel = [0, 0]; //pixels/second
  this.Cacl = [0, 0]; //pixels/second^2
  this.Rpos = 0; //radians
  this.Rvel = 0; //radians/second
  this.Racl = 0; //radians/second^2
  //C stands for cartesian (as in cartesian coordinates)
  //R stands for rotational (because, well, it measures the rotation :D)
  p1 = new point(0, 0);
  p2 = new point(1, 1);
  p3 = new point(2, 2); //(arbitrary values)
  l12 = new line(p1, p2);
  l23 = new line(p2, p3);
  l31 = new line(p3, p1);
  this.hitbox = [[l12, l23, l31], []];
  this.updateHitbox = function() {
    var x, y, t, p;
    t = this.Rpos;

    p = rotatePoint(0, 8, t);
    this.hitbox[0][2].setP2(createPoint(this.Cpos[0]+p[0], this.Cpos[1]+p[1]));
    this.hitbox[0][0].setP1(createPoint(this.Cpos[0]+p[0], this.Cpos[1]+p[1]));

    p = rotatePoint(5, -8, t);
    this.hitbox[0][0].setP2(createPoint(this.Cpos[0]+p[0], this.Cpos[1]+p[1]));
    this.hitbox[0][1].setP1(createPoint(this.Cpos[0]+p[0], this.Cpos[1]+p[1]));

    p = rotatePoint(-5, -8, t);
    this.hitbox[0][1].setP2(createPoint(this.Cpos[0]+p[0], this.Cpos[1]+p[1]));
    this.hitbox[0][2].setP1(createPoint(this.Cpos[0]+p[0], this.Cpos[1]+p[1]));
  }
  this.createSVG = function() {
    htmlELEMENTS.gameBoard.innerHTML += spaceshipInitialSVG;
    this.hitbox[1][0] = document.getElementById("spaceshipSVGFrontRight");
    this.hitbox[1][1] = document.getElementById("spaceshipSVGBack");
    this.hitbox[1][2] = document.getElementById("spaceshipSVGFrontLeft");
    this.updateSVG();
  }
  this.updateSVG = function() {
    var i;
    for(i=0; i<3; ++i) {
      this.hitbox[1][i].setAttribute("x1", this.hitbox[0][i].p1.x);
      this.hitbox[1][i].setAttribute("y1", boardHeight-this.hitbox[0][i].p1.y);
      this.hitbox[1][i].setAttribute("x2", this.hitbox[0][i].p2.x);
      this.hitbox[1][i].setAttribute("y2", boardHeight-this.hitbox[0][i].p2.y);
    }
  }
  this.updateHitbox();
  this.createSVG();
  this.updateSVG();
}
function asteroid(idTag) {
  var x, y, s, t, c, p1, p2;
  p1 = new point(ship.Cpos[0], ship.Cpos[1]);
  do {
    x = Math.random() * boardWidth;
    y = Math.random() * boardHeight;
    p2 = createPoint(x, y);
  }
  while(distance(p1, p2) < minAsteroidStartDistance);
  this.Cpos = [x, y];
  s = (Math.random() * (maxAsteroidSpeed-minAsteroidSpeed)) + minAsteroidSpeed;
  t = Math.random() * 2 * Math.PI;
  x = s * Math.cos(t);
  y = s * Math.sin(t);
  this.Cvel = [x, y];
  this.Cacl = [0, 0];
  this.asteroidSize = 3;
  c = new circle(createPoint(this.Cpos[0], this.Cpos[1]), this.asteroidSize);
  this.hitbox = [[c], []];
  this.updateHitbox = function() {
    this.hitbox[0][0].c.setX(this.Cpos[0]);
    this.hitbox[0][0].c.setY(this.Cpos[1]);
    this.hitbox[0][0].setR(this.asteroidSize*this.asteroidSize*asteroidSizeMultiplier);
  }
  this.createSVG = function() {
    htmlELEMENTS.gameBoard.innerHTML += (asteroidInitialSVG[0] + "bigAsteroid" + idTag + asteroidInitialSVG[1]);
    this.hitbox[1][0] = document.getElementById("bigAsteroid" + idTag);
    this.updateSVG();
  }
  this.updateSVG = function() {
    this.hitbox[1][0].setAttribute("cx", this.Cpos[0]);
    this.hitbox[1][0].setAttribute("cy", 600-this.Cpos[1]);
    this.hitbox[1][0].setAttribute("r", this.asteroidSize*this.asteroidSize*asteroidSizeMultiplier);
  }
  this.updateHitbox();
  this.createSVG();
  this.updateSVG();
}

//Functions (Structure, General Math, Geometric, Display)
function initialSetup() {
  htmlELEMENTS.gameBoard = null;
  htmlELEMENTS.gameBoardCont.innerHTML = "";
  htmlELEMENTS.gameBoardCont.innerHTML = basicBoardOutlineSVG;
  htmlELEMENTS.gameBoard = document.getElementById("gameBoard");
}
function newGameClicked() {
  if(!confirm("Are you sure you want to start a new game?")) {
    return;
  }
  score = 0;
  level = 1;
  initialSetup();
  ship = new spaceship();
  spawnAsteroids();
  updateUI();
  mainLoop();
}
function resetClicked() {
  if(!confirm("Are you sure you want to reset?")) {
    return;
  }
  score = null;
  level = null;
  initialSetup();
  updateUI();
}
function spawnAsteroid(number) {
  return new asteroid(number);
}
function spawnAsteroids() {
  var i;
  for(i=0; i<level; ++i) {
    asteroids.push(spawnAsteroid(i));
  }
}
function mainLoop() {
  //
};

function distance(p1, p2) {
  var x, y;
  x = p2.x - p1.x;
  y = p2.y - p1.y;
  return Math.sqrt(x*x + y*y);
}
function vectorMagnitude(p) {
  var o;
  o = new point(0,0);
  return distance(o, p);
}
function vectorDot(p1, p2) {
  return (p1.x*p2.x) + (p1.y*p2.y);
}
function rotatePoint(x, y, t) {
  var x_, y_;
  x_ = x*Math.cos(t) - y*Math.sin(t);
  y_ = x*Math.sin(t) + y*Math.cos(t);
  return [x_, y_];
}

function lineCollisionTest(l1, l2) {
  var a, b, c, d, e, f, g, h, u, v;
  //Special case: line segments are on the same line
  if(Math.abs(l1.getDirectionUnitVector()[0]) == Math.abs(l2.getDirectionUnitVector()[0])) {
    //Ok, they are along the same line...
    if(l1.p1.x >= l2.p1.x && l1.p1.x <= l2.p2.x) {
      return true;
    }
    if(l1.p1.x <= l2.p1.x && l1.p1.x >= l2.p2.x) {
      return true;
    }
    if(l1.p2.x >= l2.p1.x && l1.p2.x <= l2.p2.x) {
      return true;
    }
    if(l1.p2.x <= l2.p1.x && l1.p2.x >= l2.p2.x) {
      return true;
    }
  }

  //l1=<1x1-(1x1+1x2)u,1y1-(1y1+1y2)u>
  //l2=<2x1-(2x1+2x2)v,2y1-(2y1+2y2)v>

  //{1x1-(1x1+1x2)u = 2x1-(2x1+2x2)v
  //{1y1-(1y1+1y2)u = 2y1-(2y1+2y2)v
  //    or
  //{a+bu = c+dv
  //{e+fu = g+hv
  //    becomes
  //u = (hc+de-dg-ha)/(hb-df)
  //v = (fa+bg-be-fc)/(fd-bh)
  //if u and v are between 0 and 1, they intersect
  a = l1.p1.x;
  b = -(l1.p1.x + l1.p2.x);
  c = l2.p1.x;
  d = -(l2.p1.x + l2.p2.x);
  e = l1.p1.y;
  f = -(l1.p1.y + l1.p2.y);
  g = l2.p1.y;
  h = -(l2.p1.y + l2.p2.y);

  u = ((h*c)+(d*e)-(d*g)-(h*a))/((h*b)-(d*f));
  v = ((f*a)+(b*g)-(b*e)-(f*c))/((f*d)-(b*h));

  if((u>=0) && (u<=1) && (v>=0) && (v<=1)) {
    return true;
  }
  else {
    return false;
  }
}
function lineCircleCollisionTest(l, c) {
  var p1Distance, p2Distance, v, r, compVontoR;
  p1Distance = distance(l.p1, c.c);
  p2Distance = distance(l.p2, c.c);
  if((p1Distance <= c.r) != (p2Distance <= c.r)) {
    return true;
  }
  if(p1Distance <= c.r && p2Distance <= c.r) {
    return false;
  }

  v = new point(0, 0);
  v.setX(c.c.x - l.p1.x);
  v.setY(c.c.y - l.p1.y);

  r = new point(0, 0);
  r.setX(l1.getDirectionUnitVector()[1] * c.r * -1);
  r.setY(l1.getDirectionUnitVector()[0] * c.r);

  compVontoR = vectorDot(r, v)/vectorMagnitude(r)

  if(compVontoR <= c.r) {
    return true;
  }
  else {
    return false;
  }
}
function createPoint(x, y) {
  return new point(x, y);
}
function createLine(p1, p2) {
  return new line(p1, p2);
}

function updateUI() {
  htmlELEMENTS.level.innerHTML = (level == null) ? "--" : level;
  htmlELEMENTS.score.innerHTML = (score == null) ? "--" : score;
}


//Event Listeners
htmlELEMENTS.newGameButton.addEventListener("click", newGameClicked);
htmlELEMENTS.resetButton.addEventListener("click", resetClicked);
document.addEventListener("keydown", function(event) {
  console.log("Pressed key " + event.which);
  switch(event.which) {
    case 87: //w
      keys.w = true;
      break;
    case 65: //a
      keys.a = true;
      break;
    case 83: //s
      keys.s = true;
      break;
    case 68: //d
      keys.d = true;
      break;
    case 32: //space
      //
      break;
    case 78: //n
      //
      break;
    case 82: //r
      //
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
    case 83: //s
      keys.s = false;
      break;
    case 68: //d
      keys.d = false;
      break;
  }
});

//Executed code below...
initialSetup();
