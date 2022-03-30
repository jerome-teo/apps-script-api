import { parameter_t, GetHandler, LooselyTypedObject } from "./Types";

export class getAllStatus extends GetHandler {
  process(): GoogleAppsScript.Content.TextOutput {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();

    const userRows: LooselyTypedObject = {};
    
    for (var i = 1; i < data.length; i++) {
      userRows[data[i][this.id_column]] = this.formatUser(data[i])
    }

    const resp = ContentService.createTextOutput(JSON.stringify(userRows));
    resp.setMimeType(ContentService.MimeType.JSON);

    return resp;
  }
  
  Validate(): GoogleAppsScript.Content.TextOutput | true {
    return true;
  }
}
