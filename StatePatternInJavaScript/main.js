// Stopwatch类 状态机
class Stopwatch {
	constructor() {
		this.button1 = null;
		this.button2 = null;

		// JavaScript 版本的状态机
		this.FSM = {
			/****** 状态对应的逻辑行为 ******/
			// btn1无效 / btn2复位 >> 开始
			reset: {
				clickHandler1() {
					// 复位状态下计次按钮无效
				},
				clickHandler2() {
					console.log('初始状态下点击启动, 切换为启动状态');

					if(timer.count === 0) {
						timer.count = 1;
						this.insertLap();
					}
					// 行为
					timer.startTimer();

					// 切换状态
					this.currState = this.FSM.start;

					// 样式
					this.setStyle('startState');
				}
			},
			// bnt1计次 / btn2开始 >> 暂停
			start: {
				clickHandler1() {
					console.log('启动状态下点击计次, 不切换状态');

					// 行为
					this.insertLap();

					timer.timeAccumulationContainer.push(timer.timeAccumulation);
					timer.s += timer.timeAccumulationContainer[timer.count - 1];
					timer.timeAccumulation = 0;
					timer.count++;

					// 状态不改变

					// 样式不改变
				},
				clickHandler2() {
					console.log('启动状态下点击暂停, 切换为暂停状态');

					// 行为
					timer.stopTimer();

					// 切换状态
					this.currState = this.FSM.pause;

					// 样式
					this.setStyle('pauseState');
				}
			},
			// btn1暂停 >> 重置 / btn2暂停 >> 开始
			pause: {
				clickHandler1() {
					console.log('暂停状态下点击复位, 切换为初始状态');

					// 行为
					timer.reset();

					// 切换状态
					this.currState = this.FSM.reset;

					// 样式
					this.setStyle('resetState');
				},
				clickHandler2() {
					console.log('暂停状态下点击启动, 切换为启动状态');

					// 行为
					timer.startTimer();

					// 状态
					this.currState = this.FSM.start;

					// 样式
					this.setStyle('startState');
				}
			}
		};

		this.currState = this.FSM.reset; // 设置当前状态
	}

	/****** 创建DOM节点, 绑定事件 ******/
	init() {
		this.dom = document.createElement('div');
		this.dom.setAttribute('id', 'stopwatch');
		this.dom.innerHTML = `
			<div class="header">stopwatch</div>
		    <div class="main">
				<!-- 时间显示部分 -->
				<div class="display" >00:00.00</div> 
				<!-- 控制部分 -->
				<div class="ctrl">
					<button type="button" id='btnOne' disabled='disabled'>计次</button> <!--class="active"-->
					<button type="button" id='btnTwo'>启动</button>  <!--class="stop"-->
				</div>
				<!-- 显示计次(时间间隔) -->
				<ol class="lap">
				</ol>
			</div>`;

		document.body.appendChild(this.dom);
		this.button1 = this.dom.querySelector('#btnOne');
		this.button2 = this.dom.querySelector('#btnTwo');
		this.display = this.dom.querySelector('.display'); // 总时间显示
		this.lap     = this.dom.querySelector('.lap');     // 计次显示

		this.bindEvent();

		Stopwatch.addStopwatchListener(t => {
			this.displayTotalTime(t);
		});
		Stopwatch.addStopwatchListener(t => {
			this.displayLapTime(t);
		})
	}

	// 通过 call 方法直接把请求委托给某个字面量对象(FSM)来执行
	bindEvent() {
		this.button1.addEventListener('click', () => {
			this.currState.clickHandler1.call(this); // 把请求委托给FSM 状态机
		}, false);
		this.button2.addEventListener('click', () => {
			this.currState.clickHandler2.call(this);
		}, false);
	}

	/****** 辅助方法 ******/
	// 总时间显示(从启动到当前时刻的累积时间)
	displayTotalTime() {
		let totaltimeAccumulation = timer.timeAccumulation * 10  + timer.s * 10;
		this.display.innerHTML = `${Timer.milSecond_to_time(totaltimeAccumulation)}`;
	}
	// 计次条目显示
	displayLapTime() {
		let li = this.lap.querySelector('li'),
			spans = li.querySelectorAll('span'),
			task = spans[0], time = spans[1];

		task.innerHTML = `计次${timer.count}`;
		time.innerHTML = `${Timer.milSecond_to_time(timer.timeAccumulation * 10)}`;
	}

	// 设置样式
	setStyle(newState) {
		if(newState === 'startState') {
			let button1 = this.button1;
			button1.disabled = '';
			button1.innerHTML = '计次';
			button1.className = 'active';

			let button2 = this.button2;
			button2.innerHTML = '停止';
			button2.className = 'stop';
		} else if (newState === 'pauseState') {
			this.button1.innerHTML = '复位';

			let button2 = this.button2;
			button2.innerHTML = '启动';
			button2.className = 'start';
		} else if (newState === 'resetState') {
			let button1 = this.button1;
			button1.disabled = 'disabled';
			button1.innerHTML = '计次';
			button1.className = '';

			this.display.innerHTML = '00:00.00';
			this.lap.innerHTML = '';
		}
	}

	// 插入一个计次
	insertLap() {
		let t = Stopwatch.templateLap();
		this.lap.insertAdjacentHTML('afterbegin', t);
	}
	static templateLap() {
		return  `
        <li><span></span><span></span></li>
        `;
	}

	// 将函数推入回调队列
	static addStopwatchListener(handler) {
		timer.stopwatchHandlers.push(handler);
	}
}

// 时间机器(时间插件)
class Timer {
	constructor() {
		// 计时器
		this.stopwathchTimer = null;
		this.count = 0; // 计次的次数
		this.timeAccumulation = 0; // 累积时长
		this.timeAccumulationContainer = []; // 存放已经结束的计次的容器
		this.s = 0; // 已经结束的所有计次累积时间
		this.stopwatchHandlers = []; // 用于startTimer里回调队列
	}

	reset() {
		// 重置
		this.stopwathchTimer = null;
		this.count = 0;
		this.timeAccumulation = 0;
		this.timeAccumulationContainer = [];
		this.s = 0;
	}

	startTimer() {
		this.stopTimer();
		this.stopwathchTimer = setInterval(() => {
			this.timeAccumulation++; // 注意时间累积量 _timeAccumulation 是厘秒级别的(由于显示的是两位)
			this.stopwatchHandlers.forEach(handler => {
				handler(this.timeAccumulation);
			})
		}, 1000 / 100)
	}

	stopTimer() {
		clearInterval(this.stopwathchTimer );
	}

	// 将时间累积量转化成时间
	static milSecond_to_time(t) {
		let time,
			minute = Timer.addZero(Math.floor(t / 60000) % 60),     // 分
			second = Timer.addZero(Math.floor(t / 1000) % 60),      // 秒
			centisecond = Timer.addZero(Math.floor(t / 10) % 100) ; // 厘秒(百分之一秒)
		time = `${minute}:${second}.${centisecond}`;
		return time;
	}
	// 修饰器；加零
	static addZero(t) {
		t = t < 10 ? '0' + t : t;
		return t;
	}
}
const timer = new Timer();

// 测试
const stopwatchObj = new Stopwatch();

stopwatchObj.init();
