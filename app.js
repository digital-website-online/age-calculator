(()=>{'use strict';
/* ========== HELPERS ========== */
const $=(s,r=document)=>r.querySelector(s);
const h=(t,a={},...k)=>{const e=document.createElement(t);
 for(const[n,v]of Object.entries(a||{})){if(v==null||v===false)continue;
  if(n==='class')e.className=v;else if(n.startsWith('on'))e.addEventListener(n.slice(2),v);else e.setAttribute(n,v)}
 k.flat(9).forEach(c=>{if(c!=null&&c!==false)e.append(c)});return e};
const sh=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
const rnd=n=>Math.floor(Math.random()*n);
const BASE=location.href.split('#')[0];
const live=m=>{const l=$('#live');l.textContent='';setTimeout(()=>l.textContent=m,30)};
/* localStorage is untrusted: every read is validated */
const S={get(k,d){try{const v=JSON.parse(localStorage.getItem('sf_'+k));return v==null?d:v}catch{return d}},
 set(k,v){try{localStorage.setItem('sf_'+k,JSON.stringify(v))}catch{}}};
const recent=()=>{const r=S.get('recent',[]);return Array.isArray(r)?r.filter(x=>C.some(c=>c.id===x)).slice(0,8):[]};
const bests=()=>{const b=S.get('best',{});return b&&typeof b==='object'&&!Array.isArray(b)?b:{}};
const bestOf=id=>{const v=bests()[id];return Number.isInteger(v)&&v>=0?v:null};

/* ========== DATA ========== */
const CATS={brain:['🧠','Brain Challenges','Number patterns, riddles and logic puzzles that reward careful thinking.'],
visual:['👀','Visual Puzzles','Find the one emoji that is different. Bigger grids make it harder.'],
trivia:['🌍','Trivia','Short general-knowledge rounds on space, science, food and places.'],
memory:['🔁','Memory Games','Watch a sequence, then repeat it. It gets one step longer each round.'],
personality:['✨','Personality-Style Tests','Light, just-for-fun quizzes. They are entertainment, not psychology.']};
const C=[];
const quiz=(id,cat,title,diff,desc,items,time)=>C.push({id,slug:id,cat,title,diff,desc,type:'quiz',items,time});
const odd=(id,title,diff,desc,size,items)=>C.push({id,slug:id,cat:'visual',title,diff,desc,type:'odd',size,items});
const mem=(id,title,diff,desc,start,sym)=>C.push({id,slug:id,cat:'memory',title,diff,desc,type:'mem',start,sym});
const pers=(id,title,desc,items,res)=>C.push({id,slug:id,cat:'personality',title,diff:'Easy',desc,type:'pers',items,res});

quiz('number-patterns','brain','Number Patterns','Easy','Spot the rule behind each number sequence.',[
['2, 4, 8, 16, … what comes next?',['24','30','32','36'],2,'Each number doubles, so 16 × 2 = 32.'],
['1, 1, 2, 3, 5, … what comes next?',['7','8','9','10'],1,'Each number is the sum of the previous two: 3 + 5 = 8.'],
['3, 6, 9, 12, … what comes next?',['14','15','16','18'],1,'It counts up in threes.'],
['1, 4, 9, 16, … what comes next?',['20','24','25','36'],2,'These are square numbers: 5 × 5 = 25.']]);
quiz('quick-riddles','brain','Quick Riddles','Medium','Four classic-style riddles. Read the wording closely.',[
['What has keys but cannot open a lock?',['A piano','A map','A clock','A door'],0,'A piano has keys you press to play notes.'],
['The more of me you take, the more you leave behind. What am I?',['Time','Footsteps','Money','Air'],1,'Every step you take leaves another footstep behind.'],
['What gets wetter the more it dries?',['A sponge','A towel','A cloud','A river'],1,'A towel absorbs water as it dries you.'],
['What can you catch but not throw?',['A ball','A cold','A frisbee','A boomerang'],1,'You can catch a cold, but you cannot throw one.']]);
quiz('mental-math-sprint','brain','Mental Math Sprint','Medium','Six quick sums against a 60-second clock.',[
['7 × 8 = ?',['54','56','58','64'],1,'7 × 8 = 56.'],
['81 ÷ 9 = ?',['8','9','7','11'],1,'9 × 9 = 81.'],
['What is 25% of 200?',['25','40','50','75'],2,'A quarter of 200 is 50.'],
['100 − 37 = ?',['63','67','73','53'],0,'100 − 37 = 63.'],
['15 × 4 = ?',['45','60','65','75'],1,'10 × 4 = 40, plus 5 × 4 = 20, gives 60.'],
['9 + 8 × 2 = ?',['34','25','26','18'],1,'Multiply first: 8 × 2 = 16, then 9 + 16 = 25.']],60);
quiz('logic-lite','brain','Logic Lite','Hard','Four puzzles where the obvious answer is often wrong.',[
['All bloops are razzies, and all razzies are lazzies. Are all bloops lazzies?',['Yes','No','Only some','Cannot tell'],0,'If every bloop is a razzie and every razzie is a lazzie, every bloop is a lazzie.'],
['A bat and a ball cost $1.10 together. The bat costs $1.00 more than the ball. How much is the ball?',['10 cents','5 cents','15 cents','1 cent'],1,'Ball 5¢ + bat $1.05 = $1.10.'],
['You overtake the runner in 2nd place. What place are you in now?',['1st','2nd','3rd','Last'],1,'You take 2nd place; the leader is still ahead of you.'],
['How many months have at least 28 days?',['1','2','11','12'],3,'Every month has at least 28 days.']]);
quiz('word-twists','brain','Word Twists','Easy','Anagrams, odd words out and spelling.',[
['Which word is an anagram of EARTH?',['HEART','THREE','TEACH','REACH'],0,'HEART uses exactly the same letters as EARTH.'],
['Which word does not belong: apple, banana, carrot, mango?',['Apple','Banana','Carrot','Mango'],2,'A carrot is a vegetable; the others are fruits.'],
['What is the opposite of "ancient"?',['Old','Modern','Rusty','Fragile'],1,'Modern means belonging to the present.'],
['Which spelling is correct?',['Necesary','Neccessary','Necessary','Necessery'],2,'Necessary has one c and two s.']]);

odd('odd-fruit','Fruit Basket','Easy','Find the odd fruit in a 3 × 3 grid.',3,[['🍓','🍒'],['🍋','🍌'],['🍇','🫐'],['🍊','🍑']]);
odd('animal-spotter','Animal Spotter','Medium','Look-alike animals hide in a 4 × 4 grid.',4,[['🐢','🐊'],['🦊','🐺'],['🐧','🐦'],['🐙','🦑']]);
odd('tiny-difference','Tiny Difference','Hard','Five rounds on a 5 × 5 grid with very similar symbols.',5,[['🔵','🟣'],['🟥','🟧'],['🕐','🕑'],['🌑','🌚'],['🟢','🟩']]);
odd('odd-emoji','Odd Emoji','Easy','Warm up with four quick rounds of odd-one-out.',3,[['🐶','🐱'],['⭐','🌙'],['🚗','🚲'],['🌞','🌧️']]);

quiz('space-basics','trivia','Space Basics','Easy','Four questions about our solar system.',[
['Which planet is closest to the Sun?',['Venus','Mercury','Mars','Earth'],1,'Mercury orbits closest to the Sun.'],
['Which is the largest planet in our solar system?',['Saturn','Neptune','Jupiter','Earth'],2,'Jupiter is the largest planet by far.'],
['Which planet is nicknamed the Red Planet?',['Mars','Venus','Mercury','Jupiter'],0,'Iron oxide dust gives Mars its red colour.'],
['How many natural moons does Earth have?',['0','1','2','4'],1,'Earth has one natural moon.']]);
quiz('guess-the-country','trivia','Guess the Country','Medium','Three clues each. Name the country.',[
['Clues: pyramids, the Nile, Cairo.',['Egypt','Sudan','Jordan','Morocco'],0,'Cairo, the Nile and the Giza pyramids all point to Egypt.'],
['Clues: kangaroos, the Outback, Sydney Opera House.',['New Zealand','South Africa','Australia','Fiji'],2,'All three are famous parts of Australia.'],
['Clues: fjords, northern lights, Oslo.',['Norway','Finland','Denmark','Sweden'],0,'Oslo is the capital of Norway.'],
['Clues: samba, Amazon rainforest, Rio de Janeiro.',['Argentina','Peru','Brazil','Colombia'],2,'Rio and samba are iconic in Brazil.']]);
quiz('science-snap','trivia','Science Snap','Medium','Quick facts from chemistry and biology.',[
['What is the chemical formula for water?',['CO2','H2O','O2','NaCl'],1,'Two hydrogen atoms bond with one oxygen atom.'],
['Which gas do plants absorb for photosynthesis?',['Oxygen','Nitrogen','Carbon dioxide','Helium'],2,'Plants take in carbon dioxide and release oxygen.'],
['What is the hardest natural substance?',['Diamond','Gold','Quartz','Iron'],0,'Diamond is the hardest natural material.'],
['How many bones does an adult human typically have?',['106','206','306','412'],1,'Adults typically have 206 bones.']]);
quiz('food-facts','trivia','Food Facts','Easy','Where your favourite foods come from.',[
['Which country is the birthplace of pizza?',['France','Greece','Italy','Spain'],2,'Modern pizza comes from Naples, Italy.'],
['What is guacamole mainly made from?',['Avocado','Peas','Spinach','Cucumber'],0,'Guacamole is mashed avocado.'],
['Tofu is made from which plant?',['Rice','Soybeans','Wheat','Corn'],1,'Tofu is pressed curd made from soy milk.'],
['Which spice from crocus flowers is among the costliest by weight?',['Paprika','Cumin','Saffron','Turmeric'],2,'Saffron threads are hand-picked from crocus flowers.']]);
quiz('world-landmarks','trivia','World Landmarks','Hard','Match famous landmarks to where they are.',[
['Machu Picchu is in which country?',['Mexico','Peru','Chile','Bolivia'],1,'It sits high in the Andes of Peru.'],
['The Taj Mahal is in which city?',['Delhi','Jaipur','Agra','Mumbai'],2,'It stands in Agra, India.'],
['The Colosseum is in which city?',['Athens','Rome','Naples','Istanbul'],1,'The Colosseum is in the centre of Rome.'],
['Which city is home to the Sagrada Família?',['Madrid','Lisbon','Barcelona','Valencia'],2,'Gaudí’s basilica is in Barcelona.']]);

mem('emoji-memory','Emoji Memory','Easy','Repeat the emoji sequence. It starts at 3 steps.',3,['🍎','🐸','⭐','🚀']);
mem('color-memory','Color Memory','Medium','Four colours, starting at 4 steps.',4,['🟥','🟩','🟦','🟨']);
mem('symbol-memory','Symbol Memory','Hard','Six symbols, starting at 5 steps.',5,['🔺','⬛','⚪','💠','🔶','❤️']);

pers('weekend-vibe','What Is Your Weekend Vibe?','Three questions, one fun label for your ideal weekend.',[
['Saturday morning, you…',[['Try a new trail or café',0],['Enjoy a slow breakfast at home',1],['Text the group chat for plans',2]]],
['Your ideal evening is…',[['A night market or road trip',0],['A film and a blanket',1],['A party or game night',2]]],
['Pick a travel style.',[['Backpack, no fixed plan',0],['One favourite place, again',1],['A group trip with friends',2]]]],
[['The Explorer','You chase new places and plans. A boring weekend is not on your list.'],['The Cozy Builder','You recharge with comfort, projects and good food.'],['The Social Spark','You are happiest when friends are around.']]);
pers('study-style','What Is Your Study Style?','A light quiz about how you tackle a big task.',[
['A big deadline is coming. You…',[['Make a day-by-day plan',0],['Wait for a burst of focus',1],['Ask a friend to work together',2]]],
['Your desk looks like…',[['Neat and labelled',0],['Chaos with a system',1],['Shared with someone',2]]],
['You learn best by…',[['Checklists and notes',0],['Short intense sessions',1],['Explaining it to others',2]]]],
[['The Planner','You like structure. Steady steps carry you to the finish.'],['The Sprinter','You thrive on energy and focus in bursts.'],['The Collaborator','You learn by talking things through with others.']]);
pers('snack-persona','Which Snack Are You?','Pick your answers and meet your snack twin.',[
['A free afternoon. You…',[['Bake something',0],['Binge a series',1],['Go for a walk',2]]],
['Your favourite season is…',[['Winter',0],['Summer',1],['Spring',2]]],
['Your phone wallpaper is…',[['Cosy photo',0],['Bold artwork',1],['Nature',2]]]],
[['Chocolate Cookie','Warm, comforting and loved by everyone.'],['Salty Chips','Bold and a little unpredictable. Always the first to go.'],['Fresh Berries','Bright, fresh and easy to like.']]);

/* ========== VALIDATION ========== */
const okStr=s=>typeof s==='string'&&s.length>0;
function valid(c){try{
 if(!c||!okStr(c.id)||!okStr(c.title)||!CATS[c.cat])return false;
 if(c.type==='mem')return Array.isArray(c.sym)&&c.sym.length>=3&&c.start>=2;
 if(!Array.isArray(c.items)||!c.items.length)return false;
 if(c.type==='odd')return c.size>=2&&c.items.every(i=>okStr(i[0])&&okStr(i[1]));
 if(c.type==='pers')return Array.isArray(c.res)&&c.items.every(i=>Array.isArray(i[1])&&i[1].every(o=>c.res[o[1]]));
 return c.items.every(i=>okStr(i[0])&&Array.isArray(i[1])&&i[1].length>=2&&Number.isInteger(i[2])&&i[2]>=0&&i[2]<i[1].length)
}catch{return false}}
const find=slug=>C.find(c=>c.slug===slug);
const dailyC=()=>{const d=new Date();return C[Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)%C.length]};

/* ========== ENGINE ========== */
let T=[],st=null;
const clear=()=>{T.forEach(t=>{clearTimeout(t);clearInterval(t)});T=[]};
function build(c){
 if(c.type==='quiz')return c.items.map(([p,o,a,w])=>{const ord=sh(o.map((_,i)=>i));return{p,opts:ord.map(i=>o[i]),ans:ord.indexOf(a),why:w}});
 if(c.type==='odd')return c.items.map(([b,o])=>{const n=c.size*c.size,a=rnd(n);
  return{p:'Tap the emoji that is different.',grid:c.size,opts:Array.from({length:n},(_,i)=>i===a?o:b),ans:a,why:`The odd one out was ${o} among the ${b}.`}});
 return c.items.map(([p,o])=>({p,opts:o.map(x=>x[0]),map:o.map(x=>x[1])}))}
function play(c){clear();
 st={c,steps:c.type==='mem'?[]:build(c),i:0,score:0,tally:(c.res||[]).map(()=>0),locked:false,done:false,start:Date.now(),warned:false};
 if(c.time){st.end=st.start+c.time*1000;T.push(setInterval(upd,250))}
 if(c.type==='mem'){st.level=c.start;st.total=6;round()}else{st.total=st.steps.length;step()}}
function upd(){if(!st||st.done||!st.end)return;
 const r=Math.max(0,Math.ceil((st.end-Date.now())/1000)),t=$('#tm');
 if(t){t.textContent=`${r}s left`;t.classList.toggle('warn',r<=10)}
 if(r<=10&&!st.warned){st.warned=true;live('10 seconds left')}
 if(r<=0)finish(true)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)upd()});
