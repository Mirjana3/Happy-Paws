const csvFile = "pets.csv"; // relativno od pages/

async function fetchStatistics() {
    try {
        const response = await fetch(csvFile);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvText = await response.text();

        const sep = csvText.includes(";") ? ";" : ",";
        const rows = csvText.trim().split(/\r?\n/);
        const headers = rows[0].split(sep).map(h => h.trim());

        const colIndex = {
            PetType: headers.indexOf("PetType"),
            Size: headers.indexOf("Size"),
            Vaccinated: headers.indexOf("Vaccinated"),
            HealthCondition: headers.indexOf("HealthCondition"),
            AdoptionLikelihood: headers.indexOf("AdoptionLikelihood")
        };

        if (Object.values(colIndex).some(i => i === -1)) {
            throw new Error("Nedostaje jedan od potrebnih stupaca u CSV-u!");
        }

        const data = rows.slice(1)
            .filter(r => r.trim() !== "")
            .map(row => {
                const values = row.split(sep).map(v => v.trim());
                return {
                    PetType: values[colIndex.PetType],
                    Size: values[colIndex.Size],
                    Vaccinated: values[colIndex.Vaccinated],
                    HealthCondition: values[colIndex.HealthCondition],
                    Adopted: parseFloat(values[colIndex.AdoptionLikelihood]) > 0.5 ? "1" : "0"
                };
            });

        const total = data.length;
        const adopted = data.filter(p => p.Adopted === "1").length;
        const notAdopted = total - adopted;

        const featureImpact = { PetType: {}, Size: {}, Vaccinated: {}, HealthCondition: {} };

        data.forEach(p => {
            if (!featureImpact.PetType[p.PetType]) featureImpact.PetType[p.PetType] = 0;
            if (p.Adopted === "1") featureImpact.PetType[p.PetType]++;

            if (!featureImpact.Size[p.Size]) featureImpact.Size[p.Size] = 0;
            if (p.Adopted === "1") featureImpact.Size[p.Size]++;

            const v = p.Vaccinated === "1" ? "Yes" : "No";
            if (!featureImpact.Vaccinated[v]) featureImpact.Vaccinated[v] = 0;
            if (p.Adopted === "1") featureImpact.Vaccinated[v]++;

            const h = p.HealthCondition === "0" ? "Healthy" : "Medical";
            if (!featureImpact.HealthCondition[h]) featureImpact.HealthCondition[h] = 0;
            if (p.Adopted === "1") featureImpact.HealthCondition[h]++;
        });

        const stats = { total, adopted, notAdopted, featureImpact };

        document.getElementById('total').innerText = stats.total;
        document.getElementById('adopted').innerText = stats.adopted;
        document.getElementById('notAdopted').innerText = stats.notAdopted;

        createBarChart('petTypeChart', Object.keys(stats.featureImpact.PetType), Object.values(stats.featureImpact.PetType), 'Adoption Rate by Pet Type');
        createBarChart('sizeChart', Object.keys(stats.featureImpact.Size), Object.values(stats.featureImpact.Size), 'Adoption Rate by Size');
        createBarChart('vaccinatedChart', Object.keys(stats.featureImpact.Vaccinated), Object.values(stats.featureImpact.Vaccinated), 'Adoption Rate by Vaccination');
        createBarChart('healthChart', Object.keys(stats.featureImpact.HealthCondition), Object.values(stats.featureImpact.HealthCondition), 'Adoption Rate by Health');

        console.log("Statistics loaded:", stats);

    } catch (error) {
        console.error("Error fetching statistics:", error);
    }
}

function createBarChart(ctxId, labels, values, title) {
    const ctx = document.getElementById(ctxId).getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ data: values, backgroundColor: 'rgba(255,122,0,0.7)', borderColor: 'rgba(255,122,0,1)', borderWidth: 1 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: title, font: { size: 20, weight: '700' } } }, scales: { y: { beginAtZero: true, ticks: { font: { size: 18 } } }, x: { ticks: { font: { size: 18 } } } } }
    });
}

document.addEventListener("DOMContentLoaded", fetchStatistics);

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("predictForm");
    const resultDiv = document.getElementById("predictionResult");

    form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const payload = {
        Inputs: {
            input1: [
                {
                    PetType: data.PetType,
                    AgeMonths: parseFloat(data.AgeMonths),
                    Size: data.Size,
                    Vaccinated: parseInt(data.Vaccinated),
                    HealthCondition: parseInt(data.HealthCondition),
                    TimeInShelterDays: parseInt(data.TimeInShelterDays),
                    AdoptionFee: parseFloat(data.AdoptionFee),
                    PreviousOwner: parseInt(data.PreviousOwner)
                }
            ]
        }
    };

    console.log("Payload koji šaljemo:", payload);

    try {
        const response = await fetch("http://localhost:3000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Response not OK:", response.status, text);
            resultDiv.innerHTML = `
                <p style="color:red">Greška od servera: ${response.status}</p>
                <p>Detalji: ${text}</p>
            `;
            return;
        }

        let result;
        try {
            result = await response.json();
        } catch (jsonErr) {
            console.error("Ne može se parsirati JSON:", jsonErr);
            resultDiv.innerHTML = `
                <p style="color:red">Greška: neispravan JSON od servera</p>
                <p>${jsonErr}</p>
            `;
            return;
        }

        if (result.probability === undefined) {
            console.warn("Rezultat ne sadrži 'probability':", result);
            resultDiv.innerHTML = `
                <p style="color:red">Server je vratio neočekivan rezultat</p>
                <pre>${JSON.stringify(result, null, 2)}</pre>
            `;
            return;
        }

        resultDiv.innerHTML = `Vjerojatnost udomljavanja: ${(result.probability * 100).toFixed(2)}%`;

    } catch (err) {
        console.error("Fetch ili drugi problem:", err);
        resultDiv.innerHTML = `
            <p style="color:red">TypeError: problem s mrežom ili URL-om</p>
            <p>${err.message}</p>
        `;
    }
});
});
