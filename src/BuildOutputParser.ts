import { BuildProblem } from './types';

export class BuildOutputParser {
    /**
     * Regex to capture the start of a C# build error or warning.
     * It captures the file path, line/char numbers, severity, code, and the beginning of the message.
     * It now expects the line to start with optional whitespace followed by a file path.
     */
    private static readonly problemMatcher = /^\s*([a-zA-Z]:[^\s(].*?)\((\d+),(\d+)\):\s+(warning|error)\s+([A-Z0-9]+):\s+(.*)/;

    /**
     * Regex to identify and clean terminal noise that prefixes line continuations.
     */
    private static readonly continuationNoise = /^\d+H\s*/;

    public static parse(buildOutput: string, existingProblems: BuildProblem[] = []): BuildProblem[] {
        const problems: BuildProblem[] = [...existingProblems];
        // Normalize line endings and split into lines.
        const lines = buildOutput.replace(/\r\n/g, '\n').split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(this.problemMatcher);

            if (match) {
                const [, filePath, lineStr, charStr, severity, , messageStart] = match;
                let fullMessage = messageStart;

                // Look ahead for continuation lines
                let j = i + 1;
                while (j < lines.length && lines[j] && !lines[j].match(this.problemMatcher)) {
                    // Remove noise, but don't trim, to preserve intentional whitespace.
                    const continuationLine = lines[j].replace(this.continuationNoise, '');
                    fullMessage += continuationLine;
                    j++;
                }

                // Clean up trailing characters like 'K' which can appear after trimming.
                let cleanedMessage = fullMessage.trim();
                if (cleanedMessage.endsWith('K')) {
                    cleanedMessage = cleanedMessage.slice(0, -1).trimEnd();
                }

                problems.push({
                    filePath: filePath.trim(),
                    line: parseInt(lineStr, 10),
                    character: parseInt(charStr, 10),
                    isError: severity.toLowerCase() === 'error',
                    message: cleanedMessage,
                    raw: line.trim() // We keep only the first line as raw, as it's the anchor.
                });

                // Skip the lines we've already processed as continuations
                i = j - 1;
            }
        }
        return problems;
    }
}
