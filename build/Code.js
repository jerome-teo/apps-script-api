'use strict';

function hasToString(obj) {
  return obj.toString !== undefined && typeof obj.toString === "function";
}
class RequestHandler {
  constructor(ID_COLUMN) {
    if (ID_COLUMN !== undefined) this.id_column = ID_COLUMN; else this.id_column = 0;
    this.data = this.getData();
  }

  // Must be called anytime we write to the database to be sure we have the
  // latest version
  refreshDataAndCache(sheet = undefined) {
    const cache = CacheService.getScriptCache();
    if (sheet === undefined) sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();
    cache.put("sheetData", JSON.stringify(data), 21600 /* 6 hours */);
    this.data = data;
  }
  getData(sheet = undefined) {
    const cache = CacheService.getScriptCache();
    cache.get("sheetData");

    // // Check if it's cached
    // if (cached !== null) {
    //   return JSON.parse(cached) as unknown[][];
    // }

    // If not, refresh the data
    if (sheet === undefined) sheet = SpreadsheetApp.getActiveSheet();
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
      if (!hasToString(this_heading)) continue;
      const headingName = this_heading.toString();
      const this_heading_data = rowData[i];
      if (!hasToString(this_heading_data)) continue;
      user[headingName] = this_heading_data.toString();
    }
    return user;
  }

  // Count the number of headings
  countNumHeadings(headings) {
    let read_headings_count = 0;
    for (const heading of headings) {
      if (heading !== "") read_headings_count++; else break;
    }
    return read_headings_count;
  }
}
class GetHandler extends RequestHandler {
  constructor(ID_COLUMN, event) {
    super(ID_COLUMN);
    this.event = event;
  }
}
class PostHandler extends RequestHandler {
  constructor(ID_COLUMN, event) {
    super(ID_COLUMN);
    this.event = event;
  }
}

class getAllStatus extends GetHandler {
  process() {
    const userRows = {};
    for (let i = 1; i < this.data.length; i++) {
      const user_id = this.data[i][this.id_column];
      if (!hasToString(user_id)) return ContentService.createTextOutput(`Failed to parse the string of user ID for row ${i}, please investigate`);
      userRows[user_id.toString()] = this.formatUser(this.data[i]);
    }
    const resp = ContentService.createTextOutput(JSON.stringify(userRows));
    resp.setMimeType(ContentService.MimeType.JSON);
    return resp;
  }
  validate() {
    return true;
  }
}

class getManyStatus extends GetHandler {
  process() {
    if (this.userIds === undefined) return ContentService.createTextOutput("Error parsing query parameters for endpoint `getAllStatus`. Please pass one or more query parameters with name `userId`");
    const userRows = {};
    for (const userId of this.userIds) {
      const userRow = this.rowQueryContents(userId);
      if (userRow === undefined) return ContentService.createTextOutput(`Could not find userId: ${userId}`);
      userRows[userId] = this.formatUser(userRow);
    }
    const resp = ContentService.createTextOutput(JSON.stringify(userRows));
    resp.setMimeType(ContentService.MimeType.JSON);
    return resp;
  }
  validate() {
    if (this.event.parameter.userId === undefined) return ContentService.createTextOutput("Error parsing query parameters for endpoint `getManyStatus`. Please" + " pass one or more query parameters with name `userId`");
    this.userIds = this.event.parameters.userId;
    return true;
  }
}

class getOneStatus extends GetHandler {
  process() {
    if (this.userId === undefined) return ContentService.createTextOutput("Error parsing query parameter for endpoint `getOneStatus`. Please pass a query parameter with name `userId`");
    const userRows = {};
    const userRow = this.rowQueryContents(this.userId);
    if (userRow === undefined) return ContentService.createTextOutput(`Could not find userId: ${this.userId}`);
    userRows[this.userId] = this.formatUser(userRow);
    const resp = ContentService.createTextOutput(JSON.stringify(userRows));
    resp.setMimeType(ContentService.MimeType.JSON);
    return resp;
  }
  validate() {
    if (this.event.parameter.userId === undefined) return ContentService.createTextOutput("Error parsing query parameters for endpoint `getAllStatus`. Please pass a query parameter `userId`");
    this.userId = this.event.parameter.userId;
    return true;
  }
}

