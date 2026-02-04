import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { Prompt } from "@/lib/types";

// Export single prompt to Markdown
export function exportToMarkdown(prompt: Prompt, variables: Record<string, string>) {
  const filledTemplate = prompt.template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });

  const markdownContent = `# ${prompt.title}\n\n` +
                          `**Category:** ${prompt.category}\n` +
                          `**Frameworks:** ${prompt.frameworks.join(", ")}\n` +
                          `**Description:** ${prompt.description}\n\n` +
                          `---\n\n` +
                          `${filledTemplate}`;

  const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
  saveAs(blob, `${prompt.title.replace(/\s+/g, "_")}.md`);
}

export function exportToExcel(prompt: Prompt, variables: Record<string, string>) {
  // 1. Create a Key-Value pair for metadata
  const metadata = [
    ["Prompt Title", prompt.title],
    ["Category", prompt.category],
    ["Description", prompt.description],
    ["Frameworks", prompt.frameworks.join(", ")],
    ["Exported At", new Date().toLocaleString()],
    ["", ""], // Spacer
    ["VARIABLE", "USER INPUT"], // Header
    ...Object.entries(variables).map(([k, v]) => [k, v]),
    ["", ""], // Spacer
    ["FULL PROMPT", ""] // Header
  ];

  // 2. Create the worksheet
  const ws = XLSX.utils.aoa_to_sheet(metadata);

  // 3. Add the Full Prompt content in a large cell below
  const promptStartRow = metadata.length;
  // Calculate prompt content manually to avoid cell limit issues in simple aoa
  const filledTemplate = prompt.template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
  
  XLSX.utils.sheet_add_aoa(ws, [[filledTemplate]], { origin: `A${promptStartRow + 1}` });

  // 4. Create workbook and download
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "BizPrompt Export");
  XLSX.writeFile(wb, `${prompt.title.replace(/\s+/g, "_")}.xlsx`);
}

// Export entire prompt library to JSON
export function exportLibraryToJSON(prompts: Prompt[]) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalPrompts: prompts.length,
    prompts: prompts.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      description: p.description,
      template: p.template,
      variables: p.variables,
      frameworks: p.frameworks,
      estimatedTimeSaved: p.estimatedTimeSaved,
      tier: p.tier,
      tags: p.tags,
    })),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json;charset=utf-8"
  });
  saveAs(blob, `BizPrompt_Library_${new Date().toISOString().split('T')[0]}.json`);
}

