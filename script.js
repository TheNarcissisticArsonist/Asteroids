htmlELEMENTS = {
  gameBoardCont: document.getElementById("gameBoardCont")
};

boardWidth = 900;
boardHeight = 600;
boardBorderLineStyleString = "stroke: rgba(255,255,255,1);";

var basicBoardOutlineSVG = "\
<svg id='gameBoard' width='"+boardWidth+"' height='"+boardHeight+"'>\
  <line x1='0' y1='0' x2='"+boardWidth+"' y2='0' style='"+boardBorderLineStyleString+"'></line>\
  <line x1='"+boardWidth+"' y1='0' x2='"+boardWidth+"' y2='"+boardHeight+"' style='"+boardBorderLineStyleString+"'></line>\
  <line x1='"+boardWidth+"' y1='"+boardHeight+"' x2='0' y2='"+boardHeight+"' style='"+boardBorderLineStyleString+"'></line>\
  <line x1='0' y1='"+boardHeight+"' x2='0' y2='0' style='"+boardBorderLineStyleString+"'></line>\
</svg>\
"

//Generate the game board
htmlELEMENTS.gameBoardCont.innerHTML = "";
htmlELEMENTS.gameBoardCont.innerHTML = basicBoardOutlineSVG;
