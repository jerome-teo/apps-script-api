import { GetHandler, LooselyTypedObject } from "../Types";

export class getAllStatus extends GetHandler {
  process(): GoogleAppsScript.Content.TextOutput {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();

    const userRows: LooselyTypedObject = {};

    for (let i = 1; i < data.length; i++) {
      userRows[data[i][this.id_column]] = this.formatUser(data[i])
    }

    const resp = ContentService.createTextOutput(JSON.stringify(userRows));
    resp.setMimeType(ContentService.MimeType.JSON);

    return resp;
  }

  validate(): GoogleAppsScript.Content.TextOutput | true {
    return true;
  }
}
