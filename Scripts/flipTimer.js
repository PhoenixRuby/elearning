(function($) {
    var Timer = function(element, options) {
        this.element = element;
        this.element.hasClass("flipTimer") || this.element.addClass("flipTimer");
        this.userOptions = options;
        this.defaultOptions = Timer.defaults;
        this.options = $.extend({}, this.defaultOptions, this.userOptions);
        
        // 將對應的 DOM 元素存入 options 中
        var timeUnits = ["seconds", "minutes", "hours", "days", "years", "months"];
        for (var i = 0; i < timeUnits.length; i++) {
            var unit = timeUnits[i];
            var unitElement = this.element.find("." + unit);
            if (unitElement.length > 0) {
                this.options[unit] = unitElement[0];
            }
        }

        this.initDate = new Date();
        this.options.date = new Date(this.options.date);
        this.calculateDate();
        this.startTimer();
    };

    Timer.defaults = {
        seconds: true,
        minutes: true,
        hours: true,
        days: true,
        years: true,
        months: true,
        date: new Date().toDateString(),
        direction: "clock",
        callback: null,
        digitTemplate: '' +
		  '<div class="digit">' +
		  '  <div class="digit-top">' +
		  '    <span class="digit-wrap"></span>' +
		  '  </div>' +
		  '  <div class="shadow-top"></div>' +
		  '  <div class="digit-bottom">' +
		  '    <span class="digit-wrap"></span>' +
		  '  </div>' +
		  '  <div class="shadow-bottom"></div>' +
		  '</div>'
    };

    Timer.prototype = {
        calculateDate: function() {
            var diff;
            if (this.options.direction === "down") {
                diff = this.options.date - this.initDate;
            } else if (this.options.direction === "up") {
                diff = this.initDate - this.options.date;
            }

            if (this.options.direction === "clock") {
                this.seconds = this.initDate.getSeconds();
                this.minutes = this.initDate.getMinutes();
                this.hours = this.initDate.getHours();
                this.days = this.initDate.getDate();
                this.years = this.initDate.getFullYear();
                this.months = this.initDate.getMonth() + 1;
            } else {
                this.seconds = Math.floor(diff / 1000) % 60;
                this.minutes = Math.floor(diff / 1000 / 60) % 60;
                this.hours = Math.floor(diff / 1000 / 3600) % 24;
                this.days = Math.floor(diff / 1000 / 60 / 60 / 24);
            }

            this.render();
        },
        render: function() {
            if (this.options.seconds) this.renderDigits(this.options.seconds, this.seconds);
            if (this.options.minutes) this.renderDigits(this.options.minutes, this.minutes);
            if (this.options.hours) this.renderDigits(this.options.hours, this.hours);
			//this.options.days && this.renderDigits(this.options.days, this.days), 
			//this.options.years && this.renderDigits(this.options.years, this.years), 
			//this.options.months && this.renderDigits(this.options.months, this.months), 
			//console.log(this.options.target);
        },
        renderDigits: function(element, value) {
            var sets = [];
            if ($(element).find(".digit").length === 0) {
                for (var i = 0; i < 2; i++) {
                    var set = $('<div class="digit-set"></div>');
                    for (var j = 0; j <= 9; j++) {
                        var digit = $(this.options.digitTemplate);
                        digit.find(".digit-wrap").text(j);
                        set.append(digit);
                    }
                    sets.push(set);
                    $(element).append(set);
                }
            }

            var valStr = value.toString().padStart(2, '0');
            $(element).find(".digit-set").each(function(index) {
                var digits = $(this).find('.digit');
                digits.removeClass('active').removeClass('previous');
                var digitValue = parseInt(valStr.charAt(index));
                $(digits[digitValue]).addClass('active');
                if (digitValue > 0) {
                    $(digits[digitValue - 1]).addClass('previous');
                } else {
                    $(digits[9]).addClass('previous');
                }
            });
        },
        startTimer: function() {
            var self = this;
            clearInterval(this.timer);
            this.timer = setInterval(function() {
                self.updateTime();
            }, 1000);
        },
        updateTime: function() {
            var currentDate = new Date();
            if (this.options.direction === "clock") {
                var lastDate = this.initDate;
                this.seconds = currentDate.getSeconds();
                this.minutes = currentDate.getMinutes();
                this.hours = currentDate.getHours();
                this.days = currentDate.getDate();
                this.months = currentDate.getMonth() + 1;
                this.years = currentDate.getFullYear();

				
                // 如果日、月、年改變了，調用對應的函數
				
				const lastdays = parseInt($('#' + this.options.target + ' .clockday .day').text());
				const lastmonths = parseInt($('#' + this.options.target + ' .clockday .month').text());
				const lastyears = parseInt($('#' + this.options.target + ' .clockday .year').text());
				
                if (this.days !== lastDate.getDate() || this.days !== lastdays) this.increaseDigitDay();
                if (this.months !== (lastDate.getMonth() + 1) || this.months !== lastmonths) this.increaseDigitMonth();
                if (this.years !== lastDate.getFullYear() || this.years !== lastyears) this.increaseDigitYear();
            } else {
				
				if (
					(this.options.direction === 'down' && (this.days <= 0 && this.hours <= 0 && this.minutes <= 0 && this.seconds <= 0))
					||
					(this.options.direction === 'up' && ((this.days > 999) || this.days === 99 && this.hours === 23 && this.minutes === 59 && this.seconds === 59))
				) {
				  clearInterval(this.timer);
				  
				  if (typeof this.options.callback === 'function') {
					this.options.callback();
				  }

				  return;
				}
				
                if (this.seconds > 0) {
                    this.seconds--;
                } else {
                    this.seconds = 59;
                    if (this.minutes > 0) {
                        this.minutes--;
                    } else {
                        this.minutes = 59;
                        if (this.hours > 0) {
                            this.hours--;
                        } else {
                            this.hours = 23;
                            this.days--;
                        }
                    }
                }
				// Increase/decrease seconds
				if (this.options.direction === 'down') {
					this.seconds--;
				} else {
					this.seconds++;
				}
				
				if (this.seconds == 60 || this.seconds == -1) {
				  if (this.options.direction == 'down') {
					this.seconds = 59;
					this.minutes--;
				  } else {
					this.seconds = 0;
					this.minutes++;
				  }
				}

				// increase/decrease hours
				if (this.minutes == 60 || this.minutes == -1) {
				  if (this.options.direction == 'down') {
					this.minutes = 59;
					this.hours--;
				  } else {
					this.minutes = 0;
					this.hours++;
				  }
				}

				// increase/decrease days
				if (this.hours == 24 || this.hours == -1) {
				  if (this.options.direction == 'down') {
					this.hours = 23;
					this.days--;
				  } else {
					this.hours = 0;
					this.days++;
				  }
				}

				var dt = moment(this.options.date);
				
				if (dt.format('YYYY') !== $('#' + this.options.target + ' .clockday .year').text()) {
					$('#' + this.options.target + ' .clockdate .year').text(dt.format('YYYY'));
				}
				if (dt.format('MM') !== $('#' + this.options.target + ' .clockday .month').text()) {
					$('#' + this.options.target + ' .clockdate .month').text(dt.format('MM'));
				}
				if (dt.format('DD') !== $('#' + this.options.target + ' .clockday .day').text()) {
					$('#' + this.options.target + ' .clockday .day').text(dt.format('DD'));
				}
            }

            this.render();
        },
        increaseDigitYear: function(){
            var dt = moment(new Date());
            $('#' + this.options.target + ' .clockdate .year').text(dt.format('YYYY'));
        },
        increaseDigitMonth: function(){
            var dt = moment(new Date());
            $('#' + this.options.target + ' .clockdate .month').text(dt.format('MM'));
        },
        increaseDigitDay: function(){
            var dt = moment(new Date());
            $('#' + this.options.target + ' .clockday .day').text(dt.format('DD'));
        },
        increaseDigital: function(i, val){
            $(i).find(".digit-set").each(function(idx, o) {
                $(o).find(".active").removeClass("active");
                $(o).find(".previous").removeClass("previous");

                var n1 = val % 10;
                var n2 = (val - n1) / 10;

                var now_n = idx == 0 ? n2 : n1;
                var max_n = $(o).find('.digit').length - 1;

                $($(o).find('.digit')[now_n]).addClass('active');
                $($(o).find('.digit')[now_n - 1 >= 0 ? now_n - 1 : max_n]).addClass('previous');
            });
        },
        increaseDigit: function(i) {
            var t = [],
                e = this;

            $(i).find(".digit-set").each(function() {
                t.push(this)
            });
            (function n(o) {
                var d = $(o).find(".active"),
                    a = $(o).find(".previous"),
                    h = $.inArray(o, t);

                a.removeClass("previous");
                d.removeClass("active").addClass("previous");
                if (d.next().length === 0) {
                    if (e.options.direction === "down" && i === e.options.hours && (e.hours === -1 || e.hours === 23) && $(o).find(".digit").length === 10) {
                        $($(o).find(".digit")[6]).addClass("active");
                    } else {
                        $(o).find(".digit:first-child").addClass("active");
                        if (h !== 0) {
                            n(t[h - 1]);
                        }
                    }
                } else {
                    if (e.options.direction === "up" && i === e.options.hours && e.hours === 24) {
                        $(o).find(".digit:first-child").addClass("active");
                        n(t[h - 1]);
                    } else {
                        d.next().addClass("active");
                    }
                }
            })(t[t.length - 1]);
        }
    };

    $.fn.flipTimer = function(options) {
        return this.each(function() {
            if (!$.data(this, "flipTimer")) {
                $.data(this, "flipTimer", new Timer($(this), options));
            }
        });
    }
})(jQuery);
