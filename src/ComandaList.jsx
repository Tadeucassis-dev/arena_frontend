import React, { useEffect, useState, useRef } from 'react';
import { listarComandas } from './api.js';

export default function ComandaList({ onSelecionar, onFecharComanda, onAbrirComanda }) {
  const [status, setStatus] = useState('ABERTA');
  const [busca, setBusca] = useState('');
  const [comandas, setComandas] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [openNome, setOpenNome] = useState('');
  const [openTipo, setOpenTipo] = useState('DAY_USE');
  const [openValor, setOpenValor] = useState('');
  const buscaRef = useRef(null);
  const [resumo, setResumo] = useState({ faturamento: 0, count: 0, ticketMedio: 0 });
  const [resumoErr, setResumoErr] = useState('');

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
      const data = await listarComandas(status);
      setComandas(data || []);
      setMsg(`${(data || []).length} comandas ${status?.toLowerCase() || ''} carregadas`);
    } catch (error) {
      setErr(error.message || 'Falha ao listar comandas');
    } finally {
      setLoading(false);
    }
  }

  async function loadResumo() {
    setResumoErr('');
    try {
      const fechadas = await listarComandas('FECHADA');
      const total = (fechadas || []).reduce((s, c) => s + Number(c.valorTotal || 0), 0);
      const count = (fechadas || []).length;
      const tm = count ? total / count : 0;
      setResumo({ faturamento: total, count, ticketMedio: tm });
    } catch (error) {
      setResumoErr(error.message || 'Falha ao carregar resumo');
    }
  }

  useEffect(() => { load(); }, [status]);
  useEffect(() => {
    const h = (e) => { if (e.key === '/') { e.preventDefault(); buscaRef.current?.focus(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  useEffect(() => { loadResumo(); }, []);

  const filtradas = comandas.filter(c =>
    (c.nomeCliente || '').toLowerCase().includes(busca.toLowerCase())
    || String(c.id || '').includes(busca)
  );

  async function fechar(id) {
    setErr(''); setMsg('');
    try {
      await onFecharComanda(id);
      setMsg(`Comanda fechada: #${id}`);
      await load();
    } catch (error) {
      setErr(error.message || 'Falha ao fechar comanda');
    }
  }

  async function abrirNaLista() {
    setErr(''); setMsg('');
    try {
      if (!openNome.trim()) throw new Error('Informe o nome do cliente');
      const payload = {
        nomeCliente: openNome.trim(),
        tipoCliente: openTipo,
        valorDayUse: openValor === '' ? null : Number(openValor)
      };
      const c = await onAbrirComanda(payload);
      setMsg(`Comanda aberta: #${c.id}`);
      onSelecionar(c.id);
      setOpenNome(''); setOpenValor('');
      await load();
    } catch (error) {
      setErr(error.message || 'Falha ao abrir comanda');
    }
  }

  return (
    <div className="card">
      <h2>Comandas</h2>
      <div className="list-controls">
        <div className="actions wrap">
          <label className="field">Status
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Todas</option>
              <option value="ABERTA">ABERTA</option>
              <option value="FECHADA">FECHADA</option>
            </select>
          </label>
          <label className="field">Buscar
            <input ref={buscaRef} placeholder="Nome do cliente ou #ID" value={busca} onChange={e => setBusca(e.target.value)} />
          </label>
          <button type="button" onClick={load} disabled={loading}>{loading ? 'Carregando...' : 'Atualizar'}</button>
        </div>
        <div className="meta-row">
          <span>Fechadas: {resumo.count}</span>
          <span>Faturamento: {fmtMoney(resumo.faturamento)}</span>
          <span>Ticket Médio: {fmtMoney(resumo.ticketMedio)}</span>
          <button type="button" onClick={loadResumo}>Atualizar Resumo</button>
        </div>
        <div className="open-form">
          <div className="open-form-title">Abrir Comanda</div>
          <div className="actions wrap">
            <label className="field grow-200">Nome
              <input value={openNome} onChange={e => setOpenNome(e.target.value)} />
            </label>
            <label className="field grow-160">Tipo
              <select value={openTipo} onChange={e => setOpenTipo(e.target.value)}>
                <option value="DAY_USE">DAY_USE</option>
                <option value="ALUNO">ALUNO</option>
              </select>
            </label>
            <label className="field grow-160">Day Use (R$)
              <input type="number" step="0.01" value={openValor} onChange={e => setOpenValor(e.target.value)} />
            </label>
            <button type="button" onClick={abrirNaLista}>Abrir na Lista</button>
          </div>
        </div>
        {msg && <div className="msg">{msg}</div>}
        {err && <div className="err">{err}</div>}
      </div>

      <div className="list-cards">
        {filtradas.map(c => (
          <div key={c.id} className="list-card" onClick={() => onSelecionar(c.id)} role="button" tabIndex={0}
               onKeyDown={(e) => { if (e.key === 'Enter') onSelecionar(c.id); }}>
            <div className="list-card-header">
              <span className="id">#{c.id}</span>
              <span className={`badge ${c.status === 'FECHADA' ? 'closed' : 'open'}`}>{c.status}</span>
            </div>
            <div className="list-card-body">
              <div className="title">{c.nomeCliente}</div>
              <div className="meta">Tipo: {c.tipoCliente} • Abertura: {fmtDate(c.dataAbertura)}</div>
              <div className="totals">Day Use: {fmtMoney(c.valorDayUse)} • Total: {fmtMoney(c.valorTotal)}</div>
            </div>
            <div className="list-card-actions">
              {c.status !== 'FECHADA' && (
                <button type="button" onClick={(e) => { e.stopPropagation(); fechar(c.id); }}>Fechar</button>
              )}
              <button type="button" onClick={(e) => { e.stopPropagation(); onSelecionar(c.id); }}>Abrir</button>
            </div>
          </div>
        ))}
        {filtradas.length === 0 && (
          <div className="empty">Nenhuma comanda encontrada.</div>
        )}
      </div>
    </div>
  );
}