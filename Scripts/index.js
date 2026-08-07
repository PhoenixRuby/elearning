var target_count;
var keyin = false;
//var clock;
var star = -1;
var starcountdown;
var life_countdown;
var rocket = -1;
var rocketcountdown;
var rocket_countdown;
var albumpagebuttons = 7;

//var msgcount = new countUp($('.subtabmenu > a > .msgbox > .msgcount'), 0);
target_count = new countUp('target_count', 0);
life_countdown = new countUp('life_countdown', 0);
rocket_countdown = new countUp('rocket_countdown', 0);

function init(){
	var timer;
	/*
	$('input[name=rdo]').change(function(){
		clearTimeout(timer);
		search($('#question').val());
	});*/
	$('#query [data-panel="menulist"] input[type="radio"]').change(function(){
		//$('[data-panel="menulist"] input[type="radio"]:checked ~ label')
		
		if ($('#query [data-panel="menulist"] input[type="radio"]').index($('#query [data-panel="menulist"] input[type="radio"]').filter(':checked')) == 0){
			$('#query [data-panel="checklist"]').removeClass('all').addClass('all');
		} else {
			$('#query [data-panel="checklist"]').removeClass('all');
		}
		
		var nowval = $('#query [data-panel="checklist"] input[type="radio"]:checked').val();
		filter_quicksand($(this).val(), function (){
			setTimeout(function(){
				if ($('#query [data-panel="checklist"] > li:visible input[type="radio"][value="' + nowval + '"]').length > 0){
					$('#query [data-panel="checklist"] > li:visible input[type="radio"][value="' + nowval + '"]').prop('checked', true);
				} else {
					$('#query [data-panel="checklist"] input[type="radio"]').prop('checked',false);
					$('#query [data-panel="checklist"] > li:visible input[type="radio"]').each(function(i, e){
						if (i == 0){
							$(this).prop('checked', true);
						}
					});
				}
				
				resize_all_quicksand();
				clearTimeout(timer);
				search($('#question').val());
			}, 400);
		});
	});
	
	$('#query [data-panel="checklist"] input[type="radio"],#query [data-panel="checklist"] input[type="checkbox"]').change(function(){
		clearTimeout(timer);
		search($('#question').val());
	});
	
	$('#question').keyup(function(e){
		
		// 如果是上下左右鍵、Ctrl鍵或Shift鍵，就不動作
        if ([37, 38, 39, 40, 16, 17].includes(e.keyCode)) {
            return;
        }
		
		clearTimeout(timer);
		timer = setTimeout(function(){
			clearTimeout(timer);
			search($('#question').val());
		}, 300);
	});
	$('#question').keypress(function(e){
		// 如果是上下左右鍵、Ctrl鍵或Shift鍵，就不動作
        if ([37, 38, 39, 40, 16, 17].includes(e.keyCode)) {
            return;
        }
		
		clearTimeout(timer);
		if(e.keyCode == 13){
			search($('#question').val());
		}
		keyin = true;
	});
	
	$('#question').focusout(function(){
		keyin = false;
	});
	
	$('a[data-button="more"]').click(function(e){
		e.preventDefault();
		var _this = $(this);
		var subid = '#' + $(_this).next().attr('id');
		
		if ($(_this).hasClass('selected')){
			$(_this).removeClass('selected');
			$(_this).next().slideUp('fast', function(){
				resize_quicksand('#query', '#query ul[data-panel="checklist"]');
			});
		} else {
			$(_this).addClass('selected');
			
			$(_this).next().find('li').removeAttr('style');
			$(_this).next().removeAttr('style').css({'display':'block', 'opacity': 0, 'height': 'auto', 'width': $('body').width() - 88});
			
			resize_quicksand('#query', '#query ul[data-panel="checklist"]', function(){
				//console.log('more');
				//$(_this).next().removeAttr('style');
				//$(_this).next().slideDown('fast', function(){
				$(_this).next().animate({'opacity': 1}, 'fast', function(){
					var cb = function(){
						resize_quicksand('#query', '#query ul[data-panel="checklist"]');
					};				

					resize_quicksand(subid, subid, cb);
				});
			});
		}
	});
	
	checkbox_radio_init('#search_panel');
	
	setTimeout(function(){
		$('#query').removeClass('loading');
	}, 2000);
}

function loaddata(){
	var menu = '';
	$(menulist).each(function(i, e){
		menu += build_menu(i, e);
	});
	
	$('#query [data-panel="menulist"]').html(menu);
	
	var optionmenu = '';
	var bookwall = '';
	var bookcount = {count: 0};
	$(datalist).each(function(i, e){
		var part = '';
		var bookpart = '';
		if (e.title){
			part = build_group(i, e);
			bookpart = build_bookwall(e.list, bookcount);
		} else {
			part = build(i, e);
			bookpart = build_bookwall(e, bookcount);
		}
		
		optionmenu += part;
		bookwall += bookpart;
	});
	
	$('[data-panel="checklist"]').html(optionmenu).addClass('all');
	init();
	search('');
	
	//console.log('load bookwall');
	buildPanelAndBindClick('#study_panel', bookwall);
	
	$('#study_panel [data-panel="quickmenu"] > li:first-child input[type="checkbox"]').click();
	
	Object.entries(tqclist).forEach(([key, value]) => {
        buildPanelAndBindClick(`#tqc${key}_panel`, build_tqc(value));
    });
}

function buildPanelAndBindClick(panelSelector, examwall) {

	if (typeof examwall != 'undefined'){
		$(panelSelector + ' [data-panel="bookwall"]').html('<ul class="align">' + examwall + '</ul>');
	}
    $(panelSelector + ' [data-panel="bookwall"] .book').off('click');
	$(panelSelector + ' [data-panel="bookwall"] .book').click(function(){
        var topic = $(this).find(' ~ figcaption h2').text();
        var subtitle = '<h1>' + $(this).find('.hardcover_front li:first-child h1').text() + '</h1>';
        var perpage = 4;
		if (panelSelector == '#tqccsharp_panel'){
			perpage = location.hash == '#nofog' ? 6 : 4;
		} else if (panelSelector == '#study_panel'){
			perpage = 1;
		}
        var contentpages = parseInt($(this).find(' .hardcover_front .bookribbon > span').text() ?? '0') * perpage;
        var totalpages = contentpages;
        if (totalpages % 2 == 0){
            totalpages += 2;
        } else {
            totalpages += 3;
        }
		
		open_book(topic, contentpages);
        loadBook(totalpages, contentpages, topic, subtitle);
        $(panelSelector + ' .result-filter li[data-filter="book"]').click();
        //$('html,body').animate({
        //    scrollTop: 160
        //}, 100);
		
		var sidebarUl = document.getElementById('sidebar').getElementsByTagName('ul')[0];
		var maxItems = 5; // 最多显示的项数
		addItemToSidebar(topic, $(this).parent().data('order'));
		function addItemToSidebar(content, count) {
			// 创建新的 li 元素并设置其内容
			var newLi = document.createElement('li');
			//newLi.setAttribute('data-order', count); 
			newLi.textContent = content;

			newLi.addEventListener('click', function() {
				console.log(count);
				$(panelSelector + ' [data-panel="bookwall"] li[data-order="' + count + '"] .book').click();
			});


			// 添加新的 li 到 ul 的开始位置
			sidebarUl.insertBefore(newLi, sidebarUl.firstChild);

			// 如果列表项超过了最大数目，移除最老的（最后一个）记录
			if (sidebarUl.children.length > maxItems) {
				sidebarUl.removeChild(sidebarUl.lastChild);
			}
		}
	
    });
}

function build_tqc(tqc){
	var booklist = '';
	$(tqc).each(function(i, e){
		var arr = e.name.split(' ');
		var kind = '';
		var topic = '';
		var isjava = e.name.toLowerCase().indexOf('java') > -1 || e.name.toLowerCase().indexOf('python') > -1;
		var cover = 'csharp';
		cover = e.name.toLowerCase().indexOf('java') > -1 ? 'eclipse' : cover;
		cover = e.name.toLowerCase().indexOf('python') > -1 ? 'python' : cover;
		if (isjava){
			kind = arr[1];
			topic = arr[2];
		} else {
			kind = arr[1] + ' ' + arr[2];
			topic = arr[3];
		}

		// Front
		var book_front = '<ul class="hardcover_front">';

		// use img
		// book_front += '<img src="img/cover.jpg" alt="" width="100%" height="100%">';

		book_front += '<li><div class="coverDesign ' + cover + '">';
		// use ribbon
		book_front += '<span class="bookribbon"><span>' + e.problemSet.problems.length + '</span></span>';

		book_front += '<h1>' + kind + '</h1><p>' + topic.split('：')[1] +'</p></div></li>';
		book_front += '<li></li></ul>';

		// Pages

		var book_page = '<ul class="bookpage"><li></li><li><p>' + topic + '</p></li><li></li><li></li><li></li></ul>';

		// Back
		var book_back = '<ul class="hardcover_back"><li></li><li></li></ul><ul class="book_spine"><li></li><li></li></ul>';
		
		var book_topic = '<figcaption>';
		book_topic += '<h2>' +  topic + '</h2>';
		var tag = e.problemSet.tags.map(function(v){
			return '<li>' + v + '</li>';
		}).join('');
		book_topic += '<ol data-tag>' + tag + '</ol>';
		
		var description = '';
		if (e.description){
			$(e.description.replace('技能內容：', '').split('、')).each(function(ides, edes){
				description += '<li>' + edes + '</li>';
			});
		}
		
		book_topic += '<ul>' + description + '</ul>';
		
		book_topic += '</figcaption>';

		booklist += '<li><figure class="book">' + book_front + book_page + book_back + '</figure>' + book_topic + '</li>';
		
	});
	
	return booklist;
}

function build_bookwall(group, bookcount) {
	
	var booklist = '';
	$(group).each(function(i,e){

		var topic = typeof(e.topic) == 'undefined' || e.topic == '' ? 'PIC' : e.topic;
		var kind = typeof(e.kind) == 'undefined' || e.kind == '' ? '宣導' : e.kind;
		// Front
		var book_front = '<ul class="hardcover_front">';

		// use img
		// book_front += '<img src="img/cover.jpg" alt="" width="100%" height="100%">';

		book_front += '<li><div class="coverDesign">';
		// use ribbon
		book_front += '<span class="bookribbon"><span>' + e.subject.list.length + '</span></span>';

		book_front += '<h1>' + topic + '</h1><p>' + kind +'</p></div></li>';
		book_front += '<li></li></ul>';

		// Pages

		var book_page = '<ul class="bookpage"><li></li><li><p>' + e.subject.title + '</p></li><li></li><li></li><li></li></ul>';

		// Back
		var book_back = '<ul class="hardcover_back"><li></li><li></li></ul><ul class="book_spine"><li></li><li></li></ul>';

		// topic

		var book_topic = '<figcaption>';
		book_topic += '<h2>' + e.subject.title + '</h2>';
		var tag = e.type.split(',').map(function(v){
			return '<li>' + v + '</li>';
		}).join('');;
		book_topic += '<ol data-tag>' + tag + '</ol>';
		
		var description = '';
		if (e.description){
			$(e.description).each(function(ides, edes){
				description += '<li>' + edes + '</li>';
			});
		}
		
		book_topic += '<ul>' + description + '</ul>';
		book_topic += '</figcaption>';

		// 預設隱藏
		bookcount.count += 1;
		booklist += '<li data-type="' + e.type + '" data-hidden="true" data-order="' + bookcount.count + '"><figure class="book">' + book_front + book_page + book_back + '</figure>' + book_topic + '</li>';

	});

	return booklist;
}

function build_menu(idx, list){
	var content = '';
	var tag = 'rdomenu_' + idx;
	
	content += '<input id="' + tag + '" type="radio" name="rdomenu" value="' + list.type + '" ' + ( idx == 0 ? 'checked="checked"' : '') + '>';
	content += '<span class="icon_radiobox empty" data-animation="false"></span>';
	content += '<label class="for-input" data-label="radiobox" for="' + tag + '">' + list.title + '</label>';

	return '<li>' + content + '</li>';
}

function build_group(idx, group){
	var content = '';
	var tag = 'rdo_' + idx;
	var hintlist = '';
	
	/*if (idx == 0){
		setTimeout(function(){
			target_count.update(group.list.reduce((count, current) => count + current.subject.list.length, 0));		
		}, 1000);
	}*/

	content += '<input id="' + tag + '" type="radio" name="rdo" value="' + idx + '" ' + ( idx == 0 ? 'checked="checked"' : '') + '>';
	content += '<span class="icon_radiobox empty" data-animation="false"></span>';
	content += '<label class="for-input" data-label="radiobox" for="' + tag + '">' + group.title + '</label>';
	
	var tag2 = 'chk_' + idx;
	content += '<input type="checkbox" id="' + tag2 + '" name="' + tag2 + '" value="1" checked="checked" />';
	content += '<span class="icon_checkbox empty" data-animation="true"></span>';
	content += '<label for="' + tag2 + '" data-label="checkbox">' + group.title + '</label>';
	
	content += '<a href="#" data-button="more"></a>';
	
	var part = '';
	$(group.list).each(function(i, e){
		
		var part_tag = 'g_' + idx + '_' + i;
		
		part += '<li data-type="' + e.type + '" data-count="' + e.subject.list.length + '">';
		part += '<input type="checkbox" id="' + part_tag + '" name="' + part_tag + '" value="1" checked="checked"/>';
		part += '<span class="icon_checkbox empty" data-animation="true"></span>';
		part += '<label for="' + part_tag + '" data-label="checkbox">' + e.subject.title + '</label>';
		part += '</li>';
		
		if (idx == 0){
			hintlist += '<li>' + e.subject.title + '</li>';
		}
	});
	
	if (idx == 0){
		$('[data-panel="hintlist"]').html(hintlist);
	}
	
	content = content + '<ol id="' + tag + '_list">' + part + '</ol>'
	
	var type = group.list.map(function(v,i,a){
		return v.type;
	}).filter(function(v,i,s){
		return s.indexOf(v) === i;
	}).toString();
	
	return '<li data-type="' + type + '">' + content + '</li>';
}

function build(idx, list){
	var content = '';
	var tag = 'rdo_' + idx;
	
	content += '<input id="' + tag + '" type="radio" name="rdo" value="' + idx + '" ' + ( idx == 0 ? 'checked="checked"' : '') + '>';
	content += '<span class="icon_radiobox empty" data-animation="false"></span>';
	content += '<label class="for-input" data-label="radiobox" for="' + tag + '">' + list[0].subject.title + '</label>';
	
	var tag2 = 'chk_' + idx;;
	content += '<input type="checkbox" id="' + tag2 + '" name="' + tag2 + '" value="1" checked="checked" />';
	content += '<span class="icon_checkbox empty" data-animation="true"></span>';
	content += '<label for="' + tag2 + '" data-label="checkbox">' + list[0].subject.title + '</label>';
	
	return '<li data-type="' + list[0].type + '" data-count="' + list[0].subject.list.length + '">' + content + '</li>';
}

