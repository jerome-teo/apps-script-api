import { getAllStatus } from "./DoGetHandlers/getAllStatus";
import { getManyStatus } from "./DoGetHandlers/getManyStatus";
import { getOneStatus } from "./DoGetHandlers/getOneStatus";
import { CleanedData, GetHandler, PostHandler } from "./Types";
import { upsertOneStatus } from "./DoPostHandlers/upsertOneStatus";
import { insertOneStatus } from "./DoPostHandlers/insertOneStatus";

const ID_COLUMN = 0;

function testDoGet() {
  const resp = doGet({
    parameter: {
      endpoint: "getAllStatus"
    }
  })

  console.log(resp.getContent())
}

function test() {
  testDoGet();
}

/// Validate things, then return the requested data
function doGet(
  event: GoogleAppsScript.Events.DoGet,
): GoogleAppsScript.Content.TextOutput {
  // Check that we got the parameter we need
  if (event.parameter === undefined || event.parameter.endpoint === undefined)
    return ContentService.createTextOutput(
      "Error parsing query parameters. Please pass a query parameter `endpoint` set to either `getOneStatus`, `getManyStatus`, or `getAllStatus`.",
    );

  let getHandler: GetHandler;

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
      return ContentService.createTextOutput(
        "Error parsing query parameters. Please ensure query parameter`endpoint` is set to either `getOneStatus`, `getManyStatus`, or `getAllStatus`.",
      );
  }

  // Validate the query parameters
  const validateResult = getHandler.validate();
  if (validateResult !== true) return validateResult;

  // Process the data
  return getHandler.process();
}

function doPost(
  event: GoogleAppsScript.Events.DoPost,
): GoogleAppsScript.Content.TextOutput {
  // Check that we got the parameter we need
  if (event.parameter === undefined || event.parameter.endpoint === undefined)
    return ContentService.createTextOutput(
      "Error parsing query parameters. Please pass a query parameter" +
        " `endpoint` set to `upsertOneStatus`, `insertOneStatus.`",
    );

  let postHandler: PostHandler;
  let data: CleanedData;
  try {
    data = JSON.parse(event.postData.contents);
  } catch {
    data = {};
  }


  switch (event.parameter.endpoint) {
    case "upsertOneStatus":
      postHandler = new upsertOneStatus(ID_COLUMN, data);
      break;
    case 'insertOneStatus':
      postHandler = new insertOneStatus(ID_COLUMN, data);
      break;
    default:
      return ContentService.createTextOutput(
        "Error parsing query parameters. Please pass a query parameter" +
        " `endpoint` set to `upsertOneStatus`, `insertOneStatus.`",
      );
  }

  // Validate the query parameters
  const validateResult = postHandler.validate();
  if (validateResult !== true) return validateResult;

  // Process the data
  return postHandler.process();
}
