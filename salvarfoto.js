const mysql = require('mysql2');
const fs = require('fs');

const conexao = mysql.createConnection({
  host: '143.106.241.4',
  user: 'cl204214',
  password: 'cl*19072008',
  database: 'cl204214'
});

conexao.connect((err) => {
  if (err) {
    console.error('Erro na conexão:', err);
  } else {
    console.log('Conectado ao MySQL!');
  }
});


const caminhoFoto = 'C:/Users/Lara/OneDrive/Documentos/Electron-Desktop/src/public/img/fotoLara.png';


const imagem = fs.readFileSync(caminhoFoto);


const idUsuario = 1;
const query = 'UPDATE usuario_login SET foto = ? WHERE id = ?';

conexao.query(query, [imagem, idUsuario], (err, result) => {
  if (err) {
    console.error('Erro ao salvar foto:', err);
  } else {
    console.log('Foto salva com sucesso!');
  }
  conexao.end();
});
