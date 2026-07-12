import { useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [movimentacoes, setMovimentacoes] = useState<
  { descricao: string; valor: number; tipo: string }[]
>([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [valorReceita, setValorReceita] = useState("");
    const [descricaoReceita, setDescricaoReceita] = useState("");
    const [receitas, setReceitas] = useState(0);
    const [despesas, setDespesas] = useState(0);
    const saldo = receitas - despesas;
    function salvarReceita() {
      setReceitas(receitas + Number(valorReceita));
    
      setMovimentacoes([
        ...movimentacoes,
        {
          descricao: descricaoReceita,
          valor: Number(valorReceita),
          tipo: "receita",
        },
      ]);
    
      setValorReceita("");
      setDescricaoReceita("");
      setMostrarModal(false);
    }
    
    return (
      <div className="dashboard">
        <header className="dashboard-header">
        <h1>👋 Olá!</h1>
          <p>Bem-vindo à Atlas.</p>
        </header>
  
        <div className="cards">
          <div className="card">
            <h3>Saldo Atual</h3>
            <h2>R$ {saldo.toFixed(2)}</h2>
          </div>
  
          <div className="card">
          <h3>Receitas</h3>
          <h2>R$ {receitas.toFixed(2)}</h2>
          </div>
  
          <div className="card">
            <h3>Despesas</h3>
            <h2>R$ {despesas.toFixed(2)}</h2>
          </div>
        </div>
  
        <div className="acoes">
  <button onClick={() => setMostrarModal(true)}>
    + Nova Receita
  </button>

  <button onClick={() => alert("Nova Despesa")}>
    + Nova Despesa
  </button></div>
  <div className="lista-movimentacoes">
  <h2>📋 Movimentações</h2>

  {movimentacoes.map((item, index) => (
    <div className="movimentacao" key={index}>
      <span>💰 {item.descricao}</span>
      <strong>R$ {item.valor.toFixed(2)}</strong>
    </div>
  ))}
</div>

{mostrarModal && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Nova Receita</h2>

      <input
  type="number"
  placeholder="Valor"
  value={valorReceita}
  onChange={(e) => setValorReceita(e.target.value)}
/>

<input
  type="text"
  placeholder="Descrição"
  value={descricaoReceita}
  onChange={(e) => setDescricaoReceita(e.target.value)}
/>

      <div className="modal-buttons">
        <button onClick={() => setMostrarModal(false)}>
          Cancelar
        </button>

        <button onClick={salvarReceita}>
  Salvar
</button>


      </div>
    </div>
  </div>
)}

</div>
);
}

export default Dashboard;