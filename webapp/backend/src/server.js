import Fastify from 'fastify'
import Oauth2 from '@fastify/oauth2';
import fastifyStatic from "@fastify/static";
import path from "node:path";
import dbConnector from "./db_config.js";
import fastifyView from "@fastify/view";
import ejs from "ejs";
import formbody from '@fastify/formbody'
import session from '@fastify/session';
import cookie from '@fastify/cookie';
import bcrypt from 'bcrypt';
import cors from "@fastify/cors";
import sget from 'simple-get';
import websocket from '@fastify/websocket';
import fs from 'fs';
import multipart from '@fastify/multipart';
import { pipeline } from 'node:stream/promises';
import dotenv from "dotenv";

dotenv.config();

const __dirname = import.meta.dirname;

const fastify = Fastify({
  logger: true
})

fastify.register(fastifyView, {
  engine: {
    ejs,
  },
  root: path.join(__dirname, "../views"),
  viewExt: "ejs",
  layout: "layout.ejs",
});
/**
 * Run the server!
 */
fastify.register(dbConnector);
fastify.register(websocket);
fastify.register(cookie);
fastify.register(session, {
  cookieName: 'sessionId',
  secret: 'a secret with minimum length of 32 characters',
  cookie: { maxAge: 1800000, secure: false, sameSite: "Lax" }
});
fastify.register(formbody);
fastify.register(fastifyStatic, {
  root: path.join(__dirname, ".."),
  prefix: "/",
});
fastify.register(cors), {origin: "*"};
fastify.register(Oauth2, {
  name: 'Oauth2',
  scope: ['profile'],
  credentials: {
    client: {
      id: process.env.OAUTH_ID,
      secret: process.env.OAUTH_KEY
    },
    auth: Oauth2.GOOGLE_CONFIGURATION
  },
  startRedirectPath: '/login/google',
  callbackUri: `https://localhost:8443/login/google/callback`
})
fastify.register(multipart);

var connectedSockets = [];

fastify.register(async function (fastify) {
  fastify.get('/socket', { websocket: true }, (socket, req) => {
    if (req.session.authenticated && req.session.user.google_id) {
      const index = connectedSockets.findIndex(socket => socket.name.username === req.session.user.username);
        if (index === -1) {
          connectedSockets.push({name: req.session.user, sock: socket});
          socket.send(JSON.stringify({type: 'connected'}));
        }
    }
    socket.on('message', message => {
      const data = JSON.parse(message);
      if (data.type && data.type === "login") {
        connectedSockets.push({name: data.username, sock: socket});
        socket.send(JSON.stringify({type: 'connected'}));
      } else if (data.type && data.type === "msg") {
        let sender = fastify.db.prepare("SELECT * FROM users WHERE username = ?").get(data.sender);
        let receiver = fastify.db.prepare("SELECT * FROM users WHERE username = ?").get(data.receiver);
        fastify.db.prepare("INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)").run(sender.id, receiver.id, data.message);
      } else if (data.type && data.type === "friendReq") {
        let sender = fastify.db.prepare("SELECT * FROM users WHERE username = ?").get(data.sender);
        let receiver = fastify.db.prepare("SELECT * FROM users WHERE username = ?").get(data.receiver);
        fastify.db.prepare("INSERT INTO friends (sender_id, receiver_id, status) VALUES (?, ?, ?)").run(sender.id, receiver.id, 2);
      } else if (data.type && data.type === "friendAccept") {
        let sender = fastify.db.prepare("SELECT * FROM users WHERE username = ?").get(data.sender);
        let receiver = fastify.db.prepare("SELECT * FROM users WHERE username = ?").get(data.receiver);
        fastify.db.prepare("UPDATE friends SET status = 1 WHERE sender_id = ? AND receiver_id = ?").run(sender.id, receiver.id);
      } else if (data.type && data.type === "friendDecline") {
        let sender = fastify.db.prepare("SELECT * FROM users WHERE username = ?").get(data.sender);
        let receiver = fastify.db.prepare("SELECT * FROM users WHERE username = ?").get(data.receiver);
        fastify.db.prepare("DELETE FROM friends WHERE sender_id = ? AND receiver_id = ?").run(sender.id, receiver.id);
      }
    })
    socket.on('close', () => {
      if (req.session.user) {
        socket.send(JSON.stringify({type: 'disconnected'}));
      }
    })
  })
})

