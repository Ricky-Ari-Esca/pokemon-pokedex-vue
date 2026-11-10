<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const pokemon = ref(null)
const loading = ref(true)
const error = ref(null)
const isPlaying = ref(false)

let audio = null


// ========================================
// OBTENER POKÉMON
// ========================================

async function getPokemon() {

  try {

    loading.value = true
    error.value = null

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${route.params.id}`
    )

    if (!response.ok) {
      throw new Error('Pokémon no encontrado')
    }

    pokemon.value = await response.json()

  } catch (err) {

    console.error(
      'Error obteniendo Pokémon:',
      err
    )

    error.value =
      'No se pudo cargar la información del Pokémon.'

  } finally {

    loading.value = false

  }

}


// ========================================
// FORMATEAR NOMBRE
// ========================================

function formatName(name) {

  if (!name) return ''

  return name.charAt(0).toUpperCase() +
    name.slice(1)

}


// ========================================
// FORMATEAR ID
// ========================================

function formatId(id) {

  return `#${String(id).padStart(3, '0')}`

}


// ========================================
// IMAGEN
// ========================================

function getImage() {

  if (!pokemon.value) {
    return ''
  }

  return pokemon.value.sprites?.other?.[
    'official-artwork'
  ]?.front_default ||
    pokemon.value.sprites?.front_default ||
    ''

}


// ========================================
// TIPO
// ========================================

function getTypeClass(type) {

  return `type-${type}`

}


// ========================================
// SONIDO
// ========================================

function playSound() {

  if (!pokemon.value) return

  const sound =
    pokemon.value.cries?.latest ||
    pokemon.value.cries?.legacy

  if (!sound) {

    alert(
      'Este Pokémon no tiene un sonido disponible.'
    )

    return

  }

  if (audio) {

    audio.pause()

    audio.currentTime = 0

  }

  audio = new Audio(sound)

  isPlaying.value = true

  audio.play()

  audio.onended = () => {

    isPlaying.value = false

  }

}


// ========================================
// VOLVER AL CATÁLOGO
// ========================================

function goBack() {

  router.push('/pokedex')

}


// ========================================
// CARGAR INFORMACIÓN
// ========================================

onMounted(() => {

  getPokemon()

})

</script>


<template>

  <main class="detail-page">

    <div class="container">


      <!-- ==================================
           BOTÓN REGRESAR
      =================================== -->

      <button
        class="back-button"
        type="button"
        @click="goBack"
      >

        <span class="back-arrow">
          ←
        </span>

        Volver al catálogo

      </button>


      <!-- ==================================
           CARGANDO
      =================================== -->

      <section
        v-if="loading"
        class="state-container"
      >

        <div class="loading-spinner"></div>

        <h2>
          Cargando Pokémon...
        </h2>

        <p>
          Estamos obteniendo sus características.
        </p>

      </section>


      <!-- ==================================
           ERROR
      =================================== -->

      <section
        v-else-if="error"
        class="state-container"
      >

        <div class="state-icon">
          ⚠️
        </div>

        <h2>
          Pokémon no encontrado
        </h2>

        <p>
          {{ error }}
        </p>

        <button
          class="primary-button"
          type="button"
          @click="goBack"
        >

          Volver al catálogo

        </button>

      </section>


      <!-- ==================================
           DETALLE
      =================================== -->

      <section
        v-else-if="pokemon"
        class="pokemon-detail"
      >


        <!-- ==================================
             ENCABEZADO
        =================================== -->

        <header class="detail-header">

          <div>

            <span class="eyebrow">
              POKÉDEX · KANTO
            </span>

            <p class="pokemon-number">
              {{ formatId(pokemon.id) }}
            </p>

            <h1>
              {{ formatName(pokemon.name) }}
            </h1>

          </div>


          <!-- BOTÓN SONIDO -->

          <button
            class="sound-button"
            type="button"
            @click="playSound"
          >

            <span class="sound-icon">
              {{ isPlaying ? '🔊' : '🔈' }}
            </span>

            <span>
              {{ isPlaying
                ? 'REPRODUCIENDO'
                : 'ESCUCHAR' }}
            </span>

          </button>

        </header>


        <!-- ==================================
             CONTENIDO PRINCIPAL
        =================================== -->

        <div class="detail-grid">


          <!-- ==================================
               TARJETA DE IMAGEN
          =================================== -->

          <section class="main-pokemon-card">

            <div class="artwork-background"></div>

            <span class="artwork-label">
              {{ formatId(pokemon.id) }}
            </span>

            <img
              :src="getImage()"
              :alt="formatName(pokemon.name)"
              class="pokemon-artwork"
            />

          </section>


          <!-- ==================================
               INFORMACIÓN
          =================================== -->

          <section class="information-panel">


            <!-- TIPOS -->

            <div class="info-section">

              <span class="section-label">
                TIPO
              </span>

              <div class="types">

                <span
                  v-for="item in pokemon.types"
                  :key="item.type.name"
                  class="type-badge"
                  :class="
                    getTypeClass(
                      item.type.name
                    )
                  "
                >

                  {{ formatName(item.type.name) }}

                </span>

              </div>

            </div>


            <!-- MEDIDAS -->

            <div class="info-section">

              <span class="section-label">
                CARACTERÍSTICAS
              </span>

              <div class="measurements">

                <div class="measurement">

                  <span class="measurement-label">
                    ALTURA
                  </span>

                  <strong>
                    {{ (pokemon.height / 10).toFixed(1) }} m
                  </strong>

                </div>


                <div class="measurement">

                  <span class="measurement-label">
                    PESO
                  </span>

                  <strong>
                    {{ (pokemon.weight / 10).toFixed(1) }} kg
                  </strong>

                </div>

              </div>

            </div>


            <!-- HABILIDADES -->

            <div class="info-section">

              <span class="section-label">
                HABILIDADES
              </span>

              <div class="abilities">

                <span
                  v-for="item in pokemon.abilities"
                  :key="item.ability.name"
                  class="ability"
                >

                  {{ formatName(
                    item.ability.name
                  ) }}

                </span>

              </div>

            </div>


          </section>

        </div>


        <!-- ==================================
             ESTADÍSTICAS
        =================================== -->

        <section class="stats-section">

          <div class="section-heading">

            <div>

              <span class="section-label">
                DATOS DE COMBATE
              </span>

              <h2>
                Estadísticas base
              </h2>

            </div>

            <span class="stats-count">
              {{ pokemon.stats.length }} STATS
            </span>

          </div>


          <div class="stats-list">

            <div
              v-for="stat in pokemon.stats"
              :key="stat.stat.name"
              class="stat-row"
            >

              <div class="stat-top">

                <span class="stat-name">
                  {{ formatName(
                    stat.stat.name
                  ) }}
                </span>

                <strong class="stat-value">
                  {{ stat.base_stat }}
                </strong>

              </div>


              <div class="progress-track">

                <div
                  class="progress-fill"
                  :style="{
                    width:
                      Math.min(
                        stat.base_stat,
                        100
                      ) + '%'
                  }"
                ></div>

              </div>

            </div>

          </div>

        </section>


        <!-- ==================================
             SPRITES
        =================================== -->

        <section class="sprites-section">

          <div class="section-heading">

            <div>

              <span class="section-label">
                SPRITES
              </span>

              <h2>
                Apariencia clásica
              </h2>

            </div>

          </div>


          <div class="sprites">

            <div
              v-if="
                pokemon.sprites?.front_default
              "
              class="sprite-card"
            >

              <span>
                FRONT
              </span>

              <img
                :src="
                  pokemon.sprites.front_default
                "
                :alt="
                  formatName(pokemon.name)
                "
              />

            </div>


            <div
              v-if="
                pokemon.sprites?.back_default
              "
              class="sprite-card"
            >

              <span>
                BACK
              </span>

              <img
                :src="
                  pokemon.sprites.back_default
                "
                :alt="
                  formatName(pokemon.name)
                "
              />

            </div>

          </div>

        </section>


      </section>

    </div>

  </main>

