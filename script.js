const searchBtn = document.getElementById("search");
const searchInput = document.getElementById("pokemon-search-button");
const resultDiv = document.getElementById("Pokemonresult");
const teamDiv = document.getElementById("Team");



let team = JSON.parse(localStorage.getItem("team")) || [];
displayTeam();

function searchPokemon() {
    const pokemonName = searchInput.value;
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Pokemon not found");
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            resultDiv.textContent = data.name;

            // Add to team
            const addButton = document.createElement("button");
            addButton.textContent = "Add to Team";
            resultDiv.appendChild(addButton);
            addButton.addEventListener("click", () => {
                if(team.length >= 6) {
                    alert("Team is full");
                }
                else {
                team.push(data);
                localStorage.setItem("team", JSON.stringify(team));
                console.log(team);
                displayTeam();
                }
            });


            const Image = document.createElement("img");
            Image.width= 250;
            Image.src = data.sprites.front_default;
            resultDiv.appendChild(Image);

            const types = document.createElement("p");
            types.style.color = "white";
            types.textContent = data.types.map(t => t.type.name).join(", ");
            resultDiv.appendChild(types);

        })
        .catch(error => {
            console.log(error);
            resultDiv.textContent = "Pokemon not found, try again";
        });
}

function displayTeam() {

    teamDiv.textContent = "";
    team.forEach(pokemon => {
        const pokemonCard = document.createElement("div");
        const pokemonName = document.createElement("p");
        const Image = document.createElement("img");
        Image.width= 250;
        Image.src = pokemon.sprites.front_default;
        pokemonCard.appendChild(Image);
        pokemonName.textContent = pokemon.name;
        pokemonCard.appendChild(pokemonName);
        teamDiv.appendChild(pokemonCard);
    });
}


// Press enter than have to physically press the search button
searchBtn.addEventListener("click", searchPokemon);
searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchPokemon();
    }
});

