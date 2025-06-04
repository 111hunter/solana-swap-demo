import type { QuoteResponse } from '@jup-ag/api'
import { createJupiterApiClient } from '@jup-ag/api'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import {
  Keypair,
  LAMPORTS_PER_SOL,
  VersionedTransaction
} from '@solana/web3.js'
import { useCallback, useEffect, useState } from 'react'
import './App.css'

// Fixed token list for simplicity
const TOKENS = {
  SOL: {
    symbol: 'SOL',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    name: 'Solana'
  },
  USDC: {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    name: 'USD Coin'
  },
  BONK: {
    symbol: 'BONK',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    name: 'Bonk'
  }
}

interface SwapState {
  inputToken: keyof typeof TOKENS
  outputToken: keyof typeof TOKENS
  inputAmount: string
  quote: QuoteResponse | null
  isLoading: boolean
  error: string | null
  txStatus: 'idle' | 'preparing' | 'signing' | 'sending' | 'success' | 'error'
  txSignature: string | null
  solBalance: number
  lastQuoteTime: number
}

function App() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [localWallet, setLocalWallet] = useState<Keypair | null>(null)
  const [swapState, setSwapState] = useState<SwapState>({
    inputToken: 'SOL',
    outputToken: 'USDC',
    inputAmount: '',
    quote: null,
    isLoading: false,
    error: null,
    txStatus: 'idle',
    txSignature: null,
    solBalance: 0,
    lastQuoteTime: 0
  })

  const jupiterApi = createJupiterApiClient()

  // Create local wallet
  const createLocalWallet = useCallback(() => {
    const newWallet = Keypair.generate()
    setLocalWallet(newWallet)
    console.log('Local wallet created:', newWallet.publicKey.toString())
    console.log('Private key (save this!):', Buffer.from(newWallet.secretKey).toString('hex'))
  }, [])

  // Get wallet balance
  const getBalance = useCallback(async () => {
    const currentWallet = wallet.publicKey || localWallet?.publicKey
    if (!currentWallet) {
      setSwapState(prev => ({ ...prev, solBalance: 0 }))
      return
    }

    try {
      console.log('Fetching balance for wallet:', currentWallet.toString())
      console.log('Using RPC endpoint:', connection.rpcEndpoint)
      const balance = await connection.getBalance(currentWallet)
      console.log('Balance fetched:', balance, 'lamports =', balance / LAMPORTS_PER_SOL, 'SOL')
      setSwapState(prev => ({ ...prev, solBalance: balance / LAMPORTS_PER_SOL, error: null }))
    } catch (error: any) {
      console.error('Failed to get balance:', error)
      
      let errorMessage = 'Failed to fetch balance'
      
      if (error.message?.includes('403') || error.status === 403) {
        errorMessage = 'RPC rate limit exceeded (403). Try switching to a different RPC endpoint using the "Switch RPC" button above.'
      } else if (error.message?.includes('429') || error.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.'
      } else if (error.message?.includes('Network request failed')) {
        errorMessage = 'Network connection failed. Check your internet connection.'
      } else {
        errorMessage = `Failed to fetch balance: ${error.message || 'Unknown error'}`
      }
      
      setSwapState(prev => ({ 
        ...prev, 
        error: errorMessage
      }))
    }
  }, [connection, wallet.publicKey, localWallet?.publicKey])

  // Get quote from Jupiter
  const getQuote = useCallback(async () => {
    if (!swapState.inputAmount || parseFloat(swapState.inputAmount) <= 0) {
      setSwapState(prev => ({ ...prev, quote: null, error: null }))
      return
    }

    // Prevent same token swap
    if (swapState.inputToken === swapState.outputToken) {
      setSwapState(prev => ({ ...prev, error: 'Input and output tokens cannot be the same' }))
      return
    }

    setSwapState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const inputToken = TOKENS[swapState.inputToken]
      const outputToken = TOKENS[swapState.outputToken]
      const inputAmountLamports = Math.floor(
        parseFloat(swapState.inputAmount) * Math.pow(10, inputToken.decimals)
      )

      const quote = await jupiterApi.quoteGet({
        inputMint: inputToken.mint,
        outputMint: outputToken.mint,
        amount: inputAmountLamports,
        slippageBps: 50, // 0.5% slippage
      })

      setSwapState(prev => ({ 
        ...prev, 
        quote, 
        isLoading: false,
        error: null,
        lastQuoteTime: Date.now()
      }))
    } catch (error) {
      console.error('Quote error:', error)
      setSwapState(prev => ({ 
        ...prev, 
        quote: null, 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get quote. Please try again.'
      }))
    }
  }, [swapState.inputAmount, swapState.inputToken, swapState.outputToken, jupiterApi])

  // Execute swap
  const executeSwap = useCallback(async () => {
    if (!swapState.quote) return

    const userPublicKey = wallet.publicKey || localWallet?.publicKey
    if (!userPublicKey) {
      setSwapState(prev => ({ ...prev, error: 'No wallet connected' }))
      return
    }

    // Check if user has enough balance for SOL swaps
    if (swapState.inputToken === 'SOL' && parseFloat(swapState.inputAmount) > swapState.solBalance) {
      setSwapState(prev => ({ ...prev, error: 'Insufficient SOL balance' }))
      return
    }

    // Ensure minimum SOL balance for transaction fees (0.01 SOL)
    const minSolForFees = 0.01
    if (swapState.solBalance < minSolForFees) {
      setSwapState(prev => ({ 
        ...prev, 
        error: `Insufficient SOL for transaction fees. Minimum ${minSolForFees} SOL required.` 
      }))
      return
    }

    // If swapping SOL, ensure enough left for fees
    if (swapState.inputToken === 'SOL') {
      const totalNeeded = parseFloat(swapState.inputAmount) + minSolForFees
      if (totalNeeded > swapState.solBalance) {
        setSwapState(prev => ({ 
          ...prev, 
          error: `Insufficient SOL. Need ${totalNeeded.toFixed(4)} SOL (${swapState.inputAmount} + ${minSolForFees} for fees), but only have ${swapState.solBalance.toFixed(4)} SOL` 
        }))
        return
      }
    }

    setSwapState(prev => ({ ...prev, txStatus: 'preparing', error: null }))

    try {
      console.log('Starting swap execution...')
      console.log('Quote:', swapState.quote)
      console.log('User Public Key:', userPublicKey.toString())

      // Get swap transaction
      const swapResponse = await jupiterApi.swapPost({
        swapRequest: {
          quoteResponse: swapState.quote,
          userPublicKey: userPublicKey.toString(),
          wrapAndUnwrapSol: true,
        },
      })

      console.log('Swap response received')
      const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64')
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf)

      // Get latest blockhash to avoid expired transaction errors
      console.log('Getting latest blockhash...')
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.message.recentBlockhash = blockhash

      console.log('Transaction deserialized with fresh blockhash')
      setSwapState(prev => ({ ...prev, txStatus: 'signing' }))

      let signedTransaction: VersionedTransaction

      if (wallet.signTransaction && wallet.publicKey) {
        console.log('Signing with connected wallet...')
        signedTransaction = await wallet.signTransaction(transaction)
      } else if (localWallet) {
        console.log('Signing with local wallet...')
        transaction.sign([localWallet])
        signedTransaction = transaction
      } else {
        throw new Error('No signing method available')
      }

      console.log('Transaction signed')
      setSwapState(prev => ({ ...prev, txStatus: 'sending' }))

      // Send transaction with improved configuration
      console.log('Sending transaction...')
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'processed',
          maxRetries: 2,
        }
      )

      console.log('Transaction sent with signature:', signature)
      setSwapState(prev => ({ 
        ...prev, 
        txStatus: 'success',
        txSignature: signature 
      }))

      // Confirm transaction
      console.log('Confirming transaction...')
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight,
      }, 'confirmed')

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
      }

      console.log('Transaction confirmed:', signature)
      
      // Refresh balance after successful swap
      setTimeout(() => {
        getBalance()
      }, 2000) // Wait 2 seconds before refreshing balance

    } catch (error: any) {
      console.error('Swap error details:', error)
      
      let errorMessage = 'Unknown error occurred'
      
      if (error.message) {
        errorMessage = error.message
      }
      
      // Handle specific error types
      if (error.message?.includes('Simulation failed')) {
        errorMessage = 'Transaction simulation failed. This could be due to:\n' +
                     '• Insufficient token balance\n' +
                     '• Network congestion\n' +
                     '• Invalid swap parameters\n' +
                     '• Try refreshing the quote and retry'
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for this transaction'
      } else if (error.message?.includes('Blockhash not found')) {
        errorMessage = 'Transaction expired. Please try again with a fresh quote.'
      } else if (error.message?.includes('custom program error')) {
        errorMessage = 'Smart contract error. The swap parameters may be invalid.'
      }

      setSwapState(prev => ({ 
        ...prev, 
        txStatus: 'error',
        error: `Swap failed: ${errorMessage}` 
      }))
    }
  }, [swapState.quote, swapState.inputToken, swapState.inputAmount, swapState.solBalance, wallet, localWallet, connection, jupiterApi, getBalance])

  // Reset transaction status for new swap
  const resetSwap = useCallback(() => {
    setSwapState(prev => ({ 
      ...prev, 
      txStatus: 'idle', 
      error: null, 
      txSignature: null 
    }))
  }, [])

  // Handle token change to prevent same input/output
  const handleInputTokenChange = (newToken: keyof typeof TOKENS) => {
    setSwapState(prev => ({ 
      ...prev, 
      inputToken: newToken,
      outputToken: newToken === prev.outputToken ? 
        (Object.keys(TOKENS).find(key => key !== newToken) as keyof typeof TOKENS) || 'USDC' : 
        prev.outputToken
    }))
  }

  const handleOutputTokenChange = (newToken: keyof typeof TOKENS) => {
    setSwapState(prev => ({ 
      ...prev, 
      outputToken: newToken,
      inputToken: newToken === prev.inputToken ? 
        (Object.keys(TOKENS).find(key => key !== newToken) as keyof typeof TOKENS) || 'SOL' : 
        prev.inputToken
    }))
  }

  // Get quote when input changes
  useEffect(() => {
    // Clear previous quote when input changes to prevent showing stale data
    if (swapState.inputAmount && parseFloat(swapState.inputAmount) > 0) {
      const timeoutId = setTimeout(() => {
        getQuote()
      }, 800) // Increased debounce time to reduce flashing

      return () => clearTimeout(timeoutId)
    } else {
      // Clear quote immediately if no valid input
      setSwapState(prev => ({ ...prev, quote: null, error: null, isLoading: false }))
    }
  }, [swapState.inputAmount, swapState.inputToken, swapState.outputToken])

  // Get balance when wallet changes
  useEffect(() => {
    if (wallet.publicKey || localWallet?.publicKey) {
      getBalance()
    }
  }, [wallet.publicKey, localWallet?.publicKey, connection, getBalance])

  // Re-fetch balance when connection changes (network switch)
  useEffect(() => {
    if (wallet.publicKey || localWallet?.publicKey) {
      console.log('Network changed, refreshing balance...')
      getBalance()
    }
  }, [connection])

  // Clear local wallet when external wallet connects
  useEffect(() => {
    if (wallet.connected && localWallet) {
      setLocalWallet(null)
      console.log('Local wallet cleared due to external wallet connection')
    }
  }, [wallet.connected, localWallet])

  // Reset balance when no wallet is connected
  useEffect(() => {
    if (!wallet.publicKey && !localWallet?.publicKey) {
      setSwapState(prev => ({ ...prev, solBalance: 0 }))
    }
  }, [wallet.publicKey, localWallet?.publicKey])

  const currentWallet = wallet.publicKey || localWallet?.publicKey
  const quoteAge = (Date.now() - swapState.lastQuoteTime) / 1000 // in seconds

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Solana Swap Prototype</h1>
      
      {/* Wallet Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Wallet</h2>
        
        {/* Wallet Connection Status */}
        <div style={{ marginBottom: '15px' }}>
          <p><strong>Status:</strong> 
            <span style={{ 
              marginLeft: '10px',
              color: currentWallet ? '#28a745' : '#6c757d'
            }}>
              {wallet.connecting ? 'Connecting...' : 
               wallet.connected ? 'Connected' : 
               localWallet ? 'Local Wallet' : 
               'Not Connected'}
            </span>
          </p>
        </div>

        {/* External Wallet Connection */}
        <div style={{ marginBottom: '10px' }}>
          <WalletMultiButton style={{ marginRight: '10px' }} />
          {wallet.connected && (
            <button 
              onClick={() => wallet.disconnect()} 
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Local Wallet Creation */}
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={createLocalWallet} 
            disabled={!!localWallet || wallet.connected}
            style={{
              padding: '8px 16px',
              backgroundColor: localWallet || wallet.connected ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: localWallet || wallet.connected ? 'not-allowed' : 'pointer'
            }}
          >
            {localWallet ? 'Local Wallet Created' : 
             wallet.connected ? 'External Wallet Connected' :
             'Create Local Wallet'}
          </button>
          {localWallet && !wallet.connected && (
            <button 
              onClick={() => setLocalWallet(null)} 
              style={{
                marginLeft: '10px',
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Remove Local Wallet
            </button>
          )}
        </div>

        {/* Wallet Info */}
        {currentWallet && (
          <div style={{ 
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <p style={{ margin: '0 0 5px 0' }}>
              <strong>Address:</strong> {currentWallet.toString().slice(0, 8)}...{currentWallet.toString().slice(-8)}
            </p>
            <p style={{ margin: '0 0 5px 0' }}>
              <strong>Network:</strong> {connection.rpcEndpoint.includes('mainnet') ? 'Mainnet' : 
                                       connection.rpcEndpoint.includes('testnet') ? 'Testnet' : 'Devnet'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 5px 0' }}>
              <span>
                <strong>SOL Balance:</strong> {swapState.solBalance.toFixed(4)} SOL
              </span>
              <button 
                onClick={getBalance}
                style={{ 
                  padding: '2px 8px', 
                  fontSize: '12px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                🔄 Refresh
              </button>
            </div>
            <p style={{ margin: '0', fontSize: '12px', color: '#6c757d' }}>
              Wallet Type: {wallet.connected ? wallet.wallet?.adapter.name || 'External' : 'Local'}
            </p>
          </div>
        )}

        {/* Error Display */}
        {swapState.error && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px'
          }}>
            <strong>Error:</strong> {swapState.error}
          </div>
        )}
      </div>

      {/* Swap Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Swap</h2>
        
        {/* Input Token */}
        <div style={{ marginBottom: '15px' }}>
          <label>From:</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select 
              value={swapState.inputToken} 
              onChange={(e) => handleInputTokenChange(e.target.value as keyof typeof TOKENS)}
            >
              {Object.entries(TOKENS).map(([key, token]) => (
                <option key={key} value={key}>{token.symbol} - {token.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={swapState.inputAmount}
              onChange={(e) => setSwapState(prev => ({ ...prev, inputAmount: e.target.value }))}
              style={{ flex: 1 }}
              min="0"
              step="any"
            />
          </div>
        </div>

        {/* Output Token */}
        <div style={{ marginBottom: '15px' }}>
          <label>To:</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select 
              value={swapState.outputToken} 
              onChange={(e) => handleOutputTokenChange(e.target.value as keyof typeof TOKENS)}
            >
              {Object.entries(TOKENS).map(([key, token]) => (
                <option key={key} value={key}>{token.symbol} - {token.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="You will receive"
              value={swapState.quote ? (
                parseInt(swapState.quote.outAmount) / Math.pow(10, TOKENS[swapState.outputToken].decimals)
              ).toFixed(6) : ''}
              disabled
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Quote Info */}
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '4px',
          minHeight: '80px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {swapState.isLoading ? (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#666' }}>🔄 Getting quote...</p>
            </div>
          ) : swapState.quote ? (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 5px 0' }}><strong>Quote:</strong></p>
                <p style={{ margin: '0 0 5px 0' }}>Price Impact: {((parseFloat(swapState.quote.priceImpactPct) || 0) * 100).toFixed(4)}%</p>
                <p style={{ margin: '0 0 5px 0' }}>Route: {swapState.quote.routePlan.length} step(s)</p>
                {quoteAge > 30 && <p style={{ margin: '0', color: '#ff6b35' }}>⚠️ Quote is {Math.floor(quoteAge)}s old</p>}
              </div>
              <button 
                onClick={getQuote} 
                disabled={swapState.isLoading}
                style={{ 
                  padding: '5px 10px', 
                  fontSize: '12px',
                  backgroundColor: swapState.isLoading ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: swapState.isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                🔄 Refresh
              </button>
            </div>
          ) : swapState.inputAmount && parseFloat(swapState.inputAmount) > 0 ? (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#999' }}>Waiting for quote...</p>
            </div>
          ) : (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#999' }}>Enter amount to get quote</p>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <button 
          onClick={swapState.txStatus === 'success' || swapState.txStatus === 'error' ? resetSwap : executeSwap}
          disabled={
            (!swapState.quote || !currentWallet) && 
            swapState.txStatus !== 'success' && 
            swapState.txStatus !== 'error'
          }
          style={{ 
            width: '100%', 
            padding: '12px', 
            fontSize: '16px',
            backgroundColor: 
              swapState.txStatus === 'success' ? '#28a745' :
              swapState.txStatus === 'error' ? '#dc3545' :
              (swapState.quote && currentWallet ? '#007bff' : '#ccc'),
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 
              (swapState.quote && currentWallet) || 
              swapState.txStatus === 'success' || 
              swapState.txStatus === 'error' ? 'pointer' : 'not-allowed'
          }}
        >
          {swapState.txStatus === 'preparing' && 'Preparing Transaction...'}
          {swapState.txStatus === 'signing' && 'Please Sign Transaction...'}
          {swapState.txStatus === 'sending' && 'Sending Transaction...'}
          {swapState.txStatus === 'idle' && 'Swap'}
          {swapState.txStatus === 'success' && 'New Swap'}
          {swapState.txStatus === 'error' && 'Try Again'}
        </button>
      </div>

      {/* Transaction Status */}
      {(swapState.txSignature || swapState.error) && (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h2>Transaction Status</h2>
          
          {swapState.txSignature && (
            <div style={{ marginBottom: '10px' }}>
              <p><strong>Status:</strong> {swapState.txStatus}</p>
              <p><strong>Signature:</strong> 
                <a 
                  href={`https://explorer.solana.com/tx/${swapState.txSignature}${
                    connection.rpcEndpoint.includes('mainnet') ? '' : 
                    connection.rpcEndpoint.includes('testnet') ? '?cluster=testnet' : '?cluster=devnet'
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: '10px', color: '#007bff' }}
                >
                  {swapState.txSignature.slice(0, 8)}...{swapState.txSignature.slice(-8)}
                </a>
              </p>
            </div>
          )}
          
          {swapState.error && (
            <div style={{ color: 'red', marginBottom: '10px' }}>
              <p><strong>Error:</strong> {swapState.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
