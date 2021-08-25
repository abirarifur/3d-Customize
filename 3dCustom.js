
var ThreeModelView = function () {
  let getVisiableParts = []
  const partsButton = document.querySelector('.partsButton');
  const colorButton = document.querySelector('.colorButton');
  const colorsContainer = document.querySelector('#colorsContainer');
  const partsNameforcolor = document.querySelector('#partsNameforcolor');
  const colorByPartsName = document.querySelector('#colorByPartsName');
  let options = document.querySelector('#options')
  //  partsButton.addEventListener('click', chooseParts);
  const changePartContainer = document.querySelector('#changePartContainer');
  let changePart = document.querySelector('#changePart');
  changePartContainer.style.transform = 'translateX(100%)';
  changePartContainer.style.display = 'none';
  var textureLoader = new THREE.TextureLoader();
  let loaderContainer = document.querySelector('#loaderContent');
  const BACKGROUND_COLOR = 0xF3F3F3;
  var cameraFar = 15;
  let initRotate = 0;
  // const BACKGROUND_COLOR = 0x5D5D5D;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND_COLOR);
  // scene.background = BACKGROUND_COLOR;
  scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);
  const canvas = document.querySelector('#c');
  canvas.style.visibility = 'hidden'

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); //preserveDrawingBuffer: true
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  // Create cube render target;

  var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = cameraFar;
  camera.position.x = 0;
  camera.position.y = 1;

  var light = new THREE.AmbientLight(0xFAFAFA, 0.4); // soft white light
  scene.add(light);

  var light = new THREE.HemisphereLight(0xFAFAFA, 0x080820, 0.5);
  scene.add(light);
  var dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
  dirLight.position.set(-8, 12, 8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);

  // Add directional Light to scene
  scene.add(dirLight);
  // var dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  // dirLight.position.set(-10, 10, 10);
  // dirLight.castShadow = true;
  // dirLight.shadowCameraVisible = true;
  // dirLight.shadowDarkness = 1;
  // dirLight.shadow.camera.left = -500;
  // dirLight.shadow.camera.right = 500;
  // dirLight.shadow.camera.top = 500;
  // dirLight.shadow.camera.bottom = -500;
  // dirLight.shadow.camera.near = 1;
  // dirLight.shadow.camera.far = 1000;
  // // // dirLight.shadowCameraVisible = true;
  // dirLight.shadow.mapSize.width = 4096; // default is 512
  // dirLight.shadow.mapSize.height = 4096; // default is 512

  // Add directional Light to scene
  // scene.add(dirLight);

  // nike/scene.gltf

  var theModel;
  // const MODEL_PATH = "assets/3d/final/model/untitled.glb";
  const MODEL_PATH = "assets/3d/water_bottle/water_bottle.glb";
  let initTextureColor = textureLoader.load('assets/3d/water_bottle/blinn1SG_baseColor.png')
  let normalMap = textureLoader.load('assets/3d/water_bottle/blinn1SG_normal.png')
  let metalnessMap = textureLoader.load('assets/3d/water_bottle/blinn1SG_occlusionRoughnessMetallic.png')
  var loader = new THREE.GLTFLoader();

  loader.load(MODEL_PATH, function (gltf) {
    theModel = gltf.scene;
    func(gltf.scene);
    initialPartsSelect(theModel)
    for (let object of INITIAL_MAP) {
      const INITIAL_MTL = new THREE.MeshStandardMaterial({ aoMap: metalnessMap, map: initTextureColor, metalnessMap: metalnessMap, normalMap: normalMap, roughness: 0.5 });
      initColor(theModel, object.childID, INITIAL_MTL);
    }
    theModel.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    // Set the models initial scale
    // theModel.scale.set(2, 2, 2);

    // Offset the y position a bit
    theModel.position.y = -2.5;

    // Add the model to the scene
    scene.add(theModel);
    setTimeout(function () {
      loaderContainer.style.display = 'none';
      canvas.style.visibility = 'visible'
    }, 1500)

  }, undefined, function (error) {
    console.error(error)
  });
  function initialPartsSelect(obj) {
    for (let [index, bodypart] of obj.children.entries()) {
      if (index != 1 && bodypart.type == 'Mesh') {
        bodypart.visible = false;
      }
    }
    obj.children.forEach(child => initialPartsSelect(child))
  }


  var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
  var floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xFBFBFB, // <------- Here
    shininess: 0
  });

  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -0.5 * Math.PI;
  floor.receiveShadow = true;
  floor.position.y = -2.5;
  scene.add(floor);

  let controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI / 2;
  controls.minPolarAngle = Math.PI / 3;
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.dampingFactor = 0.1;
  controls.autoRotate = false; // Toggle this if you'd like the chair to automatically rotate
  controls.autoRotateSpeed = 0.2; // 30

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    if (theModel != null) {

      initialRotation();
      // DRAG_NOTICE.classList.add('start');
    }
  }

  animate();

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    var width = window.innerWidth;
    var height = window.innerHeight;

    var canvasPixelWidth = canvas.width / window.devicePixelRatio;
    var canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {

      renderer.setSize(width, height, false);
    }
    return needResize;
  }


  // const INITIAL_MTL2 = new THREE.MeshStandardMaterial({
  //     aoMap: texture2,
  //     map: texture,
  //     envMap: texture,
  //     metalnessMap: texture2,
  //     normalMap: texture3,
  //     roughness: 0.6
  // });

  const INITIAL_MAP = [];

  function func(obj) {
    for (let [index, bodypart] of obj.children.entries()) {
      if (bodypart.type == 'Mesh') {
        var bodypartobj = { childID: bodypart.name, mtl: bodypart.material }
        INITIAL_MAP.push(bodypartobj);
      }
    }
    obj.children.forEach(child => func(child))
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Function - Build Colors
  // function buildColors(colors) {
  //     for (let [i, color] of colors.entries()) {
  //         let colorWapper = document.createElement('div');
  //         colorWapper.classList.add('colordetails');
  //         let swatch = document.createElement('div');
  //         swatch.classList.add('colorPicker', 'rounded-circle');

  //         if (color.texture) {
  //             swatch.style.backgroundImage = "url(" + color.texture + ")";
  //             swatch.style.backgroundSize = "cover";
  //             swatch.style.width = "100px";
  //             swatch.style.height = "100px";
  //         } else {
  //             swatch.style.background = "#" + color.color;
  //             swatch.style.backgroundSize = "cover";
  //             swatch.style.width = "100px";
  //             swatch.style.height = "100px";
  //         }

  //         swatch.setAttribute('data-key', i);
  //         // for (const swatch of swatches) {
  //         swatch.addEventListener('click', selectSwatch);
  //         // }

  //         let colorInfo = document.createElement('p');
  //         let node = document.createTextNode("color " + (i + 1));
  //         colorInfo.appendChild(node);

  //         colorWapper.appendChild(swatch);
  //         colorWapper.appendChild(colorInfo);
  //         COLOR.append(colorWapper);

  //     }
  // }

  // function partsBuild(parts) {
  //     for (let [i, part] of parts.entries()) {
  //         let partWapper = document.createElement('div');
  //         partWapper.classList.add('partsDetails');
  //         // let swatch = document.createElement('div');
  //         // swatch.classList.add('colorPicker','rounded-circle');

  //         if (part.part) {
  //             partWapper.style.backgroundImage = "url(" + part.part + ")";
  //             partWapper.style.backgroundSize = "cover";
  //             partWapper.style.backgroundPosition = "center";
  //             partWapper.style.width = "100px";
  //             partWapper.style.height = "100px";
  //             partWapper.style.margin = "20px";
  //         }

  //         partWapper.setAttribute('data-option', part.name);

  //         // let partInfo = document.createElement('p');
  //         // let node = document.createTextNode("part "+(i+1));
  //         // partInfo.appendChild(node);
  //         PART.append(partWapper);
  //     }
  // }


  // partsBuild(parts)
  //     // const swatches = document.querySelectorAll(".colordetails");
  // const partsDetails = document.querySelectorAll(".partsDetails");



  // for (const partsDetail of partsDetails) {
  //     partsDetail.addEventListener('click', selectPart);
  // }
  // let PartsSelection = '';
  // let colorsContent = document.querySelector('#colorsContainer');
  // let partsdiv = document.querySelector('#partsContainer');
  // function selectPart(e) {
  //     PartsSelection = e.target.dataset.option;
  //     // partsdiv = document.querySelector('#parts')
  //     partsdiv.style.transform = "translateX(100%)";
  //     setTimeout(function(){
  //         partsdiv.style.display = 'none';
  //         colorsContent.style.display = "flex";
  //     }, 300)
  //     // partsdiv.style.display = "none";
  //     setTimeout(function(){

  //         colorsContent.style.transform = "translateX(0%)";
  //     }, 600)


  //     buildColors(colors[PartsSelection]);

  // }

  function selectSwatch(e) {
    let color = PARTS_COLORS[parseInt(e.target.dataset.key)];
    let new_mtl;
    if (color.texture) {
      let txt = new THREE.TextureLoader().load(color.texture);
      new_mtl = { texture: txt };
    } else {
      new_mtl = { color: '0x' + color.color }
    }
    ThreeModelView.colorChoise = color.texture
    setMaterial(theModel, PartsSelection, new_mtl);
  }

  function setMaterial(parent, type, mtl) {
    parent.traverse((o) => {
      if (o.isMesh && o.name != null) {
        if (o.name == type) {
          if (mtl.texture)
            o.material.map = mtl.texture;
          else
            o.material.color = rgb(67, 138, 172);
        }
      }
    });
  }

  function initColor(parent, type, mtl) {
    parent.traverse((o) => {
      if (o.isMesh) {
        if (o.name.includes(type)) {
          o.material = mtl;
          o.name = type; // Set a new property to identify this object
        }
      }
    });
  }
  // function closeColorsWapper(){
  //     // let colorswapper = document.getElementById('colorswapper');
  //     colorsContent.style.transform = "translateX(100%)";

  //     setTimeout(function(){
  //         partsdiv.style.display = 'flex';
  //         colorsContent.style.display = 'none';

  //         colorswapper.innerHTML = "";
  //     }, 300)
  //     setTimeout(function(){
  //         partsdiv.style.transform = "translateX(0%)";
  //     }, 400)



  // }


  function initialRotation() {

    initRotate++;
    if (initRotate <= 2) {
      theModel.rotation.y += Math.PI / 60;
    } else {
      loaded = true;
    }
  }

  loaderContainer.width = window.clientWidth;
  loaderContainer.height = window.clientHeight;
  // function test() {
  //  var test = renderer.domElement.toDataURL();
  //  let image = document.querySelector('#testImage');
  //  image.src = test;
  // }
  // ThreeModelView.closeColorsWapper = closeColorsWapper
  /////////////////////////////new function////////////////////
  const parts = [{
    part: 'assets/images/parts/cap.png',
    name: 'cap'
  },
  {
    part: 'assets/images/parts/bottom_1.png',
    name: 'bottom_1'
  },
  {
    part: 'assets/images/parts/bottom_2.png',
    name: 'bottom_2'
  },
  {
    part: 'assets/images/parts/bottom_3.png',
    name: 'bottom_3'
  },
  {
    part: 'assets/images/parts/ring_1.png',
    name: 'ring_1'
  },
  {
    part: 'assets/images/parts/ring_2.png',
    name: 'ring_2'
  },

  ]
  const PARTS_COLORS = [
    { texture: './assets/3d/water_bottle/blinn1SG_baseColor.png' },
    { texture: './assets/3d/water_bottle/blinn1SG_baseColor_1.png' },
    { texture: './assets/3d/water_bottle/blinn1SG_baseColor_2.png' },
    { texture: './assets/3d/water_bottle/blinn1SG_baseColor_3.png' },
    { texture: './assets/3d/water_bottle/blinn1SG_baseColor_4.png' },
    { texture: './assets/3d/water_bottle/blinn1SG_baseColor_5.png' },
    { texture: './assets/3d/water_bottle/blinn1SG_baseColor_6.png' },
    { texture: './assets/3d/water_bottle/blinn1SG_baseColor_7.png' },
    { texture: './assets/3d/water_bottle/blinn1SG_baseColor_8.png' },
    { texture: './assets/3d/water_bottle/blinn1SG_baseColor_9.png' },

]
  function buildColors(e) {
    colorByPartsName.innerHTML = ''
    PartsSelection = e.target.dataset.option
    for (let i=0; i <PARTS_COLORS.length; i++){

      let colorWapper = document.createElement('div');
      colorWapper.classList.add('colordetails');
      colorWapper.style.textAlign = 'center';
      let swatch = document.createElement('div');
      swatch.classList.add('colorPicker');

      if (PARTS_COLORS[i].texture) {
        swatch.style.backgroundImage = "url(" + PARTS_COLORS[i].texture + ")";
        swatch.style.width = "50px";
        swatch.style.height = "50px";
        // swatch.style.margin = "10px";
        swatch.style.borderRadius = "50%";
      } else {
        swatch.style.background = "#" + PARTS_COLORS[i].color;
      }

      swatch.setAttribute('data-key', i);
      // for (const swatch of swatches) {
      swatch.addEventListener('click', selectSwatch);
      // }

      // let colorInfo = document.createElement('p');
      // let node = document.createTextNode("color " + (i + 1));
      // colorInfo.appendChild(node);

      colorWapper.appendChild(swatch);
      // colorWapper.appendChild(colorInfo);
      colorByPartsName.append(colorWapper);

    }
  }
  let chooseParts = () => {

    options.style.transform = 'translateX(100%)';

      options.style.display = 'none';


    showParstToChange(parts)

      changePartContainer.style.display = 'inline-flex';
      changePartContainer.style.transform = 'translateX(0)';




  }
  let choosePartsColor = () => {
    options.style.transform = 'translateX(100%)';

      options.style.display = 'none';

    getVisiableMeshName(theModel)
    showParstToChangeColor(getVisiableParts)

      colorsContainer.style.display = 'inline-flex';
      colorsContainer.style.transform = 'translateX(0)';



  }
  function showParstToChangeColor(vParts){
    partsNameforcolor.innerHTML = '';
    let colorPartsName;
    for (let visiPart of vParts) {
        colorPartsName = document.createElement('div');
        let index = parts.findIndex(part => part.name == visiPart);
        if(index > -1){
          colorPartsName.style.backgroundImage = "url("+parts[index].part+")";
        }

        // colorPartsName.innerHTML = visiPart;

        colorPartsName.classList.add('colorChangeParts')
        colorPartsName.setAttribute('data-option', visiPart);

        colorPartsName.addEventListener('click', buildColors)
        partsNameforcolor.append(colorPartsName)
    }
  }

  function showParstToChange(parts) {
    changePart.innerHTML = '';
    for (let part of parts) {
      let partsOfModel = document.createElement('div');
      partsOfModel.style.backgroundImage = "url(" + part.part + ")"
      partsOfModel.classList.add('partsOfModel');
      partsOfModel.setAttribute('data-parts', part.name);
      partsOfModel.addEventListener('click', swatchParts);
      changePart.append(partsOfModel);
    }
  }



  function swatchParts(e) {
    let partName = e.target.dataset.parts;
    setmodelPart(theModel, partName);
  }
  function setmodelPart(theModel, type) {
    theModel.traverse((o) => {
      if (o.isMesh && o.name != null) {

        if (o.name.match(type.substring(0, type.indexOf("_")))) {
          o.visible = false;
        }
        if (o.name == type) {
          o.visible = true;
        }
      }
    });

    getVisiableMeshName(theModel)
  }
  function getVisiableMeshName(theModel) {
    getVisiableParts = []
    theModel.traverse((o) => {
      if (o.isMesh) {
        if (o.visible == true) {
          getVisiableParts.push(o.name);
        }
      }
    });
  }



  function goback(){
    changePartContainer.style.display = 'none';
    changePartContainer.style.transform = 'translateX(100%)';
    colorsContainer.style.display = 'none';
    colorsContainer.style.transform = 'translateX(100%)';
    options.style.display = "block"
    options.style.transform = 'translateX(0)'
  }


  partsButton.addEventListener('click', chooseParts);
  colorButton.addEventListener('click', choosePartsColor);
  let doneBtn = document.querySelectorAll('.doneBtn').forEach(item => {
    item.addEventListener('click', goback)
  })


}




