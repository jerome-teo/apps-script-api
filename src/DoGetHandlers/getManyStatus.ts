import { GetHandler, LooselyTypedObject } from "../Types";

export class getManyStatus extends GetHandler {
  private userIds: string[] | undefined;

  process(): string {
    if (this.userIds === undefined)
      return JSON.stringify({
        error: "Error parsing query parameters for endpoint `getAllStatus`. Please pass one or more query parameters with name `userId`",
      });

    const userRows: LooselyTypedObject = {};
    for (const userId of this.userIds) {
      const userRow = this.rowQueryContents(userId);
      if (userRow === undefined)
        return JSON.stringify({
          error: `Could not find userId: ${userId}`,
        });
      userRows[userId] = this.formatUser(userRow);
    }
  
    return JSON.stringify(userRows);
  }

  validate(): string | true {
    if (this.event.parameter.userId === undefined)
      return JSON.stringify({
        error: "Error parsing query parameters for endpoint `getManyStatus`. Please" +
          " pass one or more query parameters with name `userId`",
      });

    this.userIds = this.event.parameters.userId;
    return true;
  }
}
