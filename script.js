const grid = document.getElementById('grid-container');
const checkBtn = document.getElementById('checkBtn');
const resetBtn = document.getElementById('resetBtn');
const hintBtn = document.getElementById('hintBtn');
const timerDisplay = document.getElementById('timer');
const bestTimeDisplay = document.getElementById('bestTime');
const levelSelect = document.getElementById('level');
const hintsLeftDisplay = document.getElementById('hintsLeft');
const timeInput = document.getElementById('timeInput');

let inputs = [];
let time = 60;
let timer;
let hintCount = 3;
let puzzle;
let startTime;

const puzzles = {
  easy: [
    [3,'','',''],
    ['','',1,''],
    ['',3,'',''],
    ['','','',2]
  ],
  hard: [
    ['','','',''],
    ['',2,'',''],
    ['','','',3],
    [1,'','','']
  ]
};

function createGrid(level){
  grid.innerHTML = '';
  inputs = [];
  puzzle = puzzles[level];

  for(let i=0;i<4;i++){
    for(let j=0;j<4;j++){
      const inp = document.createElement('input');
      inp.setAttribute('maxlength','1');
      if(puzzle[i][j]){
        inp.value = puzzle[i][j];
        inp.classList.add('prefilled');
        inp.readOnly = true;
      }
      inp.dataset.row=i;
      inp.dataset.col=j;
      inp.addEventListener('input', handleInput);
      inp.addEventListener('keydown', handleArrowKeys);
      grid.appendChild(inp);
      inputs.push(inp);
    }
  }
}

function handleInput(e){
  const val = e.target.value;
  const correct = ['1','2','3','4'];
  if(!correct.includes(val)){
    e.target.classList.add('wrong');
    e.target.value='';
    document.getElementById('errorSound').play();
    setTimeout(()=>e.target.classList.remove('wrong'),300);
    return;
  }
  checkPuzzle();
  if(!startTime){ startTime = Date.now(); startTimer(); }
}

function handleArrowKeys(e){
  let index = inputs.indexOf(e.target);
  if(e.key==='ArrowRight') index++;
  if(e.key==='ArrowLeft') index--;
  if(e.key==='ArrowUp') index-=4;
  if(e.key==='ArrowDown') index+=4;
  if(index>=0 && index<inputs.length) inputs[index].focus();
}

function startTimer(){
  clearInterval(timer);
  time = parseInt(timeInput.value) || 60;
  timerDisplay.textContent=`⏱️ Time Left: ${time}s`;
  timer=setInterval(()=>{
    time--;
    timerDisplay.textContent=`⏱️ Time Left: ${time}s`;
    if(time<=0){
      clearInterval(timer);
      alert('⛔ Time’s up!');
      inputs.forEach(i=>i.disabled=true);
    }
  },1000);
}

function checkPuzzle(){
  inputs.forEach(i=>i.classList.remove('wrong'));
  let matrix=[...Array(4)].map(()=>Array(4).fill(''));
  let hasDuplicate=false;

  inputs.forEach(inp=>{
    const r=inp.dataset.row;
    const c=inp.dataset.col;
    matrix[r][c]=inp.value;
  });

  for(let i=0;i<4;i++){
    let rowSet=new Set();
    let colSet=new Set();
    for(let j=0;j<4;j++){
      let rowVal=matrix[i][j];
      let colVal=matrix[j][i];
      if(rowSet.has(rowVal)&&rowVal!==''){ highlightDuplicate(i,j,'row'); hasDuplicate=true }
      if(colSet.has(colVal)&&colVal!==''){ highlightDuplicate(j,i,'col'); hasDuplicate=true }
      rowSet.add(rowVal);
      colSet.add(colVal);
    }
  }

  if(!hasDuplicate && isComplete(matrix)){
    clearInterval(timer);
    document.getElementById('successSound').play();
    confettiEffect();
    const elapsed = Math.floor((Date.now()-startTime)/1000);
    saveBestTime(elapsed);
    alert('🎉 You Win! Time: '+elapsed+'s');
  }
}

function highlightDuplicate(i,j,type){
  inputs.forEach(inp=>{
    if((type==='row'&&inp.dataset.row==i)||(type==='col'&&inp.dataset.col==j))
      inp.classList.add('wrong');
  });
}

function isComplete(matrix){ return matrix.every(row=>row.every(cell=>cell!=='')) }

function saveBestTime(seconds){
  const key='bestTime';
  let best=localStorage.getItem(key);
  if(!best||seconds<best){
    localStorage.setItem(key,seconds);
    bestTimeDisplay.textContent=`🏆 Best Time: ${seconds}s`;
  }
}

function loadBestTime(){
  const best = localStorage.getItem('bestTime');
  if(best) bestTimeDisplay.textContent=`🏆 Best Time: ${best}s`;
}

function resetGame(){
  clearInterval(timer);
  startTime=null;
  hintCount=3;
  hintsLeftDisplay.textContent=hintCount;
  inputs.forEach(i=>i.disabled=false);
  createGrid(levelSelect.value);
}

function giveHint(){
  if(hintCount===0) return;
  for(let i=0;i<16;i++){
    if(inputs[i].value===''){
      const row=inputs[i].dataset.row;
      const col=inputs[i].dataset.col;
      inputs[i].value=puzzle[row][col];
      inputs[i].readOnly=true;
      inputs[i].classList.add('prefilled');
      hintCount--;
      hintsLeftDisplay.textContent=hintCount;
      break;
    }
  }
}

function confettiEffect(){
  var duration = 3 * 1000;
  var end = Date.now() + duration;
  (function frame(){
    confettiJS({particleCount:5,angle:60,spread:55,origin:{x:0}});
    confettiJS({particleCount:5,angle:120,spread:55,origin:{x:1}});
    if(Date.now()<end){ requestAnimationFrame(frame); }
  })();
}

function confettiJS(opts){
  window.confetti(Object.assign({particleCount:20,spread:70,origin:{y:0.6}},opts));
}

checkBtn.addEventListener('click',checkPuzzle);
resetBtn.addEventListener('click',resetGame);
hintBtn.addEventListener('click',giveHint);
levelSelect.addEventListener('change',resetGame);
timeInput.addEventListener('change',resetGame);

loadBestTime();
resetGame();
