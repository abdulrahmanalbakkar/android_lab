// node tools/peek.js <trackId> <lessonId>: prints every learner-visible part of a lesson as plain text.
const fs=require('fs'),site=require('path').join(__dirname,'..');let found;
global.Lab=new Proxy({addTrack:t=>found=t},{get:(o,k)=>k in o?o[k]:()=>{}});
const [tid,lid]=process.argv.slice(2);
const strip=s=>String(s==null?'':s).replace(/<\/?(code|b|em|i)>/g,'`').replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
for(const f of fs.readdirSync(site+'/tracks')){found=null;try{require(site+'/tracks/'+f)}catch(e){continue};if(!found||found.id!==tid)continue;
 const l=found.lessons.find(x=>x.id===lid);if(!l){console.log('no lesson');process.exit(1)}
 const P=(k,v)=>v&&console.log(`\n## ${k}\n${v}`);
 P('TITLE',l.title+' — '+l.tagline);P('BODY',strip(l.body));
 // capture the demo by calling visual with a fake Lab.ui
 const cap=[];const fake=new Proxy({},{get:(o,k)=>(el,opts)=>cap.push([k,opts])});
 const realUi=global.Lab.ui;try{global.Lab=Object.assign(new Proxy({},{get:(o,k)=>k==='ui'?fake:(k==='h'?()=>({append(){},classList:{add(){}}}):()=>{})}));l.visual({append(){},classList:{add(){}},replaceChildren(){}})}catch(e){cap.push(['(custom demo)',null])}
 for(const [k,o] of cap){ if(!o){console.log('\n## DEMO: custom interactive demo');continue}
  console.log(`\n## DEMO (${k})`); if(o.code)console.log(o.code);
  if(o.predict)console.log(`PREDICT: ${strip(o.predict.q)}\n  options: ${o.predict.options.map(strip).join(' | ')}\n  answer: ${strip(o.predict.options[o.predict.a])} — ${strip(o.predict.why)}`);
  (o.frames||[]).forEach((f,i)=>console.log(`  frame ${i+1}: ${f.line?'line '+f.line+' ':''}${f.vars?'vars '+JSON.stringify(f.vars)+' ':''}${f.out!=null?'out '+JSON.stringify(f.out)+' ':''}${f.cmd?'cmd '+f.cmd+' ':''}${f.steps?'steps '+f.steps.join('/')+' ':''}${f.say?'— '+strip(f.say):''}`));
 }
 if(l.predict)P('PREDICT',`${strip(l.predict.q)}\n options: ${l.predict.options.map(strip).join(' | ')}\n answer: ${strip(l.predict.options[l.predict.a])} — ${strip(l.predict.why)}`);
 P('CODE',l.code);P('RUN IT (play)',l.play);P('REMEMBER',l.remember);
 (l.mistakes||[]).forEach(m=>P('MISTAKE: '+m.title,`before:\n${m.bad}\nafter:\n${m.good}\nwhy: ${strip(m.why)}`));
 (l.deeper||[]).forEach(d=>P('GO DEEPER: '+d.title,strip(d.body)+(d.code?'\n'+d.code:'')));
 P('TERMS',(l.terms||[]).map(t=>`${t.term}: ${strip(t.def)}`).join('\n'));
 (l.challenges||[]).forEach(c=>P('CHALLENGE ('+c.type+')',`${strip(c.prompt)}\n${c.code}${c.type==='bug'?`\nbug line index ${c.bug}, fix: ${c.fix}`:''}\nwhy: ${strip(c.why)}`));
 l.quiz.forEach((q,i)=>P('QUIZ '+(i+1),`${strip(q.q)}\n options: ${q.options.map(strip).join(' | ')}\n answer: ${strip(q.options[q.a])} — ${strip(q.why)}`));
}
