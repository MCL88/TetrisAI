//Prendo il gioco
const canvas = document.getElementById("tetris");
const next = document.getElementById("next");
//Il focus viene settato sulla griglia di gioco
canvas.focus();
//Setto il gioco in 2D
var context = canvas.getContext("2d");
var nextctx = next.getContext("2d");


context.scale(20,20);
nextctx.scale(20,20);


//Dati di inizializzazione


let grid;

//Giocatore


//variabile globale che tiene il tempo tra un frame e l'altro

let lastTime = 0;

//Variabili che gestiscono il drop dei Tetramini
 let dropCounter = 0;
 //Tempo che passa tra un drop e l'altro
 let dropTimer = 1000;



//Dati AI
let currentShape;
let nextShape;
let bag = [];
let bagIndex = 0;
//Attivo l'AI del gioco
let ai = 0;
//aggiornamento grafici vs AI Genetics
let mutex;
//Cambio velocità
let changeSpeed = false;

//Stati del gioco
//Salva lo stato attuale del gioco. Viene ricaricato successivamente
let saveState
//contiene lo stato attuale del gioco
let currentState;

//Opzioni Gioco
let speed = [.500, .200, .2, .1];
let speedIndex = 0;
//velocità del gioco
let fpsInterval = 1000/speed[speedIndex];

 //Creazione Griglia di gioco di tetris

 function createGrid(w, h)
 {
   const arena = []
   while(h--)
   {
     arena.push(new Array(w).fill(0));
   }
   return arena;
 }

 //Funzione che crea i Tetramini
 function createPiece(type)
 {
  if(type === "S")
  {
    return [
             [0,1,1],
             [1,1,0],
             [0,0,0]
           ]
  }
  if(type === "T")
  {
    return [
             [2,2,2],
             [0,2,0],
             [0,0,0]
           ]
  }
  if(type === "Z")
  {
    return [
             [3,3,0],
             [0,3,3],
             [0,0,0]
           ]
  }
  if(type === "L")
  {
    return [
             [4,0,0],
             [4,0,0],
             [4,4,0]
           ]
  }
  if(type === "J")
  {
    return [
             [0,5,0],
             [0,5,0],
             [5,5,0]
           ]
  }
  if(type === "O")
  {
    return [
             [6,6],
             [6,6]
           ]
  }
  if(type === "I")
  {
    return [
             [0,7,0,0],
             [0,7,0,0],
             [0,7,0,0],
             [0,7,0,0]
           ]
  }
 }

 const colors =
 [
   null,
   'red',
   'blue',
   'orange',
   'green',
   'yellow',
   'lightblue',
   'darkblue'
 ]

 //funzione che inserisce i Tetramini all'interno
 //della Griglia

 function merge(grid, player)
 {
   player.matrix.forEach((row, y) =>
   {
      row.forEach((value, x) =>
      {
        if(value !== 0)
        {
          grid[y + player.pos.y][x + player.pos.x] = value;
        }
      });
   })
 }


 //Funzione che verifica una collisione tra Tetramini
//e tra Tetramino e la Griglia

//Funzione del disagio

function collide(grid, player)
{
  const m = player.matrix;
  const o = player.pos;
  for(let y = 0; y < m.length; ++y)
  {
    for(let x = 0;x < m[y].length; ++x)
    {
      if(m[y][x] !== 0 && (grid[y + o.y] && grid[y + o.y][x + o.x]) !== 0)
      {
        return true;
      }
    }
  }
  return false;
}

//Funzioni di aggiornamento dati Tertis


function update(time = 0)
{
  const deltaTime = (time - lastTime);
  lastTime = time;
  // console.log(lastTime);
  // console.log(dropCounter);
//Il dropCounter aumenta in base a deltaTime
  dropCounter += (deltaTime % fpsInterval);
  if(dropCounter > dropTimer)
  {
      drop();
  }
  draw();
  requestAnimationFrame(update);
}

function updateScore()
{
  document.getElementById("score").innerText = "Punteggio: " + player.score;
}

