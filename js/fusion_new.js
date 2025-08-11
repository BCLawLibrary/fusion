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

function getFacultyPriority(rowData) {
  let [hash, name, title, image, profile, cv, areas, status] = rowData;
  if (status === "full") {
    return 0;
  }
  if (status === "emeritus") {
    return 1;
  }
  if (status === "visiting") {
    return 2;
  }
  if (status === "adjunct") {
    return 3;
  } else {
    return 4;
  }
}
function initializeFacultyTable(facultyData) {
  var data = facultyData.data.map(Object.values);
  const custom_columns = [
    { title: "Hash", visible: false, searchable: false },
    { title: "Name", visible: false, searchable: false },
    { title: "Title", visible: false, searchable: false },
    { title: "Image", visible: false, searchable: false },
    { title: "Profile", visible: false, searchable: false },
    { title: "CV", visible: false, searchable: false },
    { title: "Areas", visible: false },
    { title: "Status", visible: false, searchable: false },
    { title: "Order", visible: false, searchable: false },
    { title: "Display", searchable: false },
  ];

  for (let i in data) {
    data[i].push(getFacultyPriority(data[i]));
    data[i].push(formatFaculty(data[i])); // Fill in CitationDisplay column
  }

  const table = new DataTable("#faculty-table", {
    dom: "fit",
    autoWidth: false,
    data: data,
    columns: custom_columns,
    pageLength: 6,
    order: [
      [8, "asc"],
      [0, "asc"],
    ],
    language: {
      lengthMenu: "Showing _MENU_ faculty",
      info: `<span class="table-info"
              ><p class="data-info">Showing _END_ of _TOTAL_</p>
              <a id="facultyAll" class="show-all" tabindex="0">
                All faculty
                <i class="fa-solid fa-caret-down"></i>
              </a>
              <a id="facultyFewer" class="fewer" tabindex="0">
                Fewer faculty
                <i class="fa-solid fa-caret-up"></i>
              </a>
            </span>`,
      infoFiltered: "",
    },
    initComplete: function () {
      var api = this.api();
      var bottomControls = $("<div>").addClass("bottom-controls").html(`
        <a class="showmore faculty-showmore">Show more <i class="fa-solid fa-caret-down"></i></a>
        <a class="showmore faculty-showless" style="">Show fewer <i class="fa-solid fa-caret-up"></i></a>
      `);
      $("#faculty-table_wrapper").append(bottomControls);

      $(".faculty-showless").click(function () {
        var currentLength = api.page.len();
        api.page.len(currentLength - 6).draw();
      });

      $(".faculty-showmore").click(function () {
        var currentLength = api.page.len();
        api.page.len(currentLength + 6).draw();
      });

      $(".faculty-showless").hide();
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

      var api = this.api();
      var tableLength = api.rows({ filter: "applied" }).count();
      if (api.page.len() >= tableLength) {
        $(".faculty-showmore").hide();
      } else {
        $(".faculty-showmore").show();
      }

      if (api.page.len() <= 6 || tableLength <= 6) {
        $(".faculty-showless").hide();
      } else {
        $(".faculty-showless").show();
      }
    },
  });

  return table;
}

function initializeCoursesTable(coursesData) {
  var data = coursesData.data.map(Object.values);
  const custom_columns = [
    { title: "Number", visible: false, searchable: false },
    { title: "Title", visible: false, searchable: false },
    { title: "Areas", visible: false },
    { title: "Description", visible: false, searchable: false },
    { title: "CourseDisplay", searchable: false },
  ];

  for (let i in data) {
    data[i].push(formatCourse(data[i]));
  }

  const table = new DataTable("#courses-table", {
    dom: "fit",
    autoWidth: false,
    data: data,
    columns: custom_columns,
    pageLength: 6,
    language: {
      lengthMenu: "Showing _MENU_ faculty",
      info: `<span class='table-info'><p class='data-info'>Showing _END_ of _TOTAL_ </p><a id='courses-all' class='show-all' tabindex='0'>All courses <i class='fa-solid fa-caret-down'></i></a><a id='courses-fewer' class='fewer' tabindex='0'>Fewer courses <i class='fa-solid fa-caret-up'></i></a></span>`,
      infoFiltered: "",
    },

    initComplete: function () {
      var api = this.api();
      var bottomControls = $("<div>").addClass("bottom-controls").html(`
        <a class="showmore courses-showmore">Show more <i class="fa-solid fa-caret-down"></i></a>
        <a class="showmore courses-showless" style="">Show fewer <i class="fa-solid fa-caret-up"></i></a>
      `);

      $("#courses-table_wrapper").append(bottomControls);

      $(".courses-showmore").click(function () {
        var currentLength = api.page.len();
        api.page.len(currentLength + 6).draw();
      });

      $(".courses-showless").click(function () {
        var currentLength = api.page.len();
        api.page.len(currentLength - 6).draw();
      });

      $(".courses-showless").hide();
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

      var api = this.api();
      var tableLength = api.rows({ filter: "applied" }).count();
      if (api.page.len() >= tableLength) {
        $(".courses-showmore").hide();
      } else {
        $(".courses-showmore").show();
      }

      if (api.page.len() <= 6 || tableLength <= 6) {
        $(".courses-showless").hide();
      } else {
        $(".courses-showless").show();
      }
    },
  });
  initCourseToggle();
  return table;
}

