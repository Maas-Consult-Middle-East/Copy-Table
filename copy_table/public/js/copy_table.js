frappe.ui.form.on('*', {
    refresh(frm) {
        add_copy_buttons_to_all_grids(frm);
        retry_add_copy_buttons(frm);
    }
});

function add_copy_buttons_to_all_grids(frm) {
    if (!frm.fields_dict) return;

    Object.keys(frm.fields_dict).forEach(fieldname => {
        const field = frm.fields_dict[fieldname];
        const df = field && field.df;

        // Only target actual child table grids
        if (!df || df.fieldtype !== 'Table' || !field.grid) return;

        add_copy_table_button(frm, fieldname, field.grid);
    });
}

function retry_add_copy_buttons(frm, attempts = 0) {
    const max_attempts = 10;
    const delay = 300;

    add_copy_buttons_to_all_grids(frm);

    // Check if any table field still doesn't have a button attached
    const pending = Object.keys(frm.fields_dict).some(fieldname => {
        const field = frm.fields_dict[fieldname];
        const df = field && field.df;
        return df && df.fieldtype === 'Table' && field.grid && !field.grid.__copy_table_button_added;
    });

    if (pending && attempts < max_attempts) {
        requestAnimationFrame(() => retry_add_copy_buttons(frm, attempts + 1));
    }
}

function add_copy_table_button(frm, table_fieldname, grid) {
    // Prevent duplicate buttons on repeated refresh() calls
    if (grid.__copy_table_button_added) return;
    grid.__copy_table_button_added = true;

    grid.add_custom_button(__('Copy Table'), async function () {
        const rows = frm.doc[table_fieldname] || [];

        if (!rows.length) {
            frappe.msgprint(__('There are no rows to copy.'));
            return;
        }

        grid.setup_visible_columns();

        const columns = (grid.visible_columns || [])
            .map(column => column[0])
            .filter(df => df && df.fieldname);

        if (!columns.length) {
            frappe.msgprint(__('No visible columns were found.'));
            return;
        }

        const headers = columns.map(df => __(df.label || df.fieldname));
        const table_data = rows.map(row => columns.map(df => get_copy_value(row, df)));

        const plain_text = [headers, ...table_data]
            .map(row => row.join('\t'))
            .join('\n');

        const html_table = build_html_table(headers, table_data);

        try {
            await copy_formatted_table(html_table, plain_text);
            frappe.show_alert({
                message: __('Table copied successfully'),
                indicator: 'green'
            });
        } catch (error) {
            console.error(error);
            frappe.msgprint(__('Unable to copy the table. Please allow clipboard permission.'));
        }
    }, 'bottom');

    grid.wrapper.find('.grid-footer').removeClass('hidden');
}

function get_copy_value(row, df) {
    const value = row[df.fieldname];

    if (df.fieldtype === 'Check') {
        return value ? __('Yes') : __('No');
    }
    if (value === null || value === undefined) {
        return '';
    }

    const formatted_value = frappe.format(
        value, df, { only_value: true, for_print: true }, row
    );

    return $('<div>').html(formatted_value || '').text().trim();
}

function build_html_table(headers, rows) {
    const escape_html = value => $('<div>').text(value || '').html();

    const header_html = headers.map(header => `
        <th style="border:1px solid #000;padding:6px 10px;background-color:#f2f2f2;font-weight:bold;text-align:left;white-space:nowrap;">
            ${escape_html(header)}
        </th>`).join('');

    const body_html = rows.map(row => `
        <tr>${row.map(value => `
            <td style="border:1px solid #000;padding:6px 10px;text-align:left;vertical-align:top;">
                ${escape_html(value).replace(/\n/g, '<br>')}
            </td>`).join('')}
        </tr>`).join('');

    return `
        <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px;">
            <thead><tr>${header_html}</tr></thead>
            <tbody>${body_html}</tbody>
        </table>`;
}

async function copy_formatted_table(html, plain_text) {
    if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
        const clipboard_item = new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([plain_text], { type: 'text/plain' })
        });
        await navigator.clipboard.write([clipboard_item]);
        return;
    }

    const copy_handler = event => {
        event.clipboardData.setData('text/html', html);
        event.clipboardData.setData('text/plain', plain_text);
        event.preventDefault();
    };
    document.addEventListener('copy', copy_handler);
    try {
        document.execCommand('copy');
    } finally {
        document.removeEventListener('copy', copy_handler);
    }
}


// function retry_add_copy_buttons(frm, attempts = 0) {
//     const max_attempts = 10;
//     const delay = 300;

//     add_copy_buttons_to_all_grids(frm);

//     // Check if any table field still doesn't have a button attached
//     const pending = Object.keys(frm.fields_dict).some(fieldname => {
//         const field = frm.fields_dict[fieldname];
//         const df = field && field.df;
//         return df && df.fieldtype === 'Table' && field.grid && !field.grid.__copy_table_button_added;
//     });

//     if (pending && attempts < max_attempts) {
//         setTimeout(() => retry_add_copy_buttons(frm, attempts + 1), delay);
//     }
// }