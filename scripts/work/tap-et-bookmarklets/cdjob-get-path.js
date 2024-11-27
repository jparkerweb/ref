// javascript:(function(){  var script = document.createElement('script');  script.src = 'https://rawcdn.githack.com/jparkerweb/ref/refs/heads/main/scripts/work/tap-et-bookmarklets/cdjob-get-path.js';  document.body.appendChild(script);})();

(function() {
  try {
    console.log("Bookmarklet started");

    const table = document.querySelector(".test_table--search-results");
    if (table) {
      console.log("Table found");
      const rows = table.querySelectorAll("tr");
      if (rows.length === 0) {
        console.log("No rows found.");
        return;
      }
      console.log(`Found ${rows.length} rows`);

      const folderPaths = [];
      rows.forEach((row, index) => {
        console.log(`Processing row ${index + 1}`);
        const button = row.querySelector("td:first-child button");
        if (!button) {
          console.log(`Button not found in row ${index + 1}`);
          return;
        }

        const onClickAttr = button.getAttribute("onclick");
        const jobIdMatch = onClickAttr.match(/downloadJobId=(\d+)/);
        const jobId = jobIdMatch ? jobIdMatch[1] : "";
        console.log(`Job ID: ${jobId}`);

        const nameCell = row.querySelector("td:first-child");

        const statusCell = row.querySelector("td.test_el--job-status");
        let serverName = "";
        if (statusCell) {
          const statusText = statusCell.textContent;
          const runningMatch = statusText.match(/\(running on ([^)]+)\)/);
          const lastRunMatch = statusText.match(/\(last run on ([^)]+)\)/);
          if (runningMatch) {
            serverName = runningMatch[1];
          } else if (lastRunMatch) {
            serverName = lastRunMatch[1];
          }
          console.log(`Server name: ${serverName}`);
        }

        // Determine the appropriate path based on the server name
        let rootPath;
        if (serverName === 'PIT-EXPORT-FM1' || serverName === 'PIT-EXPORT-FM2') {
          rootPath = "\\\\traffic.pit-tempvault-02.smarshinc.com\\ifs\\pit-tempvault-02\\vault\\mercuryExports\\Freddie\\" + jobId;
        } else {
          rootPath = "\\\\traffic.pit-tempvault-02.smarshinc.com\\ifs\\pit-tempvault-02\\vault\\mercuryExports\\Custom\\" + jobId;
        }

        const fullPath = serverName ? `${rootPath}\\${serverName}` : rootPath;
        folderPaths.push(fullPath);

        function createFolderIcon(label) {
          const icon = document.createElement("span");
          icon.innerHTML = `📁${label} `;
          icon.style.cursor = "pointer";
          icon.addEventListener("click", () => {
            icon.style.color = "red";
            icon.style.fontWeight = "bold";

            navigator.clipboard.writeText(fullPath);
            console.log(`Copied path: ${fullPath}`);
          });
          return icon;
        }

        nameCell.appendChild(createFolderIcon("vault"));
      });

      // Add folder icon to the table header
      const headerRow = table.querySelector("tr");
      const jobIdHeader = headerRow.querySelector("th");
      const headerFolderIcon = document.createElement("span");
      headerFolderIcon.innerHTML = "📁 ";
      headerFolderIcon.style.cursor = "pointer";
      headerFolderIcon.addEventListener("click", () => {
        const combinedPaths = folderPaths.join(", ");
        navigator.clipboard.writeText(combinedPaths);
        console.log(`Copied combined paths: ${combinedPaths}`);

        const toast = document.createElement("div");
        toast.innerText = `Copied combined folder paths: ${combinedPaths}`;
        toast.style.position = "fixed";
        toast.style.bottom = "10px";
        toast.style.right = "10px";
        toast.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        toast.style.color = "#fff";
        toast.style.padding = "10px";
        toast.style.borderRadius = "5px";
        toast.style.opacity = "0";
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = "1";
        }, 100);
        setTimeout(() => {
          toast.style.opacity = "0";
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 1000);
        }, 2000);
      });
      jobIdHeader.insertBefore(headerFolderIcon, jobIdHeader.firstChild);
    } else {
      console.log("Table not found.");
    }

    const style = document.createElement("style");
    style.innerHTML =
      "table.table.table-primary.table--small-text.test_table--search-results {" +
      "  table-layout: fixed !important;" +
      "}" +
      "table.table.table-primary.table--small-text.test_table--search-results button {" +
      "  width: 100%;" +
      "  margin-top: 3px;" +
      "}" +
      "table.table.table-primary.table--small-text.test_table--search-results td:first-of-type > button {" +
      "  width: auto;" +
      "}" +
      "table.table.table-primary.table--small-text.test_table--search-results td," +
      "table.table.table-primary.table--small-text.test_table--search-results th {" +
      "  white-space: normal !important;" +
      "  word-break: break-word;" +
      "}";
    document.head.appendChild(style);
    console.log("Style added");

    console.log("Bookmarklet completed successfully");
  } catch (error) {
    console.error("An error occurred in the bookmarklet:", error);
  }
})();
