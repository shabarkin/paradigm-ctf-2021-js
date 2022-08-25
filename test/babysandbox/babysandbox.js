const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] BabySandbox', function () {

        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        before(async function () {
            [deployer, attacker] = await ethers.getSigners();
            // Deploy Setup contract
            this.setup = await (await ethers.getContractFactory('SetupBabySandbox', deployer)).deploy();
        });
           
        it('Exploit', async function () {
            /** CODE YOUR EXPLOIT HERE */

            this.baby = await (await ethers.getContractFactory('BabySandbox', attacker)).attach(
                await this.setup.sandbox()
            );

            this.exploit = await (await ethers.getContractFactory('ExploitBabySandbox', attacker)).deploy(
            );


            //console.log('Exploit address:',  await this.baby.trigger());

            this.exploit.execute(this.setup.address);

          //  console.log('Exploit address:',  await this.baby.trigger());

            
        });

        after(async function () {
            /** SUCCESS CONDITIONS */
            expect(
                await this.setup.isSolved()
            ).to.eq(true);
        });

});
