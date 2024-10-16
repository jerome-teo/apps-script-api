export type parameter_t = { [key: string]: string };

export interface StringObject {
  [key: string]: string;
}

export interface CleanedData {
  [key: string]: any;
}

export interface LooselyTypedObject {
  [key: string]: StringObject;
}

export interface IToString {
  toString(): string;
}

export interface RowQueryResult {
  index: number;
  data: unknown[];
}

export function hasToString(obj: unknown): obj is IToString {
  return (obj as IToString).toString !== undefined
      && typeof (obj as IToString).toString === "function";
}

abstract class RequestHandler {
  id_column: number;
  data: unknown[][];

  protected constructor(ID_COLUMN: number | undefined) {
    if (ID_COLUMN !== undefined) this.id_column = ID_COLUMN;
    else this.id_column = 0;
    this.data = this.getData();
  }

  // Must be called anytime we write to the database to be sure we have the
  // latest version
  refreshDataAndCache(sheet: GoogleAppsScript.Spreadsheet.Sheet | undefined = undefined): void {
    const cache = CacheService.getScriptCache();

    if (sheet === undefined) sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues() as never[][];
    cache.put("sheetData", JSON.stringify(data), 21600 /* 6 hours */);
    this.data = data;
  }


  getData(sheet: GoogleAppsScript.Spreadsheet.Sheet | undefined = undefined): unknown[][] {
    const cache = CacheService.getScriptCache();
    const cached = cache.get("sheetData");

    // // Check if it's cached
    // if (cached !== null) {
    //   return JSON.parse(cached) as unknown[][];
    // }

    // If not, refresh the data
    if (sheet === undefined) sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues() as unknown[][]
    cache.put("sheetData", JSON.stringify(data), 21600 /* 6 hours */);
    return data;
  }

  // Combines both row queries to get all information about a row
  rowQuery(id: string): RowQueryResult | undefined {
    for (let i = 1; i < this.data.length; i++) {
      const this_id = this.data[i][this.id_column]
      if (hasToString(this_id) && id === this_id.toString()) {
        return {
          index: i,
          data: this.data[i]
        };
      }
    }
    return undefined;
  }

  // Get a row (content) from the sheet based on a query
  rowQueryContents(id: string): unknown[] | undefined {
    for (let i = 1; i < this.data.length; i++) {
      const this_id = this.data[i][this.id_column]
      if (hasToString(this_id) && id === this_id.toString()) {
        return this.data[i];
      }
    }
    return undefined;
  }

  // Get a row (content) from the sheet based on a query
  rowQueryIndex(id: string): number | undefined {
    for (let i = 1; i < this.data.length; i++) {
      const this_id = this.data[i][this.id_column];
      if (hasToString(this_id) && id === this_id.toString()) {
        return i;
      }
    }
    return undefined;
  }

  // Return a row as a string object
  formatUser(rowData: unknown[]): StringObject {
    const headings = this.data[0];

    // Count the number of headings we have before we hit a blank
    const read_headings_count = this.countNumHeadings(headings);

    const user: StringObject = {};
    for (let i = 0; i < read_headings_count; i++) {
      const this_heading = headings[i];
      if (!hasToString(this_heading))
        continue
      const headingName = this_heading.toString();

      const this_heading_data = rowData[i];
      if (!hasToString(this_heading_data))
        continue
      user[headingName] = this_heading_data.toString();
    }
    return user;
  }

  // Count the number of headings
  countNumHeadings(headings: unknown[]): number {
    let read_headings_count = 0;
    for (const heading of headings) {
      if (heading !== "") read_headings_count++;
      else break;
    }
    return read_headings_count;
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
  requestBody: CleanedData;

  constructor(
      ID_COLUMN: number | undefined,
      requestBody: CleanedData,
  ) {
    super(ID_COLUMN);
    this.requestBody = requestBody;
  }

  abstract validate(): GoogleAppsScript.Content.TextOutput | true;

  abstract process(): GoogleAppsScript.Content.TextOutput;
}
