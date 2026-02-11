# Mass App-Ads.txt Checker [chrome://extensions/]

A powerful Chrome Extension for bulk validation of `app-ads.txt` files.
Designed for AdOps professionals, Publishers, and Developers to quickly verify IAB authorization records across multiple domains.

![Version](https://img.shields.io/badge/version-2.0-blue)
![Platform](https://img.shields.io/badge/platform-Chrome-green)

## Features

* **Bulk Processing:** Check hundreds of domains at once.
* **Browser Impersonation:** Runs directly in your browser to bypass bot protections (Cloudflare, 403 Forbidden errors) that often block Python scripts.
* **Smart URL Detection:** Automatically checks multiple variations to find the file:
    * `https://www.domain.com/app-ads.txt` (Priority)
    * `https://domain.com/app-ads.txt`
    * `http://...` (Fallback)
* **IAB Validation:** Parses files and counts only valid lines containing `DIRECT` or `RESELLER`.
* **Detailed Reporting:** Shows exactly which URL responded.
* **CSV Export:** Download full results for Excel/Google Sheets.
* **Standalone Window:** Opens in a dedicated window to prevent accidental closing.

## Project Structure

Ensure your folder contains the following files:

```text
/AppAdsChecker
├── manifest.json      # Extension configuration
├── background.js      # Handles window opening logic
├── popup.html         # User Interface (HTML/CSS)
├── popup.js           # Core logic (Checking & Parsing)
├── icon128.png        # Icon (Required)
└── README.md          # Documentation