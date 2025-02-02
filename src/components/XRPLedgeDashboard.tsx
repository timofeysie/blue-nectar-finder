'use client'

import { useState } from 'react'
import { Client } from 'xrpl'
import { getAccount, getAccountsFromSeeds, sendXRP } from '@/lib/xrpl-helpers'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CheckAMM from '@/components/xrpl/CheckAMM'

interface AccountState {
  account: string
  seed: string
  balance: string
  amount: string
  destination: string
  currency: string
}

export default function XRPLedgeDashboard() {
  // State for form data
  const [server, setServer] = useState('wss://s.altnet.rippletest.net:51233')
  const [seeds, setSeeds] = useState('')
  
  const [standbyAccount, setStandbyAccount] = useState<AccountState>({
    account: '',
    seed: '',
    balance: '',
    amount: '',
    destination: '',
    currency: ''
  })

  const [operationalAccount, setOperationalAccount] = useState<AccountState>({
    account: '',
    seed: '',
    balance: '',
    amount: '',
    destination: '',
    currency: ''
  })

  const [ammAssets, setAmmAssets] = useState({
    asset1: {
      currency: '',
      issuer: '',
      amount: ''
    },
    asset2: {
      currency: '',
      issuer: '',
      amount: ''
    }
  })

  const [results, setResults] = useState({
    standby: '',
    operational: '',
    ammInfo: ''
  })

  // XRPL Client
  const getClient = async () => {
    const client = new Client(server)
    await client.connect()
    return client
  }

  // Handler functions
  const handleGetAccount = async (type: 'standby' | 'operational') => {
    try {
      const accountData = await getAccount(
        type,
        server,
        (message) => setResults(prev => ({
          ...prev,
          [type]: message
        }))
      )

      if (type === 'standby') {
        setStandbyAccount({
          ...accountData,
          amount: '',
          destination: '',
          currency: ''
        })
      } else {
        setOperationalAccount({
          ...accountData,
          amount: '',
          destination: '',
          currency: ''
        })
      }
    } catch (error) {
      console.error('Error getting account:', error)
      setResults(prev => ({
        ...prev,
        [type]: `Error: ${error.message}`
      }))
    }
  }

  const handleGetAccountsFromSeeds = async () => {
    try {
      const accounts = await getAccountsFromSeeds(
        seeds,
        server,
        (message) => setResults(prev => ({
          ...prev,
          standby: message
        }))
      )

      setStandbyAccount({
        ...accounts.standby,
        amount: '',
        destination: '',
        currency: ''
      })

      setOperationalAccount({
        ...accounts.operational,
        amount: '',
        destination: '',
        currency: ''
      })

    } catch (error) {
      console.error('Error getting accounts from seeds:', error)
      setResults(prev => ({
        ...prev,
        standby: `Error: ${error.message}`
      }))
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <span className="mr-4">Choose your ledger instance:</span>
        <label className="mr-4">
          <input
            type="radio"
            name="server"
            value="wss://s.altnet.rippletest.net:51233"
            checked={server === 'wss://s.altnet.rippletest.net:51233'}
            onChange={(e) => setServer(e.target.value)}
            className="mr-2"
          />
          Testnet
        </label>
        <label>
          <input
            type="radio"
            name="server"
            value="wss://s.devnet.rippletest.net:51233"
            checked={server === 'wss://s.devnet.rippletest.net:51233'}
            onChange={(e) => setServer(e.target.value)}
            className="mr-2"
          />
          Devnet
        </label>
      </div>

      {/* Seeds Input Section */}
      <div className="mb-6">
        <textarea
          value={seeds}
          onChange={(e) => setSeeds(e.target.value)}
          placeholder="Enter seeds (one per line)"
          className="w-full p-2 border rounded h-24 mb-2"
        />
        <Button 
          onClick={handleGetAccountsFromSeeds}
          className="w-full sm:w-auto"
        >
          Get Accounts From Seeds
        </Button>
      </div>

      {/* Account Sections - Now stackable on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Standby Account Section */}
        <Card>
          <CardHeader>
            <CardTitle>Standby Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleGetAccount('standby')}
              className="w-full sm:w-auto mb-4"
            >
              Get New Standby Account
            </Button>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Account</label>
                <input
                  type="text"
                  value={standbyAccount.account}
                  onChange={(e) => setStandbyAccount(prev => ({...prev, account: e.target.value}))}
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* Add other standby account fields similarly */}
            </div>

            <textarea
              value={results.standby}
              readOnly
              className="w-full h-40 mt-4 p-2 border rounded"
            />
          </CardContent>
        </Card>

        {/* Operational Account Section */}
        <Card>
          <CardHeader>
            <CardTitle>Operational Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleGetAccount('operational')}
              className="w-full sm:w-auto mb-4"
            >
              Get New Operational Account
            </Button>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Account</label>
                <input
                  type="text"
                  value={operationalAccount.account}
                  onChange={(e) => setOperationalAccount(prev => ({...prev, account: e.target.value}))}
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* Add other operational account fields similarly */}
            </div>

            <textarea
              value={results.operational}
              readOnly
              className="w-full h-40 mt-4 p-2 border rounded"
            />
          </CardContent>
        </Card>
      </div>

      {/* AMM Section */}
      <CheckAMM 
        server={server}
        ammAssets={ammAssets}
        setAmmAssets={setAmmAssets}
        onResultsUpdate={(message) => setResults(prev => ({ ...prev, ammInfo: message }))}
      />

      {/* AMM Results */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>AMM Results</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={results.ammInfo}
            readOnly
            className="w-full h-40 p-2 border rounded"
          />
        </CardContent>
      </Card>
    </div>
  )
} 