// noinspection UnnecessaryContinueJS
class upsertOneStatus extends PostHandler {
  constructor(ID_COLUMN, event) {
    super(ID_COLUMN, event);
    this.cols = {};
  }
  process() {
    if (this.userId === undefined) {
      console.log("userid null")
      return ContentService.createTextOutput("Error parsing query parameter for endpoint `upsertOneStatus`. Please pass a query parameter with name `userId`");
    }
    if (this.numHeadings === undefined) return ContentService.createTextOutput("Internal error counting number of headings. Please ensure nothing" + " weird is happening...");

    // Check if we can find this row
    //Returns dictionary with index (row number), and all contents in a row 
    const userRowData = this.rowQuery(this.userId);
    const sheet = SpreadsheetApp.getActiveSheet();
    if (userRowData === undefined) {
      // Need to create row, then append it

      // Create row...
      // const colData = [this.userId, ...Array(this.numHeadings - 2).fill("false")];
      // const colData = [];
      // for (const colKey in this.cols) {
      //   const col = this.cols[colKey];
      //   colData.push(col.colValue);
      // }
      const email = this.data.email;  // Access 'email' from the body
      const needsTravelStipend = this.data.needsTravelStipend;
      const colData = [email, needsTravelStipend];
      // Now append row
      sheet.appendRow(colData);
    } else {
      // Just need to update the row
      const userRowContents = userRowData.data;
      for (const colKey in this.cols) {
        const cellData = this.cols[colKey];
        userRowContents[cellData.colId] = cellData.colValue;
      }

      // I think the slow getRange is unavoidable, since we need a Range
      // object to actually update the row.
      sheet.getRange(userRowData.index + 1, 1, 1, userRowContents.length).setValues([userRowContents]);
    }

    // Update data and cache
    this.refreshDataAndCache();

    // Get row value from DB and return as a sanity check
    const userRows = {};
    const userRow = this.rowQueryContents(this.userId);
    if (userRow === undefined) return ContentService.createTextOutput(`Failed to insert row for user: ${this.userId}`);
    userRows[this.userId] = this.formatUser(userRow);
    const resp = ContentService.createTextOutput(JSON.stringify(userRows));
    resp.setMimeType(ContentService.MimeType.JSON).setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
      .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .setHeader('Access-Control-Allow-Credentials', 'true');
    return resp;
  }
  validate() {
    return ContentService.createTextOutput("Validate");
    console.log("Validate")
    console.log(this.data)
    if (!this.data.email) {
      return ContentService.createTextOutput("Error: Missing 'email' in body");
    }
    // if (this.event.parameter.userId === undefined) {
    //   console.log("userid null")

    //   return ContentService.createTextOutput("Error parsing query parameters for endpoint `upsertOneStatus`. Please pass a query parameter `userId`");

    // }
    // this.userId = this.event.parameter.userId;
    this.userId = this.data.email;

    // Now pull headers from the other parameters
    const headings = this.data[0];
    // for (const parametersKey in this.event.parameter) {
    //   let index;
    //   if (parametersKey === "userId" || parametersKey === "endpoint") continue; else if ((index = headings.indexOf(parametersKey)) !== -1) this.cols[parametersKey] = {
    //     colId: index,
    //     colValue: this.event.parameter[parametersKey]
    //   }; else return ContentService.createTextOutput(`Error parsing query parameters for endpoint \`upsertOneStatus\`. Could not find a column header named \`${parametersKey}\``);
    // }
    this.numHeadings = this.countNumHeadings(this.data[0]);
    if (this.numHeadings !== 2) {
      return ContentService.createTextOutput("Error: Number of headings incorrect");
    }
    return true;
  }
}

