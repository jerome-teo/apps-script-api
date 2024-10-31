import { CleanedData, PostHandler } from "../Types";

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
    requestBody: CleanedData,
  ) {
    super(ID_COLUMN, requestBody);
    this.cols = {};
  }

  process(): string {
    if (this.userId === undefined)
      return JSON.stringify({
        error: "Bad request for endpoint `insertOneStatus`: Please provide a `userId`.",
      });

    if (this.numHeadings === undefined)
      return JSON.stringify({
        error: "Internal error counting number of headings. Please ensure nothing" +
          " weird is happening...",
      });

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

    return JSON.stringify({
      success: true
    });
  }

  validate(): string | true {
    if (this.requestBody.userId === undefined)
      return JSON.stringify({
        error: "Bad request for endpoint `insertOneStatus`: Please provide a `userId`.",
      });
    this.userId = this.requestBody.userId;

    // Now pull headers from the other parameters
    const headings = this.data[0];

    for (const parametersKey in this.requestBody) {
      let index: number;
      if (parametersKey === "userId") continue;
      else if ((index = headings.indexOf(parametersKey)) !== -1)
        this.cols[parametersKey] = {
          colId: index,
          colValue: this.requestBody[parametersKey],
        };
        // We simply ignore the data in the request body that doesn't match any column
    }

    this.numHeadings = this.countNumHeadings(this.data[0]);

    return true;
  }
}
