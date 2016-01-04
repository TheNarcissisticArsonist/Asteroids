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

//Functions
function initialSetup() {
  htmlELEMENTS.gameBoardCont.innerHTML = "";
  htmlELEMENTS.gameBoardCont.innerHTML = basicBoardOutlineSVG;
  htmlELEMENTS.gameBoard = document.getElementById("gameBoard");
}

function lineCollisionTest(l1, l2) {
  //l1=<1x0-(1x0+1x1)u,1y0-(1y0+1y1)u>
  //l2=<2x0-(2x0+2x1)v,2y0-(2y0+2y1)v>

  //{1x0-(1x0+1x1)u = 2x0-(2x0+2x1)v
  //{1y0-(1y0+1y1)u = 2y0-(2y0+2y1)v
  //    or
  //{a+bu = c+dv
  //{e+fu = g+hv
  //    becomes
  //u = (hc+de-dg-ha)/(hb-df)
  //v = (fa+bg-be-fc)/(fd-bh)
  //if u and v are between 0 and 1, they intersect
}

//Event Listeners


//Executed code below...
initialSetup();
