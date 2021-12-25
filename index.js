const express = require("express");
const controller = require("./controller/controller");
const userController = require("./controller/userController");

require("./db/db");

const app = express();
app.use(express.json());
app.use(controller);
app.use(userController);

app.listen(3000, () => {
  console.log(`The server is running on port 3000...`);
});
