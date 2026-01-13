import React, { useEffect, useState } from 'react';
import { getComanda } from './api.js';
import ComandaItemForm from './ComandaItemForm.jsx';


function ComandaPage({ comandaId, produtos, onAddItem, onFecharComanda, onVoltar }) {
  const [comanda, setComanda] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  function fmtMoney(v) {
    if (v == null) return 'R$ 0,00';
    const n = Number(v);
    if (Number.isFinite(n)) return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return String(v);
  }
  function fmtDate(dt) {
    try {
      const d = new Date(dt);
      if (!Number.isNaN(d.getTime())) return d.toLocaleString('pt-BR');
    } catch {}
    return dt ? String(dt) : '-';
  }

  async function load() {
    setLoading(true); setErr(''); setMsg('');
    try {
      const c = await getComanda(comandaId);
      setComanda(c);
    } catch (error) {
      setErr(error.message || 'Falha ao carregar comanda');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [comandaId]);
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onVoltar();
      if (e.key.toLowerCase() === 'f' && comanda && comanda.status !== 'FECHADA') { e.preventDefault(); fechar(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [comanda, onVoltar]);

  async function addItem(payload) {
    setErr(''); setMsg('');
    try {
      const created = await onAddItem(payload);
      setMsg(`Item adicionado: #${created.id}`);
      await load();
      return created;
    } catch (error) {
      setErr(error.message || 'Falha ao adicionar item');
      throw error;
    }
  }

  async function fechar() {
    setErr(''); setMsg('');
    try {
      const c = await onFecharComanda(comandaId);
      setMsg(`Comanda fechada: #${c.id}`);
      await load();
    } catch (error) {
      setErr(error.message || 'Falha ao fechar comanda');
    }
  }

  if (!comanda) {
    return (
      <div className="card">
        <nav className="breadcrumbs"><a href="#/comandas">Comandas</a> <span>/</span> <span>#{comandaId}</span></nav>
        <h2>Comanda #{comandaId}</h2>
        {loading ? <div className="msg">Carregando...</div> : <div className="err">{err || 'Comanda não encontrada'}</div>}
        <div className="actions-row">
          <button type="button" onClick={onVoltar}>Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <nav className="breadcrumbs"><a href="#/comandas">Comandas</a> <span>/</span> <span>#{comanda.id}</span></nav>
      <h2>Comanda #{comanda.id} — {comanda.nomeCliente}</h2>
      <div className="meta-row">
        <span className={`badge ${comanda.status === 'FECHADA' ? 'closed' : 'open'}`}>{comanda.status}</span>
        <span>Tipo: {comanda.tipoCliente}</span>
        <span>Day Use: {fmtMoney(comanda.valorDayUse)}</span>
        <span>Total: {fmtMoney(comanda.valorTotal)}</span>
      </div>
      <div className="meta-row">
        <span>Abertura: {fmtDate(comanda.dataAbertura)}</span>
        <span>Fechamento: {fmtDate(comanda.dataFechamento)}</span>
      </div>
      <div className="actions-row">
        <button type="button" onClick={onVoltar}>Voltar</button>
        {comanda.status !== 'FECHADA' && <button type="button" onClick={fechar}>Fechar Comanda</button>}
      </div>
      {msg && <div className="msg">{msg}</div>}
      {err && <div className="err">{err}</div>}

      <div className="card">
        <h2>Adicionar Item</h2>
        <ComandaItemForm produtos={produtos} onAddItem={addItem} selectedComandaId={comanda.id} />
      </div>
    </div>
  );
}
export default ComandaPage;