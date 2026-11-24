import {test} from 'node:test';
import assert from 'node:assert/strict';
import {roomLayout,findPath,walkable} from '../lib/room-layout.mjs';
test('every supported capacity has exactly that number of individually reachable seats',()=>{
 for(let cap=4;cap<=24;cap++){
  const {seats}=roomLayout(cap);assert.equal(seats.length,cap);
  for(const seat of seats){assert.ok(walkable(seat.x,seat.z,cap),`seat ${seat.id} cap ${cap}`);const path=findPath({x:0,z:6.8},seat,cap);assert.ok(path.length,`unreachable seat ${seat.id} cap ${cap}`);for(const p of path)assert.ok(walkable(p.x,p.z,cap));}
 }
});
test('navigation rejects tables and outside the room',()=>{assert.equal(walkable(3.5,0,8),false);assert.equal(walkable(100,0,8),false);assert.equal(walkable(NaN,0,8),false);assert.deepEqual(findPath({x:0,z:6.8},{x:3.5,z:0},8),[])});
