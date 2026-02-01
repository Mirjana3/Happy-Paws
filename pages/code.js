// ==========================
// PROMJENA SAMO OVDJE
// ==========================
const csvFile = "/pets.csv"; // CSV u rootu

// ==========================
// DOHVAT STATISTIKE 
// ==========================
async function fetchStatistics() {
    try {
        // fetch CSV fajla
        const response = await fetch(csvFile);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const csvText = await response.text();

        // detektiraj separator
        const sep = csvText.includes(";") ? ";" : ",";
        const rows = csvText.trim().split(/\r?\n/);
        const headers = rows[0].split(sep).map(h => h.trim());

        let data = rows.slice(1)
            .filter(r => r.trim() !== "")
            .map(row => {
                const values = row.split(sep).map(v => v.trim());
                let obj = {};
                headers.forEach((h, i) => obj[h] = values[i]);
                return obj;
            });

        // filtriraj i računaj statistiku
        const total = data.length;
        const adopted = data.filter(p => p.Adopted === "1").length;
        const notAdopted = total - adopted;

        const featureImpact = { PetType: {}, Size: {}, Vaccinated: {}, HealthCondition: {} };

        data.forEach(p => {
            // PetType
            if (!featureImpact.PetType[p.PetType]) featureImpact.PetType[p.PetType] = 0;
            if (p.Adopted === "1") featureImpact.PetType[p.PetType]++;

            // Size
            if (!featureImpact.Size[p.Size]) featureImpact.Size[p.Size] = 0;
            if (p.Adopted === "1") featureImpact.Size[p.Size]++;

            // Vaccinated
            const v = p.Vaccinated === "1" ? "Yes" : "No";
            if (!featureImpact.Vaccinated[v]) featureImpact.Vaccinated[v] = 0;
            if (p.Adopted === "1") featureImpact.Vaccinated[v]++;

            // HealthCondition
            const h = p.HealthCondition === "0" ? "Healthy" : "Medical";
            if (!featureImpact.HealthCondition[h]) featureImpact.HealthCondition[h] = 0;
            if (p.Adopted === "1") featureImpact.HealthCondition[h]++;
        });

        data = { total, adopted, notAdopted, featureImpact };

        // Popunjavanje HTML elemenata
        document.getElementById('total').innerText = data.total;
        document.getElementById('adopted').innerText = data.adopted;
        document.getElementById('notAdopted').innerText = data.notAdopted;

        // Kreiranje grafova
        createBarChart('petTypeChart', Object.keys(data.featureImpact.PetType), Object.values(data.featureImpact.PetType), 'Adoption Rate by Pet Type');
        createBarChart('sizeChart', Object.keys(data.featureImpact.Size), Object.values(data.featureImpact.Size), 'Adoption Rate by Size');
        createBarChart('vaccinatedChart', Object.keys(data.featureImpact.Vaccinated), Object.values(data.featureImpact.Vaccinated), 'Adoption Rate by Vaccination');
        createBarChart('healthChart', Object.keys(data.featureImpact.HealthCondition), Object.values(data.featureImpact.HealthCondition), 'Adoption Rate by Health');

    } catch (error) {
        console.error("Error fetching statistics:", error);
    }
}

// ==========================
// CHART FUNKCIJA
// ==========================
function createBarChart(ctxId, labels, values, title) {
    const ctx = document.getElementById(ctxId).getContext('2d');

    return new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ data: values, backgroundColor: 'rgba(255,122,0,0.7)', borderColor: 'rgba(255,122,0,1)', borderWidth: 1 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, title: { display: true, text: title, font: { size: 20, weight: '700' } } },
            scales: { y: { beginAtZero: true, ticks: { font: { size: 18 } } }, x: { ticks: { font: { size: 18 } } } }
        }
    });
}

document.addEventListener("DOMContentLoaded", fetchStatistics);
