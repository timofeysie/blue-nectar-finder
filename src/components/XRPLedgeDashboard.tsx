'use client'

import { useEffect, useState } from 'react'
import { Client } from 'xrpl'
import { getAccount, getAccountsFromSeeds, sendXRP } from '@/lib/xrpl-helpers'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import CheckAMM from '@/components/xrpl/CheckAMM'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { encryptData, decryptData, generateEncryptionKey } from '@/lib/encryption-helpers'

interface AccountState {
  account: string
  seed: string
  balance: string
  amount: string
  destination: string
  currency: string
}

export default function XRPLedgeDashboard() {
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  const user = useUser()
  
  // State for form data
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

  // Load user's encryption key on mount
  useEffect(() => {
    if (user) {
      loadEncryptionKey()
      loadExistingAccounts()
      loadExistingAMMAssets()
    }
  }, [user])

  const loadEncryptionKey = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('encryption_keys')
      .select('key_hash')
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      const newKey = generateEncryptionKey()
      await supabase.from('encryption_keys').insert({
        user_id: user.id,
        key_hash: newKey
      })
      setEncryptionKey(newKey)
    } else {
      setEncryptionKey(data.key_hash)
    }
  }

  const loadExistingAccounts = async () => {
    if (!user || !encryptionKey) return

    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('user_id', user.id)
    
    if (error) {
      toast({
        title: "Error loading accounts",
        description: error.message,
        variant: "destructive"
      })
      return
    }

    if (data) {
      data.forEach(account => {
        if (account.account_type === 'standby') {
          setStandbyAccount(prev => ({
            ...prev,
            account: account.account_address,
            seed: account.encrypted_seed ? decryptData(account.encrypted_seed, encryptionKey) : '',
            balance: account.balance || ''
          }))
        } else {
          setOperationalAccount(prev => ({
            ...prev,
            account: account.account_address,
            seed: account.encrypted_seed ? decryptData(account.encrypted_seed, encryptionKey) : '',
            balance: account.balance || ''
          }))
        }
      })
    }
  }

  const loadExistingAMMAssets = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('amm_assets')
      .select('*')
      .eq('user_id', user.id)
      .eq('ledger_instance', server.includes('altnet') ? 'testnet' : 'devnet')
      .single()

    if (error) return

    if (data) {
      setAmmAssets({
        asset1: {
          currency: data.asset1_currency,
          issuer: data.asset1_issuer || '',
          amount: data.asset1_amount || ''
        },
        asset2: {
          currency: data.asset2_currency,
          issuer: data.asset2_issuer || '',
          amount: data.asset2_amount || ''
        }
      })
    }
  }

  const saveAccount = async (type: 'standby' | 'operational', account: AccountState) => {
    if (!user || !encryptionKey) return

    const encrypted_seed = account.seed ? encryptData(account.seed, encryptionKey) : null

    const { error } = await supabase
      .from('user_accounts')
      .upsert({
        user_id: user.id,
        account_type: type,
        ledger_instance: server.includes('altnet') ? 'testnet' : 'devnet',
        account_address: account.account,
        encrypted_seed,
        balance: account.balance
      })

    if (error) {
      toast({
        title: "Error saving account",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const saveAMMAssets = async () => {
    if (!user) return

    const { error } = await supabase
      .from('amm_assets')
      .upsert({
        user_id: user.id,
        ledger_instance: server.includes('altnet') ? 'testnet' : 'devnet',
        asset1_currency: ammAssets.asset1.currency,
        asset1_issuer: ammAssets.asset1.issuer,
        asset1_amount: ammAssets.asset1.amount,
        asset2_currency: ammAssets.asset2.currency,
        asset2_issuer: ammAssets.asset2.issuer,
        asset2_amount: ammAssets.asset2.amount
      })

    if (error) {
      toast({
        title: "Error saving AMM assets",
        description: error.message,
        variant: "destructive"
      })
    }
  }

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
        await saveAccount('standby', accountData)
      } else {
        setOperationalAccount({
          ...accountData,
          amount: '',
          destination: '',
          currency: ''
        })
        await saveAccount('operational', accountData)
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
      await saveAccount('standby', accounts.standby)

      setOperationalAccount({
        ...accounts.operational,
        amount: '',
        destination: '',
        currency: ''
      })
      await saveAccount('operational', accounts.operational)

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
