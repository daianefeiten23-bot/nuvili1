const screens = [...document.querySelectorAll('.screen')];

const alphabetData = [
  ['A','ABELHA','🐝'],['B','BOLA','⚽'],['C','CASA','🏠'],['D','DADO','🎲'],
  ['E','ELEFANTE','🐘'],['F','FLOR','🌸'],['G','GATO','🐱'],['H','HIPOPÓTAMO','🦛'],
  ['I','IGREJA','⛪'],['J','JANELA','▦'],['K','KIWI','🥝'],['L','LUA','🌙'],
  ['M','MACACO','🐵'],['N','NAVIO','🚢'],['O','OVO','🥚'],['P','PATO','🦆'],
  ['Q','QUEIJO','🧀'],['R','RATO','🐭'],['S','SAPO','🐸'],['T','TARTARUGA','🐢'],
  ['U','UVA','🍇'],['V','VACA','🐄'],['W','WAFFLE','🧇'],['X','XÍCARA','☕'],
  ['Y','YAK','🐂'],['Z','ZEBRA','🦓']
];

const storedCompleted = JSON.parse(localStorage.getItem('nuvili_completed_letters') || '[]');
const state = {
  name: '',
  completed: Array.isArray(storedCompleted) ? storedCompleted : [],
  selectedIndex: 0,
  activityIndex: 0,
  answered: false,
  sound: localStorage.getItem('nuvili_sound') !== 'off'
};

function show(id){
  screens.forEach(s => s.classList.toggle('active', s.id === id));
  if(id === 'vale') renderMap();
  window.scrollTo(0,0);
}

function saveProgress(){
  localStorage.setItem('nuvili_completed_letters', JSON.stringify(state.completed));
}

function completedCount(){
  return state.completed.length;
}

function renderMap(){
  document.getElementById('welcomeName').textContent = state.name || 'Explorador';
  const count = completedCount();
  document.getElementById('starsCount').textContent = count * 3;
  document.getElementById('lightsCount').textContent = count * 3;
  document.getElementById('progressLabel').textContent = `${count} de 26 letras`;
  document.getElementById('progressBar').style.width = `${(count/26)*100}%`;

  const path = document.getElementById('alphabetPath');
  path.innerHTML = '';

  alphabetData.forEach(([letter,word,emoji], index) => {
    const completed = state.completed.includes(letter);
    const unlocked = index === 0 || state.completed.includes(alphabetData[index-1][0]);
    const button = document.createElement('button');
    button.className = `letter-stage ${completed ? 'completed' : ''} ${unlocked && !completed ? 'current' : ''}`;
    button.disabled = !unlocked;
    button.setAttribute('aria-label', unlocked ? `Abrir fase da letra ${letter}` : `Letra ${letter} bloqueada`);
    button.innerHTML = `
      ${completed ? '<span class="stage-check">✓</span>' : (!unlocked ? '<span class="stage-lock">🔒</span>' : '')}
      <span class="stage-letter">${letter}</span>
      <span class="stage-word">${word}</span><span class="stage-emoji">${emoji}</span>
      <span class="stage-stars">${completed ? '★ ★ ★' : '☆ ☆ ☆'}</span>`;
    if(unlocked){
      button.addEventListener('click', () => openLetter(index));
    }
    path.appendChild(button);
  });

  const msg = document.getElementById('mapMessage');
  if(count === 26) msg.textContent = 'Você completou toda a Trilha das Letras! 🏆';
  else msg.textContent = `Próxima descoberta: letra ${alphabetData[count][0]}. Continue até chegar ao Z!`;
}

function openLetter(index){
  state.selectedIndex = index;
  const [letter,word,emoji] = alphabetData[index];
  document.getElementById('bigLetter').textContent = letter;
  document.getElementById('letterTitle').textContent = `Letra ${letter}`;
  document.getElementById('letterExample').textContent = `${letter} de ${capitalize(word)} ${emoji}`;
  show('letterIntro');
}

function capitalize(word){
  return word.charAt(0) + word.slice(1).toLowerCase();
}

