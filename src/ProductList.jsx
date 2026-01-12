import React from 'react';

export default function ProductList({ produtos }) {
  return (
    <div className="card">
      <h2>Produtos</h2>
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
      {produtos.length === 0 && <div>Nenhum produto cadastrado.</div>}
    </div>
  );
}