fastify.get('/', function (req, reply) {
  const { db } = req.server;
  const usersArr = db.prepare("SELECT * FROM users").all();
  console.log(usersArr);
  const messages = db.prepare("SELECT * FROM messages").all();
  console.log (messages);
  const friends = db.prepare("SELECT * FROM friends").all();
  console.log (friends);
  console.log (connectedSockets);
  return reply.view("index.ejs", { users: usersArr, authen: req.session } );
})


fastify.get('/login', async function (req, reply) {
  return reply.view("login.ejs", { authen: req.session } );
})

fastify.get('/logout', (request, reply) => {
  const { db } = request.server;
  const usersArr = db.prepare("SELECT * FROM users").all();
  if (request.session.authenticated) {
    const index = connectedSockets.findIndex(function (socket) { return socket.name.username === request.session.user.username});
      if (index !== -1)
          connectedSockets.splice(index, 1);
    // console.log("KIK");
    // console.log(request.session.token);
    // if (request.session.token) {
    //   fastify.Oauth2.revokeToken(request.session.token, 'refresh_token', (err) => {
    //     console.log("OIIIIIIIIIIIIII");
    //     console.log(err);
    //  });
    // }
    request.session.destroy((err) => {
      if (err) {
        reply.status(500)
        return reply.send('Internal Server Error')
      } else {
        return reply.view("index.ejs", { users: usersArr, authen: request.session } );
      }
    })
  } else {
    return reply.view("index.ejs", { users: usersArr, authen: request.session } );
  }
});

fastify.get('/register', function (req, reply) {
  return reply.view("register.ejs", { authen: req.session.authenticated });
})

function getTttWr(user, userMatch) {
  var win = 0;
  if (userMatch.length === 0)
    return 0;
  userMatch.forEach(match => {
    if (match.winner === user.username)
        win++;
  });
  return ((win * 100) / userMatch.length);
}

function getPongWr(userMatch) {
  var win = 0;
  if (userMatch.length === 0)
    return 0;
  userMatch.forEach(match => {
    if (match.user_score > match.opponent_score)
        win++;
  });
  return ((win * 100) / userMatch.length);
}

fastify.get('/user', function (req, reply) {
  const { db } = req.server;
  if (!req.session.authenticated)
    return reply.send({error: "User not connected"});
  const usersArr = db.prepare("SELECT * FROM users WHERE username = ?").get(req.query.user);
  const currentUser = req.session.user;
  const usersMes = db.prepare("SELECT * FROM messages WHERE sender_id == ? OR receiver_id == ? ").all(currentUser.id, currentUser.id);
  const usersFri = db.prepare("SELECT f.status, f.sender_id, u1.username sender_username, f.receiver_id, u2.username receiver_username FROM friends f JOIN users u1 ON f.sender_id = u1.id JOIN users u2 ON f.receiver_id = u2.id WHERE sender_id = ? OR receiver_id = ?").all(usersArr.id, usersArr.id); 
  const userMatch = db.prepare("SELECT * FROM matchs JOIN users ON users.id = matchs.user_id WHERE user_id = ?").all(usersArr.id);
  const usertttMatch = db.prepare("SELECT * FROM matchs_morp JOIN users ON users.id = matchs_morp.user_id WHERE user_id = ?").all(usersArr.id);
  var thePath;
  if (fs.existsSync(__dirname + "/../avatars/" + usersArr.username)) {
    thePath = "/../avatars/" + usersArr.username;
  } else {
    thePath = "/../avatars/default.jpg";
  }
  var status;
  var name;
  usersFri.map((friend) => {
    if (friend.sender_username != usersArr.username)
        name = friend.sender_username;
    else
      name = friend.receiver_username;
    if (connectedSockets.find(x => x.name.username === name)) {
      status = {online_status: true};
    } else {
      status = {online_status: false};
    }
    Object.assign(friend, status);
  });
  // console.log(usertttMatch);
  return reply.view("user.ejs", { user: usersArr, authen: req.session, messages: usersMes, friends: usersFri, path: thePath, pongMatches: userMatch, tttMatches: usertttMatch, tttWr: getTttWr(usersArr, usertttMatch), pongWr: getPongWr(userMatch)});
})

