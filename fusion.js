/**
 * The following program was written by the Department of Collection Services & Digital Initiatives at the Boston College Law Library.
 * It is a web application that presents information about BC Law School's faculty, publications, courses, and experiential opportunities.
 * This version is displayed on its own page (Fusion Search), and has a search function. 
 */

// Create a dictionary {faculty:areas} for var publicationsTable
// For assigning areas to works based on faculty author
var faculty_info_list = {};
$.ajax({
	url: `https://sheets.googleapis.com/v4/spreadsheets/1nKPgpNotU2NRH7fY-_bAjvFEc95M3MF_5uREiMyvoiw/values/faculty!A:G?key=REDACTED`,
	type: "GET",
	async: false, //important
	success: function(data) {
		data.values.forEach(function(item) {
			// if Areas column is filled, put it into the dict
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

//Get any search parameters from the URL
function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||""
}
  
myKey = getURLParameter('key').replace("and","&");

function searchMenu() {

	$('span.dropdownOpen').click(function() {
		$('div.dropdown-content').toggle();
	});

	// Make keypress produce click
	$('span.dropdownOpen, .ui-menu-item, a.more, a.fewer, span.details-control, span#clearSearch').unbind('keypress').keypress(function (e) {
		var key = e.which;
		if (key == 13) { // the enter key code
			$(this).click();
			return false;
		}
	});

	// Search from the drop-down of pre-selected searches
	var tables = $('.dataTable').DataTable(); // Let inputs control all tables

	$('li.ui-menu-item').click (function() {
		// Search term is stored in the ID, allowing display on drop down to be different than the search text
		var search = $(this).attr("id"); 
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
	if (myKey.length >0) {
		tables.search( myKey.replace(/\blaw\b/g, '').replace(/\bLaw\b/g, '') ).draw();
		$('#myInput').val(myKey);
		$('.dropdown-content').hide();
	};

	// Hide the X that appears in the search box
	$("span.all").hide();

	// Search from the text search input
	$('#myInput').on( 'keyup', function () {
		var inputSearch = this.value.replace(/\blaw\b/g, '').replace(/\bLaw\b/g, '');
		if (inputSearch.length==0) {
			tables.search(inputSearch).draw();
			$("span.all").hide();
		} else if (inputSearch.length<3) {
			// Short searches with publications set to "All" are very slow
			// If search text length < 3 with pubs = show all, change pubs table to show only 6
			$('#publicationsData').DataTable().page.len(6).draw();
			tables.search(inputSearch).draw();
			$("span.all").show();
		} else {
			tables.search(inputSearch).draw();
			$("span.all").show();
		}
	});
}

window.onload = function() { 

	var facultyTable = $('#facultyData').DataTable( {
		"dom": 'it', // Remove default search input
		"language": {
			"info": "<h3>Faculty</h3><span class='tableInfo'><p class='dataInfo'>Showing _END_ of _TOTAL_ </p><a  id='facultyMore' class='more' tabindex='0' >All faculty</a><a id='facultyFewer' class='fewer' tabindex='0' >Fewer faculty</a></span><span class='closedInfo'><p>_TOTAL_ results</p></span>",
			"infoFiltered": "",
			"infoEmpty" : "<h3>Faculty</h3><span class='tableInfo'><p class='emptyInfo'>No matching faculty</p></span>",
			"zeroRecords" : "",
			"loadingRecords": ""
		},
		"ajax": {
			"url": "/content/dam/bc1/schools/law/js/fusion/json/facultyData.json",
			"dataSrc":""
		},
		"deferRender": true,
		"order": [[8,'asc'], [6,'asc']],
		"pageLength": 6,
		"columns": [
			{ "data": "Image" },
			{ "data": "DisplayName" },
			{ "data": "URL" },
			{ "data": "area1" },
			{ "data": "area2" },
			{ "data": "area3" },
			{ "data": "SortName" },
			{ "data": "facultyStatus" },
			{ "data": "priority" },
			{ "data": "biography" }
		],
		columnDefs: [
			{ "targets": 0, "orderable": false },
			{ "targets": [1, 2, 3, 4, 5, 6, 7, 8, 9], "visible": false },
			{ "targets":0, "render": function ( data, type, full, meta ) {
				return '<a><img src="'+data+'"></a>';}},
			{ "targets":9, "render": function ( data, type, full, meta ) {
				return data.replace(/business|civil|litigation|constitutional|criminal|clinical|experiential|education|procedure|environmental|health|international|comparative|immigration|labor|employment|real estate|tax /gi," ");}}
		],
		"initComplete": function(settings) {
			var api = this.api();
			var more = $("<a>")
			.addClass("showMore facultyShowMore more")
			.text("Show more");
			$('#facultyData_wrapper').append(more);
			$('.facultyShowMore, .smallWfaculty').click(function(){
				var currentLength = api.page.len();
				facultyTable.page.len(currentLength+6).draw();
			});
			if ($('#courses').css("float") == "left"){
				$('.showMore').hide();
			};
			$('#faculty .waiting').fadeOut(200, function() {
				$('#facultyData_wrapper').fadeIn(600);
			});
			smallWindowInit();
		},
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
				$("#facultyData tr:nth-child("+child+")").addClass(data[i].facultyStatus.replace(/\s+/g, ''));
			};

			// Group items by type
			var rows = api.rows( {page:'current'} ).nodes();
			var last=null;
			$("td.facultyGroupHeaderCell").remove();
			$("tr.facultyGroupHeaderRow").removeClass("facultyGroupHeaderRow");
			var groupData = api.column(7, {page:'current'} ).data()

			for (i = 0; i < groupData.length; i++) {
				if ( last !== groupData[i] ) {
					if (groupData[i] !="Full-Time Faculty") { // No group header for full-time faculty
						$(rows).eq( i ).not(':has(h4)').addClass("facultyGroupHeaderRow").prepend(
							'<td class="facultyGroupHeaderCell"><h4 class="facultyGroupHeader">'+groupData[i]+'</h4></td>'
						);
					}
					last = groupData[i];
				}
			};

			$('#facultyMore')
				.unbind()
				.on( 'click', function () {
					facultyTable.page.len(999).draw();
					$('#facultyMore').hide();
					$('#facultyFewer').show().focus();
				});
				$('#facultyFewer')
				.unbind()
				.on( 'click', function () {
					facultyTable.page.len( 6).draw();
					$('#facultyFewer').hide();
				$('.facultyShowMore').show();
					$('#facultyMore').show().focus();
				});

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
			if (api.page.len() > api.page.info().recordsDisplay) {
				$('.facultyShowMore').hide();
			};

			// Make keypress produce click
			$('a.more, a.fewer, span.details-control').unbind('keypress').keypress(function (e) {
				var key = e.which;
				if (key == 13) { // the enter key code
					$(this).click();
					return false;
				}
			});

			smallWindow();

			// If window is less than 700px make adjustments to the interface
			if (api.page.len() > api.page.info().recordsDisplay) {
			$('.smallWfaculty').hide();
			};
		}// END drawCallBack
	}); // END var facultyTable

	var coursesTable = $('#coursesData').DataTable( {
		"dom": 'it', //remove default search input
		"language": {
			"info": "<h3>Courses</h3><span class='tableInfo'><p class='dataInfo'>Showing _END_ of _TOTAL_ </p><a  id='coursesMore' class='more' tabindex='0'>All courses</a><a id='coursesFewer' class='fewer' tabindex='0'>Fewer courses</a></span><span class='closedInfo'><p>_TOTAL_ results</p></span>",
			"infoFiltered": "",
			"infoEmpty" : "<h3>Courses</h3><span class='tableInfo'><p class='emptyInfo'>No matching courses</p></span>",
			"zeroRecords" : "",
			"loadingRecords": ""
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
			return '<a href="#" class="courseToggle openToggle">'+data+'</a>';}},
			{ "targets":6, "render": function ( data, type, full, meta ) {
			return data.replace(/business|civil|litigation|constitutional|criminal|clinical|experiential|education|procedure|environmental|health|international|comparative|immigration|labor|employment|real estate|tax /gi," ");}}
		],
		"initComplete": function(settings) {
			var api = this.api();
			var more = $("<a>")
				.addClass("showMore coursesShowMore more")
				.text("Show more");
			$('#coursesData_wrapper').append(more);
			$('.coursesShowMore, .smallWcourses').click(function(){
				var currentLength = api.page.len();
				coursesTable.page.len(currentLength+6).draw();
			});
			if ($('#courses').css("float") == "left"){
				$('.showMore').hide();
			};
			$('#courses .waiting').fadeOut(200, function() {
				$('#coursesData_wrapper').fadeIn(600);
			});
			smallWindowInit();
		},
		"drawCallback": function(settings) {
			// Hide course descriptions and add span with control to show and hide deescription
			$("td.description")
				.hide();

			// In case this is a redraw, first make sure all of the items show as closed
			$("span.open a.closeToggle").removeClass("closeToggle").addClass("openToggle");
			$("span.open").removeClass("closeToggle").removeClass("open").addClass("openToggle");

			// Remove any existing empty control spans - prevents them from being added repeatedly
			$("span.empty-control").remove();

			// Mark empty descriptions
			$("td.description:empty").prev().addClass("empty").removeClass("preLoad");

			// Add control to rows with descriptions
			$("td.preLoad")
				.wrap("<span class='answer-tab details-control openToggle'></span>")
				.removeClass("preLoad")
				.addClass('smallWindowPreLoad');

			// Add empty control span to rows with no descriptions
			$("td.empty")
				.wrap("<span class='empty-control'></span>")
				.removeClass("empty")
				.addClass('smallWindowEmpty');

			// Controls for each row
			$("span.answer-tab")
			.unbind()
			.click(function(){
				$(this)
					.toggleClass("open")
					.toggleClass("openToggle")
					.toggleClass("closeToggle")
					.parent()
					.find("td.description")
					.slideToggle(200)
					.parent()
					.find('a.courseToggle')
					.toggleClass("openToggle")
					.toggleClass("closeToggle");
				return false;
			});

			$('a#coursesMore')
				.unbind()
				.on('click', function () {
					coursesTable.page.len(999).draw();
					$('a#coursesMore').hide();
					$('a#coursesFewer').show().focus();
				});
			$('a#coursesFewer')
				.unbind()
				.on('click', function () {
					coursesTable.page.len( 6).draw();
					$('a#coursesFewer').hide();
					$('.coursesShowMore').show();
					$('a#coursesMore').show().focus();
				});

			var api = this.api();
			if (api.page.len() ==6) {
				$('a#coursesFewer').hide();
				$('a#coursesMore').show();
			} else {
				$('a#coursesFewer').show();
				$('a#coursesMore').hide();
			};

			if (api.page.info().recordsDisplay<7) {
				$('a#coursesFewer').hide();
				$('a#coursesMore').hide();
			};
		if (api.page.len() > api.page.info().recordsDisplay) {
			$('.coursesShowMore').hide();
		};

		// Make keypress produce click
		$('a.more, a.fewer, span.details-control').unbind('keypress').keypress(function (e) {
			var key = e.which;
			if (key == 13) { // the enter key code
				$(this).click();
				return false;
			}
		});

		smallWindow(); // If window is less than 700px make adjustments to the interface

		} //END drawCallBack
	}); //END var coursesTable

	var experientialTable = $('#experientialData').DataTable( {
		"dom": 'it', //remove default search input
		"language": {
			"info": "<h3>Experie&shy;ntial Learning Opportunities</h3><span class='tableInfo'><p class='dataInfo'>Showing _END_ of _TOTAL_ </p><a  id='experientialMore' class='more' tabindex='0'>All Experiential Opportunities</a><a  id='experientialFewer' class='fewer' tabindex='0'>Fewer Experiential Opportunities</a></span><span class='closedInfo'><p>_TOTAL_ results</p></span>",
			"infoFiltered": "",
			"infoEmpty" : "<h3>Experien&shy;tial Learning Opportunities</h3><span class='tableInfo'><p class='emptyInfo'>No matches</p></span>",
			"zeroRecords" : "",
			"loadingRecords": ""
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
				return '<a href="#" class="outerLink"><span class="innerLink experientialToggle openToggle">'+data+'</span></a>';}},
			{ "targets":4, "render": function ( data, type, full, meta ) {
				return data+'<span class="experientialLink"><br/><a class="descriptionLink">Learn More</a></span>';}},
			{ "targets":6, "render": function ( data, type, full, meta ) {
				return data.replace(/business|civil|litigation|constitutional|criminal|clinical|experiential|education|procedure|environmental|health|international|comparative|immigration|labor|employment|real estate|tax /gi," ");}}
		],
		"initComplete": function(settings) {
			var api = this.api();
			var more = $("<a>")
				.addClass("showMore experientialShowMore more")
				.text("Show more");
			$('#experientialData_wrapper').append(more);
			$('.experientialShowMore, .smallWexperiential').click(function(){
				var currentLength = api.page.len();
				experientialTable.page.len(currentLength+6).draw();
			});
			if ($('#courses').css("float") == "left"){
				$('.showMore').hide();
			};
			$('#experiential .waiting').fadeOut(200, function() {
				$('#experientialData_wrapper').fadeIn(600);
			});
			smallWindowInit();
		},
		"drawCallback": function(settings) {
			// Add URLs to any links and alt tags to any images in each row, using the URLs in column 2 of the table for the links and the faculty Name field for the alt tags
			var api = this.api();
			var data=api.rows({page:'current'}).data();

			for (i = 0; i < data.length; i++) {
				var child=i+1;
				if (!!data[i].URL) {
					$("#experientialData tr:nth-child("+child+") td.descriptionExp a.descriptionLink").attr('href',data[i].URL);
				} else {
					$("#experientialData tr:nth-child("+child+") td.descriptionExp span.experientialLink").remove();
				}
				if (!!data[i].Description) {}
				else {
					var inner = $("#experientialData tr:nth-child("+child+") span.innerLink").contents();
					$("#experientialData tr:nth-child("+child+") span.innerLink").parent("a").replaceWith(inner);
				}
			}

			// In case this is a redraw, first make sure all of the items show as closed
			$("span.open a.closeToggle").removeClass("closeToggle").addClass("openToggle");
			$("span.open").removeClass("closeToggle").removeClass("open").addClass("openToggle");

			// Hide descriptions and add span with control to show and hide description
			$("td.descriptionExp")
				.hide();

			// Remove any existing empty control spans - prevents them from being added repeatedly
			$("span.empty-controlExp").children().unwrap();

			// Mark empty descriptions
			$("td.descriptionExp:empty").prev().addClass("emptyExp").removeClass("preLoadExp");

			// Add control to rows with descriptions
			$("td.preLoadExp")
				.wrap("<span class='answer-tabExp details-controlExp openToggle'></span>")
				.removeClass("preLoadExp")
			.addClass("preLoadExpSmall");

			// Add empty control span to rows with no descriptions
			$("td.emptyExp")
				.wrap("<span class='empty-controlExp'></span>")
				.removeClass("emptyExp")
			.addClass("emptyExpSmall");

			// Controls for each row
			$(".answer-tabExp")
			.unbind()
			.click(function(){
				$(this)
					.toggleClass("open")
					.toggleClass("openToggle")
					.toggleClass("closeToggle")
					.parent()
					.find("td.descriptionExp")
					.slideToggle(200)
					.parent()
					.find('span.experientialToggle')
					.toggleClass("openToggle")
					.toggleClass("closeToggle");
				return false;
			});


			// Group items by type
			var api = this.api();
				var rows = api.rows( {page:'current'} ).nodes();
				var last=null;
				var groupData = api.column(1, {page:'current'} ).data()
				for (i = 0; i < groupData.length; i++) {
					if ( last !== groupData[i] ) {
						$(rows).eq( i ).before(
							'<tr class="group"><td><h4>'+groupData[i]+'</h4></td></tr>'
						);
						last = groupData[i];
					}
				};

			$('a#experientialMore')
				.unbind()
				.on( 'click', function () {
					experientialTable.page.len(999).draw();
					$('a#experientialMore').hide();
					$('a#experientialFewer').show().focus();
				});
			$('a#experientialFewer')
				.unbind()
				.on( 'click', function () {
					experientialTable.page.len( 6).draw();
					$('a#experientialFewer').hide();
					$('.experientialShowMore').show();
					$('a#experientialMore').show().focus();
				});

			if (api.page.len() ==6) {
				$('a#experientialFewer').hide();
				$('a#experientialMore').show();
			} else {
				$('a#experientialFewer').show();
				$('a#experientialMore').hide();
			}

			if (api.page.info().recordsDisplay<7) {
				$('a#experientialFewer').hide();
				$('a#experientialMore').hide();
			};
			if (api.page.len() > api.page.info().recordsDisplay) {
				$('.experientialShowMore').hide();
			};

			// Make keypress produce click
			$('a.more, a.fewer, span.details-control').unbind('keypress').keypress(function (e) {
				var key = e.which;
				if (key == 13) { // the enter key code
					$(this).click();
					return false;
				}
			});

			smallWindow();// If window is less than 700px make adjustments to the interface

		}// END drawCallBack
	});// END var experientialTable

	var publicationsTable = $('#publicationsData').DataTable( {

		"dom": 'it', //remove default search input
		"language": {
			"info": "<h3>Faculty Publica&shy;tions</h3><span class='tableInfo'><p class='dataInfo'>Showing _END_ of _TOTAL_ </p>  <a id='publicationsMore' class='more' tabindex='0'>All publications</a><a id='publicationsFewer' class='fewer' tabindex='0'>Fewer publications</a></span><span class='closedInfo'><p>_TOTAL_ results</p></span>",
			"infoFiltered": "",
			"infoEmpty" : "<h3>Faculty Publica&shy;tions</h3><span class='tableInfo'><p class='emptyInfo'>No matching publications</p></span>",
			"zeroRecords" : "",
			"loadingRecords": ""
		},

		// Load data for table content from an Ajax source
		"ajax": { // Pull data from Google Sheet via Sheets API V4
			url:`https://sheets.googleapis.com/v4/spreadsheets/1nKPgpNotU2NRH7fY-_bAjvFEc95M3MF_5uREiMyvoiw/values/pubs!A:N?key=REDACTED`,
			// Set caching to true
			cache: true,
			// Manipulate the Gsheet data
			"dataSrc": function(json) {
				var myData = json['values'];
				myData = myData.map(function( n ) {
					myObject = {
						year:n[11],
						title:n[4],
						standalonework:n[5],
						publisher:n[6],
						author:n[2],
						coauthors:n[3],
						url:n[12],
						priority:n[13],
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
			{ "data": "title"},
			{ "data": "standalonework"},
			{ "data": "publisher"},
			{ "data": "author"},
			{ "data": "coauthors"},
			{ "data": "url"},
			{ "data": "priority"},
			{ "data": "areas"}
		],
		"order": [[0,'desc'],[7,'asc'], [2, 'asc'], [1, 'asc']],
		"pageLength": 6,
		columnDefs: [
			{ "targets": 1, "orderable": false },
			{ "targets": [0,2,3,4,5,6,7,8], "visible": false},
			{ "targets":1, "render": function ( data, type, full, meta ) {return '<a>'+data+'</a>';}}
		],
		"initComplete": function(settings) {
			var api = this.api();
			var more = $("<a>")
				.addClass("showMore publicationsShowMore more")
				.text("Show more");
			$('#publicationsData_wrapper').append(more);
			$('.publicationsShowMore, .smallWpublications').click(function(){
				var currentLength = api.page.len();
				publicationsTable.page.len(currentLength+6).draw();
			});
			if ($('#courses').css("float") == "left"){
				$('.showMore').hide();
			};
			$('#publications .waiting').fadeOut(200, function() {
				$('#publicationsData_wrapper').fadeIn(600);
			});
			smallWindowInit();
		},
		"drawCallback": function(settings) {
			// Add URLs to any links and alt tags to any images in each row, using the URLs in column 2 of the table for the links and the faculty Name field for the alt tags
			var api = this.api();
			var data=api.rows({page:'current'}).data();
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
					$("#publicationsData tr:nth-child("+child+")").find('a').html(data[i].standalonework);
					$("#publicationsData tr:nth-child("+child+")").find('td').append('<p class="namePub">'+data[i].author+coauthor_info+ ', '+data[i].publisher+', '+data[i].year+'</p>');
				}
				else {
					$("#publicationsData tr:nth-child("+child+")").find('td').append('<p class="namePub">'+data[i].author+coauthor_info+ ', <i>'+data[i].standalonework+'</i>, '+data[i].year+'</p>');
				}

				// Remove links from works that don't have a URL
				if (data[i].url.length > 0) {
					$("#publicationsData tr:nth-child("+child+")").find('a').attr('href',data[i].url);
				} else {
					$("#publicationsData tr:nth-child("+child+")").find('a').addClass('no-url');
				}
			}

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
			$('.publicationsShowMore').show();
				$('#publicationsMore').show().focus();
			});
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
			if (api.page.len() > api.page.info().recordsDisplay) {
				$('.publicationsShowMore').hide();
			};

			// Make keypress produce click
			$('a.more, a.fewer, span.details-control').unbind('keypress').keypress(function (e) {
			var key = e.which;
			if (key == 13) { // the enter key code
				$(this).click();
				return false;
			}
		});

		smallWindow(); // If window is less than 700px make adjustments to the interface

		} //END drawCallBack
	}); //END publicationsTable


	var tables = $('.dataTable').DataTable(); // Let inputs control all tables

	if (myKey.length >0) {
		tables.search( myKey.replace(/\blaw\b/g, '').replace(/\bLaw\b/g, '') ).draw();
		$('#myInput').val(myKey);
		$('.dropdown-content').hide();
	};
	$("span.all").hide(); // Hide the X that appears in the search box

	// Search from the text search input
	$('#myInput').on( 'keyup', function () {
		var inputSearch = this.value.replace(/\blaw\b/g, '').replace(/\bLaw\b/g, '');
		if (inputSearch.length==0) {
			tables.search(inputSearch).draw();
			$("span.all").hide();
		} else if (inputSearch.length<3) {
			// Short searches with publications set to "All" are very slow 
			// If search text length < 3, change the pubs table to show 6 rows
			$('#publicationsData').DataTable().page.len(6).draw();
			tables.search(inputSearch).draw();
			$("span.all").show();
		} else {
			tables.search(inputSearch).draw();
			$("span.all").show();
		}
	});

	$('#myInput').focusout(function() {
		var inputSearchText = this.value;
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({
		event: 'Fusion Search',
		searchValue: inputSearchText
		});
	});

	// At widths of 700px or less, tables become tabs with faculty visible by default
	function smallWindowInit() {
		if ($('#courses').css("float") == "left"){
			$('.fusionTable .dataTable').hide();
			//display the faculty table on load
			var whichSection = 'faculty';
			var buttonClass ='.smallW'+whichSection;
			$('.activeFusionTable').removeClass('activeFusionTable');
			$('#faculty').addClass('activeFusionTable');

			var displayTable = $('#faculty').find('.dataTable')[0].outerHTML;
			$('#smallDataInner').empty().html(displayTable);
			$('#smallDataInner').parent().attr('id', whichSection);
			smallDraw();
			$('#smallDataInner .dataTable').show();
			$('.smallWindowShowMore').hide();
			$('.smallDataButtons').show();
			$(buttonClass).show();

		}
	};

	function smallDraw() { //Add interaction after drawing the smallWindow Table

		// Group by faculty type
		// Add control to rows with descriptions
		$("#smallDataOuter td.smallWindowPreLoad")
			.wrap("<span class='answer-tab details-control openToggle'></span>")
			.removeClass("smallWindowPreLoad");

		// Add empty control span to rows with no descriptions
		$("#smallDataOuter td.smallWindowEmpty")
			.wrap("<span class='empty-control'></span>")
			.removeClass("smallWindowEmpty");

		$("#smallDataOuter span.answer-tab")
			.unbind()
			.click(function(){
				$(this)
				.toggleClass("open")
				.toggleClass("openToggle")
				.toggleClass("closeToggle")
				.parent()
				.find("td.description")
				.slideToggle(200)
				.parent()
				.find('a.courseToggle')
				.toggleClass("openToggle")
				.toggleClass("closeToggle");
				return false;
			});

		// Add control to rows in experiential with descriptions
		$("#smallDataOuter td.preLoadExpSmall")
		.wrap("<span class='answer-tabExp details-controlExp openToggle'></span>")
		.removeClass("preLoadExpSmall");

		// Add empty control span to rows with no descriptions
		$("#smallDataOuter td.emptyExpSmall")
		.wrap("<span class='empty-controlExp'></span>")
		.removeClass("emptyExpSmall");

		$("#smallDataOuter .answer-tabExp")
		.unbind()
		.click(function(){
			$(this)
			.toggleClass("open")
			.toggleClass("openToggle")
			.toggleClass("closeToggle")
			.parent()
			.find("td.descriptionExp")
			.slideToggle(200)
			.parent()
			.find('span.experientialToggle')
			.toggleClass("openToggle")
			.toggleClass("closeToggle");
				return false;
		});
		$('#smallDataInner').children('span').remove();

	} // END smallDraw

	function smallWindow() { // This function is run in the drawCallback of each table
		if ($('#courses').css("float") == "left"){
			// Reload the page if it is resized wider than 700px
			// That's the break for mobile behavior, and the page doesn't work well when resized across that breakline
			$(window).resize(function() {
				if ($('#courses').css("float") !== "left"){
					window.location.href = window.location;
				};
			});

			$('.fusionTable .tableInfo .more, .fewer').hide();

			// If there is an active table, continue to show it
			if ($('.activeFusionTable').length) {
				var whichSection = $('.activeFusionTable').attr('id');
				var displayTable = $('.activeFusionTable').find('.dataTable')[0].outerHTML;
				var buttonClass ='.smallW'+whichSection;
				$('#smallDataInner').empty().html(displayTable);
				$('#smallDataInner').parent().attr('id', whichSection);
				smallDraw();
				$('#smallDataInner .dataTable').show();
				$('.smallWindowShowMore').hide();
				$('.smallDataButtons').show();
				$(buttonClass).show();
			}
			// Clicking in the table's div selects that table. Only one is displayed at a time. 
			// The active table is copied to a separate div to get the needed display
			$('.fusionTable')
				.unbind()
				.click(function() {
					var whichSection = $(this).attr('id');
					var buttonClass ='.smallW'+whichSection;
					$('.activeFusionTable').removeClass('activeFusionTable');
					$(this).addClass('activeFusionTable');


					var displayTable = $(this).find('.dataTable')[0].outerHTML;
					$('#smallDataInner').empty().html(displayTable);
					$('#smallDataInner').parent().attr('id', whichSection);
					smallDraw();
					$('#smallDataInner .dataTable').show();
					$('.smallWindowShowMore').hide();
					$('.smallDataButtons').show();
					$(buttonClass).show();

				});
			var expHeader = $('#experiential h3').text().replace('Learning Opportunities', 'Learning');
			$('#experiential h3').text(expHeader);
		} else {
    		$(window).resize(function() {
      			if ($('#courses').css("float") == "left"){
        			window.location.href = window.location;
      			}
    		});
		}
	} // END smallWindow

	searchMenu();

}; // END window.onload
