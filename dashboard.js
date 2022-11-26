const express = require("express");
const router = express.Router()
const auth = require("./middlewares");
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

const log = console.log

router.patch("/editNote/:id", auth(), async (req, res) => {
  log("note after upd=");
  const data = req.body;
  const created = new Date();
  try {
    const note = await knex("notes").where({ id: data.id }).update({
      title: data.title,
      note: data.text,
      time_created: created,
    });
    log("note after upd=", note);

    res.sendStatus(204)
    //.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

router.delete("/delete/:id", auth(), async (req, res) => {
  try {
    const deletedNote = await knex("notes").where({ id: req.params.id }).del();
    log("deletedNote=", deletedNote);
    res.sendStatus(204)
    //.redirect("..");
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

const getNotes = async (userId) => {
  const result = await knex("notes")
    .select("id as _id", "time_created as created", "title as title", "note as text", "isArchived as isArchived")
    .where({ user_id: userId })
    .andWhere("isArchived", "!=", "true");
  // .then((results) => results);
  return result;
};

router.get("/", auth(), async (req, res) => {
  const notes = await getNotes(req.user.id);
  // log("req.user.username=", req.user.username);
  res.render("dashboard", { username: req.user.username, userId: req.user.id, entries: notes });
});

router.get("/getNotes", auth(), async (req, res) => {
  try {
    let age = req.query.age;
    const end = new Date();
    let begin = new Date();


    if (age === "1month") {
      begin.setMonth(begin.getMonth() - 1);
      begin.setDate(0);
    }
    if (age === "3month") {
      begin.setMonth(begin.getMonth() - 3);
      begin.setDate(0);
    }
    const search = req.query.search;
    const countNote = req.query.page * 20;
    log("page=", countNote);
    const notes = await knex("notes")
      .select("id as _id", "time_created as created", "title", "note as html", "isArchived")
      .limit(countNote)
      .orderBy("time_created", "desc")
      .where({
        user_id: req.user.id,
      })
      .where((qb) => {
        if (age === "1month" || age === "3month") {
          qb.where("time_created", ">", begin).andWhere("time_created", "<", end).andWhere("isArchived", "=", "false");
        }
        if (age === "archive") {
          qb.where("isArchived", "=", "true");
        }
      });
    // .then((results) => results);
    res.send(notes);
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

router.delete("/deleteAll", auth(), async (req, res) => {
  try {
    const deletedNote = await knex("notes").where({ user_id: req.user.id }).andWhere("isArchived", "=", "true").del();
    log("deletedNote=", deletedNote);
    res.status(200).redirect("..");
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

router.post("/newNotes", auth(), async (req, res) => {
  const data = req.body;

  try {
    //const writeNewNotes =
    const created = new Date();
    await knex("notes").insert({
      // id: 6,
      user_id: req.user.id,
      note: data.note,
      time_created: created,
      title: data.title,
    });
    const result = await knex("notes")
      .select("id as _id", "time_created as created", "title", "note as html", "isArchived")
      .where({ time_created: created });
    log("newnote=", result);
    res.status(200).send(result[0]);
    //res.redirect('/dashboard')  //08 11 2022
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }

  // res.redirect("/dashboard")
  // return res.status(200)
});

router.post("/archive", auth(), async (req, res) => {
  const data = req.body;
  log("data=", data);
  try {
    await knex("notes").where({ id: data.id }).update({
      isArchived: true,
    });
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

router.post("/unarchive", auth(), async (req, res) => {
  const data = req.body;
  log("data=", data);
  try {
    await knex("notes").where({ id: data.id }).update({
      isArchived: false,
    });
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

const getOneNote = async (noteId) => {
  const oneNote = await knex("notes")
    .select("id as _id", "time_created as created", "title as title", "note as text", "isArchived as isArchived")
    .where({ id: noteId })
    .then((result) => result);
  return oneNote;
};

router.get("/note/:id", auth(), async (req, res) => {
  const note = await getOneNote(req.params.id);
  log("note=", note);
  res.status(200).cookie("sessionId", req.cookies["sessionId"]).send(note[0]);
  // res.render("NoteEdit", { params: note })
});
module.exports = router;
