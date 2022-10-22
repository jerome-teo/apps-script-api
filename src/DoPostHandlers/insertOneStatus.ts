import { PostHandler } from "../Types";

interface Columns {
  [key: string]: {
    colId: number;
    colValue: string;
  };
}

// noinspection UnnecessaryContinueJS
export class insertOneStatus extends PostHandler {
  private userId: string | undefined;
  private readonly cols: Columns;
  private numHeadings: number | undefined;

  constructor(
    ID_COLUMN: number | undefined,
    event: GoogleAppsScript.Events.DoGet,
  ) {
    super(ID_COLUMN, event);
    this.cols = {};
  }

  process(): GoogleAppsScript.Content.TextOutput {
    if (this.userId === undefined)
      return ContentService.createTextOutput(
        "Error parsing query parameter for endpoint `insertOneStatus`. Please pass a query parameter with name `userId`",
      );

    if (this.numHeadings === undefined)
      return ContentService.createTextOutput(
        "Internal error counting number of headings. Please ensure nothing" +
          " weird is happening...",
      );

    // Check if we can find this row
    const sheet = SpreadsheetApp.getActiveSheet();
    // Need to create row, then append it

    // Create row...
    const colData = [
      this.userId,
      ...Array<string>(this.numHeadings - 2).fill("false"),
    ];
    for (const colKey in this.cols) {
      const col = this.cols[colKey];
      colData[col.colId] = col.colValue;
    }

    // Now append row
    sheet.appendRow(colData);

    // Update data and cache
    this.refreshDataAndCache();

    const resp = ContentService.createTextOutput("true");
    resp.setMimeType(ContentService.MimeType.TEXT);

    return resp;
  }

  validate(): GoogleAppsScript.Content.TextOutput | true {
    if (this.event.parameter.userId === undefined)
      return ContentService.createTextOutput(
        "Error parsing query parameters for endpoint `upsertOneStatus`. Please pass a query parameter `userId`",
      );
    this.userId = this.event.parameter.userId;

    // Now pull headers from the other parameters
    const headings = this.data[0];

    for (const parametersKey in this.event.parameter) {
      let index: number;
      if (parametersKey === "userId" || parametersKey === "endpoint") continue;
      else if ((index = headings.indexOf(parametersKey)) !== -1)
        this.cols[parametersKey] = {
          colId: index,
          colValue: this.event.parameter[parametersKey],
        };
      else
        return ContentService.createTextOutput(
          `Error parsing query parameters for endpoint \`upsertOneStatus\`. Could not find a column header named \`${parametersKey}\``,
        );
    }

    this.numHeadings = this.countNumHeadings(this.data[0]);

    return true;
  }
}
