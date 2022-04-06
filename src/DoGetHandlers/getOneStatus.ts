import { GetHandler, LooselyTypedObject } from "../Types";

export class getOneStatus extends GetHandler {
  private userId: string | undefined;

  process(): GoogleAppsScript.Content.TextOutput {
    if (this.userId === undefined)
      return ContentService.createTextOutput(
        "Error parsing query parameter for endpoint `getOneStatus`. Please pass a query parameter with name `userId`",
      );

    const userRows: LooselyTypedObject = {};
    const userRow = this.rowQueryContents(this.userId);
    if (userRow === undefined)
      return ContentService.createTextOutput(
        `Could not find userId: ${this.userId}`,
      );
    userRows[this.userId] = this.formatUser(userRow);

    const resp = ContentService.createTextOutput(JSON.stringify(userRows));
    resp.setMimeType(ContentService.MimeType.JSON);

    return resp;
  }

  validate(): GoogleAppsScript.Content.TextOutput | true {
    if (this.event.parameter.userId === undefined)
      return ContentService.createTextOutput(
        "Error parsing query parameters for endpoint `getAllStatus`. Please pass a query parameter `userId`",
      );
    this.userId = this.event.parameter.userId;
    return true;
  }
}
