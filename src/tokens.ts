import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

export interface TokenInfo {
  symbol: string
  mint: string
  decimals: number
  name: string
  logoURI?: string
}

export type TokenSymbol = 'SOL' | 'USDC' | 'USDT' | 'BONK' | 'WIF' | 'JUP' | 'RAY'

// Token addresses for different networks
export const NETWORK_TOKENS: Record<WalletAdapterNetwork, Record<TokenSymbol, TokenInfo>> = {
  [WalletAdapterNetwork.Mainnet]: {
    SOL: {
      symbol: 'SOL',
      mint: 'So11111111111111111111111111111111111111112',
      decimals: 9,
      name: 'Solana',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    },
    USDC: {
      symbol: 'USDC',
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
      name: 'USD Coin',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
    },
    USDT: {
      symbol: 'USDT',
      mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      decimals: 6,
      name: 'Tether USD',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg'
    },
    BONK: {
      symbol: 'BONK',
      mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      decimals: 5,
      name: 'Bonk',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png'
    },
    WIF: {
      symbol: 'WIF',
      mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
      decimals: 6,
      name: 'dogwifhat',
      logoURI: 'https://i.imgur.com/yFLmAVB.png'
    },
    JUP: {
      symbol: 'JUP',
      mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      decimals: 6,
      name: 'Jupiter',
      logoURI: 'https://static.jup.ag/jup/icon.png'
    },
    RAY: {
      symbol: 'RAY',
      mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      decimals: 6,
      name: 'Raydium',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png'
    }
  },
  [WalletAdapterNetwork.Devnet]: {
    SOL: {
      symbol: 'SOL',
      mint: 'So11111111111111111111111111111111111111112',
      decimals: 9,
      name: 'Solana (Devnet)',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    },
    USDC: {
      symbol: 'USDC',
      mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // Official Solana Devnet USDC
      decimals: 6,
      name: 'USD Coin (Devnet)',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
    },
    USDT: {
      symbol: 'USDT',
      mint: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS', // Mock USDT for testing
      decimals: 6,
      name: 'Tether USD (Devnet)'
    },
    BONK: {
      symbol: 'BONK',
      mint: 'AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR', // Mock BONK for testing
      decimals: 5,
      name: 'Bonk (Devnet)'
    },
    WIF: {
      symbol: 'WIF',
      mint: 'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump', // Mock WIF for testing
      decimals: 6,
      name: 'dogwifhat (Devnet)'
    },
    JUP: {
      symbol: 'JUP',
      mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', // Same as mainnet for testing purposes
      decimals: 6,
      name: 'Jupiter (Devnet)'
    },
    RAY: {
      symbol: 'RAY',
      mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // Same as mainnet for testing purposes
      decimals: 6,
      name: 'Raydium (Devnet)'
    }
  },
  [WalletAdapterNetwork.Testnet]: {
    SOL: {
      symbol: 'SOL',
      mint: 'So11111111111111111111111111111111111111112',
      decimals: 9,
      name: 'Solana (Testnet)',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    },
    USDC: {
      symbol: 'USDC',
      mint: 'CpMah17kQEL2wqyMKt3mZBdTnZbkbfx4nqmQMFDP5vwp', // Mock Testnet USDC
      decimals: 6,
      name: 'USD Coin (Testnet)',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
    },
    USDT: {
      symbol: 'USDT',
      mint: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS', // Mock USDT for testing
      decimals: 6,
      name: 'Tether USD (Testnet)'
    },
    BONK: {
      symbol: 'BONK',
      mint: 'AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR', // Mock BONK for testing
      decimals: 5,
      name: 'Bonk (Testnet)'
    },
    WIF: {
      symbol: 'WIF',
      mint: 'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump', // Mock WIF for testing
      decimals: 6,
      name: 'dogwifhat (Testnet)'
    },
    JUP: {
      symbol: 'JUP',
      mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', // Same as mainnet for testing purposes
      decimals: 6,
      name: 'Jupiter (Testnet)'
    },
    RAY: {
      symbol: 'RAY',
      mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // Same as mainnet for testing purposes
      decimals: 6,
      name: 'Raydium (Testnet)'
    }
  }
}

// Helper function to get tokens for a specific network
export function getTokensForNetwork(network: WalletAdapterNetwork): Record<TokenSymbol, TokenInfo> {
  return NETWORK_TOKENS[network] || NETWORK_TOKENS[WalletAdapterNetwork.Mainnet]
}

// Helper function to get available token symbols for a network
export function getTokenSymbols(network: WalletAdapterNetwork): TokenSymbol[] {
  return Object.keys(getTokensForNetwork(network)) as TokenSymbol[]
}

// Helper function to check if a token is available on a network
export function isTokenAvailable(network: WalletAdapterNetwork, symbol: TokenSymbol): boolean {
  return symbol in getTokensForNetwork(network)
}

// Helper function to get network display name
export function getNetworkDisplayName(network: WalletAdapterNetwork): string {
  switch (network) {
    case WalletAdapterNetwork.Mainnet:
      return 'Mainnet-Beta'
    case WalletAdapterNetwork.Devnet:
      return 'Devnet'
    case WalletAdapterNetwork.Testnet:
      return 'Testnet'
    default:
      return network
  }
} 