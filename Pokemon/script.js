let api = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0";
let offset = 0;
let allPokemons = [];
let container = document.querySelector(".container");
let typeFilter = document.getElementById("filter");
let searchInput = document.getElementById("searchInput");
let loadMoreBtn = document.getElementById("loadMore");
let categoryFilter = document.getElementById("categoryFilter");
const renderPokemonData = (pokemonsToRender) => {
  container.innerHTML = ""; 
  pokemonsToRender.forEach((pokemon) => {
    let card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${pokemon.image}" />
      <p><strong>${pokemon.name}</strong></p>
      <p>Type: ${pokemon.types.join(", ")}</p>
      <p>XP: ${pokemon.base_experience}</p>
    `;
    container.appendChild(card); 
  });
};
const fetchPokemons = async () => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`);
  const data = await response.json();
  const promises = data.results.map((ele) => {
    return fetch(ele.url)
      .then((res) => res.json())
      .then((data2) => {
        return {
          name: data2.name,
          height: data2.height,
          weight: data2.weight,
          base_experience: data2.base_experience,
          types: data2.types.map((el2) => el2.type.name),
          stats: data2.stats.map((el2) => ({
            value: el2.base_stat,
            stat: el2.stat.name,
          })),
          image: data2.sprites.other.dream_world.front_default || data2.sprites.front_default,
        };
      });
  });
  const newPokemons = await Promise.all(promises);
  allPokemons = [...allPokemons, ...newPokemons];
  renderPokemonData(allPokemons);
  setupFilter(allPokemons);
  setupSearch(allPokemons);
  setupCategoryFilter(allPokemons);
};
const setupFilter = (pokemons) => {
  let allTypes = new Set(); 
  pokemons.forEach((p) => p.types.forEach((t) => allTypes.add(t)));

  
  if (typeFilter.options.length === 1) {
    allTypes.forEach((type) => {
      let opt = document.createElement("option");
      opt.value = type;
      opt.textContent = type;
      typeFilter.appendChild(opt);
    });
  } 
  typeFilter.addEventListener("change", applyAllFilters);
};
const setupSearch = (pokemons) => {
  searchInput.addEventListener("input", applyAllFilters);
};
const setupCategoryFilter = (pokemons) => {
  categoryFilter.addEventListener("change", applyAllFilters);
};
const applyAllFilters = () => {
  const query = searchInput.value.toLowerCase(); 
  const selectedType = typeFilter.value;       
  const selectedCategory = categoryFilter.value; 
  let filtered = allPokemons.filter((p) => {
    const matchType = selectedType === "" || p.types.includes(selectedType);
    const matchName = p.name.includes(query); 

    let matchCategory = true;
    if (selectedCategory === "lowXP") matchCategory = p.base_experience <= 100;
    else if (selectedCategory === "midXP") matchCategory = p.base_experience > 100 && p.base_experience <= 200;
    else if (selectedCategory === "highXP") matchCategory = p.base_experience > 200;
    return matchType && matchName && matchCategory; 
  });
  renderPokemonData(filtered); 
};
loadMoreBtn.addEventListener("click", () => {
  offset += 20;
  fetchPokemons();
});
fetchPokemons();
