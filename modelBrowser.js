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
    console.log("here comes the compile status");
    console.log(contextObject.getShaderInfoLog(vertexShader));
    contextObject.compileShader(fragmentShader);
    const program = contextObject.createProgram();
    contextObject.attachShader(program,vertexShader);
    contextObject.attachShader(program,fragmentShader);
    contextObject.linkProgram(program);
    console.log("Linked Program:");
    console.log(program);
    console.log("-----------------------Arrtibutes in order---------------------\n");
    var attribCount = contextObject.getProgramParameter(program,contextObject.ACTIVE_ATTRIBUTES);
    for(var attribIndex = 0; attribIndex < attribCount; attribIndex ++){
      console.log("#",attribIndex," name:",contextObject.getActiveAttrib(program,attribIndex).name);
    }
    console.log("-----------------------/attributes in order--------------------\n");
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


        console.log('buffering ARRAY_BUFFER:');
        console.log('from ');
        console.log(sceneObject.bufferViews[bufferViewIndex].byteOffset);
        console.log('to');
        console.log(sceneObject.bufferViews[bufferViewIndex].byteOffset+sceneObject.bufferViews[bufferViewIndex].byteLength);


        contextObject.bindBuffer(contextObject.ARRAY_BUFFER,sceneObject.bufferViews[bufferViewIndex].renderBuffer);
        contextObject.bufferData(contextObject.ARRAY_BUFFER,sceneObject.buffers[sceneObject.bufferViews[bufferViewIndex].buffer].data.slice(sceneObject.bufferViews[bufferViewIndex].byteOffset,sceneObject.bufferViews[bufferViewIndex].byteOffset+sceneObject.bufferViews[bufferViewIndex].byteLength),contextObject.STATIC_DRAW);
        break;
        case 34963:  //ELEMENT_ARRAY_BUFFER


        console.log('buffering ELEMENT_ARRAY_BUFFER:');
        console.log('from ');
        console.log(sceneObject.bufferViews[bufferViewIndex].byteOffset);
        console.log('to');
        console.log(sceneObject.bufferViews[bufferViewIndex].byteOffset+sceneObject.bufferViews[bufferViewIndex].byteLength);


        contextObject.bindBuffer(contextObject.ELEMENT_ARRAY_BUFFER,sceneObject.bufferViews[bufferViewIndex].renderBuffer);
        contextObject.bufferData(contextObject.ELEMENT_ARRAY_BUFFER,sceneObject.buffers[sceneObject.bufferViews[bufferViewIndex].buffer].data.slice(sceneObject.bufferViews[bufferViewIndex].byteOffset,sceneObject.bufferViews[bufferViewIndex].byteOffset+sceneObject.bufferViews[bufferViewIndex].byteLength),contextObject.STATIC_DRAW);
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

  contextObject.configureProgramForPrimitive = function(primitiveObject,renderProgram){
    var attributeCount = contextObject.getProgramParameter(renderProgram,contextObject.ACTIVE_ATTRIBUTES);
    for (var attributeIndex = 0;attributeIndex < attributeCount; attributeIndex ++){
      const attributeKey = contextObject.getActiveAttrib(renderProgram,attributeIndex).name;
      const attributeLocation = contextObject.getAttribLocation(renderProgram,attributeKey);
      console.log("current attributeAccessors: ",primitiveObject.attributes.attributeAccessors);
      console.log('getting attributes Location:',attributeKey,primitiveObject.attributes.attributeAccessors[attributeKey]);
      contextObject.bindBuffer(contextObject.ARRAY_BUFFER,primitiveObject.attributes.attributeAccessors[attributeKey].bufferViewObject.renderBuffer);
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
      contextObject.enableVertexAttribArray(attributeLocation);
    }
  }

  contextObject.loadScene = function(uri,callback){
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
              console.log("-----------------------------------------image onload",this.index,"/",jsonObject.images.length);
              jsonObject.images[this.index].loaded = true;
              for(var textureIndex = 0; textureIndex < jsonObject.textures.length; textureIndex ++){
                if(jsonObject.textures[textureIndex].source == this.index){
                  jsonObject.textures[textureIndex].textureObject = contextObject.createTexture();
                  contextObject.activeTexture(contextObject.TEXTURE0 + this.index);
                  contextObject.bindTexture(contextObject.TEXTURE_2D,jsonObject.textures[textureIndex].textureObject);
                  contextObject.texParameteri(contextObject.TEXTURE_2D, contextObject.TEXTURE_WRAP_S, contextObject.CLAMP_TO_EDGE);
                  contextObject.texParameteri(contextObject.TEXTURE_2D, contextObject.TEXTURE_WRAP_T, contextObject.CLAMP_TO_EDGE);
                  contextObject.texParameteri(contextObject.TEXTURE_2D, contextObject.TEXTURE_MIN_FILTER, contextObject.NEAREST);
                  contextObject.texParameteri(contextObject.TEXTURE_2D, contextObject.TEXTURE_MAG_FILTER, contextObject.NEAREST);
                  contextObject.texImage2D(contextObject.TEXTURE_2D, 0, contextObject.RGBA, contextObject.RGBA, contextObject.UNSIGNED_BYTE, jsonObject.images[this.index].imageObject);
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

  contextObject.renderPrimitive = function(primitiveObject,primitiveMatrix){
    var usingProgram = null;
    if(primitiveObject.material.hasOwnProperty('program')){
      if(contextObject.getParameter(contextObject.CURRENT_PROGRAM) != primitiveObject.material.program){
        contextObject.useProgram(primitiveObject.material.program);
        usingProgram = primitiveObject.material.program;
      }
    }else{
      if(contextObject.getParameter(contextObject.CURRENT_PROGRAM) != contextObject.defaultProgram && contextObject.defaultProgram != null){
        contextObject.useProgram(contextObject.defaultProgram);
        usingProgram = contextObject.defaultProgram;
      }
    }
    /*if(contextObject.getParameter(contextObject.ELEMENT_ARRAY_BUFFER_BINDING) != primitiveObject.indicesAccessor.bufferViewObject.renderBuffer){
      contextObject.bindBuffer(contextObject.ELEMENT_ARRAY_BUFFER,primitiveObject.indicesAccessor.bufferViewObject.renderBuffer);
      console.log('ARRAY_BUFFER should be bound');
    }
    if(contextObject.getParameter(contextObject.ARRAY_BUFFER_BINDING) != primitiveObject.attributes.attributeAccessors['POSITION'].bufferViewObject.renderBuffer){
      contextObject.bindBuffer(contextObject.ARRAY_BUFFER,primitiveObject.attributes.attributeAccessors['POSITION'].bufferViewObject.renderBuffer);
      console.log('ARRAY_BUFFER should be bound');
    }*/

    var matrixLocation = contextObject.getUniformLocation(contextObject.defaultProgram,'matrix');
    contextObject.uniformMatrix4fv(matrixLocation,contextObject.FALSE,primitiveMatrix);
    contextObject.clearColor(0,0,0,1.0);
    contextObject.clear(contextObject.COLOR_BUFFER_BIT);
    contextObject.drawElements(contextObject.TRIANGLES,primitiveObject.indicesAccessor.count,contextObject.UNSIGNED_SHORT,primitiveObject.indicesAccessor.byteOffset);

  }

  contextObject.renderMesh = function(meshObject){
    for (var primitiveIndex = 0;primitiveIndex < meshObject.primitives.length;primitiveIndex++){
      contextObject.renderPrimitive(meshObject.primitives[primitiveIndex]);
    }
  }

  contextObject.renderNode = function(nodeObject){
    if(nodeObject.hasOwnProperty('meshObject')){
      contextObject.renderMesh(nodeObject.meshObject);
    }
  }

  contextObject.renderScene = function(sceneObject){
    for (var nodeIndex = 0;nodeIndex < sceneObject.nodeObject.length;nodeIndex++){
      renderNode(sceneObject.nodeObject[nodeIndex]);
      if(sceneObject.nodeObject[nodeIndex].hasOwnProperty('childrenObjects')){
        for(var childenIndex = 0;childenIndex < sceneObject.nodeObject[nodeIndex].childrenObjects.length;childenIndex++){
          renderNode(sceneObject.nodeObject[nodeIndex].childrenObjects[childenIndex]);
        }
      }
    }
  }
}
