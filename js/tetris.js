//Prendo il gioco
const canvas = document.getElementById("tetris");
//Il focus viene settato sulla griglia di gioco
canvas.focus();
//Setto il gioco in 2D
var context = canvas.getContext("2d");


context.scale(20,20);


//Dati di inizializzazione

const matrix =
[
  [0,1,1],
  [1,1,0],
  [0,0,0]

]

let grid;

//Giocatore


//variabile globale che tiene il tempo tra un frame e l'altro

let lastTime = 0;

//Variabili che gestiscono il drop dei Tetramini
 let dropCounter = 0;
 //Tempo che passa tra un drop e l'altro
 let dropTimer = 1000;

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
          grid[y + player.pos.y][x + player.pos.y] = value;
        }
      });
   })
 }


 //Funzione che verifica una collisione tra Tetramini
//e tra Tetramino e la Griglia

function collide(grid, player)
{
  const [m, o] = [player.matrix, player.pos];
  for(let y = 0; y < m.length; ++y)
  {
    for(let x = 0; x < m[y].length; ++x)
    {
//Contro se il Tetramino da esaminare collide con la Griglia
//o contro un'altro Tetramino
      if(m[y][x] !== 0 &&
        (grid[y + o.y] && grid[y + o.y][x + o.x] !== 0))
        {
          return true;
        }
        console.log(grid[y + o.y])
    }
  }

  return false;
}

//Funzioni di aggiornamento dati Tetris


function update(time = 0)
{
  const deltaTime = time - lastTime;
  lastTime = time;
  // console.log(lastTime);
  // console.log(dropCounter);
//Il dropCounter aumenta in base a deltaTime
  dropCounter += deltaTime;
  if(dropCounter > dropTimer)
  {
      drop();
  }
  draw();
  requestAnimationFrame(update);
}

//Azioni

//Il drop del Tetramino viene richiamato da più funzioni meglio creare una funzione
//gestisce questa feature
function drop(keyDown = false)
{
    player.pos.y++;
    if(collide(grid, player))
    {
      player.pos.y--;
      merge(grid, player);
      reset();
    }
    dropCounter = 0;
}

//Sposta il Tetramino a sx
function moveLeft()
{
  player.pos.x--;
}
//Sposta il Tetramino a dx
function moveRight()
{
   player.pos.x++;
}

function reset()
{
  player.pos.y = 0;
}



//funzione grafica Tetris
function drawMatrix(matrix, offset)
{
  matrix.forEach((row,y) =>
  {
    row.forEach((value,x) =>
    {
      if(value !== 0)
      {
        context.fillStyle = "#F00";
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
};

function draw()
{
  context.fillStyle = "#000";
  context.fillRect(0,0, canvas.width, canvas.height);
  drawMatrix(player.matrix, player.pos);
}


//Funzioni gestione tastiea

document.addEventListener("keydown", event =>
{
  if(event.keyCode === 65)
  {
    moveLeft();
  }
  else if(event.keyCode === 68)
  {
    moveRight();
  }
  if(event.keyCode === 83)
  {
//Qui il drop viene causato dal player per questo
//viene messo a true l'argomento di player drop
//che di default è settato false
    drop(true);
  }
  if(event.keyCode === 82)
  {
    reset();
  }
});



//Creazione griglia di gioco
grid = createGrid(12, 20);

const player =
{
  pos:{x:0, y:0},
  matrix: matrix
}

console.log(grid);
console.table(grid);

//Loop gioco
update();
