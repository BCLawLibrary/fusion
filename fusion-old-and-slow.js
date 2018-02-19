//Get any search parameters from the URL
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||""
	}

	myKey = getURLParameter('key').replace("and","&");



	window.onload = function() {
		
//Create drop down menu from stored file of display names and search terms	

		
	var cList = $('div#areaSearch')
	$(cList).empty();
	var currentUL = $('<ul/>').addClass('menu-list');
	var li = $('<li/>') //add Show All link at start of subject menu
				.addClass('all')
				.attr('role', 'menuitem')
				.attr('tabindex', '1')
				.text('All Areas')
				.appendTo(currentUL);	
	$.getJSON( "/content/dam/bc1/schools/law/js/fusion/menuData.json", function( data ) {
	var items = [];
	
	$.each( data, function( key, value ) {
		if ((key+1) % 5 == 0) {
			currentUL.appendTo(cList);
			currentUL  = $('<ul/>')
				.addClass('menu-list');
		}
	
	
		var li = $('<li/>')
				.addClass('ui-menu-item')
				.attr('role', 'menuitem')
				.attr('tabindex', '1')
				.attr('id', value.searchTerm)
				.text(value.displayName)
				.appendTo(currentUL);
			});
	currentUL.appendTo(cList);
			
	var span = $('<span/>') //add Show All X at end of subject menu
				.addClass('allXDropDown')
				.attr('role', 'menuitem')
				.attr('tabindex', '1')
				.text('X')
				.appendTo(cList);

		
	//Open menu	
	$('span.dropdownOpen').click(function() {
		$('div.dropdown-content').toggle();
	});
	//Make keypress produce click
	$('span.dropdownOpen, .ui-menu-item, a.more, a.fewer, span.details-control, span#clearSearch').unbind('keypress').keypress(function (e) {
		var key = e.which;
		if(key == 13)  // the enter key code
	{
		$(this).click();
		return false;  
	}
	});
	
	
	
	
	
	
			
	//Perform a search from the drop-down of pre-selected searches
	$('li.ui-menu-item').click (function() {
	var search = $(this).attr("id"); //the search term is stored in the ID - this allows for the display on the drop down to be different than the text that is searched for
	tables.search("");
	tables.search( search.replace(/\blaw\b/g, '').replace(/\bLaw\b/g, '') ).draw();
	 $('#myInput').val(search);
	 $("span.all").show();
	});
	$('li.all, span.all, span.allXDropDown').click (function() {
	tables.search("").draw();
	 $('#myInput').val("");
	 $("span.all").hide();
	});
	});
 
		//Faculty Table
		var facultyTable = $('#facultyData').DataTable( {
			"dom": 'it',//remove default search input
			 "language": {
				"info": "<h3>Faculty</h3><span class='tableInfo'><p class='dataInfo'>Showing _END_ of _TOTAL_ </p><a  id='facultyMore' class='more' tabindex='0' >All faculty</a><a id='facultyFewer' class='fewer' tabindex='0' >Fewer faculty</a></span><span class='closedInfo'><p>_TOTAL_ results</p></span>",
				"infoFiltered": "",
				"infoEmpty" : "",
				"zeroRecords" : ""
			},
			"ajax": {
			"url": "/content/dam/bc1/schools/law/js/fusion/facultyData.json",
			"dataSrc":""
			},
			"order": [[8,'asc'], [6,'asc']],
			"pageLength": 6,
			  "columns": [
				{ "data": "Image"},
				{ "data": "DisplayName" },
				{ "data": "URL"},
				{ "data": "area1"},
				{ "data": "area2"},
				{ "data": "area3"},
				{ "data": "SortName"},
				{ "data": "facultyStatus"},
				{ "data": "priority"},
				{ "data": "biography"}
				],
		columnDefs: [
		{ "targets": 0, "orderable": false },
        { "targets": [1, 2, 3, 4, 5, 6, 7, 8, 9], "visible": false},
		{ "targets":0, "render": function ( data, type, full, meta ) {
      return '<a><img src="'+data+'"></a>';}},
      	{ "targets":9, "render": function ( data, type, full, meta ) {
      return data.replace(/business/gi,"").replace(/civil/gi, "").replace(/litigation/gi, "").replace(/constitutional/gi, "").replace(/criminal/gi, "").replace(/procedure/gi, "").replace(/environmental/gi, "").replace(/experiential/gi, "").replace(/health/gi, "").replace(/international/gi, "").replace(/comparative/gi, "").replace(/immigration/gi, "").replace(/real estate/gi, "").replace(/tax/gi, "");}}
		],	
	"drawCallback": function(settings) {
		//Add URLs to any links and alt tags to any images in each row, using the URLs in column 2 of the table for the links and the faculty Name field for the alt tags
		var api = this.api();
		var data=api.rows({page:'current'}).data();
		$.each(data, function (index,value) {
				var URL=this.URL;
				var name=this.DisplayName;
				var facultyStatus = this.facultyStatus.replace(/\s+/g, '');
				var child=index+1;
				$("#facultyData tr:nth-child("+child+")").find('.facultyName').remove();
				$("#facultyData tr:nth-child("+child+")").find('td').append('<a class="facultyName">'+name+'</a>');
				$("#facultyData tr:nth-child("+child+")").find('a').attr('href',URL);
				$("#facultyData tr:nth-child("+child+")").find('img').attr('alt',name);
				$("#facultyData tr:nth-child("+child+")").find('img[src=""]').attr('src','/content/dam/bc1/schools/law/js/images/law_faculty_placeholder.jpg');
				$("#facultyData tr:nth-child("+child+")").addClass(facultyStatus);
            }
			);
			
		//Group items by type
           var rows = api.rows( {page:'current'} ).nodes();
           var last=null;
		   $("h4.facultyGroupHeader").remove();
			$("tr.facultyGroupHeaderRow").removeClass("facultyGroupHeaderRow");
            api.column(7, {page:'current'} ).data().each( function ( group, i ) {
                if ( last !== group ) {
					if (group !="Full-Time Faculty") { //No grouping header for full-time
						$(rows).eq( i ).not(':has(h4)').addClass("facultyGroupHeaderRow").prepend(
							'<h4 class="facultyGroupHeader">'+group+'</h4>'
							
						);
					}
                    last = group;
                }
            } );	
		
	
		
			
		$('#facultyMore')
		.unbind()
		.on( 'click', function () {
			facultyTable.page.len(999).draw();
			$('#facultyMore').hide();
			$('#facultyFewer').show().focus();
		} );
		$('#facultyFewer')
		.unbind()
		.on( 'click', function () {
			facultyTable.page.len( 6).draw();
			$('#facultyFewer').hide();
			$('#facultyMore').show().focus();
		} );
		
		if (api.page.len() ==6) {
			$('#facultyFewer').hide();
			$('#facultyMore').show();
		}
		else {
			$('#facultyFewer').show();
			$('#facultyMore').hide();
		}
			
		
		if (api.page.info().recordsDisplay<7) {
			$('#facultyFewer').hide();
			$('#facultyMore').hide();
		};
		smallWindow();//If window is less than 700px make adjustments to the interface
		
		if ($('#facultyData').css("display") == "none") {
			$('#faculty').find('span.closedInfo').show();
			$('#faculty').find('span.tableInfo').hide();	
		}
		else {
			$('#faculty').find('span.closedInfo').hide();
			$('#faculty').find('span.tableInfo').show();	
			
		};
		
		//Make keypress produce click
	$('a.more, a.fewer, span.details-control').unbind('keypress').keypress(function (e) {
		var key = e.which;
		if(key == 13)  // the enter key code
	{
		$(this).click();
		return false;  
	}
	});
	
		}//end drawCallBack
		


		
		} );
	
	
	//Courses Table
	var coursesTable = $('#coursesData').DataTable( {
			"dom": 'it',//remove default search input
			"language": {
				"info": "<h3>Courses</h3><span class='tableInfo'><p class='dataInfo'>Showing _END_ of _TOTAL_ </p><a  id='coursesMore' class='more' tabindex='0'>All courses</a><a id='coursesFewer' class='fewer' tabindex='0'>Fewer courses</a></span><span class='closedInfo'><p>_TOTAL_ results</p></span>",
				"infoFiltered": "",
				"infoEmpty" : "",
				"zeroRecords" : ""
			},
			"ajax": {
			"url": "/content/dam/bc1/schools/law/js/fusion/courseDataDescriptions.json",
			"dataSrc":""
			},
			  "columns": [
				{ "data": "Title"},
				{ "data": "Description"},
				{ "data": "Number"},
				{ "data": "Areas1"},
				{ "data": "Areas2"},
				{ "data": "Areas3"},
				{ "data": "Description"}
				],
		"order": [[0,'asc']],
		"pageLength": 6,
		columnDefs: [
		{ "targets": [0,1], "orderable": false },
        { "targets": [2,3,4,5,6], "visible": false},
        { "targets": 1, "searchable": false },
		{ className: "preLoad", "targets": [ 0 ] },
		{ className: "description", "targets": [ 1 ] },
		{ "targets":0, "render": function ( data, type, full, meta ) {
      return '<a href="#">'+data+'</a>';}},
      	{ "targets":6, "render": function ( data, type, full, meta ) {
      return data.replace(/business/gi,"").replace(/civil/gi, "").replace(/litigation/gi, "").replace(/constitutional/gi, "").replace(/criminal/gi, "").replace(/procedure/gi, "").replace(/environmental/gi, "").replace(/experiential/gi, "").replace(/health/gi, "").replace(/international/gi, "").replace(/comparative/gi, "").replace(/immigration/gi, "").replace(/real estate/gi, "").replace(/tax/gi, "");}}
		],	
	"drawCallback": function(settings) {
	//Hide course descriptions and add span with control to show and hide deescription
		$("td.description")
			.hide();
		
		//Remove any existing empty control spans - prevents them from being added repeatedly
		$("span.empty-control").remove();
		
		//Mark empty descriptions	
		$("td.description:empty").prev().addClass("empty").removeClass("preLoad");
		
		//Add control to rows with descriptions
		$("td.preLoad")
			.wrap("<span class='answer-tab details-control'></span>")
			.removeClass("preLoad");
			
		//Add empty control span to rows with no descriptions
		$("td.empty")
			.wrap("<span class='empty-control'></span>")
			.removeClass("empty");
		
		
		//Controls for each row
		$(".answer-tab")
		.unbind()
		.click(function(){
			$(this)
				.toggleClass("open")
				.parent()
				.find("td.description")
				.slideToggle(200);
            return false;
		});
		
		$('#coursesMore')
		.unbind()
		.on( 'click', function () {
			coursesTable.page.len(999).draw();
			$('#coursesMore').hide();
			$('#coursesFewer').show().focus();
		} );
		$('#coursesFewer')
		.unbind()
		.on( 'click', function () {
			coursesTable.page.len( 6).draw();
			$('#coursesFewer').hide();
			$('#coursesMore').show().focus();
		} );
		
		var api = this.api();
		if (api.page.len() ==6) {
			$('#coursesFewer').hide();
			$('#coursesMore').show();
		}
		else {
			$('#coursesFewer').show();
			$('#coursesMore').hide();
		}
		
		if (api.page.info().recordsDisplay<7) {
			$('#coursesFewer').hide();
			$('#coursesMore').hide();
		};
		smallWindow();//If window is less than 700px make adjustments to the interface
		
		if ($('#coursesData').css("display") == "none") {
			$('#courses').find('span.closedInfo').show();
			$('#courses').find('span.tableInfo').hide();	
		}
		else {
			$('#courses').find('span.closedInfo').hide();
			$('#courses').find('span.tableInfo').show();	
			
		};
		
		//Make keypress produce click
	$('a.more, a.fewer, span.details-control').unbind('keypress').keypress(function (e) {
		var key = e.which;
		if(key == 13)  // the enter key code
	{
		$(this).click();
		return false;  
	}
	});
	
		
		
		}
		//end drawCallBack
		} );
		
	//Experiential Table
	var experientialTable = $('#experientialData').DataTable( {
			"dom": 'it',//remove default search input
			"language": {
				"info": "<h3>Experiential Learning Opportunities</h3><span class='tableInfo'><p class='dataInfo'>Showing _END_ of _TOTAL_ </p><a  id='experientialMore' class='more' tabindex='0'>All Experiential Opportunities</a><a  id='experientialFewer' class='fewer' tabindex='0'>Fewer Experiential Opportunities</a></span><span class='closedInfo'><p>_TOTAL_ results</p></span>",
				"infoFiltered": "",
				"infoEmpty" : "",
				"zeroRecords" : ""
			},
			"ajax": {
			"url": "/content/dam/bc1/schools/law/js/fusion/experientialData.json",
			"dataSrc":""
			},
			  "columns": [
				{ "data": "Title"},
				{ "data": "Category" },
				{ "data": "CategorySortOrder" },
				{ "data": "URL" },
				{ "data": "Description" },
				{"data": "Area"},
				{ "data": "Description" }
				],
		"order": [[2,'asc', 0, 'asc']],
		"pageLength": 6,
		columnDefs: [
		{ "targets": 0, "orderable": false },
        { "targets": [1,2,3,5,6], "visible": false},
        { "targets": 4, "searchable": false },
		{ className: "preLoadExp", "targets": [ 0 ] },
		{ className: "descriptionExp", "targets": [ 4 ] },
		{ "targets":0, "render": function ( data, type, full, meta ) {
      return '<a href="#"><span class="innerLink">'+data+'</span></a>';}},
		{ "targets":4, "render": function ( data, type, full, meta ) {
      return data+'<span class="experientialLink"><br/><a class="descriptionLink">Learn More</a></span>';}},
     	{ "targets":6, "render": function ( data, type, full, meta ) {
      return data.replace(/business/gi,"").replace(/civil/gi, "").replace(/litigation/gi, "").replace(/constitutional/gi, "").replace(/criminal/gi, "").replace(/procedure/gi, "").replace(/environmental/gi, "").replace(/experiential/gi, "").replace(/health/gi, "").replace(/international/gi, "").replace(/comparative/gi, "").replace(/immigration/gi, "").replace(/real estate/gi, "").replace(/tax/gi, "");}}
		],	
	"drawCallback": function(settings) {
		//Add URLs to any links and alt tags to any images in each row, using the URLs in column 2 of the table for the links and the faculty Name field for the alt tags
		var api = this.api();
		var data=api.rows({page:'current'}).data();
		$.each(data, function (index,value) {
				var URL=this.URL;
				var desc = this.Description;
				var child=index+1;
				if (!!URL)
				{
					$("#experientialData tr:nth-child("+child+") td.descriptionExp a.descriptionLink").attr('href',URL);
				}
				else {
					$("#experientialData tr:nth-child("+child+") td.descriptionExp span.experientialLink").remove();
				}
				
				if (!!desc) {}
				else {
					var inner = $("#experientialData tr:nth-child("+child+") span.innerLink").contents();
					$("#experientialData tr:nth-child("+child+") span.innerLink").parent("a").replaceWith(inner);
					
				}
				
            }
			);
		
		
		//Hide descriptions and add span with control to show and hide deescription
		$("td.descriptionExp")
			.hide();
		
		//Remove any existing empty control spans - prevents them from being added repeatedly
		$("span.empty-controlExp").children().unwrap();
		
		//Mark empty descriptions	
		$("td.descriptionExp:empty").prev().addClass("emptyExp").removeClass("preLoadExp");
		
		//Add control to rows with descriptions
		$("td.preLoadExp")
			.wrap("<span class='answer-tabExp details-controlExp'></span>")
			.removeClass("preLoadExp");
			
		//Add empty control span to rows with no descriptions
		$("td.emptyExp")
			.wrap("<span class='empty-controlExp'></span>")
			.removeClass("emptyExp");
		
		
		//Controls for each row
		$(".answer-tabExp")
		.unbind()
		.click(function(){
			$(this)
				.toggleClass("open")
				.parent()
				.find("td.descriptionExp")
				.slideToggle(200);
            return false;
		});	
		
		
		//Group items by type
		 var api = this.api();
           var rows = api.rows( {page:'current'} ).nodes();
           var last=null;
            api.column(1, {page:'current'} ).data().each( function ( group, i ) {
                if ( last !== group ) {
                    $(rows).eq( i ).before(
                        '<tr class="group"><td><h4>'+group+'</h4></td></tr>'
                    );
 
                    last = group;
                }
            } );
		
			
			
		$('#experientialMore')
		.unbind()
		.on( 'click', function () {
			experientialTable.page.len(999).draw();
			$('#experientialMore').hide();
			$('#experientialFewer').show().focus();
		} );
		$('#experientialFewer')
		.unbind()
		.on( 'click', function () {
			experientialTable.page.len( 6).draw();
			$('#experientialFewer').hide();
			$('#experientialMore').show().focus();
		} );
		
		if (api.page.len() ==6) {
			$('#experientialFewer').hide();
			$('#experientialMore').show();
		}
		else {
			$('#experientialFewer').show();
			$('#experientialMore').hide();
		}
		
		if (api.page.info().recordsDisplay<7) {
			$('#experientialFewer').hide();
			$('#experientialMore').hide();
		};		
		smallWindow();//If window is less than 700px make adjustments to the interface	
		
		if ($('#experientialData').css("display") == "none") {
			$('#experiential').find('span.closedInfo').show();
			$('#experiential').find('span.tableInfo').hide();	
		}
		else {
			$('#experiential').find('span.closedInfo').hide();
			$('#experiential').find('span.tableInfo').show();	
			
		};
		
		//Make keypress produce click
	$('a.more, a.fewer, span.details-control').unbind('keypress').keypress(function (e) {
		var key = e.which;
		if(key == 13)  // the enter key code
	{
		$(this).click();
		return false;  
	}
	});
	
		
			
		}
		//end drawCallBack
		} );
		
	//Publications Table	
	var publicationsTable = $('#publicationsData').DataTable( {
			"dom": 'it',//remove default search input
			"language": {
				"info": "<h3>Faculty Publications</h3><span class='tableInfo'><p class='dataInfo'>Showing _END_ of _TOTAL_ </p>  <a id='publicationsMore' class='more' tabindex='0'>All publications</a><a id='publicationsFewer' class='fewer' tabindex='0'>Fewer publications</a></span><span class='closedInfo'><p>_TOTAL_ results</p></span>",
				"infoFiltered": "",
				"infoEmpty" : "",
				"zeroRecords" : ""
			},
			"ajax": {
			"url": "/content/dam/bc1/schools/law/js/fusion/publicationsData.json",
			"dataSrc":""
			},
			  "columns": [
				{ "data": "year"},
				{ "data": "title"},
				{ "data": "publication"},
				{ "data": "name"},
				{ "data": "disciplines"},
				{ "data": "URL"},
				{"data": "priority"},
				{ "data": "book"},
				{ "data": "fusionareas"}
				],
		"order": [[6,'asc'],[0,'desc'],[1,'asc']],
		"pageLength": 6,
		columnDefs: [
		{ "targets": 1, "orderable": false },
        { "targets": [0,2,3,4,5,6,7,8], "visible": false},
		{ "targets":1, "render": function ( data, type, full, meta ) {
      return '<a>'+data+'</a>';}}
		],	
	"drawCallback": function(settings) {
		//Add URLs to any links and alt tags to any images in each row, using the URLs in column 2 of the table for the links and the faculty Name field for the alt tags
		var api = this.api();
		var data=api.rows({page:'current'}).data();
		$.each(data, function (index,value) {
				var URL=this.URL
				var publication=this.publication
				var book=this.book
				var name=this.name
				var year=this.year
				var child=index+1;
				$("#publicationsData tr:nth-child("+child+")").find('.namePub').remove();
				$("#publicationsData tr:nth-child("+child+")").find('a').attr('href',URL);
				if (book == 1) { //italicize publication/publisher for journal articles but not for books
				$("#publicationsData tr:nth-child("+child+")").find('td').append('<p class="namePub">'+name+', '+publication+', '+year+'</p>');
				}
				else {
				$("#publicationsData tr:nth-child("+child+")").find('td').append('<p class="namePub">'+name+', <em>'+publication+'</em>, '+year+'</p>');
				}
            }
			);
		$('#publicationsMore')
		.unbind()
		.on( 'click', function () {
			publicationsTable.page.len(9999).draw();
			$('#publicationsMore').hide();
			$('#publicationsFewer').show().focus();
		} );
		$('#publicationsFewer')
		.unbind()
		.on( 'click', function () {
			publicationsTable.page.len( 6).draw();
			$('#publicationsFewer').hide();
			$('#publicationsMore').show().focus();
		} );
		
		if (api.page.len() ==6) {
			$('#publicationsFewer').hide();
			$('#publicationsMore').show();
		}
		else {
			$('#publicationsFewer').show();
			$('#publicationsMore').hide();
		}
		
		
		
		if (api.page.info().recordsDisplay<7) {
			$('#publicationsFewer').hide();
			$('#publicationsMore').hide();
		};
		smallWindow();//If window is less than 700px make adjustments to the interface	
		
		if ($('#publicationsData').css("display") == "none") {
			$('#publications').find('span.closedInfo').show();
			$('#publications').find('span.tableInfo').hide();	
		}
		else {
			$('#publications').find('span.closedInfo').hide();
			$('#publications').find('span.tableInfo').show();	
			
		};
		
		//Make keypress produce click
		$('a.more, a.fewer, span.details-control').unbind('keypress').keypress(function (e) {
		var key = e.which;
		if(key == 13)  // the enter key code
	{
		$(this).click();
		return false;  
	}
	});
	
		
	
		
	}
		//end drawCallBack

		});		
		
	
	
		
	

		
	var tables = $('.dataTable').DataTable(); //Needed to let inputs controll all tables 

	if (myKey.length >0) {
	 tables.search( myKey.replace(/\blaw\b/g, '').replace(/\bLaw\b/g, '') ).draw();
	 $('#myInput').val(myKey);
	 $('.dropdown-content').hide();
	}; 
	$("span.all").hide();//hide the X that appears in the search box
	// #myInput is a <input type="text"> element
	
	
	//Search from the text search input
	$('#myInput').on( 'keyup', function () {
		var inputSearch = this.value.replace(/\blaw\b/g, '').replace(/\bLaw\b/g, '');
	if (inputSearch.length==0) {
		tables.search(inputSearch).draw();
		$("span.all").hide();
	}
	//Short searches with publications set to "All" are very slow - if the user searches less than 3 characters with pubs set to show all, change the pubs table to show fewer
	else if (inputSearch.length<3) {
		$('#publicationsData').DataTable().page.len(6).draw();
		tables.search(inputSearch).draw();
		$("span.all").show();
	}
	else	{
		tables.search(inputSearch).draw();
		$("span.all").show();
	}
	});
	//end of the text search input
	
	
	//at widths of 700px or less, start with the tables hidden and use the header as a toggle
	if ($('#courses').css("float") == "left"){
		$('.dataTable').hide();
	}
	
	function smallWindow() { //This function is run in the drawCallback of each table
	if ($('#courses').css("float") == "left"){
		
		$('div.dataTables_info h3, .closedInfo')
		.unbind()
		.click(function() {
			if ($(this).parent().parent().find('.dataTable').css("display") =="none") {
				$(this).parent().find('span.closedInfo').hide();
				$(this).parent().find('span.tableInfo').show();	
			}
			else {
				$(this).parent().find('span.closedInfo').show();
				$(this).parent().find('span.tableInfo').hide();
			};
			$(this).parent().parent().find('.dataTable').fadeToggle();
		});
			
			
		$('.dataInfo')
		.unbind()
		.click(function() {
			if ($(this).parent().parent().parent().find('.dataTable').css("display") =="none") {
				$(this).parent().parent().find('span.closedInfo').hide();
				$(this).parent().parent().find('span.tableInfo').show();	
			}
			else {
				$(this).parent().parent().find('span.closedInfo').show();
				$(this).parent().parent().find('span.tableInfo').hide();
			};
			$(this).parent().parent().parent().find('.dataTable').fadeToggle();
			
			
		});

	};
	}
	
	
	
	

} ;