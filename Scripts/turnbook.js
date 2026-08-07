function loadBook(totalpages, contentpages, topic, subtitle) {
	var target = $("[id$='_panel']:visible").first().attr('id');
	var targetbook = '[data-album="book"]';
	if(target) {
		target = "#" + target;
	} else {
		return false;
	}
	
 	var flipbook = $(targetbook + ' .turnbook');
 	// Check if the CSS was already loaded
	
	//if (flipbook.width()==0 || flipbook.height()==0) {
	//	setTimeout(loadBook(pages), 10);
	//	return;
	//}
	
	// Create the flipbook
	if ( flipbook.turn( 'is' ) ) {
        flipbook.turn( 'destroy' );
		
        //$( window ).unbind( 'keydown' );
	}
	
	$(targetbook + ' .turnbook-viewport').css('display', 'none');
	if (totalpages > 0){
		if ($(target + ' .result-filter li.selected').attr('data-filter') == 'book' || target == '#study_panel' || target == '#tqccsharp_panel' || target == '#tqcjava_panel' || target == '#tqcpython_panel'  || target == '#tqcpythonweb_panel'  || target == '#tqcr_panel'){
			$(targetbook + ' .turnbook-viewport').css('display', 'block');
		}
	}
	else
	{
		return false;
	}
	
	flipbook.turn({
		width: 1286,
		height: 700,//650,
		duration: 1000,
		acceleration: !(navigator.userAgent.indexOf('Chrome')!=-1),
		gradients: true,
		autoCenter: true,
		elevation: 50,
		pages: totalpages,
		when: {
			turning: function(event, page, view) {
				
				var book = $(this),
				currentPage = book.turn('page'),
				pages = book.turn('pages');
		
				// Update the current URI

				//Hash.go('page/' + page).update();

				// Show and hide navigation buttons

				disableControls(page);
				
			},

			turned: function(event, page, view) {

				disableControls(page);
				
				countingpage(page - (page % 2));
				$(this).turn('center');

				if (page==1) { 
					$(this).turn('peel', 'br');
				}

				if (clipboard){
					clipboard.destroy();
				}
				clipboard = new ClipboardJS('[data-button]');
				$(targetbook + ' [data-button="copy"]').unbind('click');
				$(targetbook + ' [data-button="copy"]').click(function (e) {
					e.preventDefault();
					$(this).attr('data-action', 'copyed');
					var _this = $(this);
					setTimeout(function () {
						_this.attr('data-action', '');
					}, 1000);
				});
				
				if ($(target).attr('data-panel') == 'tqc'){
					typesetInput(document.getElementById(target.replace('#','')));
					$(targetbook + ' .mosaic').unbind('click');
					$(targetbook + ' .mosaic').bind('click', function(){
						$(this).removeClass('mosaic');
					});
					
					$(targetbook + ' .tqcbody pre.code code').each(function(i, block) {
			
						//var needhtmlencode = typeof ($(this).attr('data-htmlencode')) != 'undefined' ? $(this).attr('data-htmlencode') : '';
						//if (needhtmlencode != 'no'){
							//hljs.highlightBlock(block);
							hljs.lineNumbersBlock(block);
						//}
					});
					
					setTimeout(function(){
						$(targetbook + ' .tqcbody pre code').each(function(i, block) {
							
							var _this = $(this);
							var addlight = typeof ($(this).attr('data-addlight')) != 'undefined' ? $(this).attr('data-addlight') : '';
							var adddel = typeof ($(this).attr('data-adddel')) != 'undefined' ? $(this).attr('data-adddel') : '';
							var needhtmlencode = typeof ($(this).attr('data-htmlencode')) != 'undefined' ? $(this).attr('data-htmlencode') : '';
							if (needhtmlencode != 'no'){		
								
								if (addlight != ''){
									$.each(addlight.split(','), function(i, e){
										if (e.indexOf('-') > -1){
											var range = e.split('-');
											for(var r = parseInt(range[0]); r <= parseInt(range[1]);r++){
												$(_this).find('tr td[data-line-number="' + r + '"]:eq(1)').addClass('add');
											}
											
										} else {
											$(_this).find('tr td[data-line-number="' + e + '"]:eq(1)').addClass('add');
										}
									});
								}
								if (adddel != ''){					
									$.each(adddel.split(','), function(i, e){
										if (e.indexOf('-') > -1){
											var range = e.split('-');
											for(var r = parseInt(range[0]); r <= parseInt(range[1]);r++){
												$(_this).find('tr td[data-line-number="' + r + '"]:eq(1)').addClass('del');
											}
											
										} else {
											$(_this).find('tr td[data-line-number="' + e + '"]:eq(1)').addClass('del');
										}
									});
								}
							}
						});
					}, 500);
				}

				$(targetbook + ' .tqcbody').niceScroll({ horizrailenabled: false });
				$(targetbook + ' .tqcbody > pre.code').niceScroll({ horizrailenabled: false });
				$(targetbook + ' .tqcbody > pre.code').getNiceScroll().resize();
			},

			missing: function (event, pages) {

				// Add pages that aren't in the magazine
				
				for (var i = 0; i < pages.length; i++)
					addPage(pages[i], $(this), topic, subtitle, totalpages, contentpages);

			}
		}

	});

	// Zoom.js

	$(targetbook + ' .turnbook-viewport').zoom({
		flipbook: $(targetbook + ' .turnbook'),
		max: function() { 
			return largeMagazineWidth()/$(targetbook + ' .turnbook').width();
		}, 
		when: {
			swipeLeft: function() {
				$(this).zoom('flipbook').turn('next');
			},
			swipeRight: function() {
				$(this).zoom('flipbook').turn('previous');
			}
		}
	});

	// Zoom event
/*
	if ($.isTouch)
		$('.turnbook-viewport').bind('zoom.doubleTap', zoomTo);
	else
		$('.turnbook-viewport').bind('zoom.tap', zoomTo);

*/


	// Regions
/*
	if ($.isTouch) {
		$('.turnbook').bind('touchstart', regionClick);
	} else {
		$('.turnbook').click(regionClick);
	}
*/
	// Events for the next button

	$(targetbook + ' .next-button').unbind();
	$(targetbook + ' .next-button').bind($.mouseEvents.over, function() {		
		$(this).addClass('next-button-hover');
	}).bind($.mouseEvents.out, function() {
		$(this).removeClass('next-button-hover');
	}).bind($.mouseEvents.down, function() {
		$(this).addClass('next-button-down');
	}).bind($.mouseEvents.up, function() {
		$(this).removeClass('next-button-down');
	}).click(function() {
		$(targetbook + ' .turnbook').turn('next');
		var page = $(targetbook + ' .turnbook').turn('page');
		
		countingpage(page);
		
		//page = Math.floor(page / 2);
		//console.log(page);
	//	$(targetbook + ' > div.album > ul > li').removeClass('selected');
	//	$(targetbook + ' > div.album > ul > li[data-page="' + page + '"]').addClass('selected');
		//$(target + ' [data-album="book"] > div.album > ul > li:nth-child(' + (page + 1) + ')').addClass('selected');
	});

	// Events for the next button
	
	$(targetbook + ' .previous-button').unbind();
	$(targetbook + ' .previous-button').bind($.mouseEvents.over, function() {
		$(this).addClass('previous-button-hover');
	}).bind($.mouseEvents.out, function() {
		$(this).removeClass('previous-button-hover');
	}).bind($.mouseEvents.down, function() {
		$(this).addClass('previous-button-down');
	}).bind($.mouseEvents.up, function() {
		$(this).removeClass('previous-button-down');
	}).click(function() {
		$(targetbook + ' .turnbook').turn('previous');
		var page = $(targetbook + ' .turnbook').turn('page');
		countingpage(page);
		
		
		//page = Math.floor(page / 2);
	//	$(targetbook + ' > div.album > ul > li').removeClass('selected');
	//	$(targetbook + ' > div.album > ul > li[data-page="' + page + '"]').addClass('selected');
		//$(target + ' [data-album="book"] > div.album > ul > li:nth-child(' + (page + 1) + ')').addClass('selected');
	});

	resizeViewport();
	$(targetbook + ' .turnbook').addClass('animated');
}

