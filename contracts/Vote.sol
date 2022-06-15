// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


/** 
 * @title Vote
 * @dev Implements voting process along with vote creation and termination of voting
 */
contract Vote {

    uint internal constant dayToSeconds = 86400;
    address private owner;

    struct Proposal {
        string name; // Candidat's name
        address sendAddress; 
        uint voteCount; // number of votes for this candidate
    }

    struct Vote {
        bool isVoteOnline;
        uint256 votePublishTime;
        mapping(address => bool) voters;
        uint256 balance;
        Proposal[] proposals;
        uint256 winningProposal;
        uint256 winningAmoungOfVotes;
        uint256 moneyOnVote;
    }
    bool[] pollsList;
    Vote[] votes;
    /**
    *
     */
    constructor() {
        
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only creator option");
        _;
    }
      
    /**
    * @dev Create a new vote to choose one of 'proposalNames'.
    * @param proposalAddresses addresses of candidats
    * @param proposalNames names of candidats
    */
    function createVote(address[] memory proposalAddresses,
                         string[] memory proposalNames) onlyOwner public {
        require(proposalAddresses.length != 0, "Amount of proposals > 0");
        require(proposalAddresses.length == proposalNames.length,
                 "Amount of addresses have to be equal to amount of names."
                 );
        
        votes.push();
        uint lastOfPolls = votes.length - 1;
        for (uint i = 0; i < proposalNames.length; i++) {
            votes[lastOfPolls].proposals.push();
            votes[lastOfPolls].proposals[i].name = proposalNames[i];
            votes[lastOfPolls].proposals[i].sendAddress = proposalAddresses[i];
            votes[lastOfPolls].proposals[i].voteCount = 0;    
        }
        
        uint lastVote = votes.length - 1;
        votes[lastVote].isVoteOnline = true;
        votes[lastVote].votePublishTime = block.timestamp;
        votes[lastVote].balance = 0;
       
        votes[lastVote].winningProposal = 0;
        votes[lastVote].winningAmoungOfVotes = 0;
        pollsList.push(true);
    }
    

    /**
    * @dev allows you to vote in the selected voting
    * @param numberOfVote number of vote in which we want to vote
    * @param proposal number of proposal
    */
    function vote(uint numberOfVote, uint proposal) public payable {
        require(votes.length > numberOfVote,
                 "This poll does not exist.");
         require(votes[numberOfVote].votePublishTime + 3 * dayToSeconds > block.timestamp, 
                "Vote is closed");
        require(msg.value >= 10 ** 16, 
                "Minimal deposit 0.01 ETH");
        require(votes[numberOfVote].voters[msg.sender] == false,
                 "You have already voted");

        votes[numberOfVote].proposals[proposal].voteCount += 1;
        votes[numberOfVote].voters[msg.sender] = true;
        votes[numberOfVote].moneyOnVote += msg.value;
        if (votes[numberOfVote].proposals[proposal].voteCount > 
            votes[numberOfVote].winningAmoungOfVotes) {

            votes[numberOfVote].winningProposal = proposal;
            votes[numberOfVote].winningAmoungOfVotes = votes[numberOfVote].proposals[proposal].voteCount;

        }
    }
    /**
    * @dev Close one of votes
    * @param numberOfVote number of vote which we want to close
    */
    function closeVote(uint numberOfVote) public payable{
        require(votes.length > numberOfVote,
                 "This vote does not exist.");
        require(votes[numberOfVote].isVoteOnline == true,
                 "This poll is already closed!");
        
        require(votes[numberOfVote].votePublishTime + 3 * dayToSeconds <= block.timestamp, 
                "Voting lasts three days!");
        
        Proposal memory winner = votes[numberOfVote].proposals[votes[numberOfVote].winningProposal];
        
        address payable winnerAddress = payable(winner.sendAddress);

        winnerAddress.transfer(votes[numberOfVote].moneyOnVote * 9 / 10);
        votes[numberOfVote].moneyOnVote = 
            votes[numberOfVote].moneyOnVote / 10;
        votes[numberOfVote].isVoteOnline = false;
        pollsList[numberOfVote] = false;
        // to do

    }
    /**
    * @dev send commission to the owner
    */
    function getCommission(uint voteNumber) public onlyOwner payable{
        require(votes[voteNumber].isVoteOnline == false, "This vote is still online!");
        address payable ownerAddress = payable(msg.sender);

        ownerAddress.transfer(votes[voteNumber].moneyOnVote);
        votes[voteNumber].moneyOnVote = 0;
    }
    /**
    * @dev say is vote open and amount of candidats in it
    * @param numberOfVote number of vote 
    */
    function getVoteInfo(uint numberOfVote) public view returns(bool, uint) {
        bool isVoteOnline = votes[numberOfVote].isVoteOnline;
        uint amountOfProposals = votes[numberOfVote].proposals.length;
        return (isVoteOnline, amountOfProposals);
    }

    /**
    * @dev Gives information about the candidate
    * @param numberOfVote voting number in which we want to participate
    * @param numberOfProposal candidat's number
    */
    function getProposalsInfo(uint numberOfVote,
                                uint numberOfProposal) 
                                public 
                                view 
                                returns(string memory, address, uint) {
        require(votes.length > numberOfVote,
                "This poll does not exist.");
        string memory proposalName = votes[numberOfVote].proposals[numberOfProposal].name;
        address proposalAddress = votes[numberOfVote].proposals[numberOfProposal].sendAddress;
        uint amountOfVotes = votes[numberOfVote].proposals[numberOfProposal].voteCount;
        return (proposalName, proposalAddress, amountOfVotes);
        
    }
    
    function getAmountOfPolls() public view returns(uint){
        return pollsList.length;
    }

    function openedPolls() public view returns(bool[] memory){
        return pollsList;
    }
}