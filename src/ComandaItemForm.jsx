import React, { useState } from 'react';

function ComandaItemForm({ produtos, onAddItem }) {
  const [comandaId, setComandaId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      if (!comandaId || !produtoId || !quantidade) {
        throw new Error('Informe comandaId, produto e quantidade');
      }
      const created = await onAddItem({
        comandaId: Number(comandaId),
        produtoId: Number(produtoId),
        quantidade: Number(quantidade)
      });
      setMsg(`Item adicionado: ${created.id}`);
      setQuantidade('');
    } catch (error) {
      setErr(error.message);
    }
  }

  return (
    <div className="card">
      <h2>Adicionar Item à Comanda</h2>
      <form onSubmit={handleSubmit}>
        <label>Comanda ID
          <input type="number" value={comandaId} onChange={e => setComandaId(e.target.value)} required />
        </label>
        <label>Produto
          <select value={produtoId} onChange={e => setProdutoId(e.target.value)} required>
            <option value="">Selecione...</option>
            {produtos.map(p => (
              <option key={p.id} value={p.id}>
                {p.nome} (R$ {String(p.preco)})
              </option>
            ))}
          </select>
        </label>
        <label>Quantidade
          <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} required />
        </label>
        <button type="submit">Adicionar</button>
        {msg && <div className="msg">{msg}</div>}
        {err && <div className="err">{err}</div>}
      </form>
    </div>
  );
}
export default ComandaItemForm;
export { ComandaItemForm };