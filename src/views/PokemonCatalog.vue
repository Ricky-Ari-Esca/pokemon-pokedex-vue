<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import PokemonCard from "../components/PokemonCard.vue";

// ========================================
// ROUTER
// ========================================

const router = useRouter();

function irAlReconocimiento() {
  router.push("/recognition");
}

// ========================================
// REGIONES
// ========================================

const regions = [
  {
    name: "Kanto",
    start: 1,
    end: 151,
  },
  {
    name: "Johto",
    start: 152,
    end: 251,
  },
  {
    name: "Hoenn",
    start: 252,
    end: 386,
  },
  {
    name: "Sinnoh",
    start: 387,
    end: 493,
  },
  {
    name: "Unova",
    start: 494,
    end: 649,
  },
  {
    name: "Kalos",
    start: 650,
    end: 721,
  },
  {
    name: "Alola",
    start: 722,
    end: 809,
  },
  {
    name: "Galar",
    start: 810,
    end: 898,
  },
  {
    name: "Paldea",
    start: 899,
    end: 1025,
  },
];

// ========================================
// ESTADO
// ========================================

const pokemons = ref([]);
const search = ref("");
const loading = ref(false);
const error = ref(null);
const selectedRegion = ref(regions[0]);

// ========================================
// CARGAR POKÉMON
// ========================================

