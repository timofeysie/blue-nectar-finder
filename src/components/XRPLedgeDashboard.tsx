'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getAccount, getAccountsFromSeeds } from '@/lib/xrpl-helpers'
import AMMManager from './xrpl/AMMManager'
import { loadEncryptionKey, loadUserAccounts, saveAccount, AccountState } from '@/lib/account-manager'

export default function XRPLedgeDashboard() {
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  const user = useUser()
  
  const [server, setServer] = useState('wss://s.altnet.rippletest.net:51233')
  const [seeds, setSeeds] = useState('')
  const [encryptionKey, setEncryptionKey] = useState('')
  
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

  useEffect(() => {
    if (user) {
      const initializeUser = async () => {
        const key = await loadEncryptionKey(supabase, user.id)
        setEncryptionKey(key)
        await loadUserAccounts(supabase, user.id, key, setStandbyAccount, setOperationalAccount)
      }
      initializeUser()
    }
  }, [user])

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

      const fullAccountData = {
        ...accountData,
        amount: '',
        destination: '',
        currency: ''
      }

      if (type === 'standby') {
        setStandbyAccount(fullAccountData)
        if (user && encryptionKey) {
          await saveAccount(supabase, user.id, 'standby', fullAccountData, encryptionKey, server.includes('altnet') ? 'testnet' : 'devnet')
        }
      } else {
        setOperationalAccount(fullAccountData)
        if (user && encryptionKey) {
          await saveAccount(supabase, user.id, 'operational', fullAccountData, encryptionKey, server.includes('altnet') ? 'testnet' : 'devnet')
        }
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

      const standbyData = {
        ...accounts.standby,
        amount: '',
        destination: '',
        currency: ''
      }
      setStandbyAccount(standbyData)

      const operationalData = {
        ...accounts.operational,
        amount: '',
        destination: '',
        currency: ''
      }
      setOperationalAccount(operationalData)

      if (user && encryptionKey) {
        await saveAccount(supabase, user.id, 'standby', standbyData, encryptionKey, server.includes('altnet') ? 'testnet' : 'devnet')
        await saveAccount(supabase, user.id, 'operational', operationalData, encryptionKey, server.includes('altnet') ? 'testnet' : 'devnet')
      }
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

      {/* Account Sections */}
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
      <AMMManager 
        server={server}
        ammAssets={ammAssets}
        setAmmAssets={setAmmAssets}
        onResultsUpdate={(message) => setResults(prev => ({ ...prev, ammInfo: message }))}
      />
    </div>
  )
}
