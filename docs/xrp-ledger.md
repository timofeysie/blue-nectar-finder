# XRP Ledger

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
