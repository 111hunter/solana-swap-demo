// Polyfills for Node.js globals in browser environment
import { Buffer } from 'buffer'
import process from 'process'

// Make Buffer and process globally available
globalThis.Buffer = Buffer
globalThis.process = process

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { StrictMode, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

// Better RPC endpoints configuration
const RPC_ENDPOINTS = {
  [WalletAdapterNetwork.Mainnet]: [
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.helius.xyz/?api-key=demo', // Free tier with better limits
    'https://mainnet.helius-rpc.com/?api-key=demo',
    clusterApiUrl(WalletAdapterNetwork.Mainnet), // Fallback to default
  ],
  [WalletAdapterNetwork.Testnet]: [
    clusterApiUrl(WalletAdapterNetwork.Testnet),
    'https://api.testnet.solana.com',
  ],
  [WalletAdapterNetwork.Devnet]: [
    clusterApiUrl(WalletAdapterNetwork.Devnet),
    'https://api.devnet.solana.com',
  ],
}

function Root() {
  const [network, setNetwork] = useState<WalletAdapterNetwork>(WalletAdapterNetwork.Mainnet)
  const [rpcIndex, setRpcIndex] = useState(0)
  
  const endpoint = useMemo(() => {
    const endpoints = RPC_ENDPOINTS[network]
    return endpoints[rpcIndex % endpoints.length]
  }, [network, rpcIndex])
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [network]
  )

  const switchRPC = () => {
    setRpcIndex(prev => prev + 1)
  }

  const currentRPCName = useMemo(() => {
    const endpoints = RPC_ENDPOINTS[network]
    const currentEndpoint = endpoints[rpcIndex % endpoints.length]
    
    if (currentEndpoint.includes('helius')) return 'Helius (Free)'
    if (currentEndpoint.includes('projectserum')) return 'Project Serum'
    if (currentEndpoint.includes('api.mainnet-beta')) return 'Solana Labs'
    if (currentEndpoint.includes('clusterApiUrl')) return 'Default'
    return 'Custom'
  }, [network, rpcIndex])

  return (
    <div>
      {/* Network Selector */}
      <div style={{ 
        padding: '10px 20px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
            Solana Network:
          </label>
          <select 
            value={network} 
            onChange={(e) => {
              setNetwork(e.target.value as WalletAdapterNetwork)
              setRpcIndex(0) // Reset RPC index when changing network
            }}
            style={{
              padding: '5px 10px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value={WalletAdapterNetwork.Mainnet}>Mainnet</option>
            <option value={WalletAdapterNetwork.Testnet}>Testnet</option>
            <option value={WalletAdapterNetwork.Devnet}>Devnet</option>
          </select>
          <span style={{ 
            marginLeft: '10px', 
            fontSize: '12px', 
            color: network === WalletAdapterNetwork.Mainnet ? '#28a745' : '#ffc107'
          }}>
            ({network === WalletAdapterNetwork.Mainnet ? 'Real SOL' : 'Test SOL'})
          </span>
        </div>
        
        {/* RPC Selector */}
        <div style={{ fontSize: '12px', color: '#666' }}>
          <span style={{ marginRight: '10px' }}>
            RPC: {currentRPCName}
          </span>
          <button 
            onClick={switchRPC}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Switch RPC
          </button>
          {network === WalletAdapterNetwork.Mainnet && (
            <span style={{ marginLeft: '10px', color: '#ffc107' }}>
              💡 Try switching RPC if you get 403 errors
            </span>
          )}
        </div>
      </div>
      
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect={false}>
          <WalletModalProvider>
            <App />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