function frame(label,pct){const b=$('#play');b.replaceChildren(
 h('div',{class:'meta'},h('span',{},label),st.end?h('span',{id:'tm',class:'timer'}):null),
 h('div',{class:'prog',role:'progressbar','aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':Math.round(pct),'aria-label':'Progress'},h('i',{style:`width:${pct}%`})));
 return b}
function step(){const s=st.steps[st.i],c=st.c,b=frame(`Question ${st.i+1} of ${st.steps.length}`,st.i/st.steps.length*100);
 const o=h('div',{class:'opts'+(s.grid?' cols':''),role:'group','aria-label':'Answer options'});
 if(s.grid)o.style.setProperty('--cols',s.grid);
 s.opts.forEach((t,k)=>o.append(h('button',{type:'button','aria-label':s.grid?`Option ${k+1}: ${t}`:null,onclick:e=>pick(k,e.currentTarget)},t)));
 b.append(h('h2',{id:'q',tabindex:'-1'},s.p),o,h('div',{id:'fb'}),h('div',{id:'nx'}));upd();$('#q').focus({preventScroll:true})}
function pick(k,btn){if(!st||st.locked||st.done)return;st.locked=true;
 const s=st.steps[st.i],bs=[...btn.parentNode.children];
 if(s.map){st.tally[s.map[k]]++;return next()}
 const ok=k===s.ans;if(ok)st.score++;
 bs.forEach(x=>x.disabled=true);
 bs[s.ans].classList.add('ok');bs[s.ans].append(' ✓');
 if(!ok){btn.classList.add('no');btn.append(' ✗')}
 const msg=ok?'Correct!':'Not quite.';
 $('#fb').replaceChildren(h('div',{class:'fb '+(ok?'ok':'no'),role:'note'},h('strong',{},msg+' '),s.why));
 live(msg+' '+s.why);
 const n=h('button',{type:'button',class:'btn pri',onclick:next},st.i+1>=st.steps.length?'See result':'Next question');
 $('#nx').replaceChildren(n);n.focus()}
