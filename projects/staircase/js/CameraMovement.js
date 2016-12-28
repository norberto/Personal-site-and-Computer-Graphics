CameraMovement = function(camera, origin, camLon, camLat, scale) {
	this.pressed = {left: false, up: false, right: false, down: false, zoomIn: false, zoomOut: false, top: false, bottom: false};
	this.mouseMovementX = 0;
	this.mouseMovementY = 0;
	this._zoom = scale / 5;

	this.captureMouse = false;
	var CAM_SPEED = 0.6 * scale, VIEW_SPEED = 0.4, ZOOM_SPEED = 1.5 * scale;

	this.target = camera;
	this.origin = origin;
	this._up = 0;
	this.target.camLon = camLon || 0;
	this.target.camLat = camLat || 0;

  function parseKeycode(keycode) {
		switch(keycode) {
      case 37: // left arrow
			case 65: // A
			  return "LEFT";
      case 38: // up arrow
			case 87: // W
			  return "UP";
      case 39: // right arrow
			case 68: // D
			  return "RIGHT";
      case 40: // down arrow
			case 83: // S
			  return "DOWN";
			case 107: // NUM_PLUS
			case 187: // PLUS
			  return "+";
			case 109: // NUM_MINUS
			case 189: // MINUS:
			  return "-";
			case 81: // Q
			  return "Q";
			case 69: //CTRL
			  return "E"
      }
			console.log(keycode);
	}

	this.updatePressed = function(key, value) {
		switch (key) {
			case "LEFT":
			  this.pressed.left = value;
				return;
			case "UP":
			  this.pressed.up = value;
				return;
			case "RIGHT":
			  this.pressed.right = value;
				return;
			case "DOWN":
			  this.pressed.down = value;
				return;
			case "+":
				this.pressed.zoomIn = value;
				return;
			case "-":
				this.pressed.zoomOut = value;
				return;
			case "Q":
			  this.pressed.bottom = value;
				return;
			case "E":
			  this.pressed.top = value;
				return;
		}
	};

  function onKeyDown(evt) {
    evt = evt || window.event;
    var keycode = evt.keyCode;

		directory = parseKeycode(keycode);
		this.updatePressed(directory, true);
  }

	function onKeyUp(evt) {
    evt = evt || window.event;
    var keycode = evt.keyCode;

		directory = parseKeycode(keycode);
		this.updatePressed(directory, false);
  }

	function onMouseMove(e) {
      if(!this.captureMouse) return;

      var moveX = e.movementX || e.mozMovementX || e.webkitMovementX || 0,
          moveY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

      //Update the initial coords on mouse move
      this.mouseMovementX += moveX * scale/10; //aggregate mouse movements as a total delta delta
      this.mouseMovementY += moveY * scale/10;
  }

	function onMouseDown(e) {
		this.captureMouse = true;
	}

	function onMouseUp(e) {
		this.captureMouse = false;
	}

	this.onMouseWheel = function(e) {
		this._zoom += e.deltaY > 0 ? 1 : -1;
	}

  document.addEventListener("keydown", onKeyDown.bind(this), false);
  document.addEventListener("keyup", onKeyUp.bind(this), false);


	this.directions = function() {
		var x = 0;
		var y = 0;

		x = this.pressed.left ? x - 1 : x;
		x = this.pressed.right ? x + 1 : x;
		y = this.pressed.up ? y - 1 : y;
		y = this.pressed.down ? y + 1 : y;

		return {x: x, y: y};
	};

	this.mouse = function() {
		var mouseMov = {
			x: this.mouseMovementX,
			y: this.mouseMovementY
		};
		this.mouseMovementX = 0;
		this.mouseMovementY = 0;
		return mouseMov;
	};

	this.zoom = function() {

		if (this.pressed.zoomIn) {
			this._zoom -= 0.5;
		}
		if (this.pressed.zoomOut) {
			this._zoom += 0.5;
		}

		var z = this._zoom;
		this._zoom = 0;
		return z;
	};

	this.up = function() {
		var y = 0;
		if (this.pressed.top) {
			y += 1;
		}
		if (this.pressed.bottom) {
			y -= 1;
		}
		return y;
	}

	this.updateCamera = function() {
		var camera = this.target;
		camera.camLon = camera.camLon || 0;
		camera.camLat = camera.camLat || 0;

		var dirs = this.directions();
    camera.translateX(dirs.x * CAM_SPEED);
    camera.translateY(-dirs.y * CAM_SPEED);

    var zoom = this.zoom();
    camera.translateZ(zoom * ZOOM_SPEED);

    var mouse = this.mouse();

    camera.camLon += mouse.x * VIEW_SPEED;
    camera.camLat -= mouse.y * VIEW_SPEED;

		this._up += this.up();

    var phi = (90 - camera.camLat) * Math.PI / 180;
    var theta = camera.camLon * Math.PI / 180;
    var target = {};
    target.x = origin.x + 100 * Math.sin(phi) * Math.cos(theta);
    target.y = origin.y + (this._up * CAM_SPEED) + 100 * Math.cos(phi);
    target.z = origin.z + 100 * Math.sin(phi) * Math.sin(theta);

    camera.lookAt(target);
	};
};