</template>


<style scoped>

/* ========================================
   PÁGINA
======================================== */

.detail-page {

  min-height: 100vh;

  background:
    var(--background);

  padding:
    40px 0 80px;

}


/* ========================================
   BOTÓN REGRESAR
======================================== */

.back-button {

  display: inline-flex;

  align-items: center;

  gap: 9px;

  margin-bottom: 35px;

  padding: 10px 16px;

  border:
    1px solid var(--border);

  border-radius:
    var(--radius);

  background:
    var(--surface);

  color:
    var(--text);

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size: 13px;

  font-weight: 600;

  cursor: pointer;

  transition:
    all 0.2s ease;

}


.back-button:hover {

  border-color:
    var(--primary);

  color:
    var(--primary);

  transform:
    translateX(-2px);

}


.back-arrow {

  font-size: 18px;

}


/* ========================================
   HEADER
======================================== */

.detail-header {

  display: flex;

  align-items: flex-end;

  justify-content: space-between;

  gap: 25px;

  margin-bottom: 32px;

}


.eyebrow {

  display: block;

  margin-bottom: 8px;

  color:
    var(--primary);

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size: 12px;

  font-weight: 700;

  letter-spacing:
    0.12em;

}


.pokemon-number {

  margin-bottom: 3px;

  color:
    #999;

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size: 14px;

  font-weight: 600;

}


