const mysql = require('mysql2');

const conexao = mysql.createConnection({
  host: '143.106.241.4',
  user: 'cl204214',
  password: 'cl*19072008',
  database: 'cl204214'
});
0
conexao.connect(err => console.log(err ? '❌ Erro ao conectar' : '✅ Conectado!'));

const form = document.getElementById('loginForm');
const mensagem = document.getElementById('mensagem');
const btnLogin = form.querySelector('button');

let tentativas = 0;
const maxTentativas = 5;

form.addEventListener('submit', e => {
  e.preventDefault();

  if (tentativas >= maxTentativas) {
    mensagem.innerText = 'Você excedeu o número máximo de tentativas!';
    mensagem.classList.add('text-danger');
    btnLogin.disabled = true;
    return;
  }

  const email = document.getElementById('email').value.trim().toLowerCase();
  const senha = document.getElementById('senha').value.trim();

  const query = 'SELECT * FROM PI_Adm WHERE email = ? LIMIT 1';
  conexao.query(query, [email], (err, results) => {
    if (err) return console.error(err);

    const tentativasRestantes = maxTentativas - tentativas - 1;

    if (results.length === 0) {
      tentativas++;
      mensagem.innerText = tentativasRestantes > 0
        ? `Usuário não encontrado. Você tem mais ${tentativasRestantes} tentativas.`
        : 'Você excedeu o número máximo de tentativas!';
      mensagem.classList.add('text-danger');
      if (tentativas >= maxTentativas) btnLogin.disabled = true;
      return;
    }

    const usuario = results[0];

    if (senha !== usuario.senha) {
      tentativas++;
      mensagem.innerText = tentativasRestantes > 0
        ? `Senha incorreta. Você tem mais ${tentativasRestantes} tentativas.`
        : 'Você excedeu o número máximo de tentativas!';
      mensagem.classList.add('text-danger');
      if (tentativas >= maxTentativas) btnLogin.disabled = true;
      return;
    }

    tentativas = 0;
    mensagem.innerText = `Bem-vindo, ${usuario.nome}!`;
    mensagem.classList.remove('text-danger');
    mensagem.classList.add('text-success');

    localStorage.setItem('emailLogado', usuario.email);
    localStorage.setItem('nomeUsuario', usuario.nome);

     if (usuario.foto) {
          const base64Foto = Buffer.from(usuario.foto).toString('base64');
          localStorage.setItem('fotoUsuario', `data:image/png;base64,${base64Foto}`);
        } else {
          localStorage.setItem('fotoUsuario', '../public/img/userteste.png');
        }

        const splash = document.getElementById('splashScreen');
        splash.style.display = 'flex';
        
   
        setTimeout(() => {
          window.location.href = 'paginainicialusuario.html';
        }, 2000);
  });
});
