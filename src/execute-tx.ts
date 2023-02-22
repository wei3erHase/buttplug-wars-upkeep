import {BlockListener} from '@keep3r-network/keeper-scripting-utils';
import type {Wallet, providers, Contract} from 'ethers';

export async function executeMove(
  txSigner: Wallet,
  jobContract: Contract,
  provider: providers.JsonRpcProvider,
  broadcastMethod: (
    txSigner: Wallet,
    jobContract: Contract,
    workMethod: string,
    methodArguments: any | any[],
    isWorkable: any,
    isWorkableArguments: any,
  ) => Promise<void>,
) {
  const WORK_METHOD = 'executeMove()';

  const isWorkable = async (nullArg: null) => {
    try {
      await jobContract.connect(txSigner).callStatic[WORK_METHOD]();
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`Failed when attempting to call work statically. Message: ${error.message}. Returning.`);
      }
      return false;
    }
  };

  const blockListener = new BlockListener(provider);

  blockListener.stream(async () => {
      await broadcastMethod(
        txSigner,
        jobContract,
        WORK_METHOD,
        [],
        isWorkable,
        [],
      );
  });
}