let particles = [];
let colors = ['#f71735', '#f7d002', '#1A53C0', '#00A676', '#4E2A84', '#F7981D', '#FFFFFF'];
let sideMenu; // 用於存放選單的 DOM 元素
const menuWidth = 350; // 選單寬度，應與 CSS 中的 width 一致
let iframeContainer;
let contentIframe;
let iframeCloseBtn;
let linkWork;
let linkNotes;
let linkQuiz;
let quizContainer;
let quizCloseBtn;
let quizNextBtn;
let currentQuizStep = 0;
let totalQuestions = 3;
let score = 0;
let questionOrder = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
	// 透過 p5.js 的 select() 函數選取 HTML 中的選單元素
	sideMenu = select('#side-menu');

	// 選取 Iframe 相關元素
	iframeContainer = select('#iframe-container');
	contentIframe = select('#content-iframe');
	iframeCloseBtn = select('#iframe-close-btn');
	linkWork = select('#link-work');
	linkNotes = select('#link-notes');
	linkQuiz = select('#link-quiz');
	quizContainer = select('#quiz-container');
	quizCloseBtn = select('#quiz-close-btn');
	quizNextBtn = select('#quiz-next-btn');

	// 綁定點擊事件
	linkWork.mousePressed(function() {
		showIframe('https://terry164.github.io/9/');
	});

	linkNotes.mousePressed(function() {
		showIframe('https://hackmd.io/DPf1tY3-SMiKX5CnYtUsPQ');
	});

	iframeCloseBtn.mousePressed(hideIframe);

	linkQuiz.mousePressed(showQuiz);
	quizCloseBtn.mousePressed(closeQuiz);
	quizNextBtn.mousePressed(nextQuestion);

	setupQuizHandlers();
}

function draw() {
	// 使用帶有透明度的背景，製造拖影效果
	background('rgba(35, 35, 35, 0.25)'); 

	// 在滑鼠位置產生新的粒子
	for (let i = 0; i < 5; i++) {
		let p = new Particle(mouseX, mouseY);
		particles.push(p);
	}

	// 更新並顯示所有粒子，並移除生命週期結束的粒子
	for (let i = particles.length - 1; i >= 0; i--) {
		particles[i].run();
		if (particles[i].isDead()) {
			particles.splice(i, 1);
		}
	}
}

function showIframe(url) {
	contentIframe.attribute('src', url);
	iframeContainer.removeClass('hidden');
	noLoop(); // 暫停 p5.js 動畫
}

function hideIframe() {
	contentIframe.attribute('src', '');
	iframeContainer.addClass('hidden');
	loop(); // 恢復 p5.js 動畫
}

function showQuiz() {
	resetQuiz();
	quizContainer.removeClass('hidden');
	noLoop(); // 暫停 p5.js 動畫
}

function closeQuiz() {
	quizContainer.addClass('hidden');
	loop(); // 恢復 p5.js 動畫
}

function resetQuiz() {
	// 建立並打亂題目順序
	questionOrder = [];
	for (let i = 1; i <= totalQuestions; i++) {
		questionOrder.push(i);
	}
	questionOrder = shuffle(questionOrder); // p5.js 的 shuffle 函式

	currentQuizStep = 0;
	score = 0;

	// 顯示第一題，隱藏其他
	for (let i = 1; i <= totalQuestions; i++) {
		const qDiv = select(`.quiz-question[data-question="${i}"]`);
		qDiv.addClass('hidden');
		// 清除之前的結果
		const labels = selectAll(`.quiz-question[data-question="${i}"] label`);
		labels.forEach(l => {
			l.removeClass('correct');
			l.removeClass('incorrect');
		});
		const radios = selectAll(`input[name="q${i}"]`);
		radios.forEach(r => {
			r.removeAttribute('disabled');
			r.elt.checked = false;
		});
	}
	// 顯示隨機順序中的第一題
	const firstQuestionNum = questionOrder[currentQuizStep];
	select(`.quiz-question[data-question="${firstQuestionNum}"]`).removeClass('hidden');

	quizNextBtn.addClass('hidden');
	quizNextBtn.html('下一題');
	select('#quiz-result').html('');
}

function setupQuizHandlers() {
	const answers = {
		q1: 'b',
		q2: 'd',
		q3: 'b'
	};

	for (let i = 1; i <= totalQuestions; i++) {
		const radios = selectAll(`input[name="q${i}"]`);
		radios.forEach(radio => {
			radio.mouseClicked(() => {
				const questionNum = radio.attribute('name');
				const selectedValue = radio.value();
				const correctValue = answers[questionNum];
				const allLabels = selectAll(`.quiz-question[data-question="${i}"] label`);
				const selectedLabel = radio.parent();

				// 移除所有選項的 'incorrect' 狀態，以便重新嘗試
				allLabels.forEach(l => l.removeClass('incorrect'));

				if (selectedValue === correctValue) {
					// 答對了
					selectedLabel.addClass('correct');
					score++;

					// 禁用所有選項並顯示下一題按鈕
					radios.forEach(r => r.attribute('disabled', ''));
					quizNextBtn.removeClass('hidden');
					if (currentQuizStep === totalQuestions - 1) {
						quizNextBtn.html('查看結果');
					}
				} else {
					// 答錯了，閃爍紅色提示
					selectedLabel.addClass('incorrect');
					radio.elt.checked = false; // 清除選擇
				}
			});
		});
	}
}

function nextQuestion() {
	// 隱藏目前題目
	const currentQuestionNum = questionOrder[currentQuizStep];
	select(`.quiz-question[data-question="${currentQuestionNum}"]`).addClass('hidden');

	currentQuizStep++;
	if (currentQuizStep < totalQuestions) {
		// 顯示下一題
		const nextQuestionNum = questionOrder[currentQuizStep];
		select(`.quiz-question[data-question="${nextQuestionNum}"]`).removeClass('hidden');
		quizNextBtn.addClass('hidden');
	} else {
		quizNextBtn.addClass('hidden');
		select('#quiz-result').html(`測驗結束！您總共答對了 ${score} / ${totalQuestions} 題！`);
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function easeInOutExpo(x) {
	return x === 0 ? 0 :
		x === 1 ?
		1 :
		x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 :
		(2 - Math.pow(2, -20 * x + 10)) / 2;
}

class Particle {
	constructor(x, y) {
		this.position = createVector(x, y);
		this.velocity = p5.Vector.random2D().mult(random(1, 6)); // 隨機方向和速度
		this.acceleration = createVector(0, 0.1); // 輕微的重力效果
		this.lifespan = 255; // 生命週期
		this.color = random(colors);
		this.size = random(3, 12);
	}

	run() {
		this.update();
		this.display();
	}

	update() {
		this.velocity.add(this.acceleration);
		this.position.add(this.velocity);
		this.lifespan -= 2.5; // 生命流逝速度
	}

	display() {
		noStroke();
		// 隨著生命流逝，粒子會變透明
		let c = color(this.color);
		fill(red(c), green(c), blue(c), this.lifespan);
		ellipse(this.position.x, this.position.y, this.size);
	}

	// 檢查粒子生命是否結束
	isDead() {
		return this.lifespan < 0;
	}
}