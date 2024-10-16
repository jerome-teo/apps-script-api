import {CleanedData, LooselyTypedObject, PostHandler} from "../Types";

interface Columns {
  [key: string]: {
    colId: number
    colValue: string
  }
}

// noinspection UnnecessaryContinueJS
export class upsertOneStatus extends PostHandler {
  private userId: string | undefined;
  private readonly cols: Columns;
  private numHeadings: number | undefined;

  constructor(
      ID_COLUMN: number | undefined,
      requestBody: CleanedData,
  ) {
    super(ID_COLUMN, requestBody);
    this.cols = {}
  }

  process(): GoogleAppsScript.Content.TextOutput {
    if (this.userId === undefined)
      return ContentService.createTextOutput(
          "Bad request for endpoint `upsertOneStatus`: Please provide a `userId`.",
      );

    if (this.numHeadings === undefined)
      return ContentService.createTextOutput(
          "Internal error counting number of headings. Please ensure nothing" +
          " weird is happening...",
      );

    // Check if we can find this row
    const userRowData = this.rowQuery(this.userId);
    const sheet = SpreadsheetApp.getActiveSheet();
    if (userRowData === undefined) {
      // Need to create row, then append it

      // Create row...
      const colData = [
        this.userId,
        ...Array<string>(this.numHeadings - 2).fill("false")
      ]
      for (const colKey in this.cols) {
        const col = this.cols[colKey];
        colData[col.colId] = col.colValue;
      }

      // Now append row
      sheet.appendRow(colData);
    } else {
      // Just need to update the row
      const userRowContents: unknown[] = userRowData.data;
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
    const userRows: LooselyTypedObject = {};
    const userRow = this.rowQueryContents(this.userId);
    if (userRow === undefined)
      return ContentService.createTextOutput(
          `Failed to insert row for user: ${this.userId}`,
      );
    userRows[this.userId] = this.formatUser(userRow);

    const resp = ContentService.createTextOutput(JSON.stringify(userRows));
    resp.setMimeType(ContentService.MimeType.JSON);

    return resp;
  }

  validate(): GoogleAppsScript.Content.TextOutput | true {
    if (this.requestBody.userId === undefined)
      return ContentService.createTextOutput(
          "Bad request for endpoint `upsertOneStatus`: Please provide a `userId`.",
      );
    this.userId = this.requestBody.userId;

    // Now pull headers from the other parameters
    const headings = this.data[0];

    for (const parametersKey in this.requestBody) {
      let index: number;
      if (parametersKey === "userId")
        continue;
      else if ((index = headings.indexOf(parametersKey)) !== -1)
        this.cols[parametersKey] = {
          colId: index,
          colValue: this.requestBody[parametersKey]
        }
      // We simply ignore any data in the request body that doesn't match any columns
    }

    this.numHeadings = this.countNumHeadings(this.data[0])

    return true;
  }
}
