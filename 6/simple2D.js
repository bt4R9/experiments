;(function() {

	var getID = (function() {
		var id = 0;
		return function() {
			return id++;
		}
	}());

	var S2D = {};

	S2D.Point = function(x, y) {
		this.x = x || 0;
		this.y = y || 0; 
	};
	S2D.Point.prototype = {
		distanceTo: function(point) {
			var x = this.x - point.x;
			var y = this.y - point.y;
			return Math.sqrt(x * x + y * y);
		},
		add: function(x, y) {
			this.x += x;
			this.y += y;
		},
		set: function(x, y) {
			this.x = x;
			this.y = y;
		},
		toVector: function() {
			return new S2D.Vector(this.x, this.y);
		}
	};

	S2D.Vector = function(x, y) {
		this.x = x;
		this.y = y;
	};
	S2D.Vector.prototype = {
		length: function() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		},
		add: function(vector) {
			this.x += vector.x;
			this.y += vector.y;
		},
		normalize: function() {
			var length = this.length();
			if (this.x !== 0 && this.y !== 0) {
				this.x /= length;
				this.y /= length;
			}
		},
		multiply: function(vector) {
			return this.x * vector.x + this.y * vector.y;
		},
		to: function(vector) {
			var x = this.x - vector.x;
			var y = this.y - vector.y;
			return new S2D.Vector(x, y);
		},
		angle: function(vector) {
			var p1 = this;
			var p2 = vector;
			return Math.acos((p1.x * p2.x + p1.y * p2.y) / (Math.sqrt(p1.x * p1.x + p1.y * p1.y) * Math.sqrt(p2.x * p2.x + p2.y * p2.y)));
		},
		getNormal: function() {
			var x = this.x;
			var y = this.y;
			return new S2D.Vector(x, -y);
		},
		project: function(vector) {
			var multiply = this.multiply(vector);
			var x = vector.x;
			var y = vector.y;
			var squareLength = x * x + y * y;
			var newX = multiply / squareLength * x;
			var newY = multiply / squareLength * y;
			return new S2D.Vector(newX, newY);
		},
		toLine: function(origin) {
			var oX = origin.x;
			var oY = origin.y;
			var x = this.x;
			var y = this.y;
			return new S2D.Line(new S2D.Point(oX, oY), new S2D.Point(x, y));
		},
		reverse: function() {
			this.x *= -1;
			this.y *= -1;
		}
	};

	S2D.Line = function(point1, point2) {
		this.point1 = point1 || new S2D.Point();
		this.point2 = point2 || new S2D.Point();
	};
	S2D.Line.prototype = {
		length: function() {
			var p1 = this.point1;
			var p2 = this.point2;
			var x = p2.x - p1.x;
			var y = p2.y - p1.y;
			return Math.sqrt(x * x + y * y);
		},
		intersection: function(line) {
			var line1 = this;
			var line2 = line;
			var minX = Math.min(line1.point1.x, line1.point2.x, line2.point1.x, line2.point2.x);
			var maxX = Math.max(line1.point1.x, line1.point2.x, line2.point1.x, line2.point2.x);
			var minY = Math.min(line1.point1.y, line1.point2.y, line2.point1.y, line2.point2.y);
			var maxY = Math.max(line1.point1.y, line1.point2.y, line2.point1.y, line2.point2.y);
			var intersectionLine = new S2D.Line(new S2D.Point(minX, minY), new S2D.Point(maxX, maxY));
		}
	};

	S2D.Geometry = function(points) {
		this.points = [];
		this._points = [];
		this.rotation = 0;
		for (var i = 0, l = points.length; i < l; i++) {
			var p = points[i];
			this.points.push(new S2D.Point(p[0], p[1]));
			this._points.push(new S2D.Point(p[0], p[1]));
		}
		this._shift = new S2D.Point(0, 0);
		this._center = this.getCenter();
	};
	S2D.Geometry.prototype = {
		getCenter: function() {
			var minL = Number.POSITIVE_INFINITY;
			var maxR = Number.NEGATIVE_INFINITY;
			var minT = Number.POSITIVE_INFINITY;
			var maxB = Number.NEGATIVE_INFINITY;
			var points = this.points;
			var length = points.length;
			for (var i = 0; i < length; i++) {
				var point = points[i];
				if (point.x < minL) {
					minL = point.x;
				}
				if (point.x > maxR) {
					maxR = point.x;
				}
				if (point.y < minT) {
					minT = point.y;
				}
				if (point.y > maxB) {
					maxB = point.y;
				}
			}
			return new S2D.Point((maxR + minL)/2, (minT + maxB)/2);
		},
		rotate: function(center) {
			var rotation = this.rotation;
			var points = this.points;
			var _points = this._points;
			var shift = this._shift;
			var center = center || this._center;
			var centerX = center.x;
			var centerY = center.y;

			var cosA = Math.cos(rotation);
			var sinA = Math.sin(rotation);
			for (var i = 0, l = points.length; i < l; i++) {
				var point = points[i];
				var _point = _points[i];
				var x = _point.x + shift.x;
				var y = _point.y + shift.y;

				point.x = centerX + (x - centerX) * cosA - (y - centerY) * sinA;
				point.y = centerY + (y - centerY) * cosA + (x - centerX) * sinA;
			}

		},
		moveBy: function(vector, speed) {
			speed = speed || 1;
			var X = vector.x * speed;
			var Y = vector.y * speed;
			this._shift.add(X, Y);
			this._center.add(X, Y);
			var shiftX = this._shift.x;
			var shiftY = this._shift.y;
			var points = this.points;
			var _points = this._points;
			for (var i = 0, l = points.length; i < l; i++) {
				var point = points[i];
				var _point = _points[i];
				var newX = _point.x + shiftX;
				var newY = _point.y + shiftY;
				point.set(newX, newY);
			}
		},
		toLines: function() {
			var points = this.points;
			var len = points.length;
			var lines = [];
			for (var i = 0; i < len - 1; i++) {
				var p1 = points[i];
				var p2 = points[i + 1];
				lines.push(new S2D.Line(p1, p2));
			}
			lines.push(new S2D.Line(points[len - 1], points[0]));
			return lines;
		}
	};

	S2D.Shape = function(geometry, vector, speed, style) {
		this.geometry = geometry;
		this.vector = vector;
		this.vector.normalize();
		this.speed = speed || 1;

		var styleDefaults = {
			lineWidth: 1,
			color: '#FF0000'
		};

		style = style || {};
		for (var key in styleDefaults) {
			this[key] = style[key] || styleDefaults[key];
		}

		this.rotation = 0;
		this.__id = getID();
	};

	S2D.Shape.prototype = {
		addVector: function(vector) {
			this.vector.add(vector);
		},
		update: function() {
			this.geometry.rotation = this.rotation;
			this.geometry.moveBy(this.vector, this.speed);
			this.geometry.rotate();
		}
	};

	S2D.World = function(ctx) {
		this.ctx = document.getElementById(ctx).getContext('2d');
		this.shapes = [];
	};
	S2D.World.prototype = {
		add: function(shape) {
			this.shapes.push(shape);
		},
		remove: function(shape) {
			var id = shape.__id;
			var pos = null;
			var shapes = this.shapes;
			for (var i = 0, l = shapes.length; i < l; i++) {
				var _shape = shapes[i];
				if (_shape.__id === id) {
					pos = i;
					break;
				}
			}
			if (pos) {
				this.shapes.splice(pos, 1);
			}
		},
		update: function() {
			var shapes = this.shapes;
			for (var i = 0, l = shapes.length; i < l; i++) {
				var shape = shapes[i];
				shape.update();
			}
		},
		collision: function() {
			var shapes = this.shapes;
			var l = shapes.length;

			for (var i = 0; i < l; i++) {
				for (var j = 0; j < l; j++) {
					var s1 = shapes[i];
					var s2 = shapes[j];
					if (s1.__id !== s2.__id) {
						
					}
				}
			}
		},
		checkCollision: function(lines1, lines2) {

		},
		draw: function() {
			var ctx = this.ctx;
			ctx.clearRect(0, 0, document.width, document.height);
			ctx.width = ctx.width;
			var shapes = this.shapes;
			for (var i = 0, l = shapes.length; i < l; i++) {
				var shape = shapes[i];
				var color = shape.color;
				var geometry = shape.geometry;
				var points = geometry.points;
				var length = points.length;
				var origin = points[0];
				var end = points[length - 1];

				ctx.beginPath();
				ctx.lineWidth = shape.lineWidth;

				for (var j = 0; j < length; j++) {
					if (j !== length - 1) {
						var pointFrom = points[j];
						var pointTo = points[j + 1];
						ctx.moveTo(pointFrom.x, pointFrom.y);
						ctx.lineTo(pointTo.x, pointTo.y);
					}
				}

				ctx.moveTo(origin.x, origin.y);
				ctx.lineTo(end.x, end.y);
				ctx.strokeStyle = color;
				ctx.stroke();

			}
		}
	};

	this.S2D = S2D;

}());
