import { useEffect, useRef, useState } from 'react'
import { Box, Flex, useToast } from '@chakra-ui/react'
import { Header } from '../src/components/Header'
import { Footer } from '../src/components/Footer'
import { PageContainer } from './components/PageContainer'
import ProductList from './ProductList'
import ProductForm from './ProductForm'
import ComandaList from './ComandaList'
import ComandaPage from './ComandaPage'
import Dashboard from './Dashboard'
import { Produto } from './types/produtos'
import { getErrorMessage } from './api'

import {
  getProdutos,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  abrirComanda,
  fecharComanda,
  registrarPagamento,
  atualizarComanda,
  deletarComanda,
  adicionarItemComanda,
  getComanda
} from './api'

export default function App() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [hash, setHash] = useState(window.location.hash || '#/')
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  const [criandoProduto, setCriandoProduto] = useState(false)
  const [produtoIdsAtualizando, setProdutoIdsAtualizando] = useState<number[]>([])
  const [produtoIdsExcluindo, setProdutoIdsExcluindo] = useState<number[]>([])
  const produtosRef = useRef<Produto[]>([])
  const toast = useToast()

  useEffect(() => {
    window.onhashchange = () =>
      setHash(window.location.hash || '#/')
  }, [])

  async function loadProdutos(showErrorToast = false) {
    setLoadingProdutos(true)
    try {
      const lista = await getProdutos()
      produtosRef.current = lista
      setProdutos(lista)
      return lista
    } catch (error) {
      if (showErrorToast) {
        toast({
          title: 'Erro ao carregar produtos',
          description: getErrorMessage(error, 'Nao foi possivel carregar o catalogo'),
          status: 'error',
          isClosable: true,
          duration: 4000,
        })
      }
      throw error
    } finally {
      setLoadingProdutos(false)
    }
  }

  useEffect(() => {
    loadProdutos(true).catch(() => {})
  }, [])

  async function handleCriarProduto(payload: Omit<Produto, 'id'>) {
    if (criandoProduto) return

    setCriandoProduto(true)
    try {
      await criarProduto(payload)
      await loadProdutos()
      toast({
        title: 'Produto cadastrado',
        description: `${payload.nome} foi adicionado ao catalogo`,
        status: 'success',
        isClosable: true,
        duration: 2500,
      })
    } catch (error) {
      toast({
        title: 'Erro ao cadastrar produto',
        description: getErrorMessage(error, 'Nao foi possivel cadastrar o produto'),
        status: 'error',
        isClosable: true,
        duration: 4000,
      })
      throw error
    } finally {
      setCriandoProduto(false)
    }
  }

  async function handleAjustarEstoque(id: number, delta: number) {
    if (produtoIdsAtualizando.includes(id)) return

    const produtoAtual = produtosRef.current.find(p => p.id === id)
    if (!produtoAtual) return

    const estoqueAtual = produtoAtual.estoque || 0
    const proximoEstoque = Math.max(0, estoqueAtual + delta)

    const proximaLista = produtosRef.current.map(p =>
      p.id === id ? { ...p, estoque: proximoEstoque } : p
    )

    setProdutoIdsAtualizando(prev => [...prev, id])
    produtosRef.current = proximaLista
    setProdutos(proximaLista)

    try {
      await atualizarProduto(id, { estoque: proximoEstoque })
      toast({
        title: delta > 0 ? 'Estoque aumentado' : 'Estoque reduzido',
        description: `${produtoAtual.nome}: ${proximoEstoque} unidade(s) em estoque`,
        status: 'success',
        isClosable: true,
        duration: 1800,
      })
    } catch (error) {
      await loadProdutos()
      toast({
        title: 'Erro ao atualizar estoque',
        description: getErrorMessage(error, 'Nao foi possivel atualizar o estoque'),
        status: 'error',
        isClosable: true,
        duration: 4000,
      })
      throw error
    } finally {
      setProdutoIdsAtualizando(prev => prev.filter(produtoId => produtoId !== id))
    }
  }

  async function handleDeletarProduto(id: number) {
    if (produtoIdsExcluindo.includes(id)) return

    const listaAnterior = produtosRef.current
    const proximaLista = produtosRef.current.filter(p => p.id !== id)
    const produto = produtosRef.current.find(p => p.id === id)

    setProdutoIdsExcluindo(prev => [...prev, id])
    produtosRef.current = proximaLista
    setProdutos(proximaLista)

    try {
      await deletarProduto(id)
      toast({
        title: 'Produto excluido',
        description: `${produto?.nome || 'Produto'} foi removido do catalogo`,
        status: 'success',
        isClosable: true,
        duration: 2500,
      })
    } catch (error) {
      produtosRef.current = listaAnterior
      setProdutos(listaAnterior)
      toast({
        title: 'Erro ao excluir produto',
        description: getErrorMessage(error, 'Nao foi possivel excluir o produto'),
        status: 'error',
        isClosable: true,
        duration: 4000,
      })
      throw error
    } finally {
      setProdutoIdsExcluindo(prev => prev.filter(produtoId => produtoId !== id))
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
              onRegistrarPagamento={registrarPagamento}
              onGetComanda={getComanda}
              onDeletarComanda={deletarComanda}
              onProdutosAtualizados={loadProdutos}
              onVoltar={() => (window.location.hash = '#/comandas')}
            />
          ) : hash === '#/produtos' ? (
            <>
              <ProductForm onCreate={handleCriarProduto} isSubmitting={criandoProduto} />
              <ProductList
                produtos={produtos}
                onAdjustStock={handleAjustarEstoque}
                onDelete={handleDeletarProduto}
                loadingIds={produtoIdsAtualizando}
                deletingIds={produtoIdsExcluindo}
                isLoading={loadingProdutos}
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
