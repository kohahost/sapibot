import StellarSdk from 'stellar-sdk';
import { readFile } from 'fs/promises';

export default async function handler(req, res) {
  try {
    const config = JSON.parse(await readFile('/tmp/config.json'));
    const server = new StellarSdk.Server(config.nodeIP);
    const sourceKeypair = StellarSdk.Keypair.fromSecret(config.leakedWallet);
    const account = await server.loadAccount(sourceKeypair.publicKey());

    const fee = await server.fetchBaseFee();
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee,
      networkPassphrase: StellarSdk.Networks.PUBLIC
    })
      .addOperation(config.transferMode === 'claimable'
        ? StellarSdk.Operation.createClaimableBalance({
            asset: StellarSdk.Asset.native(),
            amount: config.amount,
            claimants: [
              new StellarSdk.Claimant(config.recipient, StellarSdk.Claimant.predicateUnconditional())
            ]
          })
        : StellarSdk.Operation.payment({
            destination: config.recipient,
            asset: StellarSdk.Asset.native(),
            amount: config.amount
          })
      )
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);
    res.status(200).json({ status: 'success', result });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}
