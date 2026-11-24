import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RULES,journeyDay,validAward,stageFor} from '../lib/scoring.mjs';
test('daily maximum is six, hundred day maximum is six hundred',()=>{assert.equal(Object.values(RULES).reduce((a,b)=>a+b),6);assert.equal(Object.values(RULES).reduce((a,b)=>a+b)*100,600)});
test('journey includes days one and hundred only',()=>{assert.equal(journeyDay('2026-11-22','2026-11-22'),1);assert.equal(validAward('2026-11-22','2027-03-01','zoom'),true);assert.equal(validAward('2026-11-22','2027-03-02','zoom'),false);assert.equal(validAward('2026-11-22','2026-11-21','zoom'),false);assert.equal(validAward('2026-11-22','2026-11-22','invented'),false)});
test('tree and completion thresholds preserve exact boundaries',()=>{assert.equal(stageFor(4),-1);assert.equal(stageFor(5),0);assert.equal(stageFor(479),6);assert.equal(stageFor(480),7);assert.equal(stageFor(600),7)});
