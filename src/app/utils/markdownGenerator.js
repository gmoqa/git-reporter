export function generateMarkdown(filteredLog, feats, fixes) {
  if (!filteredLog || !feats || !fixes) {
    return "## Changelog\n### Summary\nNo commits to display.";
  }

  const summary = `**${filteredLog.length}** commits, **${feats.length}** features, **${fixes.length}** fixes`;

  const featuresSection = feats.length > 0 ? '#### Features' : '';
  const featuresList = feats
    .map((line) => {
      return ` - **${line.type}**(${line.scope}): ${line.subject} **[(${line.hash})](#)**  \n`;
    })
    .join('');

  const fixesSection = fixes.length > 0 ? '#### Fixes' : '';
  const fixesList = fixes
    .map((line) => {
      const optionalScope = line.scope ? `(${line.scope})` : '';
      return ` - **${line.type}**${optionalScope}: ${line.subject} **[(${line.hash})](#)**  \n`;
    })
    .join('');

  return `## Changelog
### Summary
${summary}
  
 
${featuresSection}
  
${featuresList}

${fixesSection}
  
${fixesList}
`;
}
