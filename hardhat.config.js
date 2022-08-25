require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  //allowUnlimitedContractSize: true,
  solidity: {
    compilers: [
      { version: "0.8.7" },
      { version: "0.8.0" },
      { version: "0.7.0" },
      { version: "0.6.6" },
      { version: "0.5.12" },
      { version: "0.4.24" },
      { version: "0.4.16" },
    ]
  },
};
