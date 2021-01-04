/***
 * 时间插件
 ***/
(function ($) {
    //工具
    var Util = {
        // 格式化时间
        formateToDate: function (dateStr) {
            if (dateStr) {
                return new Date(dateStr);
            } else {
                return null;
            }
        },
        getMonthData: function (year, month) {
            var ret = [];
            if (!year || !month) {
                var today = new Date();
                year = today.getFullYear();
                month = today.getMonth() + 1;
            }

            var firstDay = new Date(year, month - 1, 1);
            var firstDayWeekDay = firstDay.getDay();

            firstDayWeekDay = firstDayWeekDay + 1;


            var lastDayOfLastMonth = new Date(year, month - 1, 0);
            var lastDateOfLastMonth = lastDayOfLastMonth.getDate();


            var preMonthDayCount = firstDayWeekDay - 1;
            if (preMonthDayCount == 0) {
                preMonthDayCount = 7
            }

            var lastDay = new Date(year, month, 0);
            var lastDate = lastDay.getDate();


            for (var i = 0; i < 7 * 6; i++) {
                var date = i + 1 - preMonthDayCount;
                var showDate = date;
                var thisMonth = month;

                if (date <= 0) {
                    //上月
                    thisMonth = month - 1;
                    showDate = lastDateOfLastMonth + date;
                } else if (date > lastDate) {
                    //下月
                    thisMonth = month + 1;
                    showDate = showDate - lastDate;
                }

                if (thisMonth == 0) thisMonth = 12;
                if (thisMonth == 13) thisMonth = 1;

                var thisYear = year;
                if (date <= 0 && thisMonth == 12) {
                    thisYear = year - 1;
                } else if (date > lastDate && thisMonth == 1) {
                    thisYear = year + 1;
                }

                ret.push({
                    month: thisMonth,
                    date: date,
                    showDate: showDate,
                    year: thisYear
                })
            }

            return ret;
        },
        // 获取当天是周几
        getWeekDate: function (year, month, day) {
            var week = new Date(year, month - 1, day).getDay();
            return week;
        },
        // 星期0转换星期日
        weekChange: function (week) {
            var arr = new Array("周日", "周一", "周二", "周三", "周四", "周五", "周六");
            var week = arr[week];
            return week;
        }
    }

    //UI
    function UI(opts) {
        this.opts = opts;
        //年
        this.year = null;
        //月
        this.month = null;
        //日
        this.date = null;
        //开始时间
        this.startDate = null;
        this.showYearStart = 2009;
    }

    UI.prototype = {
        buildHeaderText: function ($datePicker) {
            var $headerText = $('<div class="aui-head">\
                <div class="aui-head-dt" id="head-year">2020</div>\
                <div class="aui-head-dd">\
                <span id="head-month">13</span>月\<span id="head-day">11</span>日\<span id="head-week">周五</span>\
                </div>\
                </div>');
            this.headerText = $headerText;
            $datePicker.append($headerText);
        },
        buildHeader: function ($datePicker) {
            var $header = $('<div class="aui-date">\
                <a href="javascript:;" class="prev" id="prev-month"><i class="icon icon-prev"></i></a>\
                <div class="tomon">\
                <span class="year" id="year">2020</span>年<span class="month" id="month">12</span>月\
                </div>\
                <a href="javascript:;" class="next" id="next-month"><i class="icon icon-next"></i></a>\
                </div>');
            this.header = $header;
            $datePicker.append($header);
        },
        buildBody: function ($datePicker) {
            var $body = $('<div class="aui-week">\
            <ol><li>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li></ol></div>\
            <div class="aui-content" id="aui-content">\
            <ul class="aui-year" id="aui-year">\
            </ul>\
            <ul class="aui-day" id="aui-day"></ul>\
            <ul class="aui-month" id="aui-month">\
            <li><span>1月</span></li>\
            <li><span>2月</span></li>\
            <li><span>3月</span></li>\
            <li><span>4月</span></li>\
            <li><span>5月</span></li>\
            <li><span>6月</span></li>\
            <li><span>7月</span></li>\
            <li><span>8月</span></li>\
            <li><span>9月</span></li>\
            <li><span>10月</span></li>\
            <li><span>11月</span></li>\
            <li><span>12月</span></li>\
            </ul>\
            </div>');
            this.body = $body;
            $datePicker.append($body);
        },
        buildBtns: function ($datePicker) {
            var $btns = $('<div class="aui-foot">\
            <a href="javascript:;" class="aui-btn" id="btnCancel">取消</a>\
            <a href="javascript:;" class="aui-btn" id="btnConfirm">确定</a>\
            </div>');
            this.btns = $btns;
            $datePicker.append($btns);
        },
        initPageData: function (startDate) {
            this.startDate = startDate;
            this.curStartDate = startDate;

            //年
            var year = startDate.getFullYear();
            //月
            var month = startDate.getMonth() + 1;
            //日
            var date = startDate.getDate();

            this.initPageYear(year);
            this.initPageMonth(month);
            this.initPageDate(date);
            this.initPageWeek(year, month, date);
            this.showPageDate(year, month);
            this.showPageYear(this.showYearStart);
        },

        //初始化年份
        initPageYear: function (year) {
            this.year = year;
            var index = 0;
            var arrli = $(this.opts.yearList).find("li");
            for (var i = 0; i < arrli.length; i++) {
                var element = arrli[i];
                var span = $(element).children().text();
                if (year == span) {
                    index = i;
                }
            }
            $(this.opts.yearList).find("li").removeClass('current');
            $(this.opts.yearList).find("li").eq(index).addClass('current');

            $(this.opts.yearDiv).text(year);
            $(this.opts.headYear).text(year);
        },

        //初始化月份
        initPageMonth: function (month) {
            this.month = month;

            $(this.opts.monthList).find("li").removeClass('selected');
            $(this.opts.monthList).find("li").eq(month - 1).addClass('selected');

            $(this.opts.monthDiv).text(month);
            $(this.opts.headMonth).text(month);
        },

        // 初始化日期
        initPageDate: function (date) {
            this.date = date;
            $(this.opts.headDate).text(date);
        },

        // 初始化星期
        initPageWeek: function (year, month, date) {
            this.year = year;
            this.month = month;
            this.date = date;
            var week = Util.getWeekDate(year, month, date);
            week = Util.weekChange(week);
            $(this.opts.headWeek).text(week);
        },

        //获取页面的年份
        getPageYear: function () {
            var year = parseInt(this.year);
            return year;
        },

        //获取页面的月份
        getPageMonth: function () {
            var month = parseInt(this.month);
            return month;
        },

        // 展示日期
        showPageDate: function (year, month) {
            var _this = this;
            var array = Util.getMonthData(year, month);

            var html = '';
            for (var i = 0, j = array.length; i < j; i++) {
                var item = array[i];
                //开始
                html = html + '<li class="' + _this.getClassName(item) + '" data-year="' + item.year + '" data-month="' + item.month + '" data-date="' + item.showDate + '"><span>' + item.showDate + '</span></li>'
            }
            $(this.opts.dateList).html(html);
        },
        // 展示年份
        showPageYear: function (showYearStart) {
            var _this = this;
            var index = 0;

            _this.showYearStart = showYearStart;
            $(_this.opts.yearList).children().remove();

            for (var i = showYearStart; i < showYearStart + 12; i++) {
                index++;
                if (i == showYearStart) {
                    $last = $("<li><span>往前</span></li>");
                    $(_this.opts.yearList).append($last);
                    $last.click(function () {
                        _this.showPageYear(showYearStart - 10);
                    });
                    continue;
                }

                if (i == showYearStart + 11) {
                    $next = $("<li><span>往后</span></li>");
                    $(_this.opts.yearList).append($next);
                    $next.click(function () {
                        _this.showPageYear(showYearStart + 10);
                    });
                    continue;
                }

                if (i == _this.year) {
                    $yearItem = $('<li class="current" id="' + index + '"><span>' + i + '</span></li>')
                } else {
                    $yearItem = $('<li id="' + index + '"><span>' + i + '</span></li>');
                }
                $(_this.opts.yearList).append($yearItem);

                $yearItem.click(function () {
                    $(_this.opts.yearList).find("li").removeClass('current');
                    $(this).addClass('current');

                    var year = $(this).text();
                    year = parseInt(year, 10);

                    _this.initPageYear(year);
                    _this.initPageWeek(_this.year, _this.month, _this.date);
                    _this.showPageDate(_this.year, _this.month);
                    _this.showPageYear(_this.showYearStart);

                    $(_this.opts.warpDiv).animate({
                        "marginLeft": -100 + "%"
                    }, 200)
                })
            }
        },
        getClassName: function (item) {
            var className = '';
            // 最后一天日期
            var lastDay = new Date(this.year, this.month, 0);
            var lastDate = lastDay.getDate();

            if (item.date < 1) {
                className = className + ' gray';
            } else if (item.date > lastDate) {
                className = className + ' gray';
            }

            // 年
            var yearStart = this.curStartDate.getFullYear();
            // 月
            var monthStart = this.curStartDate.getMonth() + 1;
            // 日
            var dateStart = this.curStartDate.getDate();

            if (item.year == yearStart && item.month == monthStart && item.showDate == dateStart) {
                className = className + ' active';
            }
            return className;
        },

        // 绑定事件
        bindEvents: function () {
            var _this = this;
            // 点击上一月
            $(_this.opts.prevMonth).click(function () {
                var month = _this.month - 1;
                var year = _this.year;
                if (month < 1) {
                    month = 12;
                    year -= 1;
                }
                _this.initPageMonth(month);
                _this.initPageYear(year);
                _this.initPageWeek(_this.year, _this.month, _this.date);
                _this.showPageDate(_this.year, _this.month);
            });

            // 点击下一月
            $(_this.opts.nextMonth).click(function () {
                var month = _this.month + 1;
                var year = _this.year;
                if (month > 12) {
                    month = 1;
                    year += 1;
                }
                _this.initPageMonth(month);
                _this.initPageYear(year);
                _this.initPageWeek(_this.year, _this.month, _this.date);
                _this.showPageDate(_this.year, _this.month);
            });

            // 点击显示年份内容
            $(_this.opts.yearDiv).click(function () {
                $(_this.opts.warpDiv).animate({
                    "marginLeft": 0
                }, 200)
            })

            // 点击显示月份内容
            $(_this.opts.monthDiv).click(function () {
                $(_this.opts.warpDiv).animate({
                    "marginLeft": -200 + "%"
                }, 200)
            })

            // 点击选择日期
            $(_this.opts.dateList).on("click", "li", function () {
                var year = $(this).data('year');
                var month = $(this).data('month');
                var date = $(this).data('date');

                var clickDate = new Date(year + '-' + month + '-' + date);

                $('li.active').removeClass('active');
                $(this).addClass('active');

                _this.initPageYear(year);
                _this.initPageMonth(month);
                _this.initPageDate(date);
                _this.initPageWeek(year, month, date);

                _this.curStartDate = clickDate;
            })

            // 点击选择月份
            $(_this.opts.monthList).on("click", "li", function () {
                $(_this.opts.monthList).find("li").removeClass('selected');
                $(this).addClass('selected');

                var month = $(this).text();
                month = parseInt(month, 10);

                _this.initPageMonth(month);
                _this.initPageWeek(_this.year, _this.month, _this.date);
                _this.showPageDate(_this.year, _this.month);

                $(_this.opts.warpDiv).animate({
                    "marginLeft": -100 + "%"
                }, 200)
            })

            // 点击确定按钮
            $(_this.opts.confirmBtn).click(function () {


                var json = {};
                json.startDate = {};

                _this.startDate = _this.curStartDate;
                // 年
                var year = _this.curStartDate.getFullYear();
                // 月
                var month = _this.curStartDate.getMonth() + 1;
                // 日
                var date = _this.curStartDate.getDate();

                var str = year + "-" + month + "-" + date;
                $("input.dateVisited").val(str);
                $("input.dateVisited").removeClass('dateVisited');

                _this.$datePicker.hide();
                _this.$mask.hide();

                json.startDate.year = year;
                json.startDate.month = month;
                json.startDate.date = date;

                //执行回调
                if (_this.opts.okFunc) {
                    _this.opts.okFunc(json);
                } else {
                    throw new Error('okFunc函数未定义');
                }
            });

            // 点击取消按钮
            $(_this.opts.cancelBtn).click(function () {
                _this.initPageData(_this.startDate);
                _this.$datePicker.hide();
                _this.$mask.hide();
            });
        }
    }

    function buildUI(targetEle, opts) {
        var ui = new UI(opts);
        var $mask = $('<div class="aui-mask" id="aui-mask"></div>');
        var $datePicker = $('<section class="aui-calendar" id="aui-calendar"></div>');

        ui.buildHeaderText($datePicker);
        ui.buildHeader($datePicker);
        ui.buildBody($datePicker);
        ui.buildBtns($datePicker);

        ui.$datePicker = $datePicker;
        ui.$mask = $mask;

        $('body').append($mask);
        $('body').append($datePicker);

        return ui;
    }

    $.fn.datePicker = function (options) {
        var opts = {
            yearDiv: "#year",
            monthDiv: "#month",
            warpDiv: "#aui-content",

            dateList: "#aui-day",
            monthList: "#aui-month",
            yearList: "#aui-year",

            headYear: "#head-year",
            headMonth: "#head-month",
            headDate: "#head-day",
            headWeek: "#head-week",


            prevMonth: "#prev-month",
            nextMonth: "#next-month",
            cancelBtn: "#btnCancel",
            confirmBtn: "#btnConfirm",
        };

        $.extend(opts, options);

        var date = new Date();
        // 开始时间
        var startDate = Util.formateToDate(date);

        var UI = buildUI(this, opts);
        UI.initPageData(startDate);
        UI.bindEvents();

        var _this = this;

        // 点击目标
        $(_this).click(function (e) {
            e.stopPropagation();
            $(this).addClass("dateVisited");
            UI.$mask.show();
            UI.$datePicker.show();
        });

        //点击日历
        UI.$datePicker.click(function (e) {
            e.stopPropagation();
        });

        //点击页面
        $(document).click(function (e) {
            $(UI.$datePicker).hide();
            $(UI.$mask).hide();
        });
    };
})(jQuery);