const searchBtn = document.getElementById("search");
const searchInput = document.getElementById("pokemon-search-button");
const resultDiv = document.getElementById("Pokemonresult");
const teamDiv = document.getElementById("Team");

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
            const Image = document.createElement("img");
            Image.src = data.sprites.front_default;
            AppendImage = resultDiv.appendChild(Image);
        })
        .catch(error => {
            console.log(error);
            resultDiv.textContent = "Pokemon not found, try again";
        });
}

searchBtn.addEventListener("click", searchPokemon);
searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchPokemon();
    }
});