function initializeExperientialTable(experientialData) {
  var data = experientialData.data.map(Object.values);
  const custom_columns = [
    { title: "Title", visible: false, searchable: false },
    { title: "Category", visible: false, searchable: false },
    { title: "Areas", visible: false },
    { title: "CategorySortOrder", visible: false, searchable: false },
    { title: "URL", visible: false, searchable: false },
    { title: "Description", visible: false, searchable: false },
    { title: "ExperientialDisplay", searchable: false },
  ];

  for (let i in data) {
    data[i].push(formatExperiential(data[i]));
  }

  const table = new DataTable("#experiential-table", {
    dom: "fit",
    autoWidth: false,
    data: data,
    columns: custom_columns,
    pageLength: 6,
    rowGroup: {
      dataSrc: 1,
    },
    orderFixed: [3, "asc"],
    order: [
      [1, "asc"],
      [0, "asc"],
    ],
    language: {
      lengthMenu: "Showing _MENU_ faculty",
      info: `<span class="table-info">
              <p class="data-info">Showing _END_ of _TOTAL_</p>
              <a id="experiential-all" class="show-all" tabindex="0">
                All opportunities
                <i class="fa-solid fa-caret-down"></i>
              </a>
              <a id="experiential-fewer" class="fewer" tabindex="0">
                Fewer opportunities
                <i class="fa-solid fa-caret-up"></i>
              </a>
            </span>`,
      infoFiltered: "",
    },
    initComplete: function () {
      var api = this.api();
      var bottomControls = $("<div>").addClass("bottom-controls").html(`
        <a class="showmore experiential-showmore">Show more <i class="fa-solid fa-caret-down"></i></a>
        <a class="showmore experiential-showless" style="">Show fewer <i class="fa-solid fa-caret-up"></i></a>
      `);

      $("#experiential-table_wrapper").append(bottomControls);
      $(".experiential-showmore").click(function () {
        var currentLength = api.page.len();
        api.page.len(currentLength + 6).draw();
      });
      $(".experiential-showless").click(function () {
        var currentLength = api.page.len();
        api.page.len(currentLength - 6).draw();
      });

      $(".experiential-showless").hide();
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

      var api = this.api();
      var tableLength = api.rows({ filter: "applied" }).count();
      if (api.page.len() >= tableLength) {
        $(".experiential-showmore").hide();
      } else {
        $(".experiential-showmore").show();
      }

      if (api.page.len() <= 6 || tableLength <= 6) {
        $(".experiential-showless").hide();
      } else {
        $(".experiential-showless").show();
      }
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
    { title: "Wholework", visible: false, searchable: false },
    { title: "Publisher", visible: false, searchable: false },
    { title: "Volume", visible: false, searchable: false },
    { title: "Issue", visible: false, searchable: false },
    { title: "First Page", visible: false, searchable: false },
    { title: "Last Page", visible: false, searchable: false },
    { title: "Year", visible: false, searchable: false },
    { title: "Link", visible: false, searchable: false },
    { title: "Notes", visible: false, searchable: false },
    { title: "Areas", visible: false }, // Search only by areas
    { title: "PubDisplay", searchable: false },
  ];

  for (let i in data) {
    data[i].push(formatPublication(data[i]));
  }

  const table = new DataTable("#pubs-table", {
    dom: "fit",
    autoWidth: false,
    data: data,
    columns: custom_columns,
    pageLength: 6,
    order: [
      [12, "desc"],
      [2, "asc"],
      [16, "asc"],
    ],
    language: {
      lengthMenu: "Showing _MENU_ faculty",
      info: `<span class='table-info'>
              <p class='data-info'>
                Showing _END_ of _TOTAL_ 
              </p>
              <a id='publications-all' class="show-all" tabindex='0'>
                All publications
                <i class='fa-solid fa-caret-down'></i>
              </a>
              <a id='publications-fewer' class='fewer' tabindex='0'>
                Fewer publications 
                <i class='fa-solid fa-caret-up'></i>
              </a>
            </span>`,
      infoFiltered: "",
    },
    initComplete: function () {
      var api = this.api();
      var bottomControls = $("<div>").addClass("bottom-controls").html(`
        <a class="showmore publications-showmore">Show more <i class="fa-solid fa-caret-down"></i></a>
        <a class="showmore publications-showless" style="">Show fewer <i class="fa-solid fa-caret-up"></i></a>
      `);

      $("#pubs-table_wrapper").append(bottomControls);
      $(".publications-showmore").click(function () {
        var currentLength = api.page.len();
        api.page.len(currentLength + 6).draw();
      });
      $(".publications-showless").click(function () {
        var currentLength = api.page.len();
        api.page.len(currentLength - 6).draw();
      });

      $(".publications-showless").hide();
    },
    drawCallback: function () {
      $("#publications-all").click(function () {
        api.page.len(-1).draw();
        $("#publications-all").hide();
        $("#publications-fewer").show();
      });

      $("#publications-fewer").click(function () {
        api.page.len(6).draw();
        $("#publications-all").show();
        $("#publications-fewer").hide();
      });

      var api = this.api();
      var tableLength = api.rows({ filter: "applied" }).count();
      if (api.page.len() >= tableLength) {
        $(".publications-showmore").hide();
      } else {
        $(".publications-showmore").show();
      }

      if (api.page.len() <= 6 || tableLength <= 6) {
        $(".publications-showless").hide();
      } else {
        $(".publications-showless").show();
      }
    },
  });

  initExperientialToggle();

  return table;
}

function formatFaculty(rowData) {
  let [hash, name, title, image, profile, cv, areas, status] = rowData;

  if (status === "full") {
    facultyNameClass = "faculty-full";
    facultyTitleClass = "title-full";
  } else if (status === "emeritus") {
    facultyNameClass = "faculty-emeritus";
    facultyTitleClass = "title-emeritus";
  } else if (status === "adjunct") {
    facultyNameClass = "faculty-adjunct";
    facultyTitleClass = "title-adjunct";
  } else if (status === "visiting") {
    facultyNameClass = "faculty-visiting";
    facultyTitleClass = "title-visiting";
  }

  if (image === "") {
    image = "https://bc.edu/content/dam/bc1/schools/law/js/fusion/unknown.jpg";
  }
  return `<div class="faculty-box">
            <a class="faculty-image ${status}" target="_blank" rel="noopener noreferrer" href="${profile}">
              <img src="${image}" />
              <div class="faculty-title ${facultyTitleClass}">${status} faculty</div>
            </a>
            <a target="_blank" rel="noopener noreferrer" class="faculty-name ${facultyNameClass}" href="${profile}">
              ${name}
            </a>
          </div>`;
}

function formatCourse(rowData) {
  let [number, title, areas, description] = rowData;

  return `<div class="course-display">
            <div class="course-title"><span class="course-dropdown">+ </span>${title}</div>
            <div class="course-description invisible">
              [${number}] ${description}
            </div>
          </div>`;
}

function initCourseToggle() {
  const table = document.querySelector("#courses-table");

  table.addEventListener("click", function (e) {
    const title = e.target.closest(".course-title");
    if (!title) return;

    const dropdown = title.querySelector(".course-dropdown");
    const description = title.nextElementSibling;

    if (description && dropdown) {
      description.classList.toggle("invisible");
      dropdown.textContent = description.classList.contains("invisible")
        ? "+ "
        : "− ";
      dropdown.classList.toggle("red");
    }
  });
}

function formatExperiential(rowData) {
  let [title, category, area, categorySortOrder, url, description] = rowData;
  return `<div class="experiential-display">
            <div class="experiential-title"><span class="experiential-dropdown">+ </span>${title}</div>
            <div class="experiential-description invisible">
              ${description}
            </div>
          </div>`;
}

function initExperientialToggle() {
  const table = document.querySelector("#experiential-table");

  table.addEventListener("click", function (e) {
    const title = e.target.closest(".experiential-title");
    if (!title) return;

    const dropdown = title.querySelector(".experiential-dropdown");
    const description = title.nextElementSibling;

    if (description && dropdown) {
      description.classList.toggle("invisible");
      dropdown.textContent = description.classList.contains("invisible")
        ? "+ "
        : "− ";
      dropdown.classList.toggle("red");
    }
  });
}

function formatPublication(rowData) {
  // Destructure rowData for clarity
  let [
    hash,
    doctype,
    priority,
    author,
    coauthors,
    partwork,
    wholework,
    publisher,
    vol,
    iss,
    fpage,
    lpage,
    year,
    url,
    notes,
  ] = rowData;

  priority = Number(priority);
  const isStandAlone = priority === 7 || doctype === "book";

  // Helper functions for common patterns
  const formatTitle = () => {
    // Determine the base title
    let title = isStandAlone ? wholework : partwork;

    // Append volume info to title for standalone works
    if (isStandAlone) {
      if (vol) title += `, Vol. ${vol}`;
    }
    // Make title into link if URL is present
    if (url) {
      title = `<div class="work-title"><a target="_blank" rel="noopener noreferrer" href="${url}">${title}</a> <span class="fa-solid fa-square-arrow-up-right"></span></div>`;
    } else {
      title = `<div class="work-title">${title}</div>`;
    }
    return title;
  };

  const formatAuthors = (author, coauthors) => {
    if (!coauthors) return `${author}, `;
    const coauthorList = coauthors.split(";").map((s) => s.trim());
    if (coauthorList.length === 1) {
      return `${author} and ${coauthorList[0]}, `;
    } else {
      const lastCoauthor = coauthorList.pop();
      return `${author}, ${coauthorList.join(", ")} and ${lastCoauthor}, `;
    }
  };

  const formatVolumeIssue = (vol, iss) => {
    // Suppress for standalone works (already added to Title)
    if (isStandAlone) return "";
    if (vol && iss) return `, vol. ${vol}, no. ${iss}`;
    if (vol) return `, vol. ${vol}`;
    if (iss) return `, no. ${iss}`;
    return "";
  };

  const formatPageInfo = (fpage, lpage) => {
    if (fpage && lpage) return `: ${fpage}–${lpage}`;
    if (fpage) return `: ${fpage}`;
    return "";
  };

  const formatPublisher = (publisher, doctype) => {
    if (!publisher) return "";
    return doctype === "bookchapter" ? `. ${publisher}` : ` ${publisher}`;
  };

  const formatYear = (year) => {
    return year ? ` (${year.replace("*", "")})` : "";
  };

  const formatNotes = (notes) => {
    if (notes !== undefined && notes.trimEnd() !== "") {
      return `. ${notes}.`;
    }
    return "";
  };

  // Build citation components
  const coauthorInfo = formatAuthors(author, coauthors);
  // Leave field empty ("") if standalone work
  let wholeworkInfo = isStandAlone ? "" : `<i>${wholework}</i>`;
  if (doctype === "bookchapter") wholeworkInfo = `in ${wholeworkInfo}`;
  const numberInfo = formatVolumeIssue(vol, iss);
  const pageInfo = formatPageInfo(fpage, lpage);
  const publisherInfo = formatPublisher(publisher, doctype);
  const yearInfo = formatYear(year);
  const notesInfo = formatNotes(notes);

  // Title information
  const titleInfo = formatTitle();

  // Combine all components into the citation
  let citation = `${coauthorInfo}${wholeworkInfo}${numberInfo}${pageInfo}${publisherInfo}${yearInfo}${notesInfo}`;

  // Ensure citation ends with a period
  if (!citation.endsWith(".")) citation += ".";

  // Wrap in title info
  return `${titleInfo}<div class="work-info">${citation}</div>`;
}

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

    $(".controls__search").on("keyup", function () {
      $(".dataTable").DataTable().search(this.value).draw();
    });

    areasList = Array.from(dropdownElements, (el) => el.innerText);
    currentHash = window.location.hash.replace("#", "").replaceAll("%20", " ");
    if (areasList.includes(currentHash)) {
      $(".dt-input").val(currentHash).trigger("input");
    }
  }

  main();
});
