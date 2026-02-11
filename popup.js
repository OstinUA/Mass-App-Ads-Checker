document.addEventListener('DOMContentLoaded', () => {
  const checkBtn = document.getElementById('checkBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const domainInput = document.getElementById('domainList');
  const tableBody = document.querySelector('#resultsTable tbody');
  const statusText = document.getElementById('statusText');
  const progressText = document.getElementById('progressText');

  let results = [];

  checkBtn.addEventListener('click', async () => {
    const text = domainInput.value;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    if (lines.length === 0) {
        statusText.innerText = "List is empty!";
        return;
    }

    results = [];
    tableBody.innerHTML = '';
    checkBtn.disabled = true;
    checkBtn.innerText = "Processing...";
    downloadBtn.style.display = 'none';
    
    let completed = 0;
    progressText.innerText = `0/${lines.length}`;

    const batchSize = 2;

    for (let i = 0; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, i + batchSize);

      const batchResults = await Promise.all(batch.map(domain => checkDomainSmart(domain)));

      batchResults.forEach(res => {
        addResultToTable(res);
        results.push(res);
        completed++;
      });
      
      progressText.innerText = `${completed}/${lines.length}`;
    }

    statusText.innerText = "Completed!";
    checkBtn.disabled = false;
    checkBtn.innerText = "Run Check";
    downloadBtn.style.display = 'block';
  });

  downloadBtn.addEventListener('click', () => {
    let csv = "App-Ads URL,Status,Lines\n";
    results.forEach(r => {
      const urlForCsv = r.url !== "-" ? r.url : r.domain; 
      csv += `${urlForCsv},${r.status},${r.lines}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app-ads_results.csv';
    a.click();
  });

  async function checkDomainSmart(rawDomain) {
    let domain = rawDomain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').split('/')[0];

    const urls = [
      `https://www.${domain}/app-ads.txt`,
      `https://${domain}/app-ads.txt`,
      `http://www.${domain}/app-ads.txt`,
      `http://${domain}/app-ads.txt`
    ];

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
        clearTimeout(timeoutId);

        if (response.status === 200) {
          const text = await response.text();

          if (text.toLowerCase().includes('<html') || text.toLowerCase().includes('<!doctype')) {
            continue;
          }
          
          const validLines = countValidLines(text);
          return { 
            domain: rawDomain,
            status: validLines > 0 ? "Valid" : "Empty File", 
            lines: validLines, 
            url: url,
            cssClass: validLines > 0 ? "valid" : "empty"
          };
        }
      } catch (e) {
      }
    }

    return { 
        domain: rawDomain, 
        status: "Error", 
        lines: 0, 
        url: "-", 
        cssClass: "error" 
    };
  }

  function countValidLines(content) {
    let count = 0;
    const cleanContent = content.replace(/\uFEFF/g, ''); 
    const lines = cleanContent.split(/\r?\n/);
    
    for (const line of lines) {
      const clean = line.split('#')[0].trim();
      if (!clean) continue;
      
      const parts = clean.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        const type = parts[2].toUpperCase().replace(/[^A-Z]/g, '');
        if (type === 'DIRECT' || type === 'RESELLER') {
          count++;
        }
      }
    }
    return count;
  }

  function addResultToTable(res) {
    const tr = document.createElement('tr');
    const urlCell = res.url !== "-" 
        ? `<a href="${res.url}" target="_blank">${res.url}</a>` 
        : `<span style="color:#999">${res.domain}</span>`;

    tr.innerHTML = `
      <td class="col-url">${urlCell}</td>
      <td class="col-status ${res.cssClass}">${res.status}</td>
      <td class="col-lines">${res.lines}</td>
    `;
    tableBody.appendChild(tr);
  }
});