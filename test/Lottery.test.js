const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
 
const { abi, evm } = require('../compile');
 
let lottery;
let accounts;
let manager;

const enter = (account, amount) => {
  return lottery.methods.enter().send({
    from: account,
    value: amount
  });
};

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();
  manager = accounts[0];
  lottery = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object
    })
    .send({ from: manager, gas: '1000000' });
});
 
describe('Lottery Contract', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  it('allows one account to enter', async () => {
    await enter(manager, web3.utils.toWei('0.011', 'ether'));
    const players = await lottery.methods.getPlayers().call();
    assert.equal(players.length, 1);
    assert.equal(players[0], manager);
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
    await assert.rejects(enter(manager, web3.utils.toWei('0.01', 'ether')));
    await assert.doesNotReject(enter(manager, web3.utils.toWei('0.011', 'ether')));
  });

  it('only allows the owner to call pickWinner', async () => {
    let notManager = accounts[1];
    await enter(manager, web3.utils.toWei('0.011', 'ether'));
    await assert.rejects(lottery.methods.pickWinner().send({ from: notManager }));
    await assert.doesNotReject(lottery.methods.pickWinner().send({ from: manager }));
  });

  it('sends money to the winner and resets the players array', async () => {
    await enter(manager, web3.utils.toWei('2', 'ether'));

    const initialBalance = await web3.eth.getBalance(manager);
    await lottery.methods.pickWinner().send({ from: manager });
    const finalBalance = await web3.eth.getBalance(manager);
    const difference = finalBalance - initialBalance;
    assert(difference > web3.utils.toWei('1.9', 'ether'));
    assert(difference < web3.utils.toWei('2', 'ether'));

    const players = await lottery.methods.getPlayers().call();
    assert.equal(players.length, 0);
    const contractBalance = await web3.eth.getBalance(lottery.options.address);
    assert.equal(contractBalance, 0);
  });

});