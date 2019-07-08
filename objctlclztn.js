
var makeAccessorLocal = function(accessorObject, gltfObject){
  accessorObject.bufferViewObject = gltfObject.bufferViews[accessorObject.bufferView];
}

var makePrimitiveLocal = function(primitiveObject,gltfObject){
  primitiveObject.indicesAccessor = gltfObject.accessors[primitiveObject.indices];
  const propertyNameList = Object.keys(primitiveObject.attributes);
  console.log(propertyNameList);
  primitiveObject.attributes.attributeAccessors = [];
  for (var attributeIndex = 0; attributeIndex < propertyNameList.length;attributeIndex ++){
    console.log("key: ",propertyNameList[attributeIndex],"\nvalue: ",gltfObject.accessors[primitiveObject.attributes[propertyNameList[attributeIndex]]]);
    primitiveObject.attributes.attributeAccessors[propertyNameList[attributeIndex]] = gltfObject.accessors[primitiveObject.attributes[propertyNameList[attributeIndex]]];
  }
  primitiveObject.materialsAccessor = gltfObject.accessors[primitiveObject.materials];
  console.log("attributes Localization-----------------------------\n",primitiveObject.attributes.attributeAccessors);
}
var makeMeshLocal = function(meshObject,gltfObject){
  for (var primitiveIndex = 0;primitiveIndex < meshObject.primitives.length;primitiveIndex++){
    makePrimitiveLocal(meshObject.primitives[primitiveIndex],gltfObject);
  }
}

var makeNodeLocal = function(nodeObject,gltfObject){
  if (nodeObject.hasOwnProperty('children')){
    nodeObject.childrenObjects = [];
    for(var childrenIndex = 0;childenIndex<nodeObject.children.length;childrenIndex++){
      childrenObjects.push(gltfObject.nodes[nodeObject.children[childrenIndex]]);
    }
  }
}

function makeSceneLocal(sceneObject,gltfObject){
  sceneObject.nodeObject = [];
  for (var nodeIndex = 0; nodeIndex < sceneObject.nodes.length;nodeIndex++){
    sceneObject.nodeObject.push(gltfObject.nodes[sceneObject.nodes[nodeIndex]]);
  }
}

var makeObjectLocal = function(gltfObject){
  for (var sceneIndex = 0;sceneIndex < gltfObject.scenes.length;sceneIndex++){
    makeSceneLocal(gltfObject.scenes[sceneIndex],gltfObject);
  }
  for (var nodeIndex = 0;nodeIndex < gltfObject.nodes.length;nodeIndex++){
    makeNodeLocal(gltfObject.nodes[nodeIndex],gltfObject);
  }
  for (var meshIndex = 0;meshIndex < gltfObject.meshes.length;meshIndex++){
    console.log(gltfObject.meshes[meshIndex].primitives);
    makeMeshLocal(gltfObject.meshes[meshIndex],gltfObject);
  }
  for (var accessorIndex = 0;accessorIndex < gltfObject.accessors.length;accessorIndex++){
    makeAccessorLocal(gltfObject.accessors[accessorIndex],gltfObject);
  }
}
