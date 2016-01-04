//Variables
htmlELEMENTS = {
  gameBoardCont:    document.getElementById("gameBoardCont"),
  newGameButton:    document.getElementById("newGame"),
  resetButton:      document.getElementById("reset"),
  level:            document.getElementById("level"),
  score:            document.getElementById("score")
};
boardWidth = 900;
boardHeight = 600;
boardBorderLineStyleString = "stroke: rgba(255,255,255,1);";
var basicBoardOutlineSVG = "<svg id='gameBoard' width='"+boardWidth+"' height='"+boardHeight+"'>\
  <line x1='0' y1='0' x2='"+boardWidth+"' y2='0' style='"+boardBorderLineStyleString+"'></line>\
  <line x1='"+boardWidth+"' y1='0' x2='"+boardWidth+"' y2='"+boardHeight+"' style='"+boardBorderLineStyleString+"'></line>\
  <line x1='"+boardWidth+"' y1='"+boardHeight+"' x2='0' y2='"+boardHeight+"' style='"+boardBorderLineStyleString+"'></line>\
  <line x1='0' y1='"+boardHeight+"' x2='0' y2='0' style='"+boardBorderLineStyleString+"'></line>\
  </svg>"

//Classes
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
  if(!(p1 instanceof point && p2 instanceof point)) {
    alert("BAD DON'T DO THAT ONLY USE LINES AS ARGUMENTS");
    return;
  }
  this.p1 = p1;
  this.p2 = p2;
  this.getDirectionUnitVector = function() {
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
}

//Functions
function initialSetup() {
  htmlELEMENTS.gameBoardCont.innerHTML = "";
  htmlELEMENTS.gameBoardCont.innerHTML = basicBoardOutlineSVG;
  htmlELEMENTS.gameBoard = document.getElementById("gameBoard");
}

function lineCollisionTest(l1, l2) {
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

//Event Listeners


//Executed code below...
initialSetup();
