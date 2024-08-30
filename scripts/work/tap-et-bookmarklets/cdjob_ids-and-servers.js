function createModal(jobInfo) {
  const sortedJobInfo = jobInfo.sort((a, b) =>
    a.fileServer.localeCompare(b.fileServer)
  );
  const jobCount = jobInfo.length;
  const modalContent = sortedJobInfo
    .map((info) => '<li>' + info.jobId + ' ' + info.status + ' ' + info.fileServer + '</li>')
    .join('');

  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 9999; color: #333 !important;">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: 90vh; max-height: 90vh; overflow: auto; background: white; border: 1px solid black; padding: 20px;">
        <button style="margin-top: 10px; margin-right: 10px; padding: 5px 10px; background: #eee; color: #333; border: 1px solid #333; cursor: pointer;" onclick="this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);">Close</button>
        <button id="copyButton" style="margin-top: 10px; margin-right: 10px; padding: 5px 10px; background: #eee; color: #333; border: 1px solid #333; cursor: pointer;">Copy to Clipboard</button>
        <span class="jobCount">num jobs running: ${jobCount}</span>
        <ul>${modalContent}</ul>
      </div>
    </div>`;

  document.body.appendChild(modal);

  const copyButton = document.getElementById('copyButton');
  copyButton.addEventListener('click', () => {
    const textContent = sortedJobInfo
      .map((info) => info.jobId + ' running on ' + info.fileServer.replace(/^\s+|\s+$/g, ''))
      .join('\n')
      .replace(/\)/g, '');
    const textarea = document.createElement('textarea');
    textarea.value = textContent;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    modal.parentNode.removeChild(modal);
  });
}

function processTable1() {
  const table1 = document.querySelector('.search_results_table');
  if (table1) {
    const rows = table1.querySelectorAll('tr');
    const jobInfo = [];
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll('td');
      if (cells.length >= 3) {
        const jobId = cells[2].textContent;
        const fileServer = cells[cells.length - 1].textContent;
        if (cells.length >= 4 && cells[3].textContent.includes('Processing')) {
          jobInfo.push({ jobId: jobId, fileServer: fileServer });
        }
      }
    }
    createModal(jobInfo);
  }
}

function processTable2() {
  const table2 = document.querySelector('.test_table--search-results');
  if (table2) {
    const matches = [];
    const divs = document.querySelectorAll('table > tbody > tr > td > div');
    for (let i = 0; i < divs.length; i++) {
      const div = divs[i];
      const text = div.textContent;
      const regex = /(running on|last run on) PIT-EXPORT-\S*\)/g;
      const result = text.match(regex);
      if (result !== null) {
        const row = div.closest('tr');
        const button = row.querySelector('td:first-child button');
        const downloadJobId = button.getAttribute('onclick').match(/downloadJobId=([\d]+)/)[1];
        for (let j = 0; j < result.length; j++) {
          const match = downloadJobId + ' ' + result[j].replace(/\)/g, '');
          matches.push(match);
        }
      }
    }
    const jobInfo = matches.map((match) => {
      const [jobId, status, fileServer] = match.split(/ (running on|last run on) /);
      return { jobId, status, fileServer };
    });
    createModal(jobInfo);
  }
}

function main() {
  processTable1();
  processTable2();
}

main();