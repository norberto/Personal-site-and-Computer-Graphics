var newSpeed = 20,
    fps = 60,
    debug = false,
    counter = 0;

function draw(){
  var canvas = document.getElementById('canvas'),
      context = canvas.getContext('2d'),
      W = canvas.width,
      H = canvas.height,
      interval = 1000 / fps,

      rotor_color = "rgba(255,0,0,0.5)",
      active      = "rgba(0,255,0, 0.2)",
      additional  = "rgba(255,255,255,0.1)",
      inactive    = "rgba(255,0,0,0.2)",
      stroke      = "rgba(61, 142, 198, 1)";

  var    actualX = 30;
  var    actualY = 30;
  var MAIN_TEETH =  5;
  var connectionR = 2;

  var Gear = function(x, y, connectionRadius, teeth, fillStyle, strokeStyle, rotate) {
      // Gear parameters
      this.rotate = rotate;
      this.direction = "left";
      this.x = x;
      this.y = y;
      this.connectionRadius = connectionRadius;
      this.teeth = teeth;

      // Render parameters
      this.fillStyle = fillStyle;
      this.strokeStyle = strokeStyle;
      // Calculated properties
      this.diameter = teeth * 4 * connectionRadius;
      this.radius = this.diameter / (2 * Math.PI); // D = 2 PI r

      // Animation properties
      this.phi0 = 0; // Starting angle
      this.angularSpeed = 20; // Speed of rotation in degrees per second
      this.createdAt = new Date(); // Timestamp
  };

  // Gear rendering function
  Gear.prototype.render = function (context) {
        // Update rotation angle
        var ellapsed = new Date() - this.createdAt;
        var phiDegrees = this.angularSpeed * (ellapsed / 1000);
        var phi = this.phi0 + ((phiDegrees / 180 * Math.PI)); // Current angle

        // Set-up rendering properties
        context.fillStyle = this.fillStyle;
        context.strokeStyle = this.strokeStyle;
        context.lineCap = 'round';
        context.lineWidth = 1;


        // Draw gear body
        context.beginPath();
        context.lineJoin = "bevel";
        var outerRadius = this.radius+ this.connectionRadius/2;
        var innerRadius = outerRadius - this.connectionRadius*2;
        for(var n = 0; n <= this.teeth * 2; n++) {
          var radius = null;
          var alpha = 0;

          if(n % 2 === 0)radius = outerRadius;
          else radius = innerRadius;

          alpha += 2 * Math.PI * (n / (this.teeth * 2)) + phi;
          var x = this.x + (radius * Math.cos(alpha));
          var y = this.y + (radius * Math.sin(alpha));

          if(n === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        DEBUG();
        if(debug){
          context.fillStyle = "rgba(0,0,0,0.3)";
          context.lineTo(this.x, this.y);
        }
        context.fill();
        context.stroke();


        //Center
        context.beginPath();
        context.arc(this.x, this.y, this.connectionRadius, 0, 2 * Math.PI, false);
        context.fillStyle = "white"; // center fill
        context.fill();
        context.lineWidth = 3;
        context.strokeStyle = stroke; // center outline
        context.stroke();
        context.restore();

    };

    Gear.prototype.connect2 = function (x, y, radius, color, rotate) {
      var r = this.radius;
      var dist = distance(x, y, this.x, this.y);
      // To create new gear we have to know the number of its touth
      // Commented newRadius would change connected gears radius depending on the (x,y) pos.
      var newRadius = Math.max(dist - r, 10);
      // var newRadius = radius;
      var newDiam = newRadius * 2 * Math.PI;
      var newTeeth = Math.round(newDiam / (4 * this.connectionRadius));

      // Calculate the ACTUAL position for the new gear, that would allow it to interlock with this gear
      var actualDiameter = newTeeth * 4 * this.connectionRadius;
      var actualRadius = actualDiameter / (2 * Math.PI);
      var actualDist = r + actualRadius; // Actual distance from center of this gear
      var alpha = Math.atan2(y - this.y, x - this.x); // Angle between center of this gear and (x,y)
      var actualX = this.x + Math.cos(alpha) * actualDist;
      var actualY = this.y + Math.sin(alpha) * actualDist;

      // Make new gear
      var newGear = new Gear(actualX, actualY, this.connectionRadius, newTeeth, color, this.strokeStyle, rotate);

      // Adjust new gear's rotation to be in direction oposite to the original
      var gearRatio = this.teeth / newTeeth;
      newGear.angularSpeed = -this.angularSpeed * gearRatio;

      // At time t=0, rotate this gear to be at angle Alpha
      this.phi0 = alpha + (this.phi0 - alpha); // = this.phi0, does nothing, for demonstration purposes only

      newGear.phi0 = alpha + Math.PI + (Math.PI / newTeeth) + (this.phi0 - alpha) * (newGear.angularSpeed / this.angularSpeed);
      // At the same time (t=0), rotate the new gear to be at (180 - Alpha), facing the first gear,
      // And add a half gear rotation to make the teeth interlock
      newGear.createdAt = this.createdAt; // Also, syncronize their clocks
      return newGear;
    };

  // Gear connecting function
  Gear.prototype.connect = function (x, y, radius, color, rotate) {
    var r = this.radius;
    var dist = distance(x, y, this.x, this.y);
    // To create new gear we have to know the number of its touth
    // Commented newRadius would change connected gears radius depending on the (x,y) pos.
    // var newRadius = Math.max(dist - r, 10);
    var newRadius = radius;
    var newDiam = newRadius * 2 * Math.PI;
    var newTeeth = Math.round(newDiam / (4 * this.connectionRadius));

    // Calculate the ACTUAL position for the new gear, that would allow it to interlock with this gear
    var actualDiameter = newTeeth * 4 * this.connectionRadius;
    var actualRadius = actualDiameter / (2 * Math.PI);
    var actualDist = r + actualRadius; // Actual distance from center of this gear
    var alpha = Math.atan2(y - this.y, x - this.x); // Angle between center of this gear and (x,y)
    var actualX = this.x + Math.cos(alpha) * actualDist;
    var actualY = this.y + Math.sin(alpha) * actualDist;

    // Make new gear
    var newGear = new Gear(actualX, actualY, this.connectionRadius, newTeeth, color, this.strokeStyle, rotate);

    // Adjust new gear's rotation to be in direction oposite to the original
    var gearRatio = this.teeth / newTeeth;
    newGear.angularSpeed = -this.angularSpeed * gearRatio;

    // At time t=0, rotate this gear to be at angle Alpha
    this.phi0 = alpha + (this.phi0 - alpha); // = this.phi0, does nothing, for demonstration purposes only

    newGear.phi0 = alpha + Math.PI + (Math.PI / newTeeth) + (this.phi0 - alpha) * (newGear.angularSpeed / this.angularSpeed);
    // At the same time (t=0), rotate the new gear to be at (180 - Alpha), facing the first gear,
    // And add a half gear rotation to make the teeth interlock
    newGear.createdAt = this.createdAt; // Also, syncronize their clocks
    return newGear;
  };

  // (x, y, connectionRadius, teeth, fillStyle, strokeStyle, rotate)
  var main_gear = new Gear(actualX, actualY, connectionR, MAIN_TEETH, rotor_color, stroke, true),
      large_gear = new Gear((W / 3), (H / 2), connectionR, MAIN_TEETH * 60, inactive, stroke, false),
      secondary_gear = large_gear.connect2(4 * (W / 6), H / 3, large_gear.radius / 5, inactive, false);
      // var xxx = secondary_gear.connect2(1300, H / 2, large_gear.radius / 5, inactive, false);

  // Helper function to translate (x,y) to coordinates relative to the canvas
  // Actions to do after changing mouse position
  canvas.onmousemove = function (evnt) {
    //Get mouse position
    var pos = getMousePos(canvas, evnt);
    actualY = Math.min(H, Math.max(0, pos.y));
    actualX = Math.min(W, Math.max(0, pos.x));
    update(actualX, actualY);
  };
  var lastX = actualX;
  var lastY = actualY;

  function update(x, y){
    //Connect the second not moving gear to the first one
    secondary_gear = large_gear.connect2(secondary_gear.x, secondary_gear.y, secondary_gear.radius, inactive, false);
    // xxx = secondary_gear.connect2(xxx.x, xxx.y, xxx.radius, inactive, false);
    // Check gear collision
    rotate(true);
    stop = false;

    if(detectCollision(x, y, main_gear.radius, large_gear)){
        // Connect main gear to large gear
        main_gear = large_gear.connect(x, y, main_gear.radius, rotor_color, true);
        reverse("left");
        activate(large_gear);
        other(secondary_gear);
        connected = 2;
    } else if(detectCollision(x, y, main_gear.radius, secondary_gear)){
        // Connect main gear to secondary gear
        main_gear = secondary_gear.connect(x, y, main_gear.radius, rotor_color, true);
        activate(secondary_gear);
        other(large_gear);
        reverse("right");
        connected = 1;
    } else {
        // Disconnect main gear from other gears
        main_gear = new Gear(x, y, connectionR, MAIN_TEETH, rotor_color, stroke, true);
        rotate(false);
        disable(large_gear);
        disable(secondary_gear);
        connected = 0;
    }
    var collidesWithLarge = detectCollision(main_gear.x, main_gear.y, main_gear.radius, large_gear);
    var collidesWithSecondary = detectCollision(main_gear.x, main_gear.y, main_gear.radius, secondary_gear);

    if (collidesWithLarge && collidesWithSecondary) {
      main_gear = large_gear.connect(lastX, lastY, main_gear.radius, rotor_color, true);
      reverse("left");
      activate(large_gear);
      other(secondary_gear);
      rotate(true);
    } else {
      lastX = main_gear.x;
      lastY = main_gear.y;
    }
  }
  var connected = 0;
  var time = 0;
  function callback(){
    // Change rotor speed to sliders value.
    main_gear.angularSpeed = newSpeed * 6; // RPM * 360 degrees / 60 seconds = angle per second
    // Check if we need to rotate, if we dont, set it to nearly stop (visibly).
    // Not full stop, because connected gears wont be rendered.
    if(large_gear.rotate){
      time = Date.now();
      // RPM * 360 / 60(size) / 60 seconds
      if(large_gear.direction == "right") large_gear.angularSpeed = newSpeed * 6 / (large_gear.teeth / MAIN_TEETH);
      else if(large_gear.direction == "left") large_gear.angularSpeed = -newSpeed * 6 / (large_gear.teeth / MAIN_TEETH);
    } else {
      large_gear.angularSpeed = 1 / Number.MAX_SAFE_INTEGER;
      secondary_gear.angularSpeed = large_gear.angularSpeed;
      // xxx.angularSpeed = large_gear.angularSpeed;
    }
    // Reset canvas
    canvas.width = canvas.width;
    // Render gears
    main_gear.render(context);
    large_gear.render(context);
    secondary_gear.render(context);

    // Drawborders
    drawBorder(context);

    interval = 1000 / fps;
    setTimeout( callback, interval );
  }
  setTimeout(callback, interval);
  // Activate gear (change color)
  function activate(gear){
    gear.fillStyle = active;
  }
  // Disable gear (change color)
  function disable(gear) {
    gear.fillStyle = inactive;
  }
  // Neutralize gear (change gear)
  function other(gear) {
    gear.fillStyle = additional;
  }
  // Change large gear rotation direction
  function reverse(dir) {
    large_gear.direction = dir;
  }
  // Enable/Disable gear rotation
  function rotate(value) {
    large_gear.rotate = value;
  }
}
/* Collision detecting function
* x - mouse position x coordinate
* y - mouse position y coordinate
* radius - radius of the rotor gear
* Gear - gear to check collision with rotor
*/
function detectCollision(x, y, radius, Gear){
  var result = false;
  var that = this;
  var dist = distance(x, y, Gear.x, Gear.y);

  if (dist <= radius + Gear.radius + Gear.connectionRadius
  ) {
      result = true;
  }
  return result;
}
// Distance between two points
function distance (x1, y1, x2, y2){
  return Math.sqrt( (x2-=x1)*x2 + (y2-=y1)*y2 );
}
// Function that return mouse position
function getMousePos(canvas, evnt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evnt.clientX - rect.left,
        y: evnt.clientY - rect.top
    };
}


// Non related (GUI)

// Draw border
function drawBorder(context) {
    context.beginPath();
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(canvas.width, 0);
    context.lineTo(canvas.width, canvas.height);
    context.lineTo(0, canvas.height);
    context.closePath();
    context.stroke();
}
// Speed changing slider
function SPEED() {
    var slider = $('.range-slider'),
        range = $('.range-slider__range'),
        value = $('.range-slider__value');
    slider.each(function(){
        value.each(function(){
            var value = $(this).prev().attr('value');
            $(this).html(value);
            newSpeed = value;

        });

        range.on('input', function(){
            $(this).next(value).html(this.value);
           newSpeed = $('.range-slider__value').prev().attr('value');
        });

    });
}
// FPS changing slider
function FPS() {
    var slider = $('.range-slider2'),
        range = $('.range-slider__range2'),
        value = $('.range-slider__value2');
    slider.each(function(){
        value.each(function(){
            var value = $(this).prev().attr('value');
            $(this).html(value);
            fps = value;

        });

        range.on('input', function(){
            $(this).next(value).html(this.value);
            fps = $('.range-slider__value2').prev().attr('value');
        });

    });
}
// Debug switch
function DEBUG() {
  var  value = $(':checkbox').is(':checked');
  if(value) debug = true;
  else debug = false;
}
