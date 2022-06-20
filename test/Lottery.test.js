const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
 
const { abi, evm } = require('../compile');
 
let lottery;
let accounts;

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object
    })
    .send({ from: accounts[0], gas: '1000000' });
});
 
describe('Lottery Contract', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  it('can enter', async () => {
    await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('0.1', 'ether') });
    const players = await lottery.methods.getPlayers().call();
    assert.equal(players.length, 1);
    assert.equal(players[0], accounts[0]);
  });
});