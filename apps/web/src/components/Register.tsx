type RegisterProps = {
    voltarLogin: () => void;
  };
  function Register({ voltarLogin }: RegisterProps) {
    return (
      <div className="login-container">
        <div className="login-card">
  
          <h1>🚀 Atlas</h1>
  
          <h2>Criar conta</h2>
  
          <p>Comece hoje sua organização financeira.</p>
  
          <input
            type="text"
            placeholder="Seu nome"
          />
  
          <input
            type="email"
            placeholder="Seu e-mail"
          />
  
          <input
            type="password"
            placeholder="Crie uma senha"
          />
  
          <button>Criar conta</button>
  
          <span>
            Já possui conta?
            <a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    voltarLogin();
  }}
>
  Entrar
</a>
          </span>
  
        </div>
      </div>
    );
  }
  
  export default Register;