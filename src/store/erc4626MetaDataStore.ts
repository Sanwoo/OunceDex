import { create } from 'zustand'

const ERC4626_METADATA_URL = 'https://raw.githubusercontent.com/balancer/metadata/main/erc4626/index.json'
const ERC4626_METADATA_ICON_BASE_URL = 'https://raw.githubusercontent.com/balancer/metadata/main/erc4626/icons'

export type Erc4626Metadata = {
  id: string
  name: string
  description: string
  icon: string
  iconUrl?: string
  addresses: {
    [key: string]: string[]
  }
}

const minutesToSeconds = (minutes: number): number => minutes * 60

const getErc4626Metadata = async (): Promise<Erc4626Metadata[] | undefined> => {
  try {
    const res = await fetch(ERC4626_METADATA_URL, {
      next: { revalidate: minutesToSeconds(15) },
    })
    const metadata = (await res.json()) as Erc4626Metadata[]

    return metadata.map((metadata) => {
      return {
        ...metadata,
        iconUrl: metadata.icon ? `${ERC4626_METADATA_ICON_BASE_URL}/${metadata.icon}` : undefined,
      }
    })
  } catch (error) {
    console.error('Unable to fetch erc4626 metadata', error)
    return undefined
  }
}

interface Erc4626MetadataState {
  Erc4626Metadata: Erc4626Metadata[] | undefined
  isLoading: boolean
  error: Error | null
  fetchErc4626Metadata: () => Promise<void>
}

export const useErc4626MetadataStore = create<Erc4626MetadataState>((set) => ({
  Erc4626Metadata: undefined,
  isLoading: true,
  error: null,

  fetchErc4626Metadata: async () => {
    set({ isLoading: true })

    const metadata = await getErc4626Metadata()

    if (metadata === undefined) {
      set({
        error: new Error('Unable to fetch pools metadata'),
        isLoading: false,
      })
    } else {
      set({
        Erc4626Metadata: metadata,
        isLoading: false,
      })
    }
  },
}))

export const useErc4626Metadata = () => useErc4626MetadataStore((state) => state.Erc4626Metadata)
export const useErc4626MetadataLoading = () => useErc4626MetadataStore((state) => state.isLoading)
export const useErc4626MetadataError = () => useErc4626MetadataStore((state) => state.error)

if (typeof window !== 'undefined') {
  useErc4626MetadataStore.getState().fetchErc4626Metadata()
}
