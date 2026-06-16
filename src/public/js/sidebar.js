
const { remote } = require('@electron/remote');

const btnCadastro = document.getElementById('btnCadastroAdm');

if (btnCadastro) {
  btnCadastro.addEventListener('click', () => {
    remote.require('../../main.js').createCadastroAdmWindow();
  });
}
