const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000/`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

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

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
    INSERT INTO todo (id, todo, priority, status)
    VALUES (${id}, '${todo}', '${priority}', '${status}');
    `;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");

  app.put("/todos/:todoId/", async (request, response) => {
    const { todoId } = request.params;
    const requestBody = request.body;
    let updateColumn = "";

    switch (true) {
      case requestBody.status !== undefined:
        updateColumn = "Status";
        break;
      case requestBody.priority !== undefined:
        updateColumn = "Priority";
        break;
      case requestBody.todo !== undefined:
        updateColumn = "Todo";
        break;
    }

    const previousTodoQuery = `
  SELECT * FROM todo WHERE id = ${todoId};`;
    const previousTodo = await db.get(previousTodoQuery);

    const updateTodoQuery = `
  UPDATE todo 
  SET 
  todo = '${todo}',
  priority = '${priority},
  status = '${status}'
  WHERE id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send(`${updateColumn} updated`);
});

app.delete("/todos/:todoId/", async(request,response) => {
    const { todoId } = request.params;
    const deleteTodoQuery = 
    ` DELETE * FROM todo WHERE id = ${todoId};`;
    await db.run(deleteTodoQuery);
    response.send("Todo Deleted")
});
module.exports = app;