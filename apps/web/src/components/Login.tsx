type LoginProps = {
  irParaCadastro: () => void;
  entrar: () => void;
};


function Login({ irParaCadastro, entrar }: LoginProps) {
  return (
    <div className="login-container">
      <div className="login-card">

        <h1>🚀 Atlas</h1>

        <h2>Bem-vindo de volta</h2>

        <p>Entre para continuar sua jornada financeira.</p>

        <input
          type="email"
          placeholder="Seu e-mail"
        />

        <input
          type="password"
          placeholder="Sua senha"
        />

<button
  onClick={() => {
    console.log("CLIQUEI");
    entrar();
  }}
>
  Entrar
</button>

        <span>
  Ainda não possui conta?
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      irParaCadastro();
    }}
  >
    Criar conta
  </a>
</span>
      </div>
    </div>
  );
}

export default Login;