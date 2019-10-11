(function() {
    var panosList = fetchPanos();

    function fetchPanos() {
        return fetch('panos.json').then(function(response) {
            return response.json();
        });
    }
    self.panosList = panosList;
})();
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};
var isMobile = function() {
    var check = false;
    (function(a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
            check = true;
        }
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};
var camera;
var clock = new THREE.Clock();
var isUserInteracting = false,
    onMouseDownMouseX = 0,
    onMouseDownMouseY = 0,
    lon = 0,
    onMouseDownLon = 0,
    lat = 0,
    onMouseDownLat = 0,
    phi = 0,
    theta = 0;
var counter = 0;
var effect;
var manager;
var overlay;
var pano;
var panoId;
var panoCurrent;
var renderer;
var scene;
var lonStart;
var latStart;
var fovStart;
var animatePano = false;
var audioPlaying = false;
var animateSpeed = 0.02;
var amimateDirection = "left";
var animatePosition = 0;
var nextAnimatePosition = 0;
var latComplete = false;
var lonComplete = false;
var fovComplete = false;
var lonDiff, latDiff, fovDiff, lonNext, latNext, fovNext;
var sound;
var statsEnabled = false;
if (statsEnabled == true) {
    var rendererStats = new THREEx.RendererStats();
    rendererStats.domElement.style.position = 'absolute'
    rendererStats.domElement.style.left = '0px'
    rendererStats.domElement.style.bottom = '0px'
    document.body.appendChild(rendererStats.domElement)
}

function bend(group, amount, multiMaterialObject) {
    function bendVertices(mesh, amount, parent) {
        var vertices = mesh.geometry.vertices;
        if (!parent) {
            parent = mesh;
        }
        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            // apply bend calculations on vertexes from world coordinates
            parent.updateMatrixWorld();
            var worldVertex = parent.localToWorld(vertex);
            var worldX = Math.sin(worldVertex.x / amount) * amount;
            var worldZ = -Math.cos(worldVertex.x / amount) * amount;
            var worldY = worldVertex.y;
            // convert world coordinates back into local object coordinates.
            var localVertex = parent.worldToLocal(new THREE.Vector3(worldX, worldY, worldZ));
            vertex.x = localVertex.x;
            vertex.z = localVertex.z + amount;
            vertex.y = localVertex.y;
        }
        mesh.geometry.computeBoundingSphere();
        mesh.geometry.verticesNeedUpdate = true;
    }
    for (var i = 0; i < group.children.length; i++) {
        var element = group.children[i];
        if (element.geometry.vertices) {
            if (multiMaterialObject) {
                bendVertices(element, amount, group);
            } else {
                bendVertices(element, amount);
            }
        }
    }
}
/**
 * Loads THREE Textures with progress events
 * @augments THREE.TextureLoader
 */
function AjaxTextureLoader(themanager) {
    this.manager = themanager;
    const cache = THREE.Cache;
    // Turn on shared caching for FileLoader, ImageLoader and TextureLoader
    cache.enabled = true;
    const textureLoader = new THREE.TextureLoader(manager);
    const fileLoader = new THREE.FileLoader();
    fileLoader.setResponseType('blob');

    function load(imgPano, onLoad, onProgress, onError) {
        const cached = cache.get(imgPano);
        if (cached) {

            // Since we're not downloading image, set loader to 100%
            $(".percentageCounter").text(Math.round(100) + "%");
            $('#bar').val(100);
            $(".description").text("Creating projection sphere...")

            // Load cached image
            loadImageAsTexture();
            //return cached;
        } else {
            fileLoader.load(imgPano, cacheImage, onProgress, onError);
        }
        /**
         * The cache is currently storing a Blob, but we need to cast it to an
         * Image or else it won't work as a texture. TextureLoader won't do this
         * automatically.
         */
        function cacheImage(blob) {
            // ObjectURLs should be released as soon as is safe, to free memory
            const objUrl = URL.createObjectURL(blob);
            const image = document.createElementNS('http://www.w3.org/1999/xhtml', 'img');
            image.onload = () => {
                $(".description").text("Creating projection sphere...")
                cache.add(imgPano, image);
                URL.revokeObjectURL(objUrl);
                document.body.removeChild(image);
                loadImageAsTexture();
            };
            image.src = objUrl;
            image.style.visibility = 'hidden';
            document.body.appendChild(image).className = "panoPlaceholder";
        }

        function loadImageAsTexture() {
            textureLoader.load(imgPano, onLoad, () => {}, onError);
        }
    }
    return Object.assign({}, textureLoader, {
        load
    });
}