function search(keyword, callback){
	
	if ($('#search_panel').css('display') != 'block'){
		if (typeof(callback) === 'function'){
			callback([]);
		} else {
			return;
		}
	}
	var target = $('input[name=rdo]:checked').val();
	var data = {};
	
	// 找全部題庫
	if ($('#query [data-panel="menulist"] input[type="radio"]:checked ~ label').text() == '全部')
	{
		var sublist = [];
		var hintlist = '';
		$('[data-panel="checklist"] > li > input[type="checkbox"]').each(function(i, e){
			var target = $(this).attr('id').replace('chk_', '');
			
			if (datalist[target].title){
				if ($(this).prop('checked') && $(this).parent().attr('data-hidden') != 'true'){
					var _child = $(this).parent().find('> ol > li > input[type="checkbox"]');
					//console.log(target);
					$(_child).each(function(si, se){
						if ($(this).prop('checked')){
							sublist.push(datalist[target].list[si]);
							//console.log(si);
							hintlist += '<li>' + datalist[target].list[si].subject.title + '</li>';	
						}
					});
				}
			} else {
				if ($(this).prop('checked')){
					$(datalist[target]).each(function(si, se){
						sublist.push(se);
						hintlist += '<li>' + se.subject.title + '</li>';
						//hintlist += '<li>' + datalist[target][0].subject.title + '</li>';
					});
				}
			}
		});
		
		data = sublist;
		$('[data-panel="hintlist"]').html(hintlist);
		
		var count = 0;
		$('[data-panel="checklist"] > li > input[type="checkbox"]:checked').each(function(i, e){
			var _child = $(this).parent().find(' > ol > li > input[type="checkbox"]');
			if (_child.length > 0){
				
				$(_child).each(function(si, se){
					if ($(this).prop('checked')){
						count += parseInt($(this).parent().attr('data-count'));
					}
				});
				
			} else {
				if ($(this).parent().attr('data-hidden') != 'true'){
					//console.log($(this).parent().html());
					count += parseInt($(this).parent().attr('data-count'));
				}
			}
		});
		/*
		if ($('[data-panel="checklist"] input[type="checkbox"]:checked ~ ol').length == 0){
			count += parseInt($('[data-panel="checklist"] input[type="checkbox"]:checked').parent().attr('data-count'));
		}
		$('[data-panel="checklist"] input[type="checkbox"]:checked ~ ol > li input[type="checkbox"]:checked').each(function(i, e){
			if ($(this).parent().attr('data-hidden') != 'true'){
				count += parseInt($(this).parent().attr('data-count'));
			}
		});
		*/
		
		target_count.update(count);
			
		/*
		var sublist = [];
		$.each(datalist, function(iall, eall){
			if (datalist[iall].title){
				$.each(datalist[iall].list, function(isub, esub){
					sublist.push(esub);
				});
			} else  {
				$.each(datalist[iall], function(isub, esub){
					sublist.push(esub);
				}); 
			}
		});
		
		data = sublist;
		*/
	}
	else
	{
		if (typeof(target) != 'undefined' && target != ''){
			if (datalist[target].title){
				var sublist = [];
				var hintlist = '';
				$('#rdo_' + target + '_list input').each(function(i, e){
					if ($(this).prop('checked') && $(this).parent().attr('data-hidden') != 'true'){
						sublist.push(datalist[target].list[i]);
						hintlist += '<li>' + datalist[target].list[i].subject.title + '</li>';
					}
				});
			
				data = sublist;
				
				$('[data-panel="hintlist"]').html(hintlist);
			} else {
				data = datalist[target];
				
				$('[data-panel="hintlist"]').html('<li>' + datalist[target][0].subject.title + '</li>');
			}
			
			var count = 0;
			if ($('[data-panel="checklist"] input[type="radio"]:checked ~ ol').length == 0){
				count += parseInt($('[data-panel="checklist"] input[type="radio"]:checked').parent().attr('data-count'));
			}
			$('[data-panel="checklist"] input[type="radio"]:checked ~ ol > li input[type="checkbox"]:checked').each(function(i, e){
				if ($(this).parent().attr('data-hidden') != 'true'){
					count += parseInt($(this).parent().attr('data-count'));
				}
			});
			
			target_count.update(count);
		}
	}
	//console.log('answer', data);

	if (keyword != ''){
		var total = 0;
		var anslist = '';
		var searchcount = 0;
		var searchunit = 0;
		var ansGroup = [];
		
		$.each(data, function(i, e){
			total += e.subject.list.length;
			searchunit = 0;
			var sublist = [];
			$.each(e.subject.list, function(iSubject, eSubject){
				
				if (eSubject.q.indexOf(keyword) > -1){
					searchcount += 1;
					searchunit +=1;
					var head = '<li data-guide="node" data-no="' + searchcount + '"><div data-icon="q">' + eSubject.q.replace(keyword, '<strong>' + keyword + '</strong>') + '</div></li>';
					var content = [];
					$.each(eSubject.list, function(i2, e2){
						$.each(e2, function (i3, e3){
							if (e3.indexOf('*') == 0 || e3.indexOf('\'') == 0){
							   content.push('<strong>' + i3 + ':' + htmlEncode(e3) + '</strong>');
							} else if (e3.indexOf('[xxx]') == 0){
								e3 = e3.replace('[xxx]', '');
								content.push('<del>' + i3 + ':' + htmlEncode(e3) + '</del>');
							} else {
							   content.push(i3 + ':' + htmlEncode(e3));
							}
							//if (e3.indexOf('*') == 0 || e3.indexOf('\'') == 0){
							//   content.push('<strong>' + i3 + ':' + e3 + '</strong>');
							//} else if (e3.indexOf('[xxx]') == 0){
							//	e3 = e3.replace('[xxx]', '');
							//	content.push('<del>' + i3 + ':' + e3 + '</del>');
							//} else {
							//   content.push(i3 + ':' + e3);
							//}
						})	   
					});
					
					if (content.length > 0){
						sublist.push({'head': head, 'list': content});
					}
				}
			});
			
			if (sublist.length > 0)
			{
				var tmpnode = '';
				
				$(sublist).each(function(iSub, eSub){
					var tmplist = '';
					var hasstar = 'false';
					$(eSub.list).each(function(iList, eList){
						if (eList.startsWith('<strong>')){
							hasstar = 'true';
						}
						tmplist += '<li>' + eList + '</li>';
					});
					if (sublist.length == iSub + 1){
						tmpnode += eSub.head + '<li data-guide="lastnode"><div class="note"><ul data-star="' + hasstar + '">' + tmplist + '</ul></div></li>';
					} else {
						tmpnode += eSub.head + '<li data-guide="node"><div class="note"><ul data-star="' + hasstar + '">' + tmplist + '</ul></div></li>';
					}
					
				});
				
				ansGroup.push({'title': e.subject.title, 'miss': false, 'count': searchunit, 'total': e.subject.list.length, 'data': tmpnode});
				anslist += '<li class="selected"><h3>' + e.subject.title + '(' + searchunit + '/' + e.subject.list.length + ')</h3><ol>' + tmpnode + '</ol></li>';
			}
			
		});
		
		if (typeof(callback) === 'function'){
			callback(ansGroup);
		} else {
			console.log('search ansgroup', ansGroup);
			////$('#answer li.selected').removeClass('selected');
			setTimeout(function(){
				$('#search_result').html('從<span>' + total + '</span>筆中，共找到：<span>' + searchcount + '</span>筆符合。');
				if (searchcount == 0){
					$('#answer').html('<div data-match="oops"><div></div><div></div></div>');
					loadBook(0);
				} else {
					//$('#answer').html(anslist);
					build_answer('#answer', ansGroup, keyword);
					
					if ($('[data-no]').length % 2 == 0){
						loadBook($('[data-no]').length + 2, $('[data-no]').length, null, '<h1>搜尋結果</h1>');
					} else {
						loadBook($('[data-no]').length + 3, $('[data-no]').length, null, '<h1>搜尋結果</h1>');
					}
					
				}
			}, 200);
		}
	} else {
		if (typeof(callback) === 'function'){
			callback(ansGroup);
		} else {
			////$('#answer li.selected').removeClass('selected');
			setTimeout(function(){
				$('#search_result').html('');
				$('#answer').html('');
				loadBook(0);
			}, 200);
		}
	}
}

function checkbox_radio_init(parent) {
    $(parent + ' span.icon_checkbox').each(function (i, e) {
        $(this).parent().find('input[type="checkbox"]').css('display', 'none');
        $(this).removeClass('empty');
    });

    $(parent + ' span.icon_checkbox, label[data-label="checkbox"]').off('click');
    $(parent + ' span.icon_checkbox, label[data-label="checkbox"]').click(function () {
        var _this = $(this).parent().find(' > input[type="checkbox"]');
        var chkbox = $(this).parent().find(' > span.icon_checkbox');
		var _child = $(this).parent().find('> ol > li > input[type="checkbox"]');

        chkbox.attr('data-animation', 'true');
        if (_this.is(':checked')) {
            if ($(this).attr('data-label') == 'checkbox') {
                _this.prop('checked', false);
            }
			
            _this.removeClass('checked');
			
			$(_child).each(function(i, e){
				$(this).prop('checked', false);
			});
			_child.removeClass('checked');
        } else {
            if ($(this).attr('data-label') == 'checkbox') {
                _this.prop('checked', true);
            }
            _this.addClass('checked');
			$(_child).each(function(i, e){
				$(this).prop('checked', true);
			});
			_child.addClass('checked');
        }

		//_this.click();
		
		if ($(this).hasClass('icon_checkbox')){
			_this.click();
		} else  {
			
			_this.trigger('change');
			return false;
		}
    })

    $(parent + ' span.icon_radiobox').each(function (i, e) {
        $(this).parent().find('input[type="radio"]').css('display', 'none');
        $(this).removeClass('empty');
    });
    $(parent + ' span.icon_radiobox, label[data-label="radiobox"]').off('click');
    $(parent + ' span.icon_radiobox, label[data-label="radiobox"]').click(function () {
        var _this = $(this).parent().find('input[type="radio"]');
        var _name = $(this).parent().find('input[type="radio"]').attr('name');
        //console.log(parent + ' input[type="radio"][name="' + _name + '"]');
        $(parent + ' input[type="radio"][name="' + _name + '"]').removeClass('checked');
        var radiobox = $(this).parent().find('span.icon_radiobox');
        radiobox.attr('data-animation', 'true');
        if ($(this).attr('data-label') == 'radiobox') {
            _this.prop('checked', true);
        }
        _this.addClass('checked');

		if ($(this).hasClass('icon_radiobox')){
			_this.click();
		} else  {
			_this.trigger('change');
		}
    })
}

function resize_all_quicksand() {
	
	resize_quicksand('#query', '#query ul[data-panel="menulist"]');	
	
	resize_quicksand('#query', '#query ul[data-panel="checklist"]', function(subid){

		var sublen = $('#query ul[data-panel="checklist"] > li  > ol' + subid).length - 1;
		//console.log(subid, sublen);
		if (sublen > -1){

			if ($(subid).css('display') == 'block'){

				var cb = function(){
					//console.log(subid + ' final');
					resize_quicksand('#query', '#query ul[data-panel="checklist"]', function(){
						//console.log('left=' + $(subid).offset().left);
						if ($(subid + ' > li:nth-child(1)').offset().left > 5 || $(subid).width > $('body').width()){
							setTimeout(function(){
								resize_quicksand(subid, subid, function (){
									resize_quicksand('#query', 'ul[data-panel="checklist"]');
								});	
							}, 100);
						}
					});
				};

				resize_quicksand(subid, subid, cb);
			}
		}
	});	
	
	//resize_quicksandbook('#study_panel', '#study_panel [data-panel="bookwall"] ul.align');
	//resize_quicksandbook('#tqccsharp_panel', '#tqccsharp_panel [data-panel="bookwall"] ul.align');
	//resize_quicksandbook('#tqcjava_panel', '#tqcjava_panel [data-panel="bookwall"] ul.align');
	//resize_quicksandbook('#tqcpython_panel', '#tqcpython_panel [data-panel="bookwall"] ul.align');
	//resize_quicksandbook('#tqcpythonweb_panel', '#tqcpythonweb_panel [data-panel="bookwall"] ul.align');
	//resize_quicksandbook('#tqcr_panel', '#tqcpythonweb_panel [data-panel="bookwall"] ul.align');
	
}

function resize_quicksand(parent, target, callback) {
    //console.log($(target + ' li').is(':animated'));
    if ($(parent).css('display') != 'block') return;
    if ($(target).css('display') != 'block') return;
	if ($(target).css('opacity') != '1') return;
    if ($(target).html() == '') return;
    if ($(parent).css('display') == 'none') return;
    if ($(target + ' > li').is(':animated')) {
        $(target + ' > li').stop().clearQueue();
    }
	if ($(target + ' > li > ol > li').is(':animated')) {
        $(target + ' > li > ol > li').stop().clearQueue();
    }

	var zoomsize = 1.0;
	switch($('body').attr('data-size')){
		case '2':
			zoomsize = 1.2;
		break;
		case '3':
			zoomsize = 1.4;
		break;
	}
	if ($('[data-panel="option"]').css('opacity') == 1){
		$('[data-panel="option"]').css({ 'width': $('body').width() / zoomsize - 43 / zoomsize});
	}
	
    var _w = $('body').width() - (parent == '#query' ? 60 : 88);
    var _min_w = 0;

	var arr_left = $(target).offset().left + 3;
    var arr_top = $(target).offset().top + 3;

	var arr_before = new Array(0);
	var arr_after = new Array(0);

	var arr_h_before = $(target).height();
	var arr_h_after = 0;
	var arr_h;

	$(target + ' > li').each(function (i, e) {
		var _offset = $(this).offset();
		if ($('body').width() < 666 && $(target).attr('data-panel') != 'menulist') {
			_offset.left = parent == '#query' ? 10 : 2;
			_offset.top = _offset.top - arr_top;
		} else {
			_offset.left = _offset.left - arr_left;
			_offset.top = _offset.top - arr_top;
		}
		arr_before.push(_offset);
		
	});
	$(target).css({ 'width': _w / zoomsize, 'height': 'auto' });

	$(target + ' > li').removeAttr('style');
	if ($('body').width() < 666) {
		if (parent == '#query'){
			_min_w = $(target).width() - 12;
			//_min_w = $('body').width() - 72;
			if ($(target).attr('data-panel') != 'menulist'){
				$(target + ' > li').css('min-width', _min_w);
			}
			
		} else {
			//$(target + ' > li').css('min-width', $(parent).width() - 7);
			$(target + ' > li').css({'min-width': $(parent).width(), 'padding-left': 6});			
		}
    }

	arr_h_after = $(target).height();

	$(target + ' > li').each(function (i, e) {
		var _offset = $(this).offset();
		if ($('body').width() < 666 && $(target).attr('data-panel') != 'menulist') {
			_offset.left = parent == '#query' ? 10 : 2;
			_offset.top = _offset.top - arr_top;
		} else {
			_offset.left = _offset.left - arr_left;
			_offset.top = _offset.top - arr_top;// - (parent == '#query' ? 1 : -1);
		}

		arr_after.push(_offset);
	});
	
	for(var key in arr_after){
		if (arr_before[key].left < 0 || arr_before[key].top < 0){
			arr_before[key] = arr_after[key];
		} else if (Math.abs(arr_before[key].left - arr_after[key].left) <= 1 || Math.abs(arr_before[key].top - arr_after[key].top) <= 1){
			arr_before[key] = arr_after[key];
		}
	}
	
	$(target).css({ 'width': '' });
	
	if (arr_h_after > arr_h_before) {
		$(target).css({ 'height': arr_h_before, 'width': _w}).stop(true, true).animate({ 'height': arr_h_after }, 300, "easeOutQuart");
	} else {
		$(target).css({ 'height': arr_h_before, 'width': _w}).stop(true, true).animate({ 'height': arr_h_after }, 400, "easeInExpo");
	}
	
	for (var i = 0; i < arr_before.length; i++) {
		$(target + ' > li:nth-child(' + (i + 1) + ')').css({ 'position': 'absolute', 'top': arr_before[i].top, 'left': arr_before[i].left });
	}

	for (var k = 0; k < arr_before.length; k++) {
		var _this = $(this);
	
		var cb = function() {

			if ($(this).attr('data-hidden') == 'wakeup'){
				$(this).css('opacity',0).attr('data-hidden','').delay(500).animate({'opacity': 1}, 300);
			}
		};
		if (k == arr_before.length - 1){
			if (typeof(callback) === 'function'){
				cb = function(){
					var _t = $(this);
					if ($(this).attr('data-hidden') == 'wakeup'){
						$(this).css('opacity',0).attr('data-hidden','').delay(500).animate({'opacity': 1}, 300);
					}
					
					var opensub = $(target + ' > li > ol').filter(function(i, e){
						return $(this).css('display') == 'block';
					});
					
					if (opensub.length > 0){
						
						$(opensub).each(function(i, e){
							var subid = '#' + $(this).attr('id');
								setTimeout(function(){
									//console.log('call=' + subid);
									callback(subid);
								}, 100);
						});
					} else {
						// 向上時延遲resize
						setTimeout(function(){
							callback();
						},100);
					}
				};
			} else {
				if ($(this).attr('data-hidden') == 'wakeup'){
					$(this).css('opacity',0).attr('data-hidden','').delay(500).animate({'opacity': 1}, 300);
				}
			}
		}
		
		$(target + ' > li:nth-child(' + (k + 1) + ')').stop(true, true).animate({ 'top': arr_after[k].top, 'left': arr_after[k].left}, 300, "easeInOutQuart", cb);
	}
}

function reisze_allbook(){
	$('[data-panel="tqc"]').each(function() {
		var panelId = $(this).attr('id');
		if (panelId && panelId.toLowerCase() !== 'search_panel') {
			resize_quicksandbook(`#${panelId}`, `#${panelId} [data-panel="bookwall"] ul.align`);
		}
	});
}
function resize_quicksandbook(parent, target, callback) {
    if ($(parent).css('display') != 'block') return;
    if ($(target).css('display') != 'block') return;
    if ($(target).html() == '') return;
    if ($(parent).css('display') == 'none') return;
	
	//console.log(parent, target);
    if ($(target + ' li').is(':animated')) {
        $(target + ' li').stop().clearQueue();
    }

	var zoomsize = 1.0;
	switch($('body').attr('data-size')){
		case '2':
			zoomsize = 1.2;
		break;
		case '3':
			zoomsize = 1.4;
		break;
	}
	
    var _w = $('body').width() / zoomsize;
    var icon_w = 305;
    var arr_top = 0;
    var arr_top_after = 0;
    var arr_left = 29;
    var _min_w = 0;

    arr_top = $(target).offset().top;
    arr_top_after = arr_top;

    if ($('body').width() / zoomsize < 320) {
        icon_w = _w - 10;
        _min_w = icon_w - 10;
    }

    var _chk1 = Math.floor((_w - 50) / icon_w);
    var _chk2 = typeof ($(target).attr('data-width')) != 'undefined' ? $(target).attr('data-width') : $(target).width();

    $(target).attr('data-width', _chk1);

    var arr_before = new Array(0);
    var arr_after = new Array(0);

    var arr_h_before = $(target).height();
    var arr_h_after = 0;
    var arr_h;


    $(target + ' > li').each(function (i, e) {
        arr_before.push($(this).offset());
    });
    $(target + ' ').css({ 'width': 'auto', 'height': 'auto' });

    $(target + ' > li').removeAttr('style');
    if (_min_w != 0) $(target + ' > li').css('min-width', _min_w);

    $(target).css('width', _w - 30);
    arr_h_after = $(target).height();

    $(target + ' > li').each(function (i, e) {
        arr_after.push($(this).offset());
    });
    $(target).css({ 'width': '' });
    //取最大		

	arr_top = arr_top + 30;
    for (var i = 0; i < arr_before.length; i++) {
        if (_min_w != 0) {
            $(target + ' > li:nth-child(' + (i + 1) + ')').css({ 'min-width': _min_w, 'position': 'absolute', 'top': arr_before[i].top - arr_top, 'left': arr_before[i].left - arr_left});
        } else {
            $(target + ' > li:nth-child(' + (i + 1) + ')').css({ 'position': 'absolute', 'top': arr_before[i].top - arr_top, 'left': arr_before[i].left - arr_left });
        }
    }
	// 框
    if (arr_h_after > arr_h_before) {
        $(target).css({ 'height': arr_h_before, 'width': _w - 20, 'left': 0 }).stop(true, true).animate({ 'height': arr_h_after }, 600, "easeOutQuart");
    } else {
        $(target).css({ 'height': arr_h_before, 'width': _w - 20, 'left': 0 }).stop(true, true).animate({ 'height': arr_h_after }, 800, "easeInExpo");
    }
    var _adjust = -35;
    if (arr_before.length > 0) {
        if ($('body').width() < 320) {
            _adjust = -(arr_after[0].left - 0);  //修正此頁會靠左對齊
        }
    }
	arr_top_after = arr_top_after + 30
	
	var cb = function() {

		if ($(this).attr('data-hidden') == 'wakeup'){
			$(this).css('opacity',0).attr('data-hidden','').delay(100).animate({'opacity': 1}, 300);
		}
	};
		
    for (var i = 0; i < arr_before.length; i++) {
        $(target + ' > li:nth-child(' + (i + 1) + ')').stop(true, true).animate({ 'top': arr_after[i].top - arr_top_after, 'left': arr_after[i].left + _adjust }, 600, "easeInOutQuart", cb);
    }
}

