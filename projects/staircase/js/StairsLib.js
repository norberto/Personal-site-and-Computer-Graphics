function clone(obj) {
  if (null === obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

StairsLib = function(containerId) {
  var scene, camera, renderer;
  var spotlight;

  var gui, stats, controller;
  var container, material;
  var cameraMovement;

  var painter;
  var stair_angle;
  var points;

  var WOOD_COLOR = 0xCCCCCC,
      FOOT_COLOR = 0xFF0000,
      RAIL_COLOR = 0xc0c0c0,
      ARMREST_COLOR = 0x333333;

  var scale = 100;

  var stairConfig = {
    stairHeight: 2,
    stairPlatformHeight: 0.5,
    angle: 360,
    platformLength: 1.75,
    platformWidth: 5,
    railHeight: 5,
    armLength: 1.5,
    armWidth: 0.2,
    armHeight: 7,
    pillarRadius: 0.5
  },
  footConfig = {
    footOffset: 1,
    footRadius: 0.2,
    footHeight: (stairConfig.stairHeight - stairConfig.stairPlatformHeight)
  },
  staircaseConfig = {
    height: stairConfig.stairHeight * 10,
    stairs: 10,
    floorCount: 1,
    spiralsPerFloor: 2,
    floor: false,
    radius: 0
  };

  lightningPos = {
    x: -100,
    y: 50,
    z: -100
  };

  options = {
    drawAxis: false,
    enableFog: false
  };
  function init() {
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    stairConfig.railHeight += stairConfig.stairHeight;
    container = document.getElementById(containerId);
    var canvasWidth = container.offsetWidth;
    var canvasHeight = container.offsetHeight;

    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(60, canvasWidth / canvasHeight, 1, 1000 * scale);
    camera.position.set(-54, 60, 45);

    scene = new THREE.Scene(); // initialising the scene
    painter = new StairsPainter(scene);
    camera.lookAt(scene.position);

    material = new THREE.MeshLambertMaterial({ color: 0xCCCCCC});
    gui = new dat.GUI({ autoPlace: false });

    var maincontrols = gui.addFolder('Main controls');
    var opts = gui.addFolder('Other options');
    var lightopts = gui.addFolder('Lightning position');

    // Adding controls to dat.gui
    maincontrols.add(staircaseConfig, "stairs", 8, 30).name("Stair amount:").onFinishChange(redraw);
    maincontrols.add(stairConfig, "angle", -360 , 360).name("Spin angle:").onFinishChange(redraw);
    maincontrols.add(staircaseConfig, "height", 10, 30).name("Floor height:").onFinishChange(redraw);
    maincontrols.add(staircaseConfig, "floor").name("Show ground:").onFinishChange(redraw);

    opts.add(stairConfig, "stairHeight", 1, 10).name("Railing height:").onFinishChange(redraw);
    opts.add(staircaseConfig, "floorCount", 1, 2).name("Floor count:").onFinishChange(redraw);
    opts.add(staircaseConfig, "radius", 0, 2). name("Inner radius:").onFinishChange(redraw);

    lightopts.add(lightningPos, 'x', -200, 200).onFinishChange(redraw);
    lightopts.add(lightningPos, 'y', -10, 80).onFinishChange(redraw);
    lightopts.add(lightningPos, 'z', -200, 200).onFinishChange(redraw);
    gui.add(options, "drawAxis").onFinishChange(redraw);
    gui.add(options, "enableFog").onFinishChange(redraw);

    // start drawing after initializing everything that is necessary
    draw();

    // Initialize renderer
    renderer = new THREE.WebGLRenderer({ antialias: true});

    // configure renderer
    renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // options are THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
    renderer.shadowMap.enabled = true;
    // Append renderer to container
    container.appendChild(renderer.domElement);
    // Initialize stats
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.domElement.style.position = 'absolute';
    container.appendChild(stats.dom);
    container.appendChild(gui.domElement);
    cameraMovement = new CameraMovement(camera, scene.position, -40.6, -35, scale); // -40.6 -35 initial view of the scene
  }
  // Function that creates XYZ axes.
  function buildAxes(length) {
    var axes = new THREE.Object3D();

    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0), 0xFF0000, false)); // +X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-length, 0, 0), 0xFF0000, true)); // -X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0), 0x00FF00, false)); // +Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -length, 0), 0x00FF00, true)); // -Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length), 0x0000FF, false)); // +Z
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -length), 0x0000FF, true)); // -Z
    return axes;
  }

  function buildAxis(src, dst, colorHex, dashed) {
    var mat, geom = new THREE.Geometry();

    if (dashed) mat = new THREE.LineDashedMaterial({linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3});
    else mat = new THREE.LineBasicMaterial({linewidth: 3, color: colorHex});

    geom.vertices.push(src.clone());
    geom.vertices.push(dst.clone());
    geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

    return new THREE.Line(geom, mat, THREE.LineSegments);
  }

  function alphaForStairIteration(i) {
    return (Math.PI / 180) * (stair_angle * i) % 180;
  }

  // Draw stair
  function drawStair(i, alpha, scale) {
    var size = {
      width: stairConfig.platformWidth,
      height: stairConfig.stairHeight,
      length: stairConfig.platformLength
    };
    var position = {x: 0, y: stairConfig.stairHeight * i * scale, z: 0};
    var rotation = {x: Math.PI / 2, y: 0, z: alpha};
    painter.drawStair( size, position, rotation, {odd: i % 2 === 1, distanceFromCenter: stairConfig.pillarRadius * 3 + staircaseConfig.radius , thickness: stairConfig.stairPlatformHeight, color: WOOD_COLOR}, scale);
  }

  // Draw stair footing
  function drawStairFoot(i, scale) {
    var alpha = alphaForStairIteration(i - 0.5);
    var size = {
      height: footConfig.footHeight,
      radius: footConfig.footRadius
    };
    var position = {
      x: scale * ((footConfig.footOffset + staircaseConfig.radius) * Math.cos(alpha)),
      y: scale * stairConfig.stairHeight * (i - 1) + footConfig.footHeight * scale / 2,
      z: scale * ((footConfig.footOffset + staircaseConfig.radius) * Math.sin(alpha))
    };
    var rotation = {x: 0, y: 0, z: 0};
    painter.drawRailing(size, position, rotation, {color: FOOT_COLOR}, scale);
  }

  // Draw railing (foot)
  function drawRailing(i, alpha, scale) {

    var size = {
      height: stairConfig.railHeight,
      radius: 0.1
    };

    var position = {
      x: scale * (stairConfig.platformWidth - 0.5 + staircaseConfig.radius + 5 * stairConfig.pillarRadius) * Math.cos(alpha),
      y: scale * ((stairConfig.stairHeight) * (i - 1) + stairConfig.railHeight / 2 + stairConfig.stairHeight),
      z: scale * (stairConfig.platformWidth - 0.5 + staircaseConfig.radius + 5 * stairConfig.pillarRadius) * Math.sin(alpha)
    };

    var rotation = {x: 0, y: 0, z: 0};
    painter.drawRailing(size, position, rotation, {color: RAIL_COLOR}, scale);
  }

  function railingOriginTranslations(i, alpha) {
    return {
      x: scale * (stairConfig.platformWidth + 5 * stairConfig.pillarRadius) * Math.cos(alpha),
      y: scale * (stairConfig.armHeight + stairConfig.stairHeight * i),
      z: scale * (stairConfig.platformWidth + 5 * stairConfig.pillarRadius) * Math.sin(alpha)
    };
  }

  function createRailingOrigin(i, alpha) {
    var origin = new THREE.Object3D();
    var translations = railingOriginTranslations(i, alpha);

    origin.translateX(translations.x);
    origin.translateY(translations.y);
    origin.translateZ(translations.z);
    origin.rotateY(-temp(i + 0.5, alpha));

    scene.add(origin);
    return origin;
  }



  function drawFloor(size, alpha, stairangle, scale, i) {

    var position = {
      x: 0,
      y: i *scale * staircaseConfig.stairs * stairConfig.stairHeight + 1,
      z: 0
    };

    var rotation = {
      x: Math.PI / 2,
      y: 0,
      z: Math.PI
    };

    var radius = 5 * stairConfig.pillarRadius + stairConfig.platformWidth + 0.2 + staircaseConfig.radius;
    painter.drawFloor(size, alpha, stairangle, position, rotation, radius, scale);
  }


  function addLighting() {
    // add spotlight to display objects' shadows
    var spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( lightningPos.x*scale/2, lightningPos.y*scale, lightningPos.z*scale/2 );
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048; // default is 512
    spotLight.shadow.mapSize.height = 2048; // default is 512
    spotLight.distance = 10000 * scale;
		spotLight.angle = Math.PI / 4;
		spotLight.decay = 0;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200 * scale;
    // Draws the "cone" for spotLight (easier to control lightning controls, since we know the current position of it).
    lightHelper = new THREE.SpotLightHelper( spotLight );
    // Adds ambient lightning to space.
    var ambientLight = new THREE.AmbientLight( 0xA0A0A0, 0.2 ); // soft white light

    scene.add(ambientLight);
    scene.add(spotLight);
    scene.add(lightHelper);
  }

  function draw() {
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene.background = new THREE.Color( 0xEEEEEE );

    // Add fog.
    if(options.enableFog) scene.fog = new THREE.FogExp2( 0xEEEEEE, 0.0001 );
    else scene.fog = null;
    
    // Load texture.
    var loader = new THREE.TextureLoader();
    texture = loader.load('img/woodfloor.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2,2);

    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(50, 50);
    var planeMaterial = new THREE.MeshPhongMaterial({map: texture, overdraw: 0.5});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.scale.set(scale, scale, scale);
    plane.receiveShadow  = true;

    // rotate and position the plane
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(15, 0, 0);
    var stairs = staircaseConfig.stairs * staircaseConfig.floorCount;

    stair_angle = stairConfig.angle / staircaseConfig.stairs;

    var axes = buildAxes(1000 * scale / 10);

    points = [];

    for (var i = 1; i < stairs; i++) {
        var alpha = alphaForStairIteration(i);
        left =
        drawStair(i, alpha, scale);
        drawStairFoot(i, scale);
        drawRailing(i, alpha, scale);

        var x = scale * (stairConfig.platformWidth -0.5 + staircaseConfig.radius + 5 * stairConfig.pillarRadius) * Math.cos(alpha),
            y = scale * ((stairConfig.stairHeight) * (i - 1) + stairConfig.railHeight + stairConfig.stairHeight),
            z = scale * (stairConfig.platformWidth -0.5 + staircaseConfig.radius +  5 * stairConfig.pillarRadius) * Math.sin(alpha);
        points.push(new THREE.Vector3(x, y, z));

    }
    painter.drawTube(points, 64, 0.2, 8, scale);

    if(staircaseConfig.floor){
      for(var j = 1; j <= staircaseConfig.floorCount; j++){
        drawFloor(50, stairConfig.angle, stair_angle, scale, j);
      }
    }
    // Create central pillar
    var pillarSize = {radius: stairConfig.pillarRadius, height:  stairConfig.stairHeight * stairs},
        pillarPosition = {x: 0, y: pillarSize.height * scale / 2, z: 0},
        pillarRotation = {x: 0, y: 0, z: 0};
    painter.drawRailing(pillarSize, pillarPosition, pillarRotation, {color: 0x333333}, scale);
    // Add lightning to scene.
    addLighting();

    scene.add(plane);
    if(options.drawAxis){
      scene.add(axes);
    }
  }

  function redraw() {
    // Recalculate stuff according to changes
    footConfig.footHeight =  (stairConfig.stairHeight - stairConfig.stairPlatformHeight);
    stairConfig.railHeight = 3 + footConfig.footHeight;
    stairConfig.stairHeight = staircaseConfig.height / staircaseConfig.stairs;
    footConfig.footHeight =  (stairConfig.stairHeight - stairConfig.stairPlatformHeight);
    clearScene();
    draw();
  }

  // Animation function
  function animate() {
    stats.begin();
    requestAnimationFrame( animate );
    cameraMovement.updateCamera(camera, scene.position);
    render();
    stats.end();
  }

  // Rendering function
  function render() {
    renderer.render(scene, camera);
    stats.update();
  }

  this.start = function() {
    init();
    animate();
  };

  // Remove all scene children (clear scene & prepare for re-rendering).
  function clearScene (){
    for( var i = scene.children.length - 1; i >= 0; i--) {
      scene.remove(scene.children[i]);
    }
  }
  return this;
};
