# Windows distribution

CostLab Calculator can be distributed as a Windows installer while keeping the GitHub Pages version available as a PWA.

## Publish a Windows installer from GitHub

1. Push the repository to GitHub.
2. Open the repository **Actions** tab.
3. Select **Build Windows release**.
4. Choose **Run workflow** and enter a version such as `1.0.0`.
5. GitHub builds `CostLab-Calculator-Setup.exe` on a Windows runner and publishes it in **Releases**.

The CostLab Calculator GitHub Pages interface automatically links its **Download Windows** button to:

`releases/latest/download/CostLab-Calculator-Setup.exe`

No page edit is required when a new version is released.

## Alternative release by tag

Pushing a tag such as `v1.1.0` also launches the Windows build and publishes or updates the matching GitHub Release.

## Local application data

The Windows application stores browser-style application data in the current Windows user's application-data profile. These data are not committed or uploaded to GitHub. JSON export remains the portable backup format.

## Code signing

The default installer is unsigned. Windows SmartScreen can therefore display a warning on first launch. A code-signing certificate can be added later without changing the application data model or the download workflow.
