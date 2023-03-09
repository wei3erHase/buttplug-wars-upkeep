import {FlashbotsBundleProvider} from '@flashbots/ethers-provider-bundle';
import {BlockListener, FlashbotsBroadcastor} from '@keep3r-network/keeper-scripting-utils';
import {providers, Wallet, Contract} from 'ethers';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import 'dotenv/config.js';

/* ==============================================================/*
                        FLASHBOTS SETUP
/*============================================================== */

const CHAIN_ID = 1;
const PRIORITY_FEE_IN_WEI = 2e9;
const GAS_LIMIT = 10e6;

// Flashbots settings
// Size of our batch of bundles
export const BURST_SIZE = 3;
// Blocks into the future to send our first batch of bundles
export const FUTURE_BLOCKS = 0;

const provider = new providers.JsonRpcBatchProvider(process.env['RPC_MAINNET_HTTPS_URI']!);
const txSigner = new Wallet(process.env['TX_SIGNER_MAINNET_PRIVATE_KEY']!, provider);
const bundleSigner = new Wallet(process.env['BUNDLE_SIGNER_MAINNET_PRIVATE_KEY']!, provider);

const buttplugWars = getMainnetSdk(txSigner).buttplugWars;

(async () => {
  const FLASHBOTS_RPC: string = process.env['FLASHBOTS_MAINNET_RELAYER']!;
  const flashbotsProvider = await FlashbotsBundleProvider.create(provider, bundleSigner, FLASHBOTS_RPC);
  const flashbotBroadcastor = new FlashbotsBroadcastor(flashbotsProvider, PRIORITY_FEE_IN_WEI, GAS_LIMIT);

  const blockListener = new BlockListener(provider);

  blockListener.stream(async (block) => {
    try{
      await flashbotBroadcastor.tryToWorkOnFlashbots({
        jobContract: buttplugWars,
        workMethod: 'executeMove()',
        workArguments: [],
        block
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
