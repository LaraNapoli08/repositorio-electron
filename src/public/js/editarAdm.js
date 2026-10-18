const form = document.getElementById('formAtualizarAdm');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const mensagem = document.getElementById('mensagem');
const fotoPreview = document.getElementById('fotoPreview');

let emailLogado = localStorage.getItem('emailLogado');

function mostrarMensagem(texto, tipo="success") {
  mensagem.innerHTML = `<div class="alert alert-${tipo}" role="alert">${texto}</div>`;
}

async function carregarAdm() {
  if (!emailLogado) return;

  try {
    const resposta = await fetch('http://localhost/api_sectio_aurea-main/index.php/api/adm/buscar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailLogado })
    });
    
    if (!resposta.ok) return;
    const adm = await resposta.json();

    nomeInput.value = adm.nome;
    emailInput.value = adm.email;
    senhaInput.value = adm.senha;

    if (fotoPreview) {
      fotoPreview.src = adm.foto ? `data:image/png;base64,${adm.foto}` : '../public/img/userteste.png';
    }
  } catch (erro) { console.error(erro); }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  if (!nome || !email || !senha) {
    mostrarMensagem("Preencha todos os campos!", "warning");
    return;
  }

  try {
    const resposta = await fetch('http://localhost/api_sectio_aurea-main/index.php/api/adm/editar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_antigo: emailLogado, nome, email, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      emailLogado = email;
      localStorage.setItem('emailLogado', email);
      localStorage.setItem('nomeUsuario', nome);
      mostrarMensagem(dados.message, "success");
    } else {
      mostrarMensagem(dados.message, "danger");
    }
  } catch (erro) {
    mostrarMensagem("Erro ao conectar com o servidor.", "danger");
  }
});

window.addEventListener("DOMContentLoaded", carregarAdm);