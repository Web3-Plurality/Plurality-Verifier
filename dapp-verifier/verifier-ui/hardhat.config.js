/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// test account for development
const Private_Key = "395b681d8f9b4bb0719017ca40adb6017e3b555abc5277a107041ffcbac409d6"

module.exports = {
  solidity: "0.8.4",
  networks: {
    sepolia: {
        // TODO: Change this quiknode url to infura url
        url: `https://frosty-young-slug.ethereum-sepolia.discover.quiknode.pro/976585700ba4db38a305a56f8e3cdbcc01dbc116/`,
        accounts: [`0x${Private_Key}`],
    }
  }
};

