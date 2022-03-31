const SHEET_ID = "0";
const ID_COLUMN = 0;
import { getAllStatus } from "./getAllStatus";
import { getManyStatus } from "./getManyStatus";
import { getOneStatus } from "./getOneStatus";
import { GetHandler } from "./Types";

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
  const validateResult = getHandler.Validate();
  if (validateResult !== true) return validateResult;

  // Process the data
  return getHandler.process();
}