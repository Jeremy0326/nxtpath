// Shared utility for parsing job-related list fields (responsibilities, requirements, benefits, etc.)

/**
 * Parses a string or array of strings into a clean string array for display as bullet points.
 * Handles dashes, bullets, newlines, and sentence splitting more intelligently.
 */
export function parseJobListItems(input: string | string[] | null | undefined): string[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.map(item => item.trim()).filter(Boolean);
  }

  // If input is a string, split by newlines only, trim, and filter out empty lines
  return input
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
} 