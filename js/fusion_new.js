async function fetchCSVData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch CSV");
    return Papa.parse(await response.text(), { header: true });
  } catch (error) {
    console.error(error);
    return { data: [] }; // Return empty data in case of error
  }
}

function initializeFacultyTable(facultyData) {
  var data = facultyData.data.map(Object.values);
  const custom_columns = [
    { title: "Hash", visible: false, searchable: false },
    { title: "Name", visible: false },
    { title: "Title", visible: false, searchable: false },
    { title: "Image", visible: false, searchable: false },
    { title: "Profile", visible: false, searchable: false },
    { title: "CV", visible: false, searchable: false },
    { title: "Areas", visible: false },
    { title: "Display", searchable: false },
  ];

  for (let i in data) {
    data[i].push(formatFaculty(data[i])); // Fill in CitationDisplay column
  }

  const table = new DataTable("#faculty-table", {
    dom: "fit",
    autoWidth: false,
    data: data,
    columns: custom_columns,
    pageLength: 6,
    language: {
      lengthMenu: "Showing _MENU_ faculty",
      info: `<span class="table-info"
              ><p class="data-info">Showing _END_ of _TOTAL_</p>
              <a href="#" id="facultyAll" tabindex="0">
                All faculty
                <i class="fa-solid fa-caret-down"></i>
              </a>
              <a href="#" id="facultyFewer" class="fewer" tabindex="0">
                Fewer faculty
                <i class="fa-solid fa-caret-up"></i>
              </a>
            </span>`,
      infoFiltered: "",
    },
    initComplete: function () {
      var api = this.api();
      var more = $("<a>")
        .addClass("showmore publications-showmore")
        .html(`Show more <i class="fa-solid fa-caret-down"></i>`);
      $("#faculty-table_wrapper").append(more);
      $(".publications-showmore").click(function () {
        var currentLength = api.page.len();
        facultyTable.page.len(currentLength + 6).draw();
      });
    },
    drawCallback: function () {
      $("#facultyAll").click(function () {
        facultyTable.page.len(-1).draw();
        $("#facultyAll").hide();
        $("#facultyFewer").show();
      });

      $("#facultyFewer").click(function () {
        facultyTable.page.len(6).draw();
        $("#facultyAll").show();
        $("#facultyFewer").hide();
      });
    },
  });

  return table;
}

function initializeCoursesTable(coursesData) {
  var data = coursesData.data.map(Object.values);
  const custom_columns = [
    { title: "Number", visible: false, searchable: false },
    { title: "Title", searchable: false },
    { title: "Areas", visible: false },
    { title: "Description", visible: false, searchable: false },
  ];

  const table = new DataTable("#courses-table", {
    dom: "fit",
    autoWidth: false,
    data: data,
    columns: custom_columns,
    pageLength: 6,
    language: {
      lengthMenu: "Showing _MENU_ faculty",
      info: "<span class='table-info'><p class='data-info'>Showing _END_ of _TOTAL_ </p><a href='#' id='courses-all' tabindex='0'>All courses <i class='fa-solid fa-caret-down'></i></a><a href='#' id='courses-fewer' class='fewer' tabindex='0'>Fewer courses <i class='fa-solid fa-caret-up'></i></a></span>",
      infoFiltered: "",
    },
    initComplete: function () {
      var api = this.api();
      var more = $("<a>")
        .addClass("showmore courses-showmore")
        .html(`Show more <i class="fa-solid fa-caret-down"></i>`);
      $("#courses-table_wrapper").append(more);
      $(".courses-showmore").click(function () {
        var currentLength = api.page.len();
        coursesTable.page.len(currentLength + 6).draw();
      });
    },
    drawCallback: function () {
      $("#courses-all").click(function () {
        coursesTable.page.len(-1).draw();
        $("#courses-all").hide();
        $("#courses-fewer").show();
      });

      $("#courses-fewer").click(function () {
        coursesTable.page.len(6).draw();
        $("#courses-all").show();
        $("#courses-fewer").hide();
      });
    },
  });

  return table;
}

function initializeExperientialTable(experientialData) {
  var data = experientialData.data.map(Object.values);
  const custom_columns = [
    { title: "Title", searchable: false },
    { title: "Category", visible: false, searchable: false },
    { title: "Areas", visible: false },
    { title: "Description", visible: false, searchable: false },
  ];

  const table = new DataTable("#experiential-table", {
    dom: "fit",
    autoWidth: false,
    data: data,
    columns: custom_columns,
    pageLength: 6,
    language: {
      lengthMenu: "Showing _MENU_ faculty",
      info: `<span class="table-info">
              <p class="data-info">Showing _END_ of _TOTAL_</p>
              <a href="#" id="experiential-all" tabindex="0">
                All opportunities
                <i class="fa-solid fa-caret-down"></i>
              </a>
              <a href="#" id="experiential-fewer" class="fewer" tabindex="0">
                Fewer opportunities
                <i class="fa-solid fa-caret-up"></i>
              </a>
            </span>`,
      infoFiltered: "",
    },
    initComplete: function () {
      var api = this.api();
      var more = $("<a>")
        .addClass("showmore experiential-showmore")
        .html(`Show more <i class="fa-solid fa-caret-down"></i>`);
      $("#experiential-table_wrapper").append(more);
      $(".experiential-showmore").click(function () {
        var currentLength = api.page.len();
        experientialTable.page.len(currentLength + 6).draw();
      });
    },
    drawCallback: function () {
      $("#experiential-all").click(function () {
        experientialTable.page.len(-1).draw();
        $("#experiential-all").hide();
        $("#experiential-fewer").show();
      });

      $("#experiential-fewer").click(function () {
        experientialTable.page.len(6).draw();
        $("#experiential-all").show();
        $("#experiential-fewer").hide();
      });
    },
  });

  return table;
}