function next(){if(!st||st.done)return;st.i++;st.locked=false;st.i>=st.steps.length?finish():step()}
/* memory game */
function round(){const c=st.c,b=frame(`Level ${st.level-c.start+1} of ${st.total}`,(st.level-c.start)/st.total*100);
 st.seq=Array.from({length:st.level},()=>rnd(c.sym.length));st.pos=0;st.locked=true;
 const d=h('div',{class:'seq','aria-hidden':'true'},'👀'),stt=h('p',{class:'meta'},'Watch the sequence…');
 const o=h('div',{class:'opts cols',role:'group','aria-label':'Symbols'});o.style.setProperty('--cols',c.sym.length===4?4:3);
 c.sym.forEach((s,k)=>o.append(h('button',{type:'button','aria-label':`Symbol ${k+1}`,onclick:()=>tap(k)},s)));
 b.append(d,stt,o);live(`Level ${st.level-c.start+1}. Watch the sequence of ${st.level} symbols.`);
 st.seq.forEach((v,i)=>{T.push(setTimeout(()=>{d.textContent=c.sym[v]},700+i*800));T.push(setTimeout(()=>{d.textContent='·'},700+i*800+550))});
 T.push(setTimeout(()=>{d.textContent='❓';stt.textContent='Your turn: tap the sequence in order.';st.locked=false;live('Your turn')},700+st.seq.length*800))}
