# Blue Nectar Finder

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

[Supabase](https://supabase.com) is used for authentication and its Postgres database features.

See these [docs](https://docs.lovable.dev/integrations/supabase) for more information.

## Workflow

```sh
npm i
npm run dev
```

## Setup

Clone the repo, install dependencies, and run the project with npm.

```sh
git clone https://github.com/timofeysie/blue-nectar-finder.git
cd blue-nectar-finder
npm install
npm run dev
```

The environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required in a .env file to run locally, and set as environment variables on the server.

## About

The app was scaffolded using the AI generator [Lovable](https://lovable.dev) using the following prompt:

*Create an app that lets a user register and login then see a lists available blue tooth devices nearby on a list and displays the status of these devices and shows when they have paired with the web app.*

## Device motion

In JavaScript we can listen for devicemotion events to capture acceleration and rotation rate.

Also deviceorientation events to capture the device's orientation in space.

Note that Bluetooth functionality requires HTTPS in production and user permission to access Bluetooth devices.

## XRP Ledger Demo

This app provides a mature version of the XRP Ledger demo code.

See [XRP Concepts](https://xrpl.org/docs/concepts) for details about the XRP Ledger.

### AMMs Using JavaScript

The first JavaScript demo involves creating and interacting with Automated Market Makers (AMMs) on the XRP Ledger.

See [XRP Concepts](https://xrpl.org/docs/concepts) for details about the XRP Ledger.

[AMMs Using JavaScript](https://xrpl.org/docs/tutorials/javascript/amm).

Step 1: [Create an AMM](https://xrpl.org/docs/tutorials/javascript/amm/create-an-amm).

The [example code](https://github.com/XRPLF/xrpl-dev-portal/blob/master/_code-samples/quickstart/js/11.create-amm.html) is a single HTML page with vanilla JavaScript.

The implementation here uses a React dashboard component (src\components\XRPLedgeDashboard.tsx) along with the the get accounts utility called from the Seed buttons getAccountsFromSeeds function in the example repo file [_code-samples\quickstart\js\ripplex1-send-xrp.js](https://github.com/XRPLF/xrpl-dev-portal/blob/master/_code-samples/quickstart/js/ripplex1-send-xrp.js) (converted to TypeScript in the lib src\lib\xrpl-helpers.ts utility).

### Using the demo

To get test accounts if you have existing account seeds:
Click Get New Standby Account and Get New Operational Account buttons.

The "Get New Standby Account" and "Get New Operational Account" buttons use the [XRPL Faucet](https://faucet.altnet.rippletest.net/accounts) to get a test account and calls the following API:

```txt
https://faucet.altnet.rippletest.net/accounts
Request Method: POST
```

with the following payload:

```json
{
    "destination": "rsx...",
    "userAgent": "xrpl.js"
}
```

The result should result in a response like this:

```json
{
    "account": {
        "xAddress": "T7Y...",
        "classicAddress": "rsx...",
        "address": "rsx..."
    },
    "amount": 100,
    "transactionHash": "5D6..."
}
```

Next check if an AMM pair already exists.

An AMM holds two different assets: at most one of these can be XRP, and one or both of them can be tokens.

Enter a currency code in the Asset 1 Currency field. For example, XRP.
Enter a second currency code in the Asset 2 Currency field. For example, TST.
Enter the operational account address in the Asset 2 Issuer field.


## Welcome to your Lovable project

### Project info

**URL**: https://lovable.dev/projects/a2e52d92-963a-4cd2-961d-65d371ca4bbb

### How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a2e52d92-963a-4cd2-961d-65d371ca4bbb) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

### What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

### How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a2e52d92-963a-4cd2-961d-65d371ca4bbb) and click on Share -> Publish.

### I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
