import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { createAvatar } from '@dicebear/core'
import { identicon } from '@dicebear/collection'
import { GqlPoolTokenDetail } from './generated/graphql'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const convertHexToLowerCase = <T>(config: T): T => {
  const newConfig: Record<any, any> = {}

  for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      const value = config[key]
      const lowercaseKey = isHex(key) ? key.toLowerCase() : key

      if (typeof value === 'string' && isHex(value)) {
        newConfig[lowercaseKey] = value.toLowerCase()
      } else if (Array.isArray(value)) {
        newConfig[lowercaseKey] = value.map((item) => (typeof item === 'string' && isHex(item) ? item.toLowerCase() : item))
      } else if (typeof value === 'object') {
        newConfig[lowercaseKey] = convertHexToLowerCase(value)
      } else {
        newConfig[lowercaseKey] = value
      }
    }
  }

  return newConfig as T
}

const isHex = (s: string) => {
  return s.startsWith('0x')
}

export const needFallBackSVG = (tokens: GqlPoolTokenDetail[]): boolean => {
  return tokens.every((token) => !token.logoURI)
}

export const fallbackSVG = (address: string): string => {
  return createAvatar(identicon, {
    seed: address || 'unknown',
    backgroundColor: ['transparent'],
    radius: 50,
    backgroundType: ['solid'],
    scale: 80,
  }).toDataUri()
}

export const isSameAddress = (address1: string, address2: string): boolean => {
  if (!address1 || !address2) return false
  return address1.toLowerCase() === address2.toLowerCase()
}

const containsAll = (addresses1: string[], addresses2: string[]) => {
  return addresses2.every((address2) => addresses1.map((address1) => address1.toLowerCase()).includes(address2.toLowerCase()))
}

export const sameAddresses = (addresses1: string[], addresses2: string[]) => containsAll(addresses1, addresses2) && containsAll(addresses2, addresses1)
