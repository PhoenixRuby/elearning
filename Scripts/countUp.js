var countUp = (function(){
	function countUp(target, val){
		var _this = this;
		
		this.el = (typeof target === 'string') ? document.getElementById(target) : target;
		//if (typeof target === 'string') {
		//	if (target.startsWith('#') && target.indexOf(' ') == -1) {
		//		// 如果是#開頭，移除#然後用getElementById獲取元素
		//		this.el = document.getElementById(target.substring(1));
		//	} else if (target.startsWith('.') && target.indexOf(' ') == -1) {
		//		// 如果是.開頭，移除.然後用getElementsByClassName獲取元素
		//		// 注意: getElementsByClassName會返回一個類數組，您可能需要選擇特定的元素
		//		this.el = document.getElementsByClassName(target.substring(1))[0]; // 這裡我們選擇了第一個元素
		//	} else if (target.startsWith('[')) {
		//		// 如果是[開頭，用querySelector獲取符合條件的第一個元素
		//		this.el = document.querySelector(target);
		//	} else {
		//		// 如果都不是，默認為id選擇器並獲取元素
		//		this.el = document.getElementById(target);
		//	}
		//} else {
		//	// 如果target不是字符串，直接將其視為DOM元素
		//	this.el = target;
		//}
	
		this._startval = 0;
		this._endval = val;
		this._nowval = 0;
		this._duration = 2000;
		this._startTime = null;
		this._ani;
		this.easeOutExpo = function (t, b, c, d) {
            return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
        };
		this.count = function(timestamp){
			if (!_this._startTime) {
                _this._startTime = timestamp;
            }
			
			var progress = timestamp - _this._startTime;
            _this._nowval = _this.easeOutExpo(progress, _this._startval, _this._endval - _this._startval, _this._duration);
			_this._nowval = Number(_this._nowval.toFixed(0));
			
			_this.printValue(_this._nowval);
			if (progress < _this._duration) {
                _this._ani = requestAnimationFrame(_this.count);
            }
		};
	};
	countUp.prototype.update = function (newEndVal) {
        cancelAnimationFrame(this.rAF);
        this._startTime = null;
        this._endval = newEndVal;
        if (this._endval === this._nowval) {
			this._startval = this._nowval;
            return;
        }
        this._startval = this._nowval;
        this._ani = requestAnimationFrame(this.count);
    };
	countUp.prototype.printValue = function (val) {
        var result = this.formatnumber(val);
        if (this.el.tagName === 'INPUT') {
            var input = this.el;
            input.value = result;
        }
        else if (this.el.tagName === 'text' || this.el.tagName === 'tspan') {
            this.el.textContent = result;
        }
        else {
            this.el.innerHTML = result;
        }
    };
	countUp.prototype.formatnumber = function(val){
        if (typeof val != 'undefined') {
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return val;
        } else {
            return val;
        }
	}
	return countUp;
}());