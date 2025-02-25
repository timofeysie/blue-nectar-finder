'use client'

import { useState } from 'react'
import { Client } from 'xrpl'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

interface CheckAMMProps {
  server: string
  ammAssets: AMMAssets
  setAmmAssets: (assets: AMMAssets) => void
  onResultsUpdate: (message: string) => void
}

export default function CheckAMM({ server, ammAssets, setAmmAssets, onResultsUpdate }: CheckAMMProps) {
  const handleCheckAMM = async () => {
    console.log('handleCheckAMM 2')

    try {
      // Validate inputs before making the request
      if (!ammAssets.asset1.currency || !ammAssets.asset2.currency) {
        throw new Error('Currency fields are required for both assets')
      }

      // For non-XRP assets, issuer is required
      if (ammAssets.asset1.currency !== 'XRP' && !ammAssets.asset1.issuer) {
        throw new Error('Issuer is required for non-XRP asset 1')
      }
      if (ammAssets.asset2.currency !== 'XRP' && !ammAssets.asset2.issuer) {
        throw new Error('Issuer is required for non-XRP asset 2')
      }

      const client = new Client(server)
      await client.connect()
      
      // Prepare the request with correct format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request: any = {
        command: 'amm_info',
        ledger_index: 'validated'
      }

      // Format asset1 as "asset" (ensure currency is uppercase)
      if (ammAssets.asset1.currency.toUpperCase() === 'XRP') {
        request.asset = {
          currency: 'XRP'
        }
      } else {
        request.asset = {
          currency: ammAssets.asset1.currency.toUpperCase(),
          issuer: ammAssets.asset1.issuer.trim()
        }
      }

      // Format asset2 (ensure currency is uppercase)
      if (ammAssets.asset2.currency.toUpperCase() === 'XRP') {
        request.asset2 = {
          currency: 'XRP'
        }
      } else {
        request.asset2 = {
          currency: ammAssets.asset2.currency.toUpperCase(),
          issuer: ammAssets.asset2.issuer.trim()
        }
      }

      console.log('Sending request:', JSON.stringify(request, null, 2))
      const response = await client.request(request)
      
      onResultsUpdate(JSON.stringify(response, null, 2))
      await client.disconnect()
    } catch (error) {
      console.error('AMM check error:', error)
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error, null, 2)
      onResultsUpdate(`Error: ${errorMessage}`)
    }
  }

  const handleCreateAMM = async () => {
    try {
      const client = new Client(server)
      await client.connect()
      
      // Here we'll add the AMM creation logic
      // This is a placeholder - you'll need to implement the actual AMM creation
      onResultsUpdate('AMM creation not yet implemented')
      await client.disconnect()
    } catch (error) {
      onResultsUpdate(`Error creating AMM: ${error.message}`)
    }
  }

  const handleSetupAMMCheck = () => {
    setAmmAssets({
      ...ammAssets,
      asset1: { ...ammAssets.asset1, currency: 'XRP' },
      asset2: {
        ...ammAssets.asset2,
        currency: 'TST',
        issuer: 'rP9jPyP5kyvFRb6ZiRghAGw5u8SGAmU4bd'
      }
    })
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>AMM Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Asset 1 */}
          <div className="space-y-4">
            <h3 className="font-semibold">Asset 1</h3>
            <div>
              <label className="block mb-1">Currency</label>
              <input
                type="text"
                value={ammAssets.asset1.currency}
                onChange={(e) => setAmmAssets({
                  ...ammAssets,
                  asset1: { ...ammAssets.asset1, currency: e.target.value }
                })}
                className="w-full p-2 border rounded"
                placeholder="XRP"
              />
            </div>
            <div>
              <label className="block mb-1">Issuer</label>
              <input
                type="text"
                value={ammAssets.asset1.issuer}
                onChange={(e) => setAmmAssets({
                  ...ammAssets,
                  asset1: { ...ammAssets.asset1, issuer: e.target.value }
                })}
                className="w-full p-2 border rounded"
                placeholder="Issuer address"
              />
            </div>
            <div>
              <label className="block mb-1">Amount</label>
              <input
                type="text"
                value={ammAssets.asset1.amount}
                onChange={(e) => setAmmAssets({
                  ...ammAssets,
                  asset1: { ...ammAssets.asset1, amount: e.target.value }
                })}
                className="w-full p-2 border rounded"
                placeholder="Amount"
              />
            </div>
          </div>

          {/* Asset 2 */}
          <div className="space-y-4">
            <h3 className="font-semibold">Asset 2</h3>
            <div>
              <label className="block mb-1">Currency</label>
              <input
                type="text"
                value={ammAssets.asset2.currency}
                onChange={(e) => setAmmAssets({
                  ...ammAssets,
                  asset2: { ...ammAssets.asset2, currency: e.target.value }
                })}
                className="w-full p-2 border rounded"
                placeholder="USD"
              />
            </div>
            <div>
              <label className="block mb-1">Issuer</label>
              <input
                type="text"
                value={ammAssets.asset2.issuer}
                onChange={(e) => setAmmAssets({
                  ...ammAssets,
                  asset2: { ...ammAssets.asset2, issuer: e.target.value }
                })}
                className="w-full p-2 border rounded"
                placeholder="Issuer address"
              />
            </div>
            <div>
              <label className="block mb-1">Amount</label>
              <input
                type="text"
                value={ammAssets.asset2.amount}
                onChange={(e) => setAmmAssets({
                  ...ammAssets,
                  asset2: { ...ammAssets.asset2, amount: e.target.value }
                })}
                className="w-full p-2 border rounded"
                placeholder="Amount"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <Button onClick={handleCheckAMM} className="w-full sm:w-auto">
            Check AMM
          </Button>
          <Button onClick={handleSetupAMMCheck} variant="outline" className="w-full sm:w-auto">
            Setup AMM Check
          </Button>
          <Button onClick={handleCreateAMM} className="w-full sm:w-auto">
            Create AMM
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 