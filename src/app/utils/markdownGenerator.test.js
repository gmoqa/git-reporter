import { formatMarkdown } from './markdownGenerator';

describe('formatMarkdown', () => {
  const sampleMarkdown = `## Section Title
### Sub-section
This is **bold text**.
This is a [link](http://example.com).
- List item 1
- List item 2`;

  const sampleMarkdownWithOnlyLinks = `This is a [link1](http://example.com/1). And this is [link2](http://example.com/2).`;

  test('should return empty string for null or empty input', () => {
    expect(formatMarkdown(null, 'TXT')).toBe('');
    expect(formatMarkdown('', 'TXT')).toBe('');
    expect(formatMarkdown(undefined, 'TXT')).toBe('');
  });

  test('should return original text for "MARKDOWN" format', () => {
    expect(formatMarkdown(sampleMarkdown, 'MARKDOWN')).toBe(sampleMarkdown);
  });

  describe('TXT format', () => {
    const expectedText = `Section Title
Sub-section
This is bold text.
This is a link.
List item 1
List item 2`;
    test('should strip all markdown for "TXT" format', () => {
      expect(formatMarkdown(sampleMarkdown, 'TXT')).toBe(expectedText);
    });
  });

  describe('MEET format', () => {
    const expectedText = `Section Title
Sub-section
This is bold text.
This is a link.
List item 1
List item 2`;
    test('should strip all markdown for "MEET" format', () => {
      expect(formatMarkdown(sampleMarkdown, 'MEET')).toBe(expectedText);
    });
  });

  describe('SLACK format', () => {
    const expectedSlackTextForSample = `## Section Title
### Sub-section
This is **bold text**.
This is a <http://example.com|link>.
- List item 1
- List item 2`;
    const expectedSlackTextForLinksOnly = `This is a <http://example.com/1|link1>. And this is <http://example.com/2|link2>.`;

    test('should transform links and preserve other markdown for "SLACK" format', () => {
      expect(formatMarkdown(sampleMarkdown, 'SLACK')).toBe(expectedSlackTextForSample);
    });
    test('should transform multiple links correctly for "SLACK" format', () => {
      expect(formatMarkdown(sampleMarkdownWithOnlyLinks, 'SLACK')).toBe(expectedSlackTextForLinksOnly);
    });
     test('should preserve bold and lists for "SLACK" format', () => {
      const markdownWithBoldAndList = `**This is bold**
- item 1`;
      expect(formatMarkdown(markdownWithBoldAndList, 'SLACK')).toBe(markdownWithBoldAndList);
    });

  });

  test('should return original text for unrecognized format', () => {
    expect(formatMarkdown(sampleMarkdown, 'UNKNOWN_FORMAT')).toBe(sampleMarkdown);
  });
   test('should return original text if format is not provided', () => {
    expect(formatMarkdown(sampleMarkdown)).toBe(sampleMarkdown);
  });
});
