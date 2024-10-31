import {GetHandler, hasToString, LooselyTypedObject} from "../Types";

export class getAllStatus extends GetHandler {
  process(): string {
    const userRows: LooselyTypedObject = {};

    for (let i = 1; i < this.data.length; i++) {
      const user_id = this.data[i][this.id_column]
      if (!hasToString(user_id))
        return JSON.stringify({
            error: `Failed to parse the string of user ID for row ${i}, please investigate`
        })
      userRows[user_id.toString()] = this.formatUser(this.data[i])
    }

    return JSON.stringify(userRows);
  }

  validate(): string | true {
    return true;
  }
}
