ProgressCircle = function (){
  var thickness = 10;
  var out = false;
  var PI = Math.PI;
  var print_counter = 0;
  this.draw = function(main_color, secondary_color, elm){
    var element = document.getElementById(elm);
    // set options for the progress circle
    var options = {
      percent:  element.getAttribute('data-percent') || 25,
      size: element.getAttribute('data-size') || 300,
      lineWidth: element.getAttribute('data-line') || 15,
      rotate: element.getAttribute('data-rotate') || 0
    };
    var canvas = document.createElement('canvas'),   // create canvas
        span = document.createElement('span'),       // create span
        ctx = canvas.getContext('2d');               // get context from canvas
    canvas.width = canvas.height = options.size; // set width and height to size defined in options
    var size = options.size,
        radius = size / 2 - size / 4;

    // Set style according to specified size
    span.textContent = options.percent + "%";
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    span.style.width = size + "px";
    span.style.lineHeight = size + "px";
    span.style.fontSize = (size / 15) + "px";

    element.appendChild(span); element.appendChild(canvas);

    // Progress circle drawer
    function drawProgress(progress, radius, __width, color, angle){
      var percentage = progress / 100;
      // Draw the progress circle
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, radius, -PI/2, PI * 2 * percentage - PI/2);
      ctx.translate(size / 2, size / 2);
      ctx.rotate(angle);
      ctx.translate(-size / 2, -size / 2);
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineWidth = __width;
      ctx.stroke();
      ctx.closePath();
    }
    var current_thickness = 10;
    var first = current_thickness;
    var timeout;
    var a;
    var alpha = 0;
    var current_angle = 0;
    var goal_angle = PI;
    var animate = false;

    function doAnimate(thickness){
      print_counter++;
      fps = 60;
      a = PI / 6
      // how fast it inflates/deflates
      speed = 200;
      if(current_thickness <= thickness && inflated)      current_thickness += speed / fps;
      else if(current_thickness > thickness && !inflated) current_thickness -= speed / fps;

      // if(inflated || (!inflated && alpha > 0))
      // alpha = PI / fps;

      console.error("Step: " + print_counter);
      console.log("Alpha: " + alpha * 360 / PI);
      console.log("Inflated[" + inflated + "]");
      console.log("Current angle: " + current_angle * 360 / PI);
      console.log("Goal angle: " + goal_angle * 360 / PI);
      if(inflated && current_angle < PI){
        alpha = a;
        current_angle += a;
        animate = true;
      } else if(!inflated && current_angle > 0){
        alpha = -a;
        current_angle -= a;
        animate = true;
      } else animate = false;
      // if(!inflated) alpha = -alpha;
      if(current_angle > PI) {
        alpha = 0;
        current_angle = PI;
      } else if(current_angle < 0){
        alpha = 0;
        current_angle = 0;
      }

      clear();
      drawProgress(            100, radius, current_thickness, secondary_color, alpha);
      drawProgress(options.percent, radius, current_thickness, main_color,      alpha);
      // Animate util inflated
      if(animate){
        timeout = setTimeout(function(){ doAnimate(thickness); }, 1000 / fps);
      }
        // if(current_angle <= goal_angle) timeout = setTimeout(function(){ doAnimate(thickness); }, 1000 / fps);
        // else current_angle = 0;
    }

    // First render before mouse move
    clear();
    drawProgress(            100, radius, thickness, secondary_color, alpha);
    drawProgress(options.percent, radius, thickness, main_color,      alpha);


    // Inflate circle on mouseover
    var inflated = false;

    // event listeners -- begin
    element.addEventListener ("mouseout", function(){
      if(inflated){
        console.log("inside");
        thickness = 10;
        span.textContent = options.percent + "%";
        // span.textContent = part;
        deflate(thickness);
        goal_angle = 0;
        out = true;
      }
    }, false);

    canvas.onmousemove = function (evnt) {
      //Get mouse position
      var pos = getMousePos(canvas, evnt);
      // Get mouse position
      Y = Math.min(size, Math.max(0, pos.y));
      X = Math.min(size, Math.max(0, pos.x));

      // d - distance to mouse position from circle center
      // sqrt(Xp - Xc)^2 + (Yp - Yc)^2, where p - point, c - center
      d = Math.sqrt(Math.pow((X - size / 2), 2) + Math.pow((Y - size / 2), 2));

      if(d <= radius + thickness / 2  && !out){
        thickness = 20;
        span.textContent = level(options.percent);
        inflate(thickness);
        alpha = 0;
        out = false;
        goal_angle = PI;
      } else {
        span.textContent = options.percent + "%";
        goal_angle = 0;
        out = false;
        alpha = 0;
        thickness = 10;
        console.log("inside");
        deflate(thickness);
      }
    };
    // event listeners -- end

    // Clears canvas
    function clear(){
      ctx.clearRect(0, 0, size, size);
    }

    function deflate(thickness){
      if(current_thickness > thickness && inflated){
        clearTimeout(timeout);
        inflated = false;
        doAnimate(thickness);
      }
    }

    function inflate (thickness){
      if(current_thickness < thickness && !inflated){
        clearTimeout(timeout);
        inflated = true;
        doAnimate(thickness);
      }
    }
  };
  function getMousePos(canvas, evnt) {
      var rect = canvas.getBoundingClientRect();
      return {
          x: evnt.clientX - rect.left,
          y: evnt.clientY - rect.top
      };
  }

  function level(p) {
    if(p < 20) return "Novice";
    if(p < 40) return "Beginner";
    if(p < 60) return "Intermediate";
    if(p < 80) return "Advanced";
    if(p < 100) return "Expert";
    else return "Wizard";

  }
};
