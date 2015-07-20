var newGame = document.getElementById("new");
var levelDisp = document.getElementById("currentLevel");
var levelCont = document.getElementById("level");
var scoreDisp = document.getElementById("currentScore");
var scoreCont = document.getElementById("score");
var livesDisp = document.getElementById("lives");
var gameBoard = document.getElementById("gameBoard");
var infoCont = document.getElementById("spaceshipInfo");
var alertBox;
var score;
var level;
var lives;

var inTimeoutSequence = false;
var firstGame = true;

var maxLives = 3;
var levelAsteroids = 3;
var maxAsteroidVelocity = 2;
var spaceshipAcceleration = 0.4;

var spaceship = {};
function asteroid(size, pos, vel, acl) {
  this.size = size;
  this.pos = pos;
  this.vel = vel;
  this.acl = acl;
  this.velM = Math.sqrt(Math.pow(vel[0], 2) + Math.pow(vel[1], 2));
  this.aclM = Math.sqrt(Math.pow(acl[0], 2) + Math.pow(acl[1], 2));
  this.angle = Math.floor(Math.random() * 360);
}
var asteroids = [];

keys = {
  w: false,
  a: false,
  d: false
};

function setUpLevelHTML(numAsteroids) {
  htmlString = "<img class=\"gameObject\" id=\"ship\" src=\"Spaceship.png\" style=\"display: none;\"></img>"
  for(i=0; i<numAsteroids; ++i) {
    htmlString += "<img class=\"gameObject bigAsteroid\" id=\"bigAsteroid"+i+"\"src=\"Asteroid.png\" style=\"display: none;\"></img>";
  }
  htmlString += "<div id=\"alertBox\" style=\"display: none;\">Alert Box</div>"
  return htmlString;
}
function updateUserDisplay() {
  levelDisp.innerHTML = String(level);
  scoreDisp.innerHTML = String(score);
  livesDisp.innerHTML = "";
  for(i=0; i<lives; ++i) {
    livesDisp.innerHTML += "<img src=\"Spaceship.png\"></img>";
  }
}
function updateGameBoard() {
  for(i=0; i<asteroids.length; ++i) {
    asteroids[i][1].style.left = String(asteroids[i][0].pos[0]) + "px";
    asteroids[i][1].style.top = String(asteroids[i][0].pos[1]) + "px";
    asteroids[i][1].style.display = "inline-block";
  }
  spaceship[1].style.left = String(spaceship[0].pos[0]) + "px";
  spaceship[1].style.top = String(spaceship[0].pos[1]) + "px";
  spaceship[1].style.display = "inline-block";
}
function generateGameObjects() {
  for(i=0; i<levelAsteroids; ++i) {
    asteroids[i] = new asteroid(3, [0, 0], [0, 0], [0, 0]);
    asteroids[i] = [asteroids[i], document.getElementById("bigAsteroid"+i)];
  }
  spaceship = [spaceship, document.getElementById("ship")];
}
function startingStateObjects() {
  asteroidsRandomPosition();
  asteroidsRandomVelocity();
  updateMagnitude();
  spaceship[0].pos = [600, 300];
}
function asteroidsRandomPosition() {
  for(i=0; i<levelAsteroids; ++i) {
    do {
      asteroids[i][0].pos[0] = Math.floor(Math.random() * 1200 + 1);
      asteroids[i][0].pos[1] = Math.floor(Math.random() * 600 + 1);
    }
    while(
      !(
        (asteroids[i][0].pos[0] > 800 || asteroids[i][0].pos[0] < 400)
        &&
        (asteroids[i][0].pos[0] < (1200-50) && asteroids[i][0].pos[0] > (0+50))
        &&
        (asteroids[i][0].pos[1] > 500 || asteroids[i][0].pos[1] < 100)
        &&
        (asteroids[i][0].pos[1] < (600-50) && asteroids[i][0].pos[1] > (0+50))
      )
    );
  }
}
function asteroidsRandomVelocity() {
  for(i=0; i<levelAsteroids; ++i) {
    asteroids[i][0].vel[0] = Math.random() * maxAsteroidVelocity;
    asteroids[i][0].vel[1] = Math.sqrt(Math.pow(maxAsteroidVelocity, 2) - Math.pow(asteroids[i][0].vel[0], 2));
    constant = Math.random();
    asteroids[i][0].vel[0] *= constant;
    asteroids[i][0].vel[1] *= constant;
  }
}
function updateMagnitude() {
  for(i=0; i<asteroids.length; ++i) {
    asteroids[i][0].velM = Math.sqrt(Math.pow(asteroids[i][0].vel[0], 2) + Math.pow(asteroids[i][0].vel[1], 2));
    asteroids[i][0].aclM = Math.sqrt(Math.pow(asteroids[i][0].acl[0], 2) + Math.pow(asteroids[i][0].acl[1], 2));
  }
  spaceship[0].velM = Math.sqrt(Math.pow(spaceship[0].vel[0], 2) + Math.pow(spaceship[0].vel[1], 2));
  spaceship[0].aclM = Math.sqrt(Math.pow(spaceship[0].acl[0], 2) + Math.pow(spaceship[0].acl[1], 2));
}
function levelIntro(levelNum) {
  alertBox.innerHTML = "Level " + String(levelNum);
  alertBox.style.display = "inline-block"
  inTimeoutSequence = true;
  window.setTimeout(function() {
    alertBox.innerHTML = "";
    alertBox.style.display = "none";
    window.setTimeout(function() {
      alertBox.innerHTML = "Get ready...";
      alertBox.style.display = "inline-block";
      window.setTimeout(function() {
        alertBox.innerHTML = "";
        alertBox.style.display = "none";
        window.setTimeout(function() {
          alertBox.innerHTML = "Go!";
          alertBox.style.display = "inline-block";
          updateUserDisplay();
          updateGameBoard();
          window.setTimeout(function() {
            alertBox.innerHTML = "";
            alertBox.style.display = "none";
            inTimeoutSequence = false;
          }, 750);
        }, 750);
      }, 750);
    }, 750);
  }, 750);
}
function updateComponents() {
  for(i=0; i<asteroids.length; ++i) {
    asteroids[i][0].acl[0] = asteroids[i][0].aclM * Math.sin(asteroids[i][0].angle * Math.PI / 180);
    asteroids[i][0].acl[1] = asteroids[i][0].aclM * Math.cos(asteroids[i][0].angle * Math.PI / 180);
  }
  spaceship[0].acl[0] = spaceship[0].aclM * Math.sin(spaceship[0].angle * Math.PI / 180);
  spaceship[0].acl[1] = -1 * spaceship[0].aclM * Math.cos(spaceship[0].angle * Math.PI / 180);
}
function updateData() {
  document.getElementById("pos").innerHTML = "pos:" + spaceship[0].pos;
  document.getElementById("vel").innerHTML = "vel:" + spaceship[0].vel;
  document.getElementById("acl").innerHTML = "acl:" + spaceship[0].acl;
  document.getElementById("velM").innerHTML = "velM:" + spaceship[0].velM;
  document.getElementById("aclM").innerHTML = "aclM:" + spaceship[0].aclM;
  document.getElementById("angle").innerHTML = "angle:" + spaceship[0].angle;
}

