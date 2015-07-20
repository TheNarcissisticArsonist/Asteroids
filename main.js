var newGame = document.getElementById("new");
var level = document.getElementById("currentLevel");
var levelCont = document.getElementById("level");
var score = document.getElementById("currentScore");
var scoreCont = document.getElementById("score");
var gameBoard = document.getElementById("gameBoard");

function setUpLevel(numAsteroids) {
  htmlString = "<img class=\"gameObject\" id=\"ship\" src=\"Spaceship.png\"></img>"
  for(i=0; i<numAsteroids; ++i) {
    htmlString += "<img class=\"gameObject bigAsteroid\" src=\"Asteroid.png\"></img>";
  }
  return htmlString;
}

newGame.addEventListener("click", function() {
  levelCont.style.display = "inline-block";
  scoreCont.style.display = "inline-block";
  gameBoard.style.display = "inline-block";
  gameBoard.innerHTML = setUpLevel(3);
});
