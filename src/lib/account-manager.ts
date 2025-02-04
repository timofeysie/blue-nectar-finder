import { SupabaseClient } from '@supabase/supabase-js'
import { encryptData, decryptData } from './encryption-helpers'

export interface AccountState {
  account: string
  seed: string
  balance: string
  amount: string
  destination: string
  currency: string
}

const generateEncryptionKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export const loadEncryptionKey = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from('encryption_keys')
    .select('key_hash')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    const newKey = generateEncryptionKey()
    await supabase.from('encryption_keys').insert({
      user_id: userId,
      key_hash: newKey
    })
    return newKey
  }
  
  return data.key_hash
}

export const loadUserAccounts = async (
  supabase: SupabaseClient,
  userId: string,
  encryptionKey: string,
  setStandbyAccount: (account: AccountState) => void,
  setOperationalAccount: (account: AccountState) => void
) => {
  const { data, error } = await supabase
    .from('user_accounts')
    .select('*')
    .eq('user_id', userId)
  
  if (error) throw error

  if (data) {
    data.forEach(account => {
      const baseAccount = {
        account: account.account_address,
        seed: account.encrypted_seed ? decryptData(account.encrypted_seed, encryptionKey) : '',
        balance: account.balance || '',
        amount: '',
        destination: '',
        currency: ''
      }

      if (account.account_type === 'standby') {
        setStandbyAccount(baseAccount)
      } else {
        setOperationalAccount(baseAccount)
      }
    })
  }
}

export const saveAccount = async (
  supabase: SupabaseClient,
  userId: string,
  type: 'standby' | 'operational',
  account: AccountState,
  encryptionKey: string,
  ledgerInstance: 'testnet' | 'devnet'
) => {
  const encrypted_seed = account.seed ? encryptData(account.seed, encryptionKey) : null

  const { error } = await supabase
    .from('user_accounts')
    .upsert({
      user_id: userId,
      account_type: type,
      ledger_instance: ledgerInstance,
      account_address: account.account,
      encrypted_seed,
      balance: account.balance
    })

  if (error) throw error
}
