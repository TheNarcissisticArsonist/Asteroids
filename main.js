var newGame = document.getElementById("new");
var level = document.getElementById("currentLevel");
var levelCont = document.getElementById("level");
var score = document.getElementById("currentScore");
var scoreCont = document.getElementById("score");
var gameBoard = document.getElementById("gameBoard");

newGame.addEventListener("click", function() {
  levelCont.style.display = "inline-block";
  scoreCont.style.display = "inline-block";
  gameBoard.style.display = "inline-block";
});
