import { GetHandler } from "../Types";
export class getManyStatus extends GetHandler {
    process() {
        if (this.userIds === undefined)
            return ContentService.createTextOutput("Error parsing query parameters for endpoint `getAllStatus`. Please pass one or more query parameters with name `userId`");
        const userRows = {};
        for (const userId of this.userIds) {
            const userRow = this.rowQueryContents(userId);
            if (userRow === undefined)
                return ContentService.createTextOutput(`Could not find userId: ${userId}`);
            userRows[userId] = this.formatUser(userRow);
        }
        const resp = ContentService.createTextOutput(JSON.stringify(userRows));
        resp.setMimeType(ContentService.MimeType.JSON);
        return resp;
    }
    validate() {
        if (this.event.parameter.userId === undefined)
            return ContentService.createTextOutput("Error parsing query parameters for endpoint `getManyStatus`. Please" +
                " pass one or more query parameters with name `userId`");
        this.userIds = this.event.parameters.userId;
        return true;
    }
}
