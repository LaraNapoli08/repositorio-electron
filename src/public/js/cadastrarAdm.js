document.addEventListener('DOMContentLoaded', () => {
  const mysql = require('mysql2');

  const form = document.getElementById('cadastroAdmForm');
  const mensagem = document.getElementById('mensagem');

  if (!form) {
    throw new Error("Formulário 'cadastroAdmForm' não encontrado!");
  }

  const conexao = mysql.createConnection({
    host: '143.106.241.4',
    user: 'cl204214',
    password: 'cl*19072008',
    database: 'cl204214'
  });

  conexao.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao MySQL:', err);
    } else {
      console.log('Conectado ao MySQL');
    }
  });

  // ===== TLDs válidos (os mais comuns) =====
  const tldsValidos = [
    'com', 'org', 'net', 'edu', 'gov', 'io', 'dev', 'app', 'co', 'me',
    'br', 'com.br', 'net.br', 'org.br', 'edu.br', 'gov.br',
    'pt', 'us', 'uk', 'ar', 'mx', 'es', 'fr', 'de', 'it', 'jp'
  ];

  // ===== Helpers =====
  function limparErros() {
    document.querySelectorAll('.campos').forEach(c => c.style.borderColor = '');
    mensagem.innerText = '';
  }

  function marcarErro(idCampo, texto) {
    const campo = document.getElementById(idCampo);
    if (campo) campo.style.borderColor = '#ef4444';
    mensagem.style.color = 'red';
    mensagem.innerText = '❌ ' + texto;
  }

  function validarEmail(email) {
    if (!email) return 'O e-mail é obrigatório.';

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return 'Formato de e-mail inválido.';

    const dominio = email.split('@')[1].toLowerCase();
    const partes = dominio.split('.');
    const tld = partes.slice(-2).join('.');
    const tldSimples = partes[partes.length - 1];

    if (!tldsValidos.includes(tld) && !tldsValidos.includes(tldSimples)) {
      return 'Domínio de e-mail inválido.';
    }

    return null;
  }

  // ===== Feedback visual ao sair do campo =====
  document.getElementById('email').addEventListener('blur', function () {
    const erro = validarEmail(this.value.trim());
    this.style.borderColor = erro ? '#ef4444' : '#22c55e';
  });

  // ===== Submit =====
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    limparErros();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const fotoInput = document.getElementById('foto');

    // ===== Validação de e-mail =====
    const erroEmail = validarEmail(email);
    if (erroEmail) return marcarErro('email', erroEmail);

    // ===== Checa e-mail duplicado =====
    conexao.query('SELECT id FROM PI_Adm WHERE email = ? LIMIT 1', [email], (err, results) => {
      if (err) {
        mensagem.style.color = 'red';
        mensagem.innerText = '❌ Erro ao verificar e-mail: ' + err.message;
        return;
      }

      if (results.length > 0) {
        return marcarErro('email', 'Este e-mail já está cadastrado.');
      }

      // ===== Segue o fluxo normal =====
      console.log("📩 Dados enviados:", { nome, email, senha });

      const query = 'INSERT INTO PI_Adm (nome, email, senha, foto) VALUES (?, ?, ?, ?)';

      // ===== Sem foto =====
      if (!fotoInput || fotoInput.files.length === 0) {
        conexao.query(query, [nome, email, senha, null], (err, result) => {
          if (err) {
            mensagem.style.color = 'red';
            mensagem.innerText = '❌ Erro ao cadastrar: ' + err.message;
            return;
          }
          mensagem.style.color = 'green';
          mensagem.innerText = '✅ Administrador cadastrado com sucesso!';
          form.reset();
          document.querySelectorAll('.campos').forEach(c => c.style.borderColor = '');
        });
        return;
      }

      // ===== Com foto =====
      const file = fotoInput.files[0];
      const reader = new FileReader();

      reader.onload = function () {
        try {
          const buffer = Buffer.from(new Uint8Array(this.result));
          conexao.query(query, [nome, email, senha, buffer], (err, result) => {
            if (err) {
              mensagem.style.color = 'red';
              mensagem.innerText = '❌ Erro ao cadastrar: ' + err.message;
              return;
            }
            mensagem.style.color = 'green';
            mensagem.innerText = '✅ Administrador cadastrado com sucesso!';
            form.reset();
            document.querySelectorAll('.campos').forEach(c => c.style.borderColor = '');
          });
        } catch (error) {
          console.error("Erro ao processar imagem:", error);
          mensagem.style.color = 'red';
          mensagem.innerText = '❌ Erro ao processar imagem';
        }
      };

      reader.onerror = function () {
        mensagem.style.color = 'red';
        mensagem.innerText = '❌ Erro ao ler a imagem';
      };

      reader.readAsArrayBuffer(file);
    });
  });
});