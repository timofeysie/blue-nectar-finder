import { Client, Wallet } from 'xrpl'

export const getNet = (network: string) => {
  return network
}

export const getAccount = async (
  type: 'standby' | 'operational',
  network: string,
  onStatusUpdate: (message: string) => void
) => {
  const client = new Client(network)
  onStatusUpdate(`Connecting to ${network}....`)

  await client.connect()
  onStatusUpdate('Connected, funding wallet.')

  const { wallet: my_wallet } = await client.fundWallet()
  onStatusUpdate('Got a wallet.')

  const balance = await client.getXrpBalance(my_wallet.address)

  await client.disconnect()

  return {
    account: my_wallet.address,
    seed: my_wallet.seed,
    balance: balance.toString()
  }
}

export const getAccountsFromSeeds = async (
  seeds: string,
  network: string,
  onStatusUpdate: (message: string) => void
) => {
  const client = new Client(network)
  onStatusUpdate(`Connecting to ${network}....`)
  
  await client.connect()
  onStatusUpdate('Connected, finding wallets.\n')

  try {
    const lines = seeds.split('\n').filter(seed => seed.trim())
    
    if (lines.length < 2) {
      throw new Error('Please provide at least 2 seeds (one per line)')
    }

    const standby_wallet = Wallet.fromSeed(lines[0])
    const operational_wallet = Wallet.fromSeed(lines[1])

    const standby_balance = await client.getXrpBalance(standby_wallet.address)
    const operational_balance = await client.getXrpBalance(operational_wallet.address)

    await client.disconnect()

    return {
      standby: {
        account: standby_wallet.address,
        seed: standby_wallet.seed,
        balance: standby_balance.toString()
      },
      operational: {
        account: operational_wallet.address,
        seed: operational_wallet.seed,
        balance: operational_balance.toString()
      }
    }
  } catch (error) {
    await client.disconnect()
    throw error
  }
}

export const sendXRP = async (
  senderSeed: string,
  amount: string,
  destination: string,
  network: string,
  onStatusUpdate: (message: string) => void
) => {
  const client = new Client(network)
  onStatusUpdate(`Connecting to ${network}....`)

  await client.connect()
  onStatusUpdate('Connected. Sending XRP.')

  const wallet = Wallet.fromSeed(senderSeed)

  const prepared = await client.autofill({
    TransactionType: "Payment",
    Account: wallet.address,
    Amount: amount,
    Destination: destination
  })

  const signed = wallet.sign(prepared)
  const tx = await client.submitAndWait(signed.tx_blob)

  const balance = await client.getXrpBalance(wallet.address)
  
  await client.disconnect()

  return {
    balance,
    tx
  }
} 