function startAudio(audioFile) {
    var listener = new THREE.AudioListener();
    listener.name = "Sound";
    camera.add(listener);
    // create a global audio source
    sound = new THREE.Audio(listener);
    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load(audioFile, function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(3);
        audioPlaying = true;
        $('.playControl').addClass("audioPlaying");
    });
}

function getNextAnimatePosition() {
    nextAnimatePosition++;
    if (nextAnimatePosition == panoCurrent.motion.length) {
        nextAnimatePosition = 0;
    }
    latNext = panoCurrent.motion[nextAnimatePosition].lat;
    lonNext = panoCurrent.motion[nextAnimatePosition].lon;
    fovNext = panoCurrent.motion[nextAnimatePosition].fov;
    latDiff = latNext - lat;
    lonDiff = lonNext - lon;
    fovDiff = fovNext - camera.fov;
    speedCoef = Math.abs(animateSpeed / lonDiff);
    lonSpeed = lonDiff * speedCoef;
    latSpeed = latDiff * speedCoef;
    fovSpeed = fovDiff * speedCoef;
    console.log("Next Position: ")
    console.log(panoCurrent.motion[nextAnimatePosition]);
}
// initialize scene
function init() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        maxAnisotropy: "16",
        precision: "highp"
    });
    console.log("maxAnisotropy: " + renderer.capabilities.getMaxAnisotropy())
    console.log("maxPrecision: " + renderer.capabilities.getMaxPrecision());
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    scene.name = "Scene";
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1100);
    camera.name = "Camera"
    camera.target = new THREE.Vector3(0, 0, 0);
    scene.add(camera);
    // Event Listeners
    document.addEventListener('mousedown', onPointerStart, false);
    document.addEventListener('mousemove', onPointerMove, false);
    document.addEventListener('mouseup', onPointerUp, false);
    document.addEventListener('wheel', onDocumentMouseWheel, false);
    document.addEventListener('touchstart', onPointerStart, false);
    document.addEventListener('touchmove', onPointerMove, false);
    document.addEventListener('touchend', onPointerUp, false);
    // kick off animation
    animate();
    onWindowResize();
    panosList.then(loadPano);
    // panorma mesh
    geometry = new THREE.SphereBufferGeometry(50, 50, 50);
    geometry.scale(-1, 1, 1);
}

function clearThree(obj) {
    while (obj.children.length > 0) {
        clearThree(obj.children[0])
        obj.remove(obj.children[0]);
    }
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
        //in case of map, bumpMap, normalMap, envMap ...
        Object.keys(obj.material).forEach(prop => {
            if (!obj.material[prop]) return
            if (typeof obj.material[prop].dispose === 'function') obj.material[prop].dispose()
        })
        obj.material.dispose()
    }
}

function clearPano() {
    TweenLite.to(pano.material, 5, {
        opacity: 0
    });
    if (sound != undefined) {
        if (sound.isPlaying) {
            sound.stop();
            sound = "";
            audioPlaying = false;
        }
    }
    clearThree(scene);
    //scene.dispose();
}

function loadPano() {
    $(".description").text("Downloading panorama image...")
    $('#bar').val(0);
    $(".loader").removeClass("hide");




    // var panoTexture = new THREE.TextureLoader().load('images/background.jpg');
    var material = new THREE.MeshBasicMaterial({
        //map: panoTexture,
        color: 0x000000,
        opacity: 0
    });
    //material.map.minFilter = THREE.LinearFilter;
    pano = new THREE.Mesh(geometry, material);
    pano.name = "Panorama";
    pano.rotation.set(0, -100 * Math.PI / 180, 0);
    scene.add(pano);
    panosList.then(function(panos) {
        if (panoId == undefined) {
            if (getUrlParameter('pano')) {
                panoId = getUrlParameter('pano')
            } else {
                panoId = 0;
            }
        }
        // Update url param 
        if (history.pushState) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?pano=' + panoId;
            window.history.pushState({
                path: newurl
            }, '', newurl);
        }
        console.log("\n\n\n" + "Loading Panoram with ID: " + panoId);
        panoCurrent = panos[panoId];
        console.log(panoCurrent);
        var imgPano = panoCurrent.image;
        var panoTitle = panoCurrent.title;
        var panoOwner = panoCurrent.owner;
        var panoTextCoords = panoCurrent.textCoords[0]
        var audioFile = panoCurrent.audio;
        var material = new THREE.MeshBasicMaterial();
        var textureLoader = new AjaxTextureLoader(manager);
        textureLoader.load(imgPano, function(panoTexture) {
            material.map = panoTexture;
            material.transparent = true;
            material.opacity = 0;
            pano.material = material;
            pano.material.map.minFilter = THREE.LinearFilter;
            pano.renderOrder = 2;
            positionCamera();
            setTimeout(function() {
                $(".loader").addClass("hide");
                textOverlay(panoTitle, panoTextCoords, panoOwner);
                if (audioFile) {
                    startAudio(audioFile);
                }
                startPano();
            }, 2000);
        }, function(xhr) {
            $(".percentageCounter").text(Math.round(xhr.loaded / xhr.total * 100) + "%")
            $(".byteCounter").text(Math.round(xhr.loaded / 1024) + " / " + Math.round(xhr.total / 1024) + " KB")
            $('#bar').val(xhr.loaded / xhr.total * 100);
        });
        // get first motion position
        console.log("Current Position: ")
        console.log(panoCurrent.motion[animatePosition]);
        latStart = panoCurrent.motion[animatePosition].lat;
        lonStart = panoCurrent.motion[animatePosition].lon;
        fovStart = panoCurrent.motion[animatePosition].fov;
    });
}

