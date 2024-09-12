const { ethers } = require("ethers");

async function generateVanityHash(desiredPrefix) {
  // Use a generic JSON RPC provider for Ethereum mainnet through Alchemy
  const provider = new ethers.providers.JsonRpcProvider(`xxx`);

  // Your private key (make sure this is your mainnet account if you're using it on mainnet)
  const privateKey = "xxx"; 
  const wallet = new ethers.Wallet(privateKey, provider);

  let nonce = await provider.getTransactionCount(wallet.address);
  console.log(`Starting with nonce: ${nonce}`);
  
  let txHash = 'none';
  let iteration = 0;

  // Encode the message "wgm was here" into hex and store in the data field
  const message = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("wgm was here"));

  let txObject = {
    nonce: nonce,  
    to: "0x000000000000000000000000000000000000dEaD", // Dummy recipient
    value: ethers.utils.parseEther("0.000000001"), // Transaction value
    gasLimit: ethers.utils.hexlify(21192), // Gas limit
    gasPrice: ethers.utils.parseUnits("1", "gwei"),  
    chainId: 1, // Mainnet chain ID
    data: message // This is where we embed the message
  };

  // Start brute-forcing by modifying gasPrice
  while (!txHash.substring(2).startsWith(desiredPrefix)) { 
    iteration++;
    txObject.gasPrice = ethers.BigNumber.from(txObject.gasPrice).add(ethers.utils.parseUnits("0.005", "gwei"));
    const signedTx = await wallet.signTransaction(txObject);
    txHash = ethers.utils.keccak256(signedTx);
    console.log(`Attempt ${iteration}: txHash=${txHash}`);

    if (txHash.substring(2).startsWith(desiredPrefix)) {
      console.log("Match found!");
      console.log(`Transaction hash: ${txHash}`);

      try {
        const receipt = await provider.sendTransaction(signedTx);
        console.log("Transaction sent!");
        console.log(`Transaction Receipt: ${JSON.stringify(receipt, null, 2)}`);
      } catch (error) {
        console.error("Error sending transaction:", error);
      }
      break;
    }
  }
  console.log("Stopping script after broadcasting the transaction.");
}

// Call the function with your desired vanity prefix
generateVanityHash('0e18');