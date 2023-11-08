import { GlobalConstraints } from './pages/Master'
const siteName = GlobalConstraints().siteName
export const DBConfig = {
  name: 'NAFFADB' + siteName + '',
  version: 1,
  objectStoresMeta: [
    {
      store: 'KBArticles' + siteName + '',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [

      ]
    },
    {
      store: 'Questions' + siteName + '',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [

      ]
    },
    {
      store: 'PASCODE' + siteName + '',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [

      ]
    }
  ]
}
