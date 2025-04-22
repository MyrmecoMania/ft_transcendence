import Fastify from "fastify";
import cors from "@fastify/cors";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const fastify = Fastify();
await fastify.register(cors);

const CONTRACT_ADDRESS = '0x388D1935667d715EcdA573CFae549CB0780172ce';
const ABI = 
[
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tournamentId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "winner",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "runnerUp",
        "type": "string"
      }
    ],
    "name": "TournamentResult",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getAllTournaments",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tournamentId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "winner",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "runnerUp",
            "type": "string"
          }
        ],
        "internalType": "struct PongTournament.Tournament[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tournamentId",
        "type": "uint256"
      }
    ],
    "name": "getTournament",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tournamentId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "winner",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "runnerUp",
            "type": "string"
          }
        ],
        "internalType": "struct PongTournament.Tournament",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextTournamentId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_winner",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_runnerUp",
        "type": "string"
      }
    ],
    "name": "submitResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tournamentIds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tournaments",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "tournamentId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "winner",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "runnerUp",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
// [
//   {
//     "inputs": [
//       { "internalType": "uint256", "name": "_tournamentId", "type": "uint256" },
//       { "internalType": "address", "name": "_winner", "type": "address" },
//       { "internalType": "address", "name": "_runnerUp", "type": "address" }
//     ],
//     "name": "submitResult",
//     "outputs": [],
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "inputs": [{ "internalType": "uint256", "name": "_tournamentId", "type": "uint256" }],
//     "name": "getTournament",
//     "outputs": [
//       { "internalType": "uint256", "name": "tournamentId", "type": "uint256" },
//       { "internalType": "address", "name": "winner", "type": "address" },
//       { "internalType": "address", "name": "runnerUp", "type": "address" }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   }
// ];

// Connect to Avalanche Fuji
// const provider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");

const provider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
// provider._isProvider = true;

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

fastify.get("/", async (request, reply) => {
  return { message: "Hello from KEK!" };
});

// 🏆 Submit tournament result
fastify.post("/submit", async (request, reply) => {
  try {
    const { winner, runnerUp } = request.body;
    const tx = await contract.submitResult(winner, runnerUp);
    await tx.wait();
    reply.send({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: error.message });
  }
});

// 📊 Get tournament result
fastify.get("/tournament/:id", async (request, reply) => {
  try {
    const tournament = await contract.getTournament(request.params.id);
    reply.send({
      tournamentId: Number(tournament.tournamentId),
      winner: tournament.winner,
      runnerUp: tournament.runnerUp,
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: error.message });
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3232, host: "0.0.0.0" });
    console.log(`Server running on http://localhost:3232`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();