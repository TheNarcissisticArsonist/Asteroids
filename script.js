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
var asteroidSizeMultiplier = 3; //pixels * r^2
var asteroidSizeAdditive = 10; //pixels
var minAsteroidStartDistance = 75; //pixels
var bulletSpeed = 200; //pixels/second
var bulletRadius = 3; //pixels
var maxBullets = 3;
var shipCartAclRate = 128; //pixels/second^2
var shipRotAclRate = 4*Math.PI; //radians/second^2
var spaceshipRotationSlowingRate = 1; //This can be anywhere from 0 (where rotation remains constant) to 1. Higher is possible but not recommended
//Some of these units may be wrong, but ¯\_(ツ)_/¯
var standardSVGStyle = "stroke: rgba(255,255,255,1);";
var basicBoardOutlineSVG = "<svg id='gameBoard' width='"+boardWidth+"' height='"+boardHeight+"'></svg>"
var asteroidInitialSVG = ["<circle cx='0' cy='0' r='1' style='"+standardSVGStyle+"' fill='black' id='", "'></circle>"];
var bulletInitialSVG = ["<circle cx='0' cy='0' r='1' style='"+standardSVGStyle+"' fill='black' id='", "'></circle>"]
var score = null;
var level = null;
var ship = null;
var shipGhost = [];
var asteroids = [];
var asteroidGhosts = [];
var bullets = [];
var numberOfStars = 30;
var minStars = 20;
var maxStars = 40;
var randomNumberOfStars = true;
var timeStamp1 = null;
var timeStamp2 = null;
var dT = null;
var stopGameLoop = false;

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
function spaceship(idTag) {
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
  this.idTag = idTag;
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
    htmlELEMENTS.gameBoard.innerHTML += spaceshipInitialSVG(idTag);
    this.hitbox[1][0] = document.getElementById("spaceship"+this.idTag+"SVGFrontRight");
    this.hitbox[1][1] = document.getElementById("spaceship"+this.idTag+"SVGBack");
    this.hitbox[1][2] = document.getElementById("spaceship"+this.idTag+"SVGFrontLeft");
  }
  this.updateSVG = function() {
    var i;
    this.hitbox[1][0] = document.getElementById("spaceship"+this.idTag+"SVGFrontRight");
    this.hitbox[1][1] = document.getElementById("spaceship"+this.idTag+"SVGBack");
    this.hitbox[1][2] = document.getElementById("spaceship"+this.idTag+"SVGFrontLeft");
    for(i=0; i<3; ++i) {
      this.hitbox[1][i].setAttribute("x1", String(this.hitbox[0][i].p1.x));
      this.hitbox[1][i].setAttribute("y1", String(boardHeight-this.hitbox[0][i].p1.y));
      this.hitbox[1][i].setAttribute("x2", String(this.hitbox[0][i].p2.x));
      this.hitbox[1][i].setAttribute("y2", String(boardHeight-this.hitbox[0][i].p2.y));
    }
  }
  this.updateHitbox();
  this.createSVG();
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
  this.idTag = idTag;
  c = new circle(createPoint(this.Cpos[0], this.Cpos[1]), this.asteroidSize);
  this.hitbox = [[c], []];
  this.updateHitbox = function() {
    this.hitbox[0][0].c.setX(this.Cpos[0]);
    this.hitbox[0][0].c.setY(this.Cpos[1]);
    this.hitbox[0][0].setR(this.asteroidSize*this.asteroidSize*asteroidSizeMultiplier+asteroidSizeAdditive);
  }
  this.createSVG = function() {
    htmlELEMENTS.gameBoard.innerHTML += asteroidInitialSVG[0] + "bigAsteroid" + this.idTag + asteroidInitialSVG[1];
    this.hitbox[1][0] = document.getElementById("bigAsteroid" + this.idTag);
    this.updateSVG();
  }
  this.updateSVG = function() {
    this.hitbox[1][0] = document.getElementById("bigAsteroid" + this.idTag);
    this.hitbox[1][0].setAttribute("cx", this.Cpos[0]);
    this.hitbox[1][0].setAttribute("cy", boardHeight-this.Cpos[1]);
    this.hitbox[1][0].setAttribute("r", this.asteroidSize*this.asteroidSize*asteroidSizeMultiplier+asteroidSizeAdditive);
  }
  this.updateHitbox();
  this.createSVG();
  this.updateSVG();
}
function bullet(idTag) {
  var x, y, r, t, c;
  this.Cpos = [ship.hitbox[0][0].p1.x, ship.hitbox[0][0].p1.y];
  r = bulletSpeed;
  t = ship.Rpos;
  x = r*Math.cos(t+Math.PI/2);
  y = r*Math.sin(t+Math.PI/2);
  this.Cvel = [x, y];
  this.Cacl = [0, 0];
  this.distanceTraveled = null //  a;owgheaowgh;owagh
  this.idTag = idTag;
  c = new circle(createPoint(this.Cpos[0], this.Cpos[1]), bulletRadius);
  this.hitbox = [[c], []];
  this.updateHitbox = function() {
    this.hitbox[0][0].c.setX(this.Cpos[0]);
    this.hitbox[0][0].c.setY(this.Cpos[1]);
  }
  this.createSVG = function() {
    htmlELEMENTS.gameBoard.innerHTML += bulletInitialSVG[0] + "bullet" + this.idTag + bulletInitialSVG[1];
    this.hitbox[1][0] = document.getElementById("bullet" + this.idTag);
    this.updateSVG();
  }
  this.updateSVG = function() {
    this.hitbox[1][0] = document.getElementById("bullet" + this.idTag);
    this.hitbox[1][0].setAttribute("cx", this.Cpos[0]);
    this.hitbox[1][0].setAttribute("cy", boardHeight-this.Cpos[1]);
    this.hitbox[1][0].setAttribute("r", this.hitbox[0][0].r);
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
  placeStars();
}
function newGameClicked() {
  if(!confirm("Are you sure you want to start a new game?")) {
    return;
  }
  stopGameLoop = true;
  score = 0;
  level = 1;
  initialSetup();
  ship = new spaceship("main");
  ship.updateSVG();
  shipGhost = [new spaceship("ghostX"), new spaceship("ghostY"), new spaceship("ghostXY")];
  shipGhost[0].updateSVG();
  shipGhost[1].updateSVG();
  shipGhost[2].updateSVG();
  spawnAsteroids();
  updateUI();
  timeStamp1 = new Date().getTime();
  window.setTimeout(function() {
    stopGameLoop = false;
    mainLoop();
  }, 0);
}
function resetClicked() {
  if(!confirm("Are you sure you want to reset?")) {
    return;
  }
  stopGameLoop = true;
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
    asteroidGhosts.push([spawnAsteroid(i+"ghostX"), spawnAsteroid(i+"ghostY"), spawnAsteroid(i+"ghostXY")]);
  }
}
function shoot() {
  if(bullets.length >= maxBullets) {
    return;
  }
  bullets.push(new bullet(bullets.length));
}
function mainLoop() {
  if(stopGameLoop) {
    return;
  }

  timeStamp2 = new Date().getTime();
  dT = (timeStamp2 - timeStamp1)/1000;

  spaceshipLoopMotionEvaluation(dT);
  asteroidsLoopMotionEvaluation(dT);
  bulletsLoopMotionEvaluation(dT);

  //Get next frame
  timeStamp1 = new Date().getTime();
  console.log("Loop!");
  requestAnimationFrame(mainLoop);
};
function spaceshipLoopMotionEvaluation(dT) {
  var x, y, r, t, v, i, movedX, movedY;

  //Evaluate spaceship stuff
  //cartesian
  //acl
  r = ((keys.w && keys.s) ? 0 : (keys.w ? shipCartAclRate : (keys.s ? -shipCartAclRate : 0)));
  t = ship.Rpos;
  x = r * Math.cos(t + Math.PI/2);
  y = r * Math.sin(t + Math.PI/2);
  ship.Cacl = [x, y];
  //vel
  ship.Cvel[0] += ship.Cacl[0] * dT;
  ship.Cvel[1] += ship.Cacl[1] * dT;
  //pos
  ship.Cpos[0] += ship.Cvel[0] * dT;
  ship.Cpos[1] += ship.Cvel[1] * dT;
  if(ship.Cpos[0] > boardWidth) {
    ship.Cpos[0] -= boardWidth;
  }
  else if(ship.Cpos[0] < 0) {
    ship.Cpos[0] += boardWidth;
  }
  if(ship.Cpos[1] > boardHeight) {
    ship.Cpos[1] -= boardHeight;
  }
  else if(ship.Cpos[1] < 0) {
    ship.Cpos[1] += boardHeight;
  }
  //rotational
  //acl
  v = ((keys.a && keys.d) ? 0 : (keys.a ? shipRotAclRate : (keys.d ? -shipRotAclRate : 0)));
  ship.Racl = v;
  //vel
  ship.Rvel += ship.Racl * dT;
  ship.Rvel *= (1 - dT) * spaceshipRotationSlowingRate;
  //pos
  ship.Rpos += ship.Rvel * dT;

  ship.updateHitbox();
  ship.updateSVG();

  shipGhost[0].Rpos = ship.Rpos;
  shipGhost[1].Rpos = ship.Rpos;
  shipGhost[2].Rpos = ship.Rpos;

  movedX = false;
  movedY = false;

  for(i=0; i<3; ++i) {
    if(ship.hitbox[0][i].p1.x>boardWidth || ship.hitbox[0][i].p2.x>boardWidth) {
      shipGhost[0].Cpos[0] = ship.Cpos[0] - boardWidth;
      shipGhost[2].Cpos[0] = ship.Cpos[0] - boardWidth;
      movedX = true;
    }
    else if(ship.hitbox[0][i].p1.x<0 || ship.hitbox[0][i].p2.x<0) {
      shipGhost[0].Cpos[0] = ship.Cpos[0] + boardWidth;
      shipGhost[2].Cpos[0] = ship.Cpos[0] + boardWidth;
      movedX = true;
    }
    if(movedX) {
      break;
    }
  }
  for(i=0; i<3; ++i) {
    if(ship.hitbox[0][i].p1.y>boardHeight || ship.hitbox[0][i].p2.y>boardHeight) {
      shipGhost[1].Cpos[1] = ship.Cpos[1] - boardHeight;
      shipGhost[2].Cpos[1] = ship.Cpos[1] - boardHeight;
      movedY = true;
    }
    else if(ship.hitbox[0][i].p1.y<0 || ship.hitbox[0][i].p2.y<0) {
      shipGhost[1].Cpos[1] = ship.Cpos[1] + boardHeight;
      shipGhost[2].Cpos[1] = ship.Cpos[1] + boardHeight;
      movedY = true;
    }
    if(movedY) {
      break;
    }
  }
  if(movedX && !movedY) {
    shipGhost[0].Cpos[1] = ship.Cpos[1];
    shipGhost[1].Cpos = [-100, -100];
    shipGhost[2].Cpos = [-100, -100];
  }
  else if(movedY && !movedX) {
    shipGhost[1].Cpos[0] = ship.Cpos[0];
    shipGhost[0].Cpos = [-100, -100];
    shipGhost[2].Cpos = [-100, -100];
  }
  else if((!movedX) && (!movedY)) {
    for(i=0; i<3; ++i) {
      shipGhost[i].Cpos = [-100, -100];
    }
  }
  else if(movedX && movedY) {
    shipGhost[0].Cpos[1] = ship.Cpos[1];
    shipGhost[1].Cpos[0] = ship.Cpos[0];
  }

  for(i=0; i<3; ++i) {
    shipGhost[i].updateHitbox();
    shipGhost[i].updateSVG();
  }
}
function asteroidsLoopMotionEvaluation(dT) {
  var i, j, movedX, movedY;
  for(i=0; i<asteroids.length; ++i) {
    asteroids[i].Cacl = [0, 0];

    asteroids[i].Cvel[0] += asteroids[i].Cacl[0] * dT;
    asteroids[i].Cvel[1] += asteroids[i].Cacl[1] * dT;

    asteroids[i].Cpos[0] += asteroids[i].Cvel[0] * dT;
    asteroids[i].Cpos[1] += asteroids[i].Cvel[1] * dT;

    if(asteroids[i].Cpos[0] > boardWidth) {
      asteroids[i].Cpos[0] -= boardWidth;
    }
    else if(asteroids[i].Cpos[0] < 0) {
      asteroids[i].Cpos[0] += boardWidth;
    }
    if(asteroids[i].Cpos[1] > boardHeight) {
      asteroids[i].Cpos[1] -= boardHeight;
    }
    else if(asteroids[i].Cpos[1] < 0) {
      asteroids[i].Cpos[1] += boardHeight;
    }

    asteroids[i].updateHitbox();
    asteroids[i].updateSVG();

    movedX = false;
    movedY = false;

    if(asteroids[i].hitbox[0][0].c.x + asteroids[i].hitbox[0][0].r>boardWidth) {
      asteroidGhosts[i][0].Cpos[0] = asteroids[i].Cpos[0] - boardWidth;
      asteroidGhosts[i][2].Cpos[0] = asteroids[i].Cpos[0] - boardWidth;
      movedX = true;
    }
    else if(asteroids[i].hitbox[0][0].c.x - asteroids[i].hitbox[0][0].r<0) {
      asteroidGhosts[i][0].Cpos[0] = asteroids[i].Cpos[0] + boardWidth;
      asteroidGhosts[i][2].Cpos[0] = asteroids[i].Cpos[0] + boardWidth;
      movedX = true;
    }
    if(asteroids[i].hitbox[0][0].c.y + asteroids[i].hitbox[0][0].r>boardHeight) {
      asteroidGhosts[i][1].Cpos[1] = asteroids[i].Cpos[1] - boardHeight;
      asteroidGhosts[i][2].Cpos[1] = asteroids[i].Cpos[1] - boardHeight;
      movedY = true;
    }
    else if(asteroids[i].hitbox[0][0].c.y - asteroids[i].hitbox[0][0].r<0) {
      asteroidGhosts[i][1].Cpos[1] = asteroids[i].Cpos[1] + boardHeight;
      asteroidGhosts[i][2].Cpos[1] = asteroids[i].Cpos[1] + boardHeight;
      movedY = true;
    }

    if(movedX && !movedY) {
      asteroidGhosts[i][0].Cpos[1] = asteroids[i].Cpos[1];
      asteroidGhosts[i][1].Cpos = [-100, -100];
      asteroidGhosts[i][2].Cpos = [-100, -100];
    }
    else if(movedY && !movedX) {
      asteroidGhosts[i][0].Cpos = [-100, -100];
      asteroidGhosts[i][1].Cpos[0] = asteroids[i].Cpos[0];
      asteroidGhosts[i][2].Cpos = [-100, -100];
    }
    else if((!movedX) && (!movedY)) {
      for(j=0; j<3; ++j) {
        asteroidGhosts[i][j].Cpos = [-100, -100];
      }
    }
    else if(movedX && movedY) {
      asteroidGhosts[i][0].Cpos[1] = asteroids[i].Cpos[1];
      asteroidGhosts[i][1].Cpos[0] = asteroids[i].Cpos[0];
    }
    for(j=0; j<3; ++j) {
      asteroidGhosts[i][j].updateHitbox();
      asteroidGhosts[i][j].updateSVG();
    }
  }
}
function bulletsLoopMotionEvaluation(dT) {
  var i;
  for(i=0; i<bullets.length; ++i) {
    bullets[i].Cacl = [0, 0];

    bullets[i].Cvel[0] += bullets[i].Cacl[0] * dT;
    bullets[i].Cvel[1] += bullets[i].Cacl[1] * dT;

    bullets[i].Cpos[0] += bullets[i].Cvel[0] * dT;
    bullets[i].Cpos[1] += bullets[i].Cvel[1] * dT;

    if(bullets[i].Cpos[0] > boardWidth) {
      bullets[i].Cpos[0] -= boardWidth;
    }
    else if(bullets[i].Cpos[0] < 0) {
      bullets[i].Cpos[0] += boardWidth;
    }
    if(bullets[i].Cpos[1] > boardHeight) {
      bullets[i].Cpos[1] -= boardHeight;
    }
    else if(bullets[i].Cpos[1] < 0) {
      bullets[i].Cpos[1] += boardHeight;
    }

    bullets[i].updateHitbox();
    bullets[i].updateSVG();
  }
}

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
  var a, b, c, d, e, f, g, h, u, v, p, m, t;
  //Special case: line segments are on the same line
  if(Math.abs(l1.getDirectionUnitVector()[0]) == Math.abs(l2.getDirectionUnitVector()[0])) {
    //Ok, they are parallel
    p = new point(l2.p1.x-l1.p1.x, l2.p1.y-l1.p1.y);
    if(p.x == 0 && p.y == 0); {
      return true; //they contain the same endpoint
    }
    //Ok, p isn't a common endpoint
    m = Math.sqrt(p.x*p.x + p.y*p.y);
    p.setX(p.x/m);
    p.setY(p.y/m);
    if(Math.abs(p.x) != Math.abs(l1.getDirectionUnitVector()[0])) {
      return false;
    }

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
function starInitialSVG(x, y) {
  return "<circle cx='"+x+"' cy='"+String(boardHeight-y)+"' r='1' style='"+standardSVGStyle+"' fill='white'></circle>";
}
function placeStars() {
  var i;
  if(randomNumberOfStars) {
    numberOfStars = Math.floor(Math.random()*(maxStars-minStars)+minStars);
  }
  for(i=0; i<numberOfStars; ++i) {
    htmlELEMENTS.gameBoard.innerHTML += starInitialSVG(Math.random()*boardWidth, Math.random()*boardHeight);
  }
}
function spaceshipInitialSVG(idTag) {
  return "<line id='spaceship"+idTag+"SVGFrontRight' x1='0' y1='0' x2='1' y2='1' style='"+standardSVGStyle+"'></line>\
    <line id='spaceship"+idTag+"SVGBack' x1='1' y1='1' x2='2' y2='2' style='"+standardSVGStyle+"'></line>\
    <line id='spaceship"+idTag+"SVGFrontLeft' x1='2' y1='2' x2='0' y2='0' style='"+standardSVGStyle+"'></line>"
}

//Event Listeners
htmlELEMENTS.newGameButton.addEventListener("click", newGameClicked);
htmlELEMENTS.resetButton.addEventListener("click", resetClicked);
document.addEventListener("keydown", function(event) {
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
      shoot();
      break;
    case 78: //n
      newGameClicked();
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
