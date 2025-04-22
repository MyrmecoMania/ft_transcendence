const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PongTournament", function () {
  let PongTournament, pongTournament, owner, player1, player2;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    PongTournament = await ethers.getContractFactory("PongTournament");
    pongTournament = await PongTournament.deploy();
    // await pongTournament.deployed();
  });

  it("Should submit and retrieve a tournament result", async function () {
    await pongTournament.submitResult(1, player1.address, player2.address);

    const tournament = await pongTournament.getTournament(1);
    expect(tournament.tournamentId).to.equal(1);
    expect(tournament.winner).to.equal(player1.address);
    expect(tournament.runnerUp).to.equal(player2.address);
  });

  it("Should not allow duplicate tournament IDs", async function () {
    await pongTournament.submitResult(1, player1.address, player2.address);
    await expect(
      pongTournament.submitResult(1, player2.address, player1.address)
    ).to.be.revertedWith("Tournament ID already exists");
  });

  it("Should not allow winner and runner-up to be the same", async function () {
    await expect(
      pongTournament.submitResult(2, player1.address, player1.address)
    ).to.be.revertedWith("Winner and runner-up must be different");
  });

  it("Should retrieve all tournaments", async function () {
    await pongTournament.submitResult(1, player1.address, player2.address);
    await pongTournament.submitResult(2, player2.address, player1.address);

    const tournaments = await pongTournament.getAllTournaments();
    expect(tournaments.length).to.equal(2);
  });
});