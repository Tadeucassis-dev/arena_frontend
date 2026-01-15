import React, { useEffect, useState } from 'react';
import ProductList from './ProductList.jsx';
import ProductForm from './ProductForm.jsx';
import ComandaItemForm from './ComandaItemForm.jsx';

import ComandaList from './ComandaList.jsx';
import ComandaPage from './ComandaPage.jsx';
import { getProdutos, criarProduto, adicionarItemComanda, abrirComanda, fecharComanda, buscarComandaPorNome, buscarComandasPorNome, listarComandas } from './api.js';
import logoArena from './assets/logoArenaCesar.jpg';

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [err, setErr] = useState('');
  const [comandaId, setComandaId] = useState(null);
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    if (!window.location.hash) window.location.hash = '#/comandas';
    const f = () => setHash(window.location.hash || '#/comandas');
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);

  async function loadProdutos() {
    setErr('');
    try {
      const data = await getProdutos();
      setProdutos(data);
    } catch (error) {
      setErr(error.message);
    }
  }

  useEffect(() => { loadProdutos(); }, []);

  async function handleCreateProduto(payload) {
    const created = await criarProduto(payload);
    await loadProdutos();
    return created;
  }

  async function handleAddItem(payload) {
    const created = await adicionarItemComanda(payload);
    return created;
  }

  async function handleAbrirComanda(form) {
    const comanda = await abrirComanda(form);
    setComandaId(comanda.id);
    return comanda;
  }

  async function handleFecharComanda(id) {
    const c = await fecharComanda(id);
    setComandaId(c.id);
    return c;
  }

  async function handleBuscarPorNome(nome) {
    const c = await buscarComandaPorNome(nome);
    setComandaId(c.id);
    return c;
  }

  async function handleBuscarLista(nome) {
    const arr = await buscarComandasPorNome(nome);
    return arr;
  }

  async function handleListarAbertas() {
    const arr = await listarComandas('ABERTA');
    return arr;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container header-content">
          <div className="brand-group">
            <img className="brand-logo" src={logoArena} alt="Arena César CT" />
            <div className="brand-text">
              <h1 className="brand">Arena César CT</h1>
              <span className="subtitle">Centro de Treinamento e Lazer</span>
            </div>
          </div>
          <nav className="top-nav">
            <a href="#/comandas" className={hash.startsWith('#/comandas') ? 'active' : ''}>Comandas</a>
            <a href="#/produtos" className={hash === '#/produtos' ? 'active' : ''}>Produtos</a>
          </nav>
        </div>
      </header>
      <main className="container">
        {(() => {
          const id = hash.startsWith('#/comandas/') ? Number(hash.split('/')[2]) : null;
          if (id) {
            return (
              <ComandaPage
                comandaId={id}
                produtos={produtos}
                onAddItem={handleAddItem}
                onFecharComanda={handleFecharComanda}
                onVoltar={() => { window.location.hash = '#/comandas'; }}
              />
            );
          }
          if (hash === '#/comandas') {
            return (
              <ComandaList
                onSelecionar={(id2) => { setComandaId(id2); window.location.hash = `#/comandas/${id2}`; }}
                onFecharComanda={handleFecharComanda}
                onAbrirComanda={handleAbrirComanda}
              />
            );
          }
          if (hash === '#/produtos') {
            return (
              <div className="grid">
                <ProductForm onCreate={handleCreateProduto} />
                <ProductList produtos={produtos} />
              </div>
            );
          }
          return null;
        })()}
      </main>
      <div className="status-bar">Backend: {import.meta.env.VITE_API_BASE_URL || '/api'}</div>
    </div> 
  );
}

    