function htmlEncode(text) {
    var encodedText = document.createElement("div");
    encodedText.innerText = text;
    return encodedText.innerHTML;
}

function searchBook(data, page, topic){

	var anslist = '';
	$.each(data, function(i, e){
		var sublist = [];
		
		if (e.subject.title == topic){
			$.each(e.subject.list, function(iSubject, eSubject){

				if (iSubject == page - 1){
					var head = '<li data-guide="node"><div data-icon="q">' + eSubject.q + '</div></li>';
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
					$(eSub.list).each(function(iList, eList){
						tmplist += '<li>' + eList + '</li>';
					});
					if (sublist.length == iSub + 1){
						tmpnode += eSub.head + '<li data-guide="lastnode"><div class="note"><ul>' + tmplist + '</ul></div></li>';
					} else {
						tmpnode += eSub.head + '<li data-guide="node"><div class="note"><ul>' + tmplist + '</ul></div></li>';
					}
				});
				
				anslist += '<h3>' + e.subject.title + '(' + page + '/' + e.subject.list.length + ')</h3><ol>' + tmpnode + '</ol>';
			}
		}
	});
	
	return anslist;
}
var perpage = location.hash == '#nofog' && $('#tqccsharp_panel').css('display') == 'block' ? 6 : 4;
function searchTQC(data, page, topic){
	perpage = location.hash == '#nofog' && $('#tqccsharp_panel').css('display') == 'block' ? 6 : 4;
	var anslist = '';
	$.each(data, function(i, e){
		var sublist = [];
		var naem = '';

		if (e.name.toLowerCase().indexOf('java') > -1 || e.name.toLowerCase().indexOf('python') > -1 || e.name.toLowerCase().indexOf('r') > -1){
			name = e.name.split(' ')[2];
		} else {
			name = e.name.split(' ')[3];
		}
		
		if (name == topic){

			$.each(e.problemSet.problems, function(iSubject, eSubject){
				
				// 1 2 3 4 5 6 7 8 9
				// 0,1,2,3 4,5,6,7 8
				// 0       1       2
				if (iSubject == (Math.ceil(page / perpage)) - 1){
					head =  eSubject.locales[0].title;
					var content = eSubject.locales[0].description;
					// turn md to html
					content = new showdown.Converter().makeHtml(content);
					
					var processpage = page % perpage;
					
					if (perpage == 4 && processpage == 0){
						processpage = 4;
					}

					switch(processpage)
					{
						case 1:
							var star = eSubject.difficulty;
							var difficulty = '<ul data-difficulty="' + star +'"><li></li><li></li><li></li><li></li><li></li></ul>';
							
							content = difficulty + content.split('<hr />')[0];
						break;
						case 2:
							console.log(1,content);
							var source_content = content;
							content = content.split('<hr />')[1];
							
							if (content == undefined){
								content = source_content;
							}
							console.log(2,content);
							content = content.split(/<h3 id="4">4\. ?評分項目：<\/h3>|<h2 id="4">4\. ?評分項目：<\/h2>|<h2 id="4-2">4\. ?評分項目：<\/h2>/)[0];
						break;
						case 3:
							var source_content = content;
							content = content.split('<hr />')[1];
							if (content == undefined){
								content = source_content;
							}
							
							if (content == ''){
								break;
							}
							var mdtable_source = content.split(/<h3 id="4">4\. ?評分項目：<\/h3>|<h2 id="4">4\. ?評分項目：<\/h2>|<h2 id="4-2">4\. ?評分項目：<\/h2>/)[1];
							mdtable_source = mdtable_source.substr(4, mdtable_source.length - 8);
							//| 項目                         | 配分  | 得分  |
							//| ---------------------------- | :---: | :---: |
							//| (1) 符合設計說明輸出正確格式 |  10   |   0   |
							//| 總                      分   |  10   |   0   |
							var mdtable = '';
							var mdtable_head = '';
							var mdtable_body = '';
							var mdcol = [];
							var mdbody = mdtable_source.split(/\n/).map(function(v){
								
								var mdcount = 0;
								var mdrow = v.split('|').map(function(col){
									if (col == ''){
										return '';
									}
									
									if (col.trim() == ':---:' || col.indexOf('---') > -1){
										if (col.trim() == ':---:'){
											mdcol.push(' style="text-align:center" ');
										} else if (col.trim() == ':---') {
											mdcol.push(' style="text-align:left" ');
										} else if (col.trim() == '---:') {
											mdcol.push(' style="text-align:right" ');
										} else {
											mdcol.push('');
										}
										return '';
									}
									
									mdcount += 1;
									if (mdtable_head == ''){
										return '<th' + (mdcol.length > 0 ? mdcol[mdcount - 1] : '') + '>' + col.trim() + '</th>';
									} else {
										return '<td' + (mdcol.length > 0 ? mdcol[mdcount - 1] : '') + '>' + col.trim() + '</td>';
									}
									
								}).join('');
								
								if (mdrow != ''){
									if (mdtable_head == ''){
										mdtable_head = '<thead><tr>' + mdrow + '</tr></thead>';
										return '';
									} else {
										return '<tr>' + mdrow + '</tr>';
									}
								} else {
									return '';
								}
							}).join('');
							mdtable_body = '<tbody>' + mdbody + '</tbody>'
							mdtable = '<table>' + mdtable_head + mdtable_body + '</table>';
							
							content = '<h2 id="4">4. 評分項目：</h2>' + mdtable;//content.split('<h2 id="4">4. 評分項目：</h2>')[1];
							content += '<br/><div class="alert-danger"><ol><li>輸入與輸出的格式必須完全相同，每一行字、空白都要一樣。全型、半型字元、英文字母大小寫、小數點的位數是否與題目的要求相同。</li><li>特別注意輸出後有無空白。輸出的最後行一行結尾，無須換行。</li><li>請提交程式碼檔案，而非執行檔或執行的結果。請注意提交的檔案是否適用該題目 (請檢查有無交錯題目) 。</li><li>每一題至少有1組評分測試資料顯示題目中，且至少有1組隱藏的評分測試資料。</li><li>題目如有需要進行檔案讀寫，在本機撰寫程式碼自行測試時，程式開啟檔案或寫入檔案的路徑，是依據您程式啟動位置。在提交評分時，程式所開啟或寫入的檔案，必須與程式碼檔在同一層，例：file= open(\'write.txt\')</li></ol></div>';
						break;
						case 4:
							content = '';
							var dw = '';
							var preheight = 'height:' + Math.floor(402 / eSubject.editFiles.length) + 'px';
							if (eSubject.editFiles.length == 1){
								preheight = '';
							}
							$(eSubject.editFiles).each(function(ifile, efile)
							{
								var decodedData = atob(efile.fileStream.split(',')[1]);
								var utf8Decoder = new TextDecoder('utf-8');
								var textData = utf8Decoder.decode(new Uint8Array([...decodedData].map(c => c.charCodeAt(0))));
								var copyid = efile.fileName.replace('.', '') + efile.editFileId;
								var examcode = textData.replace("ï»¿", '');
								dw += '<a class="tqcdownload" href="' + efile.fileStream + '" download="' + efile.fileName + '"><i class="fa fa-download"></i> ' + efile.fileName + '</a>';
								dw += '<a href="#" class="btn" data-button="copy" data-clipboard-target="#' + copyid + '" title="點我複製"></a>&nbsp;';
								if (content != '')
								{
									content = content + '<br/>';
								}
								//content += '<pre class="code ' + (processpage == 4 ? '' : 'mosaic') + '" style="' + preheight + '" id="' + copyid + '">' + hljs.highlightAuto(examcode).value + '</pre>';
								content += '<pre class="code ' + (processpage == 4 ? '' : 'mosaic') + '" style="' + preheight + '"><code id="' + copyid + '">' + hljs.highlightAuto(examcode).value + '</code></pre>';

							});
							content += '<h3>待編修檔案</h3>' + dw;
							
							//if (eSubject.editFiles.length == 1){							
							//	//var examcode = atob(eSubject.editFiles[0].fileStream.replace('data:application/octet-stream;base64,',''));//.substr(3);
							//	var decodedData = atob(eSubject.editFiles[0].fileStream.split(',')[1]);
							//	var utf8Decoder = new TextDecoder('utf-8');
							//	var textData = utf8Decoder.decode(new Uint8Array([...decodedData].map(c => c.charCodeAt(0))));
							//	
							//	var examcode = textData.replace("ï»¿", '');
							//	var dw = '<a class="tqcdownload" href="' + eSubject.editFiles[0].fileStream + '" download="' + eSubject.editFiles[0].fileName + '"><i class="fa fa-download"></i> ' + eSubject.editFiles[0].fileName + '</a>';
							//	dw = dw + '<a href="#" class="btn" data-button="copy" data-clipboard-target="#cscode' + eSubject.editFiles[0].editFileId + '" title="點我複製"></a>';
							//	content = '<pre class="code" id="cscode' + eSubject.editFiles[0].editFileId + '">' + hljs.highlightAuto(examcode).value + '</pre>' + '<h3>待編修檔案</h3>' + dw;
							//} else {
							//	//var examcode = atob(eSubject.editFiles[0].fileStream.replace('data:application/octet-stream;base64,',''));//.substr(3);
							//	var decodedData = atob(eSubject.editFiles[0].fileStream.split(',')[1]);
							//	var utf8Decoder = new TextDecoder('utf-8');
							//	var textData = utf8Decoder.decode(new Uint8Array([...decodedData].map(c => c.charCodeAt(0))));
							//
							//	var examcode = textData.replace("ï»¿", '');
							//	var dw = '<a class="tqcdownload" href="' + eSubject.editFiles[0].fileStream + '" download="' + eSubject.editFiles[0].fileName + '"><i class="fa fa-download"></i> ' + eSubject.editFiles[0].fileName + '</a>';
							//	dw = dw + '<a href="#" class="btn" data-button="copy" data-clipboard-target="#cscode' + eSubject.editFiles[0].editFileId + '" title="點我複製"></a>';
							//	content = '<pre class="code" style="height:200px" id="cscode' + eSubject.editFiles[0].editFileId + '">' + hljs.highlightAuto(examcode).value + '</pre><br/>';
							//	
							//	//var filecode = atob(eSubject.editFiles[1].fileStream.replace('data:application/octet-stream;base64,',''));//.substr(3);
							//	var decodedData = atob(eSubject.editFiles[1].fileStream.split(',')[1]);
							//	var utf8Decoder = new TextDecoder('utf-8');
							//	var textData = utf8Decoder.decode(new Uint8Array([...decodedData].map(c => c.charCodeAt(0))));
							//	
							//	filecode = textData.replace("ï»¿", '');
							//	var dw2 = '<a class="tqcdownload" href="' + eSubject.editFiles[1].fileStream + '" download="' + eSubject.editFiles[1].fileName + '"><i class="fa fa-download"></i> ' + eSubject.editFiles[1].fileName + '</a>';
							//	dw2 = dw2 + '<a href="#" class="btn" data-button="copy" data-clipboard-target="#read' + eSubject.editFiles[1].editFileId + '" title="點我複製"></a>';								
							//	
							//	content += '<pre class="code" style="height:200px" id="read' + eSubject.editFiles[1].editFileId + '">' + hljs.highlightAuto(filecode).value + '</pre>' + '<h3>待編修檔案</h3>' + dw + '&nbsp;' + dw2;
							//}

						break;
						case 5:
							content = '';
							var dw = '';
							var preheight = 'height:' + Math.floor(402 / eSubject.ansFiles.length) + 'px';
							if (eSubject.ansFiles.length == 1){
								preheight = '';
							}
							$(eSubject.ansFiles).each(function(ifile, efile)
							{
								var decodedData = atob(efile.fileStream.split(',')[1]);
								var utf8Decoder = new TextDecoder('utf-8');
								var textData = utf8Decoder.decode(new Uint8Array([...decodedData].map(c => c.charCodeAt(0))));
								var copyid = "sample" + iSubject;//efile.fileName.replace('.', '') + efile.editFileId;
								var examcode = textData.replace("ï»¿", '');
								dw += '<a class="tqcdownload" href="' + efile.fileStream + '" download="' + efile.fileName + '"><i class="fa fa-download"></i> ' + efile.fileName + '</a>';
								dw += '<a href="#" class="btn" data-button="copy" data-clipboard-target="#' + copyid + '" title="點我複製"></a>&nbsp;';
								if (content != '')
								{
									content = content + '<br/>';
								}
								//content += '<pre class="code mosaic" style="' + preheight + '" id="' + copyid + '">' + hljs.highlightAuto(examcode).value + '</pre>';
								content += '<pre class="code mosaic" style="' + preheight + '"><code id="' + copyid + '">' + hljs.highlightAuto(examcode).value + '</code></pre>';
							});
							content += '<h3>待編修檔案</h3>' + dw;
						break;
						case 0:
							content = '';
							var preheight = preheight = 'height:500px';
							$(eSubject.ansFiles).each(function(ihelp, ehelp)
							{
								var decodedData = atob(ehelp.fileStream.split(',')[1]);
								var utf8Decoder = new TextDecoder('utf-8');
								var textData = utf8Decoder.decode(new Uint8Array([...decodedData].map(c => c.charCodeAt(0))));
								var light = typeof ehelp.light != 'undefined' ? 'data-addlight="' + ehelp.light + '"' : '';
								var examcode = textData.replace("ï»¿", '');
								if (content != '')
								{
									content = content + '<br/>';
								}
								//content += '<pre class="code mosaic" style="' + preheight + '">' + hljs.highlightAuto(examcode).value + '</pre>';
								content += '<pre class="code mosaic" style="' + preheight + '"><code ' + light + '>' + hljs.highlightAuto(examcode).value + '</code></pre>';

							});
						break;
					}
							
					//<h2 id="4">4. 評分項目：</h2>
					anslist = '<h4>' + head + '</h4><div class="tqcbody">' + content + '</div>';
				}
				
				// 1 2 3 4 5 6
				// 0,1 2,3 4,5
				// 0   1   2
				
				/*
				if (iSubject == (Math.ceil(page / 2)) - 1){
					var head = '<h4>' + eSubject.locales[0].title + '</h4>';
					
					var content = eSubject.locales[0].description;
					// turn md to html
					content = new showdown.Converter().makeHtml(content);
					
					if (page % 2 != 0){
						content = content.split('<hr />')[0];
					}
					else
					{
						content = content.split('<hr />')[1];
					}
					
					//<h2 id="4">4. 評分項目：</h2>

					anslist = head + content;//.replace(/\n/g, '<br/>');
				}*/
			});
		}
	});
	
	return anslist;
}

