# XRP Ledger overview

## The XRP Ledger

A blockchain consists of a history of data blocks in sequence.

A single "ledger version" contains three parts.

### Ledger Structure

- A header - The Ledger Index, hashes of its other contents, and other metadata.
- A transaction tree - The transactions that were applied to the previous ledger to make this one.
- A state tree - All the data in the ledger, as ledger entries: balances, settings, etc.

The consensus protocol takes a previous ledger version as a starting point, forms an agreement among validators on a set of transactions to apply next, then confirms that everyone got the same results from applying those transactions. When this happens successfully, the result is a new validated ledger version.

When a ledger version is first created, it is not yet validated. Due to differences in when candidate transactions arrive at different servers, the network may build and propose multiple different ledger versions to be the next step in the chain. The consensus protocol decides which one of them becomes validated. (Any candidate transactions that weren't in the validated ledger version can typically be included in the next ledger version's transaction set instead.)

## Automated Market Makers (AMMs) on the XRP Ledger

Following the steps in the [AMM demo](file:///C:/Users/timof/repos/ml/xrpl-dev-portal/_code-samples/quickstart/js/11.create-amm.html).

An AMM holds two different assets: at most one of these can be XRP, and one or both of them can be tokens.

To Check if an AMM pair already exists, I follow these steps:

- Click Get New Standby Account.
- Click Get New Operational Account.

## Next check if an AMM pair already exists

An AMM holds two different assets: at most one of these can be XRP, and one or both of them can be tokens.

1. Enter a currency code in the Asset 1 Currency field. For example, XRP.
2. Enter a second currency code in the Asset 2 Currency field. For example, TST.
3. Enter the operational account address in the Asset 2 Issuer field.
4. Click Check AMM.

## Checking AMM Pairs in the XRP Ledger

When you click the "Check AMM" button in the demo, the following process occurs:

- Asset 1:
  - For XRP: Just enter "XRP" in the currency field (no issuer needed)
  - For other currencies: Enter the currency code (e.g., "USD") and provide an issuer address
- Asset 2:
  - Same rules as Asset 1
- At least one of the assets must be different from the other
- At most one asset can be XRP

### Example Setup

What Happens Behind the Scenes

- The application connects to the XRP Ledger
- It formats the asset pairs according to XRPL requirements
- Sends an amm_info request to check if an AMM exists for this pair
- The XRPL responds with either:
  - AMM details if one exists (including the AMM account and trading fee)
A "No AMM exists" message if none is found

Common Issues

Invalid parameters error usually means:

- Missing issuer for a non-XRP asset
- Incorrect currency code format
- Invalid issuer address format
- Both assets cannot be XRP
- Both assets must be different

I am able to get a new standby account, and a new operational account.  I follow the steps but when I click "Check amm" nothing happens.  Lets implement that action now.  There is currently an xrpl-helpers.ts file with some functions that might be useful. 

### CHeck AMM not working

I follow the steps in the [Create AMM JavaScript tutorial](https://xrpl.org/docs/tutorials/javascript/amm/create-an-amm).

1. Click Get New Standby Account.
2. Click Get New Operational Account.
3. Enter a currency code in the Asset 1 Currency field. For example, XRP.
4. Enter a second currency code in the Asset 2 Currency field. For example, TST.
5. Enter the operational account address in the Asset 2 Issuer field.
6. Choose "Check AMM

The websocket call:

```txt
connection: upgrade
sec-websocket-accept: 5cxXFo/x6/u3xC6I7++uljEMnNQ=
sec-websocket-extensions: permessage-deflate
server: rippled-2.3.1
upgrade: websocket
accept-encoding: gzip, deflate, br, zstd
accept-language: en-US,en;q=0.9,en-AU;q=0.8,en-GB;q=0.7
cache-control: no-cache
connection: Upgrade
host: s.altnet.rippletest.net:51233
origin: http://localhost:8080
pragma: no-cache
sec-websocket-extensions: permessage-deflate; client_max_window_bits
sec-websocket-key: LoSoodbr+yQRfStC7xtg5A==
sec-websocket-version: 13
upgrade: websocket
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0
```

The AMM result shows this:

```json
{
  "name": "RippledError",
  "data": {
    "api_version": 2,
    "error": "invalidParams",
    "error_code": 31,
    "error_message": "Invalid parameters.",
    "id": 1,
    "ledger_current_index": 5135735,
    "request": {
      "api_version": 2,
      "asset1": {
        "currency": "XRP",
        "issuer": ""
      },
      "asset2": {
        "currency": "TST",
        "issuer": "r2a76QacSq4vsKhFKCTjxT9w9xeEfrNLg"
      },
      "command": "amm_info",
      "id": 1
    },
    "status": "error",
    "type": "response",
    "validated": false
  }
}
```

Compare this with the [AMM demo](file:///C:/Users/timof/repos/ml/xrpl-dev-portal/_code-samples/quickstart/js/11.create-amm.html) following the same steps:

Request URL: wss://s.altnet.rippletest.net:51233/
Request Method: GET
Status Code: 101 Switching Protocols

The result of the demo code is different:

```json
AMM Info:

[RippledError(Account not found., {"api_version":2,"error":"actNotFound","error_code":19,"error_message":"Account not found.","id":1,"ledger_hash":"44C439CB69B3F5B1D0BC746ED306131CCD23A46B10AA19C7DE0DCA127DDB8DA5","ledger_index":5135877,"request":{"api_version":2,"asset":{"currency":"XRP"},"asset2":{"currency":"TST","issuer":"rLiAJ4gvUje4GCYADp8ECRnSMQAkFkWDta"},"command":"amm_info","id":1,"ledger_index":"validated"},"status":"error","type":"response","validated":true})]
```

In the demo, asset1 is called just asset.  Making that change and we get the same result as the demo.

## Create Trustline

Create a trustline from the operational account to the standby account. In the standby account fields:

- Enter a maximum transfer limit in the Amount field, such as 10,000.
- Enter the operational account address in the Destination field.
- Enter a currency code in the Currency field. For example, TST.
- Click Create Trustline.

We need to convert the sample createTrustline function code to typescript to support this action.

That is in this file: docs\xrpl-dev-portal\_code-samples\quickstart\js\ripplex2-send-currency.js

The code looks like this:

```js
      
async function createTrustline() {
  let net = getNet()
  const client = new xrpl.Client(net)
  results = 'Connecting to ' + getNet() + '....'
  standbyResultField.value = results

  await client.connect()
  results += '\nConnected.'
  standbyResultField.value = results
          
  const standby_wallet = xrpl.Wallet.fromSeed(standbySeedField.value)
  const operational_wallet = xrpl.Wallet.fromSeed(operationalSeedField.value)
  const currency_code = standbyCurrencyField.value
  const trustSet_tx = {
    "TransactionType": "TrustSet",
    "Account": standbyAccountField.value,
    "LimitAmount": {
      "currency": standbyCurrencyField.value,
      "issuer": standbyDestinationField.value,
      "value": standbyAmountField.value
    }
  }
  const ts_prepared = await client.autofill(trustSet_tx)
  const ts_signed = standby_wallet.sign(ts_prepared)
  results += '\nCreating trust line from operational account to standby account...'
  standbyResultField.value = results
  const ts_result = await client.submitAndWait(ts_signed.tx_blob)
  if (ts_result.result.meta.TransactionResult == "tesSUCCESS") {
    results += '\nTrustline established between account \n' +
      standbyDestinationField.value + ' \n and account\n' + standby_wallet.address + '.'
    standbyResultField.value = results
  } else {
    results += '\nTrustLine failed. See JavaScript console for details.'
    document.getElementById('standbyResultField').value = results     
    throw `Error sending transaction: ${ts_result.result.meta.TransactionResult}`
  }
}
```

We can add our new function to src\lib\xrpl-helpers.ts.

```ts
interface TrustSetTransaction {
  TransactionType: 'TrustSet';
  Account: string;
  LimitAmount: {
    currency: string;
    issuer: string;
    value: string;
  };
}


export const createTrustline = async (
  standbyWalletSeed: string,
  currency: string,
  issuer: string,
  value: string,
  network: string,
  onStatusUpdate: (message: string) => void
) => {
  const client = new Client(network)
  
  try {
    onStatusUpdate(`Connecting to ${network}....`)
    await client.connect()
    onStatusUpdate('Connected.')

    const standby_wallet = Wallet.fromSeed(standbyWalletSeed)
    
    const trustSet_tx: TrustSetTransaction = {
      "TransactionType": "TrustSet",
      "Account": standby_wallet.address,
      "LimitAmount": {
        "currency": currency,
        "issuer": issuer,
        "value": value
      }
    }

    onStatusUpdate('Creating trust line from operational account to standby account...')
    
    const ts_prepared = await client.autofill(trustSet_tx)
    const ts_signed = standby_wallet.sign(ts_prepared)
    const ts_result = await client.submitAndWait(ts_signed.tx_blob)

    await client.disconnect()

    if ((typeof ts_result.result.meta === 'object' && 
        ts_result.result.meta !== null && 
        'TransactionResult' in ts_result.result.meta ? 
        ts_result.result.meta.TransactionResult : 
        'unknown error') === "tesSUCCESS") {
      const successMessage = `Trustline established between account \n${issuer} \nand account\n${standby_wallet.address}.`
      onStatusUpdate(successMessage)
      return {
        status: 'success',
        message: successMessage,
        result: ts_result
      }
    } else {
      throw new Error(`Transaction failed: ${
        typeof ts_result.result.meta === 'object' && 
        ts_result.result.meta !== null && 
        'TransactionResult' in ts_result.result.meta ? 
        ts_result.result.meta.TransactionResult : 
        'unknown error'
      }`)
    }

  } catch (error) {
    await client.disconnect()
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    onStatusUpdate(`TrustLine failed: ${errorMessage}`)
    throw error
  }
}
```

Lets use the createTrustline function when the user clicks the "Create Trustline" button.  I have added the xrp-helper.ts file and AMMManager.tsx file as context.  Since the steps to create a trustline require the user to enter a maximum transfer limit in the Amount field, the operational account address in the Destination field and a currency code in the Currency field, lets create a new button called "Setup Trustline" to copy the operational account address in the Destination field.

Then we can use the createTrustline function when the user clicks the "Create Trustline" button.

If the Amount field or Currency field are empty, we should show a validation message under this button saying that it is required.