function tap(k){if(!st||st.locked||st.done)return;
 if(k!==st.seq[st.pos])return finish();
 st.pos++;if(st.pos<st.seq.length)return;
 st.score++;st.level++;st.locked=true;live('Correct!');
 st.score>=st.total?finish():T.push(setTimeout(round,900))}
/* results */
function finish(timeout){if(!st||st.done)return;st.done=true;clear();
 const c=st.c,sec=Math.min(Math.round((Date.now()-st.start)/1000),c.time||1e9);
 const r=recent();S.set('recent',[c.id,...r.filter(x=>x!==c.id)].slice(0,8));
 const box=$('#play');box.replaceChildren();let txt,body;
 if(c.type==='pers'){const m=Math.max(...st.tally),res=c.res[st.tally.indexOf(m)];
  txt=`I got "${res[0]}" on SnapFact's ${c.title}. What do you get?`;
  body=[h('p',{class:'meta'},'Your result'),h('div',{class:'big'},res[0]),h('p',{},res[1]),h('p',{class:'note'},'Just for fun. This is not a scientific or psychological assessment.')]}
 else{const sc=st.score,t=st.total,pct=sc/t,b=bestOf(c.id),nb=b==null||sc>b;
  if(nb)S.set('best',{...bests(),[c.id]:sc});
  const unit=c.type==='mem'?'levels':'correct';
  txt=`I scored ${sc}/${t} on SnapFact's ${c.title}. Can you beat it?`;
  body=[h('p',{class:'meta'},timeout?'Time is up!':'Challenge complete'),h('div',{class:'big'},`${sc} / ${t}`),
   h('p',{},`${sc} ${unit} · ${sec}s`+(nb?' · New personal best!':` · Personal best: ${b}`)),
   h('p',{},pct>=.9?'Brilliant. That is a top-tier run.':pct>=.6?'Nice work. A replay could get you to the top.':'Good start. Every replay makes it easier.')]}
 const rel=C.filter(x=>x.id!==c.id&&x.cat===c.cat)[0]||C.find(x=>x.id!==c.id);
 box.append(h('h2',{id:'q',tabindex:'-1'},'Your result'),...body,
  h('div',{class:'row'},h('button',{class:'btn pri',type:'button',onclick:()=>play(c)},'Play again'),
   h('button',{class:'btn lime',type:'button',onclick:()=>share(c,txt)},'Share result'),
   h('button',{class:'btn',type:'button',onclick:()=>copy(url(c))},'Copy link'),
   rel?h('a',{class:'btn',href:'#/c/'+rel.slug},'Next: '+rel.title):null),
  h('div',{id:'toast',role:'status'}));
 live('Challenge finished. '+txt);$('#q').focus({preventScroll:true})}
