//-----------------------------------------------------------view control handle-----------------------------------------------------------------------------------
  cursor.pressed = function(position,key){
    cursor.keyDown = key;
    console.log("cursor presseddd",key);
    console.log("position is ", position);
    vec3.copy(ghostCamera.position,mainCamera.position);
    vec3.copy(ghostCamera.direction,mainCamera.direction);
    vec3.copy(ghostCamera.upward,mainCamera.upward);
    vec3.copy(ghostCamera.horizontalAxis,mainCamera.horizontalAxis);
    vec2.copy(cursor.keyDownCoord,position);
  }
  cursor.released = function(){
    cursor.keyDown = -1;
    cursor.keyDownCoord = [0,0];
  }
  cursor.moved = function(position){
    var drag = [position[0]-cursor.keyDownCoord[0],position[1]-cursor.keyDownCoord[1]];
    switch(cursor.keyDown){
      case 0:  {
        console.log("should start dragging!!!!!!!!!!!!!");
        var origin = vec3.create();
        var originVector = vec3.create();
        vec3.scale(originVector,ghostCamera.direction,mainCamera.length);
        vec3.add(origin,ghostCamera.position,originVector);
        vec3.rotate(mainCamera.direction,ghostCamera.direction,[0,1,0],-drag[0]/100);
        vec3.rotate(mainCamera.horizontalAxis,ghostCamera.horizontalAxis,[0,1,0],-drag[0]/100);
        vec3.rotate(mainCamera.upward,ghostCamera.upward,[0,1,0],-drag[0]/100);
        vec3.rotate(mainCamera.direction,mainCamera.direction,mainCamera.horizontalAxis,-drag[1]/100);
        vec3.rotate(mainCamera.upward,mainCamera.upward,mainCamera.horizontalAxis,-drag[1]/100);
        vec3.scale(originVector,mainCamera.direction,mainCamera.length);
        vec3.sub(mainCamera.position,origin,originVector);
        break;
      }
      case 1: {
        var h = vec3.create();
        var v = vec3.create();
        var shift = vec3.create();
        vec3.scale(h,ghostCamera.horizontalAxis,-drag[0]/100);
        vec3.scale(v,ghostCamera.upward,drag[1]/100);
        vec3.add(shift,h,v);
        vec3.add(mainCamera.position,ghostCamera.position,shift);
        break;
      }
      default :

    }
  }
  cursor.rolled = function(dist){
    var v = vec3.create();
    vec3.scale(v,mainCamera.direction,dist/50.0);
    mainCamera.move(v);
    console.log('scrolleddd:::',dist);
  }
//----------------------------------------------------------------------\viee control handle--------------------------------------------
