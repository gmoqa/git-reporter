export const formatMarkdown = (markdownText, format) => {
  if (!markdownText) {
    return "";
  }

  if (format === "MARKDOWN") {
    return markdownText;
  }

  if (format === "TXT" || format === "MEET") {
    // Strip headings, bold, links, and lists
    let text = markdownText
      .replace(/^(##|###|####)\s+/gm, "") // Remove headings
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // Remove links, keeping the text
      .replace(/^-\s+/gm, ""); // Remove list markers
    return text;
  }

  if (format === "SLACK") {
    // Transform links to Slack format
    // Preserve other markdown like bold and lists as Slack supports them
    let text = markdownText.replace(/\[(.*?)\]\((.*?)\)/g, "<$2|$1>");
    return text;
  }

  // Default to returning original text if format is unknown or not specified
  return markdownText;
};
