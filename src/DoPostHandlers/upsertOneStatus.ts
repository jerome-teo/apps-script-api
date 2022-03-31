import {LooselyTypedObject, PostHandler} from "../Types";

interface Columns {
  [key: string]: {
    colId: number
    colName: string
  }
}

// noinspection UnnecessaryContinueJS
export class upsertOneStatus extends PostHandler {
  private userId: string | undefined;
  private readonly cols: Columns;
  private numHeadings: number | undefined;

  constructor(
      ID_COLUMN: number | undefined,
      event: GoogleAppsScript.Events.DoGet,
  ) {
    super(ID_COLUMN, event);
    this.cols = {}
  }

  process(): GoogleAppsScript.Content.TextOutput {
    if (this.userId === undefined)
      return ContentService.createTextOutput(
          "Error parsing query parameter for endpoint `upsertOneStatus`. Please pass a query parameter with name `userId`",
      );

    if (this.numHeadings === undefined)
      return ContentService.createTextOutput(
          "Internal error counting number of headings. Please ensure nothing" +
          " weird is happening...`",
      );

    // Check if we can find this row
    let userRowIndex = this.rowQueryIndex(this.userId);
    const sheet = SpreadsheetApp.getActiveSheet();
    if (userRowIndex === undefined) {
      // Need to create row
      sheet.appendRow([
        this.userId,
        ...Array<string>(this.numHeadings - 2).fill("false")
      ])
    }

    // Now, find the index of the row we just created
    userRowIndex = this.rowQueryIndex(this.userId);
    // If it's undefined, scream and shout cause we just fucked up
    if (userRowIndex === undefined)
      return ContentService.createTextOutput(
          `Failed to insert row for user: ${this.userId}`,
      );
    // Now update the given row
    for (const colKey in this.cols) {
      const colData = this.cols[colKey]
      sheet.getRange(userRowIndex + 1, colData.colId + 1).setValue(colData.colName)
    }

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
    if (this.event.parameter.userId === undefined)
      return ContentService.createTextOutput(
          "Error parsing query parameters for endpoint `upsertOneStatus`. Please pass a query parameter `userId`",
      );
    this.userId = this.event.parameter.userId;

    // Now pull headers from the other parameters
    const data = SpreadsheetApp.getActiveSheet().getRange(1, 1, 1, 50).getValues();
    const headings = data[0];

    for (const parametersKey in this.event.parameter) {
      let index: number;
      if (parametersKey === "userId" || parametersKey === "endpoint")
        continue;
      else if ((index = headings.indexOf(parametersKey)) !== -1)
        this.cols[parametersKey] = {
          colId: index,
          colName: this.event.parameter[parametersKey]
        }
      else
        return ContentService.createTextOutput(
            `Error parsing query parameters for endpoint \`upsertOneStatus\`. Could not find a column header named \`${parametersKey}\``,
        );
    }

    return true;
  }
}
