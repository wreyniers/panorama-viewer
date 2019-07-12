// url parameters
var parameters = (function() {
  var parameters = {};
  var parts = window.location.search.substr(1).split('&');
  for (var i = 0; i < parts.length; i++) {
    var parameter = parts[i].split('=');
    parameters[parameter[0]] = parameter[1];
  }
  return parameters;
})();

(function () {
var panosList = fetchPanos();

function fetchPanos() {
  return fetch('panos.json').then(function (response) {
    return response.json();
  });
}

self.panosList = panosList;
})();

var isMobile = function () {
  var check = false;
  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
      check = true;
    }
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

var camera;
var clock = new THREE.Clock();
var isUserInteracting = false,
        onMouseDownMouseX = 0, onMouseDownMouseY = 0,
        lon = 0, onMouseDownLon = 0,
        lat = 0, onMouseDownLat = 0,
        phi = 0, theta = 0;
var counter = 0;
var effect;
var manager;
var overlay;
var pano;
var panoCurrent;
var renderer;
var scene;
var lonStart;
var latStart;
var fovStart;


function bend( group, amount, multiMaterialObject ) {
  function bendVertices( mesh, amount, parent ) {
    var vertices = mesh.geometry.vertices;

    if (!parent) {
      parent = mesh;
    }

    for (var i = 0; i < vertices.length; i++) {
      var vertex = vertices[i];

      // apply bend calculations on vertexes from world coordinates
      parent.updateMatrixWorld();

      var worldVertex = parent.localToWorld(vertex);

      var worldX = Math.sin( worldVertex.x / amount) * amount;
      var worldZ = - Math.cos( worldVertex.x / amount ) * amount;
      var worldY = worldVertex.y  ;

      // convert world coordinates back into local object coordinates.
      var localVertex = parent.worldToLocal(new THREE.Vector3(worldX, worldY, worldZ));
      vertex.x = localVertex.x;
      vertex.z = localVertex.z+amount;
      vertex.y = localVertex.y;
    }

    mesh.geometry.computeBoundingSphere();
    mesh.geometry.verticesNeedUpdate = true;
  }

  for ( var i = 0; i < group.children.length; i ++ ) {
    var element = group.children[ i ];

    if (element.geometry.vertices) {
      if (multiMaterialObject) {
        bendVertices( element, amount, group);
      } else {
        bendVertices( element, amount);
      }
    }
  }
}

function loadPano() {
  panosList.then(function (panos) {

    panoCurrent = panos[counter];
    var imgPano = panoCurrent.image;
    

    
    latStart = panoCurrent.latStart;
    lonStart = panoCurrent.lonStart;
    fovStart = panoCurrent.fovStart;

    // fade out current panorama.
    new TWEEN.Tween(pano.material)
      .to({opacity: 0}, 300)
      .onComplete(function () {
        // load in new panorama texture.
        
        //pano.material.map = THREE.ImageUtils.loadTexture(imgPano, THREE.UVMapping, fadeIn);
        var texture = new THREE.TextureLoader().load(imgPano);
        var material = new THREE.MeshBasicMaterial( { map: texture } );
        pano.material = material;
        pano.material.map.minFilter = THREE.LinearFilter;
        positionCamera();
      })
      .start();

    function positionCamera() {
      lat = latStart;
      lon = lonStart;
      camera.fov = fovStart;
      camera.updateProjectionMatrix();
    }
    // // fade out current title.
    // new TWEEN.Tween(overlay.children[0].material)
    //   .to({opacity: 0}, 300)
    //   .onComplete(function () {
    //     // load in new title.
    //     var texture = new THREE.TextureLoader().load(imgOverlay);
    //     var material = new THREE.MeshBasicMaterial( { map: texture } );
    //     overlay.children[0].material = material;
    //     overlay.children[0].material.map.minFilter = THREE.LinearFilter;
        
    //     //lat = latStart;
    //     lat = latStart;
    //     lon = lonStart;
    //   }).start();

    // fade in newly loaded panorama.
    function fadeIn() {  
      new TWEEN.Tween(pano.material)
        .to({opacity: 1}, 1000)
        .onComplete(fadeInOverlay)
        .start();
    }

    // fade in newly loaded title.
    function fadeInOverlay() {
      new TWEEN.Tween(overlay.children[0].material)
        .to({opacity: 1}, 300)
        .start();
    }

  });
}