async function getPokemons() {
  try {
    loading.value = true;
    error.value = null;
    pokemons.value = [];

    const amount = selectedRegion.value.end - selectedRegion.value.start + 1;

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${selectedRegion.value.start - 1}&limit=${amount}`,
    );

    if (!response.ok) {
      throw new Error("No se pudo obtener la información.");
    }

    const data = await response.json();

    pokemons.value = data.results;
  } catch (err) {
    console.error(err);
    error.value = "No se pudo cargar el catálogo.";
  } finally {
    loading.value = false;
  }
}

// ========================================
// CAMBIAR REGIÓN
// ========================================

function changeRegion(region) {
  selectedRegion.value = region;
  search.value = "";
  getPokemons();
}

// ========================================
// BUSCADOR
// ========================================

const filteredPokemons = computed(() => {
  const text = search.value.toLowerCase().trim();

  if (!text) {
    return pokemons.value;
  }

  return pokemons.value.filter((pokemon) => pokemon.name.toLowerCase().includes(text));
});

// ========================================
// INICIALIZAR
// ========================================

onMounted(() => {
  getPokemons();
});
</script>

<template>
  <main class="catalog-page">
    <div class="container">
      <!-- ==================================
           HEADER
      =================================== -->

      <header class="catalog-header">
        <div>
          <span class="eyebrow"> POKÉDEX · REGIONES </span>

          <h1>Catálogo de Pokémon</h1>

          <p>Explora las diferentes regiones del mundo Pokémon.</p>
        </div>

        <div class="pokemon-counter">
          <span class="counter-number">
            {{ filteredPokemons.length }}
          </span>

          <span class="counter-label"> POKÉMON </span>
        </div>
      </header>

      <!-- ==================================
           BOTÓN DE RECONOCIMIENTO
      =================================== -->

      <section class="recognition-section">
        <button type="button" class="recognition-button" @click="irAlReconocimiento">
          <span>Reconocer Pokémon</span>
          <span class="recognition-arrow">→</span>
        </button>
      </section>

      <!-- ==================================
           REGIONES
      =================================== -->

      <section class="regions-section">
        <div class="section-label">REGIÓN</div>

        <div class="regions">
          <button
            v-for="region in regions"
            :key="region.name"
            type="button"
            class="region-button"
            :class="{
              active: selectedRegion.name === region.name,
            }"
            @click="changeRegion(region)"
          >
            {{ region.name }}
          </button>
        </div>
      </section>

      <!-- ==================================
           BUSCADOR
      =================================== -->

      <section class="search-section">
        <div class="search-box">
          <span class="search-icon"> 🔍 </span>

          <input v-model="search" type="text" placeholder="Buscar Pokémon..." />

          <button v-if="search" type="button" class="clear-search" @click="search = ''">×</button>
        </div>
      </section>

      <!-- ==================================
           INFORMACIÓN
      =================================== -->

      <div v-if="!loading && !error" class="results-info">
        <span>
          Mostrando
          <strong>
            {{ selectedRegion.name }}
          </strong>
          ·
          {{ selectedRegion.start }}
          –
          {{ selectedRegion.end }}
        </span>

        <span v-if="search">
          Resultados para:
          <strong> "{{ search }}" </strong>
        </span>
      </div>

      <!-- ==================================
           LOADING
      =================================== -->

      <section v-if="loading" class="state-container">
        <div class="loading-spinner"></div>

        <h2>Cargando {{ selectedRegion.name }}...</h2>

        <p>Preparando la Pokédex.</p>
      </section>

      <!-- ==================================
           ERROR
      =================================== -->

      <section v-else-if="error" class="state-container">
        <div class="state-icon">⚠️</div>

        <h2>Ocurrió un problema</h2>

        <p>
          {{ error }}
        </p>

        <button type="button" class="primary-button" @click="getPokemons">
          Intentar nuevamente
        </button>
      </section>

      <!-- ==================================
           SIN RESULTADOS
      =================================== -->

      <section v-else-if="filteredPokemons.length === 0" class="state-container">
        <div class="state-icon">🔎</div>

        <h2>No encontramos Pokémon</h2>

        <p>No hay resultados para "{{ search }}".</p>

        <button type="button" class="primary-button" @click="search = ''">Mostrar todos</button>
      </section>

      <!-- ==================================
           GRID
      =================================== -->

      <section v-else class="pokemon-grid">
        <PokemonCard
          v-for="pokemon in filteredPokemons"
          :key="pokemon.name"
          :pokemon="pokemon"
          :index="selectedRegion.start + pokemons.indexOf(pokemon)"
        />
      </section>

      <!-- ==================================
           FOOTER
      =================================== -->

      <footer v-if="!loading && !error && filteredPokemons.length" class="catalog-footer">
        <span></span>

        POKÉDEX ·
        {{ selectedRegion.name }}

        <span></span>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.catalog-page {
  min-height: 100vh;
  background: var(--background);
  padding: 48px 0 70px;
}

.catalog-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 25px;
}

.eyebrow {
  display: block;
  margin-bottom: 10px;
  color: var(--primary);
  font-family: "Space Grotesk", sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.catalog-header h1 {
  margin: 0 0 10px;
}

.catalog-header p {
  margin: 0;
  color: var(--text-light);
  font-size: 18px;
  line-height: 28px;
}

.pokemon-counter {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.counter-number {
  color: var(--primary);
  font-family: "Space Grotesk", sans-serif;
  font-size: 32px;
  font-weight: 700;
}

.counter-label {
  color: #999;
  font-family: "Space Grotesk", sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

/* ========================================
   BOTÓN DE RECONOCIMIENTO
======================================== */

.recognition-section {
  margin-bottom: 30px;
}

.recognition-button {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 13px 20px;

  border: 1px solid var(--primary);
  border-radius: var(--radius);

  background: var(--primary);
  color: white;

  font-family: "Space Grotesk", sans-serif;
  font-size: 13px;
  font-weight: 700;

  cursor: pointer;

  box-shadow: 0 6px 18px rgba(188, 1, 0, 0.15);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.recognition-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(188, 1, 0, 0.25);
}

.recognition-button:active {
  transform: translateY(0);
}

.recognition-arrow {
  font-size: 18px;
  transition: transform 0.2s ease;
}

.recognition-button:hover .recognition-arrow {
  transform: translateX(4px);
}

/* ========================================
   REGIONES
======================================== */

.regions-section {
  margin-bottom: 25px;
}

.section-label {
  margin-bottom: 10px;
  color: var(--primary);
  font-family: "Space Grotesk", sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.regions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.region-button {
  padding: 9px 15px;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: var(--surface);
  color: var(--text-light);
  font-family: "Space Grotesk", sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.region-button:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.region-button.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 5px 15px rgba(188, 1, 0, 0.15);
}

/* ========================================
   BUSCADOR
======================================== */

.search-section {
  margin-bottom: 22px;
}

.search-box {
  position: relative;
  max-width: 700px;
}

.search-box input {
  width: 100%;
  height: 54px;
  padding: 0 45px 0 50px;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: var(--surface);
  color: var(--text);
  outline: none;
  font-family: "Manrope", sans-serif;
  font-size: 15px;
  box-shadow: var(--shadow-card);
  box-sizing: border-box;
}

.search-box input:focus {
  border: 2px solid var(--primary);
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  z-index: 1;
}

.clear-search {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);

  width: 32px;
  height: 32px;

  border: none;
  border-radius: 50%;

  background: var(--surface-container);

  font-size: 20px;
  cursor: pointer;
}

/* ========================================
   RESULTADOS
======================================== */

.results-info {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
  color: var(--text-light);
  font-size: 13px;
}

.results-info strong {
  color: var(--text);
}

/* ========================================
   GRID
======================================== */

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

/* ========================================
   ESTADOS
======================================== */

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 400px;
  padding: 40px;

  text-align: center;

  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.state-container h2 {
  margin: 15px 0 8px;
}

.state-container p {
  color: var(--text-light);
}

.state-icon {
  font-size: 50px;
}

.loading-spinner {
  width: 45px;
  height: 45px;

  border: 4px solid var(--surface-container);
  border-top-color: var(--primary);
  border-radius: 50%;

  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========================================
   BOTÓN
======================================== */

.primary-button {
  margin-top: 20px;
  padding: 12px 20px;

  border: none;
  border-radius: var(--radius);

  background: var(--primary);
  color: white;

  font-family: "Space Grotesk", sans-serif;
  font-weight: 600;

  cursor: pointer;
}

/* ========================================
   FOOTER
======================================== */

.catalog-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;

  margin-top: 50px;

  color: #999;

  font-family: "Space Grotesk", sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.catalog-footer span {
  width: 60px;
  height: 1px;
  background: var(--border);
}

/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 1050px) {
  .pokemon-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .catalog-page {
    padding: 30px 0 50px;
  }

  .catalog-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .pokemon-counter {
    align-items: flex-start;
  }

  .pokemon-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .results-info {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .pokemon-grid {
    grid-template-columns: 1fr;
  }

  .regions {
    gap: 6px;
  }

  .region-button {
    padding: 8px 12px;
    font-size: 11px;
  }

  .recognition-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