/* sharing */
const url=c=>BASE+'#/c/'+c.slug;
const toast=(m,node)=>{const t=$('#toast');if(t)t.replaceChildren(m,node||'')};
async function share(c,text){
 try{if(navigator.share){await navigator.share({title:'SnapFact – '+c.title,text,url:url(c)});return}}
 catch(e){if(e&&e.name==='AbortError')return}
 copy(url(c))}
async function copy(u){
 try{await navigator.clipboard.writeText(u);toast('Link copied. Paste it to a friend.')}
 catch{const i=h('input',{readonly:'',value:u,'aria-label':'Challenge link'});toast('Copy failed. Copy this link manually: ',i);i.focus();i.select()}}

/* ========== VIEWS ========== */
const meta=(t,d)=>{document.title=t;$('#desc').setAttribute('content',d)};
const card=(c,feat)=>{const b=bestOf(c.id);return h('article',{class:'card'+(feat?' feat':'')},
 h('span',{class:'tag'},CATS[c.cat][0]+' '+CATS[c.cat][1]),h('h3',{},c.title),h('p',{},c.desc),
 h('div',{class:'row'},h('span',{class:'tag'},c.diff),c.time?h('span',{class:'tag'},c.time+'s timer'):null,b!=null?h('span',{class:'tag best'},'Best '+b):null),
 h('a',{class:'btn pri',href:'#/c/'+c.slug,'aria-label':'Play '+c.title},'Play'))};
