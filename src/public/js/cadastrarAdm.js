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
      console.error('❌ Erro ao conectar ao MySQL:', err);
    } else {
      console.log('✅ Conectado ao MySQL');
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const fotoInput = document.getElementById('foto');

    console.log("📩 Dados enviados:", { nome, email, senha });

    // QUERY base
    const query = 'INSERT INTO PI_Adm (nome, email, senha, foto) VALUES (?, ?, ?, ?)';

    // CASO SEM FOTO
    if (!fotoInput || fotoInput.files.length === 0) {
      conexao.query(query, [nome, email, senha, null], (err, result) => {

        console.log("ERR:", err);
        console.log("RESULT:", result);

        if (err) {
          mensagem.style.color = 'red';
          mensagem.innerText = '❌ Erro ao cadastrar: ' + err.message;
          return;
        }

        mensagem.style.color = 'green';
        mensagem.innerText = '✅ Administrador cadastrado com sucesso!';
        form.reset();
      });

      return;
    }

    // CASO COM FOTO
    const file = fotoInput.files[0];
    const reader = new FileReader();

    reader.onload = function () {
      try {
        // 🔥 FIX IMPORTANTE (Electron)
        const buffer = Buffer.from(new Uint8Array(this.result));

        conexao.query(query, [nome, email, senha, buffer], (err, result) => {

          console.log("ERR:", err);
          console.log("RESULT:", result);

          if (err) {
            mensagem.style.color = 'red';
            mensagem.innerText = '❌ Erro ao cadastrar: ' + err.message;
            return;
          }

          mensagem.style.color = 'green';
          mensagem.innerText = '✅ Administrador cadastrado com sucesso!';
          form.reset();
        });

      } catch (error) {
        console.error("Erro ao processar imagem:", error);
        mensagem.style.color = 'red';
        mensagem.innerText = '❌ Erro ao processar imagem';
      }
    };

    reader.onerror = function () {
      console.error('Erro ao ler arquivo da imagem');
      mensagem.style.color = 'red';
      mensagem.innerText = '❌ Erro ao ler a imagem';
    };

    reader.readAsArrayBuffer(file);
  });
});