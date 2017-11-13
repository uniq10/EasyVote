pragma solidity ^0.4.13;

import "./Owned.sol";
import "./Localbody.sol";

contract Voter is Owned {

    address public localBodyAddress;
    uint public refundAmount;

    function Voter(address _localBodyAddress) {
        require(_localBodyAddress != 0);

        localBodyAddress = _localBodyAddress;
    }

    function castVote(string question, uint index)
        public
        fromOwner
        returns(bool)
    {
        Localbody localBody = Localbody(localBodyAddress);
        localBody.castVote(question, index);

        return true;
    }

    function getRefund()
        public
        fromOwner
        returns(bool)
    {
        uint amount = refundAmount;
        refundAmount = 0;
        msg.sender.transfer(amount);

        return true;
    }

    function acceptAmount()
        public
        payable
        returns(bool)
    {
        refundAmount += msg.value;

        return true;
    }

}
