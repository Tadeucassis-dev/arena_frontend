import React, { useState } from 'react';

function ProductForm({ onCreate }) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const payload = {
        nome: nome.trim(),
        preco: preco === '' ? null : Number(preco),
        estoque: estoque === '' ? null : Number(estoque)
      };
      const created = await onCreate(payload);
      setMsg(`Produto criado: ${created.id} - ${created.nome}`);
      setNome(''); setPreco(''); setEstoque('');
    } catch (error) {
      setErr(error.message);
    }
  }

  return (
    <div className="card">
      <h2>Criar Produto</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome
          <input value={nome} onChange={e => setNome(e.target.value)} required />
        </label>
        <label>Preço (R$)
          <input type="number" step="0.01" value={preco} onChange={e => setPreco(e.target.value)} />
        </label>
        <label>Estoque
          <input type="number" step="1" value={estoque} onChange={e => setEstoque(e.target.value)} />
        </label>
        <button type="submit">Salvar</button>
        {msg && <div className="msg">{msg}</div>}
        {err && <div className="err">{err}</div>}
      </form>
    </div>
  );
}
export default ProductForm;