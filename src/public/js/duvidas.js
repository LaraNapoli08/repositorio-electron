const mysql = require('mysql2');
const { shell } = require('electron');

const conexao = mysql.createConnection({
  host: '143.106.241.4',
  user: 'cl204214',
  password: 'cl*19072008',
  database: 'cl204214'
});

conexao.connect(err => console.log(err ? '❌ Erro ao conectar!' : '✅ Conectado ao MySQL'));

const tabela = document.getElementById('tabelaDuvidas');
const inputPesquisa = document.getElementById('pesquisa');

function carregarDuvidas() {
  const query = "SELECT id_duvida, nome, email, tipo, mensagem, status, resposta, DATE_FORMAT(data_envio, '%d/%m/%Y %H:%i') as data_formatada FROM PI_Duvidas WHERE ativo = 1 ORDER BY data_envio DESC";
  
  conexao.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar dúvidas:', err);
      return;
    }

    tabela.innerHTML = `
      <tr>
        <th>Nome</th>
        <th>Tipo</th>
        <th>Mensagem</th>
        <th>Status</th>
        <th>Data</th>
        <th>Ações</th>
      </tr>
    `;

    results.forEach(duvida => {
      const row = tabela.insertRow();
      
      // Nome com e-mail no tooltip (sem pontilhado embaixo)
      const celulaNome = row.insertCell(0);
      celulaNome.innerHTML = `<span style="font-weight: 500;" title="E-mail: ${duvida.email}">${duvida.nome}</span>`;
      
      // Tipo (badge customizada dependendo do tipo)
      const celulaTipo = row.insertCell(1);
      celulaTipo.innerText = duvida.tipo;
      
      // Mensagem (com limite de largura e tooltip ao passar o mouse)
      const celulaMensagem = row.insertCell(2);
      const mensagemEscapada = duvida.mensagem.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      celulaMensagem.innerHTML = `<div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0 auto;" title="${mensagemEscapada}">${duvida.mensagem}</div>`;
      
      // Status (pendente ou respondida)
      const celulaStatus = row.insertCell(3);
      const isRespondida = duvida.status === 'respondida';
      celulaStatus.innerHTML = isRespondida 
        ? `<span class="badge bg-success">Respondida</span>` 
        : `<span class="badge bg-warning text-dark">Pendente</span>`;
      
      // Data
      row.insertCell(4).innerText = duvida.data_formatada;
      
      // Ações
      const celulaAcoes = row.insertCell(5);
      if (isRespondida) {
        // Mostra botão para ver no Gmail (Enviados)
        const btnVer = document.createElement('button');
        btnVer.className = 'btn-custom-outline me-1';
        btnVer.innerText = 'Ver no Gmail';
        btnVer.onclick = () => {
          shell.openExternal('https://mail.google.com/mail/u/0/#sent');
        };
        celulaAcoes.appendChild(btnVer);

        // Botão para reabrir a dúvida
        const btnReabrir = document.createElement('button');
        btnReabrir.className = 'btn-custom-outline me-1';
        btnReabrir.innerText = 'Reabrir';
        btnReabrir.onclick = () => {
          reabrirDuvida(duvida.id_duvida);
        };
        celulaAcoes.appendChild(btnReabrir);
      } else {
        // Botão para responder (apenas abre o Gmail)
        const btnResponder = document.createElement('button');
        btnResponder.className = 'btn-custom-web me-1';
        btnResponder.innerText = 'Responder';
        btnResponder.onclick = () => {
          const assunto = 'Sectio Áurea - Resposta à sua mensagem';
          const corpoEmail = `Olá, ${duvida.nome}!

Em resposta à sua dúvida/mensagem:
"${duvida.mensagem}"`;
          
          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(duvida.email)}&su=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpoEmail)}`;
          shell.openExternal(gmailUrl);
        };
        celulaAcoes.appendChild(btnResponder);

        // Botão para confirmar o envio no banco
        const btnConfirmar = document.createElement('button');
        btnConfirmar.className = 'btn-custom-outline me-1';
        btnConfirmar.innerText = 'Confirmar Envio';
        btnConfirmar.onclick = () => {
          responderDuvida(duvida.id_duvida, 'Respondido via Gmail');
        };
        celulaAcoes.appendChild(btnConfirmar);
      }
      
      // Botão para apagar/arquivar
      const btnExcluir = document.createElement('button');
      btnExcluir.className = 'btn-custom-danger';
      btnExcluir.innerText = 'Excluir';
      btnExcluir.onclick = () => {
        if (confirm(`Tem certeza que deseja excluir esta dúvida?`)) {
          excluirDuvida(duvida.id_duvida);
        }
      };
      celulaAcoes.appendChild(btnExcluir);
    });
  });
}

function responderDuvida(id, resposta) {
  const query = "UPDATE PI_Duvidas SET resposta = ?, status = 'respondida' WHERE id_duvida = ?";
  conexao.query(query, [resposta, id], (err, result) => {
    if (err) {
      console.error('Erro ao responder dúvida:', err);
      alert('Erro ao gravar a resposta no banco.');
      return;
    }
    carregarDuvidas();
  });
}

function reabrirDuvida(id) {
  const query = "UPDATE PI_Duvidas SET resposta = NULL, status = 'pendente' WHERE id_duvida = ?";
  conexao.query(query, [id], (err, result) => {
    if (err) {
      console.error('Erro ao reabrir dúvida:', err);
      alert('Erro ao atualizar no banco.');
      return;
    }
    carregarDuvidas();
  });
}

function excluirDuvida(id) {
  const query = "UPDATE PI_Duvidas SET ativo = 0 WHERE id_duvida = ?";
  conexao.query(query, [id], (err, result) => {
    if (err) {
      console.error('Erro ao excluir dúvida:', err);
      alert('Erro ao excluir do banco.');
      return;
    }
    carregarDuvidas();
  });
}

inputPesquisa.addEventListener('input', () => {
  const filtro = inputPesquisa.value.toLowerCase();
  const linhas = tabela.getElementsByTagName('tr');

  for (let i = 1; i < linhas.length; i++) {
    const colunas = linhas[i].getElementsByTagName('td');
    const texto = Array.from(colunas).map(td => td.innerText.toLowerCase()).join(' ');
    linhas[i].style.display = texto.includes(filtro) ? '' : 'none';
  }
});

window.addEventListener('DOMContentLoaded', carregarDuvidas);
const emailLogado = localStorage.getItem('emailLogado');

// Carregar foto de adm (adaptado de pag2.js)
function carregarFotoAdm(email) {
  if (!email) return;
  const query = 'SELECT foto FROM PI_Usuario WHERE email = ?';
  conexao.query(query, [email], (err, results) => {
    if (err || results.length === 0) return;
    const foto = results[0].foto;
    if (foto) {
      localStorage.setItem('fotoPerfil', foto);
      const fotoElement = document.getElementById('fotoPerfil');
      if (fotoElement) fotoElement.src = foto;
    }
  });
}
carregarFotoAdm(emailLogado);
