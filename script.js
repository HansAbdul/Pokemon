const searchBtn = document.getElementById("search");
const searchInput = document.getElementById("pokemon-search-button");
const resultDiv = document.getElementById("Pokemonresult");
const teamDiv = document.getElementById("Team");

searchBtn.addEventListener("click", function() {
    const pokemonName = searchInput.value;
    console.log(pokemonName);
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            resultDiv.textContent = data.name;
        });
});