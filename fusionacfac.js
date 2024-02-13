/**
 * The following program was written by the Department of Collection Services & Digital Initiatives at the Boston College Law Library.
 * It is a web application that presents information about BC Law School's faculty, publications, courses, and experiential opportunities.
 * This version (acfac) is displayed on the Academics & Faculty page, and does not have a search function.
 */

// Create a dictionary {faculty:areas} for var publicationsTable
// For assigning areas to works based on faculty author

// last edited 13 February 2024 10:29AM
var faculty_info_list = {};
$.ajax({
	url: `https://sheets.googleapis.com/v4/spreadsheets/1nKPgpNotU2NRH7fY-_bAjvFEc95M3MF_5uREiMyvoiw/values/faculty!A:G?key=AIzaSyD8Y28YJpVhE4XlVlOoA74Ws47YdPz5nGA`,
	type: "GET",
	async: false, //important
	success: function(data) {
		data.values.forEach(function(item) {
			// If a faculty member's Areas column is filled, pull it into the dict
			if (typeof item[6] !== "undefined") {
				faculty_info_list[item[0]] = item[6];
			} else { 
				faculty_info_list[item[0]] = "";
			}
		});
	},
	error: function(error) {
		console.log(`Error ${error}`);
	}
})

// Get any search parameters from the URL
function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||""
}

myKey = getURLParameter('key');

