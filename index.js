import { ethers } from "./ethers-5.2.esm.min.js"; //taken from link in ethers documentation
import { abi, contractAddress } from "./constants.js";

// we gotta add this shit here instead of HTML because of specifying type as module in script
const connectButton = document.getElementById("connect");
const fundButton = document.getElementById("fund");
const withdrawButton = document.getElementById("withdraw");
const balanceButton = document.getElementById('balance')
connectButton.onclick = handleConnect;
fundButton.onclick = fund;
withdrawButton.onclick = withdraw;
balanceButton.onclick = getBalance;

let accounts;
async function handleConnect() {
  if (window.ethereum.isMetaMask == true) {
    console.log("Metamask detected!");
    try {
      accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
    } catch (err) {
      if (err.code == 4001) {
        console.log("please connect to metamask");
      } else {
        console.log(err);
      }
    }
    let account = accounts[0];
    const abc = document.createElement("div");
    abc.className = "para smol";
    abc.innerHTML = `Connected successfully to ${account}`;
    document.getElementsByClassName('body')[0].appendChild(abc)
    connectButton.innerHTML = "connected";
  } else {
    console.log("Please install metamask.");
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  // provider, signer, abi, binary
  console.log(`Funding with ${ethAmount}`);
  const provider = await new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();
  const fundMe = await new ethers.Contract(contractAddress, abi, signer);
  const TxResponse = await fundMe.fund({
    value: ethers.utils.parseEther(ethAmount),
  });
  await listenForTxMine(TxResponse, provider);
  console.log("Done!");
}

async function withdraw() {
  console.log("Withdrawing ...");
  const provider = await new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();
  const fundMe = await new ethers.Contract(contractAddress, abi, signer);
  const TxResponse = await fundMe.withdraw();
  await listenForTxMine(TxResponse, provider)
  console.log("Withdrawn!")
}

function listenForTxMine(TxResponse, provider) {
  console.log(`Waiting for ${TxResponse.hash} to mine.`);
  return new Promise((resolve, reject) => {
    try {
      provider.once(TxResponse.hash, (transactionReceipt) => {
        console.log(
          `Mined after ${transactionReceipt.confirmations} confirmations.`
        );
        resolve();
      });
    } catch (error) {
      console.log(error);
    }
  });
}

async function getBalance(){
    const provider = await new ethers.providers.Web3Provider(window.ethereum)
    const signer = await provider.getSigner();
    const balance = await signer.getBalance()
    const ethBalance = ethers.utils.formatEther(balance)
    console.log(`Balance in your account is ${ethBalance} ETH.`)
}