const mysql = require('mysql2');

const conexao = mysql.createConnection({
  host: '143.106.241.4',
  user: 'cl204214',
  password: 'cl*19072008',
  database: 'cl204214'
});

conexao.connect(err => console.log(err ? '❌ Erro ao conectar!' : '✅ Conectado ao MySQL'));

let grafico = null;

function carregarEstatisticas() {
    const query = `
    SELECT 
  CASE 
    WHEN i.nome IN ('Corporal', 'Cinestésica') THEN 'Corporal-Cinestésica'
    ELSE i.nome 
  END AS tipo,
  
  CASE 
    WHEN i.nome IN ('Corporal', 'Cinestésica') THEN '#00bf63'
    ELSE i.cor 
  END AS cor,
  
  COUNT(u.id_usuario) AS total
FROM PI_Inteligencias i
LEFT JOIN PI_Usuario u 
  ON u.tipo_dom = i.nome 
  AND u.ativo = 1
GROUP BY 
  CASE 
    WHEN i.nome IN ('Corporal', 'Cinestésica') THEN 'Corporal-Cinestésica'
    ELSE i.nome 
  END,
  CASE 
    WHEN i.nome IN ('Corporal', 'Cinestésica') THEN '#00bf63'
    ELSE i.cor 
  END
HAVING total > 0
ORDER BY total DESC;
  `;
  conexao.query(query, (err, results) => {
    if (err) {
      console.error('❌ Erro ao buscar estatísticas:', err);
      return;
    }

    if (results.length === 0) {
      document.getElementById('semDados').style.display = 'block';
      return;
    }

    const labels = results.map(r => r.tipo);
    const valores = results.map(r => r.total);
    const cores = results.map(r => r.cor);

    montarCards(results);
    montarGrafico(labels, valores, cores);
  });
}

function montarCards(results) {
  const grid = document.getElementById('gridCards');
  const total = results.reduce((soma, r) => soma + r.total, 0);

  grid.innerHTML = '';

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

  // Um card por tipo
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

  const fotoSalva = localStorage.getItem('fotoPerfil');
  const fotoElement = document.getElementById('fotoPerfil');
  if (fotoSalva && fotoElement) {
    fotoElement.src = fotoSalva;
  }
});