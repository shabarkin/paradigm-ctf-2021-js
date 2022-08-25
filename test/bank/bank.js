const { ethers } = require('hardhat');
const { expect } = require('chai');

const factoryJson = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const pairJson = require("@uniswap/v2-core/build/UniswapV2Pair.json");
const routerJson = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");

describe('[Challenge] Broker', function () {

        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        before(async function () {

            const ETHER55 = ethers.utils.parseEther('55');

            [deployer, attacker] = await ethers.getSigners();

            // deployer starts with little ETH balance
            await ethers.provider.send("hardhat_setBalance", [
                deployer.address,
                "0x5F68E8131ECF80000", // 110 ETH
            ]);


            // attacker starts with 5000 ETH balance, the initial balance of the attacker in paradigm CTF
            await ethers.provider.send("hardhat_setBalance", [
                attacker.address,
                "0x10F0CF064DD59200000", // 5000 ETH
            ]);
                
            // deploy weth9 contract
            this.weth9 = await (await ethers.getContractFactory('WETH9')).deploy();

            // deploy setup contract and set up weth and factory addresses
            this.setup = await (await ethers.getContractFactory('SetupBank')).connect(deployer).deploy(
                this.weth9.address,
                { value: ETHER55 }
            );

            // print the setup contract address
            console.log("Setup contract address: " + this.setup.address);

            // print weth balance of the aggregator, took the aggregator from the setup contract
            console.log("WETH balance of the bank: " + ethers.utils.formatEther(await this.weth9.balanceOf(this.setup.bank()))); 

            // print line for separation
            console.log("-----------------------------------------------------");

        });
           
        it('Exploit', async function () {
            /** CODE YOUR EXPLOIT HERE */

            // deploy the exploit contract as an attacker
            this.exploit = await (await ethers.getContractFactory('ExploitBank')).connect(attacker).deploy(
                this.setup.address,
                { value: ethers.utils.parseEther('1') }
            );

            // print weth balance of the aggregator, took the aggregator from the setup contract
            console.log("WETH balance of the bank: " + ethers.utils.formatEther(await this.weth9.balanceOf(this.setup.bank()))); 
            
            // print weth balance of the attacker, took the attacker from the setup contract
            console.log("WETH balance of the attacker: " + ethers.utils.formatEther(await this.weth9.balanceOf(this.exploit.token())));

            // attach the ExploitToken contract
            this.exploitToken = await (await ethers.getContractFactory('ExploitToken')).attach(this.exploit.token()); 

            // print the uint256 accountId of the exploit contract
            console.log("AccountId of the exploit contract: " + await this.exploitToken.accountId());

        });

        after(async function () {
            /** SUCCESS CONDITIONS */
            expect(
                await this.setup.isSolved()
            ).to.eq(true);
        });

});