newGame.addEventListener("click", function() {
  if(inTimeoutSequence) {
    return;
  }
  startNewGame();
});
function startNewGame() {
  if(!firstGame) {
    window.clearInterval(mainLoop);
  }
  firstGame = false;

  levelCont.style.display = "inline-block";
  scoreCont.style.display = "inline-block";
  gameBoard.style.display = "inline-block";

  spaceship = {
    pos: [0, 0],
    vel: [0, 0],
    acl: [0, 0],
    velM: 0,
    aclM: 0,
    angle: 0
  };

  score = 0;
  level = 1;
  lives = maxLives;

  gameBoard.innerHTML = setUpLevelHTML(levelAsteroids);
  generateGameObjects();
  startingStateObjects();

  alertBox = document.getElementById("alertBox");

  levelIntro(1);
  mainLoop = window.setInterval(physicsLoop, 33);
};

document.addEventListener("keydown", function(event) {
  if(inTimeoutSequence) {
    return;
  }
  switch(event.which) {
    case 78: //n
      startNewGame();
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
  if(inTimeoutSequence) {
    return;
  }
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

function physicsLoop() {
  //Spaceship
    //Acceleration
    if(keys.w) {
      spaceship[0].aclM = spaceshipAcceleration;
    }
    else{
      spaceship[0].aclM = 0;
    }
    updateComponents();
    //Velocity
    spaceship[0].vel[0] += spaceship[0].acl[0];
    spaceship[0].vel[1] += spaceship[0].acl[1];
    updateMagnitude();
    //Position
    spaceship[0].pos[0] += spaceship[0].vel[0];
    spaceship[0].pos[1] += spaceship[0].vel[1];
    //Test if off screen
    if(spaceship[0].pos[0] > 1200) {
      spaceship[0].pos[0] -= 1200;
    }
    else if(spaceship[0].pos[0] < 0) {
      spaceship[0].pos[0] += 1200;
    }
    if(spaceship[0].pos[1] > 600) {
      spaceship[0].pos[1] -= 600;
    }
    else if(spaceship[0].pos[1] < 0) {
      spaceship[0].pos[1] += 600;
    }
    //Display position
    spaceship[1].style.left = String(spaceship[0].pos[0]-32) + "px";
    spaceship[1].style.top = String(spaceship[0].pos[1]-32) + "px";

  //Asteroids


  updateData();
}
