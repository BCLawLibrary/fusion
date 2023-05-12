//Get any search parameters from the URL
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||""
	}

	myKey = getURLParameter('key');



window.onload = function() {
//Filter button - only shows on mobile, opens and closes the menu
	$("div#fusionFilter button").click(function() {
		$("ul#areaSearch").slideToggle();
		$("span#fusionCaret").toggleClass("dropup");
	});	
	
	
	
	
		
//Create menu from stored file of display names and search terms	
		
	var cList = $('ul#areaSearch')
	$(cList).empty();	
	$.getJSON( "/content/dam/bc1/schools/law/js/fusion/json/menuDataacfac.json", function( data ) {
	var items = [];
	$.each( data, function( key, value ) {
		var li = $('<li/>')
				.addClass('ui-menu-item fusion-area')
				.attr('role', 'menuitem')
				.attr('tabindex', '1')
				.attr('id', value.searchTerm)
				.text(value.displayName)
				.appendTo(cList);
			});
	var more = $('<li/>')
			.addClass('ui-menu-item fusion-more')
			.attr('role', 'menuitem')
			.attr('tabindex', '1')
			.attr('id', "fusion-more")
			.appendTo(cList);
	var moreLink=$('<a>')
			.attr('href', "https://www.bc.edu/bc-web/schools/law/academics-faculty/fusion-search.html")
			.text("More")
			.appendTo(more);
		

	//Make keypress produce click
	$('span.dropdownOpen, .ui-menu-item, a.more, a.fewer, span.details-control, span#clearSearch').keypress(function (e) {
		var key = e.which;
		if(key == 13)  // the enter key code
	{
		$(this).click();
		return false;  
	}
	});
	

	
	
	
	
	var previousSearch;	//set variable to enable re-clicking the selected item to toggle the results div
	//Perform a search from the drop-down of pre-selected searches
	$('li.fusion-area').click (function() {
		
	
	var search = $(this).attr("id");//the search term is stored in the ID - this allows for the display on the drop down to be different than the text that is searched for
	
	if(search == previousSearch) { //If the search is already selected, toggle the results div 
		$(this).toggleClass("selectedFusion");
		$("div#fusionTables").fadeToggle();
		
	}
	else {
	$(".selectedFusion").removeClass("selectedFusion");	
	$(this).addClass("selectedFusion");
	$("div#fusionTables").fadeIn();
	tables.search("");
	tables.search( search ).draw();
	$("div#findMoreButton a").text("Find more in "+search).attr("href","https://www.bc.edu/bc-web/schools/law/academics-faculty/fusion-search.html?key="+search.replace("&","and"));//add fusion url to href value when available
	};
	previousSearch = search;
	});
	
	
	
	});
	
	$("#fusionTables a.icon-close").click(function() {
		event.preventDefault();
		$(".selectedFusion").removeClass("selectedFusion");
		$("div#fusionTables").fadeOut();
		
	});
	
 
		//Faculty Table
		var facultyTable = $('#facultyData').DataTable( {
			"dom": 't',//remove default search input
			"ajax": {
			"url": "/content/dam/bc1/schools/law/js/fusion/json/facultyData.json",
			"dataSrc":""
			},
			"deferRender": true,
			"order": [[8,'asc'], [6,'asc']],
			"pageLength": 4,
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
				{ "data": "biography"},
				{ "data": "acfacAreas"}
				],
		columnDefs: [
		{ "targets": 0, "orderable": false },
		{ "targets": [3, ,4 , 5], "searchable": false},
        { "targets": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "visible": false},
		{ "targets":0, "render": function ( data, type, full, meta ) {
      return '<a><img src="'+data+'"></a>';}},
    	{ "targets":9, "render": function ( data, type, full, meta ) {
     return data.replace(/business | civil | litigation | constitutional | criminal | procedure | environmental | experiential | health | international | comparative | immigration | real estate | tax /gi,"");}}
		],	
	"drawCallback": function(settings) {
		//Add URLs to any links and alt tags to any images in each row, using the URLs in column 2 of the table for the links and the faculty Name field for the alt tags
		var api = this.api();
		var data=api.rows({page:'current'}).data();
			for (i = 0; i < data.length; i++) {
			
			
				var child=i+1;
				$("#facultyData tr:nth-child("+child+")").find('.facultyName').remove();
				$("#facultyData tr:nth-child("+child+")").find('td').append('<a class="facultyName">'+data[i].DisplayName+'</a>');
				$("#facultyData tr:nth-child("+child+")").find('a').attr('href',data[i].URL);
				$("#facultyData tr:nth-child("+child+")").find('img').attr('alt',data[i].DisplayName);
				$("#facultyData tr:nth-child("+child+")").find('img[src=""]').attr('src','/content/dam/bc1/schools/law/js/images/law_faculty_placeholder.jpg');
            };
		
	
		}//end drawCallBack
		


		
		} );
	
	
	//Courses Table
	var coursesTable = $('#coursesData').DataTable( {
			"dom": 't',//remove default search input
			"language":{
				"zeroRecords": ""
			},
			"ajax": {
			"url": "/content/dam/bc1/schools/law/js/fusion/json/courseDataDescriptions.json",
			"dataSrc":""
			},
			"deferRender": true,
			  "columns": [
				{ "data": "Title"},
				{ "data": "Description"},
				{ "data": "Number"},
				{ "data": "Areas1"},
				{ "data": "Areas2"},
				{ "data": "Areas3"}
				],
		"order": [[0,'asc']],
		"pageLength": 15,
		columnDefs: [
		{ "targets": [0,1], "orderable": false },
        { "targets": [1,2,3,4,5], "visible": false},
     	{ "targets":1, "render": function ( data, type, full, meta ) {
		return data.replace(/business | civil | litigation | constitutional | criminal | procedure | environmental | experiential | health | international | comparative | immigration | real estate | tax /gi,"");}}
		],	
	"drawCallback": function(settings) {
		
		//Hide the entire table plus the header if there are no results	
		if ($("div#courses").find("td.dataTables_empty").length) {
			$("div#courses").find("h3").hide();
		}
		else { 
			$("div#courses").find("h3").show();
		};
		}
		//end drawCallBack
		} );
		
	//Experiential Table
	var experientialTable = $('#experientialData').DataTable( {
			"dom": 't',//remove default search input
			"language":{
				"zeroRecords": ""
			},
			"ajax": {
			"url": "/content/dam/bc1/schools/law/js/fusion/json/experientialData.json",
			"dataSrc":""
			},
			"deferRender": true,
			  "columns": [
				{ "data": "Title"},
				{ "data": "Category" },
				{ "data": "CategorySortOrder" },
				{ "data": "URL" },
				{ "data": "Description" },
				{"data": "Area"}
				],
		"order": [[2,'asc', 0, 'asc']],
		"pageLength": 10,
		columnDefs: [
		{ "targets": 0, "orderable": false },
        { "targets": [1,2,3,4,5], "visible": false},
		{ "targets":0, "render": function ( data, type, full, meta ) {
      return '<a class="experientialLink" href="#"><span class="innerLink">'+data+'</span></a>';}},
     	{ "targets":4, "render": function ( data, type, full, meta ) {
	return data.replace(/business | civil | litigation | constitutional | criminal | procedure | environmental | experiential | health | international | comparative | immigration | real estate | tax /gi,"");}}
		],	
	"drawCallback": function(settings) {
		
		 var api = this.api();
		var data=api.rows({page:'current'}).data();
		
		 for (i = 0; i < data.length; i++) {
				var child=i+1;
				if (!!data[i].URL)
				{
					$("#experientialData tr:nth-child("+child+") a.experientialLink").attr('href',data[i].URL);
				}
				else {
					$("#experientialData tr:nth-child("+child+") span.innerLink").unwrap(); 
				}
				
            }
		 
		 //Group items by type
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
			

			
		//Hide the entire table plus the header if there are no results	
		if ($("div#experiential").find("td.dataTables_empty").length) {
			$("div#experiential").find("h3").hide();
		}
		else { 
			$("div#experiential").find("h3").show();
		};
		
		}

		//end drawCallBack
		} );
		
	//Publications Table	
	var publicationsTable = $('#publicationsData').DataTable( {
			"dom": 't',//remove default search input
			"ajax": {
			"url": "/content/dam/bc1/schools/law/js/fusion/json/publicationsData.json",
			"dataSrc":""
			},
			"deferRender": true,
			  "columns": [
				{ "data": "year"},
				{ "data": "title"},
				{ "data": "publication"},
				{ "data": "name"},
				{ "data": "disciplines"},
				{ "data": "URL"},
				{ "data": "priority"},
				{ "data": "book"},
				{ "data": "fusionareas"}
				],
		"order": [[6,'asc'],[0,'desc'],[1,'asc']],
		"pageLength": 4,
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
			for (i = 0; i < data.length; i++) {
				
				var child=i+1;
				$("#publicationsData tr:nth-child("+child+")").find('.namePub').remove();
				$("#publicationsData tr:nth-child("+child+")").find('a').attr('href',data[i].URL);
				if (data[i].book == 1) { //italicize publication/publisher for journal articles but not for books
				$("#publicationsData tr:nth-child("+child+")").find('td').append('<p class="namePub">'+data[i].name+', '+data[i].publication+', '+data[i].year+'</p>');
				}
				else {
				$("#publicationsData tr:nth-child("+child+")").find('td').append('<p class="namePub">'+data[i].name+', <em>'+data[i].publication+'</em>, '+data[i].year+'</p>');
				}
            }
			
			
			
		
	}
		//end drawCallBack

		});		

	var tables = $('.dataTable').DataTable(); //Needed to let inputs controll all tables 

	if (myKey.length >0) {
	 tables.search( myKey ).draw();
	 $('#myInput').val(myKey);
	}; 
	
	
};