function addPage(page, book, topic, subtitle, totalpages, contentpages) {
	perpage = location.hash == '#nofog' && $('#tqccsharp_panel').css('display') == 'block' ? 6 : 4;
	
	var bookcover = $("[id$='_panel']:visible").first().attr('data-cover');
	//console.log(page);

	var id, pages = book.turn('pages');

	// Create a new element for this page
	var element = $('<div />', {});

	// Add the page to the flipbook
	if (book.turn('addPage', element, page)) {

		var content = '';
		//content = $('#answer > li:nth-child(' + page + ')').html();
		
		if (topic && topic != ''){// typeof (topic) != 'undefined'){
			
			if (page == 1){
				// build home page cover
				element.html('<div class="gradient"><div class="bookcover ' + bookcover + '"><span class="bookribbon"><span>' + contentpages + '</span></span>' + subtitle + '<span>' + topic + '</span></div></div>');
			} else if (page == totalpages) {
				// build tail page cover
				element.html('<div class="gradient"><div class="bookcover ' + bookcover + '"><span>~The End~</span></div></div><div data-tailpage="' + (page - 1) + '"></div>');
			} else {
				
				if (page + 1 == totalpages && totalpages % 2 == 1 && $('#tqccsharp_panel').css('display') != 'block' && $('#tqcjava_panel').css('display') != 'block' && $('#tqcpython_panel').css('display') != 'block' && $('#tqcpythonweb_panel').css('display') != 'block' && $('#tqcr_panel').css('display') != 'block'){
					// 奇數頁，再補一頁空白
					element.html('<div class="gradient"><div class="bookempty">~此頁空白~</div></div><div data-tailpage="' + (page - 1) + '"></div>');
				} else {
					
					if ($('#tqccsharp_panel').css('display') == 'block'){
						
						//content = searchTQC(tqc_csharp, page - 1, topic);
						content = searchTQC(tqclist.csharp, page - 1, topic);
						
						
						//if (content != ''){
						//	return false;
						//}
						// 2 3 0 1
						// 1 2 3 4
						var pgae_content = (Math.ceil((page - 1) / perpage)) + ' - ' + (page - 1 - ((Math.ceil((page - 1) / perpage) -1) * perpage ));
						
						element.html('<div class="gradient"><div class="tqc">' + content + '</div></div><div data-tailpage="' + pgae_content + '"></div>');
					} else if ($('#tqcjava_panel').css('display') == 'block'){
						
						//content = searchTQC(tqc_java, page - 1, topic);
						content = searchTQC(tqclist.java, page - 1, topic);
						
						//if (content != ''){
						//	return false;
						//}
						// 2 3 0 1
						// 1 2 3 4
						var pgae_content = (Math.ceil((page - 1) / perpage)) + ' - ' + (page - 1 - ((Math.ceil((page - 1) / perpage) -1) * perpage ));
						
						element.html('<div class="gradient"><div class="tqc">' + content + '</div></div><div data-tailpage="' + pgae_content + '"></div>');
					} else if ($('#tqcpython_panel').css('display') == 'block'){
						
						//content = searchTQC(tqc_python, page - 1, topic);
						content = searchTQC(tqclist.python, page - 1, topic);
						
						//if (content != ''){
						//	return false;
						//}
						// 2 3 0 1
						// 1 2 3 4
						var pgae_content = (Math.ceil((page - 1) / perpage)) + ' - ' + (page - 1 - ((Math.ceil((page - 1) / perpage) -1) * perpage ));
						
						element.html('<div class="gradient"><div class="tqc">' + content + '</div></div><div data-tailpage="' + pgae_content + '"></div>');
					} else if ($('#tqcpythonweb_panel').css('display') == 'block'){
						
						//content = searchTQC(tqc_pythonweb, page - 1, topic);
						content = searchTQC(tqclist.pythonweb, page - 1, topic);
						
						//if (content != ''){
						//	return false;
						//}
						// 2 3 0 1
						// 1 2 3 4
						var pgae_content = (Math.ceil((page - 1) / perpage)) + ' - ' + (page - 1 - ((Math.ceil((page - 1) / perpage) -1) * perpage ));
						
						element.html('<div class="gradient"><div class="tqc">' + content + '</div></div><div data-tailpage="' + pgae_content + '"></div>');
					} else if ($('#tqcr_panel').css('display') == 'block'){
						
						//content = searchTQC(tqc_r, page - 1, topic);
						content = searchTQC(tqclist.r, page - 1, topic);
						
						//if (content != ''){
						//	return false;
						//}
						// 2 3 0 1
						// 1 2 3 4
						var pgae_content = (Math.ceil((page - 1) / perpage)) + ' - ' + (page - 1 - ((Math.ceil((page - 1) / perpage) -1) * perpage ));
						
						element.html('<div class="gradient"><div class="tqc">' + content + '</div></div><div data-tailpage="' + pgae_content + '"></div>');
					} else {
					
						$(datalist).each(function(i, e){
							
							//var head = '<h3>' + topic + '</h3>';
							//var body = '';
										
							if (e.title){
								content = searchBook(e.list, page - 1, topic);
								/*
								$(e.list).each(function(si, se){
									if (se.subject.title == topic){
										
										$(se.subject.list).each(function(di, de){
											if (di == page){
												content = searchBook(de, page);
											}
										});
									}
								});
								*/
							} else {
								content = searchBook(e, page - 1, topic);
							}
							
							if (content != ''){
								return false;
							}
							//var head = '<h3>' + $(this).parent().parent().find('h3').html() + '</h3>';
							//var body = '<li data-guide="node">' + $(this).html() + '</li>';
							//var tail = '<li data-guide="lastnode">' + $(this).next().html() + '</li>';
							//content = head + '<ol>' + body + tail + '</ol>';
						});
						
						element.html('<div class="gradient"><ul class="answer"><li class="selected">' + content + '</li></ul></div><div data-tailpage="' + (page - 1) + '"></div>');
					}
				}
			}
		} else {
			
			if (page == 1){
				// build home page cover
				element.html('<div class="gradient"><div class="bookcover ' + bookcover + '"><span class="bookribbon"><span>' + contentpages + '</span></span>' + subtitle + '<span>Search results</span></div></div>');
			} else if (page == totalpages) {
				// build tail page cover
				element.html('<div class="gradient"><div class="bookcover ' + bookcover + '"><span>~The End~</span></div></div><div data-tailpage="' + (page - 1) + '"></div>');
			} else {
				if (page + 1 == totalpages && totalpages % 2 == 1){
					// 奇數頁，再補一頁空白
					element.html('<div class="gradient"><div class="bookempty">~此頁空白~</div></div><div data-tailpage="' + (page - 1) + '"></div>');
				} else {
					
					var $node = $('[data-no]').eq(page - 2);
					if ($node.length) {
						var head = '<h3>' + $node.parent().parent().find('h3').html() + '</h3>';
						var body = '<li data-guide="node">' + $node.html() + '</li>';
						var tail = '<li data-guide="lastnode">' + $node.next().html() + '</li>';
						content = head + '<ol>' + body + tail + '</ol>';
					}
					
					element.html('<div class="gradient"><ul class="answer"><li class="selected">' + content + '</li></ul></div><div data-tailpage="' + (page - 1) + '"></div>');
			
				}
			}
		}
	}
}

	//$(window).resize(function() {
	//	resizeViewport();
	//}).bind('orientationchange', function() {
	//	resizeViewport();
	//});
	
	// Using arrow keys to turn the page

	$(document).keydown(function(e){
		var target = $("[id$='_panel']:visible").first().attr('id');
		var targetbook = '[data-album="book"]';
		if(target) {
			target = "#" + target;
		}
		
		if (target && $(targetbook).css('display') == 'block'){
			//var previous = 37, next = 39, esc = 27;
			//console.log('book in');
			switch (e.keyCode) {
				case 37:

					// left arrow
					
					$(targetbook + ' .turnbook').turn('previous');
					var page = $(targetbook + ' .turnbook').turn('page');
					countingpage(page - 1);
					//page = Math.floor(page / 2);
					//$(targetbook + ' > div.album > ul > li').removeClass('selected');
					//$(targetbook + ' > div.album > ul > li:nth-child(' + (page + 1) + ')').addClass('selected');
					e.preventDefault();

				break;
				case 39:

					//right arrow
					$(targetbook + ' .turnbook').turn('next');
					var page = $(targetbook + ' .turnbook').turn('page');
					countingpage(page);
					console.log(page);
					//page = Math.floor(page / 2);
					//$(targetbook + ' > div.album > ul > li').removeClass('selected');
					//$(targetbook + ' > div.album > ul > li:nth-child(' + (page + 1) + ')').addClass('selected');
					e.preventDefault();

				break;
				case 27:
					
					$(targetbook + ' .turnbook-viewport').zoom('zoomOut');	
					e.preventDefault();

				break;
			}
		}
	});
	