function sortbookwall(panelSelector) {
    var $listItems = $(panelSelector + ' [data-panel="bookwall"] > ul > li');
	const sortOrder = $(panelSelector + ' [data-panel="ordermenu"] > li.selected').data('value') ?? '';
	
	$listItems.sort(function(a, b) {
		if (sortOrder === 'desc' || sortOrder === 'asc'){
			var textA = $(a).find('figcaption > h2').text().toUpperCase();
			var textB = $(b).find('figcaption > h2').text().toUpperCase();
			if (sortOrder === 'desc') {
				return (textA < textB) ? 1 : (textA > textB) ? -1 : 0;
			} else {
				return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
			}
		} else {
			var orderA = $(a).data('order');
			var orderB = $(b).data('order');
			return orderA - orderB;
		}
	});	

    $(panelSelector + ' [data-panel="bookwall"] > ul').empty().append($listItems);
	
	buildPanelAndBindClick(panelSelector);
	
	setTimeout(function(){
		reisze_allbook();
	}, 400);
}

function filter_quickmenu(filter, callback){
	if ($('#study_panel [data-panel="bookwall"] > li').is(':animated')) {
        $('#study_panel [data-panel="bookwall"] > li').stop().clearQueue();
    }
	if ($('#study_panel [data-panel="bookwall"] > li > ol > li').is(':animated')) {
        $('#study_panel [data-panel="bookwall"] > li > ol > li').stop().clearQueue();
    }
	
	// buildPanelAndBindClick('#study_panel');
	//var filter = val.split(',');
	
	
	//console.log(filter);
	var count = {};
	var len = $('#study_panel [data-panel="bookwall"] > ul > li').length - 1;
	$('#study_panel [data-panel="bookwall"] > ul > li').each(function(i, e){
		var datatype = $(this).attr('data-type');
		var remove = true;
		for(var key in filter){
			if (datatype.indexOf(filter[key]) > -1){
				//console.log(datatype, filter[key]);
				remove = false;
				if (!count[filter[key]]) {
					count[filter[key]] = 0;
				}
				count[filter[key]] += 1;
				// 這裡在數數量，所以不能提早break
				//break;
			}
		}
		
		var islast = false;
		if (i == len && typeof callback === 'function'){
			islast = true;
		}

		if (remove){
			$(this).animate({'opacity': 0}, 200, function(){
				$(this).attr('data-hidden','true').css({'display':'none','opacity':''});
			});
		} else {
			
			if ($(this).attr('data-hidden') == 'true'){
				$(this).attr('data-hidden','wakeup').css({'display':'','opacity':0});
				//$(this).css('opacity',0).attr('data-hidden','').delay(500).animate({'opacity': 1}, 300);

			} else {
				$(this).attr('data-hidden','').css({'display':'','opacity':''});
			}
		}
		
		if (islast) {
			//console.log(count);
			$('#study_panel [data-panel="quickmenu"] > li').each(function(){
				var dataValue = $(this).data('value');
				
				if (count.hasOwnProperty(dataValue)) {
					//console.log(dataValue, count[dataValue]);
					$(this).find('.msgbox > .msgcount').text(count[dataValue]);
				}	
			});
			
			

			callback();
		}
	});
}
function filter_quicksand(val, callback){
	
	if ($('#query [data-panel="checklist"] > li').is(':animated')) {
        $('#query [data-panel="checklist"] > li').stop().clearQueue();
    }
	if ($('#query [data-panel="checklist"] > li > ol > li').is(':animated')) {
        $('#query [data-panel="checklist"] > li > ol > li').stop().clearQueue();
    }
	// reset
	//$('[data-panel="checklist"] > li').removeClass('fadeOut fadeIn').addClass('fadeIn');//.attr('data-hidden','').css({'display':''});
	//$('[data-panel="checklist"] > li > ol > li').removeClass('fadeOut fadeIn').addClass('fadeIn');//.attr('data-hidden','').css('display','');
	
	
	//$('[data-panel="checklist"] > li').attr('data-hidden','').css({'display':''});
	//$('[data-panel="checklist"] > li > ol > li').attr('data-hidden','').css('display','');
	
	var filter = val.split(',');
	var len = $('#query [data-panel="checklist"] > li').length - 1;
	$('#query [data-panel="checklist"] > li').each(function(i, e){
		var datatype = $(this).attr('data-type');
		var remove = true;
		for(var key in filter){
			if (datatype.indexOf(filter[key]) > -1){
				remove = false;
				break;
			}
		}
		
		var islast = false;
		if (i == len && typeof callback === 'function'){
			islast = true;
		}
		
		var haschild = $(this).find('ol').length > 0 ? true : false;
		if (remove){
			$(this).animate({'opacity': 0}, 200, function(){
				$(this).attr('data-hidden','true').css({'display':'none','opacity':''});
				if (islast && haschild == false){
					callback();
				}
			});
			//$(this).removeClass('fadeOut fadeIn').addClass('fadeOut');
		} else {
			//$(this).animate({'opacity': 1}, 200, function(){
				if ($(this).attr('data-hidden') == 'true'){
					$(this).attr('data-hidden','wakeup').css({'display':'','opacity':0});
					if (islast && haschild == false){
						callback();
					}
				} else {
					$(this).attr('data-hidden','').css({'display':'','opacity':''});
					if (islast && haschild == false){
						callback();
					}
				}
			//});
		}
			
		if (haschild){			
			var len2 = $(this).find('ol > li').length - 1;
			var islast2 = false;
			$(this).find('ol > li').each(function(i2, e2){
				var datatype = $(this).attr('data-type');
				var remove = true;
				for(var key in filter){
					if (datatype.indexOf(filter[key]) > -1){
						remove = false;
						break;
					}
				}
				
				if (islast && len2 == i2){
					islast2 = true;
				}
				
				if (remove){
					//$(this).removeClass('fadeOut fadeIn').addClass('fadeOut');
					$(this).animate({'opacity': 0}, 200, function(){
						$(this).attr('data-hidden','true').css({'display':'none','opacity':''});
						if (islast2){
							callback();
						}						
					});
				} else {
					//$(this).animate({'opacity': 1}, 200, function(){
						if ($(this).attr('data-hidden') == 'true'){
							$(this).attr('data-hidden','wakeup').css({'display':'','opacity':0});
							if (islast2){
								callback();
							}
						} else {
							$(this).attr('data-hidden','').css({'display':'','opacity':''});
							if (islast2){
								callback();
							}
						}						
					//});				
				}
			});
		} else if (islast) {
			callback();
		}
	});
}

function switch_theme(theme, callback) {
    //console.log(theme);
	
	
	const eLearningCopy = cloneDeep(geteLearning());
	
    switch (theme) {
        case '#dark':
		case 'dark':
            $('head link[href="Css/css-light.css"]').attr('href', 'Css/css-dark.css');
			theme = 'dark';
			countstar();
			$('span[data-button="theme"]').attr('data-theme', theme);
			////window.history.pushState(theme, 'eLearning Search Tools', '#' + theme);
			eLearningCopy.theme = theme;
			localStorage.setItem('eLearning', JSON.stringify(eLearningCopy));
            break;
        case '#light':
		case 'light':
            $('head link[href="Css/css-dark.css"]').attr('href', 'Css/css-light.css');
			theme = 'light';
			$('span[data-button="theme"]').attr('data-theme', theme);
			////window.history.pushState(theme, 'eLearning Search Tools', '#' + theme);
			eLearningCopy.theme = theme;
			localStorage.setItem('eLearning', JSON.stringify(eLearningCopy));
            break;
		case 'nofog':
			window.history.pushState(theme, 'eLearning Search Tools', '#' + theme);
			break;
    }
	
	if (typeof callback === 'function') {
		callback();
	}
}

function countstar(){
	if(star == -1){
		star = 5;
		$('#stararea').removeClass('star').addClass('star');
		$('#stararea').attr('data-total', star);
	}
	
	$('#stararea').attr('data-count', star);
	star -= 1;
	clearTimeout(starcountdown);
	
	var total = parseInt($('#stararea').attr('data-total'));
	var da = Math.round(star / total * 113);

	$('#stararea svg circle').stop().animate({'stroke-dashoffset': 113 - da}, 100 );
		
	if (star > 0){
		life_countdown.update(star);
		starcountdown = setTimeout(countstar, 1000);
		
	} else {
		$('#stararea').removeClass('hidden').addClass('hidden').attr('data-count', 0);
		starcountdown = setTimeout(function(){
			$('#stararea').removeClass('hidden').removeClass('star');
		}, 1800);
	}
}
function countrocket(){
	
	$('#rocketarea').attr('data-count', rocket);
	rocket -= 1;
	clearTimeout(rocketcountdown);
	
	var total = parseInt($('#rocketarea').attr('data-total'));
	var da = Math.round(rocket / total * 113);

	$('#rocketarea svg circle').stop().animate({'stroke-dashoffset': 113 - da}, 100 );
	
	if (rocket > 0){
		rocket_countdown.update(rocket);
		rocketcountdown = setTimeout(countrocket, 1000);
		
	} else {
		$('#rocketarea').removeClass('hidden').addClass('hidden').attr('data-count', 0);
		clearInterval(rockettimer1);
		rocketcountdown = setTimeout(function(){
			$('#rocketarea').removeClass('hidden').removeClass('rocket');
			clearInterval(rockettimer2);
			context.clearRect(0, 0, canvas.width, canvas.height);
		}, 2500);
	}
}

function generateSwitchFilter(panelData, callback) {
	$('[class="switch-filter"]').html('');
	var animationPromises = []; // 用於存儲每個 li 的動畫承諾
	
	panelData.forEach(function(panelInfo) {
		if (panelInfo[4]) {
			//var panelContent = `<li data-filter="${panelInfo[0]}"><i class="fa ${panelInfo[3]}"></i></li>\n`;
			var panelContent = `<li data-filter="${panelInfo[0]}"><a><i class="fa ${panelInfo[3]}"></i><span></span></a></li>\n`;
			$('[class="switch-filter"]').append(panelContent);
		}
	});
	
	$('[class="switch-filter"]').find('li').each(function (i) {
		if (typeof callback === 'function') {
			var animationPromise = $(this).stop().clearQueue().css("top", 90).delay((i + 1) * 50).animate({ 'opacity': 1, top: 0 }, 'slow', 'easeOutBack').promise();
			animationPromises.push(animationPromise);	
		} else {
			$(this).stop().clearQueue().css("top", 90).delay((i + 1) * 50).animate({ 'opacity': 1, top: 0 }, 'slow', 'easeOutBack');	
		}
    });
	
	if (typeof callback === 'function') {
		// 使用 $.when().done() 監聽所有動畫完成
		$.when.apply($, animationPromises).done(function() {
			// 當所有動畫都完成時調用 callback
			$('[class="switch-filter"] li').first().addClass('selected');
			callback();
		});	
	} else {
		$('[class="switch-filter"] li').first().addClass('selected');
	}
}

function generatePanels(panelData, callback) {
	var resizeAllBooks = [];
	
	panelData.forEach(function(panelInfo) {
		
		var basicmenu = '';
		if (panelInfo[0] != 'search' && panelInfo[4]) {
			

			var extramenu = '';

			if (panelInfo[0] == 'study'){
								
				$(menulist.filter(item => item.title == "全部").flatMap(item => item.type.split(','))).each(function(i, e){
					var msg = '<span class="msgbox"><span class="msgcount"></span></span>';
					
					var tag2 = 'quickchk_' + i;
					var content = '';
					content += '<input type="checkbox" id="' + tag2 + '" name="' + tag2 + '" value="1" />';
					content += '<span class="icon_checkbox empty" data-animation="false"></span>';
					content += '<label for="' + tag2 + '" data-label="checkbox">' + e.toUpperCase() + '</label>';
	
					extramenu += `<li data-value="${e}">${content}${msg}</li>\n`;
				});	
				
				////$(menulist).each(function(i, e){
				////	var quick_selected = '';
				////	if (i == 0){
				////		quick_selected = ' class="selected"';
				////	}
				////	extramenu += `<li data-value="${e.type}"${quick_selected}>${e.title}</li>\n`;
				////});	
				
				
				basicmenu = `
	<ul class="submenu-filter">
		<li><ul data-panel="quickmenu">${extramenu}</ul></li>
		<li>
			<ul data-panel="ordermenu">
				<li data-value="asc"><i class="fa fa-sort-alpha-down-alt"></i></li>
				<li data-value="desc"><i class="fa fa-sort-alpha-up-alt"></i></li>
			</ul>
		</li>
		<li>
			<ol class="result-filter">
				<li data-filter="history" title="瀏覽記錄" data-toggle="tooltip"><i class="fa fa-history"></i></li>
				<li data-filter="list" class="selected" title="分頁模式" data-toggle="tooltip"><i class="fa fa-th"></i></li>
				<li data-filter="book" title="書本模式" data-toggle="tooltip"><i class="fa fa-book-open"></i></li>
			</ol>
		</li>
	</ul>
	<div id="sidebar" class="sidebar">
	  <ul></ul>
	</div>
				`;
				
			} else {
				basicmenu = `
	<ol class="result-filter">
		<li data-filter="list" class="selected" title="分頁模式" data-toggle="tooltip"><i class="fa fa-th"></i></li>
		<li data-filter="book" title="書本模式" data-toggle="tooltip"><i class="fa fa-book-open"></i></li>
	</ol>
				`;
			}
			
			var panelContent = `
<div id="${panelInfo[0]}_panel" class="panel" data-panel="tqc" data-cover="${panelInfo[5]}">
	<span class="ribbon"><span>${panelInfo[1]}</span></span>
	<div class="search_ani"><div></div></div>
	<h1>${panelInfo[2]}</h1>
	<div data-clock="clock"></div>
	${basicmenu}
	<div data-panel="bookwall"></div>
</div>`;

/*
	<div data-album="book">
		<div class="albuminfo">
			<label></label>
			<span></span>
		</div>
		<a href="#" class="albumclose"></a>
		<div class="turnbook-viewport">
			<div class="container">
				<div class="turnbook">
					<div ignore="1" class="next-button"></div>
					<div ignore="1" class="previous-button"></div>
				</div>
			</div>
		</div>
		
		<div class="album"><ul data-page="pagination" data-nowpage="1"></ul></div>
	</div>
*/
			$('#search_panel').after(panelContent);
			////resizeAllBooks.push(function() {
			////	resize_quicksandbook(`#${panelInfo[0]}_panel`, `#${panelInfo[0]}_panel [data-panel="bookwall"] ul.align`);
			////});
			////
			////$(window).on('resize', function resize_books() {
			////	resizeAllBooks.forEach(function(fn) {
			////		fn();
			////	});
			////});

			if (panelInfo[0] == 'study'){
				const panel = '#study_panel';
				
				
				$(panel + ' [data-panel="ordermenu"] > li').off('click');
				$(panel + ' [data-panel="ordermenu"] > li').click(function(){
					
					if ($(this).hasClass('selected')){
						$(panel + ' [data-panel="ordermenu"] > li').removeClass('selected');
					} else {
						$(panel + ' [data-panel="ordermenu"] > li').removeClass('selected');
						$(this).addClass('selected');
					}
					;
					sortbookwall(panel);
				});
				
				checkbox_radio_init(panel + ' [data-panel="quickmenu"]');
				
				//$('#study_panel [data-panel="quickmenu"] > li').off('click');
				$(panel + ' [data-panel="quickmenu"] > li > input[type="checkbox"]').off('change');
				$(panel + ' [data-panel="quickmenu"] > li > input[type="checkbox"]').change(function(){
					
					var selectedValues = [];
					$(panel + ' [data-panel="quickmenu"] > li > input[type="checkbox"]:checked').each(function() {
						selectedValues.push($(this).parent().data('value'));
					});

					
	
					////$(this).toggleClass('selected');
					////
					////var selectedValues = [];
					////$('#study_panel [data-panel="quickmenu"] > li.selected').each(function() {
					////	//selectedValues.add($(this).data('value'));
					////	selectedValues.push($(this).data('value'));
					////});
		
					//console.log(selectedValues);
					filter_quickmenu(selectedValues, function (){
						//console.log('callback');
						setTimeout(function(){
							reisze_allbook();
						}, 400);
					});
						
					//if ($('#study_panel [data-panel="quickmenu"] > li.selected').index() != $(this).index()) {
					//	$('#study_panel [data-panel="quickmenu"] > li').removeClass('selected');
					//	$(this).addClass('selected');
					//	
					//	filter_quickmenu($(this).attr('data-value'), function (){
					//		console.log('callback');
					//		setTimeout(function(){
					//			reisze_allbook();
					//		}, 400);
					//	});
					//}
				});
				
				$(panel + ' .submenu-filter .result-filter li').off('click');
				$(panel + ' .submenu-filter .result-filter li').click(function(){
					var filter = $(this).attr('data-filter');
					var targetbook = '[data-album="book"]';
					
					$(panel + ' .submenu-filter .result-filter li').removeClass('selected');
					$(this).addClass('selected');
									
					if(filter == 'list'){
						$('#sidebar').slideUp('fast');
					} else if (filter == 'history'){
						$('#sidebar').slideDown('fast');	
					}
				});
			}
		}
	});

	if (typeof callback === 'function') {
		callback();
	}
}

