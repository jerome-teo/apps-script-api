export type parameter_t = { [key: string]: string };

export interface StringObject {
  [key: string]: string;
}

export interface LooselyTypedObject {
  [key: string]: StringObject;
}

abstract class RequestHandler {
  id_column: number;

  protected constructor(ID_COLUMN: number | undefined) {
    if (ID_COLUMN !== undefined) this.id_column = ID_COLUMN;
    else this.id_column = 0;
  }

  // Get a row (content) from the sheet based on a query
  rowQueryContents(id: string): any[] | undefined {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (id === data[i][this.id_column].toString()) {
        return data[i];
      }
    }
    return undefined;
  }

  // Get a row (content) from the sheet based on a query
  rowQueryIndex(id: string): number | undefined {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (id === data[i][this.id_column].toString()) {
        return i;
      }
    }
    return undefined;
  }

  formatUser(rowData: any[]): StringObject {
    const data = SpreadsheetApp.getActiveSheet()
      .getRange(1, 1, 1, 6)
      .getValues();
    const headings = data[0];

    let read_headings_count = 0;

    // Count the number of headings we have before we hit a blank
    for (const heading of headings) {
      if (heading !== "") read_headings_count++;
      else break;
    }

    const user: StringObject = {};
    for (let i = 0; i < read_headings_count; i++) {
      const headingName = headings[i].toString() as string;
      user[headingName] = rowData[i].toString() as string;
    }
    return user;
  }
}

export abstract class GetHandler extends RequestHandler {
  event: GoogleAppsScript.Events.DoGet;

  constructor(
    ID_COLUMN: number | undefined,
    event: GoogleAppsScript.Events.DoGet,
  ) {
    super(ID_COLUMN);
    this.event = event;
  }

  abstract validate(): GoogleAppsScript.Content.TextOutput | true;

  abstract process(): GoogleAppsScript.Content.TextOutput;
}

export abstract class PostHandler extends RequestHandler {
  event: GoogleAppsScript.Events.DoGet;

  constructor(
      ID_COLUMN: number | undefined,
      event: GoogleAppsScript.Events.DoGet,
  ) {
    super(ID_COLUMN);
    this.event = event;
  }

  abstract validate(): GoogleAppsScript.Content.TextOutput | true;

  abstract process(): GoogleAppsScript.Content.TextOutput;
}