// Zoom icon
/*
 $('.zoom-icon').bind('mouseover', function() { 
 	
 	if ($(this).hasClass('zoom-icon-in'))
 		$(this).addClass('zoom-icon-in-hover');

 	if ($(this).hasClass('zoom-icon-out'))
 		$(this).addClass('zoom-icon-out-hover');
 
 }).bind('mouseout', function() { 
 	
 	 if ($(this).hasClass('zoom-icon-in'))
 		$(this).removeClass('zoom-icon-in-hover');
 	
 	if ($(this).hasClass('zoom-icon-out'))
 		$(this).removeClass('zoom-icon-out-hover');

 }).bind('click', function() {

 	if ($(this).hasClass('zoom-icon-in'))
 		$('.turnbook-viewport').zoom('zoomIn');
 	else if ($(this).hasClass('zoom-icon-out'))	
		$('.turnbook-viewport').zoom('zoomOut');

 });
*/


// Zoom in / Zoom out
/*
function zoomTo(event) {

		setTimeout(function() {
			if ($('.turnbook-viewport').data().regionClicked) {
				$('.turnbook-viewport').data().regionClicked = false;
			} else {
				if ($('.turnbook-viewport').zoom('value')==1) {
					$('.turnbook-viewport').zoom('zoomIn', event);
				} else {
					$('.turnbook-viewport').zoom('zoomOut');
				}
			}
		}, 1);

}
*/

