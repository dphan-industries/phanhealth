import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessReading, METRICS, UNITS, ENVIRONMENTS, HAZARDS} from '../lib/health.ts';
import {validateReading} from '../lib/storage.ts';
import {parseTransfer} from '../lib/transfer.ts';

test('temperature accepts one decimal and new indicators preserve units',()=>{
 assert.equal(validateReading('Body temperature','37.2',''),'');
 assert.equal(validateReading('Blood glucose','92',''),'');
 for(const value of ['','37.22','98.6','NaN','-1']) assert.ok(validateReading('Body temperature',value,''));
 assert.ok(validateReading('Unknown','50',''));
 assert.equal(UNITS['Blood glucose'],'mg/dL');assert.equal(UNITS['Body temperature'],'°C');
 assert.equal(METRICS.length,4);assert.equal(Object.keys(ENVIRONMENTS).length,6);assert.equal(HAZARDS.length,5);
});
test('BP categories apply the higher component and distinguish severe boundaries',()=>{
 const bp=v=>assessReading({kind:'Blood pressure',value:v});
 assert.equal(bp('118 / 76').level,'context');
 assert.match(bp('120 / 79').title,/Elevated/);
 assert.match(bp('118 / 80').title,/Stage 1/);
 assert.match(bp('140 / 76').title,/Stage 2/);
 assert.notEqual(bp('180 / 120').level,'urgent');
 assert.equal(bp('181 / 70').level,'urgent');assert.equal(bp('118 / 121').level,'urgent');
 assert.match(bp('181 / 121').actions.join(' '),/emergency response/);
});
test('glucose low and severe ranges and context-sensitive pulse do not declare safety',()=>{
 const g=v=>assessReading({kind:'Blood glucose',value:String(v)});
 assert.equal(g(54).level,'urgent');assert.equal(g(55).level,'review');
 assert.equal(g(69).level,'review');assert.equal(g(70).level,'context');
 assert.equal(g(249).level,'context');assert.equal(g(250).level,'review');
 assert.equal(assessReading({kind:'Heart rate',value:'110'},false).level,'context');
 assert.equal(assessReading({kind:'Heart rate',value:'110'},true).level,'review');
 assert.match(g(54).actions.join(' '),/unable to swallow/);
});
test('high and low temperature prompt attention without diagnosing disease',()=>{
 const temp=v=>assessReading({kind:'Body temperature',value:String(v)});
 assert.equal(temp(34.9).level,'urgent');assert.equal(temp(35).level,'context');
 assert.equal(temp(37.6).level,'review');assert.equal(temp(39.4).level,'urgent');
 assert.match(temp(37).why,/site|Site/);
});
test('new measurements and optional routine logs survive validated report import',()=>{
 const base={id:'t',timestamp:'2026-11-04T10:00:00Z',source:'Manual entry',note:'Fictional test'};
 const data={schema:1,readings:[{...base,kind:'Body temperature',value:'37.2',unit:'°C'},{...base,id:'g',kind:'Blood glucose',value:'90',unit:'mg/dL'}],incidents:[],wellness:[{id:'w',timestamp:base.timestamp,sleep:'8',mood:'Good',bodyArea:'No area',note:'Demo',routine:{waterMl:'1500',meals:'3',aerobicMinutes:'30',resistanceMinutes:'20',radiationUsv:'5',environmentNotes:'Dosimeter example'}}]};
 assert.equal(parseTransfer(JSON.stringify(data)).readings[0].value,'37.2');
 const bad=structuredClone(data);bad.readings[0].unit='°F';assert.throws(()=>parseTransfer(JSON.stringify(bad)),/Invalid reading/);
 const invalid=structuredClone(data);invalid.wellness[0].routine.waterMl='-1';assert.throws(()=>parseTransfer(JSON.stringify(invalid)),/Invalid routine/);
});

test('routine import rejects impossible duration totals and preserves unknown values',()=>{
 const r={waterMl:'',meals:'',aerobicMinutes:'',resistanceMinutes:'',radiationUsv:'',environmentNotes:''};
 const base={schema:1,readings:[],incidents:[],wellness:[{id:'w',timestamp:'2026-11-04T10:00:00Z',sleep:'8',mood:'Good',bodyArea:'No area',note:'',routine:r}]};
 assert.equal(parseTransfer(JSON.stringify(base)).wellness[0].routine.waterMl,'');
 const bad=structuredClone(base);bad.wellness[0].routine.aerobicMinutes='1000';bad.wellness[0].routine.resistanceMinutes='1000';assert.throws(()=>parseTransfer(JSON.stringify(bad)),/Invalid routine/);
 const meals=structuredClone(base);meals.wellness[0].routine.meals='25';assert.throws(()=>parseTransfer(JSON.stringify(meals)),/Invalid routine/);
});
