import React from 'react';

export default function ProductList({ produtos }) {
  return (
    <div className="card">
      <h2>Produtos</h2>
      <div className="table-responsive">
        <table>
        <thead>
          <tr>
            <th>ID</th><th>Nome</th><th>Preço</th><th>Estoque</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nome}</td>
              <td>{String(p.preco)}</td>
              <td>{p.estoque}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="products-cards">
        {produtos.map(p => (
          <div key={p.id} className="list-card">
            <div className="list-card-header">
              <span className="id">#{p.id}</span>
            </div>
            <div className="list-card-body">
              <div className="title">{p.nome}</div>
              <div className="totals">Preço: {String(p.preco)} • Estoque: {p.estoque}</div>
            </div>
          </div>
        ))}
      </div>

      {produtos.length === 0 && <div>Nenhum produto cadastrado.</div>}
    </div>
  );
}