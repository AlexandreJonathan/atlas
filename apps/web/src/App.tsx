import { useState } from "react";
import "./App.css";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
function App() {
  const [tela, setTela] = useState("dashboard");
  console.log(tela);
  return (
    <>
      {tela === "login" ? (
        <Login irParaCadastro={() => setTela("cadastro")} entrar={() => setTela("dashboard")} />
      ) : tela === "cadastro" ? (
        <Register voltarLogin={() => setTela("login")} />
      ) : (
        <Dashboard />
      )}
    </>
  );
}

export default App;