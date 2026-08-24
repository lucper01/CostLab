# CostLab Calculator

CostLab Calculator is a local-first application for planning, comparing, monitoring and documenting the financial cost of research studies.

It is designed around a multi-study workflow: several studies can be managed simultaneously while their participants, consumables, staff time, equipment, funding, expenses, purchasing needs and scenarios remain fully separated. A consolidated dashboard provides a portfolio-level view of the full research programme.

## Main capabilities

- Multiple simultaneous studies with independent budgets and statuses
- Portfolio-level consolidated dashboard
- Target sample size and expected-session calculations accounting for exclusions, dropouts and technical losses
- Participant compensation and session-duration modelling
- Consumables with package price, unit consumption, available stock and automatic purchasing needs
- Personnel time and economic valuation
- Equipment purchase, rental and amortisation
- Services, licences, travel and custom cost categories
- Direct budget versus full economic cost
- Funding sources, cost centres and actual-expense tracking
- Automatic order-list generation from stock shortages
- Scenario analysis and Monte-Carlo cost simulation
- Cross-study comparison
- Printable funding and budget reports
- JSON backups and CSV exports
- Responsive desktop/mobile interface
- French/English interface
- Light/dark themes, accent palettes and accessibility options

## Use CostLab Calculator

CostLab Calculator can be used in two ways:

- **Web/PWA**: open the GitHub Pages version and install it from a compatible browser.
- **Windows application**: use the **Download Windows** button in CostLab Calculator to download the latest `CostLab-Calculator-Setup.exe` published on GitHub Releases.

Both versions are local-first. CostLab Calculator does not require a remote database and does not send the budgets entered in the application to GitHub.

## Data and backups

Application data are stored locally on the device running CostLab Calculator. Regular JSON exports are recommended because they provide a portable backup that can be restored on another installation.

## Offline use

The PWA supports offline use after installation. The Windows application is self-contained and does not require the GitHub Pages website to run after installation.

## Windows builds

The repository includes an automated GitHub Actions workflow that creates the Windows installer and publishes it to GitHub Releases. See `BUILD_WINDOWS.md` for release instructions.

## Licence

MIT License. See `LICENSE`.
