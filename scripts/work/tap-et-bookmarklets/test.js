javascript: (function () {
  var tables = [
    {
      querySelector: ".search_results_table",
      cellsToCheck: [9, 11, 13, 15],
      dateRunCell: 7,
      dateQueuedCell: 6,
      progressBarStyles:
        "position:relative; height: 20px; width: 100%; border: 1px solid #ddd; border-radius: 3px;",
      progressBarFillStyles:
        "position: absolute; height: 100%; border-radius: 3px; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 12px; color: #333;",
    },
    {
      querySelector: ".test_table--search-results",
      cellsToCheck: [6, 7, 8, 9],
      dateRunCell: 11,
      dateQueuedCell: 10,
      progressBarStyles:
        "position:relative; height: 20px; width: 100%; border: 1px solid #ddd; border-radius: 3px;",
      progressBarFillStyles:
        "position: absolute; height: 100%; border-radius: 3px; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 12px; color: #333; white-space:nowrap;",
    },
  ];
  
  tables.forEach(function (tableInfo) {
    var table = document.querySelector(tableInfo.querySelector);
    if (table !== null) {
      for (var i = 0; i < table.rows.length; i++) {
        var row = table.rows[i];
        tableInfo.cellsToCheck.forEach(function (cellIndex) {
          var cell = row.cells[cellIndex];
          if (
            cell !== undefined &&
            cell.tagName.toLowerCase() === "td" &&
            cell.innerText !== undefined
          ) {
            var cellText = cell.innerText.trim();
            var numbersRegex = /-?\d+(?:,\d+)*(?:\.\d+)?/g;
            var numbersMatches = cellText.match(numbersRegex);
            if (numbersMatches !== null && numbersMatches.length >= 2) {
              var numerator = parseFloat(numbersMatches[0].replace(/,/g, ""));
              var denominator =
                parseFloat(numbersMatches[1].replace(/,/g, "")) || 100;
              var percentageComplete = Math.ceil(
                (numerator / denominator) * 100
              );
              if (percentageComplete >= 0) {
                var progressBar = document.createElement("div");
                progressBar.setAttribute("style", tableInfo.progressBarStyles);
                var progressBarFill = document.createElement("div");
                var progressBarFillColor =
                  getProgressBarFillColor(percentageComplete);
                progressBarFill.setAttribute(
                  "style",
                  tableInfo.progressBarFillStyles +
                    " width: " +
                    percentageComplete +
                    "%; background-color: " +
                    progressBarFillColor +
                    ";"
                );
                progressBarFill.innerText =
                  percentageComplete.toLocaleString() + "%";
                progressBar.appendChild(progressBarFill);
                var failedMessagesSpan = cell.querySelector(
                  'span[title="# Failed Messages"]'
                );
                cell.innerHTML = "";
                if (failedMessagesSpan) {
                  cell.appendChild(failedMessagesSpan);
                  cell.appendChild(document.createElement("br"));
                }
                var numeratorText = numerator.toLocaleString();
                var denominatorText = denominator.toLocaleString();
                cell.innerHTML +=
                  numeratorText +
                  " / " +
                  denominatorText +
                  progressBar.outerHTML;
              }
            }
          }
        });
      }
    }
    processDateRunColumn(tableInfo);
    processDateQueuedColumn(tableInfo); // Add this line to process date queued column
  });

  function processDateRunColumn(tableInfo) {
    var table = document.querySelector(tableInfo.querySelector);
    if (table !== null) {
      var dateRunColumnIndex = tableInfo.dateRunCell;
      for (var i = 2; i < table.rows.length; i++) {
        var row = table.rows[i];
        var cell = row.cells[dateRunColumnIndex];
        if (
          cell !== undefined &&
          cell.tagName.toLowerCase() === "td" &&
          cell.innerText !== undefined
        ) {
          var cellText = cell.innerText.trim();
          var dateRun = new Date(cellText);
          if (!isNaN(dateRun.getTime())) {
            var now = new Date();
            var differenceInHours = (now - dateRun) / 3600000;
            var appendedText = document.createElement("div");
            var hoursAgo = differenceInHours.toFixed(1);
            var timeText, bgColor, textColor;
            if (differenceInHours > 24) {
              var daysAgo = (differenceInHours / 24).toFixed(1);
              timeText = daysAgo + " days ago";
            } else if (differenceInHours < 1) {
              var minutesAgo = (differenceInHours * 60).toFixed(0);
              timeText = minutesAgo + " minutes ago";
            } else {
              timeText = hoursAgo + " hours ago";
            }
            bgColor = getHoursAgoColor(
              hoursAgo > 6 ? 100 : (hoursAgo / 6) * 100
            );
            textColor = isDarkColor(bgColor) ? "white" : "black";
            appendedText.innerText = timeText;
            appendedText.setAttribute(
              "style",
              "font-weight: bold; background-color: " +
                bgColor +
                "; border: 1px solid #e67e22; padding: 2px 5px; border-radius: 3px; margin-left: 5px; color: " +
                textColor +
                ";"
            );
            cell.appendChild(appendedText);
          }
        }
      }
    }
  }

  function processDateQueuedColumn(tableInfo) {
    var table = document.querySelector(tableInfo.querySelector);
    if (table !== null) {
      var dateQueuedColumnIndex = tableInfo.dateQueuedCell;
      for (var i = 2; i < table.rows.length; i++) {
        var row = table.rows[i];
        var cell = row.cells[dateQueuedColumnIndex];
        if (
          cell !== undefined &&
          cell.tagName.toLowerCase() === "td" &&
          cell.innerText !== undefined
        ) {
          var cellText = cell.innerText.trim();
          var dateQueued = new Date(cellText);
          if (!isNaN(dateQueued.getTime())) {
            var now = new Date();
            var differenceInHours = (now - dateQueued) / 3600000;
            var appendedText = document.createElement("div");
            var hoursAgo = differenceInHours.toFixed(1);
            var timeText, bgColor, textColor;
            if (differenceInHours > 24) {
              var daysAgo = (differenceInHours / 24).toFixed(1);
              timeText = daysAgo + " days ago";
            } else if (differenceInHours < 1) {
              var minutesAgo = (differenceInHours * 60).toFixed(0);
              timeText = minutesAgo + " minutes ago";
            } else {
              timeText = hoursAgo + " hours ago";
            }
            bgColor = getHoursAgoColor(
              hoursAgo > 6 ? 100 : (hoursAgo / 6) * 100
            );
            textColor = isDarkColor(bgColor) ? "white" : "black";
            appendedText.innerText = timeText;
            appendedText.setAttribute(
              "style",
              "font-weight: bold; background-color: " +
                bgColor +
                "; border: 1px solid #e67e22; padding: 2px 5px; border-radius: 3px; margin-left: 5px; color: " +
                textColor +
                ";"
            );
            cell.appendChild(appendedText);
          }
        }
      }
    }
  }

  function isDarkColor(color) {
    var r = parseInt(color.slice(4, -1).split(",")[0]);
    var g = parseInt(color.slice(4, -1).split(",")[1]);
    var b = parseInt(color.slice(4, -1).split(",")[2]);
    var brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }

  function getProgressBarFillColor(percentageComplete) {
    var colorRange = [
      { r: 214, g: 48, b: 49 },
      { r: 225, g: 112, b: 85 },
      { r: 253, g: 203, b: 110 },
      { r: 116, g: 185, b: 255 },
      { r: 85, g: 239, b: 196 },
    ];
    return getColorFromRange(percentageComplete, colorRange);
  }

  function getHoursAgoColor(hoursAgo) {
    var colorRange = [
      { r: 85, g: 239, b: 196 },
      { r: 116, g: 185, b: 255 },
      { r: 253, g: 203, b: 110 },
      { r: 225, g: 112, b: 85 },
      { r: 214, g: 48, b: 49 },
    ];
    return getColorFromRange(hoursAgo, colorRange);
  }

  function getColorFromRange(percentageComplete, colorRange) {
    var index = Math.min(
      Math.floor(percentageComplete / 20),
      colorRange.length - 1
    );
    var startColor = colorRange[index],
      endColor = colorRange[Math.min(index + 1, colorRange.length - 1)],
      ratio = (percentageComplete % 20) / 20,
      red = Math.floor(startColor.r + (endColor.r - startColor.r) * ratio),
      green = Math.floor(startColor.g + (endColor.g - startColor.g) * ratio),
      blue = Math.floor(startColor.b + (endColor.b - startColor.b) * ratio);
    return "rgb(" + red + ", " + green + ", " + blue + ")";
  }

  const style = document.createElement("style");
  style.innerHTML =
    "table.test_table--search-results {" +
    "  table-layout: fixed !important;" +
    "}" +
    "table.test_table--search-results button {" +
    "  width: 100%;" +
    "  margin-top: 3px;" +
    "}" +
    "table.test_table--search-results td:first-of-type > button {" +
    "  width: auto;" +
    "}" +
    "table.test_table--search-results td:nth-of-type(2), table.test_table--search-results td:nth-of-type(3) {" +
    "  white-space: nowrap;" +
    "}" +
    "table.test_table--search-results td:nth-of-type(4) {" +
    "  width: 5%;" +
    "  overflow: hidden;" +
    "  text-overflow: ellipsis;" +
    "}" +
    "table.text_table--search-results tbody {" +
    "  position: sticky;" +
    "  top: 0;" +
    "  z-index: 1" +
    "}" +
    "table.table.table-primary.table--small-text.test_table--search-results th {" +
    "  position: sticky;" +
    "  background-color: #0079c0 !important;" +
    "  z-index: 1;" +
    "  top: 0;" +
    "}" +
    "table > tbody > tr:nth-of-type(2) > th {" +
    "  top: 48px !important;" +
    "}" +
    "table.table.table-primary.table--small-text.test_table--search-results td {" +
    "  position: relative;" +
    "  z-index: 0 !important;" +
    "}";
  document.head.appendChild(style);

  function getRandomDarkColor() {
    const randomValue = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;
    const r = randomValue(0, 128);
    const g = randomValue(0, 128);
    const b = randomValue(0, 128);
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }

  function updateRunningOnText() {
    var regex = /PIT-EXPORT-\w{2,3}/g;
    var exportColors = {};
    tables.forEach(function (tableInfo) {
      var table = document.querySelector(tableInfo.querySelector);
      if (table !== null) {
        for (var i = 0; i < table.rows.length; i++) {
          var row = table.rows[i];
          var cell = row.cells[2];
          if (cell !== undefined && cell.tagName.toLowerCase() === "td") {
            var cellText = cell.innerText;
            if (regex.test(cellText)) {
              var matchedText = cellText.match(regex)[0];
              if (!exportColors.hasOwnProperty(matchedText)) {
                exportColors[matchedText] = getRandomDarkColor();
              }
              var spanElement = document.createElement("span");
              spanElement.innerText = matchedText;
              spanElement.style.display = "inline-block";
              spanElement.style.color = "white";
              spanElement.style.fontWeight = "500";
              spanElement.style.background = exportColors[matchedText];
              spanElement.style.padding = "0 3px";
              spanElement.style.fontSize = ".9em";
              spanElement.style.borderRadius = "5px";
              cell.innerHTML = cell.innerHTML.replace(
                matchedText,
                spanElement.outerHTML
              );
            }
          }
        }
      }
    });
  }

  function sortTableRows() {
    tables.forEach(function (tableInfo) {
      var table = document.querySelector(tableInfo.querySelector);
      if (table !== null) {
        var lastHeaderRowIndex = 0;
        for (var i = 0; i < table.rows.length; i++) {
          var row = table.rows[i];
          var isHeaderRow = Array.from(row.cells).some(function (cell) {
            return cell.tagName.toLowerCase() === "th";
          });
          if (isHeaderRow) {
            lastHeaderRowIndex = i;
          } else {
            break;
          }
        }
        var sortedRows = Array.from(table.rows)
          .slice(lastHeaderRowIndex + 1)
          .sort(function (a, b) {
            var aValueMatch = a.cells[2].innerText.match(/PIT-EXPORT-\w{2,3}/g);
            var bValueMatch = b.cells[2].innerText.match(/PIT-EXPORT-\w{2,3}/g);
            if (aValueMatch === null || bValueMatch === null) {
              return a.rowIndex - b.rowIndex;
            } else {
              var aValue = aValueMatch[0];
              var bValue = bValueMatch[0];
              if (aValue === bValue) {
                return a.rowIndex - b.rowIndex;
              } else {
                return aValue.localeCompare(bValue);
              }
            }
          });
        sortedRows.forEach(function (row) {
          table.appendChild(row);
        });
      }
    });
  }

  function highlightDuplicateCells() {
    var table = document.querySelector(".test_table--search-results");
    if (table !== null) {
      var cellTexts = new Map();
      var cellsToHighlight = new Set();
      for (var i = 1; i < table.rows.length; i++) {
        var cell = table.rows[i].cells[3];
        if (
          cell !== undefined &&
          cell.tagName.toLowerCase() === "td" &&
          cell.innerText !== undefined
        ) {
          var cellText = cell.innerText.trim();
          if (cellTexts.has(cellText)) {
            cellTexts.get(cellText).forEach(function (duplicateCell) {
              cellsToHighlight.add(duplicateCell);
            });
            cellTexts.get(cellText).push(cell);
            cellsToHighlight.add(cell);
          } else {
            cellTexts.set(cellText, [cell]);
          }
        }
      }
      cellsToHighlight.forEach(function (cell) {
        cell.innerHTML +=
          '<span style="background-color: #e84393;color: white;border-radius: 3px;font-size: 10px;margin: 2px;text-transform: uppercase;white-space: nowrap;position: absolute;bottom: 0;left: 0;padding: 0 6px;font-weight: 500;letter-spacing: 2px;">duplicate 😠</span>';
      });
    }
  }

  highlightDuplicateCells();
  updateRunningOnText();
  sortTableRows();
})();
