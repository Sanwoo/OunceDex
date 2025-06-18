import { useErc4626MetadataStore } from '@/store/erc4626MetaDataStore'
import { PoolCore } from '@/lib/details/types'
import { Erc4626Metadata } from '../store/erc4626MetaDataStore'

const useGetErc4626Metadata = (pool: Pick<PoolCore, 'tags'>): Erc4626Metadata[] => {
  const { Erc4626Metadata } = useErc4626MetadataStore()
  if (!Erc4626Metadata) {
    return []
  }
  return Erc4626Metadata.filter((_metadata) => pool.tags?.map((tag) => tag?.toLowerCase()).includes(_metadata.id))
}

export default useGetErc4626Metadata
