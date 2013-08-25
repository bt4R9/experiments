;(function() {

	var getUniqeID = (function() {
		var id = 0;
		return function() {
			return id++;
		}
	}());

	var Simple2D = {};

	Simple2D.Point = function(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	};
	Simple2D.Point.prototype = {
		constructor: Simple2D.Point,
		distanceTo: function(point) {
			var x = this.x - point.x;
			var y = this.y - point.y;
			return Math.sqrt(x * x + y * y);
		},
		rotate: function(center, cosA, sinA) {
			var x = this.x;
			var y = this.y;
			center = center || this;
			this.x = center.x + ((x - center.x) * cosA - (y - center.y) * sinA);
			this.y = center.y + ((y - center.y) * cosA + (x - center.x) * sinA);
			return this;
		},
		reset: function() {
			this.rotation = 0;
			this.set(this._x, this._y);
			return this;
		},
		set: function(x, y) {
			this.x = x;
			this.y = y;
			return this;
		},
		add: function(x, y) {
			this.x += x;
			this.y += y;
			return this;
		},
		reduce: function(x, y) {
			this.add(-x, -y);
		}
	};

	Simple2D.Vector = function(x, y) {
		this.x = x;
		this.y = y;
	};
	Simple2D.Vector.prototype = {
		constructor: Simple2D.Vector,
		length: function() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		},
		normalize: function() {
			var length = this.length();
			this.x /= length;
			this.y /= length;
			return this;
		},
		distanceTo: function(vector) {
			var x = this.x - vector.x;
			var y = this.y - vector.y;
			return Math.sqrt(x * x + y * y);
		},
		to: function(vector) {
			var x = this.x - vector.x;
			var y = this.y - vector.y;
			return new Simple2D.Vector(x, y);
		},
		add: function(vector) {
			this.x += vector.x;
			this.y += vector.y;
			return this;
		},
		reduce: function(vector) {
			this.add(-vector.x, -vector.y);
		},
		reverse: function() {
			this.point.multiplyScalar(-1);
		},
		multiplyScalar: function(scalar) {
			this.x *= scalar;
			this.y *= scalar;
		},
		multiplyVector: function(vector) {
			return this.x * vector.x + this.y * vector.y;
		},
		isSameDiraction: function(vector) {
			return this.multiplyVector(vector) > 0;
		},
		isPerpendicular: function(vector) {
			return this.multiplyVector(vector) === 0;
		},
		isOppositeDirection: function(vector) {
			return this.multiplyVector(vector) < 0;
		},
		isCollinearity: function(vector) {
			var a = this.x / vector.x;
			var b = this.y / vector.y;
			return a === b && a !== 0 && b !== 0;
		},
		angle: function(vector) {
			var p1 = this;
			var p2 = vector;
			return Math.acos((p1.x * p2.x + p1.y * p2.y) / (Math.sqrt(p1.x * p1.x + p1.y * p1.y) * Math.sqrt(p2.x * p2.x + p2.y * p2.y)));
		}
	};

	Simple2D.Geometry = function(points) {
		this.points = [];
		if (points[0] instanceof Simple2D.Point) {
			for (var i = 0, l = points.length; i < l; i++) {
				var p = points[i];
				this.points.push(p);
			}
		} else {
			for (var i = 0, l = points.length; i < l; i++) {
				var p = points[i];
				this.points.push(new Simple2D.Point(p[0], p[1]));
			}
		}
	};
	Simple2D.Geometry.prototype = {
		constructor: Simple2D.Geometry,
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
			return new Simple2D.Point((maxR + minL)/2, (minT + maxB)/2);
		},
		rotate: function(rotation) {
			var points = this.points;
			var center = this.getCenter();
			var cosA = Math.cos(rotation);
			var sinA = Math.sin(rotation);
			for (var i = 0, l = points.length; i < l; i++) {
				var point = points[i];
				point.rotate(center, cosA, sinA);
			}
		},
		moveBy: function(vector) {
			var points = this.points;
			for (var i = 0, l = points.length; i < l; i++) {
				var point = points[i];
				point.add(vector.x, vector.y);
			}
			return this;
		},
		moveTo: function(point) {
			var points = this.points;
			for (var i = 0, l = points.length; i < l; i++) {
				var _point = points[i];
				_point.set(point.x, point.y);
			}
			return this;
		},
		reset: function() {
			var points = this.points;
			for (var i = 0, l = points.length; i < l; i++) {
				var point = points[i];
				point.reset();
			}
			return this;
		}
	};

	Simple2D.Shape = function(geometry, vector, style) {
		this.geometry = geometry;
		this.vector = vector;

		var styleDefaults = {
			lineWidth: 1,
			color: '#FF0000'
		};

		style = style || {};
		for (var key in styleDefaults) {
			this[key] = style[key] || styleDefaults[key];
		}

		this.rotation = 0;
		this.__id = getUniqeID();
	};
	Simple2D.Shape.prototype = {
		constructor: Simple2D.Shape,
		moveBy: function() {
			vector = this.vector;
			this.geometry.moveBy(vector);
		},
		moveTo: function(x, y) {
			this.geometry.moveTo(x, y);
		},
		update: function() {
			var rotation = this.rotation;
			this.geometry.rotate(rotation);
			this.moveBy();
		}
	};

	Simple2D.World = function(ctx) {
		this.ctx = document.getElementById(ctx).getContext('2d');
		this.shapes = [];
	};
	Simple2D.World.prototype = {
		constructor: Simple2D.World,
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
		draw: function() {
			var ctx = this.ctx;
			ctx.clearRect(0, 0, document.width, document.height);
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
					if (j !== length -1) {
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
	}


	this.Simple2D = Simple2D;

}())