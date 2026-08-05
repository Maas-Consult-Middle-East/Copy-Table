let copy_table_enabled = false;

async function load_copy_table_settings() {
    try {
        copy_table_enabled = await frappe.db.get_single_value(
            "Copy Table Settings",
            "enable_copy_table"
        );
    } catch (e) {
        console.error("Unable to load Copy Table Settings", e);
        copy_table_enabled = false;
    }
}


frappe.router.on("change", async () => {
    await load_copy_table_settings();

    if (!copy_table_enabled) {
        $(".copy-table-btn").remove();
        return;
    }

    setTimeout(add_buttons, 300);
});

function add_buttons() {

    function get_copy_value(row, df) {
        const value = row[df.fieldname];

        if (df.fieldtype === "Check") {
            return value ? __("Yes") : __("No");
        }

        if (value === null || value === undefined) {
            return "";
        }

        const formatted = frappe.format(
            value,
            df,
            { only_value: true, for_print: true },
            row
        );

        return $("<div>").html(formatted || "").text().trim();
    }

    function build_html_table(headers, rows) {
        const escape = value => $("<div>").text(value || "").html();

        const header_html = headers.map(header => `
            <th style="border:1px solid #000;padding:6px 10px;background:#f2f2f2;font-weight:bold;text-align:left;min-width:90px;">
                ${escape(header)}
            </th>
        `).join("");

        const body_html = rows.map(row => `
            <tr>
                ${row.map(value => `
                    <td style="border:1px solid #000;padding:6px 10px;min-width:90px;">
                        ${escape(value).replace(/\n/g, "<br>")}
                    </td>
                `).join("")}
            </tr>
        `).join("");

        return `
            <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px;">
                <thead><tr>${header_html}</tr></thead>
                <tbody>${body_html}</tbody>
            </table>
        `;
    }

    async function copy_formatted_table(html, plain_text) {
        if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
            const item = new ClipboardItem({
                "text/html": new Blob([html], { type: "text/html" }),
                "text/plain": new Blob([plain_text], { type: "text/plain" })
            });

            await navigator.clipboard.write([item]);
            return;
        }

        const handler = event => {
            event.clipboardData.setData("text/html", html);
            event.clipboardData.setData("text/plain", plain_text);
            event.preventDefault();
        };

        document.addEventListener("copy", handler);

        try {
            document.execCommand("copy");
        } finally {
            document.removeEventListener("copy", handler);
        }
    }

    const frm = cur_frm;

    if (!frm || !frm.fields_dict) return;

    Object.keys(frm.fields_dict).forEach(fieldname => {
        const field = frm.fields_dict[fieldname];

        if (
            !field ||
            field.df.fieldtype !== "Table" ||
            !field.grid
        ) {
            return;
        }

        const grid = field.grid;

        if (!grid.grid_buttons) return;

        if (grid.grid_buttons.find(".copy-table-btn").length) return;

        const btn = $(`
            <button class="btn btn-xs btn-secondary copy-table-btn">
                Copy Table
            </button>
        `);

        btn.on("click", async () => {
        const rows = frm.doc[fieldname] || [];

        if (!rows.length) {
            frappe.msgprint(__("There are no rows to copy."));
            return;
        }

        grid.setup_visible_columns();

        const columns = (grid.visible_columns || [])
            .map(column => column[0])
            .filter(df => df && df.fieldname);

        if (!columns.length) {
            frappe.msgprint(__("No visible columns were found."));
            return;
        }

        const headers = columns.map(df => __(df.label || df.fieldname));

        const table_data = rows.map(row =>
            columns.map(df => get_copy_value(row, df))
        );

        const plain_text = [headers, ...table_data]
            .map(row => row.join("\t"))
            .join("\n");

        const html_table = build_html_table(headers, table_data);

        try {
            await copy_formatted_table(html_table, plain_text);

            frappe.show_alert({
                message: __("Table copied successfully"),
                indicator: "green"
            });
        } catch (error) {
            console.error(error);
            frappe.msgprint(__("Unable to copy the table."));
        }
    });

        grid.grid_buttons.append(btn);
    });
}