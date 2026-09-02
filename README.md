### Copy Table

Specific app for copying table and paste it in Docs,Excel,etc..

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch develop
bench install-app copy_table
```

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/copy_table
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### CI

This app can use GitHub Actions for CI. The following workflows are configured:

- CI: Installs this app and runs unit tests on every push to `develop` branch.
- Linters: Runs [Frappe Semgrep Rules](https://github.com/frappe/semgrep-rules) and [pip-audit](https://pypi.org/project/pip-audit/) on every pull request.


### License

mit


The Copy Table app allows users to copy data from any child table in ERPNext/Frappe and paste it directly into spreadsheet or document applications while preserving the table structure.


## Features

- Adds a Copy Table button to all child tables.
- Copies only the visible columns.
- Preserves column headers.
- Preserves formatted values.
- Supports HTML and plain text clipboard formats.
- Can be enabled or disabled globally.

---

## Supported Applications

The copied table can be pasted into:

- Microsoft Excel
- Google Sheets
- Microsoft Word
- Google Docs
- Outlook
- Gmail
- LibreOffice Calc
- Apple Numbers
- Any application supporting HTML table pasting


## Installation

Install the app.

```bash
bench get-app https://github.com/Maas-Consult-Middle-East/Copy-Table.git
bench --site <site_name> install-app copy_table
```

Build the assets.

```bash
bench build
bench migrate
bench restart
```

---

## Configuration

Navigate to:

> Copy Table Settings

Enable the checkbox:

> Enable Copy Table

When enabled, the Copy Table button will appear in all child tables.

When disabled, the button will be hidden globally.

---

## Usage

1. Open any document containing a child table.

Examples:

- Sales Invoice
- Purchase Invoice
- Delivery Note
- Material Request
- Purchase Order
- Payment Entry
- Journal Entry
- Any custom DocType with a child table

2. Click Copy Table.

3. Paste into your preferred application using:

- Ctrl + V (Windows/Linux)
- ⌘ + V (macOS)


## Example





---

## What Gets Copied
The table structure and formatting are preserved.
The app copies:

- Visible columns only
- Column headers
- Displayed values
- Currency formatting
- Date formatting
- Link field values
- Select values
- Read-only fields
- Checkbox values as Yes or No

---

## Compatibility

Supports:

- Frappe Framework v14
- Frappe Framework v15
- Frappe Framework v16

---

## Permissions

Users must have permission to:

- Read the document being copied.
- Read Copy Table Settings.

---

## Limitations

- Only visible columns are copied.
- Hidden columns are excluded.
- Copies one child table at a time.
- Clipboard access depends on browser permissions.
- HTTPS is recommended for full Clipboard API support.

---

## Troubleshooting

### Copy Table button is not visible

Verify that:

- The app is installed.
- Enable Copy Table is checked.
- Browser cache has been refreshed after deployment.

---

### Unable to copy the table

Possible causes:

- Clipboard permissions are denied.
- Browser does not support the Clipboard API.
- The page is not served over HTTPS.

---

## Browser Support

Tested on:

- Google Chrome
- Microsoft Edge
- Brave
- Safari
- Mozilla Firefox

---

## Version

v1.0.0



### SCREENSHOTS

<img width="960" height="439" alt="Screen Recording 2026-09-01 082158f097f7" src="https://github.com/user-attachments/assets/5c0b73cb-9e21-4d44-9531-99c74cb51865" />

<img width="1512" height="789" alt="Screenshot 2026-09-01 at 3 30 34 PM" src="https://github.com/user-attachments/assets/f3be2d14-529d-45a3-ad1d-92be97bdbf7d" />