fastify.get('/login/google/callback', function (request, reply) {
  fastify.Oauth2.getAccessTokenFromAuthorizationCodeFlow(request, (err, result) => {
    if (err) {
      return reply.send(err);
    }
    sget.concat({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + result.token.access_token
      },
      json: true
    }, function (err, _res, data) {
      if (err) {
        return reply.send(err);
      }
      const { db } = request.server;
      // console.log("KUK");
      // console.log(request.session.token);
      var usersId = db.prepare("SELECT * FROM users WHERE google_id = ?").get(data.id);
      if (connectedSockets.find(x => x.name.username === data.name)) {
        // console.log("KOK");
        return reply.redirect('/');
      }
      if (usersId == null) {
        db.prepare("INSERT INTO users (username, password, google_id) VALUES (?, ?, ?)").run(data.name, 1, data.id);
        usersId = db.prepare("SELECT * FROM users WHERE google_id = ?").get(data.id);
      }
      request.session.authenticated = true;
      request.session.user = usersId;
      request.session.token = result.token;
      // console.log("KAK");
      // console.log(request.session.token);
      return reply.redirect('/');
    })
  })
})

fastify.get('/current-user', (req, reply) => {
  if (!req.session.authenticated || !req.session.user) {
    return reply.send({ message: "Utilisateur non authentifié." });
  }
  return reply.send({ username: req.session.user.username });
});

fastify.post('/login', function (req, reply) {
  if (!req.body.username || !req.body.password)
      return reply.send({error: "message inputs cant be undefined"});
  if (connectedSockets.find(x => x.name.username === req.body.username)) {
    return reply.send({message: "User already connected on another devise!", flag: false});
  }
  const { db } = req.server;
  const usersArr = db.prepare("SELECT * FROM users WHERE username = ?").get(req.body.username);
  if (usersArr == null) {
    return reply.send({message: "You don't have an account", flag: false});
  } else if (req.body.password.length == 0) {
    return reply.send({message: "Password can't be empty", flag: false});
  } else if (usersArr.google_id) {
    return reply.send({message: "You have to login using google account", flag: false});
  }
  bcrypt.compare(req.body.password, usersArr.password, function(err, res) {
    if (err) {
      console.log(err);
    }
    if (res) {
      req.session.authenticated = true;
      req.session.user = usersArr;
      return reply.send({message: "You are connected!", flag: true, username: req.session.user});
    } else {
      return reply.send({message: "Wrong password!", flag: false});
    }
  });
})

fastify.post('/register', function (req, reply) {
  const { db } = req.server;
  var userArr = db.prepare("SELECT * FROM users WHERE username = ?").get(req.body.username)
  if (!req.body.confirmPassword || req.body.password != req.body.confirmPassword) {
    return reply.send({message: "Passwords don't match! Can't create user.", flag: false})
  } else if (userArr) {
    return reply.send({message: "Username already in use.", flag: false})
  } else if (!req.body.password || req.body.password.length == 0) {
    return reply.send({message: "Passwords can't be empty!.", flag: false})
  } else if (!req.body.username || req.body.username.length === 0 || req.body.username.length > 20 || req.body.password.length > 20) {
      return reply.send({message: "Username or password can't be more than 20 caracters", flag: false})
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return reply.send({message: "Error generating Salt.", flag: false});
      }
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err) {
          return reply.send({message: "Error while hashing password.", flag: false});
        }
        db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(req.body.username, hash);
        userArr = db.prepare("SELECT * FROM users WHERE username = ?").get(req.body.username)
        req.session.authenticated = true;
        req.session.user = userArr;
        return reply.send({message: "User successfully created!", flag: true, username: req.session.user});
      })
    });
  }
})

