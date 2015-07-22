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
  this.r = function() {
    return Math.sqrt(Math.pow(this.x, 2)+Math.pow(this.y, 2));
  }
  this.a = function() {
    return Math.atan(this.y/this.x); //RADIANS!!!!!
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