function makeActivities(index){
  const [letter,word,emoji] = alphabetData[index];
  const previous = alphabetData[(index + 25) % 26][0];
  const next = alphabetData[(index + 1) % 26][0];
  const middle = alphabetData[(index + 7) % 26][0];

  const letters1 = shuffle([letter, previous, next]);
  const letters2 = shuffle([middle, letter, previous]);
  const words = shuffle([
    `${word} ${emoji}`,
    `${alphabetData[(index+3)%26][1]} ${alphabetData[(index+3)%26][2]}`,
    `${alphabetData[(index+9)%26][1]} ${alphabetData[(index+9)%26][2]}`
  ]);

  return [
    {question:`Encontre a letra ${letter}`,answers:letters1,correct:letter,type:'letter'},
    {question:`Qual letra começa a palavra ${word}?`,answers:letters2,correct:letter,type:'letter'},
    {question:`Qual palavra começa com ${letter}?`,answers:words,correct:`${word} ${emoji}`,type:'word'}
  ];
}

function shuffle(items){
  return [...items].sort(() => Math.random() - 0.5);
}

let currentActivities = [];

function startSelectedLetter(){
  state.activityIndex = 0;
  currentActivities = makeActivities(state.selectedIndex);
  renderActivity();
  show('activity');
}

function renderActivity(){
  state.answered = false;
  const activity = currentActivities[state.activityIndex];
  const letter = alphabetData[state.selectedIndex][0];
  document.getElementById('progressText').textContent = `Atividade ${state.activityIndex+1} de ${currentActivities.length}`;
  document.getElementById('currentLetterBadge').textContent = letter;
  document.getElementById('question').textContent = activity.question;
  document.getElementById('feedback').textContent = '';
  document.getElementById('nextActivity').hidden = true;
  const activityVivi = document.getElementById('activityVivi');
  const viviSpeech = document.getElementById('viviSpeech');
  activityVivi.className = 'vivi-character thinking';
  viviSpeech.textContent = state.activityIndex === 0 ? 'Observe bem! 👀' : 'Pense com calma! 💜';

  const answers = document.getElementById('answers');
  answers.innerHTML = '';
  activity.answers.forEach(value => {
    const button = document.createElement('button');
    button.className = 'answer';
    button.textContent = value;
    button.addEventListener('click', () => answer(button,value));
    answers.appendChild(button);
  });
}

function answer(button,value){
  if(state.answered) return;
  const correct = currentActivities[state.activityIndex].correct;
  if(value === correct){
    state.answered = true;
    button.classList.add('correct');
    document.getElementById('feedback').textContent = 'Muito bem! Você conseguiu! ✨';
    const activityVivi = document.getElementById('activityVivi');
    const viviSpeech = document.getElementById('viviSpeech');
    activityVivi.className = 'vivi-character celebrating';
    viviSpeech.textContent = 'Isso! Você acertou! ⭐';
    document.getElementById('nextActivity').hidden = false;
  }else{
    button.classList.remove('try');
    void button.offsetWidth;
    button.classList.add('try');
    document.getElementById('feedback').textContent = 'Quase! Tente novamente.';
    const activityVivi = document.getElementById('activityVivi');
    const viviSpeech = document.getElementById('viviSpeech');
    activityVivi.className = 'vivi-character surprised';
    viviSpeech.textContent = 'Opa! Vamos tentar outra vez?';
    setTimeout(() => {
      if(!state.answered){
        activityVivi.className = 'vivi-character thinking';
        viviSpeech.textContent = 'Você consegue! 💜';
      }
    }, 850);
  }
}

function finishLetter(){
  const [letter,word,emoji] = alphabetData[state.selectedIndex];
  if(!state.completed.includes(letter)){
    state.completed.push(letter);
    state.completed.sort((a,b) => alphabetData.findIndex(x=>x[0]===a)-alphabetData.findIndex(x=>x[0]===b));
    saveProgress();
  }
  document.getElementById('victoryTitle').textContent = `Letra ${letter} concluída!`;
  document.getElementById('victoryText').textContent = `Você aprendeu: ${letter} de ${capitalize(word)} ${emoji}.`;
  show('letterVictory');
}

