const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
 
const { abi, evm } = require('../compile');
 
let lottery;
let accounts;

const enter = (account, amount) => {
  return lottery.methods.enter().send({
    from: account,
    value: amount
  });
};

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

  it('allows one account to enter', async () => {
    await enter(accounts[0], web3.utils.toWei('0.011', 'ether'));
    const players = await lottery.methods.getPlayers().call();
    assert.equal(players.length, 1);
    assert.equal(players[0], accounts[0]);
  });

  it('allows multiple accounts to enter', async () => {
    await enter(accounts[0], web3.utils.toWei('0.011', 'ether'));
    await enter(accounts[1], web3.utils.toWei('0.011', 'ether'));
    await enter(accounts[2], web3.utils.toWei('0.011', 'ether'));

    const players = await lottery.methods.getPlayers().call();
    assert.equal(players.length, 3);
    assert.equal(players[0], accounts[0]);
    assert.equal(players[1], accounts[1]);
    assert.equal(players[2], accounts[2]);
  });

  it('requires a minimum amount of ether to enter', async () => {
    let error;
    try {
      await enter(accounts[0], web3.utils.toWei('0.01', 'ether'));
    } catch (err) {
      error = err;
    }
    assert.ok(error);
  });

});