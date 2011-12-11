(function() {
     function bind(scope, method) {
	 return function() {
	     method.apply(scope, arguments);
	 };
     }

     function log(message) {
	 self.postMessage({log: [message]});
     }

     function moveCoordBounce(coord, delta, min, max) {
	 var newCoord = coord + delta;
	 var newDelta = delta;
	 if (newCoord < min || newCoord > max) {
	     newCoord = coord - delta;
	     newDelta = -delta;
	 }
	 return [newCoord, newDelta];
     }

     var randomThreshold = 0.995;
     var maxDelta = 10;

     function Point(x, y) {
	 this.x = x;
	 this.y = y;
     }

     Point.prototype = {
	 x: 0,
	 y: 0,
     };

     function MovingPoint(x, y, speedX, speedY) {
	 Point.call(this, x, y);
	 this.speed = new Point(speedX, speedY);
     }

     MovingPoint.prototype = {
	 __proto__: Point.prototype,
	 speed: null,
	 move: function(width, height) {
	     if (Math.random() > randomThreshold)
		 this.speed.x = maxDelta * (Math.random() * 2.0 - 1.0);
	     var result = moveCoordBounce(this.x, this.speed.x, 0, width);
	     this.x = result[0];
	     this.speed.x = result[1];
	     if (Math.random() > randomThreshold)
		 this.speed.y = maxDelta * (Math.random() * 2.0 - 1.0);
	     result = moveCoordBounce(this.y, this.speed.y, 0, height);
	     this.y = result[0];
	     this.speed.y = result[1];
	 },
	 upgradePoint: function(speedX, speedY) {
	     this.__proto__ = MovingPoint.prototype;
	     this.speed = new Point(speedX, speedY);
	 },
     };

     function Color(r, g, b) {
	 this.r = r;
	 this.g = g;
	 this.b = b;
     }

     function colorValueToHex(colorValue) {
	 var num = new Number(colorValue);
	 var hex = num.toString(16);
	 if (hex.length == 1)
	     hex = '0' + hex;
	 return hex;
     }

     Color.prototype = {
	 r: 0,
	 g: 0,
	 b: 0,
	 getStyle: function() {
	     return '#' +
		 colorValueToHex(this.r) +
		 colorValueToHex(this.g) +
		 colorValueToHex(this.b);
	 },
     };

     function MovingColor(r, g, b, speedR, speedG, speedB) {
	 Color.call(this, r, g, b);
	 this.speed = new Color(speedR, speedG, speedB);
     }

     MovingColor.prototype = {
	 __proto__: Color.prototype,
	 speed: null,
	 move: function() {
	     if (Math.random() > randomThreshold)
		 this.speed.r = Math.round(maxDelta * (Math.random() * 2.0 - 1.0));
	     var result = moveCoordBounce(this.r, this.speed.r, 0, 255);
	     this.r = result[0];
	     this.speed.r = result[1];
	     if (Math.random() > randomThreshold)
		 this.speed.g = Math.round(maxDelta * (Math.random() * 2.0 - 1.0));
	     result = moveCoordBounce(this.g, this.speed.g, 0, 255);
	     this.g = result[0];
	     this.speed.g = result[1];
	     if (Math.random() > randomThreshold)
		 this.speed.b = Math.round(maxDelta * (Math.random() * 2.0 - 1.0));
	     result = moveCoordBounce(this.b, this.speed.b, 0, 255);
	     this.b = result[0];
	     this.speed.b = result[1];
	 },
	 upgradeColor: function(speedR, speedG, speedB) {
	     this.__proto__ = MovingColor.prototype;
	     this.speed = new Color(speedR, speedG, speedB);
	 },
     };

     function Line(x1, y1, x2, y2, color) {
	 this.begin = new Point(x1, y1);
	 this.end = new Point(x2, y2);
	 this.color = color;
     }

     Line.prototype = {
	 begin: null,
	 end: null,
	 color: null,
     };

     function MovingLine(x1, y1, speedX1, speedY1,
			 x2, y2, speedX2, speedY2,
			 color, colorSpeedR, colorSpeedG, colorSpeedB) {
	 Line.call(this, x1, y1, x2, y2, color);
	 MovingPoint.prototype.upgradePoint.call(this.begin, speedX1, speedX2);
	 MovingPoint.prototype.upgradePoint.call(this.end, speedX1, speedY2);
	 MovingColor.prototype.upgradeColor.call(this.color, colorSpeedR, colorSpeedG, colorSpeedB);
     }

     MovingLine.prototype = {
	 __proto__: Line.prototype,
	 move: function(width, height) {
	     this.begin.move(width, height);
	     this.end.move(width, height);
	     this.color.move();
	 },
	 getLine: function() {
	     return new Line(this.begin.x, this.begin.y,
			     this.end.x, this.end.y,
			     this.color);
	 },
     };

     function Engine () {
	 this.movingLine = new MovingLine(100, 100, 3, 0,
					  90, 110, -3, -1,
					  new Color(255, 10, 10), 1, 2, 3);
	 this.lines = [];
	 this.boundRun = bind(this, this.run);
	 this.boundHandleMessage = bind(this, this.handleMessage);
	 addEventListener('message', this.boundHandleMessage);
     }

     Engine.prototype = {
	 movingLine: null,
	 lines: null,
	 maxLines: 50,
	 t: null,
	 boundHandleMessage: null,
	 handleMessage: function(e) {
	     var data = e.data;
	     switch(data.cmd) {
		 case 'setSize':
		 this.width = data.width;
		 this.height = data.height;
		 break;
		 case 'start':
		 if (!this.t)
		     this.run();
		 break;
		 case 'stop':
		 if (this.t) {
		     clearTimeout(this.t);
		     this.t = null;
		 }
		 break;
	     }
	 },
	 boundRun: null,
	 run: function() {
	     this.t = setTimeout(this.boundRun, 20);
	     var line = this.movingLine.getLine();
	     this.movingLine.move(this.width, this.height);
	     this.lines.push(line);
	     var message = {
		 drawLine: [
		 line.begin.x,
		     line.begin.y,
		     line.end.x,
		     line.end.y,
		     line.color.getStyle(),
		 ],
	     };
	     if (this.lines.length >= this.maxLines) {
		 var eraseLine = this.lines.shift();
		 message.eraseLine = [
		     eraseLine.begin.x,
		     eraseLine.begin.y,
		     eraseLine.end.x,
		     eraseLine.end.y,
		 ];
	     }
	     self.postMessage(message);
	 },
     };

     self.engine = new Engine();
 })();
