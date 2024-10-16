# Google Sheets Database Thing

Wowza! This is slick - it allows for using a google sheet as the backing store simple CRUD API. For free!!

## Setup

1. Make a new sheet
2. Go to `Extensions`, click on `Apps Script` to start that up
3. Update the `scriptId` in the `.clasp.json` to the id in the google apps script doc (for a url like `https://script.google.com/u/2/home/projects/1yteNy5xoEGLJCZmgJ78Z31MdAMmEbDtRnEdsfG9qOKiT6FrjRP154axS/edit`, it's the `1yteNy5xoEGLJCZmgJ78Z31MdAMmEbDtRnEdsfG9qOKiT6FrjRP154axS` part!)
3. Sign into clasp - `npx clasp login`
    1. Choose the account that owns the sheet, go through the oauth thing
4. Enable the Apps Script API for the account - `https://script.google.com/home/usersettings`, flip that to `on` 
5. `npm run build`, then `npm run deploy` to push the code to the apps script server
6. Go back to the apps script document. Reload and ensure the code is present
7. Hit the blue `Deploy` button in the top right:
    1. Ensure `Web App` is the mode
    2. Give it a description
    3. Hit `Deploy`
    4. Copy the web app URL on the next page, that's what you need to use!!!


## Docs

There is only 1 url endpoint available, it's at the URL google apps gives you. It accepts POST or GET requets. The requested functionality is controled by the `endpoint` query parameter

---

### GET

`GET` requests are handled by `Code.ts::doGet()`

#### Endpoints:
(`endpoint` parameter controls which logical endpoint we hit)
1. `getOneStatus` - get the status of one field by ID  
1. `getManyStatus` - get the status of many fields by a list of IDs
1. `getAllStatus` - return all data from the databse

#### `getOneStatus`
Gets the status of one row by its ID

**Params**:
* `userId` (one required) - the user ID we want to request

#### `getManyStatus` 
Get the status of many fields by multiple IDs

**Params**:
* `userId` (one or many required) - the user ID (or IDs) we want to request

#### `getAllStatus`
Gets the status of all rows from the databse

No params, always returns all rows

---

### POST

`POST` requests are handled by `Code.ts::doPost()`

#### Endpoints:
(`endpoint` parameter controls which logical endpoint we hit)
1. `upsertOneStatus` - Update or insert a new row based on user id
1. `insertOneStatus` - Insert a new row based on user ID

#### `upsertOneStatus`
Update or insert a new row based on user ID and the elements on the first row of the database

**Request body**
* `userId` - the userID of the row we're inserting or updating
* `[heading name]` - provide header names in the request body


#### `insertOneStatus`
Insert a new row based on user ID and the elements on the first row of the database

**Request body**
* `userId` - the userID of the row we're inserting
* `[heading name]` - provide header names in the request body