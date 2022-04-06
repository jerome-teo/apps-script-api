import {GetHandler, hasToString, LooselyTypedObject} from "../Types";

export class getAllStatus extends GetHandler {
  process(): GoogleAppsScript.Content.TextOutput {
    const userRows: LooselyTypedObject = {};

    for (let i = 1; i < this.data.length; i++) {
      const user_id = this.data[i][this.id_column]
      if (!hasToString(user_id))
        return ContentService.createTextOutput(
            `Failed to parse the string of user ID for row ${i}, please investigate`
        )
      userRows[user_id.toString()] = this.formatUser(this.data[i])
    }

    const resp = ContentService.createTextOutput(JSON.stringify(userRows));
    resp.setMimeType(ContentService.MimeType.JSON);

    return resp;
  }

  validate(): GoogleAppsScript.Content.TextOutput | true {
    return true;
  }
}
