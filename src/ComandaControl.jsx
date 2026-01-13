import React, { useState } from 'react';

export default function ComandaControl({ onAbrirComanda, onSelecionar, comandaId, onFecharComanda, onBuscarLista, onListarAbertas, onVincularMapping }) {
  const [nomeCliente, setNomeCliente] = useState('');
  const [tipoCliente, setTipoCliente] = useState('DAY_USE');
  const [valorDayUse, setValorDayUse] = useState('');
  const [buscarNome, setBuscarNome] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [resultados, setResultados] = useState([]);
  const [selecionadoId, setSelecionadoId] = useState(null);

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
    return String(dt);
  }

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

  async function buscarPorNome(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!buscarNome.trim()) { setErr('Informe o nome do cliente'); return; }
    try {
      const lista = await onBuscarLista(buscarNome.trim());
      setResultados(lista);
      if (lista.length === 1) {
        onSelecionar(lista[0].id);
        setMsg(`Comanda selecionada: ${lista[0].nomeCliente} (#${lista[0].id})`);
      } else if (lista.length === 0) {
        setErr('Nenhuma comanda encontrada para este nome');
      } else {
        setMsg(`${lista.length} comandas encontradas. Selecione abaixo.`);
      }
    } catch (error) {
      setErr(error.message || 'Falha ao buscar comanda por nome');
    }
  }

  function confirmarSelecao() {
    setMsg(''); setErr('');
    if (!selecionadoId) { setErr('Selecione uma comanda na lista'); return; }
    const c = resultados.find(r => r.id === Number(selecionadoId));
    if (!c) { setErr('Seleção inválida'); return; }
    onSelecionar(c.id);
    setMsg(`Comanda selecionada: ${c.nomeCliente} (#${c.id})`);
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

        <form onSubmit={buscarPorNome}>
          <label>Buscar por Nome do Cliente
            <input value={buscarNome} onChange={e => setBuscarNome(e.target.value)} />
          </label>
          <button type="submit">Buscar</button>
        </form>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={async () => {
            setMsg(''); setErr('');
            try {
              const lista = await onListarAbertas();
              setResultados(lista);
              setMsg(`${lista.length} comandas abertas encontradas. Selecione abaixo.`);
            } catch (error) {
              setErr(error.message || 'Falha ao listar comandas abertas');
            }
          }}>Listar Comandas Abertas</button>
        </div>

        {resultados.length > 1 && (
          <div style={{ display: 'grid', gap: 8 }}>
            <label>Resultados
              <select value={selecionadoId ?? ''} onChange={e => setSelecionadoId(e.target.value)}>
                <option value="">Selecione...</option>
                {resultados.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.nomeCliente} (#{r.id}) • {(r.status || '-')}
                    {r.dataAbertura ? ` • ${fmtDate(r.dataAbertura)}` : ''}
                    {` • ${fmtMoney(r.valorTotal)}`}
                  </option>
                ))}
              </select>
            </label>
            {selecionadoId && (() => {
              const sel = resultados.find(x => String(x.id) === String(selecionadoId));
              if (!sel) return null;
              return (
                <div style={{ display: 'grid', gap: 4, fontSize: '0.95rem', color: 'var(--muted)' }}>
                  <div>Cliente: {sel.nomeCliente}</div>
                  <div>Status: {sel.status || '-'}</div>
                  <div>Abertura: {sel.dataAbertura ? fmtDate(sel.dataAbertura) : '-'}</div>
                  <div>Total: {fmtMoney(sel.valorTotal)}</div>
                </div>
              );
            })()}
            <button type="button" onClick={confirmarSelecao}>Usar Comanda Selecionada</button>
          </div>
        )}

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