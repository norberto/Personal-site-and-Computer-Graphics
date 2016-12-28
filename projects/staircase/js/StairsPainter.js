StairsPainter = function(scene) {

  function setDefaults(mesh, scale) {
    mesh.scale.set(scale, scale, scale);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
  }

  function translate(mesh, translation) {
    translation = translation || {};
    mesh.translateX(translation.x || 0);
    mesh.translateY(translation.y || 0);
    mesh.translateZ(translation.z || 0);
  }

  function rotate(mesh, rotation) {
    rotation = rotation || {};
    mesh.rotateX(rotation.x || 0);
    mesh.rotateY(rotation.y || 0);
    mesh.rotateZ(rotation.z || 0);
  }

  this.drawStair = function(size, position, rotation, options, scale) {
    var distanceFromCenter = options.distanceFromCenter || 1.5;

    var platform = new THREE.Shape();
    if(options.odd){
      platform.moveTo(distanceFromCenter, -size.length / 64);
      platform.lineTo(size.width + distanceFromCenter, -size.length / 2);
    } else {
      platform.moveTo(distanceFromCenter, -size.length / 2);
      platform.lineTo(size.width + distanceFromCenter, -size.length / 64);
    }
    platform.lineTo(size.width + distanceFromCenter, size.length / 2);
    platform.lineTo(distanceFromCenter, size.length / 2);

    var extrudeSettings = { amount: options.thickness, bevelEnabled: true, bevelSegments: 0, steps: 1, bevelSize: 1, bevelThickness: 1 };
    var geometry = new THREE.ExtrudeGeometry( platform, extrudeSettings );

    var loader = new THREE.TextureLoader();
    var material, platform_mesh;
    texture = loader.load('img/wood2.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    material = new THREE.MeshLambertMaterial({map: texture, overdraw: 0.5});
    platform_mesh = new THREE.Mesh(geometry, material);

    setDefaults(platform_mesh, scale);
    translate(platform_mesh, position);
    rotate(platform_mesh, rotation);

    scene.add(platform_mesh);
    return platform_mesh;
  };

  this.drawRailing = function(size, position, rotation, options, scale) {
    var radiusSegments = 25;
    var rail = new THREE.CylinderGeometry(size.radius, size.radius, size.height, radiusSegments);
    var railing_mesh = new THREE.Mesh(rail, new THREE.MeshLambertMaterial({ color: options.color || 0xFF0000}));

    setDefaults(railing_mesh, scale);
    translate(railing_mesh, position);
    rotate(railing_mesh, rotation);

    scene.add(railing_mesh);
    return railing_mesh;
  };

  this.drawFloor = function(size, angle, stairangle, position, rotation, radius, scale) {
    var floor = new THREE.Shape();

    floor.moveTo(-size/2, -size/2);
    floor.lineTo(-size/2, size/2);
    floor.lineTo(size/2, size/2);
    floor.lineTo(size/2, -size/2);
    floor.lineTo(-size/2, -size/2);

    var hole = new THREE.Shape();
    var start =  angle / 180 * Math.PI;
    var a = -(stairangle - 3);
    if(angle < 0) { a = -(stairangle - 3) + Math.PI; start = start + Math.PI;}
    var end = Math.PI + (a / 180 * Math.PI) + start;
    hole.arc(0, 0, radius, start, end, false);
    hole.lineTo(0,0);

    floor.holes.push(hole);

    var extrudeSettings = { amount: 1, bevelEnabled: true, bevelSegments: 0, steps: 1, bevelSize: 0.1, bevelThickness: 1 };


    var loader = new THREE.TextureLoader();
    loader.crossorigin = true;
    texture = loader.load('img/woodfloor.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4/scale,4/scale);

    var floor_mesh = new THREE.Mesh(new THREE.ExtrudeGeometry( floor, extrudeSettings ), new THREE.MeshLambertMaterial({map: texture, overdraw: 0.5}));

    setDefaults(floor_mesh, scale);
    translate(floor_mesh, position);
    rotate(floor_mesh, rotation);

    scene.add(floor_mesh);
    return floor_mesh;
  };

  this.drawTube = function(points, segments, radius, radiusSegments, scale) {

    var spline = new THREE.CatmullRomCurve3(points);
    var tube = new THREE.TubeGeometry(spline, segments, radius * scale, radiusSegments, false);
    var meshMaterial = new THREE.MeshPhongMaterial({color: 0xFF0000});

    // create a multimaterial
    var tube_mesh = new THREE.Mesh(tube, meshMaterial);

    tube_mesh.receiveShadow = true;
    tube_mesh.castShadow = true;

    scene.add(tube_mesh);
    return tube_mesh;
  };
};
