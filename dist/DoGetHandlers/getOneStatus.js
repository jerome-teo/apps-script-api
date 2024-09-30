import { GetHandler } from "../Types";
export class getOneStatus extends GetHandler {
    process() {
        if (this.userId === undefined)
            return ContentService.createTextOutput("Error parsing query parameter for endpoint `getOneStatus`. Please pass a query parameter with name `userId`");
        const userRows = {};
        const userRow = this.rowQueryContents(this.userId);
        if (userRow === undefined)
            return ContentService.createTextOutput(`Could not find userId: ${this.userId}`);
        userRows[this.userId] = this.formatUser(userRow);
        const resp = ContentService.createTextOutput(JSON.stringify(userRows));
        resp.setMimeType(ContentService.MimeType.JSON);
        return resp;
    }
    validate() {
        if (this.event.parameter.userId === undefined)
            return ContentService.createTextOutput("Error parsing query parameters for endpoint `getAllStatus`. Please pass a query parameter `userId`");
        this.userId = this.event.parameter.userId;
        return true;
    }
}
