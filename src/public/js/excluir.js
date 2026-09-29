const mysql = require('mysql2');

const conexao = mysql.createConnection({
  host: '143.106.241.4',
  user: 'cl204214',
  password: 'cl*19072008',
  database: 'cl204214'
});

conexao.connect(err => {
  if (err) console.error('❌ Erro ao conectar ao MySQL:', err);
  else console.log('✅ Conectado ao MySQL');
});

const tabela = document.getElementById('tabelaUsuarios');
const inputPesquisa = document.getElementById('pesquisa');

if (!tabela) {
  console.error('❌ tabelaUsuarios não encontrada no HTML!');
}

function criarModalFofinho() {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = ' #ffffff';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '9999';

  const card = document.createElement('div');
  card.style.width = '360px';
  card.style.maxWidth = '90%';
  card.style.background = '#fff';
  card.style.borderRadius = '14px';
  card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
  card.style.overflow = 'hidden';
  card.style.fontFamily = "Madimi One, sans-serif";

  const header = document.createElement('div');
  header.style.background = ' #6c757d';
  header.style.color = '#fff';
  header.style.padding = '12px 16px';

  const body = document.createElement('div');
  body.style.padding = '18px';
  body.style.textAlign = 'center';
  body.style.color = ' #6c757d';
  body.style.fontSize = '16px';

  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.justifyContent = 'center';
  footer.style.gap = '12px';
  footer.style.padding = '14px 18px 20px';

  const btnCancelar = document.createElement('button');
  btnCancelar.textContent = 'Cancelar';
  btnCancelar.style.background = 'rgb(231, 131, 156)';
  btnCancelar.style.color = '#ffffff';
  btnCancelar.style.border = 'none';
  btnCancelar.style.padding = '8px 16px';
  btnCancelar.style.borderRadius = '8px';
  btnCancelar.style.cursor = 'pointer';

  const btnConfirmar = document.createElement('button');
  btnConfirmar.textContent = 'Confirmar';
  btnConfirmar.style.background = 'rgb(167, 228, 149)';
  btnConfirmar.style.color = '#000000';
  btnConfirmar.style.border = 'none';
  btnConfirmar.style.padding = '8px 16px';
  btnConfirmar.style.borderRadius = '8px';
  btnConfirmar.style.cursor = 'pointer';

  footer.appendChild(btnCancelar);
  footer.appendChild(btnConfirmar);

  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);
  overlay.appendChild(card);

  function mostrar(titulo, texto) {
    return new Promise(resolve => {
      header.innerHTML = `<strong>${titulo}</strong>`;
      body.innerHTML = texto;
      document.body.appendChild(overlay);

      overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) {
          overlay.remove();
          resolve(false);
        }
      });

      btnCancelar.onclick = () => {
        overlay.remove();
        resolve(false);
      };

      btnConfirmar.onclick = () => {
        overlay.remove();
        resolve(true);
      };
    });
  }

  return { mostrar };
}

const modalFofinho = criarModalFofinho();

function carregarUsuarios() {
  console.log('🔁 Carregando usuários...');
  const query = 'SELECT id_usuario, nome, email, tipo_dom, ativo FROM PI_Usuario';
  conexao.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      tabela.innerHTML = `<tr><td colspan="5">Erro ao carregar usuários.</td></tr>`;
      return;
    }

    tabela.innerHTML = `
      <tr>
        <th>ID</th>
        <th>Nome</th>
        <th>Email</th>
        <th>Tipo</th>
        <th>Status</th>
      </tr>
    `;

    results.forEach(user => {
      const row = tabela.insertRow();
      row.insertCell(0).innerText = user.id_usuario;
      row.insertCell(1).innerText = user.nome;
      row.insertCell(2).innerText = user.email;
      row.insertCell(3).innerText = user.tipo_dom;

      const statusCell = row.insertCell(4);
      statusCell.innerText = user.ativo ? 'Ativo' : 'Inativo';
      statusCell.style.color = user.ativo ? 'green' : 'red';
      statusCell.style.fontWeight = 'bold';

      if (!user.ativo) row.style.opacity = '0.65';

      row.style.cursor = 'pointer';

      row.addEventListener('mouseenter', () => row.style.backgroundColor = '#ffffffdc');
      row.addEventListener('mouseleave', () => row.style.backgroundColor = '');

      row.addEventListener('click', async () => {
        const acao = user.ativo ? 'desativar' : 'reativar';
        const titulo = user.ativo ? 'Confirmar desativação' : 'Confirmar reativação';
        const novoStatus = user.ativo ? 0 : 1;

        const texto = `Deseja realmente <b>${acao}</b> <b style="color:#8f8f8fdc;">${user.nome}</b>?<br><small style="color:#000000dc;">${user.email}</small>`;
        const confirmado = await modalFofinho.mostrar(titulo, texto);
        if (!confirmado) return;

        const updateQuery = 'UPDATE PI_Usuario SET ativo = ? WHERE id_usuario = ?';
        conexao.query(updateQuery, [novoStatus, user.id_usuario], (err2) => {
          if (err2) {
            console.error(`Erro ao ${acao}:`, err2);

            const errBox = document.createElement('div');
            errBox.textContent = `Erro ao ${acao} usuário.`;
            errBox.style.position = 'fixed';
            errBox.style.bottom = '20px';
            errBox.style.right = '20px';
            errBox.style.background = 'rgb(255, 255, 255)';
            errBox.style.color = '#000000';
            errBox.style.padding = '10px 14px';
            errBox.style.borderRadius = '8px';
            document.body.appendChild(errBox);
            setTimeout(() => errBox.remove(), 2500);
            return;
          }

          const okBox = document.createElement('div');
          okBox.textContent = ` ${user.nome} ${user.ativo ? 'desativado(a)' : 'reativado(a)'} com sucesso!`;
          okBox.style.position = 'fixed';
          okBox.style.bottom = '20px';
          okBox.style.right = '20px';
          okBox.style.background = 'rgb(255, 255, 255)';
          okBox.style.color = 'rgb(0, 0, 0)';
          okBox.style.padding = '12px 16px';
          okBox.style.borderRadius = '10px';
          okBox.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
          document.body.appendChild(okBox);
          setTimeout(() => {
            okBox.style.opacity = '0';
            setTimeout(() => okBox.remove(), 400);
          }, 1600);

          carregarUsuarios();
        });
      });
    });

    if (results.length === 0) {
      const r = tabela.insertRow();
      const c = r.insertCell(0);
      c.colSpan = 5;
      c.innerText = 'Nenhum usuário encontrado.';
      c.style.padding = '18px';
    }
  });
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
} else {
  console.warn('⚠️ inputPesquisa (id="pesquisa") não encontrado');
}

window.addEventListener('DOMContentLoaded', () => {
  carregarUsuarios();
});