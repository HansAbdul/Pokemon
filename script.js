const searchBtn = document.getElementById("search");
const searchInput = document.getElementById("pokemon-search-button");
const resultDiv = document.getElementById("Pokemonresult");
const teamDiv = document.getElementById("Team");

let team = JSON.parse(localStorage.getItem("team")) || [];
displayTeam();

const MIN_CHARS = 2;
const DEBOUNCE_MS = 400;
const MAX_SUGGESTIONS = 10;
const API = "https://pokeapi.co/api/v2/pokemon";

const statusEl = document.getElementById("search-status");
const retryBtn = document.getElementById("retry");
const listEl = document.getElementById("suggestions");

let allNames = null;
let namesPromise = null;
let debounceTimer = null;
let lastQuery = null;
let activeIndex = -1;
let detailToken = 0;
let retryAction = null;

function setStatus(message, retry) {
    statusEl.textContent = message;
    retryAction = retry || null;
    retryBtn.hidden = !retry;
}

function loadNames() {
    if (allNames) return Promise.resolve(allNames);
    if (!namesPromise) {
        namesPromise = fetch(`${API}?limit=100000`)
            .then((response) => {
                if (!response.ok) throw new Error("Failed to load names");
                return response.json();
            })
            .then((data) => {
                allNames = data.results.map((p) => p.name);
                return allNames;
            })
            .catch((error) => {
                namesPromise = null;
                throw error;
            });
    }
    return namesPromise;
}

function clearResults() {
    detailToken++;
    lastQuery = null;
    renderSuggestions([]);
    resultDiv.textContent = "";
}

function renderSuggestions(names) {
    listEl.textContent = "";
    activeIndex = -1;
    searchInput.removeAttribute("aria-activedescendant");
    names.forEach((name, i) => {
        const li = document.createElement("li");
        li.id = `suggestion-${i}`;
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");
        li.textContent = name;
        // mousedown keeps focus in the input
        li.addEventListener("mousedown", (e) => e.preventDefault());
        li.addEventListener("click", () => selectPokemon(name));
        listEl.appendChild(li);
    });
    listEl.hidden = names.length === 0;
    searchInput.setAttribute("aria-expanded", String(names.length > 0));
}

function setActive(index) {
    const items = listEl.children;
    if (!items.length) return;
    activeIndex = (index + items.length) % items.length;
    Array.from(items).forEach((li, i) => {
        li.setAttribute("aria-selected", String(i === activeIndex));
        li.classList.toggle("active", i === activeIndex);
    });
    searchInput.setAttribute("aria-activedescendant", items[activeIndex].id);
    items[activeIndex].scrollIntoView({ block: "nearest" });
}

function runSearch(force) {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim().toLowerCase();

    if (query.length < MIN_CHARS) {
        clearResults();
        setStatus(`Type at least ${MIN_CHARS} characters to search.`);
        return;
    }
    if (!force && query === lastQuery) return;
    lastQuery = query;
    renderSuggestions([]);
    resultDiv.textContent = "";
    detailToken++;

    if (!allNames) setStatus("Loading Pokemon names...");
    loadNames()
        .then((names) => {
            if (searchInput.value.trim().toLowerCase() !== query) return;
            const matches = names.filter((n) => n.includes(query));
            matches.sort((x, y) => x.startsWith(query) === y.startsWith(query) ? 0 : x.startsWith(query) ? -1 : 1);
            if (matches.length === 0) {
                setStatus(`No Pokemon match "${query}".`);
                return;
            }
            const shown = matches.slice(0, MAX_SUGGESTIONS);
            setStatus(`${matches.length} suggestion${matches.length === 1 ? "" : "s"} available. Use up and down arrows to review.`);
            renderSuggestions(shown);
        })
        .catch(() => {
            if (searchInput.value.trim().toLowerCase() !== query) return;
            lastQuery = null;
            setStatus("Could not load Pokemon names. Check your connection and try again.", () => runSearch(true));
        });
}

function selectPokemon(name) {
    clearTimeout(debounceTimer);
    searchInput.value = name;
    lastQuery = name;
    renderSuggestions([]);
    const token = ++detailToken;
    resultDiv.textContent = "";
    setStatus(`Loading ${name}...`);

    fetch(`${API}/${encodeURIComponent(name)}`)
        .then((response) => {
            if (!response.ok) throw new Error("Pokemon not found");
            return response.json();
        })
        .then((data) => {
            if (token !== detailToken) return;
            setStatus(`Showing ${data.name}.`);
            showPokemon(data);
        })
        .catch(() => {
            if (token !== detailToken) return;
            setStatus(`Could not load ${name}. Check your connection and try again.`, () => selectPokemon(name));
        });
}

function showPokemon(data) {
    resultDiv.textContent = data.name;

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
            displayTeam();
        }
    });

    const Image = document.createElement("img");
    Image.width = 250;
    Image.alt = data.name;
    Image.src = data.sprites.front_default;
    resultDiv.appendChild(Image);

    const types = document.createElement("p");
    types.style.color = "white";
    types.textContent = data.types.map((t) => t.type.name).join(", ");
    resultDiv.appendChild(types);
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

// Typeahead: debounce input, Search button/Enter run immediately (deduped by lastQuery)
searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();
    if (query.length < MIN_CHARS) {
        clearResults();
        setStatus(query ? `Type at least ${MIN_CHARS} characters to search.` : "");
        return;
    }
    debounceTimer = setTimeout(() => runSearch(false), DEBOUNCE_MS);
});

searchBtn.addEventListener("click", () => runSearch(false));
retryBtn.addEventListener("click", () => retryAction && retryAction());

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (!listEl.children.length) return;
        event.preventDefault();
        setActive(activeIndex + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Enter") {
        event.preventDefault();
        if (activeIndex >= 0) {
            selectPokemon(listEl.children[activeIndex].textContent);
        } else {
            runSearch(false);
        }
    } else if (event.key === "Escape") {
        renderSuggestions([]);
    }
});
