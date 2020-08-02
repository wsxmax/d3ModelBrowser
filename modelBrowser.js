class skybox {
  constructor(directory, imageForm){
    var _this = this;
    this.left = new Image();
    this.right = new Image();
    this.top = new Image();
    this.bottom = new Image();
    this.front = new Image();
    this.back = new Image();
    this.left.src = directory+'/left.'+imageForm;
    this.right.src = directory+'/right.'+imageForm;
    this.top.src = directory+'/top.'+imageForm;
    this.bottom.src = directory+'/bottom.'+imageForm;
    this.front.src = directory+'/front.'+imageForm;
    this.back.src = directory+'/back.'+imageForm;
    this.left.onload = function(){
      _this.leftLoaded();
    }
    this.right.onload = function(){
      _this.rightLoaded();
    }
    this.top.onload = function(){
      _this.topLoaded();
    }
    this.bottom.onload = function(){
      _this.bottomLoaded();
    }
    this.front.onload = function(){
      _this.frontLoaded();
    }
    this.back.onload = function(){
      _this.backLoaded();
    }
    this.leftLoaded = function(){}
    this.rightLoaded = function(){}
    this.topLoaded = function(){}
    this.bottomLoaded = function(){}
    this.frontLoaded = function(){}
    this.backLoaded = function(){}
    return this;
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
    var renderProgram = contextObject.skyboxRenderProgram;
    contextObject.skyboxTexture = contextObject.createTexture();
    var skyboxTextureSlot = contextObject.textureSlotArray.alloc();
    contextObject.skyboxTexture.slot = skyboxTextureSlot;
    contextObject.activeTexture(contextObject.TEXTURE0 + skyboxTextureSlot);
    contextObject.bindTexture(contextObject.TEXTURE_CUBE_MAP, contextObject.skyboxTexture);
    //contextObject.generateMipmap(contextObject.skyBoxTexture);
    contextObject.texParameteri(contextObject.TEXTURE_CUBE_MAP, contextObject.TEXTURE_MAG_FILTER, contextObject.NEAREST);
    contextObject.texParameteri(contextObject.TEXTURE_CUBE_MAP, contextObject.TEXTURE_MIN_FILTER, contextObject.NEAREST);
    //contextObject.texParameteri(contextObject.TEXTURE_CUBE_MAP, contextObject.TEXTURE_WRAP_R, contextObject.CLAMP_TO_EDGE);
    contextObject.texParameteri(contextObject.TEXTURE_CUBE_MAP, contextObject.TEXTURE_WRAP_S, contextObject.CLAMP_TO_EDGE);
    contextObject.texParameteri(contextObject.TEXTURE_CUBE_MAP, contextObject.TEXTURE_WRAP_T, contextObject.CLAMP_TO_EDGE);
    if(skybox.left.load){
      contextObject.texImage2D(contextObject.TEXTURE_CUBE_MAP_POSITIVE_X,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.left);
      contextObject.generateMipmap(contextObject.TEXTURE_CUBE_MAP);
    }else{
      skybox.leftLoaded = function(){
        contextObject.bindTexture(contextObject.TEXTURE_CUBE_MAP, contextObject.skyboxTexture);
        contextObject.texImage2D(contextObject.TEXTURE_CUBE_MAP_POSITIVE_X,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.left);
        console.log('I saw the Images coming and loading and rendering');
      }
    }
    if(skybox.right.load){
      contextObject.texImage2D(contextObject.TEXTURE_CUBE_MAP_NEGATIVE_X,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.right);
    }else{
      skybox.rightLoaded = function(){
        contextObject.bindTexture(contextObject.TEXTURE_CUBE_MAP, contextObject.skyboxTexture);
        contextObject.texImage2D(contextObject.TEXTURE_CUBE_MAP_NEGATIVE_X,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.right);
      }
    }
    if(skybox.top.load){
      contextObject.texImage2D(contextObject.TEXTURE_CUBE_MAP_POSITIVE_Y,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.top);
    }else{
      skybox.topLoaded = function(){
        contextObject.bindTexture(contextObject.TEXTURE_CUBE_MAP, contextObject.skyboxTexture);
        contextObject.texImage2D(contextObject.TEXTURE_CUBE_MAP_POSITIVE_Y,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.top);
      }
    }
    if(skybox.bottom.load){
      contextObject.texImage2D(contextObject.TEXTURE_CUBE_MAP_NEGATIVE_Y,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.bottom);
    }else{
      skybox.bottomLoaded = function(){
        contextObject.bindTexture(contextObject.TEXTURE_CUBE_MAP, contextObject.skyboxTexture);
        contextObject.texImage2D(contextObject.TEXTURE_CUBE_MAP_NEGATIVE_Y,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.bottom);
      }
    }
    if(skybox.front.load){
      contextObject.texImage2D(contextObject.TEXTURE_CUBE_MAP_POSITIVE_Z,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.front);
    }else{
      skybox.frontLoaded = function(){
        contextObject.bindTexture(contextObject.TEXTURE_CUBE_MAP, contextObject.skyboxTexture);
        contextObject.texImage2D(contextObject.TEXTURE_CUBE_MAP_POSITIVE_Z,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.front);
      }
    }
    if(skybox.back.load){
      contextObject.texImage2D(contextObject.TEXTURE_CUBE_MAP_NEGATIVE_Z,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.back);
    }else{
      skybox.backLoaded = function(){
        contextObject.bindTexture(contextObject.TEXTURE_CUBE_MAP, contextObject.skyboxTexture);
        contextObject.texImage2D(contextObject.TEXTURE_CUBE_MAP_NEGATIVE_Z,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,skybox.back);
      }
    }
    console.log('currentAvailableSlot is ',skyboxTextureSlot);
    contextObject.environmentTextureSlot = skyboxTextureSlot;
    contextObject.activeTexture(contextObject.TEXTURE0 + skyboxTextureSlot);
  }

  contextObject.configureProgramForPrimitive = function(primitiveObject){
    if((!primitiveObject.materialObject.hasOwnProperty('program'))||primitiveObject.materialObject.program == null){
      primitiveObject.materialObject.program = contextObject.defaultProgram;
    }
    var renderProgram = primitiveObject.materialObject.program;

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
                var textureSlot = -1;
                if(primitiveObject.materialObject.uniforms[uniformKey].hasOwnProperty('textureObject')){
                  if(primitiveObject.materialObject.uniforms[uniformKey].textureObject.hasOwnProperty('slot')){
                    textureSlot = primitiveObject.materialObject.uniforms[uniformKey].textureObject.slot;
                    console.log('having fucking slot what are you doing');
                  }else{
                    primitiveObject.materialObject.uniforms[uniformKey].textureObject = contextObject.createTexture();
                    textureSlot = contextObject.textureSlotArray.alloc();
                    primitiveObject.materialObject.uniforms[uniformKey].textureObject.slot = textureSlot;
                    contextObject.activeTexture(contextObject.TEXTURE0 + textureSlot);
                    contextObject.bindTexture(contextObject.TEXTURE_2D,primitiveObject.materialObject.uniforms[uniformKey].textureObject);
                    contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_S,contextObject.CLAMP_TO_EDGE);
                    contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_T,contextObject.CLAMP_TO_EDGE);
                    contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MAG_FILTER,contextObject.LINEAR);
                    contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MIN_FILTER,contextObject.LINEAR);
                    contextObject.texImage2D(contextObject.TEXTURE_2D,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,primitiveObject.materialObject.uniforms[uniformKey].textureImage);
                    contextObject.uniform1i(contextObject.getUniformLocation(renderProgram,uniformKey),textureSlot);
                    console.log('texture ', uniformKey,' is using slot:',textureSlot,'refreshed');
                    console.log('have textureObject but no slot fucinging??????????');
                  }
                }
                else{
                  primitiveObject.materialObject.uniforms[uniformKey].textureObject = contextObject.createTexture();
                  textureSlot = contextObject.textureSlotArray.alloc();
                  primitiveObject.materialObject.uniforms[uniformKey].textureObject.slot = textureSlot;
                  contextObject.activeTexture(contextObject.TEXTURE0 + textureSlot);
                  contextObject.bindTexture(contextObject.TEXTURE_2D,primitiveObject.materialObject.uniforms[uniformKey].textureObject);
                  contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_S,contextObject.CLAMP_TO_EDGE);
                  contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_T,contextObject.CLAMP_TO_EDGE);
                  contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MAG_FILTER,contextObject.LINEAR);
                  contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MIN_FILTER,contextObject.LINEAR);
                  contextObject.texImage2D(contextObject.TEXTURE_2D,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,primitiveObject.materialObject.uniforms[uniformKey].textureImage);
                  contextObject.uniform1i(contextObject.getUniformLocation(renderProgram,uniformKey),textureSlot);
                  console.log('texture ', uniformKey,' is using slot:',textureSlot,'refreshed');
                  console.log('having no fucking textureObject?!?!?!?!!?!?!?!?!?');
                }
              }
            }else {
              contextObject.useProgram(renderProgram);
              var textureSlot = -1;
              if(primitiveObject.materialObject.uniforms[uniformKey].hasOwnProperty('textureObject')){
                if(primitiveObject.materialObject.uniforms[uniformKey].textureObject.hasOwnProperty('slot')){
                  textureSlot = primitiveObject.materialObject.uniforms[uniformKey].textureObject.slot;
                  console.log('having fucking slot what are you doing');
                }else{
                  primitiveObject.materialObject.uniforms[uniformKey].textureObject = contextObject.createTexture();
                  textureSlot = contextObject.textureSlotArray.alloc();
                  primitiveObject.materialObject.uniforms[uniformKey].textureObject.slot = textureSlot;
                  contextObject.activeTexture(contextObject.TEXTURE0 + textureSlot);
                  contextObject.bindTexture(contextObject.TEXTURE_2D,primitiveObject.materialObject.uniforms[uniformKey].textureObject);
                  contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_S,contextObject.CLAMP_TO_EDGE);
                  contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_T,contextObject.CLAMP_TO_EDGE);
                  contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MAG_FILTER,contextObject.LINEAR);
                  contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MIN_FILTER,contextObject.LINEAR);
                  contextObject.texImage2D(contextObject.TEXTURE_2D,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,primitiveObject.materialObject.uniforms[uniformKey].textureImage);
                  contextObject.uniform1i(contextObject.getUniformLocation(renderProgram,uniformKey),textureSlot);
                  console.log('texuture ', uniformKey,' is using slot:',textureSlot);
                  console.log('having textureObject but no slot???????');
                }
              }
              else{
                primitiveObject.materialObject.uniforms[uniformKey].textureObject = contextObject.createTexture();
                textureSlot = contextObject.textureSlotArray.alloc();
                primitiveObject.materialObject.uniforms[uniformKey].textureObject.slot = textureSlot;
                contextObject.activeTexture(contextObject.TEXTURE0 + textureSlot);
                contextObject.bindTexture(contextObject.TEXTURE_2D,primitiveObject.materialObject.uniforms[uniformKey].textureObject);
                contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_S,contextObject.CLAMP_TO_EDGE);
                contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_WRAP_T,contextObject.CLAMP_TO_EDGE);
                contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MAG_FILTER,contextObject.LINEAR);
                contextObject.texParameteri(contextObject.TEXTURE_2D,contextObject.TEXTURE_MIN_FILTER,contextObject.LINEAR);
                contextObject.texImage2D(contextObject.TEXTURE_2D,0,contextObject.RGBA,contextObject.RGBA,contextObject.UNSIGNED_BYTE,primitiveObject.materialObject.uniforms[uniformKey].textureImage);
                contextObject.uniform1i(contextObject.getUniformLocation(renderProgram,uniformKey),textureSlot);
                console.log('texuture ', uniformKey,' is using slot:',textureSlot);
                console.log('have no textureObject fucinging??????????');
              }
            }
            break;
          }
        }
      }
    }
  }


  contextObject.renderPrimitive = function(primitiveObject,matrix,camera){
    contextObject.usingProgram = primitiveObject.materialObject.program;
    //if(contextObject.getParameter(contextObject.ELEMENT_ARRAY_BUFFER_BINDING)!=primitiveObject.indicesAccessor.bufferViewObject.renderBuffer){
      contextObject.bindBuffer(contextObject.ELEMENT_ARRAY_BUFFER,primitiveObject.indicesAccessor.bufferViewObject.renderBuffer);
    //}
    if(primitiveObject.materialObject.hasOwnProperty('program')){
      if(contextObject.getParameter(contextObject.CURRENT_PROGRAM) != primitiveObject.materialObject.program){
        contextObject.useProgram(primitiveObject.materialObject.program);
        contextObject.usingProgram = primitiveObject.materialObject.program;
      }else{
        contextObject.usingProgram = contextObject.getParameter(contextObject.CURRENT_PROGRAM);
      }
    }else{
      if(contextObject.getParameter(contextObject.CURRENT_PROGRAM) != contextObject.defaultProgram && contextObject.defaultProgram != null){
        contextObject.useProgram(contextObject.defaultProgram);
        contextObject.usingProgram = contextObject.defaultProgram;
      }else{
        contextObject.useProgram(contextObject.defaultProgram);
        contextObject.usingProgram = contextObject.defaultProgram;
        //????????????????????????????????????????????????????????????????????????
      }
    }
    var attributeCount = contextObject.getProgramParameter(contextObject.usingProgram,contextObject.ACTIVE_ATTRIBUTES);
    contextObject.useProgram(contextObject.usingProgram);
    for (var attributeIndex = 0;attributeIndex < attributeCount; attributeIndex ++){
      var attributeKey = contextObject.getActiveAttrib(contextObject.usingProgram,attributeIndex).name;
      var attributeLocation = contextObject.getAttribLocation(contextObject.usingProgram,attributeKey);
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

    var uniformCount = contextObject.getProgramParameter(contextObject.usingProgram,contextObject.ACTIVE_UNIFORMS);
    for (var uniformIndex = 0;uniformIndex < uniformCount;uniformIndex++){
      var uniformKey = contextObject.getActiveUniform(contextObject.usingProgram,uniformIndex).name;
      switch(contextObject.getActiveUniform(contextObject.usingProgram,uniformIndex).type){
        case contextObject.SAMPLER_2D:{
          contextObject.uniform1i(contextObject.getUniformLocation(contextObject.usingProgram,uniformKey),primitiveObject.materialObject.uniforms[uniformKey].textureObject.slot);
          break;
        }
        case contextObject.SAMPLER_CUBE:{
          if(uniformKey!='environmentTexture')
          contextObject.uniform1i(contextObject.getUniformLocation(contextObject.usingProgram,uniformKey),primitiveObject.materialObject.uniforms[uniformKey].textureObject.slot);
          break;
        }
        default: break;
      }
    }
    var matrixLocation = contextObject.getUniformLocation(contextObject.usingProgram,'matrix');
    contextObject.uniform1i(contextObject.getUniformLocation(contextObject.usingProgram,'environmentTexture'),contextObject.skyboxTexture.slot);
    contextObject.uniformMatrix4fv(matrixLocation,contextObject.FALSE,matrix);
    contextObject.uniform3fv(contextObject.getUniformLocation(contextObject.usingProgram,'cameraCoord'),camera.position);
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

  contextObject.makeProgramFromURI('/shaders/skyboxShaders/vertexShaderGLSL','/shaders/skyboxShaders/fragmentShaderGLSL',function(skyboxProgram){
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
      0,3,2,
      2,1,0
    ];
    contextObject.useProgram(contextObject.skyboxRenderProgram);
    contextObject.bindBuffer(contextObject.ARRAY_BUFFER,verticesBuffer);
    contextObject.bufferData(contextObject.ARRAY_BUFFER,new Float32Array(vertices),contextObject.STATIC_DRAW);
    contextObject.skyboxVerticesBuffer = verticesBuffer;
    contextObject.bindBuffer(contextObject.ELEMENT_ARRAY_BUFFER,verticiesIndicesBuffer);
    contextObject.bufferData(contextObject.ELEMENT_ARRAY_BUFFER,new Uint16Array(verticesIndices),contextObject.STATIC_DRAW);
    contextObject.skyboxElementArrayBuffer = verticiesIndicesBuffer;
    contextObject.bindBuffer(contextObject.ARRAY_BUFFER,null);
    contextObject.bindBuffer(contextObject.ELEMENT_ARRAY_BUFFER,null);
  });

  contextObject.renderSkybox = function(skybox,camera){
    if(contextObject.hasOwnProperty('skyboxRenderProgram')){
      contextObject.usingProgram = contextObject.skyboxRenderProgram;
      //if(contextObject.getParameter(contextObject.ELEMENT_ARRAY_BUFFER_BINDING)!=contextObject.skyboxElementArrayBuffer){
        contextObject.bindBuffer(contextObject.ELEMENT_ARRAY_BUFFER,contextObject.skyboxElementArrayBuffer);
      //}
      contextObject.useProgram(contextObject.skyboxRenderProgram);
      contextObject.bindBuffer(contextObject.ARRAY_BUFFER,contextObject.skyboxVerticesBuffer);
      contextObject.vertexAttribPointer(
        contextObject.getAttribLocation(contextObject.skyboxRenderProgram,'skyPOSITION'),
        2,
        contextObject.FLOAT,
        contextObject.FALSE,
        2*Float32Array.BYTES_PER_ELEMENT,
        0
      );
      contextObject.enableVertexAttribArray(contextObject.getAttribLocation(contextObject.skyboxRenderProgram,'skyPOSITION'));
      contextObject.uniform1i(contextObject.getUniformLocation(contextObject.skyboxRenderProgram,'skyboxTexture'),contextObject.skyboxTexture.slot);
      contextObject.uniform3fv(contextObject.getUniformLocation(contextObject.skyboxRenderProgram,'skyboxFactor'),camera.generateFactorForSkybox());
      contextObject.uniformMatrix4fv(contextObject.getUniformLocation(contextObject.skyboxRenderProgram,'cameraMatrix'),contextObject.FALSE,camera.generateSkyVectorMatrix());
      contextObject.clear(contextObject.COLOR_BUFFER_BIT);
      contextObject.clear(contextObject.DEPTH_BUFFER_BIT);
      contextObject.drawElements(contextObject.TRIANGLES,6,contextObject.UNSIGNED_SHORT,0);
      //contextObject.drawArrays(contextObject.TRIANGLES,0,6);
    }
  }

  contextObject.renderMesh = function(meshObject,matrix,camera){
    for(var primitiveIndex = 0; primitiveIndex < meshObject.primitives.length; primitiveIndex++){
      contextObject.renderPrimitive(meshObject.primitives[primitiveIndex],matrix,camera);
    }
  }

  contextObject.renderNode = function(nodeObject,matrix,camera){
    var nodeMatrix = new Float32Array(16);
    if(nodeObject.hasOwnProperty('matrix')){
      mat4.multiply(nodeMatrix,matrix,nodeObject.matrix);
    }else{
      mat4.copy(nodeMatrix,matrix);
    }
    if(nodeObject.hasOwnProperty('meshObject')){
      contextObject.renderMesh(nodeObject.meshObject,nodeMatrix,camera);
    }
    if(nodeObject.hasOwnProperty('childrenObjects')){
      for(var childIndex = 0;childIndex < childrenObjects.length;childIndex ++){
        contextObject.renderNode(childrenObjects[childIndex],nodeMatrix,camera);
      }
    }
  }

  contextObject.renderScene = function(sceneObject,matrix,camera){
    var renderMatrix = new Float32Array(16);
    var cameraMatrix = camera.generateMatrix();
    mat4.multiply(renderMatrix,cameraMatrix,sceneObject.sceneMatrix);
    if(sceneObject.hasOwnProperty('skybox')&&sceneObject.skybox!=null/*&&sceneObject.skybox.load*/){
      contextObject.renderSkybox(sceneObject.skybox,camera);
    }
    for(var nodeIndex = 0;nodeIndex < sceneObject.nodes.length;nodeIndex ++){
      contextObject.renderNode(sceneObject.nodeObject[nodeIndex],renderMatrix,camera);
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
      console.log(skybox);
      console.log(skybox.left);
      contextObject.configureProgramForSkybox(sceneObject.skybox);
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
