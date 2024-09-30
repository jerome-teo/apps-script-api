import { PostHandler } from "../Types";
// noinspection UnnecessaryContinueJS
export class upsertOneStatus extends PostHandler {
    constructor(ID_COLUMN, event) {
        super(ID_COLUMN, event);
        this.cols = {};
    }
    process() {
        if (this.userId === undefined)
            return ContentService.createTextOutput("Error parsing query parameter for endpoint `upsertOneStatus`. Please pass a query parameter with name `userId`");
        if (this.numHeadings === undefined)
            return ContentService.createTextOutput("Internal error counting number of headings. Please ensure nothing" +
                " weird is happening...");
        // Check if we can find this row
        const userRowData = this.rowQuery(this.userId);
        const sheet = SpreadsheetApp.getActiveSheet();
        if (userRowData === undefined) {
            // Need to create row, then append it
            // Create row...
            const colData = [
                this.userId,
                ...Array(this.numHeadings - 2).fill("false")
            ];
            for (const colKey in this.cols) {
                const col = this.cols[colKey];
                colData[col.colId] = col.colValue;
            }
            // Now append row
            sheet.appendRow(colData);
        }
        else {
            // Just need to update the row
            const userRowContents = userRowData.data;
            for (const colKey in this.cols) {
                const cellData = this.cols[colKey];
                userRowContents[cellData.colId] = cellData.colValue;
            }
            // I think the slow getRange is unavoidable, since we need a Range
            // object to actually update the row.
            sheet.getRange(userRowData.index + 1, 1, 1, userRowContents.length).setValues([userRowContents]);
        }
        // Update data and cache
        this.refreshDataAndCache();
        // Get row value from DB and return as a sanity check
        const userRows = {};
        const userRow = this.rowQueryContents(this.userId);
        if (userRow === undefined)
            return ContentService.createTextOutput(`Failed to insert row for user: ${this.userId}`);
        userRows[this.userId] = this.formatUser(userRow);
        const resp = ContentService.createTextOutput(JSON.stringify(userRows));
        resp.setMimeType(ContentService.MimeType.JSON);
        return resp;
    }
    validate() {
        if (this.event.parameter.userId === undefined)
            return ContentService.createTextOutput("Error parsing query parameters for endpoint `upsertOneStatus`. Please pass a query parameter `userId`");
        this.userId = this.event.parameter.userId;
        // Now pull headers from the other parameters
        const headings = this.data[0];
        for (const parametersKey in this.event.parameter) {
            let index;
            if (parametersKey === "userId" || parametersKey === "endpoint")
                continue;
            else if ((index = headings.indexOf(parametersKey)) !== -1)
                this.cols[parametersKey] = {
                    colId: index,
                    colValue: this.event.parameter[parametersKey]
                };
            else
                return ContentService.createTextOutput(`Error parsing query parameters for endpoint \`upsertOneStatus\`. Could not find a column header named \`${parametersKey}\``);
        }
        this.numHeadings = this.countNumHeadings(this.data[0]);
        return true;
    }
}
