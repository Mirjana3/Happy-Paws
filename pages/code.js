// ==========================
// PROMJENA SAMO OVDJE
// ==========================
const USE_DEMO_DATA = true; // true = JSON, false = Azure endpoint
const endpoint = "https://YOUR_AZURE_ENDPOINT_HERE";

// ==========================
// DEMO JSON PODACI
// ==========================
const demoData = {
  total: 2000,
  adopted: 1500,
  notAdopted: 500,
  featureImpact: {
    PetType: { Dog: 0.8, Cat: 0.6, Rabbit: 0.5 },
    Size: { Small: 0.7, Medium: 0.6, Large: 0.4 },
    Vaccinated: { Yes: 0.75, No: 0.5 },
    HealthCondition: { Healthy: 0.8, Medical: 0.3 }
  }
};

// ==========================
// CHART FUNKCIJA
// ==========================
function createBarChart(ctxId, labels, values, title) {
    const ctx = document.getElementById(ctxId).getContext('2d');

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: 'rgba(255, 122, 0, 0.7)',
                borderColor: 'rgba(255, 122, 0, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: title,
                    font: { size: 20, weight: '700' }
                }
            },
            scales: {
                y: { 
                  beginAtZero: true,
                  ticks: {
                      font: { size: 18}
                  }
                },
                x: {
                  ticks: {
                        font: { size: 18 } 
                    }
                }
            }
        }
    });
}

// ==========================
// DOHVAT STATISTIKE
// ==========================
async function fetchStatistics() {
    try {
        let data;

        if (USE_DEMO_DATA) {
            data = demoData; // 🟢 JSON radi odmah
        } else {
            const response = await fetch(endpoint);
            data = await response.json(); // 🔵 Azure kasnije
        }

        document.getElementById('total').innerText = data.total;
        document.getElementById('adopted').innerText = data.adopted;
        document.getElementById('notAdopted').innerText = data.notAdopted;

        createBarChart('petTypeChart',
            Object.keys(data.featureImpact.PetType),
            Object.values(data.featureImpact.PetType),
            'Adoption Rate by Pet Type'
        );

        createBarChart('sizeChart',
            Object.keys(data.featureImpact.Size),
            Object.values(data.featureImpact.Size),
            'Adoption Rate by Size'
        );

        createBarChart('vaccinatedChart',
            Object.keys(data.featureImpact.Vaccinated),
            Object.values(data.featureImpact.Vaccinated),
            'Adoption Rate by Vaccination'
        );

        createBarChart('healthChart',
            Object.keys(data.featureImpact.HealthCondition),
            Object.values(data.featureImpact.HealthCondition),
            'Adoption Rate by Health'
        );

    } catch (error) {
        console.error("Error fetching statistics:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchStatistics();
});