function setupClocks(...clockIds) {
	clockIds.forEach(clockId => {
		var actualId = clockId.startsWith('#') ? clockId : `#${clockId}`;
		actualId = actualId + '_panel';
		$(`${actualId} [data-clock="clock"]`).append('<span data-clock="LocalSysDate"></span><span data-clock="LocalSysTime"></span><span data-clock="LocalSysDay"></span>');
		$(`${actualId} [data-clock="clock"] [data-clock="LocalSysDate"]`).append('<div class="clockdate"><div class="year"></div><div class="month"></div></div>');
		$(`${actualId} [data-clock="clock"] [data-clock="LocalSysDay"]`).append('<div class="clockday"><div class="mask"><div class="freshlight"></div></div><div class="day"></div></div>');
		$(`${actualId} [data-clock="clock"] [data-clock="LocalSysTime"]`).append('<div class="flipTimer size45 count"><div class="hours"></div><div class="minutes"></div><div class="seconds"></div></div>');
		$(`${actualId} [data-clock="clock"] [data-clock="LocalSysTime"] .flipTimer`).flipTimer({target: `${clockId}_panel`});
	});
}

var helpTimer;
function konami() {

    // =========================================================
    // Help tooltip behavior
    // =========================================================
    $('[data-help]').click(function () {
        $(this).toggleClass('selected');
    });

    $('[data-help]').mouseover(function () {
        clearTimeout(helpTimer);
    });

    $('[data-help]').mouseout(function () {
        if ($(this).hasClass('selected')) {
            clearTimeout(helpTimer);
            helpTimer = setTimeout(function () {
                $('[data-help]').removeClass('selected');
            }, 3000);
        }
    });

    // =========================================================
    // 密技定義
    // 每個密技是一個物件，包含：
    //   name     : 密技名稱（debug用）
    //   sequence : 按鍵序列，支援兩種格式：
    //              1. 單一序列（一維陣列）
    //                 ["C","L","O","U","D"]
    //              2. 多序列（二維陣列），任一符合即觸發
    //                 [["C","L","O","U","D"], ["shift+C"]]
    //              每個元素可以是：
    //                 - 一般字元，例如 "D", "A"
    //                 - 特殊鍵名，例如 "ArrowUp", "Enter"
    //                 - 修飾鍵組合，例如 "shift+C", "ctrl+alt+X"
    //   action   : 觸發時執行的 function(e)
    // =========================================================
    var cheatCodes = [
        {
            name: "CLEAR",
            sequence: [["C","L","E","A","R"], ["C","L","S"]],
            action: function () {
                $('#question').val('').trigger('keyup');
            }
        },
        {
            name: "DARK",
            sequence: ["D","A","R","K"],
            action: function () {
                switch_theme('dark');
            }
        },
        {
            name: "LIGHT",
            sequence: ["L","I","G","H","T"],
            action: function () {
                switch_theme('light');
            }
        },
        {
            name: "SET",
            sequence: ["S","E","T"],
            action: function () {
                if ($('[data-button="setting"]').attr('class') != 'selected') {
                    $('[data-button="setting"]')[0].click();
                }
            }
        },
        {
            name: "ZOOM_IN",
            sequence: ["shift+K"],
            action: function () {
                var _e = $.Event('click');
                _e.key = 1;
                $('#search_ani').trigger(_e);
            }
        },
        {
            name: "ZOOM_OUT",
            sequence: ["shift+M"],
            action: function () {
                var _e = $.Event('click');
                _e.key = -1;
                $('#search_ani').trigger(_e);
            }
        },
        {
            name: "CLOUD",
            sequence: [["C","L","O","U","D"], ["shift+C"]],  // 打 CLOUD 或 Shift+C
            action: function () {
                initCloud();
                generate();
                updateView();
                update();
            }
        },
        {
            name: "NOCLOUD",
            sequence: [["N","O","C","L","O","U","D"], ["shift+N"]],  // 打 NOCLOUD 或 Shift+N
            action: function () {
                destory();
            }
        },
        {
            name: "SEARCH",
            sequence: ["S","E","A","R","C","H"],
            action: function () {
                $('#question').focus();
            }
        },
        {
            name: "STAR",
            sequence: ["S","T","A","R"],
            action: function () {
                $('#stararea').removeClass('hidden').removeClass('paused');
                $('body').attr('data-color', '');
                var _add = 30;
                if ($('#stararea').hasClass('star')) {
                    star += _add;
                    life_countdown.update(star);
                    countstar();
                } else {
                    star = _add;
                    life_countdown.update(star);
                    $('#stararea').addClass('star').attr('data-count', star);
                    countstar();
                }
                $('#stararea').attr('data-total', star);
                var _lifeadd = $('<span>').attr('data-addcount', '+' + _add);
                $('#stararea .lifecount').append(_lifeadd);
                setTimeout(function () {
                    $('#stararea .lifecount > span').first().remove();
                }, 1800);
            }
        },
        {
            name: "ROCKET",
            sequence: ["R","O","C","K","E","T"],
            action: function () {
                $('#rocketarea').removeClass('hidden').removeClass('paused');
                $('body').attr('data-color', '');
                var _add = 10;
                if ($('#rocketarea').hasClass('rocket')) {
                    rocket += _add;
                    rocket_countdown.update(rocket);
                    countrocket();
                } else {
                    rocket = _add;
                    rocket_countdown.update(rocket);
                    $('#rocketarea').addClass('rocket').attr('data-count', rocket);
                    countrocket();
                }
                clearInterval(rockettimer1);
                clearInterval(rockettimer2);
                rockettimer1 = setInterval(launch, 800);
                rockettimer2 = setInterval(loop, 1000 / 100);
                $('#rocketarea').attr('data-total', rocket);
                var _lifeadd = $('<span>').attr('data-addcount', '+' + _add);
                $('#rocketarea .lifecount').append(_lifeadd);
                setTimeout(function () {
                    $('#rocketarea .lifecount > span').first().remove();
                }, 1800);
            }
        },
        {
            name: "NOFOG",
            sequence: ["N","O","F","O","G"],
            action: function () {
                switch_theme('nofog');
                $('.code').removeClass('mosaic');
            }
        },
        {
            name: "COLOR",
            sequence: ["C","O","L","O","R"],
            action: function () {
                if ($('#stararea').hasClass('star')) {
                    star = 1;
                    countstar();
                }
                if ($('#rocketarea').hasClass('rocket')) {
                    rocket = 1;
                    countrocket();
                }
                $('body').attr('data-color', 'ani');
            }
        },
        // ---------------------------------------------------------
        // 範例：原版 Konami Code（方向鍵版）
        // 解開後可直接啟用
        // ---------------------------------------------------------
        // {
        //     name: "KONAMI",
        //     sequence: ["ArrowUp","ArrowUp","ArrowDown","ArrowDown",
        //                "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
        //                "B","A"],
        //     action: function () {
        //         alert('30 lives!');
        //     }
        // },
    ];

    // =========================================================
    // 將按鍵事件正規化成統一格式
    // 輸出範例："A", "shift+K", "ArrowUp", "ctrl+alt+X"
    // =========================================================
    function normalizeKey(e) {
		let key = e.key;
		if (!key) return "";

		var parts = [];

		if (e.ctrlKey)  parts.push("ctrl");
		if (e.altKey)   parts.push("alt");
		if (e.shiftKey) parts.push("shift");

		if (key.length === 1) {
			parts.push(key.toUpperCase());
		} else {
			parts.push(key);
		}

		return parts.join("+");
	}

    // =========================================================
	// 序列比對引擎（已修正支援單序列與多序列）
	// buffer : 目前已輸入的 key 序列（陣列）
	// 回傳 : { triggered: cheat | null, anyPrefix: boolean }
	// =========================================================
	function matchCheat(buffer) {
		var triggered = null;
		var anyPrefix = false;

		cheatCodes.forEach(function (cheat) {
			let sequences = cheat.sequence;

			// 統一轉成二維陣列
			if (!Array.isArray(sequences[0])) {
				sequences = [sequences];
			}

			for (var s = 0; s < sequences.length; s++) {
				var seq = sequences[s];

				if (buffer.length > seq.length) continue;

				let isMatch = true;
				for (var i = 0; i < buffer.length; i++) {
					if (seq[i] !== buffer[i]) {
						isMatch = false;
						break;
					}
				}

				if (!isMatch) continue;

				if (buffer.length === seq.length) {
					triggered = cheat;
					return { triggered: triggered, anyPrefix: anyPrefix }; // 找到就返回
				} else {
					anyPrefix = true;
				}
			}
		});

		return { triggered: triggered, anyPrefix: anyPrefix };
	}

    // =========================================================
    // ESC 處理（獨立，不走序列系統）
    // =========================================================
    function handleEsc() {
        var target = $("[id$='_panel']:visible").first().attr('id');
        var targetbook = '[data-album="book"]';
        if (target && $(targetbook).css('display') === 'block') {
            escape_book();
        }
        if ($('#answer .pop_more_tab').css('display') === 'block') {
            $('#answer .pop_more_tab').slideUp('fast');
            $('#answer .subtabmenu > .result-filter li[data-filter="list"]').click();
        }
        if ($('[data-button="setting"]').attr('class') === 'selected') {
            $('[data-button="setting"]')[0].click();
        }
        if ($('#stararea').hasClass('star')) { star = 1; countstar(); }
        if ($('#rocketarea').hasClass('rocket')) { rocket = 1; countrocket(); }
    }

    // =========================================================
    // 主要 keyup 監聽
    // =========================================================
    var buffer  = [];   // 目前按鍵序列（正規化後的字串陣列）
    var timer   = null;

    $('body').keyup(function (e) {

        // 輸入框內不觸發密技
        if ($('input, textarea, [contenteditable="true"]').is(':focus')) return;

        clearTimeout(timer);

        // 特殊鍵：ESC
        if (e.key === 'Escape') {
            handleEsc();
            buffer = [];
            return;
        }

        // 特殊鍵：Backspace（不進序列，直接作用在搜尋框）
        if (e.key === 'Backspace') {
            var q = $('#question').val();
            if (q.length > 0) {
                $('#question').val(q.slice(0, -1)).trigger('keyup');
            }
            buffer = [];
            return;
        }

        // 將按鍵正規化後加入 buffer
        var key = normalizeKey(e);
        if (!key) return;
        buffer.push(key);

        // 比對密技
        if (keyin == false) {
            var result = matchCheat(buffer);

            if (result.triggered) {
                result.triggered.action(e);
                buffer = []; // 觸發後重置
            } else if (!result.anyPrefix) {
                buffer = []; // 完全不符合任何前綴，重置
            }
            // anyPrefix == true → 繼續累積，等下一個按鍵
        }

        // 600ms 無輸入自動重置
        timer = setTimeout(function () {
            buffer = [];
        }, 600);
    });
}

function open_book(title, pages){
	var target = $("[id$='_panel']:visible").first().attr('id');
	var targetbook = '[data-album="book"]';
	if (target){
		target = '';//'#' + target

		var size = parseInt($('body').attr('data-size') ?? '1');
		
		$(targetbook + ' .albuminfo > label').text('zoom = A' + '+'.repeat(size - 1));
		$(targetbook + ' .albuminfo > span').text(title);
		
		
		$(targetbook).attr('data-totalpage', (pages + (pages % 2 == 0 ? 4 : 5)) / 2);
		countingpage(0);
		
		$(targetbook + '  > div.album ul li').css('top', 90);
		$(targetbook ).css('display','block').animate({'opacity': 1}, 300, function(){
			
			$(targetbook + ' > div.album').stop(true, true).css('bottom', -90).animate({'bottom': 0}, 'fast', 'easeOutBack', function(){
				$(targetbook + ' > div.album ul li').each(function (i) {
					var opacity = $(this).hasClass('selected') ? 1 : 0.5;
					$(this).stop(true, true).css("top", 90).delay((i + 1) * 50).animate({ top: 0 }, 'slow', 'easeOutBack');				
				});
			});
		});
		
		// close
		$(targetbook + ' .albumclose').off('click');
		$(targetbook + ' .albumclose').click('click', function(e){
			e.preventDefault();
			escape_book();
		});
		
		// zoom init
		////$(targetbook + ' .turnbook-viewport').off('mousewheel');
		////$(targetbook + ' .turnbook-viewport').on('mousewheel', function (event) {
		////	var delta = event.originalEvent.deltaY || -event.originalEvent.wheelDelta;
		////	var zoom = parseInt($('body').attr('data-size') ?? '1');
		////	
		////	if (delta > 0) {
		////		zoom -= 1;
		////		if (zoom < 1){
		////			zoom = 1;
		////		}
		////	} else {
		////		zoom += 1;
		////		if (zoom > 3){
		////			zoom = 3;
		////		}
		////	}
		////	
		////	$(targetbook + ' .albuminfo label').text('zoom = A' + '+'.repeat(zoom - 1));
		////	$('body').attr('data-size', zoom);
		////});	
		
		// album init
		if ($(window).width() > $('.album ul').width()){
		var albumleft = ($(window).width() - $('.album ul').width()) / 2;
			$(targetbook + ' > div.album ul').css('left', albumleft);
		} else {
			$(targetbook + ' > div.album ul').css('left',0);
		}

		var sub_drag = false;
		if ($(targetbook + ' > div.album ul').data('ui-draggable')) {
			$(targetbook + ' > div.album ul').draggable('destroy');
		}
		$(targetbook + ' > div.album ul').draggable({
			axis: 'x',
			handle: $(targetbook + ' > div.album ul li'),
			cancel: '',
			cursor: 'move',        // sets the cursor apperance
			opacity: 0.8,         // opacity fo the element while it's dragged
			revert: false,          // sets the element to return to its start location
			revertDuration: 900,
			start: function () {
				var offset = $(this).offset();
				//console.log(offset.left);
			},
			drag: function () {
				//var offset = $(this).offset();
				//var xPos = offset.left;
				//console.log(parseInt(xPos) - parseInt($('.mainlist_box').css('margin-left')));
			},
			stop: function () {
				sub_drag = true;
				xPos = $(this).offset().left;
				//console.log(xPos);
				setTimeout(function(){sub_drag=false}, 800);
				resize_album(parseInt($(targetbook + ' > div.album ul').css('left').replace('px', '')));
			}
		});
		
		$(targetbook + ' > div.album').off('mousewheel');
		$(targetbook + ' > div.album').on('mousewheel', function (event) {
			var delta = event.originalEvent.deltaY || -event.originalEvent.wheelDelta;
			var targetul = $(this).find('ul');
			var left = parseInt($(targetul).css('left').replace('px', ''));
			
			if (delta > 0) {
				//向右(前)
				left -=10;
			} else {
				//向左(後)
				left += 10;
			}
			
			$(targetul).css('left', left);
			resize_album(left);
		});
	}
}
var pagelist = [];
function countingpage(currentpage) {
	
	var itempage = currentpage / 2;
	//console.log('countingpage=' + currentpage, ',itempage=' + itempage);
	var target = $("[id$='_panel']:visible").first().attr('id');
	var targetbook = '[data-album="book"]';
	if (target){
		target = '#' + target
		
		var totalpage = parseInt($(targetbook).attr('data-totalpage'));
		
		pagelist = [];
		if (totalpage > 0){
			// 為了active的置中，計算偏移值
			var moverange = itempage - 2 > 1 ? 1 : 0;
				  
			for (var i = itempage - (2 + moverange); i <= itempage + 2; i++) {
				if (i >= 1 && i <= totalpage) {
					pagelist.push({ key: i.toString(), value: i});
				}
			}

			while (pagelist.length < albumpagebuttons) {
				// 取得最後一個數字，加1後加入數組，但要確保不大於 totalpage
				var nextNumber = pagelist[pagelist.length - 1].value + 1;
						
				if (nextNumber <= totalpage) {
					pagelist.push({ key: nextNumber.toString(), value: nextNumber});
				} else {
					break; // 如果超過 totalpage，退出循環
				}
			}

			while (pagelist.length < albumpagebuttons) {
				// 取得第一個數字，減1後加入數組，但不能小於1
				var prevNumber = pagelist[0].value - 1;
				if (prevNumber >= 1) {
					pagelist.unshift({ key: prevNumber.toString(), value: prevNumber});
				} else {
					break; // 如果小於1，退出循環
				}
			}

			// 把第1組換成 1
			pagelist[0] = { key: '1', value: 1};
							  
			// 判斷第 2個數，若不是第1個數+1 的值，則改為 '...'
			if (totalpage > 2 && parseInt(pagelist[1].key) !== pagelist[0].value + 1) {
				pagelist[1] = { key: '', value: 0};
			}

			// 把最後一組，換成最大的數
			pagelist[pagelist.length - 1] = { key: totalpage.toString(), value: totalpage };

			// 判斷倒數第2個數，若不是最大值減1的值，則改為 '...'
			if (totalpage > 2 && parseInt(pagelist[pagelist.length - 2].key) !== totalpage - 1) {
				pagelist[pagelist.length - 2] = { key: '', value: 0};
			}
				  
			// 補上向前與向後的按鈕
			pagelist.splice(0, 0, { key: '«', value: -1, });
			pagelist.push({ key: '»', value: -2});
				  
			//console.log(JSON.stringify(pagelist, null, 2));
			//console.log(pagelist.map((item) => item.key).join(', '));
			
			//return pagelist;
			// 渲染
			$(targetbook + ' > div.album ul li').off('click');
			$(targetbook + ' > div.album ul').html('');
			
			
			// prevNumber = prevNumber * 2 - 1;
			
			//console.log(pagelist);
			$.each(pagelist, function(index, item) {
				var key = item.key;
				var val = item.value;
				if (parseInt(key) === val){
					val = (val - 1) * 2;
					key = val.toString();
					item.key = key;
					item.value = val;
				}
				
				var listItem = $('<li>').text(item.key);
				listItem.attr('data-page', item.key);
				//console.log(val, currentpage);
				if (key != '' && val === currentpage){
					listItem.addClass('selected');
				}
				
				listItem.on('click', function() {
					// 在這裡調用 pagerClick，並將當該項目的 {key, value} 作為參數傳遞
					pagerClick(this, {key: item.key, value: item.value});
				});
				
				$(targetbook + ' > div.album ul').append(listItem);
			});		
		}
	}
}
function pagerClick(_this, item){
	//console.log(item);
	var target = $("[id$='_panel']:visible").first().attr('id');
	var targetbook = '[data-album="book"]';
	if (target){
		target = '#' + target
		
		var currentpage = parseInt($(targetbook + ' > div.album ul > li.selected').attr('data-page'));
		var totalpage = parseInt($(targetbook).attr('data-totalpage'));
		totalpage = totalpage + (totalpage % 2 == 0 ? 2 : 3);
		
		//console.log(currentpage, totalpage);
		var page = 1;
		if (item.value === -1) {
			page = Math.max(0, currentpage - 2);
		} else if (item.value === -2) {
			page = Math.min(totalpage, currentpage + 2);
		} else {
			page = item.value;
		}
		  
		$(targetbook + ' > div.album > ul > li').removeClass('selected');
		$(targetbook + ' > div.album > ul > li[data-page="' + page + '"]').addClass('selected');
		//$(_this).addClass('selected');
		////var page = ($(this).index() + 1) * 2 - 1;
		//page = (page + 1) * 2 + 1;
		
		countingpage(page);
		$(targetbook + ' .turnbook').turn("page", page == 0 ? 1: page);
	}
}
function resize_album(){
	var target = $("[id$='_panel']:visible").first().attr('id');
	var targetbook = '[data-album="book"]';
	if (target){
		target = '#' + target
		var albumleft = null;
		var img_width = $(targetbook + ' > div.album > ul li.selected').width()+6;
		
		if (arguments.length >= 1){
			var callback = arguments[arguments.length -1];
			if (typeof(callback) == 'function'){
				albumleft = null;
			}
			
			if (typeof (arguments[0]) == 'number'){
				albumleft = arguments[0];
			}
		}
		
		if (albumleft == null || typeof (albumleft) == 'undefined'){
			albumleft = 0;
			if ($(window).width() > $(targetbook + ' > div.album ul').width()){
				albumleft = ($(window).width() - $(targetbook + ' > div.album ul').width()) / 2;
			}
		}
		
		var allow_w = 0;
		$(targetbook + ' > div.album > ul li').each(function(i, e){
			if ($(this).hasClass('selected')){
				return false;
			}
			
			allow_w += $(this).width()+6;
		});
				
		if (albumleft + allow_w > $(window).width() - img_width){
			albumleft = $(window).width() - allow_w - img_width;
		}
		if (albumleft + allow_w < 0){
			albumleft += -(albumleft + allow_w);
		}
		
		$(targetbook + ' > div.album ul').css('left',albumleft);
		if (arguments.length >= 1){
			var callback = arguments[arguments.length -1];
			if (typeof(callback)== 'function'){
				callback();
			}
		}
	}
}

