// ==========================
// PROMJENA SAMO OVDJE
// ==========================
const USE_DEMO_DATA = false; // sada koristimo REST endpoint
const endpoint = "http://c5ef19f9-ca84-4daa-9b5f-f3e37921dccd.polandcentral.azurecontainer.io/score";
const apiKey = "JFWBbhNYw2h5fNTFqdrX7b4DMdnOttWQ"; // vaš ključ za REST API

// ==========================
// DOHVAT STATISTIKE
// ==========================
async function fetchStatistics() {
    try {
        let data;

        if (USE_DEMO_DATA) {
            data = demoData; // 🟢 JSON radi odmah
        } else {
            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}` // ili "Ocp-Apim-Subscription-Key" ovisno o servisu
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            data = await response.json(); // 🔵 REST API vraća JSON
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
