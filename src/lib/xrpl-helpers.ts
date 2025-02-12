/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Wallet, Request } from 'xrpl'

// Add these type definitions at the top of the file
type Currency = {
  currency: string;
  issuer: string;
}

type IssuedCurrency = {
  currency: string;
  issuer: string;
}

interface AMMInfoRequest {
  command: 'amm_info';
  asset1: IssuedCurrency | { currency: 'XRP' };
  asset2: IssuedCurrency | { currency: 'XRP' };
  [key: string]: unknown;  // Add index signature to match XRPL's Request type
}

interface AMMInfoResponse {
  result: {
    amm?: {
      account: string;
      trading_fee: number;
      asset1: IssuedCurrency | { currency: 'XRP' };
      asset2: IssuedCurrency | { currency: 'XRP' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any; // for other potential properties
    };
    ledger_current_index?: number;
    validated: boolean;
  };
}

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

export const checkAMM = async (
  asset1: { currency: string; issuer?: string },
  asset2: { currency: string; issuer?: string },
  network: string,
  onStatusUpdate: (message: string) => void
) => {
  const client = new Client(network)
  
  try {
    await client.connect()
    console.log('Connected to', network) // Debug log

    // Format assets according to XRPL requirements
    const formattedAsset1: any = asset1.currency.toUpperCase() === 'XRP' 
      ? { currency: 'XRP' }
      : {
          currency: asset1.currency.toUpperCase(),
          issuer: asset1.issuer
        }

    const formattedAsset2: any = asset2.currency.toUpperCase() === 'XRP'
      ? { currency: 'XRP' }
      : {
          currency: asset2.currency.toUpperCase(),
          issuer: asset2.issuer
        }

    const request: AMMInfoRequest = {
      command: 'amm_info',
      asset1: formattedAsset1,
      asset2: formattedAsset2
    }

    console.log('Sending request:', JSON.stringify(request, null, 2)) // Debug log

    const ammInfo = await client.request(request) as AMMInfoResponse
    console.log('Received response:', JSON.stringify(ammInfo, null, 2)) // Debug log

    await client.disconnect()
    
    // Always send a formatted response
    const response = {
      type: "response",
      status: ammInfo.result.amm ? "success" : "not_found",
      request: request,
      result: ammInfo.result,
      api_version: 2,
      validated: true
    }

    onStatusUpdate(JSON.stringify(response, null, 2))
    return response

  } catch (error) {
    await client.disconnect()
    console.error('Full error:', error) // Debug log

    // Format error response
    const errorResponse = {
      type: "response",
      status: "error",
      api_version: 2,
      error: error.data?.error || "Unknown error",
      error_code: error.data?.error_code || -1,
      error_message: error.data?.error_message || error.message,
      request: error.data?.request,
      validated: true
    }

    onStatusUpdate(JSON.stringify(errorResponse, null, 2))
    throw errorResponse
  }
} 