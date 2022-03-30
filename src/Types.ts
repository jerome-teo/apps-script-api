export type parameter_t = { [key: string]: string };

interface LooselyTypedRow {
  [key: string]: string;
}

export interface LooselyTypedObject {
  [key: string]: any;
}

export abstract class GetHandler {
  id_column: number;
  event: GoogleAppsScript.Events.DoGet;

  constructor(
    ID_COLUMN: number | undefined,
    event: GoogleAppsScript.Events.DoGet,
  ) {
    if (ID_COLUMN !== undefined) this.id_column = ID_COLUMN;
    else this.id_column = 0;
    this.event = event;
  }

  abstract Validate(): GoogleAppsScript.Content.TextOutput | true;

  abstract process(): GoogleAppsScript.Content.TextOutput;

  // Get a row (content) from the sheet based on a query
  rowQuery(id: string): any[] | undefined {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (id === data[i][this.id_column].toString()) {
        return data[i];
      }
    }
    return undefined;
  }

  formatUser(rowData: any[]): LooselyTypedRow {
    const data = SpreadsheetApp.getActiveSheet()
      .getRange(0, 0, 0, 6)
      .getValues();
    const headings = data[0];

    let read_headings_count = 0;

    // Count the number of headings we have before we hit a blank
    for (const heading of headings) {
      if (heading !== "") read_headings_count++;
      else break;
    }

    var user: LooselyTypedRow = {};
    for (var i = 0; i < read_headings_count; i++) {
      const headingName = headings[i].toString() as string;
      user[headingName] = rowData[i].toString() as string;
    }
    return user;
  }
}