document.addEventListener('click', event => {
  const go = event.target.closest('[data-go]');
  if(go) show(go.dataset.go);

  const action = event.target.closest('[data-action]');
  if(!action) return;
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  const type = action.dataset.action;

  if(type === 'settings'){
    content.innerHTML = `<h2>Configurações</h2><p>Som: <strong>${state.sound ? 'Ligado' : 'Desligado'}</strong></p><button id="toggleSound" class="btn btn-purple">${state.sound ? 'Desligar som' : 'Ligar som'}</button>`;
    modal.showModal();
    setTimeout(() => {
      const toggle = document.getElementById('toggleSound');
      if(toggle) toggle.onclick = () => {
        state.sound = !state.sound;
        localStorage.setItem('nuvili_sound', state.sound ? 'on' : 'off');
        modal.close();
      };
    },0);
  }else if(type === 'parents'){
    content.innerHTML = `<h2>Área dos Pais</h2><p>Letras concluídas: <strong>${completedCount()} de 26</strong>.</p><p>Estrelas conquistadas: <strong>${completedCount()*3}</strong>.</p><p>O jogo salva o progresso apenas neste navegador.</p>`;
    modal.showModal();
  }else if(type === 'help'){
    content.innerHTML = '<h2>Ajuda</h2><p>Clique em Começar, digite o nome da criança e complete as letras em ordem, de A até Z.</p>';
    modal.showModal();
  }else if(type === 'sound'){
    state.sound = !state.sound;
    localStorage.setItem('nuvili_sound', state.sound ? 'on' : 'off');
    content.innerHTML = `<h2>Som</h2><p>Som ${state.sound ? 'ligado' : 'desligado'}.</p>`;
    modal.showModal();
  }else if(type === 'reset-progress'){
    content.innerHTML = '<h2>Reiniciar progresso?</h2><p>Isso apagará todas as letras concluídas neste navegador.</p><button id="confirmReset" class="btn btn-purple">Sim, reiniciar</button>';
    modal.showModal();
    setTimeout(() => {
      document.getElementById('confirmReset').onclick = () => {
        state.completed = [];
        saveProgress();
        modal.close();
        renderMap();
      };
    },0);
  }
});

document.getElementById('closeModal').addEventListener('click',()=>document.getElementById('modal').close());

const startButton = document.querySelector('.hotspot-start');
if(startButton){
  startButton.addEventListener('click', () => {
    localStorage.removeItem('nuvili_name');
    state.name = '';
    const input = document.getElementById('playerName');
    input.value = '';
    document.getElementById('nameError').hidden = true;
  });
}

document.getElementById('continueName').addEventListener('click', () => {
  const value = document.getElementById('playerName').value.trim();
  const error = document.getElementById('nameError');
  if(!value){error.hidden=false;document.getElementById('playerName').focus();return}
  error.hidden=true;
  state.name=value;
  localStorage.setItem('nuvili_name',value);
  show('vale');
});

document.getElementById('playerName').addEventListener('keydown', event => {
  if(event.key === 'Enter') document.getElementById('continueName').click();
});

document.getElementById('startLetter').addEventListener('click',startSelectedLetter);

document.getElementById('nextActivity').addEventListener('click', () => {
  if(state.activityIndex < currentActivities.length-1){
    state.activityIndex++;
    renderActivity();
  }else{
    finishLetter();
  }
});

document.getElementById('victoryContinue').addEventListener('click', () => {
  if(completedCount() === 26){
    document.getElementById('finalName').textContent = state.name || 'pequeno explorador';
    show('finalVictory');
  }else{
    show('vale');
  }
});

window.addEventListener('load', async () => {
  localStorage.removeItem('nuvili_name');
  state.name = '';
  const input = document.getElementById('playerName');
  input.value = '';
  input.setAttribute('autocomplete','off');
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations().catch(() => []);
    regs.forEach(reg => reg.unregister());
  }
  if ('caches' in window) {
    const keys = await caches.keys().catch(() => []);
    keys.forEach(key => caches.delete(key));
  }
  show('home');
});
