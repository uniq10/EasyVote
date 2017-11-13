pragma solidity ^0.4.13;

import "./Owned.sol";
import "./Voter.sol";

contract Localbody is Owned {

    struct QuestionDetails {
        bool isValid;
        bool isApproved;
        uint numOptions;
        uint deadline;
        mapping(uint => bytes32) options;
        mapping(uint => uint) votes;
        mapping(address => bool) hasVoted;
    }

    struct VoterDetails {
        bool isValid;
        bool isApproved;
        bytes32 secret;
    }

    uint public balance;
    uint public voterBaseRefund;
    mapping(bytes32 => QuestionDetails) internal questionMap;
    mapping(address => VoterDetails) public voterMap;

    event LogQuestionAdded(string question);
    event LogQuestionApproved(string question);
    event LogVoterApprovalPending(
            address indexed voterAddress,
            address indexed ownerAddress,
            bytes32 secret);
    event LogVoterApproved(address indexed voterAddress);

    function Localbody(uint _voterBaseRefund)
    {
        voterBaseRefund = _voterBaseRefund;
    }

    function addEther()
        public
        payable
    {
        balance += msg.value;
    }

    function addQuestion(string question, uint deadline)
        public
        fromOwner
        returns(bool)
    {
        require(deadline > 0);
        bytes32 questionHash = keccak256(question);
        QuestionDetails storage questionState = questionMap[questionHash];
        require(!questionState.isValid);

        questionState.isValid = true;
        questionState.deadline = block.number + deadline;

        LogQuestionAdded(question);

        return true;
    }

    function addOption(string question, bytes32 option)
        public
        fromOwner
        returns(bool)
    {
        bytes32 questionHash = keccak256(question);
        QuestionDetails storage questionState = questionMap[questionHash];
        require(questionState.isValid);
        require(questionState.deadline > block.number);
        require(!questionState.isApproved);

        questionState.options[questionState.numOptions] = option;
        questionState.numOptions++;

        return true;
    }

    function approveQuestion(string question)
        public
        fromOwner
        returns(bool)
    {
        bytes32 questionHash = keccak256(question);
        QuestionDetails storage questionState = questionMap[questionHash];
        require(questionState.isValid);
        require(questionState.deadline > block.number);
        require(questionState.numOptions > 1);
        require(!questionState.isApproved);

        questionState.isApproved = true;

        LogQuestionApproved(question);

        return true;
    }

    function addYesNoQuestion(string question, uint deadline)
        public
        fromOwner
        returns(bool)
    {
        require(deadline > 0);
        bytes32 questionHash = keccak256(question);
        QuestionDetails storage questionState = questionMap[questionHash];
        require(!questionState.isValid);

        questionState.isValid = true;
        questionState.numOptions = 2;
        questionState.options[0] = bytes32("Yes");
        questionState.options[1] = bytes32("No");
        questionState.deadline = block.number + deadline;
        questionState.isApproved = true;

        LogQuestionAdded(question);
        LogQuestionApproved(question);

        return true;
    }

    function createVoter(bytes32 secret)
        public
        returns(Voter)
    {
        Voter voter = new Voter(address(this));
        voter.setOwner(msg.sender);
        voterMap[address(voter)] = VoterDetails(true, false, secret);

        LogVoterApprovalPending(address(voter), msg.sender, secret);

        return voter;
    }

    function approveVoter(address voterAddress)
        public
        fromOwner
        returns(bool)
    {
        VoterDetails storage voterState = voterMap[voterAddress];
        require(voterMap[voterAddress].isValid);
        require(!voterMap[voterAddress].isApproved);

        voterState.isApproved = true;

        LogVoterApproved(voterAddress);

        return true;
    }

    function castVote(string question, uint index)
        public
        returns(bool)
    {
        require(voterMap[msg.sender].isApproved);
        QuestionDetails storage questionState = questionMap[keccak256(question)];
        require(questionState.isApproved);
        require(index < questionState.numOptions);
        require(questionState.deadline > block.number);
        require(!questionState.hasVoted[msg.sender]);

        questionState.votes[index]++;
        questionState.hasVoted[msg.sender] = true;
        balance -= voterBaseRefund;
        Voter voter = Voter(msg.sender);
        require(voter.acceptAmount.value(voterBaseRefund)());

        return true;
    }

    function setVoterBaseRefund(uint amount)
        public
        fromOwner
        returns(bool)
    {
        voterBaseRefund = amount;

        return true;
    }

    function getOption(string question, uint index)
        constant
        public
        returns(bytes32)
    {
        return questionMap[keccak256(question)].options[index];
    }

    function getVotes(string question, uint index)
        constant
        public
        returns(uint)
    {
        bytes32 questionHash = keccak256(question);

        return questionMap[questionHash].votes[index];
    }

    function getVoterApprovedStatus(address voterAddress)
        constant
        public
        returns(bool)
    {
        return voterMap[voterAddress].isApproved;
    }

    function getQuestionDeadline(string question)
        constant
        public
        returns(uint)
    {
        return questionMap[keccak256(question)].deadline;
    }

    function hasUserVoted(string question, address voter)
        constant
        public
        returns(bool)
     {
         return questionMap[keccak256(question)].hasVoted[voter];
     }

     function getNumOptions(string question)
        constant
        public
        returns(uint)
     {
         return questionMap[keccak256(question)].numOptions;
     }

}
