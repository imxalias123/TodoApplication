const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDBAndResponse = async () => {
  try {
    db = await open({
      fileName: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndResponse();

const hasStatusAndPriorityProperty = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};
const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  const { search_query = "", priority, status } = request.query;

  switch (true) {
    case hasStatusAndPriorityProperty(request.query):
      getTodoQuery = `
           SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
           AND status = '${status}'
           AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodoQuery = `
           SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
           AND status = '${status}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodoQuery = `
           SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
           AND priority = '${priority}';
           `;
      break;
    default:
      getTodoQuery = `
           SELECT * FROM todo WHERE todo LIKE '%${search_q}%' `;
  }

  data = await db.all(getTodoQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT * FROM todo WHERE 
    id = ${todoId};`;

  const data = await db.get(getTodoQuery);
  response.send(data);
});