window.onload = function() {

	// Add function to filter button
	// Only shows on mobile, opens and closes the menu
	$("div#fusionFilter button").click(function() {
		$("ul#areaSearch").slideToggle();
		$("span#fusionCaret").toggleClass("dropup");
	});

	// Create menu from stored file of display names and search terms
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
		

		// Make keypress produce click
		$('span.dropdownOpen, .ui-menu-item, a.more, a.fewer, span.details-control, span#clearSearch').keypress(function (e) {
			var key = e.which;
			if(key == 13) { // The enter key code 
				$(this).click();
				return false;  
			}
		});

		var previousSearch;	// Set variable to enable re-clicking the selected item to toggle the results div
		// Perform a search from the drop-down of pre-selected searches
		$('li.fusion-area').click (function() {

			// The search term is stored in the ID
			// Allowing display on the drop down to be different from search term
			var search = $(this).attr("id");
		
			// If the search is already selected, toggle the results div
			if(search == previousSearch) {  
				$(this).toggleClass("selectedFusion");
				$("div#fusionTables").fadeToggle();
			} else {
				$(".selectedFusion").removeClass("selectedFusion");	
				$(this).addClass("selectedFusion");
				$("div#fusionTables").fadeIn();
				tables.search("");
				tables.search( search ).draw();
				$("div#findMoreButton a").text("Find more in "+search).attr("href","https://www.bc.edu/bc-web/schools/law/academics-faculty/fusion-search.html?key="+search.replace("&","and"));//add fusion url to href value when available
			};
			previousSearch = search;
		});
	}); // END .getJSON
	
	$("#fusionTables a.icon-close").click(function() {
		event.preventDefault();
		$(".selectedFusion").removeClass("selectedFusion");
		$("div#fusionTables").fadeOut();
		
	});
	
	var facultyTable = $('#facultyData').DataTable( {
		"dom": 't',// Remove default search input
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
			// Add URLs to any links and alt tags to any images in each row, using the URLs in column 2 of the table for the links and the faculty Name field for the alt tags
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
		}// END drawCallBack		
	}); // END var facultyTable

	var coursesTable = $('#coursesData').DataTable( {
		"dom": 't',// Remove default search input
		"language":{ "zeroRecords": "" },
		"ajax": {
			"url": "/content/dam/bc1/schools/law/js/fusion/json/courseDataDescriptions.json",
			"dataSrc":""
		},
		"deferRender": true,
			"columns": [
				{ "data": "Title" },
				{ "data": "Description" },
				{ "data": "Number" },
				{ "data": "Areas1" },
				{ "data": "Areas2" },
				{ "data": "Areas3" }
			],
		"order": [[0,'asc']],
		"pageLength": 15,
		columnDefs: [
			{ "targets": [0,1], "orderable": false },
       		{ "targets": [1,2,3,4,5], "visible": false },
     		{ "targets":1, "render": function ( data, type, full, meta ) {
				return data.replace(/business | civil | litigation | constitutional | criminal | procedure | environmental | experiential | health | international | comparative | immigration | real estate | tax /gi,"");}}
		],	
		"drawCallback": function(settings) {
		
			// Hide the entire table plus the header if there are no results	
			if ($("div#courses").find("td.dataTables_empty").length) {
				$("div#courses").find("h3").hide();
			} else { 
				$("div#courses").find("h3").show();
			};
		} // END drawCallBack
	}); // END var coursesTable
		
	var experientialTable = $('#experientialData').DataTable( {
		"dom": 't',// Remove default search input
		"language":{ "zeroRecords": "" },
		"ajax": {
			"url": "/content/dam/bc1/schools/law/js/fusion/json/experientialData.json",
			"dataSrc":""
		},
		"deferRender": true,
		"columns": [
			{ "data": "Title" },
			{ "data": "Category" },
			{ "data": "CategorySortOrder" },
			{ "data": "URL" },
			{ "data": "Description" },
			{"data": "Area" }
		],
		"order": [[2,'asc', 0, 'asc']],
		"pageLength": 10,
		columnDefs: [
			{ "targets": 0, "orderable": false },
        	{ "targets": [1,2,3,4,5], "visible": false },
			{ "targets":0, "render": function ( data, type, full, meta ) {
    			return '<a class="experientialLink" href="#"><span class="innerLink">'+data+'</span></a>'; } },
     		{ "targets":4, "render": function ( data, type, full, meta ) {
				return data.replace(/business | civil | litigation | constitutional | criminal | procedure | environmental | experiential | health | international | comparative | immigration | real estate | tax /gi,""); } }
		],	
		"drawCallback": function(settings) {
			var api = this.api();
			var data=api.rows({ page:'current' }).data();
			for (i = 0; i < data.length; i++) {
				var child=i+1;
				if (!!data[i].URL) {
					$("#experientialData tr:nth-child("+child+") a.experientialLink").attr('href',data[i].URL);
				} else {
					$("#experientialData tr:nth-child("+child+") span.innerLink").unwrap(); 
				}
			}
			
			// Group items by type
			var rows = api.rows( { page:'current' } ).nodes();
			var last=null;
			api.column(1, { page:'current' } ).data().each( function ( group, i ) {
				if (last !== group) {
					$(rows).eq( i ).before('<tr class="group"><td><h4>'+group+'</h4></td></tr>');
					last = group;
				}
			});
			
			// Hide the entire table plus the header if there are no results	
			if ($("div#experiential").find("td.dataTables_empty").length) {
				$("div#experiential").find("h3").hide();
			} else { 
				$("div#experiential").find("h3").show();
			};
		}// END drawCallBack
	}); // END var experientialTable
		
	var publicationsTable = $('#publicationsData').DataTable( {
		"dom": 't',// Remove default search input
		"ajax": { // Pull data from Google Sheet via Sheets API V4
			url:`https://sheets.googleapis.com/v4/spreadsheets/1nKPgpNotU2NRH7fY-_bAjvFEc95M3MF_5uREiMyvoiw/values/pubs!A:N?key=AIzaSyD8Y28YJpVhE4XlVlOoA74Ws47YdPz5nGA`,
			// Set caching to true
			cache: true,
			// Manipulate Google Sheet data
			"dataSrc": function(json) {
				var myData = json['values'];
				myData = myData.map(function( n ) {
					myObject = {
						year:n[12],
						partwork:n[5],
						wholework:n[6],
						publisher:n[7],
						author:n[3],
						coauthors:n[4],
						url:n[13],
						priority:n[2],
						areas:faculty_info_list[n[0]]
					};
					return myObject;
				});
				// Remove header row
				myData.splice(0,1); 
				return myData;
			}
		},
		"deferRender": true,
		'columns': [
			{ "data": "year"},
			{ "data": "partwork"},
			{ "data": "wholework"},
			{ "data": "publisher"},
			{ "data": "author"},
			{ "data": "coauthors"},
			{ "data": "url", // the render field is necessary
			  render: function(data, type, row) {
					if ((data === undefined) || (data === null)) {
						data = "";
					} 
					return data;
			  }
			},
			{ "data": "priority"},
			{ "data": "areas"}
		],
		"order": [[0,'desc'],[7,'asc'], [2, 'asc'], [1, 'asc']], // Sort table by columns
		"pageLength": 4,
		columnDefs: [
			{ "targets": 1, "orderable": false },
			{ "targets": [0,2,3,4,5,6,7,8], "visible": false },
			{ "targets":1, "render": function ( data, type, full, meta ) { return '<a>'+data+'</a>'; } }
		],
		"drawCallback": function(settings) {
			// Add URLs to any links and alt tags to any images in each row, using the URLs in column 2 of the table for the links and the faculty Name field for the alt tags
			var api = this.api();
			var data=api.rows({ page:'current' }).data();
			for (i = 0; i < data.length; i++) {
	
				var child=i+1;
				$("#publicationsData tr:nth-child("+child+")").find('.namePub').remove();
				$("#publicationsData tr:nth-child("+child+")").find('a').addClass('publicationTitle');
				
				// Format coauthor information
				coauthor_info = '';
				var coauthors_list = data[i].coauthors.split(';');
				if (coauthors_list.length === 1 && coauthors_list[0] !== '') {
					coauthor_info = ` with ${coauthors_list[0]}`;
				} else if (coauthors_list.length > 1) {
					coauthors_before_and = coauthors_list.slice(0,-1);
					coauthor_info = ` with ${coauthors_before_and.join(", ")} and ${coauthors_list.pop()}`;
				}
	
				// Make DOMs of books and 'others' (reports, blog posts etc) agree with articles, book chapters, book reviews
				if (data[i].priority == 1 || data[i].priority == 5) {
					$("#publicationsData tr:nth-child("+child+")").find('a').html(data[i].wholework);
					$("#publicationsData tr:nth-child("+child+")").find('td').append('<p class="namePub">'+data[i].author+coauthor_info+ ', '+data[i].publisher+', '+data[i].year+'</p>');
				}
				else {
					$("#publicationsData tr:nth-child("+child+")").find('td').append('<p class="namePub">'+data[i].author+coauthor_info+ ', <i>'+data[i].wholework+'</i>, '+data[i].year+'</p>');
				}
	
				// Remove links from works that don't have a url
				if ((data[i].url === "") || (data[i].url === undefined)) {
					$("#publicationsData tr:nth-child("+child+")").find('a').addClass('no-url');
				} else {
					$("#publicationsData tr:nth-child("+child+")").find('a').attr('href',data[i].url);
				}
			}
		} // END drawCallBack
	});	// END var publicationsTable

	var tables = $('.dataTable').DataTable(); // Let inputs control all tables 

	if (myKey.length >0) {
		tables.search( myKey ).draw();
		$('#myInput').val(myKey);
	}; 

}; // END window.onload()