function positionCamera() {
    lat = latStart;
    lon = lonStart;
    camera.fov = fovStart;
    camera.updateProjectionMatrix();
    getNextAnimatePosition();
}

function textOverlay(panoTitle, panoTextCoords, panoOwner) {
    var glcanvas = document.getElementById("glcanvas");
    var ctx = glcanvas.getContext("2d");
    ctx.clearRect(0, 0, 3200, 260);
    ctx.font = "700 160px Montserrat";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(panoTitle, 1600, 120);
    ctx.font = "400 60px Montserrat";
    ctx.fillText("Photo by: " + panoOwner, 1600, 220);
    overlayTxt = new THREE.Object3D();
    overlayTxt.name = "Text Overlay";
    textTexture = new THREE.Texture(glcanvas);
    textTexture.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        alphaTest: 0.5,
        opacity: 0
    });
    material.map.minFilter = THREE.LinearFilter;
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(400, 65, 20, 20), material);
    overlayTxt.add(mesh);
    overlayTxt.position.set(panoTextCoords.x, panoTextCoords.y, panoTextCoords.z);
    overlayTxt.scale.set(panoTextCoords.scale * 2, panoTextCoords.scale, panoTextCoords.scale);
    // overlayTxt.rotation.x = -0.08;
    overlayTxt.rotation.y = panoTextCoords.rotationY;
    // overlayTxt.rotation.z = 0.02;
    bend(overlayTxt, panoTextCoords.bend);
    scene.add(overlayTxt);
};

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
    var fsElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
    // lock screen if mobile
    window.screen.orientation.lock('landscape');
}

function nextPano() {
    panosList.then(function(panos) {
        panoId++;
        if (panoId == panos.length) {
            panoId = 0;
        }
        clearPano();
        loadPano();
    })
}

function previousPano() {
    panosList.then(function(panos) {
        panoId--;
        if (panoId < 0) {
            panoId = panos.length - 1;
        }
        clearPano();
        loadPano();
    })
}

function onkey(e) {
    /* Listen for [i] key to toggle param view */
    if (e.keyCode == '73') {
        $('.parameters').toggle();
    }
    /* Listen for [space] key to toggle animation play state */
    if (e.keyCode == '32') {
        togglePlay();
    }
    panosList.then(function(panos) {
        if (e.keyCode == '37') { // left arrow - prev panorama
            panoId--;
            if (panoId < 0) {
                panoId = panos.length - 1;
            }
            clearPano();
            loadPano();
        } else if (e.keyCode == '39') { // right arrow - next panorama
            panoId++;
            console.log(pano)
            if (panoId == panos.length) {
                panoId = 0;
            }
            clearPano();
            loadPano();
        }
    });
    e.stopPropagation();
}

function onPointerStart(event) {
    isUserInteracting = true;
    var clientX = event.clientX || event.touches[0].clientX;
    var clientY = event.clientY || event.touches[0].clientY;
    onMouseDownMouseX = clientX;
    onMouseDownMouseY = clientY;
    onMouseDownLon = lon;
    onMouseDownLat = lat;
}

