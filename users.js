const bodyParser = require("body-parser"); // для расшифровки urlen code отправляемой формы по сабмит
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const log = console.log;
const auth = require("./middlewares");
const express = require("express");
const router = express.Router()
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


const hash = async (d) => {
  const salt = await bcrypt.genSalt(6);
  const hashed = await bcrypt.hash(d, salt).then((res) => res);
  console.log("hashed=", hashed);
  return hashed;
};

const createSession = async (userId, tokenId) => {
  const sessionID = nanoid();
  await knex("sessions").insert({
    user_id: userId,
    session_id: sessionID,
    token_id: tokenId,
  });
  return sessionID;
};

const deleteSession = async (sessionId) => {
  await knex("sessions").where({ session_id: sessionId }).del();
};

const createNewUser = async (username, password) => {
  const passwordHash = await hash(password);
  const newUser = {
    username,
    password: passwordHash,
  };

  await knex("users").insert({
    // id: newUser.id,
    username: newUser.username,
    password: newUser.password,
  });
  const newUserServer = await knex("users")
    // .first("id")
    .where({ username: newUser.username })
    .limit(1)
    .then((results) => results[0]);
  log("newUserServer=", newUserServer);
  return newUserServer;
};

const findUserByUsername = async (username) => {
  try {
    const user = await knex("users")
      .select()
      .where({ username })
      .limit(1)
      .then((result) => {
        return result[0];
      });
    return user;
  } catch (error) {
    console.error(error.message);
  }
};



router.post("/login", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  const user = await findUserByUsername(username);
  const validPassword = await bcrypt.compare(password, user.password);
  log("user=", user);
  if (!user || !validPassword) {
    return res.redirect("/?authError=true");
  }

  const token = nanoid();
  const sessionId = await createSession(user.id, token);

  res.cookie("sessionId", sessionId, { httpOnly: true, maxAge: 100000 }).redirect("/dashboard"); //?user=${user.username}&token=${token}
});

router.post("/signup", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  const user = await findUserByUsername(username);
  if (user) {
    return res.redirect("/?authError=true");
  }
  const newUser = await createNewUser(username, password);
  console.log("newUser=", newUser);
  const sessionId = await createSession(newUser.id);
  // req.user = user;
  res.cookie("sessionId", sessionId, { httpOnly: true }).redirect("/dashboard"); //maxAge: 100000
});

router.get("/logout", auth(), async (req, res) => {
  if (!req.user) {
    return res.redirect("/");
  }
  await deleteSession(req.sessionId);
  log("req.sessionId=", req.sessionId);
  res.clearCookie("sessionId").redirect("/");
});

module.exports = router;