function escape_book(){
	var target = $("[id$='_panel']:visible").first().attr('id');
	var targetbook = '[data-album="book"]';
	if (target){
		target = '#' + target
		$(targetbook + ' > .album > ul').find('li').each(function (i) {
			$(this).stop().clearQueue().css("top", 0).delay((i + 1) * 50).animate({ 'opacity': 0, top: 90 }, 'slow', 'easeOutBack');
		});
		$(targetbook).animate({'opacity': 0}, 300, function(){
			$(this).css({'display': 'none', 'opacity': 1});
			$(target + ' .result-filter li[data-filter="list"]').click();

			//$('body').css('overflow', 'auto');
		});
	}
}
	
function checkScheduleDisplay(startTime) {
	const maxDuration = 120000; // 最大持续时间为120000毫秒，即2分钟

    if (!startTime) {
        startTime = Date.now();
    }
	
    if ($('#main [data-box="schedule"]').css('display') === 'block') {
        //setTimeout(checkScheduleDisplay, 100);
		if (Date.now() - startTime < maxDuration) {
            setTimeout(() => checkScheduleDisplay(startTime), 100);
        }
    } else {
		$('#main [data-box="schedule"] [data-info="DownloadInfo"]').html('');
		$(".switch-filter").lavaLamp({ move: 'easeOutBack', leave: 'easeOutBack', speed: 700 });
		$('.switch-filter li a').rippleBtn();
			
		var main = $('.switch-filter li.selected').attr('data-filter');
		$('#' + main + '_panel').addClass('selected').delay(200).slideDown('fast', function(){
			loaddata();	
		});
    }
}

var loadcount = 0;
var recentDownloads = [];
let startTime; 
function simulateDownload(lastItem, filetype, isGroup, groupName) {
	if (!startTime) {
        startTime = new Date();
    }
	
	if (lastItem && typeof lastItem === 'object') {
		var book = '';
		if (filetype === undefined){
			if (isGroup === undefined || isGroup === false) {
				datalist.push(lastItem);
			} else {
				book = groupName ?? '';
			}
		
			if (lastItem.title) {
				//loadcount += lastItem.list.length;
				lastItem.list.forEach(function(item) {
					simulateDownload(item, filetype, true, lastItem.title + ' - ');
				});
			} else {
				if (Array.isArray(lastItem) && lastItem.length > 0) {
					book += lastItem[0].subject.title;
				} else {
					book += lastItem.subject.title;
				}
				
				loadcount +=1;
				const delay = loadcount * eLearning.load.speed;
				//console.log(loadcount, book);
				const currentLoadcount = loadcount;
				setTimeout(function() {
					recentDownloads.push(book);
					delayedDownload(currentLoadcount);
				}, delay);
			}
		} else {
			if (isGroup === undefined || isGroup === false) {
				tqclist[filetype] = lastItem;
				
				//Object.entries(tqclist).forEach(([key, value]) => {
				//	simulateDownload(value, filetype, true);
				//});
				lastItem.forEach(function(item) {
					simulateDownload(item, filetype, true);
				});
				
			} else {
				book = lastItem.problemSet.name;
				loadcount +=1;
				const delay = loadcount * eLearning.load.speed;
				//console.log(loadcount, book);
				const currentLoadcount = loadcount;
				setTimeout(function() {
					recentDownloads.push(book);
					delayedDownload(currentLoadcount);
				}, delay);
			}
		}
	} else {
		const delay = loadcount * eLearning.load.speed + 5;
		setTimeout(function() {
			let endTime = new Date(); // 獲取結束時間
			let duration = endTime - startTime; // 計算下載時間（毫秒）
			startTime = null;
			delayedDownload(-1, '下載結束，下載時間：', duration, '毫秒');
		}, delay);
	}
}

function delayedDownload(count) {
	
	var total = parseInt($('#main [data-box="schedule"] div[data-total]').attr('data-total'));
	if (count != -1){
		if (count > total){
			total = count;
			$('#main [data-box="schedule"] div[data-total]').attr('data-total', total);
			//console.log('reset quizTotal=' + total);
			var cfg = geteLearning();
			cfg.quizTotal = total;
			seteLearning(cfg);
		}
	} else {
		count = total;
		setTimeout(function(){
			$('#main [data-box="schedule"] span').attr('data-bar', '');
			$('#main [data-box="schedule"]').delay(50).slideUp('fast');
		}, 500);
	}
    var percent = Math.round(count / total * 100);
	//console.log(book, count, total, percent);
	
	var book = recentDownloads.slice(count - 5 >= 0 ? count - 5 : 0, count).map(function(item) {
		return '載入：' + item;
	}).join('<br/>');
	//console.log(count, book);
    $('#main [data-box="schedule"] div[data-percent]').attr('data-percent', percent);
    $('#main [data-box="schedule"] span').css('width', percent + '%');
	$('#main [data-box="schedule"] [data-info="DownloadInfo"]').html(book);
}	

(function ($) {
    $.fn.lavaLamp = function (options) {
        var settings = $.extend({
            move: 'linear',
            leave: 'linear',
            speed: 500,
            click: function () { }
        }, options);
		let isLeaving;
		
        // Function to destroy the plugin instance
        function destroy(me) {
            me.find('li.back').remove();
            me.removeData('lavaLamp');
            me.off('.lavaLamp'); // Unbind all event handlers within the namespace
        }

        return this.each(function (index) {
            var $me = $(this);

            // If an instance already exists, destroy it first
            if ($me.data('lavaLamp')) {
                destroy($me);
            }

            $me.data('lavaLamp', true); // Mark the element as having an instance

            var $back = $('<li class="back"><div class="left"></div></li>').appendTo($me),
                $li = $me.children("li").children("a"),
                curr = $me.find("li.selected a")[0] || $li.first().addClass("selected")[0];

            $back.css({ height: 0, top: 52, opacity: 0 }).animate({ height: 6, top: 46, opacity: 1 }, 100);

            $li.not(".back").hover(function () {
                clearTimeout(isLeaving);
				move($(this).parent());
				
            }, function () {
				isLeaving = setTimeout(() => {
					leave($(curr).parent());
				}, 50); 
            });
			
			$('.back').hover(
			  function () { 
				clearTimeout(isLeaving);
			  }, 
			  function () { 
			    leave($(curr).parent());
			  }
			);

            setCurrPos(curr);

            $li.not(".back").on('click.lavaLamp', function () {
                //$li.parent().removeClass("selected");
                //$(this).parent().addClass("selected");
                setCurrPos(this);
            });

            $me.on('goclick.lavaLamp', function (e, button) {
                setCurrPos(button);
                return settings.click.apply(this, [e, this]);
            });

            function setCurrPos(el) {
                $back.css({
                    left: $(el).parent().offset().left - 8 - parseInt($('.switch-filter').css('left')) + "px",
                    width: $(el).parent().width() + "px"
                });
                curr = el;
            }

            function move(el) {
                $back.stop(true).animate({
                    width: el.width(),
                    left: el.offset().left - 8 - parseInt($('.switch-filter').css('left'))
                }, settings.speed, settings.move);
            }

            function leave(el) {
                $back.stop(true).animate({
                    width: el.width(),
                    left: el.offset().left - 8 - parseInt($('.switch-filter').css('left'))
                }, settings.speed, settings.leave);
            }

            if (index === 0) {
                $(window).resize(function () {
                    setCurrPos(curr);
                });
            }
        });
    };
})(jQuery);

(function ($) {
    $.fn.vertLavaLamp = function (options) {
        var settings = $.extend({
            move: "linear",
			leave: "linear",
            speed: 500,
            click: function () { }
        }, options);

        // Function to destroy the plugin instance
        function destroy(me) {
            me.find('li.back').remove();
            me.removeData('vertLavaLamp');
            me.off('.vertLavaLamp'); // Unbind all event handlers within the namespace
        }

        return this.each(function (index) {
            var $me = $(this);

            // If an instance already exists, destroy it first
            if ($me.data('vertLavaLamp')) {
                destroy($me);
            }

            $me.data('vertLavaLamp', true); // Mark the element as having an instance

            var $back = $('<li class="back"><div class="top"></div></li>').appendTo($me),
                $li = $me.children("li"),
                curr = $me.find("li.selected")[0] || $li.first().addClass("selected")[0];

            $back.css({ opacity: 0 }).animate({ opacity: 1 }, 100);

            $li.not(".back").hover(function () {
                move($(this));
            }, function () {
				leave($(curr));
			});
			
            setCurrPos(curr);
			
			$li.not(".back").on('click.vertLavaLamp', function () {
                $li.removeClass("selected");
                $(this).addClass("selected");
                setCurrPos(this);
            });
			
            $me.on('goclick.vertLavaLamp', function (e, button) {
                setCurrPos(button);
                return settings.click.apply(this, [e, this]);
            });

            function setCurrPos(el) {
                $back.css({
                    top: $(el).offset().top - $me.offset().top - 1 + "px",
                    height: $(el).outerHeight() + 2 + "px"
                });
                curr = el;
            }

            function move(el) {
                $back.stop(true).animate({
                    height: el.outerHeight(),
                    top: el.offset().top - $me.offset().top
                }, settings.speed, settings.move);
            }

			function leave(el) {
                $back.stop(true).animate({
                    height: el.outerHeight(),
                    top: el.offset().top - $me.offset().top
                }, settings.speed, settings.leave);
            }
			
            if (index === 0) {
                $(window).resize(function () {
                    setCurrPos(curr);
                });
            }
        });
    };
})(jQuery);

/* button fresh light */
$.fn.extend({
    rippleBtn: function () {

        function aniEnd(obj, fn) {
            $(obj).on("animationend webkitAnimationEnd oanimationend MSAnimationEnd", fn);
        }

        return this.each(function () {

            var me = $(this);
            me.off('mousedown');
            me.on("mousedown", function (e) {

                var x = e.pageX,
                  y = e.pageY;

                x = x - me.offset().left;
                y = y - me.offset().top;

                var ripple = $("<span class='ripple'></span>");
                ripple.css({
                    left: x - 2,
                    top: y - 2
                });
                me.append(ripple);
                aniEnd(ripple, function () {
                    ripple.remove();
                });
            });
        });
    }
})

function cloneDeep(obj) {
    // 如果不是物件，直接返回原值
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    // 創建新的物件或陣列
    var newObj = Array.isArray(obj) ? [] : {};

    // 遞歸地複製每個屬性或元素
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key] = cloneDeep(obj[key]);
        }
    }

    return newObj;
}

