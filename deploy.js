const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
 
const { abi, evm } = require('./compile');
 
provider = new HDWalletProvider(
    'region range hold discover relief that consider thunder priority explain receive cactus',
    'https://rinkeby.infura.io/v3/7fae2aed999247a8935ebff226d3e03b'
);
 
const web3 = new Web3(provider);
 
const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
 
  console.log('Attempting to deploy from account', accounts[0]);
 
  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object, arguments: [] })
    .send({ gas: '1000000', from: accounts[0] });
 
  console.log(JSON.stringify(abi));
  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();
};
 
deploy();