document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroAdmForm');
  const mensagem = document.getElementById('mensagem');

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return 'Formato de e-mail inválido.';
    return null;
  }

  function lerArquivoBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensagem.innerText = '';

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const fotoInput = document.getElementById('foto');

    const erroEmail = validarEmail(email);
    if (erroEmail) {
      mensagem.style.color = 'red';
      mensagem.innerText = '' + erroEmail;
      return;
    }

    let foto = null;
    if (fotoInput && fotoInput.files && fotoInput.files[0]) {
      try {
        foto = await lerArquivoBase64(fotoInput.files[0]);
      } catch (e) {
        console.error('Erro ao ler foto:', e);
      }
    }

    try {
      const resposta = await fetch('http://localhost/api_sectio_aurea/index.php/api/adm/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, foto })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        mensagem.style.color = 'green';
        mensagem.innerText = '' + dados.message;
        form.reset();
      } else {
        mensagem.style.color = 'red';
        mensagem.innerText = '' + dados.message;
      }
    } catch (erro) {
      mensagem.style.color = 'red';
      mensagem.innerText = 'Erro ao conectar com o servidor.';
    }
  });
});