function seteLearning(eLearning){
	localStorage.setItem('eLearning', JSON.stringify(eLearning));
}
function geteLearning(){
	const defaultspeed = 10;
	var eLearning = localStorage.getItem('eLearning') ? JSON.parse(localStorage.getItem('eLearning')) : {};
	eLearning.quizTotal = eLearning.quizTotal !== undefined ? eLearning.quizTotal : defaultspeed;
	eLearning.theme = eLearning.theme !== undefined ? eLearning.theme : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
	var currentDate = getCurrentDateFormatted();
	// 設置 load 預設值，如果讀不到值或日期不同
	if (eLearning.load === undefined || (eLearning.load.date === undefined) || eLearning.load.date !== currentDate) {
		eLearning.load = {
			date: currentDate, // 預設為當天日期
			speed: defaultspeed // 預設速度
		};
	} else {
		eLearning.load.date = eLearning.load.date !== undefined ? eLearning.load.date : currentDate;
		eLearning.load.speed = eLearning.load.speed !== undefined ? eLearning.load.speed : defaultspeed;
	}
	
	return eLearning;
}
function getCurrentDateFormatted() {
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
function htmlEncode(str) {
	if (str == null) {
        return '';
    }
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
}
function formatDateTimeFromJson(jsonDate, gap) {
    var date = !jsonDate ? new Date() : new Date(parseInt(jsonDate.substr(6)));
    var formattedDate = date.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return gap ? formattedDate.replace(/ /, gap) : formattedDate;
}
function build_answer(panel, data, inputText){
	
	// 宣告變數存放標題和資料
	var tab_head = '';
	var tab_body = '';
	var countall = 0;
	var popmore = '';
	var searchicon = `<span class="g_custom"><i class="fa fa-search"></i></span>`;
	var checkicon = `<span class="g_custom"><i class="fa fa-check"></i></span>`;
	var pasteicon = `<span class="g_custom"><i class="fa fa-history"></i></span>`;
	var notfound = ``;
	
	
	$(panel + ' .subtabmenu > .tabs > ul li').off('click');
	$(panel + ' .subtabmenu > .tabs > ul li > span.g_close').off('click');
	$('#answer .pop_more_tab ul li span.g_close').off('click');
	
	var existingContent = $(panel + ' [data-tabpage="tab_0"] > [data-inputtext] > pre > ul').length > 0;//$(panel).find('[data-tabpanel]').length > 0;
	
	if (existingContent) {
		
		countall = parseInt($('.subtabmenu > a > .msgbox > .msgcount').text());
		
		if (typeof inputText != 'undefined' && inputText != ''){
			const lines = inputText.split('\n');
			var tab_inputContent = lines.map((line, index, array) => {
			
				const lineTime = index === array.length - 1 ? `<span data-time="${formatDateTimeFromJson()}"></span>` : '';
				const lineContent = line.trim() ? line : '&nbsp;';
				return `<li>${lineContent}${lineTime}</li>`;
			}).join('');
			
			//var tab_0_body = $(panel + ' [data-tabpage="tab_0"] > [data-inputtext] > pre');
			//tab_0_body.prepend(`<ul>` + tab_inputContent + '</ul>');
			
			var tab_0_body = $(panel + ' [data-tabpage="tab_0"] > [data-inputtext] > pre > ul');
			tab_0_body.prepend(tab_inputContent);
			$('#inputHistory').vertLavaLamp({ move: "easeOutBack", leave: 'easeOutBounce', speed: 700 });
		}
		
		var base_index = 0;
		$(panel).find('[data-tabpage]').each(function() {
			var tabNumber = parseInt($(this).attr('data-tabpage').replace('tab_', ''), 10);
			if (!isNaN(tabNumber) && tabNumber > base_index) {
				base_index = tabNumber;
			}
		});
		data.forEach(function(item, idx) {
			var index = base_index + idx;
			
			countall += item.count;
			
			// 動態生成標題列表
			var title = htmlEncode(item.title);
			var tab_close = `<span class="g_close"><i class="fa fa-times"></i></span>`;
			var msg = `<span class="msgbox"><span class="msgcount" data-total="${item.total}">${item.count}</span></span>`;

			tab_head += `<li data-tab="tab_${index + 1}" title="${title}" data-toggle="tooltip" >${searchicon}<span class="tabtitle" >${title}</span>${msg}${tab_close}</li>`;

			// 動態生成資料頁面
			tab_body += `
			<div data-tabpage="tab_${index + 1}" data-miss="${item.miss}">
			  <h3>${title}</h3>
			  <ol>
			  ${item.data}
			  </ol>
			</div>
			`;

			popmore += `<li data-tab="tab_${index + 1}" title="${title}" data-toggle="tooltip">${checkicon}<span>${title}</span>${tab_close}<span class="g_num">${item.count} / ${item.total}</span></li>`;
		});
		
		////$('.subtabmenu > a > .msgbox > .msgcount').text(countall);
		msgcount.update(countall);
		
		var tabs_head = $(panel).find('.tabs > ul > li').first();
		tabs_head.after(tab_head);
		
		var tabs_body = $(panel).find('.tabs ~ div > div').first();
		tabs_body.after(tab_body);
		
		var tabs_more = $('#answer .pop_more_tab > ul > li').first();
		tabs_more.after(popmore);
		
	} else {
		
		if (typeof inputText != 'undefined' && inputText != ''){
			var title = htmlEncode('搜尋內容');
			tab_head += `<li data-tab="tab_0" title="${title}" data-toggle="tooltip" >${pasteicon}<span class="tabtitle" >${title}</span></li>`;
			popmore += `<li data-tab="tab_0" title="${title}" data-toggle="tooltip">${checkicon}<span>${title}</span></li>`;
			
			const lines = inputText.split('\n');
			var tab_inputContent = lines.map((line, index, array) => {
			
				const lineTime = index === array.length - 1 ? `<span data-time="${formatDateTimeFromJson()}"></span>` : '';
				const lineContent = line.trim() ? line : '&nbsp;';
				const escapedLineContent = lineContent != '&nbsp;' ? escapeHtml(lineContent) : lineContent; // 將內容轉義為HTML實體字符
				return `<li>${escapedLineContent}${lineTime}</li>`;
			}).join('');
			tab_body += `
			<div data-tabpage="tab_0">
			<div data-inputtext><pre><ul id="inputHistory">${tab_inputContent}</ul></pre></div>
			</div>
		  `;
		}
		
		// 依序處理每筆資料
		data.forEach(function(item, index) {
			
			//if (index == 0 && typeof inputText != 'undefined' && inputText != ''){
			//	var title = htmlEncode('搜尋內容');
			//	tab_head += `<li data-tab="tab_0" title="${title}" data-toggle="tooltip" >${pasteicon}<span class="tabtitle" >${title}</span></li>`;
			//	popmore += `<li data-tab="tab_0" title="${title}" data-toggle="tooltip">${checkicon}<span>${title}</span></li>`;
			//	
			//	const lines = inputText.split('\n');
			//	tab_body += `
			//	<div data-tabpage="tab_0">
			//	<div data-inputtext><pre><ul>${lines.map(line => line.trim() ? `<li>${line}</li>` : '<li>&nbsp;</li>').join('')}</ul></pre></div>
			//	</div>
			//  `;
			//}
		
			countall += item.count;
		  // 動態生成標題列表
		  var title = htmlEncode(item.title);
		  var tab_close = `<span class="g_close"><i class="fa fa-times"></i></span>`;
		  var msg = `<span class="msgbox"><span class="msgcount" data-total="${item.total}">${item.count}</span></span>`;

		  tab_head += `<li data-tab="tab_${index + 1}" title="${title}" data-toggle="tooltip" >${searchicon}<span class="tabtitle" >${title}</span>${msg}${tab_close}</li>`;

		  // 動態生成資料頁面
		  tab_body += `
			<div data-tabpage="tab_${index + 1}" data-miss="${item.miss}">
			  <h3>${title}</h3>
			  <ol>
			  ${item.data}
			  </ol>
			</div>
		  `;
		  
		  popmore += `<li data-tab="tab_${index + 1}" title="${title}" data-toggle="tooltip">${checkicon}<span>${title}</span>${tab_close}<span class="g_num">${item.count} / ${item.total}</span></li>`;
		});

		const downloadstatus = document.getElementById('pdfiframe') ? '' : 'disabled';

		// 組出完整的結構
		var tab_content = `
		<div data-tabpanel class="subtabmenu">
		  <a title="清單列表" data-toggle="tooltip"><span class="msgbox"><span class="msgcount"></span></span><i class="fa fa-bars"></i><div>        
		  </div></a>
		  <div class="pop_more_tab">
				<ul>${popmore}</ul>
		  </div>
		  <ul class="result-filter">
			<li data-filter="download" class="` + downloadstatus + `" title="下載PDF" data-toggle="tooltip"><i class="fa fa-download"></i></li>
			<li data-filter="list" class="selected" title="分頁模式" data-toggle="tooltip"><i class="fa fa-th-list"></i></li>
			<li data-filter="book" title="書本模式" data-toggle="tooltip"><i class="fa fa-book-open"></i></li>
		  </ul>
		  <div class="tabs">
		  <ul>
			${tab_head}
		  </ul>
		  </div>
		  <div>
			${tab_body}
		  </div>
		</div>
		`;

		$(panel).html(tab_content);
		
		//  new countUp($('.subtabmenu > a > .msgbox > .msgcount'), 0)
		msgcount = new countUp(document.querySelector('.subtabmenu > a > .msgbox > .msgcount'), 0);
		msgcount.update(countall);

		
		$('#inputHistory').vertLavaLamp({ move: "easeOutBack", leave: 'easeOutBounce', speed: 700 });
	}
	
	////$(panel + ' .subtabmenu > .tabs > ul li').off('click');
	$(panel + ' .subtabmenu > .tabs > ul li').click(function(e){
		e.preventDefault();
		var tabpanel = $(this).parent().parent().parent();
		var subpage = $(this).attr('data-tab');
		
		$(tabpanel).find(' .tabs > ul li').removeClass('selected');
		$(this).addClass('selected');
		$(tabpanel).find('[data-tabpage]').removeClass('selected');
		$(tabpanel).find('[data-tabpage="' + subpage + '"]').addClass('selected');
		
		$(panel + ' .pop_more_tab').find('[data-tab]').removeClass('selected');
		$(panel + ' .pop_more_tab').find('[data-tab="' + subpage + '"]').addClass('selected');
	});
	
	////$(panel + ' .subtabmenu > .tabs > ul li > span.g_close').off('click');
	////$('.pop_more_tab ul li span.g_close').off('click');
	
	$(panel + ' .subtabmenu > .tabs > ul li > span.g_close, ' + panel + ' .pop_more_tab ul li span.g_close').click(function(event){
		event.stopPropagation();
		var tabid = $(this).parent().attr('data-tab');

		$(panel + ' .pop_more_tab > ul > li[data-tab="' + tabid + '"]').fadeOut('fast').remove();
		
		var _this = $('.tabs > ul > li[data-tab="' + tabid + '"]');
		var _closeobj = $('.tabs > ul > li[data-tab="' + tabid + '"] .tabtitle');

		$(_closeobj).css('transition-duration','0s').animate({'max-width': 0}, 500, 'easeOutCirc', function(){
		
			$(_this).animate({'width':0}, 100, function(){
				var go_list = false;
				if($(_this).hasClass('selected')){
					go_list = true;
				}
				$(_this).remove();
				resize_tab_menu('#answer');
			
				$('[data-tabpage="' + tabid + '"]').remove();
				if (go_list){
					sub_goFirst();
				}
				if ($('.tabs > ul > li').length == 0){
					$('#question').val('').trigger('keyup');
				}
			});
		});
	});
			
	// 分頁/書本 模式切換
	$(panel + ' .subtabmenu > .result-filter li').off('click');
	$(panel + ' .subtabmenu > .result-filter li').click(function(){
		var filter = $(this).attr('data-filter');
		var targetbook = '[data-album="book"]';
		
		$(panel + ' .subtabmenu > .result-filter li').removeClass('selected');
		$(this).addClass('selected');
		if(filter == 'list'){
			//$('#answer').css('display', 'block');
			$(targetbook).css('display', 'none');
			$(targetbook + ' .turnbook-viewport').css('display', 'none');
		} else if(filter == 'book') {
			//$('#answer').css('display', 'none');
			$(targetbook).css('display', 'block');
			$(targetbook + ' .turnbook-viewport').css('display', 'block');
			open_book('搜尋結果', $('[data-no]').length);
			if ($('[data-no]').length % 2 == 0){
				loadBook($('[data-no]').length + 2, $('[data-no]').length, null, '<h1>搜尋結果</h1>');
			} else {
				loadBook($('[data-no]').length + 3, $('[data-no]').length, null, '<h1>搜尋結果</h1>');
			}
		} else if (filter == 'download'){
			if ($(this).hasClass('disabled') == false){
				print_pdf(function (){
					$(panel + ' .subtabmenu > .result-filter li[data-filter="list"]').click();
				});
			} else {
				$(panel + ' .subtabmenu > .result-filter li[data-filter="list"]').click();
			}
		}
	});
	// 清單列表
	$(panel + ' .subtabmenu > a').off('click');
	$(panel + ' .subtabmenu > a').click(function(){
		if ($(panel + ' .pop_more_tab').css('display') == 'none') {
            $(this).removeClass('selected').addClass('selected');
			$(panel + ' .pop_more_tab').slideDown('fast', function(){
				resize_more_tab(panel);
			});
        } else {
			$(this).removeClass('selected');
			$(panel + ' .pop_more_tab').slideUp('fast');
        }
	});
	
	$(panel + ' .pop_more_tab li').off('click');
	$(panel + ' .pop_more_tab li').click(function(){
		var tabid = $(this).attr('data-tab');
		$(panel + ' .subtabmenu > .tabs > ul > li[data-tab="' + tabid + '"]').click();
	});
	
	var scrollInstance = $(panel + ' .pop_more_tab ul').getNiceScroll();
	if (scrollInstance.length > 0) {
	  scrollInstance.remove();
	}
	$(panel + ' .pop_more_tab ul').niceScroll({ horizrailenabled: false });
	
	//$('.pop_more_tab').hover(function () {
    //}, function () {
    //    var _this = $(this);
    //    $('.pop_more_tab').fadeOut('fast', function () {
	//		$(panel + ' .subtabmenu > a').removeClass('selected');
    //        //$(_this).parent().parent().removeClass('selected');
    //    });
    //});
	// 解除绑定
	if ($(panel + ' .subtabmenu > .tabs > ul').is(':data(ui-sortable)')) {
	  $(panel + ' .subtabmenu > .tabs > ul').sortable('destroy');
	}
	$(panel + ' .subtabmenu > .tabs > ul').sortable({
        axis: 'x',
        placeholder: "",
        items: 'li:not(.sort_disabled)',
        start: function (ev, ui) { $(ui.placeholder).hide(300); },
        change: function (ev, ui) {$(ui.placeholder).hide().show(300); },
        update: function (ev, ui) { resort_pop_more_tab(panel); },
        stop: function (ev, ui) { $(this).find('li').removeAttr('style'); /*console.log('stop', $(this));*/ }
    });
	
	// tooltip
	$('.tooltip[role="tooltip"]').remove();
	$('[data-toggle="tooltip"]').each(function (i, e) {
		if (typeof ($(this).attr('title')) != 'undefined' && $(this).prop('tagName').toString().toLocaleLowerCase() != 'embed') {
			$(this).tooltip();
		}
	});
	
	//$(panel + ' .subtabmenu > .tabs > ul li:first-child').click();
	$(panel + ' .subtabmenu > .tabs > ul li:not([data-tab="tab_0"]):first').click();
	
	setTimeout(function(){
		resize_tab_menu('#answer');
	}, 500);
}

function escapeHtml(html) {
    const escapeChars = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    };
    return html.replace(/[&<>"'\/]/g, char => escapeChars[char]);
}

// 嘗試將 focus 移到最後一項
function sub_goLast() {
	if ($('.tabs ul li').length > 0){
		sub_btn('.tabs ul li:last');
	} else {
		$('#question').val('').trigger('keyup');
	}
}

// 嘗試將 focus 移到第一項
function sub_goFirst() {
	if ($('.tabs ul li').length > 0){
		sub_btn('.tabs ul li:first');
	} else {
		$('#question').val('').trigger('keyup');
	}
}
// 切換分頁選單按鈕
function sub_btn(tab) {
    //console.log(tab);
    //resize_tab_menu('#answer');

    var tabid = $(tab).attr('data-tab');
    if (typeof(tabid) == 'undefined') {
        return false;
    }
	
	var orginal_index = $('.tabs ul li.selected').index();
	var mainindex = $(tab).index();
	var goright = orginal_index > mainindex;

	if (orginal_index != mainindex) {

		$('.tabs ul li').removeClass('selected');
		$('.tabs ul li[data-tab="' + tabid + '"]').addClass("selected");
		
		$('[data-tabpage]').removeClass('selected');
		$('[data-tabpage="' + tabid + '"]').addClass("selected");

		$('#answer .pop_more_tab ul li').removeClass('selected');
		$('#answer .pop_more_tab ul li[data-tab="' + tabid + '"]').addClass('selected');
	
		if (goright) {
			//console.log('go right');
			//$(mainpage).stop().clearQueue().css({ 'display': 'block', 'left': -w }).animate({ 'left': 3 }, 275, "easeOutCirc", function () {
			//	resize_all_quicksand();
			//});
		} else {
			//console.log('go left');
			//$(mainpage).stop().clearQueue().css({ 'display': 'block', 'left': w }).animate({ 'left': 3 }, 275, "easeOutCirc", function () {
			//	resize_all_quicksand();
			//});
		}
	}
	else
	{
		//console.log('沒拖曳成功，回復位置');
		// 沒拖曳成功，回復位置
		//$(mainpage).stop().clearQueue().animate({ 'left': 3 }, 275, "easeOutCirc", function () {
		//	resize_all_quicksand();
		//});
	}
	
	resize_tab_menu('#answer');
}
$(document).keydown(function(e){
    var isInputFocused = $('input, textarea, [contenteditable="true"]').is(':focus');
	var isBookOff = $('[data-album="book"]').css('display') == 'none';
	//console.log(!isInputFocused, isBookOff)
	if ($('#answer').css('display') == 'block' && !isInputFocused && isBookOff){
		
		var total = $('.tabs ul li').length;
		var orginal_index = $('.tabs ul li.selected').index();
		var tabid = '';
		switch (e.keyCode) {
			case 37:
				
				if (orginal_index - 1 >= 0){
					sub_btn($('.tabs ul li').eq(orginal_index - 1));
				} else {
					sub_btn('.tabs ul li:last');
				}

			break;
			case 39:
				if (orginal_index + 1 < total){
					sub_btn($('.tabs ul li').eq(orginal_index + 1));
				} else {
					sub_btn('.tabs ul li:first');
				}

				//e.preventDefault();

			break;
		}
	}
});
function resort_pop_more_tab(panel){
	// tab_head += `<li data-tab="tab_${index + 1}" title="${title}" data-toggle="tooltip" >${searchicon}<span class="tabtitle" >${title}</span>${msg}</li>`;
	var popmore = '';
	var checkicon = `<span class="g_custom"><i class="fa fa-check"></i></span>`;
	$(panel + ' .subtabmenu > .tabs > ul li').each(function(i, e){
		var isselected = $(this).hasClass('selected') ? ' class="selected"' : '';
		var tab_id = $(this).attr('data-tab');
		var tab_title = $(this).find('.tabtitle').text();
		var tab_count = $(this).find('.msgcount').text();
		var tab_total = $(this).find('.msgcount').attr('data-total');
		var tab_num = tab_count && tab_total ? `<span class="g_num">${tab_count} / ${tab_total}</span>` : '';
		
		popmore += `<li data-tab="${tab_id}" title="${tab_title}" data-toggle="tooltip" ${isselected}>${checkicon}<span>${tab_title}</span>${tab_num}</li>`;	
	});

	$(panel + ' .subtabmenu > a').off('click');
	$(panel + ' .pop_more_tab > ul').html(popmore);
	resize_more_tab(panel);
	$(panel + ' .subtabmenu > a').click(function(){
		if ($(panel + ' .pop_more_tab').css('display') == 'none') {
            $(this).removeClass('selected').addClass('selected');
			$(panel + ' .pop_more_tab').slideDown('fast', function(){
				resize_more_tab(panel);
			});
        } else {
			$(this).removeClass('selected');
			$(panel + ' .pop_more_tab').slideUp('fast');
        }
	});
	
}

function resize_more_tab(panel) {
	var zoomsize = 1.0;
	switch($('body').attr('data-size')){
		case '2':
			zoomsize = 1.2;
		break;
		case '3':
			zoomsize = 1.4;
		break;
	}
    var w = $('body').width() / zoomsize;

    if (typeof ($(panel + ' .pop_more_tab').html()) != 'undefined') {
        
        if ($(panel + ' .pop_more_tab').css('display') != 'none') {
            $(panel + ' .pop_more_tab ul li').removeAttr('style');
			$(panel + ' .pop_more_tab ul li span:nth-child(2)').removeAttr('style');
			
            var field_w = $(panel + ' .pop_more_tab').width();
			
			if (field_w - 130 > w){
				$(panel + ' .pop_more_tab ul li').css({ 'width': w - 130 });
				$(panel + ' .pop_more_tab ul li span:nth-child(2)').css({ 'width': w - 130 });
			} else {
				//console.log($(panel + ' .pop_more_tab ul li').width(),$(panel + ' .pop_more_tab ul li span:nth-child(2)').width());
				$(panel + ' .pop_more_tab ul li').css({ 'width': field_w});
				$(panel + ' .pop_more_tab ul li span:nth-child(2)').css({ 'width': field_w - 110});
			}
			
        }
    }
}

function resize_tab_menu(panel) {
	if ($(panel).parent().css('display') != 'block'){
		return;
	}
	
	resize_more_tab(panel);
	var zoomsize = 1.0;
	switch($('body').attr('data-size')){
		case '2':
			zoomsize = 1.2;
		break;
		case '3':
			zoomsize = 1.4;
		break;
	}
	
    var w = $('body').width();
	var rf_w = $(panel + ' .result-filter li').length * 59;
    $(panel + ' .tabs').css({ 'width': (w - rf_w * zoomsize) / zoomsize });
    $(panel).css({ 'width': (w - 40) / zoomsize });
	var mintab = $(panel + ' .subtabmenu > .tabs > ul').attr('class');
	
	var $clonedUl = $(panel + ' .subtabmenu > .tabs > ul').clone();
	$clonedUl.removeClass();
	$('body').append($clonedUl);
	$clonedUl.css({
		'position': 'absolute', // 脱离文档流，避免影响布局
		'visibility': 'hidden', // 隐藏元素，但仍可计算宽度
		'max-width': 'none'     // 移除 max-width 限制
	});

	var totalWidth = $($clonedUl).find('li:not(.selected)').map(function() {
		return $(this).outerWidth(true);
	}).get().reduce(function(acc, cur) {
		return acc + cur;
	}, 0);
	$clonedUl.remove();
	
	//$(panel + ' .subtabmenu > .tabs > ul').addClass('mintabstop');
    $(panel + ' .subtabmenu > .tabs > ul li').removeAttr('style');
	
	var selectedWidth = $(panel + ' .subtabmenu > .tabs > ul li.selected').outerWidth(true);
	//var totalWidth = $(panel + ' .subtabmenu > .tabs > ul li:not(.selected)').map(function() {
	//	return $(this).outerWidth(true);
	//}).get().reduce(function(acc, cur) {
	//	return acc + cur;
	//}, 0);
	
	//$(panel + ' .subtabmenu > .tabs > ul').removeClass('mintabstop');
	//                            150 = [download, list, book] + 20 = [history]
    var tab_max_w = w - selectedWidth - 150 - 20;
    var tab_count = $(panel + ' .subtabmenu > .tabs > ul li').length - 1;
	//console.log(selectedWidth, tab_max_w, tab_count, tab_max_w / tab_count);
	//console.log(totalWidth, tab_max_w);
	if (totalWidth < tab_max_w){
		$(panel + ' .subtabmenu > .tabs > ul').attr('class', '');
	} else {
	
		const baseWidth = 55;
		const step = 15;
		const maxWidth = 340;
		const $ul = $(panel + ' .subtabmenu > .tabs > ul');
		for (let width = baseWidth; width <= maxWidth; width += step) {
			
			//console.log(tab_max_w, tab_count, width);
			if (tab_max_w / tab_count < width) {
				const className = `mintab${Math.max(0, width - 75)}`;
				
				if (mintab != className){
					$ul.attr('class', '').addClass(className);
					//console.log(tab_max_w, tab_count, width, className);
				}
				break;
			}
		}
	}
}

class Ans {
	constructor(ans, index) {
		this[`答案${index}`] = ans;
	}
}

class Node {
	constructor(q, list) {
		this.q = q;
		this.list = list;
	}
}

class Root {
	constructor(subject) {
		this.subject = subject;
	}
}

function parseText(inputText) {

	inputText += "\r\n";
	let lines = inputText.split('\n');

	let hasNumberedFormat = lines.some(l => l.trim().length > 0 && /^\d+$/.test(l.trim()));
	if (hasNumberedFormat) {
		lines = lines.map(line => {
			let w = line.trim();
			if (/^\d+$/.test(w)) return '';
			if (w === '是非題') return '';
			if (w === '單選題') return '';
			return line;
		});
	}

	let subjects = [];//new SubjectNode('練習題', []);
	let currentTitle = '';
	let q = '';
	let anslist = [];
	let ans = {};
	let row = 0;
	let ansGroup = [];
	let searchcount = 0;
	let totalsubjects = 0;
	
	// 先整理完 q + ans 或 都是 q 
	// q + ans 的用 完整的q 來找答案
	// 只有q的時候找出可能的 Q + A
	lines.forEach(line => {
		let w = line.trim().replace(/\t/g, '').replace(/`/g, ''); // 过滤掉 ` 符号
		
		if (!w || (w.slice(-1) === '.' && /^[0-9.]+$/.test(w))) {
			row = -1;

			if (q) {
				subjects.push({
                    title: q,
    				miss: false,
                    list: [new Node(q.trim(), anslist)]
                });
			}
			
			anslist = [];
			ans ={};
			q = '';
		} else {
			if (row === 0) {
				let matches = w.match(/^[0-9.]+/);
				if (matches && matches.length === 1) {
					let head = matches[0];
					w = w.slice(head.length).trim();
				}
				q = w;
				////////ans = search_all(q);
				//console.log(ans);
			} else {

				//if (ans.list.some(ansItem => w.includes(ansItem))) {
				//	w = '*' + w;
				//}
				
				anslist.push(new Ans(w, row));
			}
		}

		row += 1;
	});

// 尋找並組合結果
	subjects.forEach(subject => {
		
		
		subject.list.forEach(node => {
			let keyword = node.q;
			if (node.list.length == 0){
				var allans = search_all(keyword);
				//console.log(allans);
				if (allans && allans.sublist && allans.sublist.length > 0){
					totalsubjects = allans.totalsubjects;
					
					var searchcount = 0;
					var ansChild = [];
					$(allans.sublist).each(function(iSub, eSub){

						searchcount += 1;
						//console.log(eSub.head, keyword);
						var head = '<li data-guide="node" data-no="' + searchcount + '"><div data-icon="q">' + eSub.head.replace(keyword, '<strong>' + escapeHtml(keyword) + '</strong>') + '</div></li>';
						/*
						<li data-guide="node" data-no="1">
							<div data-icon="q">對於「個資委外管理規範」之規定，<strong>下列何者正確</strong>？</div>
						</li>
						<li data-guide="node">
							<div class="note">
								<ul data-star="true">
									<li>答案1:選商前應請廠商填寫「個人資料委託作業風險評估聲明書」</li>
									<li><strong>答案2:*以上皆是</strong></li>
									<li>答案3:委外業務負責人應每年定期評估委外廠商，並填寫「個人資料委託管理狀況評估表」</li>
									<li>答案4:其評估項目應包含個資法細則第12條之安全維護措施</li>
								</ul>
							</div>
						</li>
						<li data-guide="node" data-no="2">
							<div data-icon="q">關於個人資料管理內部評核作業，<strong>下列何者正確</strong>？</div>
						</li>
						<li data-guide="lastnode">
							<div class="note">
								<ul data-star="true">
									<li><strong>答案1:*以上皆是。</strong></li>
									<li>答案2:稽核範圍為上次稽核基準日起至本次稽核基準日為止。</li>
									<li>答案3:一年應至少執行一次。</li>
									<li>答案4:個資管理內部稽核員不能稽核本身負責之業務。</li>
								</ul>
							</div>
						</li>
						*/
						var tmplist = '';
						var hasstar = 'false';
						var ansData = '';
						$(eSub.list).each(function(iList, eList){
							if (eList.startsWith('<strong>')){
								hasstar = 'true';
							}
							tmplist += '<li>' + eList + '</li>';
						});
						
						//if (allans.sublist.length == iSub + 1){
						//	ansData += head + '<li data-guide="lastnode"><div class="note"><ul data-star="' + hasstar + '">' + tmplist + '</ul></div></li>';
						//} else {
							ansData += head + '<li data-guide="node"><div class="note"><ul data-star="' + hasstar + '">' + tmplist + '</ul></div></li>';
						//}
						
						addAndChild(ansChild, eSub.title, ansData);
					});
					
					//console.log(ansChild);
					ansChild.forEach(child => {
						
						let childList = child.list.join('');
						const findnode = '<li data-guide="node">';
						var lastIndex = childList.lastIndexOf(findnode);
						if (lastIndex !== -1) {
						  childList = childList.substring(0, lastIndex) + '<li data-guide="lastnode">' + childList.substring(lastIndex + findnode.length);
						}
						
						ansGroup.push(
						{
							title: child.title,
							miss: child.list.length > 0 ? false : true,
							count: child.list.length, // 符合主題的答案數
							total: totalsubjects, // 幾個主題
							data: childList
						});
						
						console.log(ansGroup);
					});
					
				} else {
					ansGroup.push(
					{
						title: keyword,
						miss: true,
						count: 0, // 符合主題的答案數
						total: totalsubjects, // 幾個主題
						data: '<li data-guide="node" data-no="0"><div data-icon="q">' + escapeHtml(keyword) + '</div></li>' + '<li data-guide="lastnode"><div class="note"><ul data-star="false"><li>Not Found</li></ul></div></li>'
					});
				}
				//console.log('search_all', allans);
			} else {
				//if (keyword.length > 10){
				//	keyword = keyword.slice(3, -3);
				//} else if (keyword.length > 5) {
				//	keyword = keyword.slice(1, -1);
				//}
				search(keyword, function (data){
					if (data && data.length > 0){
						data.forEach(subdata => {
							ansGroup.push(subdata);
						});
					} else {
						ansGroup.push(
						{
							title: keyword,
							miss: true,
							count: 0, // 符合主題的答案數
							total: totalsubjects, // 幾個主題
							data: '<li data-guide="node" data-no="0"><div data-icon="q">' + escapeHtml(keyword) + '</div></li>' + '<li data-guide="lastnode"><div class="note"><ul data-star="false"><li>Not Found</li></ul></div></li>'
						});
					}
					//console.log('search', keyword, data);
				});
				
			}
		});
	});

	console.log(ansGroup);
	setTimeout(function(){

		let mergedAnsGroup = [];
		ansGroup.forEach(item => {
			let existing = mergedAnsGroup.find(g => g.title === item.title);
			if (existing) {
				existing.data = existing.data.replace('<li data-guide="lastnode">', '<li data-guide="node">');
				existing.data += item.data;
				existing.count += item.count;
				existing.miss = existing.miss && item.miss;
			} else {
				mergedAnsGroup.push(Object.assign({}, item));
			}
		});
		ansGroup = mergedAnsGroup;

		$('#search_result').html('從<span>' + totalsubjects + '</span>筆中，共找到：<span>' + searchcount + '</span>筆符合。');
		//if (searchcount == 0){
		//	$('#answer').html('<div data-match="oops"><div></div><div></div></div>');
		//	loadBook(0);
		//} else {
			//$('#answer').html('<ul>' + anslist + '</ul>');
			build_answer('#answer', ansGroup, inputText);//document.getElementById('inputText').value);
			
			if ($('[data-no]').length % 2 == 0){
				loadBook($('[data-no]').length + 2, $('[data-no]').length, null, '<h1>搜尋結果</h1>');
			} else {
				loadBook($('[data-no]').length + 3, $('[data-no]').length, null, '<h1>搜尋結果</h1>');
			}
			
		//}
	}, 200);

}
function addAndChild(subjects, title, anslist) {
    
	let existingSubject = subjects.find(subject => subject.title === title);
	if (existingSubject) {
		existingSubject.list.push(anslist);
	} else {
		subjects.push({
			title: title,
			list: [anslist]
		});
	}
}

function addToSubjects(subjects, titles, q, anslist) {
    titles.forEach(title => {
		//const miss = !anslist.some(ans => {
        //    return Object.values(ans).some(value => value.startsWith('*'));
        //});

        // 如果找不到以 * 开头的项，修改 title
        //if (!hasStar) {
        //    title = title + '[not found]';
        //}
		
        let existingSubject = subjects.find(subject => subject.title === title);
        if (existingSubject) {
            existingSubject.list.push(new Node(q, anslist));
        } else {
            subjects.push({
                title: title,
				miss: false,
                list: [new Node(q, anslist)]
            });
        }
    });
}

function search_all(keyword){
	
	//console.log('keyword=', keyword);
	//if (keyword.length > 10){
	//	keyword = keyword.slice(3, -3);
	//} else if (keyword.length > 5) {
	//	keyword = keyword.slice(1, -1);
	//}
	console.log('keyword find by=', keyword);
	var data = {};
	
	// 找全部題庫
	var data = [];
	//var hintlist = '';
	var subtitles = [];
	$('[data-panel="checklist"] > li > input[type="checkbox"]').each(function(i, e){
		var target = $(this).attr('id').replace('chk_', '');
		
		if (datalist[target].title){
			if ($(this).prop('checked') && $(this).parent().attr('data-hidden') != 'true'){
				var _child = $(this).parent().find('> ol > li > input[type="checkbox"]');
				$(_child).each(function(si, se){
					if ($(this).prop('checked')){
						data.push(datalist[target].list[si]);
						//hintlist += '<li>' + datalist[target].list[si].subject.title + '</li>';	
					}
				});
			}
		} else {
			if ($(this).prop('checked')){
				$(datalist[target]).each(function(si, se){
					data.push(se);
					//hintlist += '<li>' + se.subject.title + '</li>';
				});
			}
		}
	});

	var ansGroup = [];
	var findGroup = [];
	var sublist = [];
	//console.log(data);
	$.each(data, function(i, e){
		
		
		$.each(e.subject.list, function(iSubject, eSubject){
			
			if (eSubject.q.indexOf(keyword) > -1){
				//console.log(e.subject.title);
				//subtitles.push(e.subject.title);
				//var head = eSubject.q;
				
				var content = [];
				$.each(eSubject.list, function(i2, e2){
					////////Object.values(e2).forEach(function(e3) {
					////////	if (e3.startsWith('*')) {
					////////		if (!subtitles.includes(e.subject.title)) {
					////////			subtitles.push(e.subject.title);
					////////		}
					////////		let cleanedStr = e3.substring(1); // 去除开头的 *
					////////		if (cleanedStr.length > 10) {
					////////			cleanedStr = cleanedStr.substring(3, cleanedStr.length - 3); // 去除头尾3个字符
					////////		} else if (cleanedStr.length > 5) {
					////////			cleanedStr = cleanedStr.substring(1, cleanedStr.length - 1); // 去除头尾3个字符
					////////		}
					////////		ansGroup.push(htmlEncode(cleanedStr));
					////////		findGroup.push(htmlEncode(e3));
					////////	} else {
					////////		findGroup.push(htmlEncode(e3));
					////////	}
					////////});
					$.each(e2, function (i3, e3){
						if (e3.indexOf('*') == 0 || e3.indexOf('\'') == 0){
						   content.push('<strong>' + i3 + ':' + htmlEncode(e3) + '</strong>');
						} else if (e3.indexOf('[xxx]') == 0){
							e3 = e3.replace('[xxx]', '');
							content.push('<del>' + i3 + ':' + htmlEncode(e3) + '</del>');
						} else {
						   content.push(i3 + ':' + htmlEncode(e3));
						}
					});
						
				});
				
				if (content.length > 0){
					sublist.push({'title': e.subject.title ,'head': eSubject.q, 'list': content});
				}
			}
		});
		
		
		
		//if (sublist.length > 0){
		//	console.log('xxxxxxxxxxxxxxxxxx', sublist);	
		//}
	});
	
	//console.log('ansgroup', ansGroup);
	//console.log('t3', subtitles);
	return {'sublist': sublist, 'totalsubjects' : data.length};
	//return {'title': subtitles, 'list': ansGroup, 'find' : findGroup, 'sublist': sublist, 'totalsubjects' : data.length};
}

function search_all_old(keyword){
	
	//console.log('keyword=', keyword);
	if (keyword.length > 10){
		keyword = keyword.slice(3, -3);
	} else if (keyword.length > 5) {
		keyword = keyword.slice(1, -1);
	}
	console.log('keyword find by=', keyword);
	var data = {};
	
	// 找全部題庫
	var data = [];
	//var hintlist = '';
	var subtitles = [];
	$('[data-panel="checklist"] > li > input[type="checkbox"]').each(function(i, e){
		var target = $(this).attr('id').replace('chk_', '');
		
		if (datalist[target].title){
			if ($(this).prop('checked') && $(this).parent().attr('data-hidden') != 'true'){
				var _child = $(this).parent().find('> ol > li > input[type="checkbox"]');
				$(_child).each(function(si, se){
					if ($(this).prop('checked')){
						data.push(datalist[target].list[si]);
						//hintlist += '<li>' + datalist[target].list[si].subject.title + '</li>';	
					}
				});
			}
		} else {
			if ($(this).prop('checked')){
				$(datalist[target]).each(function(si, se){
					data.push(se);
					//hintlist += '<li>' + se.subject.title + '</li>';
				});
			}
		}
	});

	var ansGroup = [];
	var findGroup = [];
	var sublist = [];
	//console.log(data);
	$.each(data, function(i, e){
		
		$.each(e.subject.list, function(iSubject, eSubject){
			
			if (eSubject.q.indexOf(keyword) > -1){
				//subtitles.push(e.subject.title);
				var head = eSubject.q;
				
				var content = [];
				$.each(eSubject.list, function(i2, e2){
					Object.values(e2).forEach(function(e3) {
						if (e3.startsWith('*')) {
							if (!subtitles.includes(e.subject.title)) {
								subtitles.push(e.subject.title);
							}
							let cleanedStr = e3.substring(1); // 去除开头的 *
							if (cleanedStr.length > 10) {
								cleanedStr = cleanedStr.substring(3, cleanedStr.length - 3); // 去除头尾3个字符
							} else if (cleanedStr.length > 5) {
								cleanedStr = cleanedStr.substring(1, cleanedStr.length - 1); // 去除头尾3个字符
							}
							ansGroup.push(htmlEncode(cleanedStr));
							findGroup.push(htmlEncode(e3));
						} else {
							findGroup.push(htmlEncode(e3));
						}
					});
					$.each(e2, function (i3, e3){
						if (e3.indexOf('*') == 0 || e3.indexOf('\'') == 0){
						   content.push('<strong>' + i3 + ':' + htmlEncode(e3) + '</strong>');
						} else if (e3.indexOf('[xxx]') == 0){
							e3 = e3.replace('[xxx]', '');
							content.push('<del>' + i3 + ':' + htmlEncode(e3) + '</del>');
						} else {
						   content.push(i3 + ':' + htmlEncode(e3));
						}
					});
						
				});
				
				if (content.length > 0){
					sublist.push({'head': head, 'list': content});
				}
			}
		});
		
		
		
		//if (sublist.length > 0){
		//	console.log('xxxxxxxxxxxxxxxxxx', sublist);	
		//}
	});
	
	//console.log('ansgroup', ansGroup);
	//console.log('t3', subtitles);
	return {'title': subtitles, 'list': ansGroup, 'find' : findGroup, 'sublist': sublist, 'totalsubjects' : data.length};
}

/* download */

let elementsSources = [];
let downloadedPDFs = [];
var chunkSize = 50;
var chunks = 0;
var completedChunks = 0;
var remainDownloadTime = 0;
var averageDownloadTime = 0;
var countDownloadTime = 0;
var clocktimer = Date.now();
var timerInterval;

async function mergeAndDownloadPDFs() {

    if (chunks != 0) {
        if (completedChunks >= chunks) {
            const mergedPdf = await mergePDFs(downloadedPDFs);
            downloadPDF(mergedPdf, );
        } else {
            await processChunk();
        }
    }
}

const { PDFDocument, StandardFonts, rgb } = PDFLib
async function mergePDFs(pdfArray) {
    const mergedPdf = await PDFDocument.create();

    for (const pdfData of pdfArray) {

        const pdf = await PDFDocument.load(pdfData);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return mergedPdf.save();
}

function downloadPDF(pdfData) {
	chunks = 0;
    clearInterval(timerInterval);
    $('[data-album="pdf"] [data-info="remainingDownloadTime"]').text('準備下載檔案');

    const mergedPdfBytes = pdfData;

    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:]/g, "").slice(0, 14);
	const filename = $('[data-album="pdf"] .albuminfo > span').text();
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '_' + timestamp;
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);

    $('[data-album="pdf"] div[data-box="schedule"] span').attr('data-bar', '');
    $('[data-album="pdf"] [data-info="remainingDownloadTime"]').text('完成');

    setTimeout(function () {
		var target = $("[id$='_panel']:visible").first().attr('id');
        $('[data-album="pdf"]').animate({'opacity': 0}, 300, function(){
			$(this).css({'display': 'none', 'opacity': 1});
			$('[data-album="pdf"] div[data-box="schedule"] span').css('width', '0%');
			$(target + ' .result-filter li[data-filter="list"]').click();
		});
    }, 500);
}

async function processChunk() {

    if (completedChunks > chunks) {
        return;
    }
	
    if (completedChunks == 0) {
        clocktimer = Date.now();
        $('[data-album="pdf"] div[data-box="schedule"] span').css('width', '5%');

        timerInterval = setInterval(() => {
			const info = '已耗用時間：' + millisecondsToMinutesAndSeconds('counting', Date.now() - clocktimer);
			console.log();
            $('[data-album="pdf"] [data-info="remainingDownloadTime"]').text(info);
        }, 200);
    }
    else if (completedChunks == 1) {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            countDownloadTime += 200;
            //if (averageDownloadTime - countDownloadTime >= 0) {
			if (remainDownloadTime - countDownloadTime >= 0) {
				const info = '預計剩餘時間：' + millisecondsToMinutesAndSeconds('countdown', remainDownloadTime - countDownloadTime);
                $('[data-album="pdf"] [data-info="remainingDownloadTime"]').text(info);
            }

        }, 200);
    }

	// 取出第一組
	const element = elementsSources[completedChunks];
	
	var total = parseInt($('[data-album="pdf"] [data-box="schedule"] div[data-total]').attr('data-total'));
	var percent = Math.round(completedChunks / total * 100);
	
	const totalDownloadTime = Date.now() - clocktimer;
    // 取得目前平均時間
    averageDownloadTime = totalDownloadTime / completedChunks;
    remainDownloadTime = (chunks - completedChunks) * averageDownloadTime
    countDownloadTime = 0;
	
    $('[data-album="pdf"] [data-box="schedule"] div[data-percent]').attr('data-percent', percent);
    $('[data-album="pdf"] [data-box="schedule"] span').css('width', percent + '%');
	pdfLog($(element).find('h3').text());

	const pdfiframe = buildPdfIframe();
	const elementHtml = '<div id="pdf">' + $(element).html() + '</div>';
	pdfiframe.contentWindow.postMessage({
		elementHTML: elementHtml, //element.outerHTML, //'<div data-miss="' + $(element).attr('data-miss') +'">' + $(element).html() + '</div>',
		chunkIndex: completedChunks
	}, '*');
}
window.addEventListener('message', function(event) {
	// 确保消息来自期望的来源
	//if (event.origin !== window.location.origin) {
	//	return;
	//}
	
	if (event.data.type == 'log'){
		const message = event.data.message + (event.data.args ? ' ' + event.data.args.join(' ') : '');
		pdfLog(message);
	} else if (event.data.type == 'file'){
	
		//console.log(completedChunks, chunks);
		if (completedChunks < chunks) {
			const pdfBytes = event.data.pdfBytes;

			// 將 base64 資料轉換為 Uint8Array
			const pdfData = atob(pdfBytes.split(',')[1]);
			const pdfUint8Array = new Uint8Array(pdfData.length);
			for (let i = 0; i < pdfData.length; i++) {
				pdfUint8Array[i] = pdfData.charCodeAt(i);
			}
			
			//console.log(completedChunks);
			downloadedPDFs.push(pdfUint8Array);
			completedChunks += 1;
			mergeAndDownloadPDFs();
			DownloadInfo();
		} else {
			console.log('over=' + event.data.count);
		}
	}
});

