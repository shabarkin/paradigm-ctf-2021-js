const { ethers } = require('hardhat');
const { expect } = require('chai');

const factoryJson = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const pairJson = require("@uniswap/v2-core/build/UniswapV2Pair.json");
const routerJson = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");

describe('[Challenge] Broker', function () {

        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        before(async function () {

            [deployer, attacker, a, b, c, d, qm, t, y, u, i] = await ethers.getSigners();

            // deployer starts with little ETH balance
            await ethers.provider.send("hardhat_setBalance", [
                deployer.address,
                "0x56BC75E2D63100000", // 100 ETH
            ]);

            // attacker starts with 5000 ETH balance, the initial balance of the attacker in paradigm CTF
            await ethers.provider.send("hardhat_setBalance", [
                attacker.address,
                "0x10F0CF064DD59200000", // 5000 ETH
            ]);

            // deploy setup contract and set up weth and factory addresses
            this.setup = await (await ethers.getContractFactory('SetupVault')).deploy();

        });
           
        it('Exploit', async function () {
            /** CODE YOUR EXPLOIT HERE */

            // deploy the exploitvault contract

            this.exploitvault = await (await ethers.getContractFactory('ExploitVault')).connect(attacker).deploy(
                this.setup.address
            );
        
            await this.exploitvault.connect(attacker).part1();

            // handle the error thrown by the exploit

            await this.exploitvault.connect(attacker).part2();
            
        });

        after(async function () {
            /** SUCCESS CONDITIONS */
            expect(
                await this.setup.isSolved()
            ).to.eq(true);
        });

});
