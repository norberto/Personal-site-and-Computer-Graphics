var STEPS = 0;
var s;
var color = ["rgb(0,0,0)", "rgb(150,21,7)", "rgb(11, 81, 193)", "rgb(7,150,7)"];

FractaLs = function(canvas) {
  W = canvas.width;
  H = canvas.height;
  this.transformations = [
  //X scale, X skew, Y skew, Y scale, X move, Y move
    { t1: 0.5, t2: 0, t3: 0, t4: 0.5, t5: 0,   t6: 0 },
    { t1: 0, t2: -0.5, t3: -0.5, t4: 0, t5: W , t6: H / 2},
    { t1: 0.5, t2: 0, t3: 0, t4: 0.5, t5: W / 2,   t6: H / 2 },
    { t1: 0.25, t2: 0, t3: 0 , t4: -0.25, t5: W/4,   t6: 3 * H / 4}
  ];

  this.drawFn = function(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, H);
    ctx.lineTo(W, H);
    ctx.lineTo(W, H - 150);
    ctx.lineTo(250, H - 150);
    ctx.lineTo(250, 0);
    ctx.fill();
  };
  return this;
};

FractalAnimator = function() {
  function clear(context){
     context.clearRect(0,0, 500, 500);
   }

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

  this.paint = function(ctx, newTransformations, drawFn) {
    clear(ctx);
    drawBorder(ctx);
    var t = newTransformations;
    ctx.transform(t.t1, t.t2, t.t3, t.t4, t.t5, t.t6);
    drawFn(ctx);
  }

  this.animate = function(ctx, transformation, drawFn, timePassed, stop) {
    var delta = 1000 / 60.0;

      timePassed += delta;
      var fraction = Math.min(timePassed / 1000.0, 1.0);

      // calculate transformations
      var newTransformations = {
        t1: foo(transformation.t1, fraction),
        t2: foo(transformation.t2, fraction),
        t3: foo(transformation.t3, fraction),
        t4: foo(transformation.t4, fraction),
        t5: transformation.t5 * fraction,
        t6: transformation.t6 * fraction
      };

      ctx.save();
      this.paint(ctx, newTransformations, drawFn);
      ctx.restore();

      if (timePassed < 1000 && !stop) {
        setTimeout(function() {
          this.animate(ctx, transformation, drawFn, timePassed);
        }.bind(this), delta);
      }


  };

  this.doAnimate = function(canvas, fractal) {
    this.animate(canvas.getContext("2d"), fractal.transformations[animateT - 1], fractal.drawFn, 0);
  };

  function foo(value, fraction) {
    if(value === 0 ){
      return 0;
    } else if (value >= 0) {
      var diff = 1 - value;
      return value + diff * (1 - fraction);
    } else {
      var diff = 1 - value;
      return value + diff * (1 - fraction);
    }
  }

  return this;
};

FractalsPainter = function(canvas) {
    function clear(context){
       context.clearRect(0,0, 500, 500);
     }

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

  var ctx = canvas.getContext("2d");
  var width = canvas.width, height = canvas.height;

  var fps = 60;
  var interval = 1000 / fps;
  this.paint = function(steps) {
    clear(ctx);
    drawBorder(ctx);
    draw(new FractaLs(canvas), steps);
  };

  function draw(fractalOptions, step) {
    s = step - 1;
    drawFractal(fractalOptions.transformations, fractalOptions.drawFn, step);
  }
  var x = 0;
  var y = 0;
  function drawFractal(transformations, drawFn, step) {
    clear(ctx);
    if (step > 0) {
      step--;

      for (var i = 0; i < transformations.length; i++) {
        ctx.save();
        if(s == step){
          ctx.fillStyle = color[i];
        }
        var t = transformations[i];
        ctx.transform(t.t1, t.t2, t.t3, t.t4, t.t5, t.t6);
        drawFractal(transformations, drawFn, step);
        ctx.restore();
      }
    } else {
      drawFn(ctx);
    }
  }
  return this;
};

function stepSlider() {
    var slider = $('.range-slider'),
        range = $('.range-slider__range'),
        value = $('.range-slider__value');
    slider.each(function(){
        value.each(function(){
            var value = $(this).prev().attr('value');
            $(this).html(value);
            STEPS = value;
        });

        range.on('input', function(){
            $(this).next(value).html(this.value);
           STEPS = $('.range-slider__value').prev().attr('value');
             var ffff = FractalsPainter(canvas);
             ffff.paint(STEPS);
        });

    });
}
var animateT = 0;
function animationSelect(){
  animateT = document.getElementById("animateT").value;
    var f = new FractalAnimator();
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color[animateT-1];
    f.doAnimate(canvas,FractaLs(canvas));
    // clear();
}
