var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var protocol = window.location.protocol === "https:" ? "wss" : "ws";
var ws = new WebSocket("".concat(protocol, "://").concat(window.location.host, "/socket"));
// const ws = new WebSocket('wss://localhost:3200/socket');
ws.onopen = function (event) {
    // console.log("SOCKET OPEN")
};
ws.onmessage = function (event) {
    // console.log(`message received: ${event.data}`);
};
ws.onclose = function (event) {
    // console.log("connection died");
};
var scene = window.scene;
var engine = window.engine;
window.addEventListener("load", function (event) {
    var newScript = document.createElement('script');
    newScript.setAttribute('src', "/dist/pong.js");
    newScript.setAttribute('id', "pong-script");
    document.head.appendChild(newScript);
});
window.addEventListener("popstate", function (event) {
    if (document.getElementById("pong-script")) {
        if (scene)
            scene.dispose();
        if (engine)
            engine.dispose();
        document.head.removeChild(document.getElementById("pong-script"));
    }
    getCurrentUser().then(function (user) {
        if (user) {
            var newScript = document.createElement('script');
            newScript.setAttribute('src', "/dist/pong.js");
            newScript.setAttribute('id', "pong-script");
            document.head.appendChild(newScript);
        }
    });
});
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
            var newScript = document.createElement('script');
            newScript.setAttribute('src', "/dist/pong.js");
            newScript.setAttribute('id', "pong-script");
            document.head.appendChild(newScript);
        }
        else {
            if (document.getElementById("tic-tac-toe-script")) {
                var script = document.getElementById("tic-tac-toe-script");
                document.head.removeChild(script);
            }
            if (document.getElementById("pong-script")) {
                var script = document.getElementById("pong-script");
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
            return;
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
        var newScript = document.createElement('script');
        newScript.setAttribute('src', "/dist/tic.js");
        newScript.setAttribute('id', "tic-tac-toe-script");
        document.head.appendChild(newScript);
    }
    else {
        if (document.getElementById("pong"))
            return;
        var oldScript_1 = document.getElementById("tic-tac-toe-script");
        if (oldScript_1) {
            if (scene)
                scene.dispose();
            if (engine)
                engine.dispose();
            document.head.removeChild(oldScript_1);
        }
        document.getElementById("game-div").innerHTML = "<canvas class=\"rounded-xl border-2 border-gray-400 shadow-xl\" id=\"pong\"></canvas>";
        var newScript = document.createElement('script');
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
    };
    // console.log(send, recei);
    ws.send(JSON.stringify(payload));
    moveKek('/user?user=' + recei.replace(" ", "+"));
}
function acceptFriend(send, recei, user) {
    var payload = {
        type: "friendAccept",
        sender: send,
        receiver: recei
    };
    ws.send(JSON.stringify(payload));
    moveKek('/user?user=' + user.replace(" ", "+"));
}
function declineFriend(send, recei, user) {
    var payload = {
        type: "friendDecline",
        sender: send,
        receiver: recei
    };
    ws.send(JSON.stringify(payload));
    moveKek('/user?user=' + user.replace(" ", "+"));
}
function sendMsg(send, recei) {
    var payload = {
        type: "msg",
        message: document.getElementById('message').value,
        sender: send,
        receiver: recei
    };
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
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirm-password').value
    };
    fetch("/register", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(payload)
    }).then(function (res) { return res.json(); }).then(function (data) {
        alert(data.message);
        if (data.flag == true) {
            ws.send(JSON.stringify({ type: "login", username: data.username }));
            moveKek("/");
        }
    }).catch(function (e) { console.log(e); });
}
function userLogin() {
    var payload = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
    };
    fetch("/login", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(payload)
    }).then(function (res) { return res.json(); }).then(function (data) {
        console.log(data);
        alert(data.message);
        if (data.flag == true) {
            ws.send(JSON.stringify({ type: "login", username: data.username }));
            moveKek("/");
        }
    });
}
function changeName() {
    var payload = {
        username: document.getElementById('username').value,
    };
    fetch("/changeName", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(payload)
    }).then(function (res) { return res.json(); }).then(function (data) {
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
function endMorp(opponent_name, winner_name, draw_int) {
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
function getCurrentUser() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/current-user")];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.username) {
                        return [2 /*return*/, data.username];
                    }
                    else {
                        console.log("No user is currently logged in.");
                        return [2 /*return*/, null];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error fetching current user:", error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