function gridSweep()
{
  let rowCount = 1;
  outer: for(let y = grid.length - 1; y > 0; --y)
  {
    for(let x = 0;x < grid[y].length; ++x)
    {
//Se è presente una buco nella riga y
      if(grid[y][x] == 0)
        continue outer;
    }
      const row = grid.splice(y,1)[0].fill(0);
      grid.unshift(row);
      ++y;

      player.score += rowCount * 10;
      rowCount *= 2;
  }




}

//Azioni
//Il drop del Tetramino viene richiamato da più funzioni meglio creare una funzione
//gestisce questa feature
function drop()
{
    player.pos.y++;
    if(collide(grid, player))
    {
      player.pos.y--;
      merge(grid, player);
      reset();
      gridSweep();
      updateScore();
    }
    dropCounter = 0;
}

function move(dir)
{
  player.pos.x += dir;
  if(collide(grid, player))
  {
    player.pos.x -= dir;
  }
}

//Funzione che si occupa della rotazionje
function rotate(matrix, dir)
{
//Traposta della matrice
  for(let y = 0; y < matrix.length; ++y)
  {
    for(let x = 0; x < y; ++x)
    {
        [
          matrix[x][y],
          matrix[y][x]
        ] =
        [
          matrix[y][x],
          matrix[x][y]
        ]
    }
  }
  if(dir > 0)
  {
    matrix.forEach(row => row.reverse());
  }
  else
  {
    matrix.reverse()
  }
}

function playerRotate(dir)
{
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while(collide(grid, player))
  {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if(offset > player.matrix[0].length)
    {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

//Creo i Tetramini
function playerReset()
{
  const pieces = "ILJOTSZ";
  currentShape = currentShape ? nextShape : createPiece(pieces[pieces.length * Math.random() | 0]);
  nextShape = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.matrix = currentShape;
  player.pos.y = 0;
  player.pos.x = (grid[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if(collide(grid, player))
  {
    grid.forEach(row => row.fill(0));
    player.score = 0;
  }
}

function reset()
{
  playerReset();
}



//funzione grafica Tetris
function drawMatrix(matrix, offset, next = false)
{
  matrix.forEach((row,y) =>
  {
    row.forEach((value,x) =>
    {
      if(!next)
      {
        if(value !== 0)
        {
          context.strokeStyle = "gray";
          context.lineWidth = "0.5px";
          context.fillStyle = colors[value];
          context.fillRect(x + offset.x, y + offset.y, 1, 1);
          context.stroke();
        }
      }
      else
      {
        nextctx.strokeStyle = "gray";
        nextctx.lineWidth = "0.5px";
        nextctx.fillStyle = colors[value];
        nextctx.fillRect(x + offset.x, y + offset.y, 1, 1);
        nextctx.stroke();
      }
    });
  });
};

//Funzione che si occupa nel disegno dei Tetramini
function draw()
{
  context.fillStyle = "#000";
  nextctx.fillStyle = "grey";
  context.fillRect(0,0, canvas.width, canvas.height);
  nextctx.fillRect(0,0, nextctx.width, nextctx.height);
  drawMatrix(player.matrix, player.pos);
  drawMatrix(nextShape,{x:2, y:2}, true);
  drawMatrix(grid ,{x:0, y:0})
}


//Funzioni gestione tastiera

document.addEventListener("keydown", event =>
{
  if(event.keyCode === 65)
  {
    move(-1);
  }
  else if(event.keyCode === 68)
  {
    move(1);
  }
  if(event.keyCode === 87)
  {
    playerRotate(-1);
  }
  if(event.keyCode === 83)
  {
//Qui il drop viene causato dal player per questo
//viene messo a true l'argomento di player drop
//che di default è settato false
    drop();
    player.score += 1;
    updateScore();
  }
  if(event.keyCode === 82)
  {
    reset();
  }
  if(event.keyCode === 32)
  {
    speedIndex = (speedIndex + 1)%4;
    fpsInterval = 1000/speed[speedIndex];
  }
});



//Creazione griglia di gioco
grid = createGrid(12, 20);

const player =
{
  pos:{x:5, y:0},
  matrix: currentShape,
  score: 0
}

console.log(grid);
console.table(grid);

//Loop gioco
playerReset();
update();
