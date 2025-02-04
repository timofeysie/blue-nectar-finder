
import { useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import CheckAMM from './CheckAMM'

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

  return (
    <>
      <CheckAMM 
        server={server}
        ammAssets={ammAssets}
        setAmmAssets={setAmmAssets}
        onResultsUpdate={onResultsUpdate}
      />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>AMM Results</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={onResultsUpdate}
            readOnly
            className="w-full h-40 p-2 border rounded"
          />
        </CardContent>
      </Card>
    </>
  )
}
