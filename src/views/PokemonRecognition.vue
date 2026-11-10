```vue
<template>
  <section class="recognition-page">
    <!-- ============================================================
         ENCABEZADO
         ============================================================ -->

    <div class="header">
      <p class="eyebrow">POKÉDEX AI</p>

      <h1>Reconocimiento Pokémon</h1>

      <p class="description">
        Coloca una imagen o Pokémon frente a la cámara. La inteligencia artificial lo identificará
        automáticamente.
      </p>
    </div>

    <!-- ============================================================
         CONTENEDOR PRINCIPAL
         ============================================================ -->

    <div class="recognition-container">
      <!-- ==========================================================
           CÁMARA
           ========================================================== -->

      <div class="camera-card">
        <div class="camera-header">
          <div class="camera-title">
            <span class="status-dot"></span>

            <span> CÁMARA ACTIVA </span>
          </div>

          <span class="camera-status">
            <span v-if="!videoReady"> INICIANDO... </span>

            <span v-else> ESCANEANDO </span>
          </span>
        </div>

        <!-- ========================================================
             VIDEO
             ======================================================== -->

        <div class="camera-wrapper">
          <video ref="video" autoplay playsinline muted class="camera"></video>

          <!-- MARCO DE ESCANEO -->

          <div class="scan-frame">
            <span class="corner top-left"></span>

            <span class="corner top-right"></span>

            <span class="corner bottom-left"></span>

            <span class="corner bottom-right"></span>
          </div>

          <!-- CARGANDO -->

          <div v-if="!videoReady" class="camera-loading">
            <div class="loader"></div>

            <span> INICIANDO CÁMARA... </span>
          </div>
        </div>

        <!-- ========================================================
             ESTADO AUTOMÁTICO
             ======================================================== -->

        <div class="automatic-status">
          <span class="automatic-icon"> AI </span>

          <div>
            <strong> Reconocimiento automático </strong>

            <p>La inteligencia artificial analiza la imagen continuamente.</p>
          </div>
        </div>

        <p class="camera-help">
          Coloca una imagen de Pikachu, Charmander o Squirtle frente a la cámara.
        </p>
      </div>

      <!-- ==========================================================
           RESULTADO
           ========================================================== -->

      <div class="result-card">
        <div class="result-header">
          <span class="result-label"> RESULTADO </span>

          <span class="ai-label"> AI </span>
        </div>

        <!-- ========================================================
             BUSCANDO
             ======================================================== -->

        <div v-if="!prediction" class="empty-result">
          <div class="pokeball-icon">
            <div class="pokeball-top"></div>

            <div class="pokeball-middle"></div>

            <div class="pokeball-center"></div>
          </div>

          <h2>Buscando Pokémon...</h2>

          <p>
            Coloca una imagen frente a la cámara. La IA analizará automáticamente lo que aparece.
          </p>

          <div class="search-status">
            <span class="pulse"></span>

            Escaneo automático activo
          </div>
        </div>

        <!-- ========================================================
             POKÉMON DETECTADO
             ======================================================== -->

        <div v-else class="pokemon-result">
          <!-- IMAGEN DEL POKÉMON -->

          <div class="pokemon-image-container">
            <img :src="prediction.image" :alt="prediction.name" class="pokemon-image" />
          </div>

          <!-- TEXTO -->

          <p class="recognized-label">POKÉMON RECONOCIDO</p>

          <h2>
            {{ prediction.name }}
          </h2>

          <!-- ======================================================
               CONFIANZA
               ====================================================== -->

          <div class="confidence-container">
            <div class="confidence-header">
              <span> CONFIANZA </span>

              <strong> {{ prediction.confidence }}% </strong>
            </div>

            <div class="confidence-bar">
              <div
                class="confidence-progress"
                :style="{
                  width: prediction.confidence + '%',
                }"
              ></div>
            </div>
          </div>

          <!-- ======================================================
               BOTÓN POKÉDEX
               ====================================================== -->

          <button class="view-button" @click="goToPokemon(prediction.id)">VER EN LA POKÉDEX</button>

          <div class="detected-status">
            <span class="detected-dot"></span>

            Reconocimiento automático activo
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         INFORMACIÓN
         ============================================================ -->

    <div class="info-section">
      <div class="info-card">
        <span class="info-number"> 01 </span>

        <div>
          <h3>Muestra la imagen</h3>

          <p>Coloca una imagen de Pokémon frente a la cámara.</p>
        </div>
      </div>

      <div class="info-card">
        <span class="info-number"> 02 </span>

        <div>
          <h3>La IA analiza</h3>

          <p>El modelo analiza automáticamente la imagen.</p>
        </div>
      </div>

      <div class="info-card">
        <span class="info-number"> 03 </span>

        <div>
          <h3>Resultado</h3>

          <p>El Pokémon detectado aparece automáticamente.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/*
=====================================================================
 IMPORTACIONES
=====================================================================

 Vue:
 Maneja el componente y las variables reactivas.

 Vue Router:
 Permite navegar hacia la información del Pokémon.

 TensorFlow.js:
 Motor utilizado por el modelo de inteligencia artificial.

 Teachable Machine:
 Permite utilizar el modelo entrenado.
=====================================================================
*/

import { ref, onMounted, onBeforeUnmount } from "vue";

import { useRouter } from "vue-router";

import * as tf from "@tensorflow/tfjs";

import "@tensorflow/tfjs-backend-webgl";

import * as tmImage from "@teachablemachine/image";

/*
=====================================================================
 MODELO DE TEACHABLE MACHINE
=====================================================================

 Modelo proporcionado:

 https://teachablemachine.withgoogle.com/models/51Qh2ezNY/
=====================================================================
*/

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/51Qh2ezNY/";

/*
=====================================================================
 CONFIANZA MÍNIMA
=====================================================================

 El modelo debe tener al menos 60% de confianza
 para mostrar un Pokémon.
=====================================================================
*/

const MIN_CONFIDENCE = 0.6;

/*
=====================================================================
 POKÉMON COMPATIBLES
=====================================================================

 Pikachu = 25
 Charmander = 4
 Squirtle = 7

 La clase "Otro" se ignora.
=====================================================================
*/

const pokemonIds = {
  pikachu: 25,

  charmander: 4,

  squirtle: 7,
};

/*
=====================================================================
 VARIABLES
=====================================================================
*/

const router = useRouter();

const video = ref(null);

const model = ref(null);

const videoReady = ref(false);

const analyzing = ref(false);

const hasAnalyzed = ref(false);

const prediction = ref(null);

/*
=====================================================================
 INTERVALO AUTOMÁTICO
=====================================================================
*/

let recognitionInterval = null;

/*
=====================================================================
 NORMALIZAR NOMBRE
=====================================================================
*/

function normalizeName(name) {
  return String(name || "")
    .trim()
    .toLowerCase();
}

/*
=====================================================================
 INICIALIZAR TENSORFLOW
=====================================================================

 IMPORTANTE:

 Se eliminaron todos los console.log y console.error.

 El usuario no verá información técnica
 en la consola del navegador.
=====================================================================
*/

async function initializeTensorFlow() {
  try {
    /*
     Intentar utilizar WebGL.
    */

    try {
      await tf.setBackend("webgl");
    } catch {
      /*
       Si WebGL no funciona,
       utilizar CPU.
      */

      await tf.setBackend("cpu");
    }

    /*
     Esperar TensorFlow.
    */

    await tf.ready();
  } catch {
    /*
     No mostrar errores en consola.
    */
  }
}

/*
=====================================================================
 CARGAR MODELO
=====================================================================
*/

async function loadModel() {
  try {
    /*
     Inicializar TensorFlow.
    */

    await initializeTensorFlow();

    /*
     Cargar modelo directamente
     desde Teachable Machine.
    */

    model.value = await tmImage.load(
      MODEL_URL + "model.json",

      MODEL_URL + "metadata.json",
    );
  } catch {
    /*
     Si no se puede cargar el modelo,
     dejamos model en null.
    */

    model.value = null;
  }
}

/*
=====================================================================
 INICIAR CÁMARA
=====================================================================
*/

async function startCamera() {
  try {
    /*
     Verificar compatibilidad.
    */

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return;
    }

    /*
     Solicitar cámara.
    */

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",

        width: {
          ideal: 640,
        },

        height: {
          ideal: 480,
        },
      },

      audio: false,
    });

    /*
     Comprobar video.
    */

    if (!video.value) {
      return;
    }

    /*
     Conectar cámara.
    */

    video.value.srcObject = stream;

    /*
     Esperar a que cargue.
    */

    await new Promise((resolve) => {
      if (video.value.readyState >= 2) {
        resolve();
      } else {
        video.value.onloadedmetadata = resolve;
      }
    });

    /*
     Reproducir.
    */

    await video.value.play();

    /*
     Cámara lista.
    */

    videoReady.value = true;
  } catch {
    videoReady.value = false;
  }
}

/*
=====================================================================
 ANALIZAR POKÉMON
=====================================================================

 Esta función se ejecuta automáticamente.

 NO necesita botón.
=====================================================================
*/

async function analyzePokemon() {
  /*
   Verificar requisitos.
  */

  if (!model.value || !video.value || !videoReady.value || analyzing.value) {
    return;
  }

  /*
   Activar análisis.
  */

  analyzing.value = true;

  try {
    /*
     Obtener predicciones.
    */

    const predictions = await model.value.predict(video.value, false);

    /*
     Verificar resultados.
    */

    if (!predictions || predictions.length === 0) {
      return;
    }

    /*
     Ordenar resultados.
    */

    const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);

    /*
     Obtener mejor resultado.
    */

    const bestPrediction = sortedPredictions[0];

    /*
     Normalizar nombre.
    */

    const pokemonName = normalizeName(bestPrediction.className);

    /*
     Obtener confianza.
    */

    const confidence = Number(bestPrediction.probability);

    /*
     Obtener ID.
    */

    const pokemonId = pokemonIds[pokemonName];

    /*
     ================================================================
     IGNORAR "OTRO"
     ================================================================
    */

    if (!pokemonId) {
      prediction.value = null;

      return;
    }

    /*
     ================================================================
     CONFIRMACIÓN MÍNIMA
     ================================================================
    */

    if (confidence < MIN_CONFIDENCE) {
      prediction.value = null;

      return;
    }

    /*
     ================================================================
     GUARDAR RESULTADO
     ================================================================
    */

    prediction.value = {
      name: bestPrediction.className,

      id: pokemonId,

      confidence: Math.round(confidence * 100),

      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
    };

    hasAnalyzed.value = true;
  } catch {
    /*
     No mostramos errores
     en la consola.
    */
  } finally {
    analyzing.value = false;
  }
}

/*
=====================================================================
 RECONOCIMIENTO AUTOMÁTICO
=====================================================================

 Se ejecuta cada 300 milisegundos.

 Aproximadamente:

 3 análisis por segundo.
=====================================================================
*/

function startAutomaticRecognition() {
  /*
   Evitar duplicar intervalos.
  */

  if (recognitionInterval) {
    clearInterval(recognitionInterval);
  }

  /*
   Crear intervalo.
  */

  recognitionInterval = setInterval(
    () => {
      analyzePokemon();
    },

    300,
  );
}

/*
=====================================================================
 DETENER RECONOCIMIENTO
=====================================================================
*/

function stopAutomaticRecognition() {
  if (recognitionInterval) {
    clearInterval(recognitionInterval);

    recognitionInterval = null;
  }
}

/*
=====================================================================
 DETENER CÁMARA
=====================================================================
*/

function stopCamera() {
  if (video.value && video.value.srcObject) {
    video.value.srcObject.getTracks().forEach((track) => {
      track.stop();
    });

    video.value.srcObject = null;

    videoReady.value = false;
  }
}

/*
=====================================================================
 IR A POKÉDEX
=====================================================================
*/

function goToPokemon(id) {
  router.push(`/pokemon/${id}`);
}

/*
=====================================================================
 INICIAR COMPONENTE
=====================================================================

 Al abrir la página:

 1. Se carga TensorFlow.
 2. Se carga el modelo.
 3. Se inicia la cámara.
 4. Se inicia el reconocimiento automático.
=====================================================================
*/

onMounted(async () => {
  await loadModel();

  await startCamera();

  /*
     Comenzar reconocimiento
     automáticamente.
    */

  if (model.value && videoReady.value) {
    startAutomaticRecognition();
  }
});

/*
=====================================================================
 CERRAR COMPONENTE
=====================================================================

 Detener cámara y reconocimiento.
=====================================================================
*/

onBeforeUnmount(() => {
  stopAutomaticRecognition();

  stopCamera();
});
</script>

<style scoped>
/* ================================================================
   PÁGINA
   ================================================================ */

.recognition-page {
  min-height: 100vh;

  padding: 48px 6%;

  background: #f8f8f6;

  color: #171717;

  font-family: Arial, sans-serif;
}

/* ================================================================
   HEADER
   ================================================================ */

.header {
  max-width: 1200px;

  margin: 0 auto 40px;
}

.eyebrow {
  margin: 0 0 8px;

  color: #e33535;

  font-size: 12px;

  font-weight: 800;

  letter-spacing: 2px;
}

.header h1 {
  margin: 0;

  font-size: clamp(32px, 5vw, 54px);

  line-height: 1;
}

.description {
  max-width: 650px;

  margin-top: 16px;

  color: #888888;

  font-size: 14px;

  line-height: 1.6;
}

/* ================================================================
   CONTENEDOR
   ================================================================ */

.recognition-container {
  max-width: 1200px;

  margin: 0 auto;

  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 20px;
}

/* ================================================================
   TARJETAS
   ================================================================ */

.camera-card,
.result-card {
  overflow: hidden;

  border: 1px solid #e7e7e4;

  border-radius: 20px;

  background: #ffffff;
}

.camera-card {
  padding: 24px;
}

/* ================================================================
   HEADER CÁMARA
   ================================================================ */

.camera-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 18px;
}

.camera-title {
  display: flex;

  align-items: center;

  gap: 8px;

  font-size: 11px;

  font-weight: 800;
}

.status-dot {
  width: 8px;

  height: 8px;

  border-radius: 50%;

  background: #42c767;
}

.camera-status {
  color: #999999;

  font-size: 10px;

  font-weight: 700;
}

/* ================================================================
   VIDEO
   ================================================================ */

.camera-wrapper {
  position: relative;

  overflow: hidden;

  width: 100%;

  aspect-ratio: 4 / 3;

  border-radius: 14px;

  background: #111111;
}

.camera {
  width: 100%;

  height: 100%;

  display: block;

  object-fit: cover;

  transform: scaleX(-1);
}

/* ================================================================
   CARGANDO
   ================================================================ */

.camera-loading {
  position: absolute;

  inset: 0;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 12px;

  background: #111111;

  color: #ffffff;

  font-size: 11px;

  font-weight: 800;
}

.loader {
  width: 32px;

  height: 32px;

  border: 3px solid rgba(255, 255, 255, 0.3);

  border-top-color: #ffffff;

  border-radius: 50%;

  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ================================================================
   ESTADO AUTOMÁTICO
   ================================================================ */

.automatic-status {
  display: flex;

  align-items: center;

  gap: 12px;

  margin-top: 18px;

  padding: 13px;

  border: 1px solid #eeeeeb;

  border-radius: 11px;

  background: #fafaf8;
}

.automatic-icon {
  width: 32px;

  height: 32px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 8px;

  background: #e33535;

  color: #ffffff;

  font-size: 9px;

  font-weight: 900;
}

.automatic-status strong {
  display: block;

  margin-bottom: 3px;

  font-size: 11px;
}

.automatic-status p {
  margin: 0;

  color: #999999;

  font-size: 10px;
}

.camera-help {
  margin: 13px 0 0;

  color: #999999;

  text-align: center;

  font-size: 11px;
}

/* ================================================================
   RESULTADO
   ================================================================ */

.result-card {
  min-height: 500px;

  padding: 24px;

  display: flex;

  flex-direction: column;
}

.result-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  padding-bottom: 18px;

  border-bottom: 1px solid #eeeeeb;
}

.result-label {
  font-size: 11px;

  font-weight: 800;

  letter-spacing: 1.5px;
}

.ai-label {
  padding: 5px 8px;

  border-radius: 6px;

  background: #f2f2f0;

  color: #777777;

  font-size: 9px;

  font-weight: 800;
}

/* ================================================================
   SIN RESULTADO
   ================================================================ */

.empty-result {
  flex: 1;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  padding: 30px;

  text-align: center;
}

.empty-result h2 {
  margin: 20px 0 10px;

  font-size: 22px;
}

.empty-result p {
  max-width: 340px;

  margin: 0;

  color: #888888;

  font-size: 13px;

  line-height: 1.6;
}

/* ================================================================
   POKÉBALL
   ================================================================ */

.pokeball-icon {
  position: relative;

  width: 82px;

  height: 82px;

  overflow: hidden;

  border: 4px solid #222222;

  border-radius: 50%;

  background: #ffffff;
}

.pokeball-top {
  position: absolute;

  top: 0;

  left: 0;

  width: 100%;

  height: 50%;

  background: #e33535;
}

.pokeball-middle {
  position: absolute;

  top: calc(50% - 3px);

  width: 100%;

  height: 6px;

  background: #222222;
}

.pokeball-center {
  position: absolute;

  top: 50%;

  left: 50%;

  width: 22px;

  height: 22px;

  transform: translate(-50%, -50%);

  border: 4px solid #222222;

  border-radius: 50%;

  background: #ffffff;
}

/* ================================================================
   ESTADO DE BÚSQUEDA
   ================================================================ */

.search-status {
  display: flex;

  align-items: center;

  gap: 7px;

  margin-top: 22px;

  color: #888888;

  font-size: 10px;

  font-weight: 700;
}

.pulse {
  width: 7px;

  height: 7px;

  border-radius: 50%;

  background: #42c767;

  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.35;

    transform: scale(0.8);
  }

  50% {
    opacity: 1;

    transform: scale(1);
  }
}

/* ================================================================
   POKÉMON DETECTADO
   ================================================================ */

.pokemon-result {
  flex: 1;

  display: flex;

  flex-direction: column;

  align-items: center;

  padding-top: 20px;

  text-align: center;
}

.pokemon-image-container {
  width: 190px;

  height: 190px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 50%;

  background: #f5f5f2;
}

.pokemon-image {
  width: 165px;

  height: 165px;

  object-fit: contain;
}

.recognized-label {
  margin: 12px 0 5px;

  color: #e33535;

  font-size: 9px;

  font-weight: 800;

  letter-spacing: 1.5px;
}

.pokemon-result h2 {
  margin: 0;

  font-size: 30px;

  text-transform: capitalize;
}

/* ================================================================
   CONFIANZA
   ================================================================ */

.confidence-container {
  width: 100%;

  margin-top: 24px;
}

.confidence-header {
  display: flex;

  justify-content: space-between;

  margin-bottom: 8px;

  color: #777777;

  font-size: 10px;

  font-weight: 800;
}

.confidence-bar {
  width: 100%;

  height: 8px;

  overflow: hidden;

  border-radius: 20px;

  background: #eeeeeb;
}

.confidence-progress {
  height: 100%;

  border-radius: inherit;

  background: #e33535;

  transition: width 0.3s ease;
}

/* ================================================================
   BOTÓN POKÉDEX
   ================================================================ */

.view-button {
  width: 100%;

  margin-top: 22px;

  padding: 13px;

  border: 1px solid #ddddda;

  border-radius: 10px;

  background: #ffffff;

  color: #222222;

  font-size: 12px;

  font-weight: 800;

  cursor: pointer;
}

.view-button:hover {
  background: #f5f5f2;
}

/* ================================================================
   ESTADO DETECTADO
   ================================================================ */

.detected-status {
  display: flex;

  align-items: center;

  gap: 7px;

  margin-top: 15px;

  color: #888888;

  font-size: 10px;
}

.detected-dot {
  width: 7px;

  height: 7px;

  border-radius: 50%;

  background: #42c767;
}

/* ================================================================
   INFORMACIÓN
   ================================================================ */

.info-section {
  max-width: 1200px;

  margin: 24px auto 0;

  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 14px;
}

.info-card {
  display: flex;

  gap: 14px;

  padding: 18px;

  border: 1px solid #e7e7e4;

  border-radius: 16px;

  background: #ffffff;
}

.info-number {
  color: #e33535;

  font-size: 13px;

  font-weight: 800;
}

.info-card h3 {
  margin: 0 0 5px;

  font-size: 13px;
}

.info-card p {
  margin: 0;

  color: #999999;

  font-size: 11px;

  line-height: 1.5;
}

/* ================================================================
   RESPONSIVE
   ================================================================ */

@media (max-width: 900px) {
  .recognition-container {
    grid-template-columns: 1fr;
  }

  .info-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .recognition-page {
    padding: 30px 16px;
  }

  .header h1 {
    font-size: 36px;
  }

  .pokemon-image-container {
    width: 160px;

    height: 160px;
  }

  .pokemon-image {
    width: 140px;

    height: 140px;
  }
}
</style>
```
