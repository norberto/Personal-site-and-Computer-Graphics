    function draw() {
      var canvas = document.getElementById('canvas');
      if (canvas.getContext) {
        var ctx = canvas.getContext("2d");

// Draw border
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(500,0);
      ctx.lineTo(500,500);
      ctx.lineTo(0,500);
      ctx.closePath();
      ctx.stroke();
// step = 5
      drawF(8);
      }
        // Recursive draw
        function drawF(step) {
          if (step > 0) {
          step = step-1;
          ctx.save();
          ctx.save();
          ctx.transform(0.5, 0, 0, 0.5, 250, 0);
          ctx.rotate(Math.PI/2);
          drawF(step);
          ctx.restore();
          ctx.transform(0.5, 0, 0, 0.5, 250, 250);
          drawF(step);
          ctx.restore();
          ctx.transform(0.5, 0, 0, 0.5, 0, 250);
          drawF(step);
          }
          else drawT();
        }

        function drawT() {
        // Filled red triangle
        //ctx.fillStyle = "rgb(0,0,0)";
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(250,0);
        ctx.lineTo(500,500);
        ctx.lineTo(0,500);
        ctx.fill();
        }
    }
