import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import 'dotenv/config';
require('dotenv').config();

async function main() {
  const MINT_VALUE = 1000000000000000000n;
  const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
 
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider)
  const acc1 = new ethers.Wallet(process.env.ACC1_PRIVATE_KEY ?? "", provider)
  const acc2 = new ethers.Wallet(process.env.ACC2_PRIVATE_KEY ?? "", provider)
  const contractFactory = new MyToken__factory(wallet);
  const contract = await contractFactory.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Token contract deployed at ${contractAddress}\n`);

  console.log(`Wallet used - Deployer : ${wallet.address}\n`);
  console.log(`Wallet used - ACC1 : ${acc1.address}\n`);
  console.log(`Wallet used - ACC2 : ${acc2.address}\n`);
  const mintTx = await contract.mint(acc1.address, MINT_VALUE);
await mintTx.wait(15);
console.log(
  `Minted ${MINT_VALUE.toString()} decimal units to account ${acc1.address}\n`
);


// const sendETHToACC1 = await wallet.sendTransaction({
//   to: acc1.address,
//   value: ethers.parseUnits('0.001', 'ether'),
// });
// console.log(sendETHToACC1);

// const sendETHToACC2 = await wallet.sendTransaction({
//   to: acc2.address,
//   value: ethers.parseUnits('0.001', 'ether'),
// });
// console.log(sendETHToACC2);


const votes = await contract.getVotes(acc1.address);
console.log(
  `Account ${
    acc1.address
  } has ${votes.toString()} units of voting power before self delegating\n`
);

const delegateTx = await contract.connect(acc1).delegate(acc1.address);
await delegateTx.wait();
const votesAfter = await contract.getVotes(acc1.address);
console.log(
  `Account ${
    acc1.address
  } has ${votesAfter.toString()} units of voting power after self delegating\n`
);

const tokenBalanceACC1 = await contract.balanceOf(acc1.address);
console.log(
  `Account ${
    acc1.address
  } has ${tokenBalanceACC1.toString()} decimal units of MyToken\n`
);

const transferTx = await contract
  .connect(acc1)
  .transfer(acc2.address, MINT_VALUE / 2n);
await transferTx.wait();
const votes1AfterTransfer = await contract.getVotes(acc1.address);
console.log(
  `Account ${
    acc1.address
  } has ${votes1AfterTransfer.toString()} units of voting power after transferring\n`
);

// const votes2AfterTransfer = await contract.getVotes(acc2.address);
// console.log(
//   `Account ${
//     acc2.address
//   } has ${votes2AfterTransfer.toString()} units of voting power after receiving a transfer\n`
// );

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});