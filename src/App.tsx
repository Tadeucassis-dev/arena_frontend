import { useEffect, useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { Header } from '../src/components/Header'
import { Footer } from '../src/components/Footer'
import { PageContainer } from './components/PageContainer'
import ProductList from './ProductList'
import ProductForm from './ProductForm'
import ComandaList from './ComandaList'
import ComandaPage from './ComandaPage'
import Dashboard from './Dashboard'
import { Produto } from './types/produtos'

import {
  getProdutos,
  criarProduto,
  atualizarProduto,
  abrirComanda,
  fecharComanda,
  atualizarComanda,
  deletarComanda,
  adicionarItemComanda,
  getComanda
} from './api'

export default function App() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [hash, setHash] = useState(window.location.hash || '#/')

  useEffect(() => {
    window.onhashchange = () =>
      setHash(window.location.hash || '#/')
  }, [])

  async function loadProdutos() {
    setProdutos(await getProdutos())
  }

  useEffect(() => {
    loadProdutos()
  }, [])

  return (
    <Flex direction="column" minH="100vh">
      <Header hash={hash} />
      <Box flex="1">
        <PageContainer>
          {hash === '#/' || hash === '' ? (
            <Dashboard />
          ) : hash.startsWith('#/comandas/') ? (
            <ComandaPage
              comandaId={Number(hash.split('/')[2])}
              produtos={produtos}
              onAddItem={adicionarItemComanda}
              onFecharComanda={fecharComanda}
              onGetComanda={getComanda}
              onDeletarComanda={deletarComanda}
              onVoltar={() => (window.location.hash = '#/comandas')}
            />
          ) : hash === '#/produtos' ? (
            <>
              <ProductForm onCreate={criarProduto} />
              <ProductList produtos={produtos} onUpdate={atualizarProduto} />
            </>
          ) : hash === '#/comandas' ? (
            <ComandaList
              produtos={produtos}
              onSelecionar={(id: any) =>
                (window.location.hash = `#/comandas/${id}`)
              }
              onFecharComanda={fecharComanda}
              onAbrirComanda={abrirComanda}
            />
          ) : null}
        </PageContainer>
      </Box>
      <Footer />
    </Flex>
  )
}