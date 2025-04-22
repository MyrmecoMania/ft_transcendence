const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${protocol}://${window.location.host}/socket`);
// const ws = new WebSocket('wss://localhost:3200/socket');
ws.onopen = function(event) {
  // console.log("SOCKET OPEN")
}
ws.onmessage = function(event) {
  // console.log(`message received: ${event.data}`);
}

ws.onclose = function(event) {
  // console.log("connection died");
}

var scene = window.scene;
var engine = window.engine;

window.addEventListener("load", event => {
  const newScript = document.createElement('script');
  newScript.setAttribute('src', "/dist/pong.js");
  newScript.setAttribute('id', "pong-script");
  document.head.appendChild(newScript);
})

window.addEventListener("popstate", event => {
  if (document.getElementById("pong-script")) {
    if (scene)
      scene.dispose();
    if (engine)
        engine.dispose();
    document.head.removeChild(document.getElementById("pong-script"));
  }
  getCurrentUser().then(user => {
    if (user) {
      const newScript = document.createElement('script');
      newScript.setAttribute('src', "/dist/pong.js");
      newScript.setAttribute('id', "pong-script");
      document.head.appendChild(newScript);
    }
  })

})

function moveKek(path) {
  var fetchRes = fetch(path);
  fetchRes.then(function (response) { return response.text(); })
      .then(function (data) {
        if (window.scene)
          scene.dispose();
        if (engine)
            engine.dispose();
        if (path == "/") {
          var oldScript = document.getElementById("tic-tac-toe-script");
          if (oldScript) {
            document.head.removeChild(oldScript);
          }
          const newScript = document.createElement('script');
          newScript.setAttribute('src', "/dist/pong.js");
          newScript.setAttribute('id', "pong-script");
          document.head.appendChild(newScript);
      } else {
          if (document.getElementById("tic-tac-toe-script")) {
            const script = document.getElementById("tic-tac-toe-script");
            document.head.removeChild(script);
          }
          if (document.getElementById("pong-script")) {
            const script = document.getElementById("pong-script");
            document.head.removeChild(script);
          }
      }
      document.getElementById('main-body').innerHTML = data;
      window.history.pushState({ description: data }, '', '/');
  });
}

function changeGame(str) {
  if (str === "tictactoe") {
      if (document.getElementById("tic-tac-toe"))
          return ;
      var oldScript = document.getElementById("pong-script");
      if (oldScript) {
        if (scene)
          scene.dispose();
        if (engine)
          engine.dispose();
          document.head.removeChild(oldScript);
      }
      if (document.getElementById("pong-script-index")) {
          if (scene)
            scene.dispose();
          if (engine)
            engine.dispose();
      }
      document.getElementById("game-div").innerHTML = "<canvas class=\"rounded-xl border-2 border-gray-400 shadow-xl\" id=\"tic-tac-toe\">";
      const newScript = document.createElement('script');
      newScript.setAttribute('src', "/dist/tic.js");
      newScript.setAttribute('id', "tic-tac-toe-script");
      document.head.appendChild(newScript);
  }
  else {
      if (document.getElementById("pong"))
          return ;
      const oldScript = document.getElementById("tic-tac-toe-script");
      if (oldScript) {
          if (scene)
            scene.dispose();
          if (engine)
            engine.dispose();
          document.head.removeChild(oldScript);
      }
      document.getElementById("game-div").innerHTML = "<canvas class=\"rounded-xl border-2 border-gray-400 shadow-xl\" id=\"pong\"></canvas>";
      const newScript = document.createElement('script');
      newScript.setAttribute('src', "/dist/pong.js");
      newScript.setAttribute('id', "pong-script");
      document.head.appendChild(newScript);
  }
}

function addFriend(send, recei) {
var payload = {
  type: "friendReq",
  sender: send,
  receiver: recei,
}
// console.log(send, recei);
ws.send(JSON.stringify(payload));
moveKek('/user?user=' + recei.replace(" ", "+"));
}

function acceptFriend(send, recei, user) {
var payload = {
  type: "friendAccept",
  sender: send,
  receiver: recei
}
ws.send(JSON.stringify(payload));
moveKek('/user?user=' + user.replace(" ", "+"));
}

function declineFriend(send, recei, user) {
var payload = {
  type: "friendDecline",
  sender: send,
  receiver: recei
}
ws.send(JSON.stringify(payload));
moveKek('/user?user=' + user.replace(" ", "+"));
}

function sendMsg(send, recei) {
var payload = {
  type: "msg",
  message: (<HTMLInputElement>document.getElementById('message')).value,
  sender: send,
  receiver: recei
}
ws.send(JSON.stringify(payload));
}

window.addEventListener("popstate", function (event) {
  if (event.state) {
    (document.getElementById('main-body')).innerHTML = event.state.description;
  }
});
if (document.getElementById("main-body")) {
  var initialState = {
      description: (document.getElementById("main-body")).innerHTML,
  };
  history.replaceState(initialState, "", document.location.href);
}

function userCreation() {
var payload = {
  username: (<HTMLInputElement>document.getElementById('username')).value,
  password: (<HTMLInputElement>document.getElementById('password')).value,
  confirmPassword: (<HTMLInputElement>document.getElementById('confirm-password')).value
}
fetch("/register",
{
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  method:'POST',
  body: JSON.stringify(payload)}).then(res => res.json()).then(data => {
    alert(data.message);
    if (data.flag == true) {
      ws.send(JSON.stringify({type: "login", username: data.username}));
      moveKek("/");
    }
  }).catch(e => {console.log(e)});
}

function userLogin() {
var payload = {
  username: (<HTMLInputElement>document.getElementById('username')).value,
  password: (<HTMLInputElement>document.getElementById('password')).value,
}
fetch("/login",
{
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  method:'POST',
  body: JSON.stringify(payload)}).then(res => res.json()).then(data => {
    console.log(data);
    alert(data.message);
    if (data.flag == true) {
      ws.send(JSON.stringify({type: "login", username: data.username}));
      moveKek("/");
    }
  });
}

function changeName() {
  var payload = {
    username: (<HTMLInputElement>document.getElementById('username')).value,
  }
  fetch("/changeName",
  {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method:'POST',
    body: JSON.stringify(payload)}).then(res => res.json()).then(data => {
      console.log(data);
      alert(data.message);
      if (data.flag == true) {
        moveKek('/user?user=' + data.username);
      }
    });
  }

function endGame(opponent_name, scoreLeft, scoreRight) {
  var payload = {
      opponent: opponent_name,
      user_score: scoreLeft,
      opponent_score: scoreRight,
  };
  fetch("/endgame", {
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(payload)
  });
}

function endMorp(opponent_name,winner_name,draw_int) {
  var payload = {
      opponent: opponent_name,
      winner: winner_name,
      draw: draw_int
  };
  fetch("/endmorp", {
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(payload)
  });
}

async function getCurrentUser() {
  try {
    const response = await fetch("/current-user");
    const data = await response.json();

    if (data.username) {
      return data.username;
    } else {
      console.log("No user is currently logged in.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}