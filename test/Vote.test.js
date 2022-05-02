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

        await expect(
            vote.connect(acc1).createVote([acc1.address, acc2.address],
                ["Misha", "Vasia"])).to.be.revertedWith("Only creator option")
        
    });


    it ("Should revert because of wrong amount of addresses", async function() {
        await expect(
           vote.createVote([acc1.address], ["Misha", "Vasia"])).to.be.revertedWith(
                "Amount of addresses have to be equal to amount of names.") 
        
    })

    it ("Should revert because of empty list of addresses", async function() {
        await expect(
           vote.createVote([], ["Misha", "Vasia"])).to.be.revertedWith(
                "Amount of proposals > 0") 
        
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

        it ("Getting proposals info from not existing vote ", async function() {
            
            await expect(vote.getProposalsInfo(2, 0)).to.be.revertedWith("This poll does not exist.")
            
        })


        it ("Should make a vote", async function() {
            const tx = await vote.vote(0, 0, {value:ethers.utils.parseEther("1.0")})
            const amountOfVotes = await vote.getProposalsInfo(0, 0)
            
            expect(parseInt(amountOfVotes[2])).to.equal(1)
        })

        it ("Voting in the unexisting vote", async function() {
            await expect(vote.vote(1, 0, {value:ethers.utils.parseEther("1.0")})).to.be.revertedWith(
                "This poll does not exist.")   
        })
        
        it ("Should revert becouse of minimal deposit", async function() {
            await expect(vote.vote(0, 0, {value:ethers.utils.parseEther("0.01")})).to.be.revertedWith(
                "Minimal deposit 0.1 ETH")   
        })
        
        it ("Should revert because of double voting", async function() {
            await vote.vote(0, 1, {value : ethers.utils.parseEther("1")})
            await expect(vote.vote(0, 0, {value:ethers.utils.parseEther("1")})).to.be.revertedWith(
                "You have already voted")   
        })

        it ("Should not close vote becouse of the time to vote", async function() {
           
            await expect(vote.closeVote(0)).to.be.revertedWith(
                "Voting lasts three days!")   
        })

        it ("Should not close vote", async function() {
           
            await expect(vote.closeVote(1)).to.be.revertedWith(
                "This vote does not exist.")   
        })

        it ("Sending money to winner", async function(){
            await vote.vote(0, 0, {value:ethers.utils.parseEther("1.0")})
            await ethers.provider.send('evm_increaseTime', [3 * 86400])
            const tx = await vote.closeVote(0)
            await expect(() => tx).to.changeEtherBalances([vote, acc1],
                 [ethers.utils.parseEther('-0.9'),ethers.utils.parseEther('0.9')])
        })

        it ("Check voting proccess", async function() {
            await vote.vote(0, 0, {value:ethers.utils.parseEther("1.0")})
            await vote.connect(acc1).vote(0, 0, {value:ethers.utils.parseEther("1.0")})
            await vote.connect(acc2).vote(0, 1, {value:ethers.utils.parseEther("1.0")})
        })

        describe("Vote closing tests", function(){
            beforeEach(async function() {
                await vote.vote(0, 0, {value:ethers.utils.parseEther("1.0")}) 
                await ethers.provider.send('evm_increaseTime', [3 * 86400])
                await vote.closeVote(0) 
            })
             it ("Vote should be closed", async function() {
             
                const openedVotes = await vote.openedPolls()
                expect(openedVotes[0] == false)
             })

             it ("", async function(){
                await expect(vote.closeVote(0)).to.be.revertedWith(
                    "This poll is already closed!")    
             })

             it ("Should revert voting becouse of closed vote.", async function() {
                await expect(vote.vote(0, 0, {value:ethers.utils.parseEther("1.0")})).to.be.revertedWith(
                    "This poll is closed!")   
             })

             it ("Getting commision", async function() {
             
                const tx = await vote.getCommission()
                await expect(() => tx).to.changeEtherBalances([owner, vote],
                     [ethers.utils.parseEther('0.1'),ethers.utils.parseEther('-0.1')]) 
             }) 

        })

    })
    
    

  

});
