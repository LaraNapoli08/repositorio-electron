const tabela = document.getElementById('tabelaUsuarios');
const inputPesquisa = document.getElementById('pesquisa');

// Função do Modal (Mantida do seu código original)
function criarModalFofinho() {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.background = '#ffffff';
  overlay.style.display = 'flex'; overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center'; overlay.style.zIndex = '9999';

  const card = document.createElement('div');
  card.style.width = '360px'; card.style.maxWidth = '90%'; card.style.background = '#fff';
  card.style.borderRadius = '14px'; card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
  card.style.overflow = 'hidden'; card.style.fontFamily = "Madimi One, sans-serif";

  const header = document.createElement('div');
  header.style.background = '#6c757d'; header.style.color = '#fff'; header.style.padding = '12px 16px';

  const body = document.createElement('div');
  body.style.padding = '18px'; body.style.textAlign = 'center'; body.style.color = '#6c757d'; body.style.fontSize = '16px';

  const footer = document.createElement('div');
  footer.style.display = 'flex'; footer.style.justifyContent = 'center'; footer.style.gap = '12px'; footer.style.padding = '14px 18px 20px';

  const btnCancelar = document.createElement('button');
  btnCancelar.textContent = 'Cancelar'; btnCancelar.style.background = 'rgb(231, 131, 156)';
  btnCancelar.style.color = '#ffffff'; btnCancelar.style.border = 'none'; btnCancelar.style.padding = '8px 16px';
  btnCancelar.style.borderRadius = '8px'; btnCancelar.style.cursor = 'pointer';

  const btnConfirmar = document.createElement('button');
  btnConfirmar.textContent = 'Confirmar'; btnConfirmar.style.background = 'rgb(167, 228, 149)';
  btnConfirmar.style.color = '#000000'; btnConfirmar.style.border = 'none'; btnConfirmar.style.padding = '8px 16px';
  btnConfirmar.style.borderRadius = '8px'; btnConfirmar.style.cursor = 'pointer';

  footer.appendChild(btnCancelar); footer.appendChild(btnConfirmar);
  card.appendChild(header); card.appendChild(body); card.appendChild(footer); overlay.appendChild(card);

  function mostrar(titulo, texto) {
    return new Promise(resolve => {
      header.innerHTML = `<strong>${titulo}</strong>`; body.innerHTML = texto;
      document.body.appendChild(overlay);

      overlay.addEventListener('click', (ev) => { if (ev.target === overlay) { overlay.remove(); resolve(false); } });
      btnCancelar.onclick = () => { overlay.remove(); resolve(false); };
      btnConfirmar.onclick = () => { overlay.remove(); resolve(true); };
    });
  }
  return { mostrar };
}
const modalFofinho = criarModalFofinho();

async function carregarUsuarios() {
  try {
    const resposta = await fetch('http://localhost/api_sectio_aurea-main/index.php/api/adm/usuarios');
    const results = await resposta.json();

    tabela.innerHTML = `
      <tr><th>ID</th><th>Nome</th><th>Email</th><th>Tipo</th><th>Status</th></tr>
    `;

    results.forEach(user => {
      const row = tabela.insertRow();
      row.insertCell(0).innerText = user.id_usuario;
      row.insertCell(1).innerText = user.nome;
      row.insertCell(2).innerText = user.email;
      row.insertCell(3).innerText = user.tipo_dom;

      const statusCell = row.insertCell(4);
      statusCell.innerText = user.ativo == 1 ? 'Ativo' : 'Inativo';
      statusCell.style.color = user.ativo == 1 ? 'green' : 'red';
      statusCell.style.fontWeight = 'bold';

      if (user.ativo == 0) row.style.opacity = '0.65';
      row.style.cursor = 'pointer';

      row.addEventListener('mouseenter', () => row.style.backgroundColor = '#ffffffdc');
      row.addEventListener('mouseleave', () => row.style.backgroundColor = '');

      row.addEventListener('click', async () => {
        const acao = user.ativo == 1 ? 'desativar' : 'reativar';
        const titulo = user.ativo == 1 ? 'Confirmar desativação' : 'Confirmar reativação';
        
        const texto = `Deseja realmente <b>${acao}</b> <b style="color:#8f8f8fdc;">${user.nome}</b>?<br><small style="color:#000000dc;">${user.email}</small>`;
        const confirmado = await modalFofinho.mostrar(titulo, texto);
        if (!confirmado) return;

        try {
          await fetch(`http://localhost/api_sectio_aurea-main/index.php/api/adm/status/${user.id_usuario}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ativo: user.ativo == 1 ? 0 : 1 })
          });
          carregarUsuarios(); // Recarrega a tabela
        } catch (e) { alert('Erro ao atualizar.'); }
      });
    });
  } catch (erro) {
    tabela.innerHTML = `<tr><td colspan="5">Erro ao carregar usuários.</td></tr>`;
  }
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

window.addEventListener('DOMContentLoaded', carregarUsuarios);