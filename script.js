const searchBtn = document.getElementById("search");
const searchInput = document.getElementById("pokemon-search-button");
const resultDiv = document.getElementById("Pokemonresult");
const teamDiv = document.getElementById("Team");

let team = JSON.parse(localStorage.getItem("team")) || [];
displayTeam();

function searchPokemon() {
    const pokemonName = searchInput.value.trim().toLowerCase();

    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Pokemon not found");
            }
            return response.json();
        })
        .then((data) => {
            console.log(data);
            resultDiv.textContent = data.name;

            // Add to team
            const addButton = document.createElement("button");
            addButton.textContent = "Add to Team";
            addButton.className = "btn btn-add";
            resultDiv.appendChild(addButton);

            addButton.addEventListener("click", () => {
                if (team.length >= 6) {
                    alert("Team is full");
                } else {
                    team.push(data);
                    localStorage.setItem("team", JSON.stringify(team));
                    console.log(team);
                    displayTeam();
                }
            });

            const Image = document.createElement("img");
            Image.width = 250;
            Image.src = data.sprites.front_default;
            resultDiv.appendChild(Image);

            const types = document.createElement("p");
            types.style.color = "white";
            types.textContent = data.types.map((t) => t.type.name).join(", ");
            resultDiv.appendChild(types);
        })
        .catch((error) => {
            console.log(error);
            resultDiv.textContent = "Pokemon not found, try again";
        });
}

function displayTeam() {
    teamDiv.textContent = "";

    team.forEach((pokemon, index) => {
        const pokemonCard = document.createElement("div");
        pokemonCard.className = "pokemon-card";

        // Rename button
        const renameButton = document.createElement("button");
        renameButton.textContent = "✏️";
        renameButton.className = "rename-button";
        renameButton.setAttribute("aria-label", `Rename ${pokemon.nickname || pokemon.name}`);
        renameButton.title = "Rename";
        pokemonCard.appendChild(renameButton);

        renameButton.addEventListener("click", () => {
            const newName = prompt("Enter new name")?.trim().slice(0, 12);
            if (newName) {
                pokemon.nickname = newName;
                localStorage.setItem("team", JSON.stringify(team));
                displayTeam();
            }
        });

        const pokemonName = document.createElement("p");
        const Image = document.createElement("img");

        // Pokemon stats
        const statsPanel = document.createElement("p");
        statsPanel.className = "stats";

        pokemon.stats.forEach((s) => {
            const statRow = document.createElement("div");
            statRow.className = "stat-row";

            const statName = document.createElement("span");
            statName.className = "stat-name";
            statName.textContent = s.stat.name;

            const statValue = document.createElement("span");
            statValue.textContent = s.base_stat;

            const statBar = document.createElement("div");
            statBar.className = "stat-bar";

            const statFill = document.createElement("div");
            statFill.className = "stat-fill";
            statFill.style.width = `${(s.base_stat / 255) * 100}%`;
            statBar.appendChild(statFill);

            statRow.appendChild(statName);
            statRow.appendChild(statValue);
            statRow.appendChild(statBar);

            statsPanel.appendChild(statRow);
        });

        pokemonCard.appendChild(statsPanel);

        // Pokemon image and name
        Image.width = 180;
        Image.src = pokemon.sprites.front_default;
        pokemonCard.appendChild(Image);

        pokemonName.textContent = pokemon.nickname || pokemon.name;
        pokemonCard.appendChild(pokemonName);
        teamDiv.appendChild(pokemonCard);

        // Remove button
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.className = "btn remove";
        pokemonCard.appendChild(removeButton);

        removeButton.addEventListener("click", () => {
            team.splice(index, 1);
            localStorage.setItem("team", JSON.stringify(team));
            displayTeam();
        });
    });
}

// Search on click or when Enter is pressed
searchBtn.addEventListener("click", searchPokemon);

searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchPokemon();
    }
});
