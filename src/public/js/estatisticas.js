let grafico = null;

async function carregarEstatisticas() {
  try {
    const resposta = await fetch('http://localhost/api_sectio_aurea-main/index.php/api/adm/estatisticas');
    const json = await resposta.json();

    if (!json.sucesso || json.dados.length === 0) {
      document.getElementById('semDados').style.display = 'block';
      return;
    }

    const labels = json.dados.map(r => r.tipo);
    const valores = json.dados.map(r => r.total);
    const cores = json.dados.map(r => r.cor);

    montarCards(json.dados);
    montarGrafico(labels, valores, cores);
    
  } catch (erro) {
    console.error('Erro ao carregar estatísticas:', erro);
  }
}

function montarCards(results) {
  const grid = document.getElementById('gridCards');
  const total = results.reduce((soma, r) => soma + r.total, 0);

  grid.innerHTML = '';

  // Card de total geral
  grid.innerHTML += `
    <div class="card-stat">
      <div class="icone" style="background:#1f2937;">
        <i class="bi bi-people-fill"></i>
      </div>
      <div class="info">
        <h4>${total}</h4>
        <p>Total de Usuários</p>
      </div>
    </div>
  `;

  // Um card por tipo de inteligência
  results.forEach(r => {
    grid.innerHTML += `
      <div class="card-stat">
        <div class="icone" style="background:${r.cor};">
          <i class="bi bi-bar-chart-fill"></i>
        </div>
        <div class="info">
          <h4>${r.total}</h4>
          <p>${r.tipo}</p>
        </div>
      </div>
    `;
  });
}

function montarGrafico(labels, valores, cores) {
  const ctx = document.getElementById('graficoInteligencia').getContext('2d');

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Usuários',
        data: valores,
        backgroundColor: cores,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 60
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1f2937',
          padding: 12,
          titleFont: { size: 13, weight: '600' },
          bodyFont: { size: 13 },
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y} usuário(s)`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: '#6b7280',
            font: { size: 12 }
          },
          grid: { color: '#f3f4f6' }
        },
        x: {
          ticks: {
            color: '#374151',
            font: { size: 12, weight: '600' }
          },
          grid: { display: false }
        }
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  carregarEstatisticas();
  
  // Foto da sidebar
  const fotoSalva = localStorage.getItem('fotoUsuario');
  const fotoElement = document.getElementById('fotoPerfil');
  if (fotoSalva && fotoElement) fotoElement.src = fotoSalva;
});