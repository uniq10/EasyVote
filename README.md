# EasyVote

> YouTube Video Link

<a href="http://www.youtube.com/watch?feature=player_embedded&v=MpJlG6-ZGic
" target="_blank"><img src="http://img.youtube.com/vi/YOUTUBE_VIDEO_ID_HERE/0.jpg" 
alt="EasyVote video" width="240" height="180" border="10" /></a>

> What is EasyVote?

Voting framework where people can vote on questions and choices.

> How it will help me?

One of the most critical ways that individuals can influence governmental decision-making is through voting. Fair and accurate elections are vital for a healthy democracy. Many voters choose not to vote to avoid travelling far and waiting in long queues. EasyVote gives you the freedom to vote from wherever you wish you, while ensuring security and transparency.

> Why is the blockchain necessary for voting?

Most voting systems suffer from 2 major problems - lack of transparency and security. No one knows if the counting process is correct and no one knows how many of the votes are not fake. Blockchain, inherently, ensures that the counting process is perfect since every vote is recorded on it. But there is a downside to it. How to ensure privacy in a system where everything is transparent? Here comes in blind signatures (help in secret ballots). It allows you to be cast your vote without linking your indentity to your vote. 

![alt text](/images/blind_sign.png "Registeration process")

![alt text](/images/verify.png "Verifying process")

Thus with blockchain and blind signatures (which work off-chain), you can vote from anywhere but be assured that the system is fair.

> How does it work? 

No central authority except to verify voter validity. The process begins with the voter registering himself to the central authority (the owner of the localbody) using the blind signature registeration process. After generating the unblined signed secret the voter waits for a cooldown period and send a transaction to the LocalBody contract from an anonymous address with his secret and the unblinded signature. The LocalBody is notified of this event through Ethereum Logs and it veririfes the signature and approves the anonymous voter address to vote.

Then the owner of the localbody can set up a poll which has yes/no options or multiple choice options (representing the different candidates for eg.) The voter can now use the anonymous address to cast a vote on the Ethereum blockchain. Once a vote is cast it cannot be changed, nor can a vote be cast after the deadline. The voter can see the results real time after voting.

![alt text](/images/process.png "Process")

> How to run it?

1. Run `npm install`
2. Run `testrpc` (at localhost: 8545)
3. Run `truffle compile`
4. Run `truffle migrate --reset`
5. Run `npm run dev`
6. Navigate to `localhost:8080` for the main page
7. Navigate to `localhost:8080/voter.html?id=<voter_id>` to view voter pages
8. By default 8 voters are provided to test the setup

> How to run the Blind Token prototype

Requirements: python3, crypto python pacakage

1. Run `scripts/blindSecret.py <your_secret_string> <random_number>`
2. You pass the generated blinded secret to the authority to sign: `scripts/signBlindSecret.py <blinded_secret>`
3. The authority returns the signed blinded secret to you and you generate the unblinded signature of your secret: `scripts/unblindSignedSecret.py <signed_blinded_secret> <same_random_number>`
4. Now you submit your secret and its unblinded signature to the authority to verify: `scripts/verifySignature.py <your_secret> <unblinded_signature>`
5. Any changes to your secert or your unblinded signature passed to the authority to verify will result in a signature mismatch