// initialize scene
function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true, maxAnisotropy: "16", precision: "highp" });
  console.log("maxAnisotropy: " + renderer.capabilities.getMaxAnisotropy())
  console.log("maxPrecision: " + renderer.capabilities.getMaxPrecision());
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  //renderer.autoClear = false;
  //renderer.setClearColor( 0x000000 );
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1100 );
  camera.target = new THREE.Vector3( 0,0 , 0 );
  scene.add(camera);

  // Event Listeners
  document.addEventListener( 'mousedown', onPointerStart, false );
  document.addEventListener( 'mousemove', onPointerMove, false );
  document.addEventListener( 'mouseup', onPointerUp, false );
  document.addEventListener( 'wheel', onDocumentMouseWheel, false );
  document.addEventListener( 'touchstart', onPointerStart, false );
  document.addEventListener( 'touchmove', onPointerMove, false );
  document.addEventListener( 'touchend', onPointerUp, false );
  document.addEventListener( 'dragover', function ( event ) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, false );
  document.addEventListener( 'dragenter', function () {
    document.body.style.opacity = 0.5;
  }, false );
  document.addEventListener( 'dragleave', function () {
    document.body.style.opacity = 1;
  }, false );
  document.addEventListener( 'drop', function ( event ) {
    event.preventDefault();
    var reader = new FileReader();
    reader.addEventListener( 'load', function ( event ) {
      material.map.image.src = event.target.result;
      material.map.needsUpdate = true;
    }, false );
    reader.readAsDataURL( event.dataTransfer.files[ 0 ] );
    document.body.style.opacity = 1;
  }, false );

  // Fetch the JSON list of panos
  function loadMaterial() {
    var texture = new THREE.TextureLoader().load('images/background.jpg'),resolve;
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    //material.map.minFilter = THREE.LinearFilter;
    pano = new THREE.Mesh( geometry, material );
    pano.renderOrder = 20;
    
    
    pano.rotation.set( 0, -100 * Math.PI / 180, 0 );
    scene.add(pano);
  }
  panosList.then(loadMaterial).then(loadPano);

  // panorma mesh
  var geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
  geometry.scale( - 1, 1, 1 );

  // // title text
  // overlay = new THREE.Object3D();
  // var mesh = new THREE.Mesh(
  //   new THREE.PlaneGeometry( 63, 30, 20, 20 ),
  //   new THREE.MeshBasicMaterial({
  //     transparent: true,
  //     alphaTest: 0.5,
  //     side: THREE.FrontSide,
  //     map: new THREE.TextureLoader().load('images/background-overlay.png')
  // }));
  // overlay.add( mesh );
  // overlay.position.set( 0, -3, -5 );
  // overlay.scale.set( 0.1, 0.1, 0.1 );
  // bend(overlay, 100);
  // mesh.renderOrder = 20;
  // scene.add( overlay );

  // trigger function that begins to animate the scene.
  new TWEEN.Tween()
    .delay(400)
    .start();

  // kick off animation
  animate();
  onWindowResize();
}

function requestFullscreen() {
  var el = renderer.domElement;

  if (!isMobile()) {
    effect.setFullScreen(true);
    return;
  }

  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onFullscreenChange(e) {
  var fsElement = document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement;


    // lock screen if mobile
    window.screen.orientation.lock('landscape');
}

function nextPano() {
  panosList.then(function (panos) {
    counter ++;
    if (counter == panos.length) {
      counter = 0;
    }
    loadPano();
  })
}

function previousPano() {
  panosList.then(function (panos) {
    counter --;
    if (counter < 0) {
      counter = panos.length - 1;
    }
    loadPano();
  })
}


function onkey(e) {
  panosList.then(function (panos) {
    if (e.keyCode == '37') { // left arrow - prev panorama
      counter --;
      if (counter < 0) {
        counter = panos.length - 1;
      }
      loadPano();
    } else if (e.keyCode == '39') { // right arrow - next panorama
      counter ++;
      if (counter == panos.length) {
        counter = 0;
      }
      loadPano();
    }
  });
  e.stopPropagation();
}

function onPointerStart( event ) {
        isUserInteracting = true;
        var clientX = event.clientX || event.touches[ 0 ].clientX;
        var clientY = event.clientY || event.touches[ 0 ].clientY;
        onMouseDownMouseX = clientX;
        onMouseDownMouseY = clientY;
        onMouseDownLon = lon;
        onMouseDownLat = lat;
      }

function onPointerMove( event ) {
  if ( isUserInteracting === true ) {
    var clientX = event.clientX || event.touches[ 0 ].clientX;
    var clientY = event.clientY || event.touches[ 0 ].clientY;
    lon = ( onMouseDownMouseX - clientX ) * 0.025 + onMouseDownLon;
    lat = ( clientY - onMouseDownMouseY ) * 0.025 + onMouseDownLat;
    console.log ("lon: "+ lon + " lat: " + lat)
  }
}

function onPointerUp() {
  isUserInteracting = false;
}

function onDocumentMouseWheel( event ) {
  var fov = camera.fov + event.deltaY * 0.01;
  camera.fov = THREE.Math.clamp( fov, 20, 75 );
  console.log("fov: " + fov)
  camera.updateProjectionMatrix();
}

function animate() {
  TWEEN.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
  update();
}

function update() {
  if ( isUserInteracting === false ) {
    lon += -0.01;
  }
  lat = Math.max( - 85, Math.min( 85, lat ) );
  phi = THREE.Math.degToRad( 90 - lat );
  theta = THREE.Math.degToRad( lon );
  
  //console.log (lat, phi, theta)
  camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
  camera.target.y = 500 * Math.cos( phi );
  camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );
  
  
  camera.lookAt( camera.target );

  /*
  // distortion
  camera.position.copy( camera.target ).negate();
  */

  renderer.render( scene, camera );
}

document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('mozfullscreenchange', onFullscreenChange);
window.addEventListener('keydown', onkey, true);
window.addEventListener('resize', onWindowResize, false );


window.onload=function(){
  document.querySelector('button.prev').addEventListener('click', function() { 
    previousPano()
  });
  document.querySelector('button.next').addEventListener('click', function() { 
    nextPano()
  });
};


init();
