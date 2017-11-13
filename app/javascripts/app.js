import "../stylesheets/app.css";

import { default as Web3} from "web3";
import { default as contract } from "truffle-contract"

import localbody_artifacts from "../../build/contracts/Localbody.json"
import voter_artifacts from "../../build/contracts/Voter.json"

var Localbody = contract(localbody_artifacts);
var Voter = contract(voter_artifacts);

var accounts;
var localbodyOwner;
var blockNumber = 0;
var gasValue = 3000000;
var initialEther = 10;
var numOptions = 2;

window.App = {
    start: function() {
        var self = this;

        Localbody.setProvider(web3.currentProvider);
        Voter.setProvider(web3.currentProvider);

        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
             }

            if (accs.length == 0) {
                alert("Couldn't get any accounts!"
                        + "Make sure your Ethereum client is configured correctly.");
                return;
            }

            accounts = accs;
            console.log("Accounts: ", accounts);
        });


        web3.eth.getBlockNumber(function(err, blk) {
            if(err!=null) {
                console.log(err);
                return;
            }
            blockNumber = blk;
            console.log("Current Block Number:", blockNumber);
        });

        Localbody.deployed().then(instance => {
            return instance.getOwner.call();
        }).then(owner => {
            localbodyOwner = owner;
            console.log("Localbody Owner: ", localbodyOwner);
        });

    },

    setStatus: function(message) {
        var elem = document.getElementById("status");
        elem.innerHTML = message;
    },

    setCompletedPolls: function(message) {
        var elem = document.getElementById("completedPolls");
        elem.innerHTML = message;
    },

    setVotedPolls: function(message) {
        var elem = document.getElementById("votedPolls");
        elem.innerHTML = message;
    },

    setActivePolls: function(message) {
        var elem = document.getElementById("activePolls");
        elem.innerHTML = message;
    },

    setPollQuestion: function(message) {
        var elem = document.getElementById("poll");
        elem.innerHTML = message;
    },

    setOptions: function(message) {
        var elem = document.getElementById("options");
        elem.innerHTML = message;
    },

    showVoteButton: function() {
        var elem = document.getElementById("vote");
        elem.innerHTML = "<button onclick=\"App.castVote()\">Vote</button><br>";
    },

    addOption: function() {
        numOptions += 1;
        var elem = document.getElementById("optionsDiv");
        var optionStr = "<label id=\"MCQOpt" + numOptions + "label\" for=\"MCQOpt"
                + numOptions + "\">Option " + numOptions + ": </label>"
                + "<input type=\"text\" id=\"MCQOpt"
                + numOptions + "\"></input>"
                + "<br id=\"MCQOpt" + numOptions + "br\">";
        elem.insertAdjacentHTML('beforeend', optionStr);
    },

    removeOption: function() {
        if(numOptions <= 2) return;
        var elem = document.getElementById("MCQOpt" + numOptions);
        elem.parentNode.removeChild(elem);
        var elem = document.getElementById("MCQOpt" + numOptions + "label");
        elem.parentNode.removeChild(elem);
        var elem = document.getElementById("MCQOpt" + numOptions + "br");
        elem.parentNode.removeChild(elem);
        numOptions -= 1;
    },

    createMCQs: function() {
        var self = this;
        var MCQOpts = [];
        for(var i = 1; i <= numOptions; i++) {
            MCQOpts[MCQOpts.length] = document.getElementById("MCQOpt" + i).value;
        }
        console.log("createMCQs:- MCQ Options:", MCQOpts);

        var qs = document.getElementById("MCQs").value;
        var deadline = parseInt(document.getElementById("MCQDeadline").value);
        this.setStatus("Creating Poll...");

        Localbody.deployed()
            .then(instance => {
                instance.addQuestion(
                    qs,
                    deadline,
                    { from: localbodyOwner, gas: gasValue }
                ).then( () => {
                    return (function loop(i) {
                        console.log("createMCQs:- Adding option:", MCQOpts[i]);
                        return instance.addOption(
                            qs,
                            web3.fromAscii(MCQOpts[i]),
                            { from: localbodyOwner, gas: gasValue}
                        ).then( () => {
                            if(i < numOptions - 1) {
                                return loop(i+1);
                            } else {
                                return instance.approveQuestion(
                                        qs,
                                        { from: localbodyOwner, gas: gasValue});
                            }
                         });
                    })(0);
                }).then( () => {
                    self.setStatus("Poll created.");
                }).catch( err => {
                    console.log("createMCQs:- Error:", err);
                    self.setStatus("Poll creation failed. Check log.");
                });
            });

    },

    fillOptions: function(voterId, question) {
        var self = this;
        question = String(question);
        console.log("fillOptions:- Question:", question);

        var buttons = "";

        Localbody.deployed()
            .then(instance => {
                return instance.getNumOptions(String(question))
                    .then(opts => {
                        opts = opts.toNumber();
                        console.log("fillOptions:- Num. Options:", opts);
                        (function loop(i) {
                           instance.getOption(question, i)
                                .then(ans => {
                                    console.log("fillOptions:- Option", i, ":", web3.toUtf8(ans));
                                    ans = web3.toUtf8(ans);
                                    buttons += '<input type="radio"'
                                        + ' name="choice" value=' + i
                                        + '>'
                                        + ans + '<br>';
                                    self.setOptions(buttons);
                                }).then( () => {
                                    if(i < opts - 1) {
                                        loop(i+1);
                                    }
                                });
                        })(0);
                    });
            });
        self.showVoteButton();
    },

    castVote: function() {
        var voter = parseInt(getUrlParameter('id'));
        var ques = getUrlParameter('ques');
        var voterAddress;
        var option = document.querySelector('input[name="choice"]:checked').value;
        var self = this;
        this.setStatus("Casting Vote...");


        Localbody.deployed()
            .then(instance => {
                let voterApprovedEvent = instance.LogVoterApprovalPending(
                        { ownerAddress: accounts[voter] },
                        { fromBlock: 0, toBlock: "latest" });
                voterApprovedEvent.get(function(err, result) {
                    voterAddress = result[result.length - 1]["args"]["voterAddress"];
                   Voter.at(voterAddress)
                        .then(ins => {
                            console.log("castVote:- Voter addr.:", accounts[voter]);
                            console.log("castVote:- Question:", ques);
                            console.log("castVote:- Option:", option);
                            console.log("castVote:- Voter ins.:", ins);
                            return ins.castVote(ques, option,
                                    { from: accounts[voter], gas: gasValue  });
                        }).then( () => {
                            self.setStatus("Vote casted.");
                            self.showResults();
                        }).catch(err => {
                            self.setStatus("Vote failed. See logs.");
                            console.log("castVote:- Error:", err);
                        });
                });
            });


    },

    showResults: function() {
        var ques = getUrlParameter('ques');
        var resultText = "";
        var self = this;
        console.log("showResults:- Question:", ques);

        Localbody.deployed()
            .then(instance => {
                return instance.getNumOptions(ques)
                .then(opts => {
                opts = opts.toNumber();
                console.log("showResults:- Num. Options:", opts);
                (function loop(i) {
                    var option;
                    instance.getOption(ques, i)
                        .then( optName => {
                            option = web3.toUtf8(optName);
                            console.log("showResults:- Option", i, ":", option);
                            return instance.getVotes(ques, i);
                        }).then(ans => {
                            console.log("showResults:- Votes for ", option, ":", ans.toNumber());
                            ans = ans.toNumber();
                            resultText += option + ": " + ans + "<br>";
                            self.setStatus(resultText);
                        }).then( () => {
                            if(i < opts - 1) {
                                loop(i+1);
                            }
                        });
                })(0);
            });
            });
    },

    createYesNoQs: function() {
        var self = this;
        var qs = document.getElementById("yesNoQs").value;
        var deadline = parseInt(document.getElementById("yesNoDeadline").value);
        this.setStatus("Creating Poll...");

        Localbody.deployed()
            .then(instance => {
                return instance.addYesNoQuestion(
                    qs,
                    deadline,
                    { from: localbodyOwner, gas: gasValue });
            }).then( () => {
                self.setStatus("Yes/No Poll created.");
            }).catch( err => {
                console.log("createYesNoQs:- Error:", err);
                self.setStatus("Poll creation failed. Check log.");
            });

    },

    fillPolls: function(voterId) {
        var self = this;
        var voterAddress;
        var activePollsOut = '<table style="width:100%">';
        var votedPollsOut = '<table style="width:100%">';
        var completedPollsOut = '<table style="width:100%">';

        Localbody.deployed()
            .then(instance => {
                let voterApprovedEvent = instance.LogVoterApprovalPending(
                        { ownerAddress: accounts[voterId] },
                        { fromBlock: 0, toBlock: "latest" });
                voterApprovedEvent.get(function(err, result) {
                    voterAddress = result[result.length - 1]["args"]["voterAddress"];
                    let questionApprovedEvent = instance.LogQuestionApproved(
                            { },
                            { fromBlock: 0, toBlock: "latest" });
                    questionApprovedEvent.get(function(qerr, qresult) {
                        (function loop(i) {
                            instance.getQuestionDeadline(
                                    qresult[i]["args"]["question"])
                                .then(dline => {
                                    console.log("fillPolls:- Deadline for ques.", i, ":", dline.toNumber());
                                    if(dline.toNumber() > blockNumber) {
                                        return instance.hasUserVoted(
                                            qresult[i]["args"]["question"],
                                            voterAddress);
                                    } else {
                                        return 2;
                                    }
                                }).then(res => {
                                    console.log("fillPolls:- Deadline status of ques.", i, ":", res);
                                    var ques = qresult[i]["args"]["question"];
                                    console.log("fillPolls:- Question", i, ":", ques);
                                    if(res == 2) {
                                        completedPollsOut += '<tr>'
                                                + '<td><a href="./vote.html?id='
                                                + voterId + '&ques='
                                                + ques
                                                + '&type=result">'
                                                + ques
                                                + '</a></td></tr>';
                                        self.setCompletedPolls(completedPollsOut
                                                + '</table>');
                                        return true;
                                    } else if(res == true) {
                                        votedPollsOut += '<tr>'
                                                + '<td><a href="./vote.html?id='
                                                + voterId + '&ques='
                                                + ques
                                                + '&type=result">'
                                                + ques
                                                + '</a></td></tr>';
                                        self.setVotedPolls(votedPollsOut
                                                + '</table>');
                                        return true;
                                    } else {
                                        activePollsOut += '<tr>'
                                                + '<td><a href="./vote.html?id='
                                                + voterId + '&ques='
                                                + ques
                                                + '&type=vote">'
                                                + ques
                                                + '</a></td></tr>';
                                        self.setActivePolls(activePollsOut
                                                + '</table>');
                                        return true;
                                    }
                                }).then( () => {
                                    if(i < qresult.length - 1) {
                                        loop(i+1);
                                    }
                            })
                        })(0);
                    });
                });
            });

    }


};

window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    App.start();
});
