
const mysql = require('mysql2');


const conexao = mysql.createConnection({
  host: '143.106.241.4',
  user: 'cl204214',
  password: 'cl*19072008',
  database: 'cl204214'
});



conexao.connect(err => console.log(err ? '❌ Erro ao conectar!' : '✅ Conectado ao MySQL'));

const tabela = document.getElementById('tabelaUsuarios');
const inputPesquisa = document.getElementById('pesquisa');


function carregarUsuarios() {
  const query = 'SELECT id_usuario, nome, email, tipo_dom FROM PI_Usuario WHERE ativo = 1';
  
  conexao.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      return;
    }


    tabela.innerHTML = `
      <tr>
        <th>ID</th>
        <th>Nome</th>
        <th>Email</th>
        <th>Tipo</th>
      </tr>
    `;

  
    results.forEach(user => {
      const row = tabela.insertRow();
      row.insertCell(0).innerText = user.id_usuario;
      row.insertCell(1).innerText = user.nome;
      row.insertCell(2).innerText = user.email;
      row.insertCell(3).innerText = user.tipo_dom;
    });
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


window.addEventListener('DOMContentLoaded', carregarUsuarios);
const emailLogado = localStorage.getItem('emailLogado');
carregarFotoAdm(emailLogado);
