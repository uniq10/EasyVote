pragma solidity ^0.4.13;

contract Owned {

    address internal owner;

    event LogOwnerSet(address indexed previousOwner, address indexed newOwner);

    modifier fromOwner() {
        require(msg.sender == owner);
        _;
    }

    function Owned() {
        owner = msg.sender;
    }

    function getOwner()
        constant
        public
        returns(address)
    {
        return owner;
    }

    function setOwner(address newOwner)
        fromOwner
        returns(bool)
    {
        require(newOwner != owner);
        require(newOwner != 0);

        LogOwnerSet(owner, newOwner);
        owner = newOwner;

        return true;
    }

}
