import {LooselyTypedObject, PostHandler, StringObject} from "../Types";

// noinspection UnnecessaryContinueJS
export class upsertOneStatus extends PostHandler {
  private userId: string | undefined;
  private cols: StringObject = {};

  process(): GoogleAppsScript.Content.TextOutput {
    if (this.userId === undefined)
      return ContentService.createTextOutput(
          "Error parsing query parameter for endpoint `upsertOneStatus`. Please pass a query parameter with name `userId`",
      );

    // Check if we can find this row
    let userRowIndex = this.rowQueryIndex(this.userId);
    if (userRowIndex === undefined) {
      // Need to create row

    } else {
      // Need to update row

    }

    // Get row value from DB and return as a sanity check
    const userRows: LooselyTypedObject = {};
    let userRow = this.rowQueryContents(this.userId);
    if (userRow === undefined)
      return ContentService.createTextOutput(
          `Failed to insert userid: ${this.userId}`,
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
    const data = SpreadsheetApp.getActiveSheet().getRange(1, 1, 1, 6).getValues();
    const headings = data[0];

    for (const parametersKey in this.event.parameter) {
      if (headings.includes(parametersKey))
        this.cols[parametersKey] = this.event.parameter[parametersKey]
      else if (parametersKey === "userId")
        continue;
      else
        return ContentService.createTextOutput(
            `Error parsing query parameters for endpoint \`upsertOneStatus\`. Could not find a column header named \`${parametersKey}\``,
        );
    }

    return true;
  }

}
