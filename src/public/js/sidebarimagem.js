document.addEventListener('DOMContentLoaded', () => {
  const imgPerfil = document.getElementById('fotoPerfil');
  if (!imgPerfil) {
    console.warn('⚠️ Nenhum elemento com id="fotoPerfil" encontrado nesta página.');
    return;
  }

  const fotoSalva = localStorage.getItem('fotoUsuario');
  if (fotoSalva) {
    imgPerfil.src = fotoSalva;
    console.log('✅ Foto carregada do localStorage!');
  } else {
    imgPerfil.src = '../public/img/userteste.png';
    console.warn('⚠️ Nenhuma foto salva no localStorage.');
  }
});