function catalog(preset){
 const f={q:'',cat:preset||'',d:'',s:'featured'},wrap=h('div'),list=h('div',{class:'grid'});
 const sel=(id,lab,opts,val,key)=>h('div',{},h('label',{for:id},lab),h('select',{id,onchange:e=>{f[key]=e.target.value;draw()}},
  opts.map(([v,t])=>h('option',{value:v,selected:v===val?'':null},t))));
 const search=h('div',{},h('label',{for:'sq'},'Search challenges'),h('input',{id:'sq',type:'search',placeholder:'Try "space" or "memory"',oninput:e=>{f.q=e.target.value.trim().toLowerCase();draw()}}));
 wrap.append(h('div',{class:'filters'},search,
  sel('fc','Category',[['','All'],...Object.entries(CATS).map(([k,v])=>[k,v[1]])],f.cat,'cat'),
  sel('fd','Difficulty',[['','Any'],['Easy','Easy'],['Medium','Medium'],['Hard','Hard']],'','d'),
  sel('fs','Sort by',[['featured','Featured'],['az','A to Z'],['recent','Recently played']],'featured','s')),
  h('p',{id:'cnt',class:'meta'}),list);
 function draw(){const r=recent();
  let a=C.filter(valid).filter(c=>(!f.cat||c.cat===f.cat)&&(!f.d||c.diff===f.d)&&(!f.q||(c.title+' '+c.desc+' '+CATS[c.cat][1]+' '+c.diff+' '+c.type).toLowerCase().includes(f.q)));
  if(f.s==='az')a.sort((x,y)=>x.title.localeCompare(y.title));
  if(f.s==='recent')a.sort((x,y)=>{const p=r.indexOf(x.id),q=r.indexOf(y.id);return(p<0?99:p)-(q<0?99:q)});
  $('#cnt',wrap).textContent=`${a.length} challenge${a.length===1?'':'s'}`;
  list.replaceChildren(...(a.length?a.map(c=>card(c)):[h('div',{class:'empty'},h('p',{},'No challenges match that search.'),h('p',{},'Try fewer words or reset the filters.'))]))}
 draw();return wrap}
