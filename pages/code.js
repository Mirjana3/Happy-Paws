// ==========================
// PROMJENA SAMO OVDJE
// ==========================
const USE_DEMO_DATA = false; // sada koristimo CSV fajl
const csvFile = "pets.csv"; // CSV fajl u istom folderu

// ==========================
// DOHVAT STATISTIKE 
// ==========================
async function fetchStatistics() {
    try {
        let data;

        if (USE_DEMO_DATA) {
            data = demoData; // 🟢 JSON radi odmah
        } else {
            // fetch CSV fajla
            const response = await fetch(csvFile);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const csvText = await response.text();

            // parsiranje CSV u objekte
            const rows = csvText.trim().split("\n");
            const headers = rows[0].split(",");
            data = rows.slice(1).map(row => {
                const values = row.split(",");
                let obj = {};
                headers.forEach((h, i) => obj[h] = values[i]);
                return obj;
            });

            // računanje statistike
            const total = data.length;
            const adopted = data.filter(p => p.Adopted === "1").length;
            const notAdopted = total - adopted;

            // feature impact (primjer, možeš prilagoditi)
            const featureImpact = {
                PetType: {},
                Size: {},
                Vaccinated: {},
                HealthCondition: {}
            };

            // PetType
            data.forEach(p => {
                if (!featureImpact.PetType[p.PetType]) featureImpact.PetType[p.PetType] = 0;
                if (p.Adopted === "1") featureImpact.PetType[p.PetType]++;
            });

            // Size
            data.forEach(p => {
                if (!featureImpact.Size[p.Size]) featureImpact.Size[p.Size] = 0;
                if (p.Adopted === "1") featureImpact.Size[p.Size]++;
            });

            // Vaccinated
            data.forEach(p => {
                const v = p.Vaccinated === "1" ? "Yes" : "No";
                if (!featureImpact.Vaccinated[v]) featureImpact.Vaccinated[v] = 0;
                if (p.Adopted === "1") featureImpact.Vaccinated[v]++;
            });

            // HealthCondition
            data.forEach(p => {
                const h = p.HealthCondition === "0" ? "Healthy" : "Medical";
                if (!featureImpact.HealthCondition[h]) featureImpact.HealthCondition[h] = 0;
                if (p.Adopted === "1") featureImpact.HealthCondition[h]++;
            });

            // format podataka kao JSON
            data = {
                total,
                adopted,
                notAdopted,
                featureImpact
            };
        }

        // Popunjavanje HTML elemenata
        document.getElementById('total').innerText = data.total;
        document.getElementById('adopted').innerText = data.adopted;
        document.getElementById('notAdopted').innerText = data.notAdopted;

        // Kreiranje grafova
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
