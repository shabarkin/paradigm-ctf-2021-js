const { ethers } = require('hardhat');
const { expect } = require('chai');

const factoryJson = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const pairJson = require("@uniswap/v2-core/build/UniswapV2Pair.json");
const routerJson = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");

describe('[Challenge] Broker', function () {

        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        before(async function () {

            const ETHER100 = ethers.utils.parseEther('100');

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
            this.setup = await (await ethers.getContractFactory('SetupBouncer')).connect(deployer).deploy(
                this.weth9.address,
                { value: ETHER100 }
            );

            // print the setup contract address
            console.log("Setup contract address: " + this.setup.address);

                        // print eth balance of the exploit contract
                        console.log("ETH balance of the exploit contract: " + ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)));

            // print eth for setup bouncer contract
            console.log("ETH balance of the setup contract: " + ethers.utils.formatEther(await ethers.provider.getBalance(this.setup.bouncer())));

            // print line for separation
            console.log("-----------------------------------------------------");

        });
           
        it('Exploit', async function () {
            /** CODE YOUR EXPLOIT HERE */

            // deploy the exploit contract
            this.exploit = await (await ethers.getContractFactory('ExploitBouncer')).connect(attacker).deploy(
                this.setup.address,
                { value: ethers.utils.parseEther('1') }
            );

            // execute the go function of the exploit contract
            await this.exploit.connect(attacker).go({ value: ethers.utils.parseEther('17') });


            // print eth balance of the exploit contract
            console.log("ETH balance of the exploit contract: " + ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)));
            // print eth for setup bouncer contract
            console.log("ETH balance of the setup contract: " + ethers.utils.formatEther(await ethers.provider.getBalance(this.setup.bouncer())));

        });

        after(async function () {
            /** SUCCESS CONDITIONS */
            expect(
                await this.setup.isSolved()
            ).to.eq(true);
        });

});
