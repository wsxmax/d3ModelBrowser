class skybox {
  constructor(imageSource){
    var self = this;
    this.load = false;
    this.imageSource = imageSource;
    this.textureImage = new Image();
    this.textureImage.src = imageSource;
    this.refreshTexture = function(){}
    this.textureImage.onload = function(){
      self.load = true;
      self.refreshTexture();
    }
  }
}

loadGltfFile = function(uri,callback){
  LoadJSONContent(uri,function(error,jsonObject){
    if(!error) {
      jsonObject.originalURI = uri;
      jsonObject.originalPath = uri.slice(0,uri.lastIndexOf('/')+1);
      jsonObject.loadBufferFromPath = function(path,callback){
        var remainingBuffers = 0;
        for(var bufferIndex = 0;bufferIndex < jsonObject.buffers.length;bufferIndex++){
          remainingBuffers += 1;
          LoadBinaryBufferToObject(path+jsonObject.buffers[bufferIndex].uri,jsonObject.buffers[bufferIndex],function(error){
            if (!error) callback();
            else console.log(error);
          });
        }
      }
      jsonObject.loadImagesFromPath = function(path){
        for(var imageIndex = 0;imageIndex < jsonObject.images.length;imageIndex++){
          jsonObject.images[imageIndex].imageObject = new Image();
          jsonObject.images[imageIndex].loaded = false;
          jsonObject.images[imageIndex].imageObject.index = imageIndex;
          console.log("image is being load-----------------------------------");
          jsonObject.images[imageIndex].imageObject.onload = function(){
            console.log("-----------------------------------------image onload",this.index+1,"/",jsonObject.images.length);
            jsonObject.images[this.index].loaded = true;
            for(var textureIndex = 0; textureIndex < jsonObject.textures.length; textureIndex ++){
              if(jsonObject.textures[textureIndex].source == this.index){
                console.log('image loaded with index',this.index);
                jsonObject.textures[textureIndex].textureObjectLink.textureImage = this;
                if(jsonObject.textures[textureIndex].textureObjectLink.hasOwnProperty('refreshTexture')){
                  console.log('textureObject has been configured before Image was load');
                  jsonObject.textures[textureIndex].textureObjectLink.refreshTexture();
                }
                jsonObject.textures[textureIndex].textureObjectLink.load = true;
              }
            }
          }
          jsonObject.images[imageIndex].imageObject.src = path+jsonObject.images[imageIndex].uri;
          console.log(jsonObject.images[imageIndex]);
        }
      }
      makeObjectLocal(jsonObject);
      callback(jsonObject);
    }
    else console.log(error);
  });
}



function makeContextForCanvas(renderCanvas){
  const createdContext = renderCanvas.getContext("webgl")||renderCanvas.getContext("experimantal-webgl")||renderCanvas.getContext("moz-webgl")||renderc.getContext("webkit-3d");
  extendRenderContext(createdContext);
  return createdContext;
}

