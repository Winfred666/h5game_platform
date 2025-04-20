const background = document.createElement('div');
background.id = 'background';
background.style.zIndex = -10;
document.body.appendChild(background);
const deathbackground = document.createElement('div');
deathbackground.id = 'deathbackground';
deathbackground.style.zIndex = -15;
document.body.appendChild(deathbackground);
const background_muohu = document.createElement('div');
background_muohu.id = 'background_muohu';
background_muohu.style.zIndex = -20;
document.body.appendChild(background_muohu);

const backButton = document.createElement('button');
backButton.id = 'backButton';
backButton.className = 'button';
backButton.setAttribute('onclick', 'back()');
document.body.appendChild(backButton);
backButton.style.display = 'none';

const introButton = document.createElement('button');
introButton.id = 'introButton';
introButton.className = 'button';
introButton.setAttribute('onclick', 'introduction()');
document.body.appendChild(introButton);

const playButton = document.createElement('button');
playButton.id = 'playButton';
playButton.className = 'button';
playButton.setAttribute('onclick', 'play()');
document.body.appendChild(playButton);

const aboutButton = document.createElement('button');
aboutButton.id = 'aboutButton';
aboutButton.className = 'button';
aboutButton.setAttribute('onclick', 'about()');
document.body.appendChild(aboutButton);

const restartButton = document.createElement('button');
restartButton.id = 'restartButton';
restartButton.className = 'button';
restartButton.setAttribute('onclick', 'play()');
document.body.appendChild(restartButton);
restartButton.style.display = 'none';

const start1 = document.createElement('h1');
const start2 = document.createElement('p');
start1.id = 'start1';
start2.id = 'start2';
start1.className = 'start';
start2.className = 'start';
start1.innerHTML = 'MAD CAT<br>& BAD RAT';
start2.innerText = '虎口逃生';
document.body.appendChild(start1);
document.body.appendChild(start2);

const intro = document.createElement('div');
const intro1 = document.createElement('div');
const intro2 = document.createElement('div');
const intro3 = document.createElement('div');
const intro4 = document.createElement('div');
intro.appendChild(intro1);
intro.appendChild(intro2);
intro.appendChild(intro3);
intro.appendChild(intro4);
intro.id = 'introduction';
intro1.id = 'introduction1';
intro2.id = 'introduction2';
intro3.id = 'introduction3';
intro4.id = 'introduction4';
intro.className = 'wenzi1';
intro1.innerHTML =
  '众所周知，BGS 是一个人才辈出的地方。一方水土养一方鼠，在这个环境的熏陶下，你也曾经成为让整个 BGS 闻风丧胆的神偷。但现在你却已经三天没有吃饭了，导致你挨饿的罪魁祸首，就是现在正在悠闲地散步的——虎皮。';
intro2.innerHTML =
  '经过多日的观察，你已经知道虎皮在没有看到你之前，会一直保持像现在这样的状态散步。虎皮胜过其他猫的地方，就在于他锐利的眼神，好像只要没有建筑物遮挡，即使是在他的身后的东西，他也能很快地察觉到。好在这只猫还不熟悉 BGS 的地形，一旦他跟丢了，就只会在原地打转了。';
intro3.innerHTML =
  '每偷走一块奶酪可以获得 1 分加分，而偷走地图上所有的奶酪更能表现你对 BGS 所有人(和猫)的嘲讽，从而获得额外的加分。进入地图右下角的洞，你能够通过事先挖好的通道来到下一个地点，并获得 1 点加分。如果你巧妙地躲过了虎皮的巡视，在 10 秒钟内到达下一个地点，也能获得额外的加分。';
intro4.innerHTML = '是时候开始行动了';
intro2.className = 'wenzi1_2';
intro3.className = 'wenzi1_3';
intro4.className = 'wenzi1_3';
document.body.appendChild(intro);
intro.style.display = 'none';
const introtitle = document.createElement('h1');
introtitle.id = 'introtitle';
introtitle.className = 'title';
introtitle.innerHTML = ' < How To Play';
introtitle.style.display = 'none';
document.body.appendChild(introtitle);

const about1 = document.createElement('div');
about1.id = 'about';
about1.className = 'wenzi2';
about1.innerHTML =
  '<br>策划/</br>春公 仰泳猩 裸泳耗</br><br></br>技术/<br>Astar 尤里卡 switch suse</br><br><br>美术/<br>累以阔 翎翙子 罗尔 Quii 金毛 晚豆</br><br><br>特别鸣谢/<br>虎皮儿</br>';
document.body.appendChild(about1);
about1.style.display = 'none';

const abouttitle = document.createElement('h1');
abouttitle.id = 'abouttitle';
abouttitle.className = 'title';
abouttitle.innerHTML = '< About This Game';
abouttitle.style.display = 'none';
document.body.appendChild(abouttitle);

const menubutton = document.createElement('button');
menubutton.id = 'menubutton';
menubutton.className = 'button';
menubutton.setAttribute('onclick', 'bmenu()');
document.body.appendChild(menubutton);
menubutton.style.display = 'none';

function introduction() {
  introButton.style.display = 'none';
  start1.style.display = 'none';
  start2.style.display = 'none';
  playButton.style.display = 'none';
  aboutButton.style.display = 'none';
  intro.style.display = 'flex';
  backButton.style.display = 'flex';
  introtitle.style.display = 'flex';
  background_muohu.style.zIndex = -1;
}
function back() {
  start1.style.display = 'flex';
  start2.style.display = 'flex';
  introButton.style.display = 'flex';
  playButton.style.display = 'flex';
  introtitle.style.display = 'none';
  intro.style.display = 'none';
  backButton.style.display = 'none';
  background_muohu.style.zIndex = -20;
  aboutButton.style.display = 'flex';
  about1.style.display = 'none';
  restartButton.style.display = 'none';
  abouttitle.style.display = 'none';
}
function about() {
  introButton.style.display = 'none';
  start1.style.display = 'none';
  start2.style.display = 'none';
  playButton.style.display = 'none';
  aboutButton.style.display = 'none';
  about1.style.display = 'flex';
  backButton.style.display = 'flex';
  background_muohu.style.zIndex = -1;
  abouttitle.style.display = 'flex';
}
function bmenu() {
  start1.innerHTML = 'MAD CAT<br>& BAD RAT';
  start2.innerText = '虎口逃生';
  introButton.style.display = 'flex';
  playButton.style.display = 'flex';
  introtitle.style.display = 'none';
  intro.style.display = 'none';
  backButton.style.display = 'none';
  background_muohu.style.zIndex = -20;
  aboutButton.style.display = 'flex';
  about1.style.display = 'none';
  restartButton.style.display = 'none';
  abouttitle.style.display = 'none';
  menubutton.style.display = 'none';
  deathbackground.style.zIndex = -15;
}
