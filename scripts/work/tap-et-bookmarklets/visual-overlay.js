(function () {
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
      dateQueuedCell: 11,
      dateRunCell: 12,
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
    processDateQueuedColumn(tableInfo);
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
          var dateRun = new Date(cellText + ' EDT'); // Explicitly set Eastern Time
          if (!isNaN(dateRun.getTime())) {
            var now = new Date();
            var nowUTC = new Date(now.toUTCString());
            var dateRunUTC = new Date(dateRun.toUTCString());
            var differenceInHours = (nowUTC - dateRunUTC) / 3600000;
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

            // Calculate estimated time to completion
            calculateAndAppendETC(row, tableInfo.cellsToCheck, dateRun, cell);
          }
        }
      }
    }
  }

  function calculateAndAppendETC(row, cellsToCheck, dateRun, dateRunCell) {
    var totalProcessed = 0;
    var totalMessages = 0;
    cellsToCheck.forEach(function (cellIndex) {
      var cell = row.cells[cellIndex];
      if (cell !== undefined && cell.tagName.toLowerCase() === "td") {
        var cellText = cell.innerText.trim();
        var numbersRegex = /-?\d+(?:,\d+)*(?:\.\d+)?/g;
        var numbersMatches = cellText.match(numbersRegex);
        if (numbersMatches !== null && numbersMatches.length >= 2) {
          var processed = parseFloat(numbersMatches[0].replace(/,/g, ""));
          var total = parseFloat(numbersMatches[1].replace(/,/g, ""));
          totalProcessed += processed;
          totalMessages += total;
        }
      }
    });

    if (totalProcessed > 0 && totalMessages > 0) {
      var now = new Date();
      var nowUTC = new Date(now.toUTCString());
      var dateRunUTC = new Date(dateRun.toUTCString());
      var elapsedTime = (nowUTC - dateRunUTC) / 3600000; // elapsed time in hours
      var estimatedTotalTime = (elapsedTime / totalProcessed) * totalMessages;
      var estimatedRemainingTime = estimatedTotalTime - elapsedTime;
      var estimatedCompletionText;

      if (estimatedRemainingTime > 24) {
        var estimatedDays = (estimatedRemainingTime / 24).toFixed(1);
        estimatedCompletionText = estimatedDays + " days remaining";
      } else if (estimatedRemainingTime < 1) {
        var estimatedMinutes = (estimatedRemainingTime * 60).toFixed(0);
        estimatedCompletionText = estimatedMinutes + " minutes remaining";
      } else {
        var estimatedHours = estimatedRemainingTime.toFixed(1);
        estimatedCompletionText = estimatedHours + " hours remaining";
      }

      var estimatedCompletionDiv = document.createElement("div");
      estimatedCompletionDiv.innerText = estimatedCompletionText;
      estimatedCompletionDiv.setAttribute(
        "style",
        "font-weight: bold; background-color: #f39c12; border: 1px solid #e67e22; padding: 2px 5px; border-radius: 3px; margin-top: 5px; color: black;"
      );
      dateRunCell.appendChild(estimatedCompletionDiv);
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
          var dateQueued = new Date(cellText + ' EDT'); // Explicitly set Eastern Time
          if (!isNaN(dateQueued.getTime())) {
            var now = new Date();
            var nowUTC = new Date(now.toUTCString());
            var dateQueuedUTC = new Date(dateQueued.toUTCString());
            var differenceInHours = (nowUTC - dateQueuedUTC) / 3600000;
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
    try {
      return getColorFromRange(hoursAgo, colorRange);
    } catch (error) {
      console.error('Error in getHoursAgoColor:', error);
      return 'rgb(128, 128, 128)'; // Default to gray in case of error
    }
  }

  function getColorFromRange(percentageComplete, colorRange) {
    if (!colorRange || colorRange.length === 0) {
      console.warn('Invalid color range provided');
      return 'rgb(128, 128, 128)'; // Default to gray if no valid range
    }

    var index = Math.min(
      Math.floor(percentageComplete / 20),
      colorRange.length - 1
    );
    var startColor = colorRange[index] || colorRange[0];
    var endColor = colorRange[Math.min(index + 1, colorRange.length - 1)] || startColor;
    var ratio = (percentageComplete % 20) / 20;

    if (!startColor || !endColor) {
      console.warn('Invalid color objects in range');
      return 'rgb(128, 128, 128)'; // Default to gray if invalid color objects
    }

    var red = Math.floor(startColor.r + (endColor.r - startColor.r) * ratio);
    var green = Math.floor(startColor.g + (endColor.g - startColor.g) * ratio);
    var blue = Math.floor(startColor.b + (endColor.b - startColor.b) * ratio);

    return "rgb(" + red + ", " + green + ", " + blue + ")";
  }

  const style = document.createElement("style");
  style.innerHTML =
    "table.test_table--search-results {" +
    " table-layout: fixed !important;" +
    "}" +
    "table.test_table--search-results button {" +
    " width: 100%;" +
    " margin-top: 3px;" +
    "}" +
    "table.test_table--search-results td > button { " +
    " width: auto;" +
      "}" +
      "table.test_table--search-results td(2), table.test_table--search - results td(3) {" +
      " white-space: nowrap;" +
        "}" +
        "table.test_table--search-results td(4) {" +
        " width: 5%;" +
          " overflow: hidden;" +
          " text-overflow: ellipsis;" +
          "}" +
          "table.test_table--search-results tbody {" +
          " position: sticky;" +
          " top: 0;" +
          " z-index: 1" +
          "}" +
          "table.table.table-primary.table--small-text.test_table--search-results th {" +
          " position: sticky;" +
          " background-color: #0079c0 !important;" +
          " z-index: 1;" +
          " top: 0;" +
          "}" +
          "table > tbody > tr(2) > th {" +
          " top: 48px !important;" +
            "}" +
            "table.table.table-primary.table--small-text.test_table--search-results td {" +
            " position: relative;" +
            " z-index: 0 !important;" +
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

          function processLastUpdatedDate() {
            var elements = document.querySelectorAll(
              "td[class*='test_el--status-processing'] > span[title]"
            );
            elements.forEach(function (element) {
              var titleText = element.getAttribute("title");
              var dateRegex = /last updated: (\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2} (?:AM|PM))/;
            var match = titleText.match(dateRegex);
            if (match) {
              var dateStr = match[1];
              var lastUpdatedDate = new Date(dateStr + ' EDT'); // Explicitly set Eastern Time
              if (!isNaN(lastUpdatedDate.getTime())) {
                var now = new Date();
                var nowUTC = new Date(now.toUTCString());
                var lastUpdatedDateUTC = new Date(lastUpdatedDate.toUTCString());
                var differenceInSeconds = (nowUTC - lastUpdatedDateUTC) / 1000;
                var differenceInMinutes = differenceInSeconds / 60;
                var appendedText = document.createElement("div");
                var timeText, bgColor, textColor;
                if (differenceInSeconds < 60) {
                  timeText = differenceInSeconds.toFixed(2) + " secs ago";
                } else {
                  var minutesAgo = (differenceInSeconds / 60).toFixed(1);
                  timeText = minutesAgo + " mins ago";
                }
                bgColor = getHoursAgoColor(differenceInMinutes);
                textColor = isDarkColor(bgColor) ? "white" : "black";
                appendedText.innerText = timeText;
                appendedText.setAttribute(
                  "style",
                  "margin-top: 2px; margin-left: 0; padding: 0 3px; display: inline-block; font-size: 0.9em; font-weight: 500; background-color: " +
                  bgColor +
                  "; border: 1px solid #e67e22; padding: 0 3px; border-radius: 5px; color: " +
                  textColor +
                  ";"
                );
                element.parentElement.appendChild(appendedText);
              }
            }
          });
        }

        highlightDuplicateCells();
        updateRunningOnText();
        sortTableRows();
        processLastUpdatedDate();
      }) ();
