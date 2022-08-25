# Walkthrough solutions
https://shabarkin.notion.site/Paradigm-CTF-2021-8b64c95c0e264e978d61a75f64da6d03

Run yarn command to add hardhat environment:
```shell
yarn add --dev hardhat
```

Run the solution: 
```json
{
    "babysandbox": "yarn hardhat test test/babysandbox/babysandbox.js",
    "broker": "yarn hardhat test test/broker/broker.js",
    "yield-aggregator": "yarn hardhat test test/yield-aggregator/yield-aggregator.js",
    "bank": "yarn hardhat test test/bank/bank.js",
    "bouncer": "yarn hardhat test test/bouncer/bouncer.js",
    "vault": "yarn hardhat test test/vault/vault.js"
 }
```
