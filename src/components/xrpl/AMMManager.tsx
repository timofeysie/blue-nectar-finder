import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { checkAMM } from '@/lib/xrpl-helpers'

interface AMMAssets {
  asset1: {
    currency: string
    issuer: string
    amount: string
  }
  asset2: {
    currency: string
    issuer: string
    amount: string
  }
}

interface AMMManagerProps {
  server: string
  ammAssets: AMMAssets
  setAmmAssets: (assets: AMMAssets) => void
  onResultsUpdate: (message: string) => void
}

export default function AMMManager({ 
  server, 
  ammAssets, 
  setAmmAssets, 
  onResultsUpdate 
}: AMMManagerProps) {
  const supabase = useSupabaseClient()
  const user = useUser()
  const { toast } = useToast()
  const [results, setResults] = useState('')

  useEffect(() => {
    if (user) {
      loadExistingAMMAssets()
    }
  }, [user])

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

  const handleResultsUpdate = (message: string) => {
    setResults(message)
    onResultsUpdate(message)
  }

  const handleCheckAMM = async () => {
    try {
      // Validate inputs before making the request
      if (!ammAssets.asset1.currency) {
        throw new Error('Asset 1 currency is required')
      }
      if (!ammAssets.asset2.currency) {
        throw new Error('Asset 2 currency is required')
      }

      // Format currency codes to be exactly 3 characters for standard currencies
      // or 40 characters for hex currency codes
      const formatCurrency = (currency: string) => {
        if (currency.toUpperCase() === 'XRP') return 'XRP'
        // If it's a 3-letter code, uppercase it
        if (currency.length <= 3) return currency.toUpperCase()
        // Otherwise assume it's a hex code and return as-is
        return currency
      }

      const asset1 = {
        currency: formatCurrency(ammAssets.asset1.currency),
        issuer: ammAssets.asset1.currency.toUpperCase() === 'XRP' ? undefined : ammAssets.asset1.issuer
      }

      const asset2 = {
        currency: formatCurrency(ammAssets.asset2.currency),
        issuer: ammAssets.asset2.currency.toUpperCase() === 'XRP' ? undefined : ammAssets.asset2.issuer
      }

      // Validate that non-XRP assets have issuers
      if (asset1.currency !== 'XRP' && !asset1.issuer) {
        throw new Error('Issuer is required for non-XRP Asset 1')
      }
      if (asset2.currency !== 'XRP' && !asset2.issuer) {
        throw new Error('Issuer is required for non-XRP Asset 2')
      }

      await checkAMM(
        asset1,
        asset2,
        server,
        handleResultsUpdate
      )
    } catch (error) {
      console.error('Error checking AMM:', error)
      // Format the error response as JSON
      const errorResponse = error.data ? error.data : error
      handleResultsUpdate(JSON.stringify(errorResponse, null, 2))
    }
  }

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>AMM Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Asset 1 Fields */}
            <div className="space-y-2">
              <div>
                <label className="block mb-1">Asset 1 Currency</label>
                <input
                  type="text"
                  value={ammAssets.asset1.currency}
                  onChange={(e) => setAmmAssets({
                    ...ammAssets,
                    asset1: { ...ammAssets.asset1, currency: e.target.value }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Asset 1 Issuer</label>
                <input
                  type="text"
                  value={ammAssets.asset1.issuer}
                  onChange={(e) => setAmmAssets({
                    ...ammAssets,
                    asset1: { ...ammAssets.asset1, issuer: e.target.value }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Asset 2 Fields */}
            <div className="space-y-2">
              <div>
                <label className="block mb-1">Asset 2 Currency</label>
                <input
                  type="text"
                  value={ammAssets.asset2.currency}
                  onChange={(e) => setAmmAssets({
                    ...ammAssets,
                    asset2: { ...ammAssets.asset2, currency: e.target.value }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Asset 2 Issuer</label>
                <input
                  type="text"
                  value={ammAssets.asset2.issuer}
                  onChange={(e) => setAmmAssets({
                    ...ammAssets,
                    asset2: { ...ammAssets.asset2, issuer: e.target.value }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-x-2">
            <Button onClick={handleCheckAMM}>
              Check AMM
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>AMM Results</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={results}
            readOnly
            className="w-full h-40 p-2 border rounded"
          />
        </CardContent>
      </Card>
    </>
  )
}