function extendRenderContext (contextObject){
  contextObject.scenes = [];
  contextObject.makeProgramFromText = function(vertexShaderText,fragmentShaderText){
    const vertexShader = contextObject.createShader(contextObject.VERTEX_SHADER);
    const fragmentShader = contextObject.createShader(contextObject.FRAGMENT_SHADER);
    contextObject.shaderSource(vertexShader,vertexShaderText);
    contextObject.shaderSource(fragmentShader,fragmentShaderText);
    contextObject.compileShader(vertexShader);
    contextObject.compileShader(fragmentShader);
    const program = contextObject.createProgram();
    contextObject.attachShader(program,vertexShader);
    contextObject.attachShader(program,fragmentShader);
    contextObject.linkProgram(program);
    console.log(program);
    var attribCount = contextObject.getProgramParameter(program,contextObject.ACTIVE_ATTRIBUTES);
    for(var attribIndex = 0; attribIndex < attribCount; attribIndex ++){
      console.log("#",attribIndex," name:",contextObject.getActiveAttrib(program,attribIndex).name);
    }
    return program;
  }

  contextObject.makeProgramFromURI = function(vertexShaderURI,fragmentShaderURI,callback){
    var vertexShaderText = null;
    var fragmentShaderText = null;
    LoadTextContent(vertexShaderURI+'?='+Math.random(),function(error,textData){
      if(!error){
        vertexShaderText = textData;
        if(fragmentShaderText) callback(contextObject.makeProgramFromText(vertexShaderText,fragmentShaderText));
      }
      else console.log(error);
    });
    LoadTextContent(fragmentShaderURI+'?='+Math.random(),function(error,textData){
      if(!error){
        fragmentShaderText = textData;
        if (vertexShaderText) callback(contextObject.makeProgramFromText(vertexShaderText,fragmentShaderText));
      }
      else console.log(error);
    });
  }

  contextObject.defaultProgram = null;


  contextObject.bufferObject = function(sceneObject){
    for (var bufferViewIndex = 0;bufferViewIndex < sceneObject.bufferViews.length;bufferViewIndex++){
      sceneObject.bufferViews[bufferViewIndex].renderBuffer = contextObject.createBuffer();
      switch (sceneObject.bufferViews[bufferViewIndex].target) {
        case 34962:  //ARRAY_BUFFER
        contextObject.bindBuffer(contextObject.ARRAY_BUFFER,sceneObject.bufferViews[bufferViewIndex].renderBuffer);
        contextObject.bufferData(contextObject.ARRAY_BUFFER,sceneObject.buffers[sceneObject.bufferViews[bufferViewIndex].buffer].data.slice(sceneObject.bufferViews[bufferViewIndex].byteOffset,sceneObject.bufferViews[bufferViewIndex].byteOffset+sceneObject.bufferViews[bufferViewIndex].byteLength),contextObject.STATIC_DRAW);
        break;
        case 34963:  //ELEMENT_ARRAY_BUFFER
        contextObject.bindBuffer(contextObject.ELEMENT_ARRAY_BUFFER,sceneObject.bufferViews[bufferViewIndex].renderBuffer);
        contextObject.bufferData(contextObject.ELEMENT_ARRAY_BUFFER,sceneObject.buffers[sceneObject.bufferViews[bufferViewIndex].buffer].data.slice(sceneObject.bufferViews[bufferViewIndex].byteOffset,sceneObject.bufferViews[bufferViewIndex].byteOffset+sceneObject.bufferViews[bufferViewIndex].byteLength),contextObject.STATIC_DRAW);
        break;
        default:
        console.log("bufferError:target undefined");
      }
    }
  }

  contextObject.attributeSize = function(type){
    switch(type){
      case "SCALAR" : return 1;
      case "VEC2" : return 2;
      case "VEC3" :return 3;
      case "VEC4" :return 4;
      default : return null;
    }
  }

  contextObject.configureProgramForSkybox = function(skybox){
    console.log("configuring for skybox");
    if(skybox.load){
      var skyBoxTexture = contextObject.createTexture();
      const skyBoxTextureSlot = contextObject.textureSlotArray.alloc();
      contextObject.useProgram(contextObject.skyboxRenderProgram);
      contextObject.activeTexture(contextObject.TEXTURE0 + skyBoxTextureSlot);
      contextObject.bindTexture(contextObject.TEXTURE_2D,skyBoxTexture);
      skyBoxTexture.slot = skyBoxTextureSlot;
      contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_S,contextObject.CLAMP_TO_EDGE);
      contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_T,contextObject.CLAMP_TO_EDGE);
      contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MAG_FILTER,contextObject.LINEAR);
      contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MIN_FILTER,contextObject.LINEAR);
      contextObject.texImage2D(contextObject.TEXTURE_2D,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.textureImage);
      console.log('the image should be loaded already',skybox.textureImage);
      contextObject.uniform1i(contextObject.getUniformLocation(contextObject.skyboxRenderProgram,'skyBoxTexture'),skyBoxTextureSlot);
      }else{
        skybox.refreshTexture = function(){
          var skyBoxTexture = contextObject.createTexture();
          contextObject.useProgram(contextObject.skyboxRenderProgram);
          const skyBoxTextureSlot = contextObject.textureSlotArray.alloc();
          console.log('alloced for skybox texture a slot: ',skyBoxTextureSlot);
          contextObject.activeTexture(contextObject.TEXTURE0 + skyBoxTextureSlot);
          contextObject.bindTexture(contextObject.TEXTURE_2D,skyBoxTexture);
          skyBoxTexture.slot = skyBoxTextureSlot;
          contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_S,contextObject.CLAMP_TO_EDGE);
          contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_T,contextObject.CLAMP_TO_EDGE);
          contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MAG_FILTER,contextObject.LINEAR);
          contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MIN_FILTER,contextObject.LINEAR);
          contextObject.texImage2D(contextObject.TEXTURE_2D,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.textureImage);
          console.log('the image should be loaded already',skybox.textureImage);
          contextObject.uniform1i(contextObject.getUniformLocation(contextObject.skyboxRenderProgram,'skyBoxTexture'),skyBoxTextureSlot);
        }
      }


  }


  contextObject.configureProgramForPrimitive = function(primitiveObject){
    if((!primitiveObject.materialObject.hasOwnProperty('program'))||primitiveObject.materialObject.program == null){
      primitiveObject.materialObject.program = contextObject.defaultProgram;
    }
    var renderProgram = primitiveObject.materialObject.program;
    var attributeCount = contextObject.getProgramParameter(renderProgram,contextObject.ACTIVE_ATTRIBUTES);
    contextObject.useProgram(renderProgram);
    for (var attributeIndex = 0;attributeIndex < attributeCount; attributeIndex ++){
      var attributeKey = contextObject.getActiveAttrib(renderProgram,attributeIndex).name;
      var attributeLocation = contextObject.getAttribLocation(renderProgram,attributeKey);
      contextObject.bindBuffer(contextObject.ARRAY_BUFFER,primitiveObject.attributes.attributeAccessors[attributeKey].bufferViewObject.renderBuffer);
      console.log("current attributeAccessors: ",primitiveObject.attributes.attributeAccessors);
      console.log('getting attributes Location:',attributeKey,primitiveObject.attributes.attributeAccessors[attributeKey]);
      console.log('buffer bound to vao as attribute: ',attributeKey);
      contextObject.vertexAttribPointer(
        attributeLocation,
        contextObject.attributeSize(primitiveObject.attributes.attributeAccessors[attributeKey].type),
        primitiveObject.attributes.attributeAccessors[attributeKey].componentType,
        contextObject.FLOAT,
        contextObject.TRUE,
        primitiveObject.attributes.attributeAccessors[attributeKey].bufferViewObject.byteStride,
        primitiveObject.attributes.attributeAccessors[attributeKey].byteOffset
      );
      //contextObject.enableVertexAttribArray(attributeLocation);
      contextObject.bindBuffer(contextObject.ARRAY_BUFFER,null);
    }

    var uniformCount = contextObject.getProgramParameter(renderProgram,contextObject.ACTIVE_UNIFORMS);
    for (var uniformIndex = 0;uniformIndex < uniformCount;uniformIndex++){
      var uniformKey = contextObject.getActiveUniform(renderProgram,uniformIndex).name;
      if(uniformKey!='matrix'&&primitiveObject.materialObject.uniforms.hasOwnProperty(uniformKey)){
        var uniformLocation = contextObject.getUniformLocation(renderProgram,uniformKey);
        console.log('the problem key appears to be', uniformKey);
        switch(contextObject.getActiveUniform(renderProgram,uniformIndex).type){
          case contextObject.SAMPLER_2D: {
            console.log('configuring material uniform',uniformKey,'with load status:',primitiveObject.materialObject.uniforms[uniformKey].load);
            if(!primitiveObject.materialObject.uniforms[uniformKey].load){
              console.log('uniform is not loaded, leave the function');
              primitiveObject.materialObject.uniforms[uniformKey].textureImage = new Image();
              primitiveObject.materialObject.uniforms[uniformKey].refreshTexture = function(){
                contextObject.useProgram(renderProgram);
                primitiveObject.materialObject.uniforms[uniformKey].textureObject = contextObject.createTexture();
                var textureSlot = contextObject.textureSlotArray.alloc();
                contextObject.activeTexture(contextObject.TEXTURE0 + textureSlot);
                contextObject.bindTexture(contextObject.TEXTURE_2D,primitiveObject.materialObject.uniforms[uniformKey].textureObject);
                contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_S,contextObject.CLAMP_TO_EDGE);
                contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_T,contextObject.CLAMP_TO_EDGE);
                contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MAG_FILTER,contextObject.LINEAR);
                contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MIN_FILTER,contextObject.LINEAR);
                contextObject.texImage2D(contextObject.TEXTURE_2D,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,primitiveObject.materialObject.uniforms[uniformKey].textureImage);
                contextObject.uniform1i(contextObject.getUniformLocation(renderProgram,uniformKey),textureSlot);
                console.log('texture ', uniformKey,' is using slot:',textureSlot,'refreshed');
              }
            }else {
              contextObject.useProgram(renderProgram);
              primitiveObject.materialObject.uniforms[uniformKey].textureObject = contextObject.createTexture();
              var textureSlot = contextObject.textureSlotArray.alloc();
              contextObject.activeTexture(contextObject.TEXTURE0 + textureSlot);
              contextObject.bindTexture(contextObject.TEXTURE_2D,primitiveObject.materialObject.uniforms[uniformKey].textureObject);
              contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_S,contextObject.CLAMP_TO_EDGE);
              contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_T,contextObject.CLAMP_TO_EDGE);
              contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MAG_FILTER,contextObject.LINEAR);
              contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MIN_FILTER,contextObject.LINEAR);
              contextObject.texImage2D(contextObject.TEXTURE_2D,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,primitiveObject.materialObject.uniforms[uniformKey].textureImage);
              contextObject.uniform1i(contextObject.getUniformLocation(renderProgram,uniformKey),textureSlot);
              console.log('texuture ', uniformKey,' is using slot:',textureSlot);
            }
            break;
          }
        }
      }
    }
  }


  contextObject.renderPrimitive = function(primitiveObject,matrix){
    var usingProgram = primitiveObject.materialObject.program;
    if(contextObject.getParameter(contextObject.ELEMENT_ARRAY_BUFFER_BINDING)!=primitiveObject.indicesAccessor.bufferViewObject.renderBuffer){
      console.log('rebind indices buffer');
      contextObject.bindBuffer(contextObject.ELEMENT_ARRAY_BUFFER,primitiveObject.indicesAccessor.bufferViewObject.renderBuffer);
    }
    if(primitiveObject.materialObject.hasOwnProperty('program')){
      if(contextObject.getParameter(contextObject.CURRENT_PROGRAM) != primitiveObject.materialObject.program){
        contextObject.useProgram(primitiveObject.materialObject.program);
        usingProgram = primitiveObject.materialObject.program;
      }else{
        usingProgram = contextObject.getParameter(contextObject.CURRENT_PROGRAM);
      }
    }else{
      if(contextObject.getParameter(contextObject.CURRENT_PROGRAM) != contextObject.defaultProgram && contextObject.defaultProgram != null){
        contextObject.useProgram(contextObject.defaultProgram);
        usingProgram = contextObject.defaultProgram;
      }else{
        contextObject.useProgram(contextObject.defaultProgram);
        usingProgram = contextObject.defaultProgram;
        //????????????????????????????????????????????????????????????????????????
      }
    }
    for (var attributeIndex = 0;attributeIndex < contextObject.getProgramParameter(usingProgram,contextObject.ACTIVE_ATTRIBUTES); attributeIndex ++){
      var attributeKey = contextObject.getActiveAttrib(usingProgram,attributeIndex).name;
      var attributeLocation = contextObject.getAttribLocation(usingProgram,attributeKey);
      contextObject.bindBuffer(contextObject.ARRAY_BUFFER,primitiveObject.attributes.attributeAccessors[attributeKey].bufferViewObject.renderBuffer);
      contextObject.vertexAttribPointer(
        attributeLocation,
        contextObject.attributeSize(primitiveObject.attributes.attributeAccessors[attributeKey].type),
        primitiveObject.attributes.attributeAccessors[attributeKey].componentType,
        contextObject.FLOAT,
        contextObject.TRUE,
        primitiveObject.attributes.attributeAccessors[attributeKey].bufferViewObject.byteStride,
        primitiveObject.attributes.attributeAccessors[attributeKey].byteOffset
      );
      contextObject.enableVertexAttribArray(attributeLocation,attributeKey);
    }
    var matrixLocation = contextObject.getUniformLocation(usingProgram,'matrix');
    contextObject.uniformMatrix4fv(matrixLocation,contextObject.FALSE,matrix);
    contextObject.drawElements(contextObject.TRIANGLES,primitiveObject.indicesAccessor.count,contextObject.UNSIGNED_SHORT,primitiveObject.indicesAccessor.byteOffset);

  }

  contextObject.textureSlotArray = {
    slotArray : [],
    currentAvailableSlot : 0,
    alloc : function(){
      if (this.slotArray.length){
        return slotArray.pop();
      }
      else {
        this.currentAvailableSlot ++;
        return this.currentAvailableSlot-1;
      }
    },
    free : function(slot){
      this.slotArray.push(slot);
    }
  }

  /*contextObject.makeProgramFromURI('/shaders/skyboxShaders/vertexShaderGLSL','/shaders/skyboxShaders/fragmentShaderGLSL',function(skyboxProgram){
    contextObject.skyboxRenderProgram = skyboxProgram;
    var verticesBuffer = contextObject.createBuffer();
    var verticiesIndicesBuffer = contextObject.createBuffer();
    var vertices = 	[ // X, Y
      -1,-1,
      -1,1,
      1,1,
      1,-1
    ];
    var verticesIndices = [
      0,1,2,
      2,3,0
    ];
    contextObject.useProgram(contextObject.skyboxRenderProgram);
    contextObject.bindBuffer(contextObject.ARRAY_BUFFER,verticesBuffer);
    contextObject.bufferData(contextObject.ARRAY_BUFFER,new Float32Array(vertices),contextObject.STATIC_DRAW);
    contextObject.skyboxVerticesBuffer = verticesBuffer;
    contextObject.vertexAttribPointer(
      contextObject.getAttribLocation(contextObject.skyboxRenderProgram,'skyPOSITION'),
      2,
      contextObject.FLOAT,
      contextObject.FALSE,
      2*Float32Array.BYTES_PER_ELEMENT,
      0
    );
    contextObject.skyboxarraybuffer = verticesBuffer;
    contextObject.bindBuffer(contextObject.ELEMENT_ARRAY_BUFFER,verticiesIndicesBuffer);
    contextObject.bufferData(contextObject.ELEMENT_ARRAY_BUFFER,new Uint16Array(verticesIndices),contextObject.STATIC_DRAW);
    contextObject.skyboxElementArrayBuffer = verticiesIndicesBuffer;
    contextObject.enableVertexAttribArray(contextObject.getAttribLocation(contextObject.skyboxRenderProgram,'skyPOSITION'));
    contextObject.bindBuffer(contextObject.ARRAY_BUFFER,null);
    contextObject.bindBuffer(contextObject.ELEMENT_ARRAY_BUFFER,null);
  });*/

  contextObject.renderSkybox = function(skybox,camera){
    if(contextObject.hasOwnProperty('skyboxRenderProgram')){
      if(contextObject.getParameter(contextObject.ELEMENT_ARRAY_BUFFER_BINDING)!=contextObject.skyboxElementArrayBuffer){
        contextObject.bindBuffer(contextObject.ELEMENT_ARRAY_BUFFER,contextObject.skyboxElementArrayBuffer);
      }
      contextObject.bindBuffer(contextObject.ARRAY_BUFFER,contextObject.skyboxVerticesBuffer);
      contextObject.useProgram(contextObject.skyboxRenderProgram);
      contextObject.clear(contextObject.COLOR_BUFFER_BIT);
      contextObject.drawElements(contextObject.TRIANGLES,6,contextObject.UNSIGNED_SHORT,0);
    }
  }

  contextObject.renderMesh = function(meshObject,matrix){
    for(var primitiveIndex = 0; primitiveIndex < meshObject.primitives.length; primitiveIndex++){
      contextObject.renderPrimitive(meshObject.primitives[primitiveIndex],matrix);
    }
  }

  contextObject.renderNode = function(nodeObject,matrix){
    var nodeMatrix = new Float32Array(16);
    if(nodeObject.hasOwnProperty('matrix')){
      mat4.multiply(nodeMatrix,matrix,nodeObject.matrix);
    }else{
      mat4.copy(nodeMatrix,matrix);
    }
    if(nodeObject.hasOwnProperty('meshObject')){
      contextObject.renderMesh(nodeObject.meshObject,nodeMatrix);
    }
    if(nodeObject.hasOwnProperty('childrenObjects')){
      for(var childIndex = 0;childIndex < childrenObjects.length;childIndex ++){
        contextObject.renderNode(childrenObjects[childIndex],nodeMatrix);
      }
    }
  }

  contextObject.renderScene = function(sceneObject,camera,matrix){
    var renderMatrix = new Float32Array(16);
    var cameraMatrix = camera.generateMatrix();
    mat4.multiply(renderMatrix,cameraMatrix,sceneObject.sceneMatrix);
    //if(sceneObject.hasOwnProperty('skybox')&&sceneObject.skybox!=null&&sceneObject.skybox.load){
      //contextObject.renderSkybox(sceneObject.skybox,camera);
    //}
    for(var nodeIndex = 0;nodeIndex < sceneObject.nodes.length;nodeIndex ++){
      contextObject.renderNode(sceneObject.nodeObject[nodeIndex],renderMatrix);
    }
  }

  contextObject.configureProgramForMesh = function(meshObject){
    for(var primitiveIndex = 0; primitiveIndex < meshObject.primitives.length;primitiveIndex ++){
      contextObject.configureProgramForPrimitive(meshObject.primitives[primitiveIndex]);
    }
  }

  contextObject.configureProgramForNode = function(nodeObject){
    console.log('configuring for node');
    if(nodeObject.hasOwnProperty('meshObject')){
      contextObject.configureProgramForMesh(nodeObject.meshObject);
    }
    if(nodeObject.hasOwnProperty('childrenObjects')){
      for (var childIndex = 0;childIndex < nodeObject.childrenObjects.length;childIndex ++){
        contextObject.configureProgramForNode(nodeObject.childrenObjects[childIndex]);
      }
    }
  }

  contextObject.prepareForRender = function(sceneObject,callback){
    console.log("preparing for rend",sceneObject);
    if(sceneObject.hasOwnProperty('skybox')){
      //contextObject.configureProgramForSkybox(sceneObject.skybox);
      //console.log('configuring for skyBox');
    }
    for(var nodeIndex = 0; nodeIndex < sceneObject.nodeObject.length; nodeIndex ++){
      contextObject.configureProgramForNode(sceneObject.nodeObject[nodeIndex]);
    }
    contextObject.clearColor(0,0,0,1);
    console.log("color should be cleared to black");
    contextObject.clear(contextObject.COLOR_BUFFER_BIT);
    contextObject.clear(contextObject.DEPTH_BUFFER_BIT);
    contextObject.enable(contextObject.DEPTH_TEST);
    callback();
  }
}
