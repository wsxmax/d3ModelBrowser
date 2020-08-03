function broswerStart(){
  console.log("browser onload");

  const mainCanvas = document.getElementById('mainCanvas');
  mainCanvas.width = 1920;
  mainCanvas.height = 1080;

  var programReady = false;
  var mainScene = null;
  keyDownCoord : vec2.create();
  var sceneReady = false;
  var rebindingNeeded = true;

  mainCamera = new camera([0,0,-10],[0,0,1],[0,1,0],60,mainCanvas.width,mainCanvas.height,1000,10);
  ghostCamera = new camera([0,0,-10],[0,0,1],[0,1,0],60,mainCanvas.width,mainCanvas.height,1000,10);


  var matrix = new Float32Array(16);
  mat4.identity(matrix);

  const gl = makeContextForCanvas(mainCanvas);





  //--------------------------------------------------------------------loop functions definition------------------------------------

    var beginLoop = function(){
      //render(matrix);
      console.log("should have rendered one time");
      requestAnimationFrame(loop);
    }

    var loop = function(){
      gl.clearColor(0,0,0,1);
      //gl.clear(gl.COLOR_BUFFER_BIT);
      //gl.clear(gl.DEPTH_BUFFER_BIT);

      gl.renderScene(mainScene,matrix,mainCamera);
      requestAnimationFrame(loop);
    }
//-------------------------------------------------------/loop function definitions-----------------------------------------------

//-----------------------------------------------------main process in order-----------------------------------------------------
    //gl.makeProgramFromURI('/shaders/defaultShaders/vertexShaderGLSL','/shaders/defaultShaders/fragmentShaderGLSL',function(renderProgram){
    gl.makeProgramFromURI('https://gitee.com/Mitsunoryw/d3ModelBrowser/shaders/defaultShaders/vertexShaderGLSL','https://gitee.com/Mitsunoryw/d3ModelBrowser/shaders/defaultShaders/fragmentShaderGLSL',function(renderProgram){
      gl.defaultProgram = renderProgram;
      programReady = true;
      if (sceneReady) gl.prepareForRender(mainScene,beginLoop);
    });
    //loadGltfFile('/gltf5/test.gltf',function(jsonObject){
    loadGltfFile('https://gitee.com/Mitsunoryw/d3ModelBrowser/gltf2/j23gltf.gltf',function(jsonObject){
    //loadGltfFile('/gltf2/j23gltf.gltf',function(jsonObject){
      const gltfObject = jsonObject;
      console.log('showing the ObjectStructure',gltfObject);
      mainScene = gltfObject.scenes[gltfObject.scene];
      console.log('scene loaded:');
      console.log(mainScene);
      gltfObject.loadImagesFromPath(gltfObject.originalPath);
      gltfObject.loadBufferFromPath(gltfObject.originalPath,function(){
        //mainScene.skybox = new skybox('/skybox','png');
        mainScene.skybox = new skybox('https://gitee.com/Mitsunoryw/d3ModelBrowser/skybox','png');
        gl.bufferObject(gltfObject);
        sceneReady = true;
        if (programReady) gl.prepareForRender(mainScene,beginLoop);
      });
    });
  }
