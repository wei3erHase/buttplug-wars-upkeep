import {Flashbots} from '@keep3r-network/keeper-scripting-utils';
import {providers, Wallet, Contract} from 'ethers';
import {executeMove} from './execute-tx';
import {FlashbotBroadcastor} from './broadcast/flashbots-broadcastor';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import 'dotenv/config.js';

/* ==============================================================/*
                        FLASHBOTS SETUP
/*============================================================== */

const CHAIN_ID = 1;
const PRIORITY_FEE_IN_WEI = 1.5e9;
const GAS_LIMIT = 10e6;

// Flashbots settings
// Size of our batch of bundles
export const BURST_SIZE = 3;
// Blocks into the future to send our first batch of bundles
export const FUTURE_BLOCKS = 0;

const provider = new providers.JsonRpcBatchProvider(process.env['RPC_MAINNET_HTTPS_URI']!);
const txSigner = new Wallet(process.env['TX_SIGNER_MAINNET_PRIVATE_KEY']!, provider);
const bundleSigner = new Wallet(process.env['BUNDLE_SIGNER_MAINNET_PRIVATE_KEY']!, provider);

const buttplugWars = getMainnetSdk(provider).buttplugWars;

(async () => {
  const FLASHBOTS_RPC: string = process.env['FLASHBOTS_MAINNET_RELAYER']!;
  const flashbots = await Flashbots.init(txSigner, bundleSigner, provider, [FLASHBOTS_RPC], true, CHAIN_ID);

  const flashbotBroadcastor = new FlashbotBroadcastor(provider, flashbots, BURST_SIZE, FUTURE_BLOCKS, PRIORITY_FEE_IN_WEI, GAS_LIMIT);

  await executeMove(txSigner, buttplugWars, provider, flashbotBroadcastor.tryToWorkOnFlashbots.bind(flashbotBroadcastor));
})();
