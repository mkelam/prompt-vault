import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { Prompt } from "@/lib/types";

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
