const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Vote", function () {
    let owner
    let acc1
    let acc2
    beforeEach(async function(){
        [owner, acc1, acc2] = await ethers.getSigners()
        const Vote = await ethers.getContractFactory("Vote", owner)
        vote = await Vote.deploy()
        await vote.deployed()
    })

    it ("Should be deployed", async function() {
        expect(vote.address).to.be
    });

    it ("Should be correct creator address", async function() {

        expect(
            vote.connect(acc1).createVote([acc1.address, acc2.address],
                ["Misha", "Vasia"])).to.be.revertedWith("Only creator option")
        
    });


    it ("Should revert because of wrong amount of addresses", async function() {
        expect(
            vote.createVote([acc1.address], ["Misha", "Vasia"])).to.be.revertedWith(
                "Amout of addresses have to be equal to amout of names.") 
        
    })


    describe("Vote creation", function(){

        beforeEach(async function() {
            const voteCreation = await vote.createVote([acc1.address, acc2.address], ["Misha", "Vasia"])
        })

        it ("Should create a vote", async function() {
           
            const amountOfPolls = await vote.getAmountOfPolls()
            expect(amountOfPolls).to.equal(1)
            const voteInfo = await vote.getVoteInfo(0)
            expect(voteInfo[0]).to.equal(true)
    
        })

        it ("Should return names and addresses of proposals", async function() {
            
            const proposalsData = await vote.getProposalsInfo(0, 0)
            expect(proposalsData[0]).to.equal("Misha")
            expect(proposalsData[1]).to.equal(acc1.address)
        })

        it ("Should make vote", async function() {
            const tx = await vote.vote(0, 0, {value:ethers.utils.parseEther("1.0")})
            const amountOfVotes = await vote.getProposalsInfo(0, 0)
            
            expect(parseInt(amountOfVotes[2])).to.equal(1)
        })
    })
    
    

  

});
