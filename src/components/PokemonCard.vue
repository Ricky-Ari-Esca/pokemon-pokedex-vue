<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  pokemon: {
    type: Object,
    required: true
  },

  index: {
    type: Number,
    required: true
  }
})

const router = useRouter()


// ========================================
// ID DEL POKÉMON
// ========================================

const pokemonId = computed(() => {

  const parts =
    props.pokemon.url
      .split('/')
      .filter(Boolean)

  return Number(
    parts[parts.length - 1]
  )

})


// ========================================
// IMAGEN
// ========================================

const imageUrl = computed(() => {

  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId.value}.png`

})


// ========================================
// NOMBRE
// ========================================

const formattedName = computed(() => {

  return props.pokemon.name
    .charAt(0)
    .toUpperCase() +
    props.pokemon.name.slice(1)

})


// ========================================
// ID FORMATEADO
// ========================================

const formattedId = computed(() => {

  return `#${String(pokemonId.value).padStart(3, '0')}`

})


// ========================================
// ABRIR DETALLE
// ========================================

function openPokemon() {

  router.push(
    `/pokemon/${pokemonId.value}`
  )

}

</script>


<template>

  <article
    class="pokemon-card"
    @click="openPokemon"
    tabindex="0"
    @keydown.enter="openPokemon"
  >

    <!-- ==================================
         CABECERA DE TARJETA
    =================================== -->

    <div class="card-header">

      <span class="pokemon-number">
        {{ formattedId }}
      </span>

      <span class="card-symbol">
        POKÉDEX
      </span>

    </div>


    <!-- ==================================
         IMAGEN
    =================================== -->

    <div class="image-container">

      <div class="image-background"></div>

      <img
        :src="imageUrl"
        :alt="formattedName"
        class="pokemon-image"
        loading="lazy"
      />

    </div>


    <!-- ==================================
         INFORMACIÓN
    =================================== -->

    <div class="pokemon-info">

      <h2 class="pokemon-name">
        {{ formattedName }}
      </h2>

      <p class="pokemon-label">
        POKÉMON
      </p>

    </div>


    <!-- ==================================
         FOOTER
    =================================== -->

    <div class="card-footer">

      <span>
        VER INFORMACIÓN
      </span>

      <span class="arrow">
        →
      </span>

    </div>

  </article>

</template>


<style scoped>

/* ========================================
   TARJETA
======================================== */

.pokemon-card {

  position: relative;

  min-width: 0;

  padding: 16px;

  background:
    var(--surface);

  border:
    1px solid var(--border);

  border-radius:
    var(--radius-lg);

  box-shadow:
    var(--shadow-card);

  cursor: pointer;

  overflow: hidden;

  outline: none;

  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;

}


/* ========================================
   HOVER
======================================== */

.pokemon-card:hover {

  transform:
    translateY(-6px);

  box-shadow:
    var(--shadow-hover);

  border-color:
    #E3D3D0;

}


/* ========================================
   FOCUS
======================================== */

.pokemon-card:focus-visible {

  border-color:
    var(--primary);

  box-shadow:
    0 0 0 3px
    rgba(188, 1, 0, 0.12);

}


/* ========================================
   CABECERA
======================================== */

.card-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 5px;

}


.pokemon-number {

  color:
    #A5A5A5;

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    12px;

  font-weight:
    600;

  letter-spacing:
    0.05em;

}


.card-symbol {

  color:
    #B0B0B0;

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    9px;

  font-weight:
    600;

  letter-spacing:
    0.08em;

}


/* ========================================
   CONTENEDOR DE IMAGEN
======================================== */

.image-container {

  position: relative;

  display: flex;

  align-items: center;

  justify-content: center;

  height: 210px;

  margin:
    4px 0 8px;

  overflow: hidden;

}


/* ========================================
   FONDO DE IMAGEN
======================================== */

.image-background {

  position: absolute;

  width: 155px;

  height: 155px;

  border-radius:
    50%;

  background:
    var(--surface-low);

  opacity:
    0.8;

}


/* ========================================
   IMAGEN
======================================== */

.pokemon-image {

  position: relative;

  z-index: 1;

  width: 180px;

  height: 180px;

  object-fit: contain;

  transition:
    transform 0.3s ease;

}


/* ========================================
   ANIMACIÓN IMAGEN
======================================== */

.pokemon-card:hover
.pokemon-image {

  transform:
    scale(1.08)
    translateY(-4px);

}


/* ========================================
   INFORMACIÓN
======================================== */

.pokemon-info {

  padding:
    4px 4px 10px;

}


.pokemon-name {

  margin: 0;

  color:
    var(--text);

  font-family:
    'Plus Jakarta Sans',
    sans-serif;

  font-size:
    21px;

  line-height:
    28px;

  font-weight:
    700;

}


.pokemon-label {

  margin-top:
    3px;

  color:
    var(--primary);

  font-family:
    'Space Grotesk',
    sans-serif;

  font-size:
    10px;

  font-weight:
    600;

  letter-spacing:
    0.1em;

}


/* ========================================
   FOOTER
======================================== */

.card-footer {

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding-top:
    12px;

  border-top:
    1px solid var(--border);

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
    0.06em;

}


.arrow {

  display: flex;

  align-items: center;

  justify-content: center;

  width:
    25px;

  height:
    25px;

  border-radius:
    50%;

  background:
    var(--surface-container);

  color:
    var(--text);

  font-size:
    15px;

  transition:
    all 0.2s ease;

}


.pokemon-card:hover
.arrow {

  background:
    var(--primary);

  color:
    white;

  transform:
    translateX(3px);

}


/* ========================================
   TABLET
======================================== */

@media (max-width: 760px) {

  .image-container {

    height:
      180px;

  }


  .pokemon-image {

    width:
      155px;

    height:
      155px;

  }


  .image-background {

    width:
      135px;

    height:
      135px;

  }


  .pokemon-name {

    font-size:
      18px;

    line-height:
      25px;

  }

}


/* ========================================
   MÓVIL
======================================== */

@media (max-width: 480px) {

  .pokemon-card {

    padding:
      14px;

  }


  .image-container {

    height:
      210px;

  }


  .pokemon-image {

    width:
      180px;

    height:
      180px;

  }


  .image-background {

    width:
      150px;

    height:
      150px;

  }

}

</style>