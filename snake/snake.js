const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

const snake = {
  direction: "right",
  body: [
    { x: 4, y: 2 },
    { x: 3, y: 2 },
    { x: 2, y: 2 },
  ],
};

let apple = { x: 10, y: 10 };
let gameOver = false;

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && snake.direction !== "down") {
    snake.direction = "up";
  } else if (event.key === "ArrowDown" && snake.direction !== "up") {
    snake.direction = "down";
  } else if (event.key === "ArrowLeft" && snake.direction !== "right") {
    snake.direction = "left";
  } else if (event.key === "ArrowRight" && snake.direction !== "left") {
    snake.direction = "right";
  }
});

function generateApple() {
  apple = {
    x: Math.floor(Math.random() * gridWidth),
    y: Math.floor(Math.random() * gridHeight),
  };
}

function checkCollision() {
  const head = snake.body[0];
  if (head.x < 0 || head.y < 0 || head.x >= gridWidth || head.y >= gridHeight) {
    gameOver = true;
  }
}

function draw() {
  if (gameOver) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f00";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    return;
  }

  // Dessine le fond du canvas
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dessine la pomme
  ctx.fillStyle = "#f00";
  ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize, gridSize);

  // Dessine le serpent
  ctx.fillStyle = "#0f0";
  snake.body.forEach((part) => {
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
  });

  // Déplace le serpent
  const head = { x: snake.body[0].x, y: snake.body[0].y };
  if (snake.direction === "up") {
    head.y--;
  } else if (snake.direction === "down") {
    head.y++;
  } else if (snake.direction === "left") {
    head.x--;
  } else if (snake.direction === "right") {
    head.x++;
  }
  snake.body.unshift(head);

  // Vérifie si le serpent a mangé la pomme
  if (head.x === apple.x && head.y === apple.y) {
    snake.body.push(snake.body[snake.body.length - 1]);
    generateApple();
  } else {
    snake.body.pop();
  }

  checkCollision();
}

generateApple();
setInterval(draw, 100);