function onPointerMove(event) {
    if (isUserInteracting === true) {
        var clientX = event.clientX || event.touches[0].clientX;
        var clientY = event.clientY || event.touches[0].clientY;
        lon = (onMouseDownMouseX - clientX) * 0.05 + onMouseDownLon;
        lat = (clientY - onMouseDownMouseY) * 0.05 + onMouseDownLat;
    }
}

function onPointerUp() {
    isUserInteracting = false;
}

function onDocumentMouseWheel(event) {
    var fov = camera.fov + event.deltaY * 0.01;
    camera.fov = THREE.Math.clamp(fov, 20, 75);
    console.log("fov: " + fov)
    camera.updateProjectionMatrix();
}

function updateParameters() {
    $(".fovVal").text(Math.round(camera.fov * 100) / 100);
    $(".latVal").text(Math.round(lat * 100) / 100);
    $(".lonVal").text(Math.round(lon * 100) / 100);
    $(".latDiff").text(Math.round(latDiff * 100) / 100);
    $(".lonDiff").text(Math.round(lonDiff * 100) / 100);
    $(".fovDiff").text(Math.round(fovDiff * 100) / 100);
    $(".waypoint").text(nextAnimatePosition);
}

function animate() {
    renderer.render(scene, camera);
    if (statsEnabled == true) {
        rendererStats.update(renderer);
    }
    requestAnimationFrame(animate);
    update();
}

function update() {
    if (isUserInteracting === false && animatePano === true) {
        if (Math.abs(lon - lonNext) > .1) {
            lon += lonSpeed;
        } else {
            lonComplete = true;
        }
        if (Math.abs(lat - latNext) > .1) {
            lat += latSpeed;
        } else {
            latComplete = true;
        }
        if (Math.abs(camera.fov - fovNext) > .1) {
            camera.fov += fovSpeed;
            camera.updateProjectionMatrix();
        } else {
            fovComplete = true;
        }
        if (latComplete && lonComplete && fovComplete) {
            lonComplete = false;
            latComplete = false;
            fovComplete = false;
            getNextAnimatePosition();
        }
        lonDiff = lon - lonNext;
        latDiff = lat - latNext;
        fovDiff = camera.fov - fovNext;
    }
    if (typeof sound !== 'undefined') {
        if (audioPlaying) {
            if (sound.isPlaying === false) {
                sound.play();
            }
        } else {
            if (sound.isPlaying === true) {
                sound.pause();
            }
        }
    }
    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);
    camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
    camera.target.y = 500 * Math.cos(phi);
    camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(camera.target);
    /*
    // distortion
    camera.position.copy( camera.target ).negate();
    */
    updateParameters();
    renderer.render(scene, camera);
}

function togglePlay() {
    if (animatePano) {
        animatePano = false;
        sound.pause();
        $('.playControl').removeClass("playing");
    } else {
        animatePano = true;
        $('.playControl').addClass("playing");
    }
};

function startPano() {
    TweenLite.to(pano.material, 5, {
        opacity: 1
    });
    setTimeout(function() {
        showTitle()
        setTimeout(function() {
            hideTitle();
        }, 5000)
    }, 4000);
    animatePano = true;
    $('.playControl').addClass("playing");
}

function showTitle() {
    if (overlayTxt.children.length != 0) {
        TweenLite.to(overlayTxt.children[0].material, 3, {
            opacity: 1
        });
    }
}

function hideTitle() {
    if (overlayTxt.children.length != 0) {
        TweenLite.to(overlayTxt.children[0].material, 3, {
            opacity: 0
        });
    }
}



function toggleAudio() {
    if (audioPlaying) {
        audioPlaying = false;
        $('.playControl').removeClass("audioPlaying");
    } else {
        audioPlaying = true;
        $('.playControl').addClass("audioPlaying");
    }
}
document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('mozfullscreenchange', onFullscreenChange);
window.addEventListener('keydown', onkey, true);
window.addEventListener('resize', onWindowResize, false);
window.onload = function() {
    document.querySelector('button.prev').addEventListener('click', function() {
        previousPano()
    });
    document.querySelector('button.next').addEventListener('click', function() {
        nextPano()
    });
    document.querySelector('button.play').addEventListener('click', function() {
        togglePlay();
    });
    document.querySelector('button.pause').addEventListener('click', function() {
        togglePlay();
    });
    // document.querySelector('button.volume-up').addEventListener('click', function() {
    //     toggleAudio();
    // });   
    // document.querySelector('button.volume-off').addEventListener('click', function() {
    //     toggleAudio();
    // }); 
};
init();