// Process click on a region
/*
function regionClick(event) {

	var region = $(event.target);

	if (region.hasClass('region')) {

		$('.turnbook-viewport').data().regionClicked = true;
		
		setTimeout(function() {
			$('.turnbook-viewport').data().regionClicked = false;
		}, 100);
		
		var regionType = $.trim(region.attr('class').replace('region', ''));

		return processRegion(region, regionType);

	}

}
*/
// Process the data of every region
/*
function processRegion(region, regionType) {

	data = decodeParams(region.attr('region-data'));

	switch (regionType) {
		case 'link' :

			window.open(data.url);

		break;
		case 'zoom' :

			var regionOffset = region.offset(),
				viewportOffset = $('.turnbook-viewport').offset(),
				pos = {
					x: regionOffset.left-viewportOffset.left,
					y: regionOffset.top-viewportOffset.top
				};

			$('.turnbook-viewport').zoom('zoomIn', pos);

		break;
		case 'to-page' :

			$('.turnbook').turn('page', data.page);

		break;
	}

}
*/

function disableControls(page) {
	
	var target = $("[id$='_panel']:visible").first().attr('id');
	var targetbook = '[data-album="book"]';
	if(target) {
		target = "#" + target;
	}

	if (target){
		if (page==1)
			$(targetbook + ' .previous-button').hide();
		else
			$(targetbook + ' .previous-button').show();
					
		if (page==$(targetbook +' .turnbook').turn('pages'))
			$(targetbook + ' .next-button').hide();
		else
			$(targetbook + ' .next-button').show();
	}
}

