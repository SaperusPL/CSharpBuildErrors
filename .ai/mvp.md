### Main Problem

The standard VS Code "Problems" tab and terminal output can be cluttered when dealing with C# build errors and warnings. It's difficult to get a clear, organized overview of all issues from a build, especially in larger projects. Developers need a dedicated, streamlined view that parses and presents only the C# compiler output in a structured and easy-to-navigate format, similar to the experience in a full IDE like Visual Studio.

### Minimum Set of Features

*   **Parse C# Build Output:** The extension will parse the output of C# build commands (e.g., `dotnet build`).
*   **Dedicated "Build Errors" Panel:** Display parsed errors and warnings in a new, dedicated panel in the VS Code bottom view, next to the "Problems" and "Terminal" tabs.
*   **Structured Error/Warning List:**
    *   Group issues by file.
    *   Each item in the list will display the severity (error/warning icon), the message, the error code (e.g., `CS0246`), and the location (line and column), styled to look like the provided image.
*   **Source Code Navigation:** Clicking on an error or warning in the panel will open the corresponding file and navigate the cursor to the exact line and character.
*   **Filtering Controls:** The panel will include controls to filter the list to show:
    *   Errors only
    *   Warnings only
    *   All issues

### What is NOT included in the MVP

*   **Support for other languages:** The extension will only support C# compiler output.
*   **Automatic Build Execution:** The extension will not trigger builds itself. It will only parse the output from builds initiated manually by the user.
*   **Quick Fixes and Suggestions:** No automated code fixes or suggestions will be provided.
*   **Integration with external help sites:** No links to Stack Overflow, Microsoft Docs, or other external resources for error codes.
*   **Historical Error Tracking:** The view will only show issues from the most recent build, without storing a history of past errors. 
