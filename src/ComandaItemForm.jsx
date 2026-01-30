import React, { useState } from 'react';

function ComandaItemForm({ produtos, onAddItem, selectedComandaId }) {

  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');


  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      if (!selectedComandaId || !produtoId) {
        throw new Error('Selecione comanda e produto');
      }
      const created = await onAddItem({
        comandaId: Number(selectedComandaId),
        produtoId: Number(produtoId),
        quantidade: Number(quantidade || 1)
      });
      setMsg(`Item adicionado: ${created.id}`);
      setQuantidade('1');
    } catch (error) {
      setErr(error.message);
    }
  }

  async function autoAdd(prodId) {
    if (!selectedComandaId) {
      setErr('Selecione uma comanda');
      return;
    }
    setMsg(''); setErr('');
    try {
      const created = await onAddItem({
        comandaId: Number(selectedComandaId),
        produtoId: Number(prodId),
        quantidade: 1
      });
      setMsg(`Item adicionado: ${created.id}`);
      setQuantidade('1');
      setProdutoId('');
    } catch (error) {
      setErr(error.message);
    }
  }

  return (
    <div className="card">
      <h2>Adicionar Item à Comanda</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>Comanda atual: {selectedComandaId ?? '-'}</div>
        <label>Produto
          <select value={produtoId} onChange={e => { const v = e.target.value; setProdutoId(v); if (selectedComandaId && v) { autoAdd(v); } }} required>
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