function buildPdfIframe(){
	const existingIframe = document.getElementById('pdfiframe');
    if (existingIframe) {
        // 如果已存在，直接返回该 iframe
        return existingIframe;
    }
	
	const iframe = document.createElement('iframe');
	iframe.id = 'pdfiframe';
	iframe.style.position = 'absolute';
	iframe.style.left = '-9999px';
	iframe.style.top = '-9999px';
    //iframe.style.display = 'none';
    document.body.appendChild(iframe);
	
	const theme = $('span[data-button="theme"]').attr('data-theme');
	
	//console.log('iframe load');
	const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
	const now = new Date();
	const timestamp = now.toISOString().replace(/[-T:]/g, "").slice(0, 14);
	iframeDoc.open();
	iframeDoc.write(`
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<link href="./Css/animate.css" rel="stylesheet"/>
			<link href="./Css/base.css?version=` + timestamp + `" rel="stylesheet"/>
			<link href="./Css/css-` + theme + `.css?version=` + timestamp + `" rel="stylesheet"/>
			<link href="./Css/font-awesome.css" rel="stylesheet"/>
			<link href="./Css/fonts/all.min.css" rel="stylesheet"/>
			<link href="Css/book.css" rel="stylesheet"/>
		</head>
		<title>eLearning - Search Tools</title>
		<script src="./Scripts/html2pdf.bundle.min.js"></` + `script>
		<body>
			<script>
				async function convertToPDFWithLogging(elementHTML, chunkIndex) {
				
					return new Promise((resolve, reject) => {
						const originalConsoleLog = console.log;
						const title = '第 ' + (chunkIndex + 1) + ' 組：';

						// Override console.log to capture logs
						console.log = function(message) {
							const args = Array.from(arguments);
							parent.postMessage({ type: 'log', message: title + 'Log=' + message, args: args }, '*');
							originalConsoleLog.apply(console, arguments);
						};

						const element = document.createElement('div');
						element.innerHTML = elementHTML;
						
//var finalDiv = document.createElement('div');
//	finalDiv.innerHTML = elementHTML;
//	finalDiv.style.position = 'relative';
//	finalDiv.style.animationDuration = '0s';
//	finalDiv.style.transitionDuration = '0s';
//	finalDiv.style.animationDelay = '0s';
//	finalDiv.id = 'pdf';
//document.body.appendChild(finalDiv);;
		
		
						html2pdf()
							.from(element)
							.set({
								log: true,
								margin: 0.5,
								image: { type: 'jpeg', quality: 0.98 },
								html2canvas: {
									scale: 2,
									useCORS: true,
									logging: true,
									onclone: (doc) => {
										//console.log(title + '開始');
										parent.postMessage({ type: 'log', message: title + '開始' }, '*');
									}
								},
								jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
							})
							.outputPdf('datauristring')
							.then((pdfString) => {
								console.log = originalConsoleLog;
								resolve(pdfString);
							})
							.catch((error) => {
								console.log = originalConsoleLog;
								reject(error);
							});
					});
				}

				window.addEventListener('message', async function(event) {
					
					//parent.postMessage({ type: 'log', message: event.data }, '*');
					const data = event.data;
					if (data.elementHTML && data.chunkIndex !== undefined) {
						// 如果收到消息，則執行 convertToPDFWithLogging 函數
						//console.log(data.elementHTML);
						const pdfBytes = await convertToPDFWithLogging(data.elementHTML, data.chunkIndex);
						parent.postMessage({ type: 'log', message: 'final' }, '*');
						parent.postMessage({ type: 'file', pdfBytes: pdfBytes, count : data.chunkIndex }, '*');
					}
				});
			</` + `script>
		</body>
		</html>
	`);
	iframeDoc.close();
	
    iframe.onload = function() {
		//console.log('ready');
		$('[data-filter="download"]').removeClass('disabled');
    };
	
	return iframe;
}

