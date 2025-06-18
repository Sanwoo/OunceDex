import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

const Header = () => {
  return (
    <div className="max-w-screen flex flex-row justify-between items-start md:items-center mb-5">
      <div>
        <h1 className="text-4xl font-bold text-white">Ounce-Dex</h1>
      </div>
      <div className="flex flex-row gap-5 items-center">
        <Link href="/" className="text-indigo-200" prefetch={true}>
          Swap
        </Link>
        <Link href="/Explore" className="text-indigo-200" prefetch={true}>
          Explore
        </Link>
        <ConnectButton showBalance={false} chainStatus="full" />
      </div>
    </div>
  )
}

export default Header
