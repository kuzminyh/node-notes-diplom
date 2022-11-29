require("dotenv").config();
const express = require("express");
const nunjucks = require("nunjucks");
const cookieParser = require("cookie-parser");
const knex = require("knex")({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
});

const log = console.log;

//const { kn } = require("date-fns/locale");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/', require("./apiUsers"))
app.use('/api', require("./apiNotes"))

app.use(express.static("public")); //мидлваре для дачи статич файлов из папки public

const auth = require("./middlewares")

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.set("view engine", "njk"); //устан св-во view engine

app.use((err, req, res, next) => {
  res.status(500).send(err.message)

})

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});

// module.exports = auth

app.get("/", (req, res) => {
  res.render("index");
});
