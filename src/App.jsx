import React, { useEffect, useState } from 'react';
import ProductList from './ProductList.jsx';
import ProductForm from './ProductForm.jsx';
import ComandaItemForm from './ComandaItemForm.jsx';
import { getProdutos, criarProduto, adicionarItemComanda } from './api.js';
import logoArena from './assets/logoArenaCesar.jpg';

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [err, setErr] = useState('');

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
        </div>
      </header>
      <main className="container">
        {err && <div className="alert error">Erro: {err}</div>}
        <div className="grid">
          <ProductForm onCreate={handleCreateProduto} />
          <ComandaItemForm produtos={produtos} onAddItem={handleAddItem} />
        </div>
        <ProductList produtos={produtos} />
        <div className="status-bar">Backend: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}</div>
      </main>
    </div>
  );
}