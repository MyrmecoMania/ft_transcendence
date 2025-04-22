import Fastify from "fastify";
import { ethers } from "ethers";
import dotenv from "dotenv";
import PongTournamentABI from "./PongTournamentABI.json" assert { type: "json" };

dotenv.config();

const fastify = Fastify({ logger: true });

const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
const contract = new ethers.Contract(contractAddress, PongTournamentABI, provider);

fastify.get("/scores", async (request, reply) => {
  const scores = await contract.getScores();
  reply.send(scores);
});

fastify.listen({ port: 3001 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});