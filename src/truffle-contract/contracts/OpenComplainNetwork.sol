pragma solidity ^0.4.11;

contract OpenComplainNetwork {
    enum Status { Pending, Accepted, Resolved, Proposed }
    
    struct Complain {
        /*bytes[50] _name;
        bytes[50] _address;
        bytes[50] _desc;
        bytes[50] _location;
        bytes[50] _category;*/
        uint _lat;
        uint _long;
        uint _category;
        string _data;
        address _personID;
        Status _status;
        uint _reward;
        address _policeAssigned;
        address[] _contributors;
        uint[] _contAmount;
    }
    
    uint private complainCounter;
    mapping(uint => Complain) private complainMap;
    mapping(address => bool) private policeAccounts;
    address private superuser;
    mapping(uint => address) private complainSolver;
    
    function OpenComplainNetwork() public {
        superuser = msg.sender;
        complainCounter = 0;
    }
    
    modifier superuserAccess() {
        require(msg.sender == superuser);
        _;
    }
    
    modifier policeAccess {
        require(policeAccounts[msg.sender] == true);
        _;
    }
    
    modifier complainOwnerAccess(uint cid) {
        require(msg.sender == complainMap[cid]._personID);
        _;
    }
    
    modifier complainOwnOrPoliceAccess(uint cid) {
        require(policeAccounts[msg.sender] == true || msg.sender == complainMap[cid]._personID);
        _;
    }
    
    function registerComplain(string data, uint long, uint lat, uint cat) public payable returns(uint) {
        complainMap[complainCounter]._long = long;
        complainMap[complainCounter]._lat = lat;
        complainMap[complainCounter]._category = cat;
        complainMap[complainCounter]._data = data;
        complainMap[complainCounter]._personID = msg.sender;
        complainMap[complainCounter]._status = Status.Pending;
        complainMap[complainCounter]._reward = msg.value;

        if(msg.value > 0) {
            complainMap[complainCounter]._contributors.push(msg.sender);
            complainMap[complainCounter]._contAmount.push(msg.value);
        }
        /*for(uint i=0; i<data.length; i++) {
            complainMap[complainCounter]._data[i] = data[i];
        }*/
        complainCounter++;
        
        return complainCounter-1;
    }

    function viewComplain(uint cid) public constant returns (uint, uint, uint, uint, uint, string, Status) {
        return (cid, complainMap[cid]._reward, complainMap[cid]._long, complainMap[cid]._lat, complainMap[cid]._category, complainMap[cid]._data, complainMap[cid]._status);
    }
    
    function changeStatus(uint cid, Status sta) public policeAccess {
        require((sta <= Status.Resolved) || (sta >= Status.Pending));
        complainMap[cid]._status = sta;
        
        // What if a person solves the problem and then the police 
        // updates the status to resolved. complainSolver[cid] = 'Police'
        // no funds to the Original Solver. 
        if(sta == Status.Resolved) {
            complainSolver[cid] = msg.sender;
        }
    }
    
    // Even though Police can resolve and close the complain.
    // Complainee would be responsible for transfering the funds, if any.
    function resolve(uint cid) public complainOwnerAccess(cid) {
        complainMap[cid]._status = Status.Resolved;
        
        transferFundOnResolve(cid);
    }
    
    function declineProposal(uint cid) public complainOwnerAccess(cid) {
        require( complainMap[cid]._status == Status.Proposed );
        complainMap[cid]._status = Status.Accepted;
        
        complainSolver[cid] = 0;
    }
    
    // If someone other than police solved the complain transfer funds to solver.
    // Otherwise send them back to the contributors.
    function transferFundOnResolve(uint cid) private {
        // Could also be used: complainMap[cid]._status == Status.Resolved && 
        if(complainMap[cid]._reward > 0) {
            if(policeAccounts[complainSolver[cid]] != true) {
                complainSolver[cid].transfer( complainMap[cid]._reward );
                complainMap[cid]._reward = 0;
            }
            else {
                for(uint i=0; i<complainMap[cid]._contributors.length; i++) {
                    complainMap[cid]._contributors[i].transfer( complainMap[cid]._contAmount[i] );
                }
                complainMap[cid]._reward = 0;
                
            }
        }
    }
    
    function modifyPoliceAccounts(address[] accounts) public superuserAccess {
        for(uint i=0; i<accounts.length; i++) {
            policeAccounts[accounts[i]] = true;
        }
    }
    
    function fundComplain(uint cid) public payable {
        require((complainMap[cid]._status == Status.Accepted) || (complainMap[cid]._status == Status.Proposed));
        complainMap[cid]._reward += msg.value;
        complainMap[cid]._contributors.push(msg.sender);
        complainMap[cid]._contAmount.push(msg.value);
    }
    
    function claimSolution(uint cid) public {
        // Police should accept the complain first.
        require(complainMap[cid]._status == Status.Accepted || complainMap[cid]._status == Status.Pending);
        complainMap[cid]._status = Status.Proposed;
        complainSolver[cid] = msg.sender;
    }
    
    function checkFund() public constant returns(uint) {
        return this.balance;
    }
    
    function checkIfPoliceAccount(address pid) public constant returns(bool) {
        return policeAccounts[pid];
    }
    
    

}