// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PongTournament {
    struct Tournament {
        uint256 tournamentId;
        string winner;
        string runnerUp;
    }

    mapping(uint256 => Tournament) public tournaments;
    uint256[] public tournamentIds;
    uint256 public nextTournamentId = 1;

    event TournamentResult(uint256 tournamentId, string winner, string runnerUp);

    function submitResult(string memory _winner, string memory _runnerUp) public {
        // require(_winner != _runnerUp, "Winner and runner-up must be different");
        require(keccak256(abi.encodePacked(_winner)) != keccak256(abi.encodePacked(_runnerUp)), "Winner and runner-up must be different");       
        // require(tournaments[_tournamentId].tournamentId == 0, "Tournament ID already exists");

        uint256 currentId = nextTournamentId;

        tournaments[currentId] = Tournament(currentId, _winner, _runnerUp);
        tournamentIds.push(currentId);

        emit TournamentResult(currentId, _winner, _runnerUp);

        nextTournamentId++;
    }

    function getTournament(uint256 _tournamentId) public view returns (Tournament memory) {
        require(tournaments[_tournamentId].tournamentId != 0, "Tournament does not exist");
        return tournaments[_tournamentId];
    }

    function getAllTournaments() public view returns (Tournament[] memory) {
        Tournament[] memory results = new Tournament[](tournamentIds.length);
        for (uint256 i = 0; i < tournamentIds.length; i++) {
            results[i] = tournaments[tournamentIds[i]];
        }
        return results;
    }
}