// noinspection UnnecessaryContinueJS
class insertOneStatus extends PostHandler {
  constructor(ID_COLUMN, event) {
    super(ID_COLUMN, event);
    this.cols = {};
  }
  process() {
    if (this.userId === undefined) return ContentService.createTextOutput("Error parsing query parameter for endpoint `insertOneStatus`. Please pass a query parameter with name `userId`");
    if (this.numHeadings === undefined) return ContentService.createTextOutput("Internal error counting number of headings. Please ensure nothing" + " weird is happening...");

    // Check if we can find this row
    const sheet = SpreadsheetApp.getActiveSheet();
    // Need to create row, then append it

    // Create row...
    const colData = [this.userId, ...Array(this.numHeadings - 2).fill("false")];
    for (const colKey in this.cols) {
      const col = this.cols[colKey];
      colData[col.colId] = col.colValue;
    }

    // Now append row
    sheet.appendRow(colData);

    // Update data and cache
    this.refreshDataAndCache();
    const resp = ContentService.createTextOutput("true");
    resp.setMimeType(ContentService.MimeType.TEXT);
    return resp;
  }
  validate() {
    if (!this.data.email) {
      return ContentService.createTextOutput("Error: Missing 'email' in body");
    }
    // if (this.event.parameter.userId === undefined) return ContentService.createTextOutput("Error parsing query parameters for endpoint `upsertOneStatus`. Please pass a query parameter `userId`");
    // this.userId = this.event.parameter.userId;

    // // Now pull headers from the other parameters
    // const headings = this.data[0];
    // for (const parametersKey in this.event.parameter) {
    //   let index;
    //   if (parametersKey === "userId" || parametersKey === "endpoint") continue; else if ((index = headings.indexOf(parametersKey)) !== -1) this.cols[parametersKey] = {
    //     colId: index,
    //     colValue: this.event.parameter[parametersKey]
    //   }; else return ContentService.createTextOutput(`Error parsing query parameters for endpoint \`upsertOneStatus\`. Could not find a column header named \`${parametersKey}\``);
    // }
    // this.numHeadings = this.countNumHeadings(this.data[0]);
    return true;
  }
}

const ID_COLUMN = 0;
function testDoGet() {
  const resp = doGet({
    parameter: {
      endpoint: "getAllStatus"
    }
  });
  console.log(resp.getContent());
}
function test() {
  testDoGet();
}

/// Validate things, then return the requested data
function doGet(event) {
  // Check that we got the parameter we need
  return ContentService.createTextOutput(JSON.stringify(event));

  if (event.parameter === undefined || event.parameter.endpoint === undefined) return ContentService.createTextOutput("Calling here!! Error parsing query parameters. Please pass a query parameter `endpoint` set to either `getOneStatus`, `getManyStatus`, or `getAllStatus`.");
  let getHandler;
  switch (event.parameter.endpoint) {
    case "getOneStatus":
      getHandler = new getOneStatus(ID_COLUMN, event);
      break;
    case "getManyStatus":
      getHandler = new getManyStatus(ID_COLUMN, event);
      break;
    case "getAllStatus":
      getHandler = new getAllStatus(ID_COLUMN, event);
      break;
    default:
      return ContentService.createTextOutput("This is default! Error parsing query parameters. Please ensure query parameter`endpoint` is set to either `getOneStatus`, `getManyStatus`, or `getAllStatus`.");
  }

  // Validate the query parameters
  const validateResult = getHandler.validate();
  if (validateResult !== true) return validateResult;

  // Process the data
  return getHandler.process();
}
function doPost(event) {
  // Check that we got the parameter we need
  // return ContentService.createTextOutput(JSON.stringify(event));
  // const email = event.parameter.email
  // const splitt = email.split('abc')
  // const newParam = {}
  // newParam.email = splitt[0]
  // newParam.endpoint = splitt[1]
  // newParam.userId = splitt[0]
  // event.parameter = newParam


  const data = JSON.parse(event.postData.contents); // Parse the JSON body

  const email = data.email;
  const needsTravelStipend = data.needsTravelStipend;
  const endpoint = data.endpoint;
  // return ContentService.createTextOutput(JSON.stringify(event));

  // const contents = JSON.parse(event.postData.contents)
  // event.parameter = contents
  // event.parameter.userId = contents.email

  // if (event.parameter === undefined || event.parameter.endpoint === undefined) return ContentService.createTextOutput("Error parsing query parameters. Please pass a query parameter" + " `endpoint` set to `upsertOneStatus`, `insertOneStatus.");
  let postHandler;

  switch (endpoint) {
    case "upsertOneStatus":
      postHandler = new upsertOneStatus(ID_COLUMN, event);
      break;
    case 'insertOneStatus':
      postHandler = new insertOneStatus(ID_COLUMN, event);
      break;
    default:
      return ContentService.createTextOutput("Error parsing query parameters. Please ensure query parameter`endpoint` is set to either `getOneStatus`, `getManyStatus`, or `getAllStatus`.");
  }

  // Validate the query parameters
  const validateResult = postHandler.validate();
  if (validateResult !== true) return validateResult;

  // Process the data
  return postHandler.process();
}