// Set the width and height for the viewport
function resizeViewport() {
	var target = $("[id$='_panel']:visible").first().attr('id');
	var targetbook = '[data-album="book"]';
	if(target) {
		target = "#" + target;
	}
	
	if ($('#question').val() != '' || target != ''){ // || target == '#study_panel' || target == '#tqccsharp_panel' || target == '#tqcjava_panel' || target == '#tqcpython_panel' || target == '#tqcpythonweb_panel' || target == '#tqcr_panel'){
		
		var flipbook = $(targetbook + ' .turnbook');

		if (flipbook && flipbook.turn && flipbook.turn( 'is' ) ) {
			
			var width = $(window).width(),
				height = $(window).height(),
				options = $(targetbook + ' .turnbook').turn('options');

			$(targetbook + ' .turnbook').removeClass('turnanimated');

			$(targetbook + ' .turnbook-viewport').css({
				width: width,
				height: Math.max(height, options.height), //options.height + 50, //Math.min(height, options.height + 50),
				overflow: 'visible'
			}).
			
			zoom('resize');

			if ($(targetbook + ' .turnbook').turn('zoom')==1) {
				/*
				var bound = calculateBound({
					//width: Math.min(options.width - 50, $(window).width() - 75 - 50),
					width: Math.min(options.width, width) - 100, //Math.min(options.width, $(window).width()),
					height: Math.min(options.height, height),
					boundWidth: Math.min(options.width, width),
					boundHeight: Math.min(options.height, height)
				});
				*/
				var bound = {
					width: Math.min(options.width, width) - 100,
					height: Math.max(height, options.height) -150 //options.height //Math.min(options.height, height)
				};

				if (bound.width%2!==0)
					bound.width-=1;

					
				if (bound.width!=$(targetbook + ' .turnbook').width() || bound.height!=$(targetbook + ' .turnbook').height()) {

					$(targetbook + ' .turnbook').turn('size', bound.width, bound.height);

					if ($(targetbook + ' .turnbook').turn('page')==1)
						$(targetbook + ' .turnbook').turn('peel', 'br');

					$(targetbook + ' .next-button').css({height: bound.height, backgroundPosition: '-38px '+(bound.height/2-32/2)+'px'});
					$(targetbook + ' .previous-button').css({height: bound.height, backgroundPosition: '-4px '+(bound.height/2-32/2)+'px'});
				}

				$(targetbook + ' .turnbook').css({top: -bound.height/2, left: -bound.width/2});
			}
			
		/*
			var magazineOffset = $('.turnbook').offset(),
				boundH = height - magazineOffset.top - $('.turnbook').height(),
				marginTop = (boundH - $('.thumbnails > div').height()) / 2;

			if (marginTop<0) {
				$('.thumbnails').css({height:1});
			} else {
				$('.thumbnails').css({height: boundH});
				$('.thumbnails > div').css({marginTop: marginTop});
			}

			if (magazineOffset.top<$('.made').height())
				$('.made').hide();
			else
				$('.made').show();
		*/

			$(targetbook + ' .turnbook').addClass('turnanimated');
		}
	}
}


