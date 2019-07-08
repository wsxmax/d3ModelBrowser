function broswerStart(){
  console.log("browser onload");

  const mainCanvas = document.getElementById('mainCanvas');
  mainCanvas.width = 1920;
  mainCanvas.height = 1080;

  var programReady = false;
  var scene = null;
  var sceneReady = false;
  var rebindingNeeded = true;

  var worldMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  var projectMatrix = new Float32Array(16);
  mat4.perspective(projectMatrix,glMatrix.toRadian(90),mainCanvas.width/mainCanvas.height,0.1,1000);
  var worldMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  var viewMatrix = new Float32Array(16);
  mat4.lookAt(viewMatrix,[0,0,-10],[0,0,1],[0,1,0]);
  var lensMatrix = new Float32Array(16);
  mat4.multiply(lensMatrix,projectMatrix,viewMatrix);
  var matrix = new Float32Array(16);
  mat4.multiply(matrix,lensMatrix,worldMatrix);


  const gl = makeContextForCanvas(mainCanvas);





  //------------------------------------------------------------testcode---------------------------------------------------------------------------------------------
  var render = function(renderMatrix){
    for (var meshIndex = 0;meshIndex < scene.meshes.length;meshIndex++){
      for(var primitiveIndex = 0;primitiveIndex < scene.meshes[meshIndex].primitives.length;primitiveIndex++){
        gl.renderPrimitive(scene.meshes[meshIndex].primitives[primitiveIndex],renderMatrix);
      }
    }
  }

    var prepareForRender = function(callback){
      console.log("preparing for rend");

      //-------------------------------------------temp test------------------------------------------
      for (var meshIndex = 0;meshIndex < scene.meshes.length;meshIndex++){
        for(var primitiveIndex = 0;primitiveIndex < scene.meshes[meshIndex].primitives.length;primitiveIndex++){
          gl.configureProgramForPrimitive(scene.meshes[meshIndex].primitives[primitiveIndex],gl.defaultProgram);
        }
        console.log("finishing Preparing");
      }
      gl.clearColor(1,1,1,1);
      console.log("color should be cleared to white");
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      callback();
    }

    var beginLoop = function(){
      //render(matrix);
      console.log("should have rendered one time");
      requestAnimationFrame(loop);
    }

    var loop = function(){
      var identityMatrix  = new Float32Array(16);
      mat4.identity(identityMatrix);
      gl.clearColor(0,0,1,1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.clear(gl.DEPTH_BUFFER_BIT);

      mat4.rotate(worldMatrix,identityMatrix,performance.now()/2000,[0,1,0]);
      mat4.multiply(matrix,lensMatrix,worldMatrix);
      render(matrix);
      requestAnimationFrame(loop);
    }


    //----------------------------------------------------------------------------/temptest-------------------------------------------------





    gl.makeProgramFromURI('/shaders/vertexShaderGLSL','/shaders/fragmentShaderGLSL',function(renderProgram){
      gl.defaultProgram = renderProgram;
      programReady = true;
      if (sceneReady) prepareForRender(beginLoop);
    });

    gl.loadScene('/gltf/suzanne.gltf',function(jsonObject){
      scene = jsonObject;
      console.log('scene loaded:');
      console.log(scene);
      scene.loadImagesFromPath(scene.originalPath);
      scene.loadBufferFromPath(scene.originalPath,function(){
        gl.bufferObject(scene);
        sceneReady = true;
        if (programReady) prepareForRender(beginLoop);
      });
    });
  }
