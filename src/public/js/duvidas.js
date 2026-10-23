const EMAIL_EMPRESA = 'sectioaureads@gmail.com'; 

const { shell } = require('electron');
const tabela = document.getElementById('tabelaDuvidas');
const inputPesquisa = document.getElementById('pesquisa');

async function carregarDuvidas() {
  try {
    const resposta = await fetch('http://localhost/api_sectio_aurea/index.php/api/adm/duvidas');
    const results = await resposta.json();

    tabela.innerHTML = `
      <tr><th>Nome</th><th>Tipo</th><th>Mensagem</th><th>Status</th><th>Data</th><th>Ações</th></tr>
    `;

    results.forEach(duvida => {
      const row = tabela.insertRow();
      const celulaNome = row.insertCell(0);
      celulaNome.innerHTML = `<span style="font-weight: 500;" title="E-mail: ${duvida.email}">${duvida.nome}</span>`;

      row.insertCell(1).innerText = duvida.tipo;

      const celulaMensagem = row.insertCell(2);
      const mensagemEscapada = duvida.mensagem.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      celulaMensagem.innerHTML = `<div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;" title="${mensagemEscapada}">${duvida.mensagem}</div>`;

      const celulaStatus = row.insertCell(3);
      const isRespondida = duvida.status === 'respondida';
      celulaStatus.innerHTML = isRespondida
        ? `<span class="badge bg-success">Respondida</span>`
        : `<span class="badge bg-warning text-dark">Pendente</span>`;

      row.insertCell(4).innerText = duvida.data_formatada;

      const celulaAcoes = row.insertCell(5);
      celulaAcoes.className = 'acoes';

      if (isRespondida) {
        // BOTÃO: VER NO GMAIL
        const btnVer = document.createElement('button');
        btnVer.className = 'btn-custom-outline me-1';
        btnVer.innerText = 'Ver no Gmail';
        btnVer.onclick = () => {
          const urlGmail = `https://mail.google.com/mail/?authuser=${EMAIL_EMPRESA}#sent`;
          shell.openExternal(urlGmail);
        };
        celulaAcoes.appendChild(btnVer);

        const btnReabrir = document.createElement('button');
        btnReabrir.className = 'btn-custom-outline me-1';
        btnReabrir.innerText = 'Reabrir';
        btnReabrir.onclick = () => reabrirDuvida(duvida.id_duvida);
        celulaAcoes.appendChild(btnReabrir);
      } else {
        // BOTÃO: RESPONDER (Abre o e-mail direto)
        const btnResponder = document.createElement('button');
        btnResponder.className = 'btn-custom-web me-1';
        btnResponder.innerText = 'Responder';
        
        btnResponder.onclick = () => {
          const assunto = 'Sectio Áurea - Resposta à sua mensagem';
          const corpoEmail = `Olá, ${duvida.nome}!\n\nEm resposta à sua dúvida/mensagem:\n"${duvida.mensagem}"`;
          
          // 1. Prepara a URL de composição do Gmail com os dados
          const composeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(duvida.email)}&su=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpoEmail)}`;
          
          // 2. Usa a API de redirecionamento de contas do Google para forçar a conta da empresa
          const urlSegura = `https://accounts.google.com/AccountChooser?continue=${encodeURIComponent(composeUrl)}&Email=${EMAIL_EMPRESA}`;
          
          shell.openExternal(urlSegura);
        };
        celulaAcoes.appendChild(btnResponder);

        // BOTÃO: CONFIRMAR ENVIO
        const btnConfirmar = document.createElement('button');
        btnConfirmar.className = 'btn-custom-outline me-1';
        btnConfirmar.innerText = 'Confirmar Envio';
        btnConfirmar.onclick = () => {
          if (confirm('Você já enviou o e-mail pelo Gmail? Isso vai marcar como respondida no sistema.')) {
            responderDuvida(duvida.id_duvida, 'Respondido via Gmail');
          }
        };
        celulaAcoes.appendChild(btnConfirmar);
      }

      // BOTÃO: EXCLUIR
      const btnExcluir = document.createElement('button');
      btnExcluir.className = 'btn-custom-danger';
      btnExcluir.innerText = 'Excluir';
      btnExcluir.onclick = () => {
        if (confirm(`Tem certeza que deseja excluir esta dúvida?`)) excluirDuvida(duvida.id_duvida);
      };
      celulaAcoes.appendChild(btnExcluir);
    });
  } catch (erro) { console.error(erro); }
}

// Função para confirmar envio (atualiza o banco)
async function responderDuvida(id, resposta) {
  try {
    const respostaAPI = await fetch(`http://localhost/api_sectio_aurea/index.php/api/adm/duvidas/responder/${id}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resposta: resposta })
    });
    
    if (respostaAPI.ok) {
      carregarDuvidas(); 
    }
  } catch (e) { console.error(e); }
}

async function reabrirDuvida(id) {
  await fetch(`http://localhost/api_sectio_aurea/index.php/api/adm/duvidas/reabrir/${id}`, { method: 'PUT' });
  carregarDuvidas();
}

async function excluirDuvida(id) {
  await fetch(`http://localhost/api_sectio_aurea/index.php/api/adm/duvidas/excluir/${id}`, { method: 'PUT' });
  carregarDuvidas();
}

if (inputPesquisa) {
  inputPesquisa.addEventListener('input', () => {
    const filtro = inputPesquisa.value.toLowerCase();
    const linhas = tabela.getElementsByTagName('tr');
    for (let i = 1; i < linhas.length; i++) {
      const colunas = linhas[i].getElementsByTagName('td');
      const texto = Array.from(colunas).map(td => td.innerText.toLowerCase()).join(' ');
      linhas[i].style.display = texto.includes(filtro) ? '' : 'none';
    }
  });
}

window.addEventListener('DOMContentLoaded', carregarDuvidas);