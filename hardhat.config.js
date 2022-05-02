require("@nomiclabs/hardhat-waffle");
require("dotenv").config()
require("solidity-coverage")
require("./tasks/tasks")
const VotesArtifact = require('./artifacts/contracts/Vote.sol/Vote.json')

module.exports = {
  solidity: "0.8.4",

  networks:{
    rinkeby:{
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
      accounts:[process.env.KEY]

    }
  }
};
