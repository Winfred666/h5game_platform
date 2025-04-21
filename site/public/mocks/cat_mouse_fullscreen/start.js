function buttonCreate() {
  const introButton = document.createElement('button');
  introButton.id = 'startButton';
  introButton.setAttribute('onclick', 'introduction()');
  document.body.appendChild(introButton);
}
buttonCreate();

function createBackground() {
  const backgroundCreate = document.createElement('div');
  backgroundCreate.id = 'background';
  backgroundCreate.style.zIndex = -10;
  document.body.appendChild(backgroundCreate);
  const deathbackgroundCreate = document.createElement('div');
  deathbackgroundCreate.id = 'deathbackground';
  deathbackgroundCreate.style.zIndex = -15;
  document.body.appendChild(deathbackgroundCreate);
}
createBackground();
function createStart() {
  const startCreate = document.createElement('div');
  const startCreate2 = document.createElement('p');
  startCreate.id = 'start1';
  startCreate2.id = 'start2';
  startCreate.className = 'start';
  startCreate2.className = 'start';
  startCreate.innerHTML = 'MAD CAT<br>& BAD RAT';
  startCreate2.innerText = '虎口逃生';
  document.body.appendChild(startCreate);
  document.body.appendChild(startCreate2);
}
createStart();

function introduction() {
  const deathbackground = document.getElementById('deathbackground');
  deathbackground.style.zIndex = -15;
  const introButton = document.getElementById('introButton');
  const start1 = document.getElementById('start1');
  const start2 = document.getElementById('start2');
  introButton.style.display = 'none';
  start1.style.display = 'none';
  start2.style.display = 'none';
  // const introduction = document.createElement('img');
  // introduction.id = 'introduction';
  // introduction.src = './ui/intro.jpg';
  // introduction.style.height = '430px';
  // introduction.style.width = '620px';
  const backgroundCreate = document.getElementById('background');
  backgroundCreate.id = 'background_muohu';
  const introduction = document.createElement('div');
  introduction.id = 'introduction';
  introduction.innerHTML =
    '你，杰瑞，曾经也是让整个街区闻风丧胆的神偷，现在却已经三天没有吃饭了。而导致你饿肚子的罪魁祸首，就是一个星期前才刚刚来到这幢房子的新手————汤姆。<br><br>是时候给新来的一点颜色看看了，你这么想到。从你藏身的这只桌腿向厨房的另一头看去，那只不知天高地厚的猫竟然在悠闲地散步。你压住微微扬起的嘴角，告诉自己，知己知彼，百战不殆。经过多日的观察，你已经知道汤姆在没有看到你之前，会一直保持像现在这样的状态散步。这只猫胜过其他猫的地方，就在于他锐利的眼神，好像只要没有建筑物遮挡，即使是在他的身后的东西，他也能很快地察觉到。一旦被他看到，你就必须放弃现在的位置，寻找新的藏身地了。好在这只猫还不熟悉新家的地形，也不知道你惯用的几个藏身地，一旦他追到你在他视野里消失的位置，就只会在原地打转了。<br><br>三天前你就盯上了房子主人新买的那块奶酪，但是现在，与饥饿在生理上的煎熬相比，汤姆悠闲的步伐对你神偷名誉的践踏以压倒性的优势占据了你的思维。每偷走一块奶酪可以获得 1 分加分，而偷走地图上所有的奶酪更能表现你对猫的嘲讽，从而获得额外的加分。进入地图右下角的洞，你能够通过事先挖好的通道来到下一个地点，并获得 1 点加分。如果你巧妙地躲过了这只猫的巡视，在 10 秒钟内到达下一个地点，很好地教育了这个新手什么叫神偷速度，也能获得额外的加分。<br><br>是时候开始行动了。';
  document.body.appendChild(introduction);
  const button = document.createElement('button');
  button.id = 'backButton';
  button.style.border = 'none';
  button.setAttribute('onclick', 'play()');
  document.body.appendChild(button);
}
function back() {}
