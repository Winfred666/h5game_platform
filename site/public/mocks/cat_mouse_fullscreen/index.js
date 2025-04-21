// import { Heap } from './heap.js';
async function play() {
  playButton.style.display = 'none';
  introButton.style.display = 'none';
  aboutButton.style.display = 'none';
  start1.style.display = 'none';
  start2.style.display = 'none';
  deathbackground.style.zIndex = -15;
  restartButton.style.display = 'none';
  menubutton.style.display = 'none';

  const INF = 1e9;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const ratHeight = 64;
  const ratWidth = 64;
  const exitX = CANVAS_WIDTH - 64;
  const exitY = CANVAS_HEIGHT - 64;
  let rightPressed = false;
  let leftPressed = false;
  let upPressed = false;
  let downPressed = false;
  let ratMarginX = 5; // 老鼠边上空白太多了，避免空气撞墙
  let ratMarginY = 15;
  let ratX = 20;
  let ratY = 20;
  let ratDir = 0;
  let score = 0;
  let speed = 3.5; // 跑太快猫根本追不上
  let a = false;
  let cancel = 0;
  let beginTime = new Date().getTime(); // 开始时间
  let display = 0; // 底端是否显示信息
  cancel = 0;

  // 创建 canvas
  function createCanvas() {
    const canvasCreate = document.createElement('canvas');
    canvasCreate.id = 'canvas';
    document.body.appendChild(canvasCreate);
  }
  createCanvas();
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // 初始化 canvas
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT + 100;
  canvas.setAttribute('background', '#eee');
  canvas.setAttribute('display', 'block');
  canvas.setAttribute('margin', '0 auto');

  // 定义和加载图片
  let background = new Array();
  let hole = new Array();
  let block = new Array();
  let tile = new Array();
  let cheeses = new Image();
  let bgNumber = Math.floor(Math.random() * 2);
  let catNumber = 0;
  let ratNumber = 0;
  let catBack = new Array();
  let catFront = new Array();
  let catSide = new Array();
  let catCatch = new Array();
  let ratBack = new Array();
  let ratFront = new Array();
  let ratSide = new Array();

  function __loadImage(src) {
    let tmp = new Image();
    tmp.src = src;
    return tmp;
  }
  function loadImages() {
    background[0] = __loadImage('./map/background/map1_kitchen.png');
    background[1] = __loadImage('./map/background/map2_garden.png');
    hole[0] = __loadImage('./map/hole/map1.png');
    hole[1] = __loadImage('./map/hole/map2.png');
    block[0] = __loadImage('./map/block/map1_obstacle.png');
    block[1] = __loadImage('./map/block/map2_obstacle.png');
    tile[0] = __loadImage('./map/block/map1_tile.png');
    tile[1] = __loadImage('./map/block/map2_tile.png');
    cheeses.src = './character/cheese/cheese-full.gif';
    for (let i = 1; i <= 4; ++i) {
      catBack[i - 1] = __loadImage(`./character/cat-back/cat-back${i}.png`);
      catSide[i - 1] = __loadImage(`./character/cat-side/cat-side${i}.png`);
      catFront[i - 1] = __loadImage(`./character/cat-front/cat-front${i}.png`);
      catCatch[i - 1] = __loadImage(`./character/catch-you/catch-you${i}.png`);
      ratBack[i - 1] = __loadImage(`./character/rat-back/rat-back${i}.png`);
      ratSide[i - 1] = __loadImage(`./character/rat-side/rat-side${i}.png`);
      ratFront[i - 1] = __loadImage(`./character/rat-front/rat-front${i}.png`);
    }
  }

  document.addEventListener('keydown', keyDownHandler, false);
  document.addEventListener('keyup', keyUpHandler, false);
  /** @type HTMLCanvasElement */
  class cheeseClass {
    constructor(cheeseX, cheeseY, cheeseWidth, cheeseLength) {
      this.cheeseX = cheeseX;
      this.cheeseY = cheeseY;
      this.cheeseWidth = cheeseWidth;
      this.cheeseLength = cheeseLength;
    }
  }
  let cheeseArray = new Array();

  function drawCheese() {
    if (cheeseArray.length > 0) {
      for (let cheese of cheeseArray) {
        ctx.drawImage(
          cheeses,
          cheese.cheeseX,
          cheese.cheeseY,
          cheese.cheeseWidth,
          cheese.cheeseLength
        );
      }
    }
  }

  function eatCheese() {
    if (cheeseArray.length > 0) {
      for (let n = 0; n < cheeseArray.length; n++) {
        if (
          ratX < cheeseArray[n].cheeseX + 60 &&
          ratX > cheeseArray[n].cheeseX - 60 &&
          ratY < cheeseArray[n].cheeseY + 60 &&
          ratY > cheeseArray[n].cheeseY - 60
        ) {
          cheeseArray.splice(n, 1);
          if (cheeseArray.length == 0) {
            score += 3;
          } else {
            score += 1;
          }
        }
      }
    }
  }
  class wallClass {
    constructor(wallX, wallY, wallWidth, wallLength) {
      this.wallX = wallX;
      this.wallY = wallY;
      this.wallWidth = wallWidth; // x 轴方向长度叫 width，y 轴方向长度叫 length
      this.wallLength = wallLength;
    }
  }
  let wallArray = new Array();
  let pointAvailable = new Array();
  let pointDis = new Array();
  let pointF = new Array();
  let pointPre = new Array();
  const transDirX = [0, 0, -1, 1, -1, 1, -1, 1];
  const transDirY = [-1, 1, 0, 0, -1, -1, 1, 1]; // 变成了 8 个方向
  class catClass {
    constructor(x, y, d) {
      this.catX = x;
      this.catY = y;
      this.catDir = d; // 0:up, 1:down, 2:left, 3:right, 4:左上, 5: 右上, 6:左下, 7:右下
      this.actionMode = 1; // 1:随机游走模式, 2:追逐老鼠模式, 3:调整路线模式, 4:等待模式
      this.targetX = -1;
      this.targetY = -1;
      this.speed = 2;
      this.hesitate = 0;
    }
  }
  let cat;
  class edgeXClass {
    constructor(y, x1, x2) {
      this.y = y;
      this.x1 = x1;
      this.x2 = x2;
    }
  }
  let edgeXArray = new Array();
  class edgeYClass {
    constructor(x, y1, y2) {
      this.x = x;
      this.y1 = y1;
      this.y2 = y2;
    }
  }
  let edgeYArray = new Array();

  document.addEventListener('keydown', keyDownHandler, false);
  document.addEventListener('keyup', keyUpHandler, false);

  function drawAroundWall() {
    // ctx.fillStyle = 'grey';
    // ctx.fillRect(0, 0, CANVAS_WIDTH, 10);
    // ctx.fillRect(0, 0, 10, CANVAS_HEIGHT);
    // ctx.fillRect(0, CANVAS_HEIGHT - 10, CANVAS_WIDTH, 10);
    // ctx.fillRect(CANVAS_WIDTH - 10, 0, 10, CANVAS_HEIGHT);
  }
  function randomCat() {
    cat = new catClass(800 - ratWidth, 300, Math.floor(Math.random() * 4));
    // 待办： 判断猫生成地点是否合法
  }
  function __randomWall(d) {
    cheeseArray.length = 0;
    switch (d) {
      case 0:
        wallArray.push(new wallClass(150, 100, 400 + 64, 64));
        wallArray.push(new wallClass(150, 450 - 64, 400 + 64, 64));
        wallArray.push(new wallClass(150, 100, 64, 350));
        wallArray.push(new wallClass(550, 100, 64, 350));
        cheeseArray.push(new cheeseClass(20, 520, 64, 64));
        cheeseArray.push(new cheeseClass(700, 64, 64, 64));
        break;
      case 1:
        wallArray.push(new wallClass(150, 100, 300 + 64, 64));
        wallArray.push(new wallClass(300, 500 - 64, 300 + 64, 64));
        wallArray.push(new wallClass(150, 100, 64, 250));
        wallArray.push(new wallClass(300, 250, 64, 250));
        wallArray.push(new wallClass(450, 100, 64, 250));
        wallArray.push(new wallClass(600, 250, 64, 250));
        cheeseArray.push(new cheeseClass((150 + 300) / 2, 350, 64, 64));
        cheeseArray.push(new cheeseClass((450 + 600) / 2, 230 - 64, 64, 64));
        break;
      case 2:
        wallArray.push(new wallClass(150, 100, 64, 250));
        wallArray.push(new wallClass(300, 250, 64, 250));
        wallArray.push(new wallClass(450, 100, 64, 250));
        wallArray.push(new wallClass(600, 250, 64, 250));
        cheeseArray.push(new cheeseClass(300, 510, 64, 64));
        cheeseArray.push(new cheeseClass(450, 100 - 64 - 10, 64, 64));
        break;
      case 3:
        wallArray.push(new wallClass(250 - 1, 100 - 5, 300 + 2, 64 + 5 + 1));
        wallArray.push(new wallClass(250 - 1, 450 - 1, 300 + 2, 64 + 5 + 1));
        wallArray.push(new wallClass(250 - 64 * 2, 100 + 64, 64 * 2, 100));
        wallArray.push(new wallClass(250 - 64 * 2, 450 - 100, 64 * 2, 100));
        wallArray.push(new wallClass(550, 100 + 64, 64 * 2, 100));
        wallArray.push(new wallClass(550, 450 - 100, 64 * 2, 100));
        cheeseArray.push(new cheeseClass(400 - 32, 300 - 32, 64, 64));
        cheeseArray.push(new cheeseClass(560, 90, 64, 64));
        break;
      case 4:
        wallArray.push(new wallClass(150 + 80, 80, 450 - 24, 64));
        wallArray.push(new wallClass(800 - 64, 80, 64, 64));
        wallArray.push(new wallClass(0, 200, 130, 64));
        wallArray.push(new wallClass(210, 200, 84, 64));
        wallArray.push(new wallClass(150 + 80, 80, 64, 200 - 80 + 64));
        wallArray.push(new wallClass(230, 360, 380, 64));
        wallArray.push(new wallClass(230, 360, 64, 240));
        wallArray.push(new wallClass(230 + 380 - 64, 360, 64, 240 - 80));
        cheeseArray.push(
          new cheeseClass((680 + 760) / 2 - 32 - 24, 80 + 64, 64, 64)
        );
        cheeseArray.push(new cheeseClass(230 + 64 + 20, 360 + 64 + 20, 64, 64));
        break;
      case 5:
        wallArray.push(new wallClass(100, 80, 220, 64));
        wallArray.push(new wallClass(100, 100, 64, 64));
        wallArray.push(new wallClass(80, 100, 64, 200));
        wallArray.push(new wallClass(80, 380, 64, 220 - 80));
        wallArray.push(new wallClass(400, 80, 280 - 24, 64));
        wallArray.push(new wallClass(800 - 64, 80, 64, 64));
        wallArray.push(new wallClass(80, 600 - 80 - 64, 240, 64));
        wallArray.push(new wallClass(400, 600 - 80 - 64, 280 - 24, 64));
        wallArray.push(new wallClass(800 - 64, 600 - 80 - 64, 64, 64));
        wallArray.push(new wallClass(250, 300 - 75, 400, 150));

        cheeseArray.push(
          new cheeseClass((680 + 760) / 2 - 32, 80 + 64, 64, 64)
        );
        cheeseArray.push(
          new cheeseClass(320 + 40 - 32, 600 - 80 - 64 - 64, 64, 64)
        );
        break;
      case 6:
        wallArray.push(new wallClass(0, 128, 64, 64));
        wallArray.push(new wallClass(164, 0, 64, 128));
        wallArray.push(new wallClass(164, 600 - 400, 64, 400));
        wallArray.push(new wallClass(164 + 64, 128 - 64, 64 * 6, 64));
        wallArray.push(new wallClass(164 + 64, 600 - 400, 64 * 2, 64));
        wallArray.push(
          new wallClass(164 + 64 * 4 + 20, 600 - 400, 64 * 3 - 20, 64)
        );
        wallArray.push(new wallClass(164 + 64 * 4 + 20, 600 - 400, 64, 100));
        // wallArray.push(
        //   new wallClass(164 + 64 + 64 * 3 + 64 * 3, 128 - 64, 64, 450)
        // );
        cheeseArray.push(new cheeseClass(300, 0, 64, 64));
        cheeseArray.push(new cheeseClass(300, 600 - 300, 64, 64));
        break;
      case 7:
        wallArray.push(new wallClass(100, 100, 600, 64));
        wallArray.push(new wallClass(100, 264, 150, 64));
        wallArray.push(new wallClass(330, 264, 370, 64));
        wallArray.push(new wallClass(100, 428, 370, 64));
        wallArray.push(new wallClass(550, 428, 150, 64));
        cheeseArray.push(new cheeseClass(258, 264, 64, 64));
        cheeseArray.push(new cheeseClass(478, 428, 64, 64));
        break;
      case 8:
        wallArray.push(new wallClass(80, 80, 164, 64));
        wallArray.push(new wallClass(180, 80, 64, 64 * 2 + 40));
        wallArray.push(new wallClass(180, 184, 64 * 2 + 100, 64)); //
        wallArray.push(new wallClass(344, 184 - 40, 64, 104));
        wallArray.push(new wallClass(484, 184 - 40, 64, 104));
        wallArray.push(new wallClass(484, 184, 800 - 484, 64));
        wallArray.push(new wallClass(484 + 64, 184, 64, 128));
        wallArray.push(new wallClass(484 + 64, 392, 64, 128));
        wallArray.push(new wallClass(180, 456, 64 * 2 + 100, 64));
        wallArray.push(new wallClass(484, 456, 800 - 484, 64));
        cheeseArray.push(new cheeseClass(800 - 64, 248, 64, 64));
        cheeseArray.push(new cheeseClass(800 - 64, 392, 64, 64));
        break;
    }
  }
  function randomWall() {
    wallArray.length = 0;
    edgeXArray.length = 0;
    edgeYArray.length = 0;
    __randomWall(Math.floor(Math.random() * 9));
    // __randomWall(Math.floor(6)); // 调试用
    for (let wall of wallArray) {
      // 把墙的四条边存在 edgeXArray & edgeYArray 里
      edgeXArray.push(
        new edgeXClass(wall.wallY, wall.wallX, wall.wallX + wall.wallWidth)
      );
      edgeXArray.push(
        new edgeXClass(
          wall.wallY + wall.wallLength,
          wall.wallX,
          wall.wallX + wall.wallWidth
        )
      );
      edgeYArray.push(
        new edgeYClass(wall.wallX, wall.wallY, wall.wallY + wall.wallLength)
      );
      edgeYArray.push(
        new edgeYClass(
          wall.wallX + wall.wallWidth,
          wall.wallY,
          wall.wallY + wall.wallLength
        )
      );
    }
    // 再把 canvas 的边界加进去
    edgeXArray.push(new edgeXClass(0, 0, 800));
    edgeXArray.push(new edgeXClass(600, 0, 800));
    edgeYArray.push(new edgeYClass(0, 0, 600));
    edgeYArray.push(new edgeYClass(800, 0, 600));

    // 建图
    pointAvailable.length = 0;
    pointDis.length = 0;
    pointPre.length = 0;
    for (let y = 0; y < 600; y += 5)
      for (let x = 0; x < 800; x += 5) {
        let flag = 1;
        for (let wall of wallArray) {
          if (
            x + ratWidth - ratMarginX >= wall.wallX &&
            x + ratMarginX <= wall.wallX + wall.wallWidth &&
            y + ratHeight - ratMarginY >= wall.wallY &&
            y + ratMarginY <= wall.wallY + wall.wallLength
          ) {
            flag = 0;
            break;
          }
        }
        pointAvailable.push(flag);
        pointDis.push(INF);
        pointPre.push(-1);
      }
  }

  let wallWidth = 64;
  let wallLength = 84;
  let wallFlag = 0;
  function drawWall() {
    for (let i = 0; i <= CANVAS_WIDTH; i += wallWidth) {
      if (i + wallWidth >= CANVAS_WIDTH) {
        i = CANVAS_WIDTH - wallWidth + 1;
      }
      ctx.drawImage(block[bgNumber], 0, 44, 64, 37, i, -37 + 25, 64, 37);
    }
    for (let wall of wallArray) {
      if (
        wall.wallY + wall.wallLength + wallLength - wallWidth >=
        CANVAS_HEIGHT
      ) {
        wallFlag = wall.wallLength;
        wall.wallLength = CANVAS_HEIGHT - wall.wallY - (wallLength - wallWidth);
      }
      for (
        let i = wall.wallX;
        i + wallWidth <= wall.wallX + wall.wallWidth;
        i += wallWidth
      )
        for (
          let j = wall.wallY;
          j + wallWidth <= wall.wallY + wall.wallLength;
          j += wallWidth
        )
          ctx.drawImage(tile[bgNumber], i, j);
      for (
        let j = wall.wallY;
        j + wallWidth <= wall.wallY + wall.wallLength;
        j += wallWidth
      )
        ctx.drawImage(
          tile[bgNumber],
          wall.wallX + wall.wallWidth - wallWidth,
          j
        );
      for (
        let i = wall.wallX;
        i + wallWidth <= wall.wallX + wall.wallWidth;
        i += wallWidth
      )
        ctx.drawImage(
          block[bgNumber],
          i,
          wall.wallY + wall.wallLength - wallWidth
        );
      ctx.drawImage(
        block[bgNumber],
        wall.wallX + wall.wallWidth - wallWidth,
        wall.wallY + wall.wallLength - wallWidth
      );
      if (wallFlag > 0) {
        wall.wallLength = wallFlag;
        wallFlag = 0;
      }
    }
  }
  function drawExit() {
    ctx.drawImage(hole[bgNumber], exitX, exitY, 64, 64);
  }
  // function stop() {
  //   ratX = 20;
  //   ratY = 20;
  //   speed = 5;
  // }

  function crashRat(
    dx = transDirX[ratDir] * speed,
    dy = transDirY[ratDir] * speed
  ) {
    // 判断老鼠是否撞墙
    let x0 =
      ratX +
      (ratDir == 3 || ratDir == 5 || ratDir == 7
        ? ratWidth - ratMarginX
        : ratMarginX);
    let y0 =
      ratY +
      (ratDir == 1 || ratDir == 6 || ratDir == 7
        ? ratHeight - ratMarginY
        : ratMarginY);
    let x1 = x0 + dx;
    let y1 = y0 + dy;
    if (dy != 0) {
      for (let edgeX of edgeXArray) {
        if (
          ((y0 <= edgeX.y && y1 > edgeX.y) ||
            (y0 >= edgeX.y && y1 < edgeX.y)) &&
          edgeX.x1 <= ratX + ratWidth - ratMarginX &&
          ratX + ratMarginX <= edgeX.x2
        )
          return true;
      }
    }
    if (dx != 0) {
      for (let edgeY of edgeYArray) {
        if (
          ((x0 <= edgeY.x && x1 > edgeY.x) ||
            (x0 >= edgeY.x && x1 < edgeY.x)) &&
          edgeY.y1 <= ratY + ratHeight - ratMarginY &&
          ratY + ratMarginY <= edgeY.y2
        )
          return true;
      }
    }
    return false;
  }

  function restart() {
    initCanvas();
    rightPressed = false;
    leftPressed = false;
    upPressed = false;
    downPressed = false;
    ratX = 20;
    ratY = 20;
    ratDir = 0;
    score = 0;
    speed = 3.5; // 跑太快猫根本追不上
    randomCat();
    randomWall();
    cat.actionMode = 1;
  }

  function deathCreate(state) {
    function buttonCreate() {
      restartButton.style.display = 'flex';
      menubutton.style.display = 'flex';
    }
    function recreate() {
      start1.id = 'start1';
      start2.id = 'start2';
      start1.className = 'start';
      start2.className = 'start';
      start1.innerText = '你获得了' + score + '分';
      start2.innerText = '点击下方按钮重新开始或回到主菜单';
      start1.style.display = 'flex';
      start2.style.display = 'flex';
    }
    if (state == true) {
      cancelAnimationFrame(cancel);
      let _tmpInterval = setInterval(() => {
        initCanvas();
        drawScore();
        ctx.translate(48, 130);
        ctx.scale(704 / 800, 428 / 600);
        drawExit();
        drawWall();
        drawCheese();
        drawCat('catch');
        ctx.scale(800 / 704, 600 / 428);
        ctx.translate(-48, -130);
      }, 20);
      let _interval = setInterval(() => {
        deathbackground.style.zIndex = -5;
        document.body.removeChild(canvas);
        buttonCreate();
        recreate();
        clearInterval(_interval);
        clearInterval(_tmpInterval);
      }, 2000);
    }
  }

  function gameOver() {
    if (
      ratX < cat.catX + 60 &&
      ratX > cat.catX - 60 &&
      ratY < cat.catY + 60 &&
      ratY > cat.catY - 60
    ) {
      return true;
    }
  }
  let interval;
  function underDisplay(state) {
    ctx.scale(800 / 704, 600 / 428);
    ctx.translate(-48, -130);
    if (display == 1) {
      ctx.clearRect(
        0,
        CANVAS_HEIGHT + 1,
        CANVAS_WIDTH,
        canvas.height - CANVAS_HEIGHT
      );
      clearInterval(interval);
    }
    if (state == 'bonus') {
      ctx.font = '50px Roboto';
      ctx.fillStyle = '#0095DD';
      ctx.fillText('Bonus ! ! !', 30, CANVAS_HEIGHT + 80);
      display = 1;
    } else if (state == 'find') {
      drawCat('', 30, CANVAS_HEIGHT + 80 - 64, 0);
      ctx.font = '50px Roboto';
      ctx.fillStyle = 'red';
      ctx.fillText('  : ! ! !', 30 + ratWidth, CANVAS_HEIGHT + 80);
      display = 1;
    } else if (state == 'lost') {
      drawCat('', 30, CANVAS_HEIGHT + 80 - 64, 0);
      ctx.font = '50px Roboto';
      ctx.fillStyle = 'green';
      ctx.fillText('  : ? ? ?', 30 + ratWidth, CANVAS_HEIGHT + 80);
      display = 1;
    }
    interval = setInterval(
      () => {
        ctx.clearRect(
          0,
          CANVAS_HEIGHT + 1,
          CANVAS_WIDTH,
          canvas.height - CANVAS_HEIGHT
        );
        display = 0;
        clearInterval(interval);
      },
      state == 'lost' ? 2000 : 300
    );
    ctx.translate(48, 130);
    ctx.scale(704 / 800, 428 / 600);
  }

  function keyDownHandler(e) {
    if (e.keyCode == 68) {
      rightPressed = true;
    } else if (e.keyCode == 65) {
      leftPressed = true;
    } else if (e.keyCode == 87) {
      upPressed = true;
    } else if (e.keyCode == 83) {
      downPressed = true;
    }
  }
  function keyUpHandler(e) {
    if (e.keyCode == 68) {
      rightPressed = false;
    } else if (e.keyCode == 65) {
      leftPressed = false;
    } else if (e.keyCode == 87) {
      upPressed = false;
    } else if (e.keyCode == 83) {
      downPressed = false;
    }
  }

  let ratImg = document.createElement('canvas');
  let ratCtx = ratImg.getContext('2d');
  const exactSize = 720;
  ratCtx.scale(ratWidth / exactSize, ratHeight / exactSize);
  function drawRat() {
    ratCtx.clearRect(0, 0, exactSize, exactSize); // 如果要修改图片尺寸记得修改这里
    if (ratDir == 0) {
      ratCtx.drawImage(ratBack[Math.floor(ratNumber)], 0, 0);
    } else if (ratDir == 1) {
      ratCtx.drawImage(ratFront[Math.floor(ratNumber)], 0, 0);
    } else if (ratDir == 2 || ratDir == 4 || ratDir == 6) {
      ratCtx.drawImage(ratSide[Math.floor(ratNumber)], 0, 0);
    } else {
      ratCtx.translate(exactSize, 0); // 还有这里
      ratCtx.scale(-1, 1);
      ratCtx.drawImage(ratSide[Math.floor(ratNumber)], 0, 0);
      ratCtx.scale(-1, 1);
      ratCtx.translate(-exactSize, 0);
    }
    ctx.drawImage(ratImg, ratX, ratY);
    if (leftPressed || rightPressed || upPressed || downPressed) {
      ratNumber = ratNumber + 0.1;
      if (ratNumber >= 4) ratNumber -= 4;
    }
  }
  let catImg = document.createElement('canvas');
  let catCtx = catImg.getContext('2d');
  catCtx.scale(ratWidth / exactSize, ratHeight / exactSize);
  function drawCat(state = '', x = cat.catX, y = cat.catY, inc = 0.1) {
    catCtx.clearRect(0, 0, exactSize, exactSize); // 如果要修改图片尺寸记得修改这里
    if (state == 'catch') {
      catCtx.drawImage(catCatch[Math.floor(catNumber)], 0, 0);
    } else if (cat.catDir == 0) {
      catCtx.drawImage(catBack[Math.floor(catNumber)], 0, 0);
    } else if (cat.catDir == 1) {
      catCtx.drawImage(catFront[Math.floor(catNumber)], 0, 0);
    } else if (cat.catDir == 2 || cat.catDir == 4 || cat.catDir == 6) {
      catCtx.drawImage(catSide[Math.floor(catNumber)], 0, 0);
    } else {
      catCtx.translate(exactSize, 0);
      catCtx.scale(-1, 1);
      catCtx.drawImage(catSide[Math.floor(catNumber)], 0, 0);
      catCtx.scale(-1, 1);
      catCtx.translate(-exactSize, 0);
    }
    ctx.drawImage(catImg, x, y);
    if (cat.actionMode == 1 || cat.actionMode == 2 || state == 'catch') {
      if (cat.actionMode == 2 && cat.actionMode != 'catch') inc *= 2.5;
      catNumber = catNumber + inc;
      if (catNumber >= 4) catNumber -= 4;
    }
  }
  function ratMove(d) {
    if (d == 0) {
      ratDir = 0;
      if (crashRat()) return 0;
      ratY -= speed;
      ctx.fillStyle = 'blue';
      return 1;
    } else if (d == 1) {
      ratDir = 1;
      if (crashRat()) return 0;
      ratY += speed;
      ctx.fillStyle = 'blue';
      return 1;
    } else if (d == 2) {
      ratDir = 2;
      if (crashRat()) return 0;
      ratX -= speed;
      ctx.fillStyle = 'blue';
      return 1;
    } else if (d == 3) {
      ratDir = 3;
      if (crashRat()) return 0;
      ratX += speed;
      ctx.fillStyle = 'blue'; //象征着老鼠开始跑
      return 1;
    } else if (d == 4) {
      ratDir = 4;
      if (crashRat()) return 0;
      ratY -= speed * Math.sqrt(1 / 2);
      ratX -= speed * Math.sqrt(1 / 2);
      return 1;
    } else if (d == 5) {
      ratDir = 5;
      if (crashRat()) return 0;
      ratY -= speed * Math.sqrt(1 / 2);
      ratX += speed * Math.sqrt(1 / 2);
      return 1;
    } else if (d == 6) {
      ratDir = 6;
      if (crashRat()) return 0;
      ratY += speed * Math.sqrt(1 / 2);
      ratX -= speed * Math.sqrt(1 / 2);
      return 1;
    } else if (d == 7) {
      ratDir = 7;
      if (crashRat()) return 0;
      ratY += speed * Math.sqrt(1 / 2);
      ratX += speed * Math.sqrt(1 / 2);
      return 1;
    }
  }
  const beginMoving = () => {
    if (rightPressed && upPressed == false && downPressed == false) {
      ratMove(3);
    } else if (leftPressed && upPressed == false && downPressed == false) {
      ratMove(2);
    } else if (upPressed && rightPressed == false && leftPressed == false) {
      ratMove(0);
    } else if (downPressed && rightPressed == false && leftPressed == false) {
      ratMove(1);
    }

    if (rightPressed && upPressed) {
      if (ratMove(5) == 0) {
        ratMove(3);
        ratMove(0);
      }
    }
    if (rightPressed && downPressed) {
      if (ratMove(7) == 0) {
        ratMove(3);
        ratMove(1);
      }
    }
    if (leftPressed && upPressed) {
      if (ratMove(4) == 0) {
        ratMove(0);
        ratMove(2);
      }
    }
    if (leftPressed && downPressed) {
      if (ratMove(6) == 0) {
        ratMove(2);
        ratMove(1);
      }
    }
  };
  function getCatDir(dx, dy) {
    if (dx == 0) {
      if (dy < 0) cat.catDir = 0;
      else if (dy > 0) cat.catDir = 1;
    } else if (dx < 0) {
      if (dy == 0) cat.catDir = 2;
      else if (dy < 0) cat.catDir = 4;
      else if (dy > 0) cat.catDir = 6;
    } else if (dx > 0) {
      if (dy == 0) cat.catDir = 3;
      else if (dy < 0) cat.catDir = 5;
      else if (dy > 0) cat.catDir = 7;
    }
  }
  function crashCat(
    dx = transDirX[cat.catDir] * cat.speed,
    dy = transDirY[cat.catDir] * cat.speed
  ) {
    // 判断猫猫是否撞墙
    let x0 = cat.catX + (dx > 0 ? ratWidth : 0);
    let y0 = cat.catY + (dy > 0 ? ratHeight : 0);
    let x1 = x0 + dx;
    let y1 = y0 + dy;
    if (dy != 0) {
      for (let edgeX of edgeXArray) {
        if (
          ((dy > 0 && y0 - ratMarginY <= edgeX.y && y1 > edgeX.y) ||
            (dy < 0 && y0 + ratMarginY >= edgeX.y && y1 < edgeX.y)) &&
          ((edgeX.x1 < cat.catX + ratWidth && cat.catX < edgeX.x2) ||
            (edgeX.x1 < cat.catX + dx + ratWidth && cat.catX + dx < edgeX.x2))
        ) {
          return true;
        }
      }
    }
    if (dx != 0) {
      for (let edgeY of edgeYArray) {
        if (
          ((dx > 0 && x0 - ratMarginX <= edgeY.x && x1 > edgeY.x) ||
            (dx < 0 && x0 + ratMarginX >= edgeY.x && x1 < edgeY.x)) &&
          ((edgeY.y1 < cat.catY + ratHeight && cat.catY < edgeY.y2) ||
            (edgeY.y1 < cat.catY + dy + ratHeight && cat.catY + dy < edgeY.y2))
        ) {
          return true;
        }
      }
    }
    return false;
  }
  let __id = (a, b) => {
    if (a < 0) a = 0;
    if (b < 0) b = 0;
    let ret = Math.floor(b / 5) * (800 / 5) + Math.floor(a / 5);
    if (pointAvailable[ret]) return ret;
    if (pointAvailable[ret + 1]) return ret + 1;
    if (pointAvailable[ret + 800 / 5]) return ret + 800 / 5;
    if (pointAvailable[ret + 1 + 800 / 5]) return ret + 1 + 800 / 5;
    return 'error';
  }; // 获取坐标的编号，一个方格中的坐标统一用右上角标记
  function __cross(a, b) {
    return a.x * b.y - b.x * a.y;
  }
  function cross(a, b, c) {
    let d = { x: b.x - a.x, y: b.y - a.y };
    let e = { x: c.x - a.x, y: c.y - a.y };
    return __cross(d, e);
  }
  function crossInterval(a, b, c, d) {
    return (
      cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0
    );
  }
  function __checkVision(x1, y1) {
    // 用叉积判断猫是否能看到老鼠
    let a = { x: cat.catX + ratWidth / 2, y: cat.catY + ratHeight / 2 };
    let b = { x: x1, y: y1 };
    for (let edgeX of edgeXArray) {
      let c = { x: edgeX.x1, y: edgeX.y };
      let d = { x: edgeX.x2, y: edgeX.y };
      if (crossInterval(a, b, c, d)) return false;
    }
    for (let edgeY of edgeYArray) {
      let c = { x: edgeY.x, y: edgeY.y1 };
      let d = { x: edgeY.x, y: edgeY.y2 };
      if (crossInterval(a, b, c, d)) return false;
    }
    return true;
  }
  function checkVision() {
    if (__checkVision(ratX + ratMarginX, ratY + ratMarginY)) return true;
    if (__checkVision(ratX + ratWidth - ratMarginX, ratY + ratMarginY))
      return true;
    if (__checkVision(ratX + ratMarginX, ratY + ratHeight - ratMarginY))
      return true;
    if (
      __checkVision(ratX + ratWidth - ratMarginX, ratY + ratHeight - ratMarginY)
    )
      return true;
    return false;
  }
  let __getDis = (a, b) => {
    let xa = a % (800 / 5);
    let ya = Math.floor(a / (800 / 5));
    let xb = b % (800 / 5);
    let yb = Math.floor(b / (800 / 5));
    return 5 * (Math.abs(xa - xb) + Math.abs(ya - yb));
  };
  let heap = new Heap(
    (a, b) =>
      Math.abs(pointF[a] - pointF[b]) > 1e-5
        ? pointF[a] - pointF[b]
        : pointDis[b] - pointDis[a] // 如果期望路程相同优先搜索目前走得远的，避免退化
    // (a, b) => pointF[a] - pointF[b]
  );
  let visited = new Array();
  let catRoute = new Array();
  const N = (800 * 600) / 5 / 5;
  const NN = 30;
  visited.length = N;
  function findWay(t, s) {
    // 这是一个 A* 寻路
    // alert(`A* from ${s} to ${t} ${pointAvailable[t]}`);
    if (catRoute.length != 0) s = catRoute[Math.min(NN, catRoute.length / 3)];
    for (let i = 0; i < N; i++) {
      pointDis[i] = INF;
      pointF[i] = INF;
      visited[i] = 0;
      pointPre[i] = -1;
    }
    while (!heap.empty()) heap.pop();
    heap.push(s);
    pointDis[s] = 0;
    pointF[s] = 0;
    while (!heap.empty()) {
      let u = heap.pop();
      let y = Math.floor(u / (800 / 5));
      let x = u % (800 / 5);
      if (u == t) break;
      if (visited[u]) continue;
      visited[u] = 1;
      // alert(`(${x}, ${y}) ${u} ${pointDis[u]}`);
      // ctx.fillStyle = "black";
      // ctx.beginPath();
      // ctx.rect(x * 5, y * 5, 1, 1);
      // ctx.fill();
      // ctx.closePath();
      for (let i = 0; i < 8; i++) {
        let xx = x + transDirX[i];
        let yy = y + transDirY[i];
        let del = i < 4 ? 1 : Math.sqrt(2);
        // console.log(`(${x}, ${y})${u}->(${xx}, ${yy})${id}`);
        if (xx < 0 || xx >= 800 / 5 || yy < 0 || yy >= 600 / 5) continue;
        let id = __id(xx * 5, yy * 5);
        if (!pointAvailable[id] || visited[id]) continue;
        if (pointDis[id] > pointDis[u] + del) {
          pointDis[id] = pointDis[u] + del;
          pointF[id] = pointDis[id] + __getDis(id, t);
          pointPre[id] = u;
          heap.push(id);
        }
      }
    }
    if (pointPre[t] == -1) {
      // alert('error');
      return 0;
    }
    if (catRoute.length == 0) {
      catRoute.length = 0;
      for (let i = t; i != s; i = pointPre[i]) {
        catRoute.push(i);
      }
      catRoute.push(s);
    } else {
      let tmp = new Array();
      for (let i = t; i != s; i = pointPre[i]) {
        tmp.push(i);
      }
      catRoute.splice(0, Math.min(NN, catRoute.length / 3));
      catRoute = tmp.concat(catRoute);
    }
    // alert(catRoute);
  }
  function __nextPoint() {
    if (catRoute.length == 0) return;
    let u = catRoute.pop();
    let ny = (u / (800 / 5)) * 5;
    let nx = (u % (800 / 5)) * 5;
    getCatDir(nx - cat.catX, ny - cat.catY);
    cat.catX = nx;
    cat.catY = ny;
    // alert(u);
  }
  async function catMoving() {
    if (cat.actionMode == 1) {
      if (checkVision()) {
        underDisplay('find');
        cat.actionMode = 2;
        cat.speed = 5;
        cat.targetX = ratX;
        cat.targetY = ratY;
        // alert(`(${cat.catX}, ${cat.catY}), (${cat.targetX}, ${cat.targetY})`);
        findWay(__id(cat.targetX, cat.targetY), __id(cat.catX, cat.catY));
        // alert('done!');
        return 0;
      } else if (crashCat() || Math.random() < 0.001) {
        cat.catDir = Math.floor(Math.random() * 4);
      } else {
        cat.catX += transDirX[cat.catDir] * cat.speed;
        cat.catY += transDirY[cat.catDir] * cat.speed;
      }
    } else if (cat.actionMode == 2) {
      if (checkVision()) {
        cat.targetX = ratX;
        cat.targetY = ratY;
        findWay(__id(cat.targetX, cat.targetY), __id(cat.catX, cat.catY));
      }
      __nextPoint();
      if (
        (Math.abs(cat.catX - cat.targetX) <= 5 &&
          Math.abs(cat.catY - cat.targetY) <= 5) ||
        catRoute.length == 0
      ) {
        underDisplay('lost');
        catRoute.length = 0;
        cat.actionMode = 4;
        cat.hesitate = 140;
        cat.speed = 2;
        return 0;
      }
    } else if (cat.actionMode == 4) {
      if (cat.hesitate == 0) {
        cat.actionMode = 1;
        cat.speed = 2;
        return 0;
      }
      cat.hesitate--;
      if (checkVision()) {
        underDisplay('find');
        cat.actionMode = 2;
        cat.speed = 5;
        cat.targetX = ratX;
        cat.targetY = ratY;
        findWay(__id(cat.targetX, cat.targetY), __id(cat.catX, cat.catY));
        return 0;
      }
      if (cat.hesitate % 60 == 0) cat.catDir = Math.floor(Math.random() * 4);
    }
  }
  function nextRound() {
    if (ratX > exitX - 20 && ratY > exitY - 20) {
      bgNumber = Math.floor(Math.random() * 2);
      initCanvas();
      ratX = 0;
      ratY = 0;
      score += 1;
      if (Math.floor((new Date().getTime() - beginTime) / 1000) <= 10) {
        score += 2;
        underDisplay('bonus');
      }
      randomCat();
      edgeXArray.splice(0, edgeXArray.length);
      edgeYArray.splice(0, edgeYArray.length);
      catRoute.length = 0;
      beginTime = new Date().getTime();
      randomWall();
      cat.actionMode = 1;
    }
  }
  function drawScore() {
    ctx.drawImage(cheeses, 630, 20);
    ctx.font = '20px Roboto';
    ctx.fillStyle = bgNumber == 0 ? 'white' : 'black';
    ctx.fillText('Score: ' + score, 700, 40);
    ctx.fillText(
      'Time: ' + Math.floor((new Date().getTime() - beginTime) / 1000),
      700,
      80
    );
  }
  const initCanvas = () => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT + 20);
    ctx.drawImage(background[bgNumber], 0, 0);
  };

  function draw() {
    initCanvas();
    // drawAroundWall();
    ctx.translate(48, 130);
    ctx.scale(704 / 800, 428 / 600);
    drawExit();
    drawWall();
    beginMoving();
    drawRat();
    catMoving();
    drawCat();
    drawCheese();
    eatCheese();
    nextRound();
    ctx.scale(800 / 704, 600 / 428);
    ctx.translate(-48, -130);
    drawScore();
    cancel = requestAnimationFrame(draw);
    a = gameOver();
    deathCreate(a);
  }
  await loadImages(); // 加载图片
  randomWall();
  randomCat();
  draw();
}