function home(){meta('SnapFact – Quick Brain Challenges, Quizzes and Memory Games','Play 20 free quick challenges: brain teasers, odd-one-out puzzles, trivia, memory games and light personality quizzes. No sign-up needed.');
 const d=dailyC(),r=recent().map(find).filter(Boolean),picks=['logic-lite','guess-the-country','color-memory','weekend-vibe'].map(find);
 return[h('section',{class:'hero'},h('h1',{},'Quick challenges. Instant results.'),
  h('p',{},'Twenty short games: brain teasers, odd-one-out puzzles, trivia, memory runs and playful quizzes. Finish one in about a minute, then send it to a friend.'),
  h('div',{class:'row'},h('a',{class:'btn lime',href:'#/c/'+d.slug},"Play today's challenge"),h('a',{class:'btn',href:'#/browse'},'Browse all 20'))),
 h('section',{},h('h2',{},'Daily challenge'),h('p',{class:'meta'},'Picked by the date, so everyone gets the same one today. Local to this site, no accounts.'),h('div',{class:'grid'},card(d,true))),
 h('section',{class:'cats'},h('h2',{},'Categories'),h('div',{class:'grid'},Object.entries(CATS).map(([k,v])=>h('a',{href:'#/cat/'+k},h('div',{class:'card'},h('span',{class:'em','aria-hidden':'true'},v[0]),h('h3',{},v[1]),h('p',{},v[2])))))),
 h('section',{},h('h2',{},"Editor's picks"),h('p',{class:'meta'},'Chosen by hand. This is not a popularity ranking.'),h('div',{class:'grid'},picks.map(c=>card(c)))),
 r.length?h('section',{},h('h2',{},'Recently played'),h('p',{class:'meta'},'Saved only in this browser.'),h('div',{class:'grid'},r.slice(0,4).map(c=>card(c)))):null,
 h('section',{},h('h2',{},'How SnapFact works'),h('ol',{},h('li',{},'Pick a challenge. Each one takes about a minute.'),h('li',{},'Play and get instant feedback with a short explanation.'),h('li',{},'Share your result or copy the link and invite a friend to try it.'))),
 h('section',{},h('h2',{},'More to try'),h('div',{class:'grid'},sh(C.filter(valid)).slice(0,3).map(c=>card(c))))]}
function browse(cat){const c=CATS[cat];
 if(cat&&!c)return nf();
 meta(c?`${c[1]} – SnapFact`:'All Challenges – SnapFact',c?c[2]:'Search and filter all 20 SnapFact challenges.');
 return[crumbs(c?[['Browse','#/browse'],[c[1]]]:[['Browse']]),h('h1',{},c?c[1]:'All challenges'),c?h('p',{class:'meta'},c[2]):null,h('section',{},catalog(cat))]}
