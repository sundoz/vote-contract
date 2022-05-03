//const { ethers } = require("hardhat");
const { task } = require('hardhat/config');
const VotesArtifact = require('../artifacts/contracts/Vote.sol/Vote.json')
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

task("create", "Create a voting")
    .addParam('addresses', 'Addresses of voters')
    .addParam('names', 'names of voters')
    .setAction(async (taskArgs, hre) => {
        proposalsAddresses = taskArgs.addresses.split(',')
        proposalsNames = taskArgs.names.split(',')
        const [owner] = await ethers.getSigners()
        const voteContract = new ethers.Contract(
            process.env.ADDRESS,
            VotesArtifact.abi,
            owner
        )
        
        const result = await voteContract.createVote(proposalsAddresses, proposalsNames)
        console.log(result)

    });

task('check', 'Check opened votings', async (taskArgs, hre) => {
    const [owner] = await ethers.getSigners() 
    const voteContract = new ethers.Contract(
        process.env.ADDRESS,
        VotesArtifact.abi,
        owner
    )
    const result = await voteContract.openedPolls()
    console.log(result)
});


task("voting", "vote for someone")
    .addParam('numberofvote', 'Number of voting')
    .addParam('numberofproposal', 'Number of Proposal')
    .addAction(async (taskArgs, hre) => {
        const [owner] = await ethers.getSigners() 
        const numberOfVote = taskArgs.numberofvote
        const numberOfProposal = taskArgs.numberofproposal
        const voteContract = new ethers.Contract(
            process.env.ADDRESS,
            VotesArtifact.abi,
            owner
        ) 
        const result = await voteContract.vote(numberOfVote, numberOfProposal,
                                                {value: ethers.utils.parseEther('0.1') })
        console.log(result)

    })

    
    task("close", "Close the vote")
    .addParam('numberofvote', 'Number of voting')
    .addAction(async (taskArgs, hre) => {
        const [owner] = await ethers.getSigners() 
        const numberOfVote = taskArgs.numberofvote
        
        const voteContract = new ethers.Contract(
            process.env.ADDRESS,
            VotesArtifact.abi,
            owner
        ) 
        const result = await voteContract.closeVote(numberOfVote)
        console.log(result)
    })