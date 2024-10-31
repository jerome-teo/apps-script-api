import { GetHandler, LooselyTypedObject } from "../Types";

export class getOneStatus extends GetHandler {
  private userId: string | undefined;

  process(): string {
    if (this.userId === undefined)
      return JSON.stringify({
        error: "Error parsing query parameter for endpoint `getOneStatus`. Please pass a query parameter with name `userId`",
      });

    const userRows: LooselyTypedObject = {};
    const userRow = this.rowQueryContents(this.userId);
    if (userRow === undefined)
      return JSON.stringify({
        error: `Could not find userId: ${this.userId}`,
      });
    userRows[this.userId] = this.formatUser(userRow);

    return JSON.stringify(userRows);
  }

  validate(): string | true {
    if (this.event.parameter.userId === undefined)
      return JSON.stringify({
        error: "Error parsing query parameters for endpoint `getAllStatus`. Please pass a query parameter `userId`",
      });
    this.userId = this.event.parameter.userId;
    return true;
  }
}
