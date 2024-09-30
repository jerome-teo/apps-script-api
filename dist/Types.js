export function hasToString(obj) {
    return obj.toString !== undefined
        && typeof obj.toString === "function";
}
class RequestHandler {
    constructor(ID_COLUMN) {
        if (ID_COLUMN !== undefined)
            this.id_column = ID_COLUMN;
        else
            this.id_column = 0;
        this.data = this.getData();
    }
    // Must be called anytime we write to the database to be sure we have the
    // latest version
    refreshDataAndCache(sheet = undefined) {
        const cache = CacheService.getScriptCache();
        if (sheet === undefined)
            sheet = SpreadsheetApp.getActiveSheet();
        const data = sheet.getDataRange().getValues();
        cache.put("sheetData", JSON.stringify(data), 21600 /* 6 hours */);
        this.data = data;
    }
    getData(sheet = undefined) {
        const cache = CacheService.getScriptCache();
        const cached = cache.get("sheetData");
        // // Check if it's cached
        // if (cached !== null) {
        //   return JSON.parse(cached) as unknown[][];
        // }
        // If not, refresh the data
        if (sheet === undefined)
            sheet = SpreadsheetApp.getActiveSheet();
        const data = sheet.getDataRange().getValues();
        cache.put("sheetData", JSON.stringify(data), 21600 /* 6 hours */);
        return data;
    }
    // Combines both row queries to get all information about a row
    rowQuery(id) {
        for (let i = 1; i < this.data.length; i++) {
            const this_id = this.data[i][this.id_column];
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
    rowQueryContents(id) {
        for (let i = 1; i < this.data.length; i++) {
            const this_id = this.data[i][this.id_column];
            if (hasToString(this_id) && id === this_id.toString()) {
                return this.data[i];
            }
        }
        return undefined;
    }
    // Get a row (content) from the sheet based on a query
    rowQueryIndex(id) {
        for (let i = 1; i < this.data.length; i++) {
            const this_id = this.data[i][this.id_column];
            if (hasToString(this_id) && id === this_id.toString()) {
                return i;
            }
        }
        return undefined;
    }
    // Return a row as a string object
    formatUser(rowData) {
        const headings = this.data[0];
        // Count the number of headings we have before we hit a blank
        const read_headings_count = this.countNumHeadings(headings);
        const user = {};
        for (let i = 0; i < read_headings_count; i++) {
            const this_heading = headings[i];
            if (!hasToString(this_heading))
                continue;
            const headingName = this_heading.toString();
            const this_heading_data = rowData[i];
            if (!hasToString(this_heading_data))
                continue;
            user[headingName] = this_heading_data.toString();
        }
        return user;
    }
    // Count the number of headings
    countNumHeadings(headings) {
        let read_headings_count = 0;
        for (const heading of headings) {
            if (heading !== "")
                read_headings_count++;
            else
                break;
        }
        return read_headings_count;
    }
}
export class GetHandler extends RequestHandler {
    constructor(ID_COLUMN, event) {
        super(ID_COLUMN);
        this.event = event;
    }
}
export class PostHandler extends RequestHandler {
    constructor(ID_COLUMN, event) {
        super(ID_COLUMN);
        this.event = event;
    }
}
