const mysql = require('mysql2');

const form = document.getElementById('formAtualizarAdm');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const fotoInput = document.getElementById('foto');
const mensagem = document.getElementById('mensagem');
const fotoPreview = document.getElementById('fotoPreview');
const fotoSidebar = document.getElementById('fotoPerfil');

let emailLogado = localStorage.getItem('emailLogado');

const conexao = mysql.createConnection({
  host: '143.106.241.4',
  user: 'cl204214',
  password: 'cl*19072008',
  database: 'cl204214'
});

conexao.connect(err => {
  console.log(err ? '❌ Erro ao conectar ao MySQL' : '✅ Conectado ao MySQL');
});

function mostrarMensagem(texto, tipo="success") {
  mensagem.innerHTML = `<div class="alert alert-${tipo}" role="alert">${texto}</div>`;
}

function atualizarFotoPreview(src) {
  if (fotoPreview) fotoPreview.src = src;
}


function atualizarFotoSidebar(src) {
  if (fotoSidebar) fotoSidebar.src = src;
  localStorage.setItem('fotoUsuario', src);
}


function carregarAdm() {
  if (!emailLogado) return console.warn("Nenhum email logado encontrado.");

  const query = "SELECT nome, email, senha, foto FROM PI_Adm WHERE email = ?";
  conexao.query(query, [emailLogado], (err, results) => {
    if (err) return console.error("Erro ao carregar ADM:", err);
    if (results.length === 0) return;

    const adm = results[0];
    nomeInput.value = adm.nome;
    emailInput.value = adm.email;
    senhaInput.value = adm.senha;

    let fotoSrc = '../public/img/userteste.png';
    if (adm.foto) {
      fotoSrc = `data:image/png;base64,${adm.foto.toString('base64')}`;
    }

    atualizarFotoPreview(fotoSrc);

  });
}

fotoInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => atualizarFotoPreview(reader.result);
  reader.readAsDataURL(file);
});


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();
  const file = fotoInput.files[0];

  if (!nome || !email || !senha) {
    mostrarMensagem("Preencha todos os campos!", "warning");
    return;
  }

  if (!file) {

    const query = "UPDATE PI_Adm SET nome=?, email=?, senha=? WHERE email=?";
    conexao.query(query, [nome, email, senha, emailLogado], (err) => {
      if (err) return mostrarMensagem("Erro ao atualizar!", "danger");

  
      emailLogado = email;
      localStorage.setItem('emailLogado', email);
      localStorage.setItem('nomeUsuario', nome);


      mostrarMensagem("Perfil atualizado com sucesso!", "success");
    });
  } else {
  
    const reader = new FileReader();
    reader.onload = function() {
      const base64Foto = reader.result;
      const fotoBuffer = Buffer.from(base64Foto.split(",")[1], "base64");

      const query = "UPDATE PI_Adm SET nome=?, email=?, senha=?, foto=? WHERE email=?";
      conexao.query(query, [nome, email, senha, fotoBuffer, emailLogado], (err) => {
        if (err) return mostrarMensagem("Erro ao atualizar!", "danger");


        emailLogado = email;
        localStorage.setItem('emailLogado', email);
        localStorage.setItem('nomeUsuario', nome);
        atualizarFotoSidebar(base64Foto);

        mostrarMensagem("Perfil atualizado com sucesso!", "success");
      });
    };
    reader.readAsDataURL(file);
  }
});

window.addEventListener("DOMContentLoaded", carregarAdm);
