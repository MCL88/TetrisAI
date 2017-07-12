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
let ai = false;
//aggiornamento grafici vs AI Genetics
let draw;
//Cambio velocità
let changeSpeed = false;
let moves = 0;
let moveLimit = 500;
let generation = 0;
let moveAlgorithm = [];
let inspectMoveSelection = false;

//Stati del gioco
//Salva lo stato attuale del gioco. Viene ricaricato successivamente
let saveState
//contiene lo stato attuale del gioco
let currentState;

//Opzioni Gioco
let speed = [500, 200, 2, 0];
let speedIndex = 0;
//velocità del gioco
let fpsInterval = 1000/speed[speedIndex];

//Dati algoritmo genetico
let populationSize = 50;
let genomes = [];
let currentGenome = -1;
let generation = 0;
let archive =
{
  populationSize: 0,
  currentGeneration: 0,
  elites: [],
  genomes: []

}
//possibilità di mutazione del genoma
let mutationRate = 0.025;
//Velore utilizzato per modificare il genoma
let mutationStep = 0.2;


//Funzioni AI
function initialize()
{
  archive.populationSize = populationSize;
  nextShape();
  applyShape();
  saveState = getState();
  currentState = getState();

  createInitialPopulation();

  let loop = function()
  {
    if(changeSpeed)
    {
      clearInterval(interval);
      interval = setInterval(loop, speed);
      changeSpeed = false;
    }
//Se il gioco è fermo, non vengono aggiornati gli elementi su schermo
    if(speed == 0)
    {
      draw = false;
      update();
      update();
      update();
    }
    else
    {
      draw = true;
    }
    update();
    if(speed === 0)
    {
      draw = true;
      updateScore();
    }
  };
  var interval = setInterval(loop, speed);
}

function createInitialPopulation()
{
  let genomes = [];

  for(let i = 0; i < populationSize; i++)
  {
    genome =
    {
      //identificativo per distingure il genoma
          id: Math.random(),
      //Il peso di ogni riga eliminata dalla mossa data.
      // Alto è il peso, più righe vengono ripulite dalla mossa
          rowsCleared: Math.random() - 0.5,
      //L'altezza assoluta della più grande pila di blocchi come potenza di 1.5
          weightedHeight: Math.random() - 0.5,
      //La somma di tutte le altezze delle pile di blocchi presenti
          cumulativeHeight: Math.random() - 0.5,
      //L'altezza della pila più alta meno quella più piccola
          relativeHeight: Math.random() - 0.5,
      //La somma di tutte le celle vuote presenti nella grigia di gioco
          holes:  Math.random() * 0.5,
      //La somma delle differenze tra la pile più alta e quelle più piccole di quest'ultima
      //(esempio, se le pile sono piatte il valore di roughness è pari a 0)
          roughness: Math.random() - 0.5

    }
    genomes.push(genome);
  }
  evalutateNextGeneration();
}

//Valuta il prossimo genoma della popolazione.
//Se non ci sono più genomi da esaminare, si passa all'evoluzione della popolazione

function evalutateNextGeneration()
{
  currentGenome++;
  if(currentGenome === genomes.length)
  {
    evolve();
  }
  //carica lo stato corrente del gioco
  loadState(currentState);
  //resetta il numero di mosse eseguite
  move = 0;
  //esegue una nuova mossa
  makeNextMove();
}

//Evolve un'intera popolazione per passare alla prossima generazione

function evolve()
{
  console.log("Generazione " + generation + " controllata");
  currentGenome = 0;
  generation++;
//Resetta il gioco
  reset();
//ottengo lo stato di gioco corrente
roundstate = getState();
//ordino i genomi in base al loro valore di fitness
genomes.sort(function(a, b)
{
  return b.fitness - a.fitness;
});

//Aggoiungi una copia dei genomi con il più alto valore di fitness
archive.elites.push(genomes[0]);
console.log("Miglior prestazione: " + genomes[0].fitness);
//Vengono eliminati con il più basso valore di fitness
while(genomes.length > populationSize/2)
{
  genomes.pop();
}
//somma totale delle fitness dei genoma
let totalFitness;
for(let i = 0; i < genomes.length; i++)
{
  totalFitness += genomes[i].fitness;
}

//creo una funzione innestata che sceglie a random un genoma

function getRandomGenome()
{
  return genomes[randomWeightedNumBetween(0, genomes.length - 1)];
}

//creo un array figli
let children = [];
//metto in cima a children il genoma con il più grande punteggio di fitness
children.push(genome[0]);
while(children.length < populationSize)
{
  //crossover tra 2 genomi presi a random
  children.push(makeChild(getRandomeGenome(), getRandomGenome()));
}

genomes = [];
genomes = genomes.concat(children);
//memorizzo i geni nell'archivio
archive.genomes = clone(genomes);
//setto la generazione corrente su archive
archive.currentGeneration = clone(generation);
console.log(JSON.stringify(archive));
//memorizzo in memoria temporanea archive
localStorage.setItem("archive",JSON.stringify(archive))
}

//Creo un figlio da 2 genoma genitori

//Makechild now

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
window.onload = initialize();
