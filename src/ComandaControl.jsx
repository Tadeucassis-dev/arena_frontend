import React, { useState } from 'react';

export default function ComandaControl({ onAbrirComanda, onSelecionar, comandaId, onFecharComanda }) {
  const [nomeCliente, setNomeCliente] = useState('');
  const [tipoCliente, setTipoCliente] = useState('DAY_USE');
  const [valorDayUse, setValorDayUse] = useState('');
  const [manualId, setManualId] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function abrir(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const payload = {
        nomeCliente: nomeCliente.trim(),
        tipoCliente,
        valorDayUse: valorDayUse === '' ? null : Number(valorDayUse)
      };
      const opened = await onAbrirComanda(payload);
      setMsg(`Comanda aberta: ${opened.id}`);
      onSelecionar(opened.id);
      setNomeCliente(''); setValorDayUse('');
    } catch (error) {
      setErr(error.message || 'Falha ao abrir comanda');
    }
  }

  function selecionarManual(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!manualId) { setErr('Informe um ID de comanda'); return; }
    onSelecionar(Number(manualId));
    setMsg(`Comanda selecionada: ${manualId}`);
  }

  async function fecharAtual() {
    setMsg(''); setErr('');
    try {
      if (!comandaId) { setErr('Nenhuma comanda selecionada'); return; }
      const c = await onFecharComanda(comandaId);
      setMsg(`Comanda fechada: ${c.id}`);
    } catch (error) {
      setErr(error.message || 'Falha ao fechar comanda');
    }
  }

  return (
    <div className="card">
      <h2>Comanda</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <form onSubmit={abrir}>
          <label>Nome do Cliente
            <input value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} />
          </label>
          <label>Tipo do Cliente
            <select value={tipoCliente} onChange={e => setTipoCliente(e.target.value)}>
              <option value="DAY_USE">DAY_USE</option>
              <option value="ALUNO">ALUNO</option>
            </select>
          </label>
          <label>Valor Day Use (R$)
            <input type="number" step="0.01" value={valorDayUse} onChange={e => setValorDayUse(e.target.value)} />
          </label>
          <button type="submit">Abrir Comanda</button>
        </form>

        <form onSubmit={selecionarManual}>
          <label>Selecionar por ID
            <input type="number" value={manualId} onChange={e => setManualId(e.target.value)} />
          </label>
          <button type="submit">Selecionar</button>
        </form>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>Atual: {comandaId ?? '-'}</span>
          <button type="button" onClick={fecharAtual}>Fechar Comanda</button>
        </div>

        {msg && <div className="msg">{msg}</div>}
        {err && <div className="err">{err}</div>}
      </div>
    </div>
  );
}