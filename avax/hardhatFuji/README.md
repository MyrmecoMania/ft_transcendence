# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

# TEST
npx hardhat test

# DEPLOY
npx hardhat run scripts/deploy.js --network fuji


https://subnets-test.avax.network/c-chain/address/0x83Ad781c7F9747DdD72ea9A6665E26589A76f5dd

// old 
0xD73373fE400c9405C3b3e661FC28f07048d8931E

// new
0x388D1935667d715EcdA573CFae549CB0780172ce

curl -X POST http://localhost:3000/submit \
     -H "Content-Type: application/json" \
     -d '{"winner":"0xWinnerAddress", "runnerUp":"0xRunnerUpAddress"}'

curl http://localhost:3000/tournament/1