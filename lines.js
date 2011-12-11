function $(id) {
    return document.getElementById(id);
}

function LinesCanvas(startButton, stopButton) {
    var el = document.createElement('canvas');
    el.width = 1200;
    el.height = 800;
    el.__proto__ = LinesCanvas.prototype;
    el.ctx_ = el.getContext('2d');
    el.classList.add('lines-canvas');
    el.worker_ = new Worker('lineWorker.js');
    el.worker_.postMessage({cmd: 'setSize', width: el.width, height: el.height});
    el.worker_.addEventListener('message', function(e) {
				    el.handleMessage.call(el, e);
				});
    startButton.addEventListener('click', function(e) {
				     el.handleStart.call(el, e);
				 });
    stopButton.addEventListener('click', function(e) {
				    el.handleStop.call(el, e);
				});
    return el;
}

LinesCanvas.prototype = {
    __proto__: HTMLCanvasElement.prototype,
    ctx_: null,
    worker_: null,
    handleStart: function(e) {
	this.worker_.postMessage({cmd: 'start'});
    },
    handleStop: function(e) {
	this.worker_.postMessage({cmd: 'stop'});
    },
    eraseLine: function(x1, y1, x2, y2) {
	var ctx = this.ctx_;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.strokeStyle = '#ffffff';
	ctx.lineWidth = 2;
	ctx.stroke();
    },
    drawLine: function(x1, y1, x2, y2, strokeStyle) {
	var ctx = this.ctx_;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.strokeStyle = strokeStyle;
	ctx.lineWidth = 1;
	ctx.stroke();
    },
    handleMessage: function(e) {
	for(var cmd in e.data) {
	    this[cmd].apply(this, e.data[cmd]);
	}
    },
    log: function(message) {
	console.log.apply(console, arguments);
    },
    alertMe: function() {
	alert(this);
    }
};

(function() {
     function load() {
	 var lines = $('lines');
	 var startButton = $('start-button');
	 var stopButton = $('stop-button');
	 var canvas = new LinesCanvas(startButton, stopButton);
	 lines.appendChild(canvas);
     }
     document.addEventListener('DOMContentLoaded', load);
 })();
