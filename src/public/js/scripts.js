const form = document.getElementById('loginForm');
const mensagem = document.getElementById('mensagem');
const btnLogin = form.querySelector('button');

let tentativas = 0;
const maxTentativas = 5;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (tentativas >= maxTentativas) {
    mensagem.innerText = 'Você excedeu o número máximo de tentativas!';
    mensagem.classList.add('text-danger');
    btnLogin.disabled = true;
    return;
  }

  const email = document.getElementById('email').value.trim().toLowerCase();
  const senha = document.getElementById('senha').value.trim();

  try {
    const resposta = await fetch('http://localhost/api_sectio_aurea/index.php/api/adm/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok && dados.sucesso) {
      tentativas = 0;
      mensagem.innerText = `Bem-vindo, ${dados.usuario.nome}!`;
      mensagem.classList.remove('text-danger');
      mensagem.classList.add('text-success');

      localStorage.setItem('emailLogado', dados.usuario.email);
      localStorage.setItem('nomeUsuario', dados.usuario.nome);
      
      if (dados.usuario.foto) {
        localStorage.setItem('fotoUsuario', `data:image/png;base64,${dados.usuario.foto}`);
      } else {
        localStorage.setItem('fotoUsuario', '../public/img/userteste.png');
      }

      const splash = document.getElementById('splashScreen');
      if (splash) splash.style.display = 'flex';
      
      setTimeout(() => {
        window.location.href = 'paginainicialusuario.html';
      }, 2000);
      
    } else {
      tentativas++;
      const restantes = maxTentativas - tentativas;
      mensagem.innerText = restantes > 0 
        ? `${dados.message}. Você tem mais ${restantes} tentativas.`
        : 'Você excedeu o número máximo de tentativas!';
      mensagem.classList.add('text-danger');
      if (tentativas >= maxTentativas) btnLogin.disabled = true;
    }
  } catch (erro) {
    console.error(erro);
    mensagem.innerText = 'Erro ao conectar com o servidor.';
    mensagem.classList.add('text-danger');
  }
});