// Export entire prompt library to Excel
export function exportLibraryToExcel(prompts: Prompt[]) {
  // Create main prompts sheet
  const promptsData = prompts.map(p => ({
    "Title": p.title,
    "Category": p.category,
    "Tier": p.tier,
    "Description": p.description,
    "Frameworks": p.frameworks.join(", "),
    "Time Saved": p.estimatedTimeSaved,
    "Template": p.template,
    "Variables": p.variables.map(v => v.name).join(", "),
  }));

  const ws = XLSX.utils.json_to_sheet(promptsData);

  // Set column widths for better readability
  ws['!cols'] = [
    { wch: 30 },  // Title
    { wch: 15 },  // Category
    { wch: 10 },  // Tier
    { wch: 50 },  // Description
    { wch: 30 },  // Frameworks
    { wch: 12 },  // Time Saved
    { wch: 80 },  // Template
    { wch: 30 },  // Variables
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "All Prompts");

  // Create summary sheet
  const categories = Array.from(new Set(prompts.map(p => p.category)));
  const summaryData: Array<{ Category: string; "Total Prompts": number; Free: number; Premium: number }> = categories.map(cat => ({
    "Category": cat,
    "Total Prompts": prompts.filter(p => p.category === cat).length,
    "Free": prompts.filter(p => p.category === cat && p.tier === "free").length,
    "Premium": prompts.filter(p => p.category === cat && p.tier === "premium").length,
  }));

  // Add totals row
  summaryData.push({
    "Category": "TOTAL",
    "Total Prompts": prompts.length,
    "Free": prompts.filter(p => p.tier === "free").length,
    "Premium": prompts.filter(p => p.tier === "premium").length,
  });

  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [
    { wch: 20 },
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  XLSX.writeFile(wb, `BizPrompt_Library_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export entire prompt library to interactive HTML
export function exportLibraryToHTML(prompts: Prompt[]) {
  const categories = Array.from(new Set(prompts.map(p => p.category)));
  const promptsJSON = JSON.stringify(prompts);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BizPrompt Vault - Prompt Library</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #e2e8f0;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 2rem; }
    h1 {
      font-size: 2.5rem;
      background: linear-gradient(90deg, #60a5fa, #fff, #60a5fa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    .subtitle { color: #94a3b8; font-size: 1rem; }
    .stats {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin: 1rem 0;
      flex-wrap: wrap;
    }
    .stat {
      background: rgba(255,255,255,0.05);
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .search {
      flex: 1;
      min-width: 200px;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(0,0,0,0.3);
      color: #fff;
      font-size: 1rem;
    }
    .search::placeholder { color: #64748b; }
    .filter-btn {
      padding: 0.75rem 1.25rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.05);
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn:hover, .filter-btn.active {
      background: rgba(59,130,246,0.2);
      border-color: rgba(59,130,246,0.5);
      color: #60a5fa;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1rem;
    }
    .card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1rem;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .card:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.2);
      transform: translateY(-2px);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }
    .card-title { font-size: 1.125rem; font-weight: 600; color: #fff; }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-free { background: rgba(34,197,94,0.2); color: #4ade80; }
    .badge-premium { background: rgba(234,179,8,0.2); color: #facc15; }
    .card-category {
      color: #60a5fa;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .card-desc { color: #94a3b8; font-size: 0.875rem; line-height: 1.5; }
    .card-frameworks {
      margin-top: 1rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .framework-tag {
      background: rgba(255,255,255,0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      color: #cbd5e1;
    }
    /* Modal */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(4px);
      z-index: 100;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }
    .modal-overlay.active { display: flex; }
    .modal {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 1rem;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 2rem;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .modal-title { font-size: 1.5rem; font-weight: 700; }
    .close-btn {
      background: none;
      border: none;
      color: #64748b;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
    }
    .close-btn:hover { color: #fff; }
    .modal-section { margin-bottom: 1.5rem; }
    .modal-section-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      margin-bottom: 0.5rem;
    }
    .template-box {
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 0.5rem;
      padding: 1rem;
      font-family: monospace;
      font-size: 0.875rem;
      line-height: 1.6;
      white-space: pre-wrap;
      color: #e2e8f0;
    }
    .variable {
      background: rgba(59,130,246,0.3);
      color: #60a5fa;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
    }
    .copy-btn {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border: none;
      color: #fff;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .copy-btn:hover { transform: scale(1.02); }
    .copy-btn.copied { background: linear-gradient(135deg, #22c55e, #16a34a); }
    /* Variable Input Styles */
    .variables-grid {
      display: grid;
      gap: 1rem;
    }
    .variable-input-group {
      background: rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 0.5rem;
      padding: 1rem;
    }
    .variable-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .variable-name {
      font-weight: 600;
      color: #60a5fa;
    }
    .variable-example {
      font-size: 0.75rem;
      color: #64748b;
      font-style: italic;
    }
    .variable-desc {
      font-size: 0.875rem;
      color: #94a3b8;
      margin-bottom: 0.5rem;
    }
    .variable-input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border-radius: 0.375rem;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(0,0,0,0.3);
      color: #fff;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }
    .variable-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
    }
    .variable-input::placeholder { color: #475569; }
    .preview-section {
      background: rgba(59,130,246,0.1);
      border: 1px solid rgba(59,130,246,0.3);
      border-radius: 0.5rem;
      padding: 1rem;
    }
    .preview-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #60a5fa;
      margin-bottom: 0.75rem;
    }
    .live-indicator {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .filled-variable {
      background: rgba(34,197,94,0.3);
      color: #4ade80;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
    }
    .unfilled-variable {
      background: rgba(234,179,8,0.3);
      color: #fbbf24;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
    }
    .btn-row {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .secondary-btn {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #94a3b8;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .secondary-btn:hover {
      background: rgba(255,255,255,0.15);
      color: #fff;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #64748b;
    }
    @media (max-width: 640px) {
      body { padding: 1rem; }
      h1 { font-size: 1.75rem; }
      .grid { grid-template-columns: 1fr; }
      .controls { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>BizPrompt Vault</h1>
      <p class="subtitle">Enterprise Prompt Library - Exported ${new Date().toLocaleDateString()}</p>
      <div class="stats">
        <span class="stat">📚 <span id="total-count">${prompts.length}</span> Prompts</span>
        <span class="stat">✅ <span id="free-count">${prompts.filter(p => p.tier === 'free').length}</span> Free</span>
        <span class="stat">⭐ <span id="premium-count">${prompts.filter(p => p.tier === 'premium').length}</span> Premium</span>
      </div>
    </header>

    <div class="controls">
      <input type="text" class="search" id="search" placeholder="Search prompts...">
      <button class="filter-btn active" data-filter="all">All</button>
      ${categories.map(cat => `<button class="filter-btn" data-filter="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>`).join('')}
    </div>

    <div class="grid" id="prompts-grid"></div>
    <div class="empty-state" id="empty-state" style="display:none;">
      <p>No prompts found matching your search.</p>
    </div>
  </div>

  <!-- Modal -->
  <div class="modal-overlay" id="modal">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2 class="modal-title" id="modal-title"></h2>
          <p class="card-category" id="modal-category"></p>
        </div>
        <button class="close-btn" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-section">
        <p class="modal-section-title">Description</p>
        <p id="modal-desc"></p>
      </div>
      <div class="modal-section">
        <p class="modal-section-title">Frameworks</p>
        <div id="modal-frameworks" class="card-frameworks"></div>
      </div>
      <div class="modal-section" id="variables-section">
        <p class="modal-section-title">Customize Variables</p>
        <div class="variables-grid" id="modal-variables"></div>
      </div>
      <div class="modal-section">
        <div class="preview-section">
          <div class="preview-label">
            <span class="live-indicator"></span>
            Live Preview
          </div>
          <div class="template-box" id="modal-template"></div>
        </div>
      </div>
      <div class="btn-row">
        <button class="copy-btn" id="copy-btn" onclick="copyPrompt()">Copy Filled Prompt</button>
        <button class="secondary-btn" onclick="resetVariables()">Reset</button>
      </div>
    </div>
  </div>

  <script>
    const prompts = ${promptsJSON};
    let currentFilter = 'all';
    let searchQuery = '';
    let selectedPrompt = null;
    let variableValues = {};

    function renderPrompts() {
      const grid = document.getElementById('prompts-grid');
      const emptyState = document.getElementById('empty-state');

      let filtered = prompts;

      if (currentFilter !== 'all') {
        filtered = filtered.filter(p => p.category === currentFilter);
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.frameworks.some(f => f.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
        );
      }

      if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
      }

      emptyState.style.display = 'none';
      grid.innerHTML = filtered.map(p => \`
        <div class="card" onclick="openModal('\${p.id}')">
          <div class="card-header">
            <span class="card-title">\${p.title}</span>
            <span class="badge badge-\${p.tier}">\${p.tier}</span>
          </div>
          <p class="card-category">\${p.category}</p>
          <p class="card-desc">\${p.description.substring(0, 120)}\${p.description.length > 120 ? '...' : ''}</p>
          <div class="card-frameworks">
            \${p.frameworks.slice(0, 3).map(f => \`<span class="framework-tag">\${f}</span>\`).join('')}
            \${p.frameworks.length > 3 ? \`<span class="framework-tag">+\${p.frameworks.length - 3}</span>\` : ''}
          </div>
        </div>
      \`).join('');
    }

    function openModal(id) {
      selectedPrompt = prompts.find(p => p.id === id);
      if (!selectedPrompt) return;

      // Reset variable values for new prompt
      variableValues = {};
      selectedPrompt.variables.forEach(v => {
        variableValues[v.name] = '';
      });

      document.getElementById('modal-title').textContent = selectedPrompt.title;
      document.getElementById('modal-category').textContent = selectedPrompt.category;
      document.getElementById('modal-desc').textContent = selectedPrompt.description;
      document.getElementById('modal-frameworks').innerHTML = selectedPrompt.frameworks
        .map(f => \`<span class="framework-tag">\${f}</span>\`).join('');

      // Render variable input fields
      const variablesSection = document.getElementById('variables-section');
      if (selectedPrompt.variables.length === 0) {
        variablesSection.style.display = 'none';
      } else {
        variablesSection.style.display = 'block';
        document.getElementById('modal-variables').innerHTML = selectedPrompt.variables
          .map(v => \`
            <div class="variable-input-group">
              <div class="variable-label">
                <span class="variable-name">{{\${v.name}}}</span>
                <span class="variable-example">e.g., \${v.example}</span>
              </div>
              <p class="variable-desc">\${v.description}</p>
              <input
                type="text"
                class="variable-input"
                data-variable="\${v.name}"
                placeholder="Enter \${v.name.replace(/_/g, ' ')}..."
                oninput="updateVariable('\${v.name}', this.value)"
              />
            </div>
          \`).join('');
      }

      // Update template preview
      updateTemplatePreview();

      document.getElementById('modal').classList.add('active');
      document.getElementById('copy-btn').textContent = 'Copy Filled Prompt';
      document.getElementById('copy-btn').classList.remove('copied');
    }

    function updateVariable(name, value) {
      variableValues[name] = value;
      updateTemplatePreview();
    }

    function updateTemplatePreview() {
      if (!selectedPrompt) return;

      let template = selectedPrompt.template;

      // Replace variables with values or highlight unfilled ones
      template = template.replace(/\\{\\{(\\w+)\\}\\}/g, (match, varName) => {
        const value = variableValues[varName];
        if (value && value.trim()) {
          return \`<span class="filled-variable">\${value}</span>\`;
        } else {
          return \`<span class="unfilled-variable">\${match}</span>\`;
        }
      });

      document.getElementById('modal-template').innerHTML = template;
    }

    function resetVariables() {
      if (!selectedPrompt) return;

      // Clear all values
      selectedPrompt.variables.forEach(v => {
        variableValues[v.name] = '';
      });

      // Clear all input fields
      document.querySelectorAll('.variable-input').forEach(input => {
        input.value = '';
      });

      // Update preview
      updateTemplatePreview();
    }

    function closeModal() {
      document.getElementById('modal').classList.remove('active');
      selectedPrompt = null;
    }

    function copyPrompt() {
      if (!selectedPrompt) return;

      // Get the filled prompt with variable values substituted
      let filledPrompt = selectedPrompt.template;
      filledPrompt = filledPrompt.replace(/\\{\\{(\\w+)\\}\\}/g, (match, varName) => {
        const value = variableValues[varName];
        return (value && value.trim()) ? value : match;
      });

      navigator.clipboard.writeText(filledPrompt).then(() => {
        const btn = document.getElementById('copy-btn');
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy Filled Prompt';
          btn.classList.remove('copied');
        }, 2000);
      });
    }

    // Event listeners
    document.getElementById('search').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderPrompts();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderPrompts();
      });
    });

    document.getElementById('modal').addEventListener('click', (e) => {
      if (e.target.id === 'modal') closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Initial render
    renderPrompts();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  saveAs(blob, `BizPrompt_Library_${new Date().toISOString().split('T')[0]}.html`);
}
