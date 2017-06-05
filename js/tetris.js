//Prendo il gioco
const canvas = document.getElementById("tetris");
//Setto il gioco in 2D
var context = canvas.getContext("2d");

context.scale(20,20);

var matrix =
[
  [0,1,1],
  [1,1,0],
  [0,0,0]
];

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

var offset = {x:5,y:5}
drawMatrix(matrix, offset);