.detail-header h1 {

  font-family:
    'Plus Jakarta Sans',
    sans-serif;

  font-size:
    40px;

  line-height:
    48px;

  font-weight:
    800;

}


/* ========================================
   BOTÓN SONIDO
======================================== */

.sound-button {

  display: flex;

  align-items: center;

  gap: 9px;

  padding:
    12px 18px;

  border:
    none;

  border-radius:
    var(--radius);

  background:
    var(--primary);

  color:
    white;

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    12px;

  font-weight:
    600;

  letter-spacing:
    0.04em;

  cursor: pointer;

  box-shadow:
    0 8px 20px
    rgba(188, 1, 0, 0.16);

  transition:
    all 0.2s ease;

}


.sound-button:hover {

  background:
    #A80000;

  transform:
    translateY(-2px);

}


.sound-button:active {

  transform:
    scale(0.98);

}


.sound-icon {

  font-size:
    16px;

}


/* ========================================
   GRID PRINCIPAL
======================================== */

.detail-grid {

  display: grid;

  grid-template-columns:
    minmax(0, 1.1fr)
    minmax(0, 0.9fr);

  gap:
    24px;

  margin-bottom:
    30px;

}


/* ========================================
   TARJETA PRINCIPAL
======================================== */

.main-pokemon-card {

  position: relative;

  display: flex;

  align-items: center;

  justify-content: center;

  min-height:
    500px;

  overflow: hidden;

  background:
    var(--surface);

  border:
    1px solid var(--border);

  border-radius:
    var(--radius-lg);

  box-shadow:
    0 10px 30px
    rgba(0, 0, 0, 0.05);

}


.artwork-background {

  position: absolute;

  width:
    370px;

  height:
    370px;

  border-radius:
    50%;

  background:
    var(--surface-container-low);

}


.artwork-label {

  position: absolute;

  top:
    25px;

  left:
    28px;

  color:
    #B0B0B0;

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    14px;

  font-weight:
    600;

}


.pokemon-artwork {

  position: relative;

  z-index: 1;

  width:
    min(70%, 400px);

  max-height:
    420px;

  object-fit:
    contain;

  filter:
    drop-shadow(
      0 18px 18px
      rgba(0, 0, 0, 0.08)
    );

  transition:
    transform 0.3s ease;

}


.main-pokemon-card:hover
.pokemon-artwork {

  transform:
    scale(1.04)
    translateY(-5px);

}


/* ========================================
   PANEL INFORMACIÓN
======================================== */

.information-panel {

  display: flex;

  flex-direction: column;

  gap:
    18px;

}


.info-section {

  padding:
    22px;

  background:
    var(--surface);

  border:
    1px solid var(--border);

  border-radius:
    var(--radius-lg);

}


.section-label {

  display: block;

  margin-bottom:
    12px;

  color:
    var(--primary);

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    11px;

  font-weight:
    700;

  letter-spacing:
    0.1em;

}


/* ========================================
   TIPOS
======================================== */

.types {

  display: flex;

  flex-wrap: wrap;

  gap:
    8px;

}


.type-badge {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  min-width:
    80px;

  padding:
    8px 14px;

  border-radius:
    var(--radius-full);

  color:
    white;

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    12px;

  font-weight:
    600;

}


/* ========================================
   COLORES DE TIPOS
======================================== */

.type-normal {
  background: #A8A77A;
}

.type-fire {
  background: #F08030;
}

.type-water {
  background: #6890F0;
}

.type-electric {
  background: #F8D030;
  color: #2A2A2A;
}

.type-grass {
  background: #78C850;
}

.type-ice {
  background: #98D8D8;
  color: #2A2A2A;
}

.type-fighting {
  background: #C03028;
}

.type-poison {
  background: #A040A0;
}

.type-ground {
  background: #E0C068;
  color: #2A2A2A;
}

.type-flying {
  background: #A890F0;
}

.type-psychic {
  background: #F85888;
}

.type-bug {
  background: #A8B820;
}

.type-rock {
  background: #B8A038;
}

.type-ghost {
  background: #705898;
}

.type-dragon {
  background: #7038F8;
}

.type-dark {
  background: #705848;
}

.type-steel {
  background: #B8B8D0;
  color: #2A2A2A;
}

.type-fairy {
  background: #EE99AC;
}


/* ========================================
   MEDIDAS
======================================== */

.measurements {

  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap:
    12px;

}


.measurement {

  padding:
    15px;

  background:
    var(--surface-container-low);

  border-radius:
    var(--radius);

}


.measurement-label {

  display: block;

  margin-bottom:
    5px;

  color:
    #888;

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    10px;

  font-weight:
    600;

  letter-spacing:
    0.08em;

}


.measurement strong {

  color:
    var(--text);

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    18px;

}


/* ========================================
   HABILIDADES
======================================== */

