import { BuildProblem } from './types';

export class BuildOutputParser {
    /**
     * Regex to capture C# build errors and warnings from `dotnet build` output.
     * It's designed to be compatible with the 'normal' verbosity level of MSBuild.
     * 
     * Breakdown:
     * - `^`: Start of the line.
     * - `(.*)`: Group 1: Captures the full file path. It's non-greedy.
     * - `\\((\\d+),(\\d+)\\)`: Groups 2 & 3: Captures line and column numbers inside parentheses.
     * - `:\\s+`: Matches the colon and whitespace after the location.
     * - `(error|warning)`: Group 4: Captures the severity level ('error' or 'warning').
     * - `\\s+[^:]+:`: Matches the error code (e.g., 'CS0168:') but doesn't capture it.
     * - `\\s+`: Whitespace after the code.
     * - `(.*)`: Group 5: Captures the main error/warning message.
     * - `(?=\\s+\\[.*\\]|$)`: A positive lookahead. It ensures the match is followed by either:
     *   - `\\s+\\[.*\\]`: Whitespace and the project file path in brackets (e.g., [MyProject.csproj]).
     *   - `|`: OR
     *   - `$`: The end of the line.
     *   This prevents capturing extraneous text in the message.
     */
    private static readonly problemMatcher = /^(.*)\((\d+),(\d+)\):\s+(error|warning)\s+[^:]+:\s+(.*)(?=\s+\[.*\]|$)/;

    public static parse(buildOutput: string): BuildProblem[] {
        const problems: BuildProblem[] = [];
        const lines = buildOutput.split(/\\r?\\n/);

        for (const line of lines) {
            const match = line.match(this.problemMatcher);
            if (match) {
                const [, filePath, lineStr, charStr, severity, message] = match;
                problems.push({
                    filePath: filePath.trim(),
                    line: parseInt(lineStr, 10),
                    character: parseInt(charStr, 10),
                    isError: severity.toLowerCase() === 'error',
                    message: message.trim(),
                    raw: line.trim()
                });
            }
        }
        return problems;
    }
} 