async function print_pdf(callback) {
	
	$('[data-album="pdf"] [data-info="remainingDownloadTime"]').html('');
	$('[data-album="pdf"] [data-info="DownloadInfo"]').html('');
	
	$('[data-album="pdf"] .albumclose').off('click');
	$('[data-album="pdf"] .albumclose').click('click', function(e){
		e.preventDefault();
		chunks = 0;
        completedChunks = 0;
		
		var target = $("[id$='_panel']:visible").first().attr('id');
		$('[data-album="pdf"]').animate({'opacity': 0}, 300, function(){
			$(this).css({'display': 'none', 'opacity': 1});
			$(target + ' .result-filter li[data-filter="list"]').click();
		});
	});
	$('[data-album="pdf"]').css({'display':'flex', 'opacity': 0}).animate({'opacity': 1}, 300, function (){
	
		var htmlContent = $('[data-tabpage]').map(function() {
			return '<div data-miss="' + $(this).attr('data-miss') + '">' + $(this).html() + '</div>';
		}).get().join('');
		var content = '';
		
		$('<div>' + htmlContent + '</div>').find('[data-miss]').each(function(index) {
			var miss = $(this).attr('data-miss');
			$(this).find('ol > li > .note > ul').each(function(i, e){
				if ($(this).attr('data-star') == 'false'){
					$(this).css('background-color', $('span[data-button="theme"]').attr('data-theme') == 'light' ? '#ffd9d9' : '#991c1c');
				}
			});
			
			var conhtml = $(this).html();
			if (index === 0) {
				content += `<div data-miss="${miss}">${conhtml}</div>`;
			} else {
				//content += `<div class="pdfpage" data-miss="${miss}">${conhtml}</div>`;
				content += `<div data-miss="${miss}">${conhtml}</div>`;
			}	
		});

		// 获取所有带有 data-miss 属性的元素
		//const elements = document.querySelectorAll('[data-miss]');
		elementsSources = $('<div>' + content + '</div>').find('[data-miss]');


		//processChunkInit(elements, $('[data-tabpage]').first().find('h3').html());
		
		const title = typeof($('[data-tabpage]').first().find('h3').html()) == 'undefined' ? $('[data-tabpage]:nth-child(2)').find('h3').html() : $('[data-tabpage]').first().find('h3').html();
		const total = elementsSources.length;
		$('[data-album="pdf"] .albuminfo > span').text(title);
		$('[data-album="pdf"]').attr('data-totalpage', total);
		
		recentDownloads = [];
		downloadedPDFs = [];
		chunks = total;
		completedChunks = 0;
		$('[data-album="pdf"] div[data-total]').attr('data-total', chunks).attr('data-count', 0);
		$('[data-album="pdf"] div[data-box="schedule"] span').css('width', 0);
		$('[data-album="pdf"] div[data-box="schedule"] span').attr('data-bar', 'flashlight');

	    processChunk();
	});
}

function pdfLog(message){
	recentDownloads.push(message);
	const count = recentDownloads.length;
	var book = recentDownloads.slice(count - 5 >= 0 ? count - 5 : 0, count).map(function(item) {
		return item;
	}).join('<br/>');

    $('[data-album="pdf"] [data-box="schedule"] [data-info="DownloadInfo"]').html(book);
}
function isPDF(uint8Array) {
    // PDF 文件的签名是 '%PDF-'
    const signature = '%PDF-';
    const bytesToCheck = signature.length;

    // 将 Uint8Array 的前几个字节转换为字符串进行比较
    const header = String.fromCharCode.apply(null, uint8Array.subarray(0, bytesToCheck));

    // 检查签名是否匹配
    return header === signature;
}

function DownloadInfo() {

    var percent = Math.round(completedChunks / chunks * 100);
    $('[data-album="pdf"] div[data-count]').attr('data-count', percent);
    $('[data-album="pdf"] div[data-box="schedule"] span').css('width', percent + '%');

    const totalDownloadTime = Date.now() - clocktimer;
    // 取得目前平均時間
    averageDownloadTime = totalDownloadTime / completedChunks;
    remainDownloadTime = (chunks - completedChunks) * averageDownloadTime
    countDownloadTime = 0;
}

function millisecondsToMinutesAndSeconds(countmethod, milliseconds) {
    let timeString = "";

    if (milliseconds >= 0) {
        let totalSeconds = Math.floor(milliseconds / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        let remainingSeconds = totalSeconds % 3600;

        let minutes = Math.floor(remainingSeconds / 60);
        let seconds = remainingSeconds % 60;

        if (hours > 0) {
            timeString += `${hours} 時 `;
        }

        if (minutes > 0 || hours > 0) {
            timeString += `${minutes} 分 `;
        }

        if (countmethod == 'countdown' && hours == 0 && minutes == 0) {
            if (seconds <= 15 && seconds > 10) {
                const dotsCount = 15 - seconds;
                const dots = '.'.repeat(dotsCount);
                timeString = `快要完成了${dots}`;
            } else if (seconds <= 10 && seconds > 5) {
                const dotsCount = 10 - seconds;
                const dots = '.'.repeat(dotsCount);
                timeString = `即將完成${dots}`;
            } else {
                timeString = `倒數 ${seconds} 秒`;
            }
        } else {
            timeString += `${seconds} 秒`;
        }
    } else {
        timeString = `0 秒`;
    }

    return timeString;
}