const crumbs=a=>h('nav',{class:'crumbs','aria-label':'Breadcrumb'},h('a',{href:'#/'},'Home'),a.map(([t,l])=>[' / ',l?h('a',{href:l},t):t]));
function challenge(slug){const c=find(slug);
 if(!c||!valid(c))return nf('That challenge is missing or its data is invalid.');
 meta(`${c.title} – SnapFact`,c.desc);
 const how={quiz:'Pick the best answer. You see an explanation after each one.',odd:'Tap the emoji that is different from the rest.',mem:'Watch the sequence, then tap it back in order. One mistake ends the run. This game relies on sight.',pers:'Choose the answer that feels most like you. Just for fun.'}[c.type];
 const b=bestOf(c.id);
 return[crumbs([[CATS[c.cat][1],'#/cat/'+c.cat],[c.title]]),
  h('div',{class:'play'},h('h1',{},c.title),h('p',{},c.desc),
   h('p',{class:'meta'},`${c.diff}`+(c.time?` · ${c.time}-second timer`:'')+(b!=null?` · Personal best ${b}`:'')),
   h('div',{id:'play'},h('p',{},how),h('button',{class:'btn pri',type:'button',onclick:()=>play(c)},'Start'),
    h('p',{class:'note'},'Answers live in this page’s code, so scores are for fun and cannot be treated as cheat-proof.')))]}
function about(){meta('About SnapFact','What SnapFact is and how it works.');
 return[crumbs([['About']]),h('div',{class:'play'},h('h1',{},'About SnapFact'),
  h('p',{},'SnapFact is a small collection of quick games made for fun. Everything runs in your browser as a static website, with no accounts and no server.'),
  h('h2',{},'Good to know'),h('ul',{},h('li',{},'Personality-style quizzes are entertainment. They are not clinical, scientific or IQ assessments.'),
  h('li',{},'Personal bests are stored only on your device. There is no global leaderboard.'),
  h('li',{},'Visual and memory games rely on sight. Text-based quizzes work well with screen readers.')))]}
function privacy(){meta('Privacy – SnapFact','How SnapFact uses your browser storage.');
 return[crumbs([['Privacy']]),h('div',{class:'play'},h('h1',{},'Privacy'),
  h('p',{},'SnapFact does not ask for your name, email, phone number, password or location, and it has no analytics or advertising scripts at the time of writing.'),
  h('h2',{},'What is stored on your device'),
  h('p',{},'Your browser localStorage keeps a short list of recently played challenges (sf_recent) and your best scores (sf_best). This never leaves your device. Clear it any time by deleting site data in your browser.'),
  h('h2',{},'Hosting'),h('p',{},'The site is delivered by its hosting provider (for example GitHub Pages), which may keep standard server logs such as IP addresses. If analytics or ads are added later, this page must be updated first.'))]}
function nf(m){meta('Page not found – SnapFact','This page does not exist.');
 return[h('div',{class:'empty'},h('h1',{},'Page not found'),h('p',{},m||'That page does not exist.'),h('p',{},h('a',{class:'btn pri',href:'#/'},'Go home')))]}

/* ========== ROUTER ========== */
function route(){clear();st=null;
 const p=location.hash.replace(/^#\/?/,'').split('/'),app=$('#app');let v;
 try{v=p[0]===''?home():p[0]==='browse'?browse():p[0]==='cat'?browse(p[1]):p[0]==='c'?challenge(p[1]):p[0]==='daily'?challenge(dailyC().slug):p[0]==='about'?about():p[0]==='privacy'?privacy():nf()}
 catch(e){v=nf('Something went wrong loading this page.')}
 app.replaceChildren(...[].concat(v).filter(Boolean));
 document.querySelectorAll('nav ul a').forEach(a=>a.getAttribute('href')==='#/'+(p[0]==='cat'?'browse':p[0])?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
 $('#nav-list').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');
 window.scrollTo(0,0);app.focus({preventScroll:true})}
$('#menu').addEventListener('click',()=>{const o=$('#nav-list').classList.toggle('open');$('#menu').setAttribute('aria-expanded',o)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#nav-list').classList.contains('open')){$('#nav-list').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');$('#menu').focus()}});
window.addEventListener('hashchange',route);route();
})();
