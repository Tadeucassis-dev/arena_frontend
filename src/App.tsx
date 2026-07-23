import { useEffect, useRef, useState } from 'react'
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
  deletarProduto,
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
  const produtosRef = useRef<Produto[]>([])

  useEffect(() => {
    window.onhashchange = () =>
      setHash(window.location.hash || '#/')
  }, [])

  async function loadProdutos() {
    const lista = await getProdutos()
    produtosRef.current = lista
    setProdutos(lista)
  }

  useEffect(() => {
    loadProdutos()
  }, [])

  async function handleCriarProduto(payload: Omit<Produto, 'id'>) {
    await criarProduto(payload)
    await loadProdutos()
  }

  async function handleAjustarEstoque(id: number, delta: number) {
    const produtoAtual = produtosRef.current.find(p => p.id === id)
    if (!produtoAtual) return

    const estoqueAtual = produtoAtual.estoque || 0
    const proximoEstoque = Math.max(0, estoqueAtual + delta)

    const proximaLista = produtosRef.current.map(p =>
      p.id === id ? { ...p, estoque: proximoEstoque } : p
    )

    produtosRef.current = proximaLista
    setProdutos(proximaLista)

    try {
      await atualizarProduto(id, { estoque: proximoEstoque })
    } catch (error) {
      await loadProdutos()
      throw error
    }
  }

  async function handleDeletarProduto(id: number) {
    const listaAnterior = produtosRef.current
    const proximaLista = produtosRef.current.filter(p => p.id !== id)

    produtosRef.current = proximaLista
    setProdutos(proximaLista)

    try {
      await deletarProduto(id)
    } catch (error) {
      produtosRef.current = listaAnterior
      setProdutos(listaAnterior)
      throw error
    }
  }

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
              onProdutosAtualizados={loadProdutos}
              onVoltar={() => (window.location.hash = '#/comandas')}
            />
          ) : hash === '#/produtos' ? (
            <>
              <ProductForm onCreate={handleCriarProduto} />
              <ProductList
                produtos={produtos}
                onAdjustStock={handleAjustarEstoque}
                onDelete={handleDeletarProduto}
              />
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