function initializePubsTable(pubsData) {
  var data = pubsData.data.map(Object.values);
  const custom_columns = [
    { title: "Hash", visible: false, searchable: false },
    { title: "DocType", visible: false, searchable: false },
    { title: "Priority", visible: false, searchable: false },
    { title: "Author", visible: false, searchable: false },
    { title: "Coauthors", visible: false, searchable: false },
    { title: "Partwork", visible: false, searchable: false },
    { title: "Wholework", searchable: false },
    { title: "Publisher", visible: false, searchable: false },
    { title: "Volume", visible: false, searchable: false },
    { title: "Issue", visible: false, searchable: false },
    { title: "First Page", visible: false, searchable: false },
    { title: "Last Page", visible: false, searchable: false },
    { title: "Year", visible: false, searchable: false },
    { title: "Link", visible: false, searchable: false },
    { title: "Notes", visible: false, searchable: false },
    { title: "Areas", visible: false }, // Search only by areas
  ];

  const table = new DataTable("#pubs-table", {
    dom: "fit",
    autoWidth: false,
    data: data,
    columns: custom_columns,
    pageLength: 6,
    language: {
      lengthMenu: "Showing _MENU_ faculty",
      info: "<span class='table-info'><p class='data-info'>Showing _END_ of _TOTAL_ </p><a href='#' id='pubs-all' tabindex='0'>All publications <i class='fa-solid fa-caret-down'></i></a><a href='#' id='pubs-fewer' class='fewer' tabindex='0'>Fewer publications <i class='fa-solid fa-caret-up'></a></span>",
      infoFiltered: "",
    },
    initComplete: function () {
      var api = this.api();
      var more = $("<a>")
        .addClass("showmore pubs-showmore")
        .html(`Show more <i class="fa-solid fa-caret-down"></i>`);
      $("#pubs-table_wrapper").append(more);
      $(".pubs-showmore").click(function () {
        var currentLength = api.page.len();
        pubsTable.page.len(currentLength + 6).draw();
      });
    },
    drawCallback: function () {
      $("#pubs-all").click(function () {
        pubsTable.page.len(-1).draw();
        $("#pubs-all").hide();
        $("#pubs-fewer").show();
      });

      $("#pubs-fewer").click(function () {
        pubsTable.page.len(6).draw();
        $("#pubs-all").show();
        $("#pubs-fewer").hide();
      });
    },
  });

  return table;
}

function formatFaculty(rowData) {
  let [hash, name, title, image, profile, cv, areas] = rowData;

  return `<div class="faculty-box"><a href="${profile}"><img src="${image}" /></a><a class="faculty-name" href="${profile}">${name}</a></div>`;
}

function formatCourse(rowData) {}
function formatExperiential(rowData) {}
function formatPublication(rowData) {}

$(document).ready(function () {
  const facultyUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgfjiHQuIxuj6_p2vuAskviCh7XPl3J19aZO7Fiyl_cIR__LcTl1WfWCLBqQGmVPXklqOFfE2wwDqs/pub?gid=1091124444&single=true&output=csv";
  const coursesUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgfjiHQuIxuj6_p2vuAskviCh7XPl3J19aZO7Fiyl_cIR__LcTl1WfWCLBqQGmVPXklqOFfE2wwDqs/pub?gid=1519308253&single=true&output=csv";
  const experientialUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgfjiHQuIxuj6_p2vuAskviCh7XPl3J19aZO7Fiyl_cIR__LcTl1WfWCLBqQGmVPXklqOFfE2wwDqs/pub?gid=1658067309&single=true&output=csv";
  const pubsUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgfjiHQuIxuj6_p2vuAskviCh7XPl3J19aZO7Fiyl_cIR__LcTl1WfWCLBqQGmVPXklqOFfE2wwDqs/pub?gid=132604372&single=true&output=csv";

  async function main() {
    const facultyData = await fetchCSVData(facultyUrl);
    const experientialData = await fetchCSVData(experientialUrl);
    const coursesData = await fetchCSVData(coursesUrl);
    const pubsData = await fetchCSVData(pubsUrl);

    facultyTable = initializeFacultyTable(facultyData);
    coursesTable = initializeCoursesTable(coursesData);
    experientialTable = initializeExperientialTable(experientialData);
    pubsTable = initializePubsTable(pubsData);

    $(".fusion__loading").hide();

    const dropdownElements = document.querySelectorAll(
      ".controls__dropdown-item"
    );

    dropdownElements.forEach((element) => {
      element.addEventListener("click", function () {
        var searchTerm = this.innerHTML.trim().replace(/&amp;/g, "&");
        if (searchTerm === "<b>All Areas</b>") {
          searchTerm = "";
        }
        $(".dt-input").val(searchTerm).trigger("input");
        facultyTable.page.len(6).draw();
      });
    });
  }

  main();
});