fastify.post('/avatar', async function(req, reply) {
  if (!req.session.authenticated)
    return reply.send({message: "User not connected"});
  const { db } = req.server;
    const dataFile = await req.file();
    if (fs.existsSync(__dirname + "/../avatars/" + req.session.user.username)) {
      fs.unlink(__dirname + "/../avatars/" + req.session.user.username,
        (err => {
            if (err) console.log(err);
        }));
    }
    await pipeline(dataFile.file, fs.createWriteStream(__dirname + "/../avatars/" + dataFile.fieldname));
    const usersMes = db.prepare("SELECT * FROM messages WHERE sender_id == ? OR receiver_id == ? ").all(req.session.user.id, req.session.user.id);
    const usersFri = db.prepare("SELECT f.status, f.sender_id, u1.username sender_username, f.receiver_id, u2.username receiver_username FROM friends f JOIN users u1 ON f.sender_id = u1.id JOIN users u2 ON f.receiver_id = u2.id WHERE sender_id = ? OR receiver_id = ?").all(req.session.user.id, req.session.user.id);
    const userMatch = db.prepare("SELECT * FROM matchs JOIN users ON users.id = matchs.user_id WHERE user_id = ?").all(req.session.user.id);
    const usertttMatch = db.prepare("SELECT * FROM matchs_morp JOIN users ON users.id = matchs_morp.user_id WHERE user_id = ?").all(req.session.user.id);
    var thePath;
    if (fs.existsSync(__dirname + "/../avatars/" + req.session.user.username)) {
      thePath = "/../avatars/" + req.session.user.username;
    } else {
      thePath = "/../avatars/default.jpg";
    }
    return reply.view("user.ejs", { user: req.session.user, authen: req.session, messages: usersMes, friends: usersFri, path: thePath, pongMatches: userMatch, tttMatches: usertttMatch, tttWr: getTttWr(req.session.user, usertttMatch), pongWr: getPongWr(userMatch)});
  }
)

fastify.post('/changeName', async function(req, reply) {
  if (!req.session.authenticated)
    return reply.send({message: "User not connected"});
  if (req.body.username.length === 0)
    return reply.send({message: "Username can't be empty", flag: false});
  const check = req.server.db.prepare("SELECT * FROM users WHERE username = ?").get(req.body.username);
  if (check)
    return reply.send({message: "Username already taken", flag: false});
  var oldName = req.session.user.username;
  req.server.db.prepare("UPDATE users SET username = ? WHERE username = ?").run(req.body.username, req.session.user.username);
  var thePath;
  if (fs.existsSync(__dirname + "/../avatars/" + req.session.user.username)) {
    fs.rename(__dirname + "/../avatars/" + req.session.user.username, __dirname + "/../avatars/" + req.body.username, function(err) {
      if ( err ) console.log(err);
    });
    thePath = "/../avatars/" + req.body.username;
  } else {
    thePath = "/../avatars/default.jpg";
  }
  const userArr = req.server.db.prepare("SELECT * FROM users WHERE username = ?").get(req.body.username);
  req.session.user = userArr;
  connectedSockets.forEach(sockets => { if (sockets.name.username === oldName) {
    sockets.name.username = req.session.user.username;
  } });
  return reply.send({message: "Username changed!", flag: true, username: req.session.user.username});
})
fastify.post('/endgame', async function (req, reply) {
  if (!req.session.authenticated)
    return reply.send({message: "User not connected"});
  const { db } = req.server;
  const date = new Date();
  var usersArr = db.prepare("SELECT * FROM users WHERE username = ?").get(req.session.user.username);
  db.prepare("INSERT INTO matchs (user_id, opponent, user_score, opponent_score, date) VALUES (?, ?, ?, ?, ?)").run(usersArr.id, req.body.opponent, req.body.user_score, req.body.opponent_score, date.toISOString());
  console.log(usersArr);
  usersArr = db.prepare("SELECT * FROM users").all();
  return reply.view("index.ejs", { users: usersArr, authen: req.session } );
})

fastify.post('/endmorp', async function (req, reply) {
  if (!req.session.authenticated)
    return reply.send({message: "User not connected"});
  const { db } = req.server;
  const date = new Date();
  var usersArr = db.prepare("SELECT * FROM users WHERE username = ?").get(req.session.user.username);
  db.prepare("INSERT INTO matchs_morp (user_id, opponent, winner, draw, date) VALUES (?, ?, ?, ?, ?)").run(usersArr.id, req.body.opponent, req.body.winner, req.body.draw, date.toISOString());
  usersArr = db.prepare("SELECT * FROM users").all();
  return reply.view("index.ejs", { users: usersArr, authen: req.session } );
})

fastify.post('/avax', async function (req, reply) {
  if (!req.session.authenticated)
    return reply.send({message: "User not connected"});
    var payload = {
      winner: req.body.winner,
      runnerUp: req.body.runnerUp
  };
  fetch("http://avax:3232/submit", {
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(payload)
  })
})

const start = async () => {
  try {
    await fastify.listen({ port: 3200, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()