// Number of views in a flipbook
function numberOfViews(book) {
	return book.turn('pages') / 2 + 1;
}

// Current view in a flipbook
function getViewNumber(book, page) {
	return parseInt((page || book.turn('page'))/2 + 1, 10);
}

function moveBar(yes) {
	if (Modernizr && Modernizr.csstransforms) {
		$('#slider .ui-slider-handle').css({zIndex: yes ? -1 : 10000});
	}
}

// Width of the flipbook when zoomed in
function largeMagazineWidth() {
	return 2214;
}

// decode URL Parameters
function decodeParams(data) {

	var parts = data.split('&'), d, obj = {};

	for (var i =0; i<parts.length; i++) {
		d = parts[i].split('=');
		obj[decodeURIComponent(d[0])] = decodeURIComponent(d[1]);
	}

	return obj;
}

// Calculate the width and height of a square within another square
function calculateBound(d) {
	
	var bound = {width: d.width, height: d.height};

	bound.width = d.boundWidth - 100;
	if (bound.width>d.boundWidth || bound.height>d.boundHeight) {
		
		
		/*
		var rel = bound.width/bound.height;
		
		if (d.boundWidth/rel>d.boundHeight && d.boundHeight*rel<=d.boundWidth) {
			
			bound.width = Math.round(d.boundHeight*rel);
			//bound.height = d.boundHeight;

		} else {
			bound.width = d.boundWidth - 100;
			//bound.height = Math.round(d.boundWidth/rel);
		}
		*/
	}

	return bound;
}