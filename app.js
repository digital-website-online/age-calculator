(() => {
'use strict';
const $ = id => document.getElementById(id);
const SIZE = 8;
const COLORS = [
  {name:'aqua',color:'#16bfb9',light:'#8afff1',dark:'#087e91',shadow:'#087b88',edge:'#a4fff2'},
  {name:'violet',color:'#7658f4',light:'#b4a5ff',dark:'#4332b5',shadow:'#4332b5',edge:'#c6baff'},
  {name:'pink',color:'#f05caf',light:'#ffb4df',dark:'#b72d83',shadow:'#b72d83',edge:'#ffd0eb'},
  {name:'gold',color:'#f7b83e',light:'#ffeb9b',dark:'#c87922',shadow:'#c87922',edge:'#fff0b2'},
  {name:'blue',color:'#4388f6',light:'#9bd5ff',dark:'#2250bd',shadow:'#2250bd',edge:'#b7e2ff'},
  {name:'lime',color:'#8ecf4a',light:'#d9ff9c',dark:'#4b902e',shadow:'#4b902e',edge:'#e5ffba'}
];
const SHAPES = [
 [[0,0]], [[0,0],[0,1]], [[0,0],[1,0]], [[0,0],[0,1],[0,2]], [[0,0],[1,0],[2,0]],
 [[0,0],[0,1],[0,2],[0,3]], [[0,0],[1,0],[2,0],[3,0]], [[0,0],[0,1],[1,0],[1,1]],
 [[0,0],[1,0],[2,0],[0,1]], [[0,0],[0,1],[0,2],[1,2]], [[0,0],[1,0],[2,0],[2,1]],
 [[1,0],[1,1],[0,2],[1,2]], [[0,0],[1,0],[1,1],[2,1]], [[0,0],[0,1],[1,1],[1,2]],
 [[0,0],[1,0],[2,0],[1,1]], [[1,0],[0,1],[1,1],[2,1]], [[0,0],[0,1],[0,2],[1,1]],
 [[1,0],[0,1],[1,1],[1,2]], [[0,0],[1,0],[2,0],[0,1],[1,1]], [[0,0],[1,0],[0,1],[0,2]],
 [[0,0],[1,0],[1,1],[1,2]], [[0,0],[0,1],[1,1],[2,1]], [[0,0],[1,0],[2,0],[2,1],[2,2]],
 [[0,0],[0,1],[0,2],[1,2],[2,2]], [[0,0],[1,0],[2,0],[0,1],[0,2]],
 [[0,0],[1,0],[2,0],[2,1],[1,2]], [[0,0],[1,0],[1,1],[2,1],[2,2]],
 [[0,0],[1,0],[2,0],[3,0],[4,0]], [[0,0],[0,1],[0,2],[0,3],[0,4]],
 [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]
];
const state = {
 board:Array(SIZE*SIZE).fill(null), tray:[], score:0, best:Number(localStorage.getItem('br_best')||0),
 games:Number(localStorage.getItem('br_games')||0), bestCombo:Number(localStorage.getItem('br_combo')||0),
 moves:0, combo:0, maxCombo:0, selected:-1, sound:localStorage.getItem('br_sound')!=='off',
 paused:false, busy:false, history:[], hint:null, lastClears:0
};
let audioCtx=null, toastTimer=null, pointerDrag=null;
const boardEl=$('board'), trayEl=$('tray');
function cloneBoard(b){return b.map(c=>c?{...c}:null)}
function saveStats(){localStorage.setItem('br_best',String(state.best));localStorage.setItem('br_games',String(state.games));localStorage.setItem('br_combo',String(state.bestCombo))}
function colorStyle(c){return `--color:${c.color};--light:${c.light};--dark:${c.dark};--shadow:${c.shadow};--edge:${c.edge}`}
function rand(a){return a[Math.floor(Math.random()*a.length)]}
function shapeSize(shape){return {w:Math.max(...shape.map(p=>p[1]))+1,h:Math.max(...shape.map(p=>p[0]))+1}}
function pressure(){const filled=state.board.filter(Boolean).length;return filled/(SIZE*SIZE)}
function canPlace(shape,r,c,board=state.board){
 for(const [dr,dc] of shape){const rr=r+dr,cc=c+dc;if(rr<0||cc<0||rr>=SIZE||cc>=SIZE||board[rr*SIZE+cc])return false}
 return true;
}
function legalMoves(shape,board=state.board){const out=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(canPlace(shape,r,c,board))out.push([r,c]);return out}
function shapeFitsAnywhere(shape,board=state.board){return legalMoves(shape,board).length>0}
function scorePotential(shape,r,c,board=state.board){
 const test=board.slice();shape.forEach(([dr,dc])=>test[(r+dr)*SIZE+c+dc]={color:COLORS[0]});
 let rows=0,cols=0;
 for(let rr=0;rr<SIZE;rr++)if(test.slice(rr*SIZE,rr*SIZE+SIZE).every(Boolean))rows++;
 for(let cc=0;cc<SIZE;cc++){let full=true;for(let rr=0;rr<SIZE;rr++)if(!test[rr*SIZE+cc]){full=false;break}if(full)cols++}
 return rows*1.25+cols*1.35+(rows+cols>1?1.5:0);
}
function chooseShape(){
 const p=pressure(), candidates=SHAPES.map((shape,i)=>({shape,i,size:shape.length,fit:shapeFitsAnywhere(shape)}));
 // Board-aware weighting: prefer useful pieces as space gets tight, while retaining variety.
 const weighted=candidates.map(x=>{
  let w=1;
  if(p>.58)w*=x.size<=4?2.25:.65;
  else if(p>.38)w*=x.size<=5?1.45:.9;
  if(!x.fit)w*=.08;
  if(x.size===1)w*=p>.72?2.2:.55;
  return { ...x,w };
 });
 const total=weighted.reduce((s,x)=>s+x.w,0);let pick=Math.random()*total;
 for(const x of weighted){pick-=x.w;if(pick<=0)return x.shape.map(p=>p.slice())}
 return rand(SHAPES).map(p=>p.slice());
}
function dealTray(){
 state.tray=[];
 for(let i=0;i<3;i++){
  let shape=chooseShape();
  // If there is at least one valid move, keep tray solvable. On dense boards, reroll from legal shapes.
  if(!shapeFitsAnywhere(shape)){
   const fits=SHAPES.filter(s=>shapeFitsAnywhere(s));
   if(fits.length)shape=rand(fits).map(p=>p.slice());
  }
  state.tray.push({shape,color:rand(COLORS),used:false,id:cryptoRandomId()});
 }
 state.selected=-1;state.hint=null;renderTray();updateUndoButton();
}
function cryptoRandomId(){return Math.random().toString(36).slice(2,10)}
function buildBoard(){
 boardEl.innerHTML='';
 for(let i=0;i<SIZE*SIZE;i++){const cell=document.createElement('div');cell.className='cell';cell.dataset.index=i;cell.setAttribute('role','gridcell');boardEl.appendChild(cell)}
 renderBoard();
}
function renderBoard(){
 [...boardEl.children].forEach((el,i)=>{
  el.className='cell';el.style.cssText='';
  if(state.board[i]){el.classList.add('filled');el.style.cssText=colorStyle(state.board[i])}
 });
}
function renderTray(){
 trayEl.innerHTML='';
 state.tray.forEach((piece,index)=>{
  const slot=document.createElement('button');slot.className='piece-slot'+(piece.used?' used':'')+(state.selected===index?' selected':'')+(state.hint?.slot===index?' hint-slot':'');
  slot.type='button';slot.dataset.slot=index;slot.setAttribute('aria-label',piece.used?`Piece ${index+1} used`:`Select piece ${index+1}`);
  const num=document.createElement('span');num.className='slot-number';num.textContent=`0${index+1}`;slot.appendChild(num);
  const size=shapeSize(piece.shape),grid=document.createElement('div');grid.className='piece-grid';grid.style.gridTemplateColumns=`repeat(${size.w}, var(--piece-cell, 16px))`;grid.style.gridTemplateRows=`repeat(${size.h}, var(--piece-cell, 16px))`;
  const set=new Set(piece.shape.map(([r,c])=>`${r},${c}`));
  for(let r=0;r<size.h;r++)for(let c=0;c<size.w;c++){const pc=document.createElement('span');if(set.has(`${r},${c}`)){pc.className='piece-cell';pc.style.cssText=colorStyle(piece.color)}else pc.style.cssText='width:clamp(12px,3.4vw,17px);height:clamp(12px,3.4vw,17px);opacity:0';grid.appendChild(pc)}
  slot.appendChild(grid);slot.addEventListener('click',()=>{if(state.busy||state.paused||piece.used)return;selectPiece(index)});slot.addEventListener('pointerdown',e=>startDrag(e,index));trayEl.appendChild(slot);
 });
}
function selectPiece(i){state.selected=state.selected===i?-1:i;state.hint=null;renderTray();clearPreview();if(state.selected>=0){$('statusText').textContent='Now choose a place on the board';playTone(500,.035)}else $('statusText').textContent='Choose a piece to place'}
function clearPreview(){[...boardEl.children].forEach(c=>c.classList.remove('preview','bad','will-clear','hint-cell'))}
function previewAt(r,c,idx=state.selected){
 clearPreview();if(idx<0||!state.tray[idx]||state.tray[idx].used)return false;
 const p=state.tray[idx],valid=canPlace(p.shape,r,c);
 p.shape.forEach(([dr,dc])=>{const rr=r+dr,cc=c+dc;if(rr>=0&&cc>=0&&rr<SIZE&&cc<SIZE){const cell=boardEl.children[rr*SIZE+cc];cell.classList.add('preview');if(!valid)cell.classList.add('bad')}});
 if(valid){
  const test=state.board.slice();p.shape.forEach(([dr,dc])=>test[(r+dr)*SIZE+c+dc]={color:p.color});
  const fullRows=[],fullCols=[];
  for(let rr=0;rr<SIZE;rr++)if(test.slice(rr*SIZE,rr*SIZE+SIZE).every(Boolean))fullRows.push(rr);
  for(let cc=0;cc<SIZE;cc++){let full=true;for(let rr=0;rr<SIZE;rr++)if(!test[rr*SIZE+cc]){full=false;break}if(full)fullCols.push(cc)}
  fullRows.forEach(rr=>{for(let cc=0;cc<SIZE;cc++)boardEl.children[rr*SIZE+cc].classList.add('will-clear')});
  fullCols.forEach(cc=>{for(let rr=0;rr<SIZE;rr++)boardEl.children[rr*SIZE+cc].classList.add('will-clear')});
 }
 return valid;
}
function boardCellFromPoint(x,y){
 const el=document.elementFromPoint(x,y);if(!el)return null;
 const cell=el.closest('.cell');if(!cell||!boardEl.contains(cell))return null;
 const i=Number(cell.dataset.index);return [Math.floor(i/SIZE),i%SIZE];
}
function handleBoardTap(e){
 if(state.busy||state.paused)return;
 const cell=e.target.closest('.cell');if(!cell)return;
 const i=Number(cell.dataset.index),r=Math.floor(i/SIZE),c=i%SIZE;
 if(state.selected<0){const candidates=state.tray.map((p,idx)=>({p,idx})).filter(x=>!x.p.used&&canPlace(x.p.shape,r,c));if(candidates.length){selectPiece(candidates[0].idx);previewAt(r,c,candidates[0].idx)}else toast('Choose a piece that fits here');return}
 if(!canPlace(state.tray[state.selected].shape,r,c)){previewAt(r,c);playTone(170,.07);toast('That piece does not fit there');return}
 placePiece(state.selected,r,c);
}
function startDrag(e,index){
 if(state.busy||state.paused||state.tray[index].used)return;
 pointerDrag={index,startX:e.clientX,startY:e.clientY,moved:false};
 try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}
}
document.addEventListener('pointermove',e=>{
 if(!pointerDrag)return;
 if(Math.abs(e.clientX-pointerDrag.startX)+Math.abs(e.clientY-pointerDrag.startY)>7)pointerDrag.moved=true;
 if(!pointerDrag.moved)return;
 const idx=pointerDrag.index;if(state.selected!==idx){state.selected=idx;renderTray()}
 const cell=boardCellFromPoint(e.clientX,e.clientY);
 if(cell)previewAt(cell[0],cell[1],idx);else clearPreview();
});
document.addEventListener('pointerup',e=>{
 if(!pointerDrag)return;const drag=pointerDrag;pointerDrag=null;
 if(drag.moved){const cell=boardCellFromPoint(e.clientX,e.clientY);if(cell&&canPlace(state.tray[drag.index].shape,cell[0],cell[1]))placePiece(drag.index,cell[0],cell[1]);else{clearPreview();if(cell)toast('No room for that piece');}}
});
boardEl.addEventListener('click',handleBoardTap);
boardEl.addEventListener('pointermove',e=>{if(pointerDrag?.moved){const cell=boardCellFromPoint(e.clientX,e.clientY);if(cell)previewAt(cell[0],cell[1],pointerDrag.index)}});
function saveHistory(){
 state.history.push({board:cloneBoard(state.board),tray:state.tray.map(p=>({...p,shape:p.shape.map(x=>x.slice())})),score:state.score,moves:state.moves,combo:state.combo,maxCombo:state.maxCombo});
 if(state.history.length>1)state.history.shift();
}
function placePiece(idx,r,c){
 if(state.busy||state.paused)return;
 const piece=state.tray[idx];if(!piece||piece.used||!canPlace(piece.shape,r,c))return;
 saveHistory();state.busy=true;state.hint=null;clearPreview();
 piece.shape.forEach(([dr,dc])=>{state.board[(r+dr)*SIZE+c+dc]={...piece.color}});
 piece.used=true;state.moves++;state.score+=piece.shape.length;
 const rows=[],cols=[];
 for(let rr=0;rr<SIZE;rr++)if(state.board.slice(rr*SIZE,rr*SIZE+SIZE).every(Boolean))rows.push(rr);
 for(let cc=0;cc<SIZE;cc++){let full=true;for(let rr=0;rr<SIZE;rr++)if(!state.board[rr*SIZE+cc]){full=false;break}if(full)cols.push(cc)}
 const clearSet=new Set();rows.forEach(rr=>{for(let cc=0;cc<SIZE;cc++)clearSet.add(rr*SIZE+cc)});cols.forEach(cc=>{for(let rr=0;rr<SIZE;rr++)clearSet.add(rr*SIZE+cc)});
 const lines=rows.length+cols.length;
 if(lines){
  state.combo++;state.maxCombo=Math.max(state.maxCombo,state.combo);
  const base=clearSet.size*10,bonus=lines>1?Math.round(base*(lines-1)*.65):0,comboBonus=(state.combo>1?state.combo*8:0);
  state.score+=base+bonus+comboBonus;
  state.lastClears=lines;
  $('statusText').textContent=lines>=3?'INCREDIBLE CLEAR!':lines===2?'DOUBLE CLEAR!':'LINE CLEARED!';
  $('comboPill').textContent=`COMBO ×${state.combo}`;
  animateClear(clearSet);
  if(lines>=3)toast('UNREAL! Multi-line clear +' +(base+bonus+comboBonus));else if(lines===2)toast('DOUBLE CLEAR! +' +(base+bonus+comboBonus));else toast(state.combo>1?`COMBO STREAK ×${state.combo}`:`NICE CLEAR! +${base+bonus}`);
  playTone(lines>=2?760:620,.09);if(lines>=2)setTimeout(()=>playTone(940,.08),70);
 }else{state.combo=0;$('comboPill').textContent='COMBO ×0';$('statusText').textContent=rand(['Good placement','Keep the board open','Plan your next move','Nice and steady']);playTone(360,.035)}
 renderBoard();updateScore();$('placedCount').textContent=`${state.moves} MOVES`;
 if(state.score>state.best){state.best=state.score;saveStats()}
 const remaining=state.tray.every(p=>p.used);
 setTimeout(()=>{
  if(lines){clearSet.forEach(i=>state.board[i]=null);renderBoard()}
  if(remaining)dealTray();else{state.selected=-1;renderTray()}
  state.busy=false;updateUndoButton();
  if(!hasAnyMove()){gameOver()}else if(remaining){$('statusText').textContent='Fresh pieces. Keep going.'}
 },lines?290:70);
}
function animateClear(set){
 const fx=$('boardFx');fx.innerHTML='';
 set.forEach(i=>{
  const cell=boardEl.children[i];cell.classList.add('will-clear');
  const p=document.createElement('i');p.className='particle';p.style.left=(cell.offsetLeft+cell.offsetWidth/2)+'px';p.style.top=(cell.offsetTop+cell.offsetHeight/2)+'px';p.style.setProperty('--pcolor',rand(['#ffffff','#65f3e7','#ff72c6','#ffd879']));p.style.setProperty('--dx',(Math.random()*100-50)+'px');p.style.setProperty('--dy',(Math.random()*-90-10)+'px');fx.appendChild(p);
 });
 if(set.size>=8){document.querySelector('.board-frame').animate([{transform:'translateX(0)'},{transform:'translateX(-2px)'},{transform:'translateX(2px)'},{transform:'translateX(0)'}],{duration:190})}
}
function updateScore(){
 $('score').textContent=state.score.toLocaleString();$('best').textContent=state.best.toLocaleString();$('homeBest').textContent=state.best.toLocaleString();$('homeCombo').textContent=state.bestCombo?`×${state.bestCombo}`:'—';$('homeGames').textContent=state.games.toLocaleString();
}
function hasAnyMove(){return state.tray.some(p=>!p.used&&shapeFitsAnywhere(p.shape))}
function gameOver(){
 state.games++;state.bestCombo=Math.max(state.bestCombo,state.maxCombo);saveStats();updateScore();
 $('modalSymbol').textContent='✦';$('modalEyebrow').textContent='RUN COMPLETE';$('modalTitle').textContent=state.score>=state.best?'New personal best?':'One more run?';
 $('modalText').textContent='The board filled up — but your next strategy is already loading.';
 $('modalStats').innerHTML=`<div class="modal-stat"><small>FINAL SCORE</small><strong>${state.score.toLocaleString()}</strong></div><div class="modal-stat"><small>BEST COMBO</small><strong>×${state.maxCombo}</strong></div>`;
 $('modalActions').innerHTML='<button class="primary-btn" id="modalAgain">↻ PLAY AGAIN</button><button class="secondary-btn" id="modalHome">⌂ BACK TO HOME</button>';
 $('modalLayer').classList.remove('hidden');$('modalAgain').onclick=()=>{hideModal();startGame()};$('modalHome').onclick=()=>{hideModal();showHome()};
}
function startGame(){
 state.board=Array(SIZE*SIZE).fill(null);state.score=0;state.moves=0;state.combo=0;state.maxCombo=0;state.history=[];state.paused=false;state.busy=false;state.selected=-1;state.hint=null;
 document.body.classList.remove('paused');$('gameScreen').classList.remove('hidden');$('homeScreen').classList.add('hidden');$('modalLayer').classList.add('hidden');
 buildBoard();dealTray();updateScore();$('placedCount').textContent='0 MOVES';$('statusText').textContent='Place a piece to begin';$('comboPill').textContent='COMBO ×0';updateUndoButton();
}
function showHome(){state.paused=false;document.body.classList.remove('paused');$('homeScreen').classList.remove('hidden');$('gameScreen').classList.add('hidden');updateScore()}
function hideModal(){$('modalLayer').classList.add('hidden')}
function updateUndoButton(){$('undoBtn').disabled=!state.history.length||state.busy||state.paused;$('undoCount').textContent=state.history.length?'1':'0'}
function undo(){
 if(!state.history.length||state.busy||state.paused)return;
 const h=state.history.pop();state.board=cloneBoard(h.board);state.tray=h.tray;state.score=h.score;state.moves=h.moves;state.combo=h.combo;state.maxCombo=h.maxCombo;state.selected=-1;state.hint=null;
 renderBoard();renderTray();updateScore();$('placedCount').textContent=`${state.moves} MOVES`;$('statusText').textContent='Last move undone';$('comboPill').textContent=`COMBO ×${state.combo}`;clearPreview();updateUndoButton();playTone(420,.04);
}
function hint(){
 if(state.busy||state.paused)return;
 let candidates=state.tray.map((p,slot)=>({p,slot})).filter(x=>!x.p.used);
 if(state.selected>=0)candidates.sort((a,b)=>(a.slot===state.selected?-1:0)-(b.slot===state.selected?-1:0));
 let best=null;
 for(const item of candidates){for(const [r,c] of legalMoves(item.p.shape)){const pot=scorePotential(item.p.shape,r,c);const centerDist=Math.abs(r-3.5)+Math.abs(c-3.5);const value=pot*4-item.p.shape.length*.25-centerDist*.015;if(!best||value>best.value)best={...item,r,c,value}}}
 if(!best){toast('No legal move — game over');return}
 state.selected=best.slot;state.hint={slot:best.slot,r:best.r,c:best.c};renderTray();clearPreview();
 best.p.shape.forEach(([dr,dc])=>boardEl.children[(best.r+dr)*SIZE+best.c+dc].classList.add('hint-cell'));
 $('statusText').textContent=`Hint: try piece ${best.slot+1}`;toast('Suggested placement highlighted');playTone(700,.06);
}
function pause(){
 if(state.busy)return;state.paused=!state.paused;document.body.classList.toggle('paused',state.paused);$('pauseBtn').innerHTML=state.paused?'<span>▶</span><div><b>RESUME</b><small>Back to game</small></div>':'<span>Ⅱ</span><div><b>PAUSE</b><small>Take a break</small></div>';updateUndoButton();
}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1900)}
function playTone(freq,duration){
 if(!state.sound)return;
 try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.035,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+duration)}catch(_){}
}
function startDragPointer(e,index){if(state.busy||state.paused||state.tray[index].used)return;pointerDrag={index,startX:e.clientX,startY:e.clientY,moved:false};}
$('playBtn').addEventListener('click',()=>{playTone(500,.05);startGame()});
$('dailyBtn').addEventListener('click',()=>toast('Daily Challenge is coming in a future update'));
$('homeBtn').addEventListener('click',()=>{if(!$('gameScreen').classList.contains('hidden')){showHome()}else toast('You are already home')});
$('restartBtn').addEventListener('click',()=>{if(state.moves===0){toast('You are already at the start');return}$('modalSymbol').textContent='↻';$('modalEyebrow').textContent='START A FRESH RUN';$('modalTitle').textContent='Restart game?';$('modalText').textContent='Your current run will end and the board will reset.';$('modalStats').innerHTML='';$('modalActions').innerHTML='<button class="primary-btn" id="confirmRestart">YES, RESTART</button><button class="secondary-btn" id="cancelRestart">KEEP PLAYING</button>';$('modalLayer').classList.remove('hidden');$('confirmRestart').onclick=()=>{hideModal();startGame()};$('cancelRestart').onclick=hideModal});
$('hintBtn').addEventListener('click',hint);$('undoBtn').addEventListener('click',undo);$('pauseBtn').addEventListener('click',pause);
$('soundBtn').addEventListener('click',()=>{state.sound=!state.sound;localStorage.setItem('br_sound',state.sound?'on':'off');$('soundBtn').textContent=state.sound?'♫':'♪';toast(state.sound?'Sound enabled':'Sound muted');if(state.sound)playTone(550,.04)});
$('modalLayer').addEventListener('click',e=>{if(e.target===$('modalLayer'))hideModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('modalLayer').classList.contains('hidden'))hideModal();else if(!$('gameScreen').classList.contains('hidden'))pause()}});
$('soundBtn').textContent=state.sound?'♫':'♪';updateScore();
})();