.abilities {

  display: flex;

  flex-wrap: wrap;

  gap:
    8px;

}


.ability {

  padding:
    8px 11px;

  background:
    var(--surface-container);

  border-radius:
    var(--radius);

  color:
    var(--text);

  font-family:
    'Manrope',
    sans-serif;

  font-size:
    13px;

}


/* ========================================
   ESTADÍSTICAS
======================================== */

.stats-section {

  padding:
    26px;

  margin-bottom:
    30px;

  background:
    var(--surface);

  border:
    1px solid var(--border);

  border-radius:
    var(--radius-lg);

}


.section-heading {

  display: flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    20px;

  margin-bottom:
    25px;

}


.section-heading h2 {

  margin-top:
    2px;

  font-family:
    'Plus Jakarta Sans',
    sans-serif;

  font-size:
    22px;

  font-weight:
    700;

}


.stats-count {

  color:
    #999;

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    11px;

  font-weight:
    600;

}


.stats-list {

  display:
    flex;

  flex-direction:
    column;

  gap:
    17px;

}


.stat-top {

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  margin-bottom:
    7px;

}


.stat-name {

  color:
    var(--text);

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    12px;

  font-weight:
    600;

}


.stat-value {

  color:
    var(--primary);

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    13px;

}


.progress-track {

  width:
    100%;

  height:
    8px;

  overflow:
    hidden;

  border-radius:
    4px;

  background:
    #E0E0E0;

}


.progress-fill {

  height:
    100%;

  border-radius:
    4px;

  background:
    var(--primary);

  transition:
    width 0.5s ease;

}


/* ========================================
   SPRITES
======================================== */

.sprites-section {

  padding:
    26px;

  background:
    var(--surface);

  border:
    1px solid var(--border);

  border-radius:
    var(--radius-lg);

}


.sprites {

  display:
    grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap:
    16px;

}


.sprite-card {

  display:
    flex;

  flex-direction:
    column;

  align-items:
    center;

  justify-content:
    center;

  min-height:
    190px;

  background:
    var(--surface-container-low);

  border-radius:
    var(--radius);

}


.sprite-card span {

  align-self:
    flex-start;

  margin:
    12px 15px 0;

  color:
    #999;

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    10px;

  font-weight:
    600;

  letter-spacing:
    0.08em;

}


.sprite-card img {

  width:
    130px;

  height:
    130px;

  object-fit:
    contain;

}


/* ========================================
   ESTADOS
======================================== */

.state-container {

  display:
    flex;

  flex-direction:
    column;

  align-items:
    center;

  justify-content:
    center;

  min-height:
    450px;

  padding:
    40px;

  text-align:
    center;

  background:
    var(--surface);

  border:
    1px solid var(--border);

  border-radius:
    var(--radius-lg);

  box-shadow:
    var(--shadow-card);

}


.state-container h2 {

  margin:
    15px 0 8px;

}


.state-container p {

  color:
    var(--text-light);

}


.state-icon {

  font-size:
    50px;

}


.loading-spinner {

  width:
    45px;

  height:
    45px;

  border:
    4px solid var(--surface-container);

  border-top-color:
    var(--primary);

  border-radius:
    50%;

  animation:
    spin 0.8s linear infinite;

}


@keyframes spin {

  to {
    transform:
      rotate(360deg);
  }

}


/* ========================================
   BOTÓN PRINCIPAL
======================================== */

.primary-button {

  margin-top:
    20px;

  padding:
    12px 20px;

  border:
    none;

  border-radius:
    var(--radius);

  background:
    var(--primary);

  color:
    white;

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    13px;

  font-weight:
    600;

  cursor:
    pointer;

}


/* ========================================
   TABLET
======================================== */

@media (max-width: 850px) {

  .detail-grid {

    grid-template-columns:
      1fr;

  }


  .main-pokemon-card {

    min-height:
      430px;

  }

}


/* ========================================
   MÓVIL
======================================== */

@media (max-width: 600px) {

  .detail-page {

    padding:
      25px 0 50px;

  }


  .detail-header {

    align-items:
      flex-start;

    flex-direction:
      column;

  }


  .detail-header h1 {

    font-size:
      32px;

    line-height:
      40px;

  }


  .sound-button {

    width:
      100%;

    justify-content:
      center;

  }


  .main-pokemon-card {

    min-height:
      350px;

  }


  .artwork-background {

    width:
      260px;

    height:
      260px;

  }


  .pokemon-artwork {

    width:
      75%;

    max-height:
      300px;

  }


  .measurements {

    grid-template-columns:
      1fr;

  }


  .sprites {

    grid-template-columns:
      1fr;

  }


  .stats-section,
  .sprites-section {

    padding:
      20px;

  }

}

</style>