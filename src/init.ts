import {PrivateBroadcastor, getEnvVariable, BlockListener} from '@keep3r-network/keeper-scripting-utils';
import {providers, Wallet, Contract} from 'ethers';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import 'dotenv/config.js';

/* ==============================================================/*
                        FLASHBOTS SETUP
/*============================================================== */

const CHAIN_ID = 1;
const PRIORITY_FEE_IN_WEI = 2e9;
const GAS_LIMIT = 10e6;
const builders = ['https://rpc.titanbuilder.xyz/', 'https://rpc.beaverbuild.org/'];

// Flashbots settings
// Size of our batch of bundles
export const BURST_SIZE = 3;
// Blocks into the future to send our first batch of bundles
export const FUTURE_BLOCKS = 0;

(async () => {
  // Environment variables usage
  const provider = new providers.JsonRpcProvider(getEnvVariable('RPC_HTTP_MAINNET_URI'));
  const txSigner = new Wallet(getEnvVariable('TX_SIGNER_PRIVATE_KEY'), provider);
  
  // Instantiates the contract
  const buttplugWars = getMainnetSdk(txSigner).buttplugWars;

  // Instantiates the broadcastor
  const broadcastor = new PrivateBroadcastor(builders, PRIORITY_FEE_IN_WEI, GAS_LIMIT, true, CHAIN_ID);

  const blockListener = new BlockListener(provider);

  blockListener.stream(async (block) => {
    try{
      await broadcastor.tryToWork({
        jobContract: buttplugWars,
        workMethod: 'executeMove',
        workArguments: [],
        block: block
      });
    }
    catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Failed when attempting to call work statically. Message: ${error.message}. Returning.`);
    }
    return
  }
});

})();
