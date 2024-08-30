function removeClickedRows() {
    const table = document.querySelector(".search_results_table, .test_table--search-results");
    if (!table) {
        alert('No table found with class "search_results_table" or "test_table--search-results"');
        return;
    }
    const rows = table.querySelectorAll("tr");
    rows.forEach((row) => {
        const firstCell = row.querySelector("td");
        if (!firstCell) {
        return;
        }
        const trashIcon = document.createElement("span");
        trashIcon.innerHTML = "&#128165;";
        trashIcon.style.cursor = "pointer";
        firstCell.insertBefore(trashIcon, firstCell.firstChild);
        trashIcon.addEventListener("click", () => {
        row.remove();
        });
    });

    const style = document.createElement('style');
    style.innerHTML = 
        'table.table.table-primary.table--small-text.test_table--search-results {' +
        '  table-layout: fixed !important;' +
        '}' +
        'table.table.table-primary.table--small-text.test_table--search-results button {' +
        '  width: 100%;' +
        '  margin-top: 3px;' +
        '}' +
        'table.table.table-primary.table--small-text.test_table--search-results td:first-of-type > button {' +
        '  width: auto;' +
        '}' +
        'table.table.table-primary.table--small-text.test_table--search-results td,' +
        'table.table.table-primary.table--small-text.test_table--search-results th {' +
        '  white-space: normal !important;' +
        '  word-break: break-word;' +
        '}';
    document.head.appendChild(style);
}

removeClickedRows();