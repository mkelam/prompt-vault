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
