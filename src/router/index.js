import { createRouter, createWebHistory } from 'vue-router'

import PokemonCatalog from '../views/PokemonCatalog.vue'
import PokemonDetail from '../views/PokemonDetail.vue'
import PokemonRecognition from '../views/PokemonRecognition.vue'

const router = createRouter({

  history: createWebHistory(
    import.meta.env.BASE_URL
  ),

  routes: [

    {
      path: '/pokedex',
      name: 'pokedex',
      component: PokemonCatalog
    },

    {
      path: '/pokemon/:id',
      name: 'pokemon-detail',
      component: PokemonDetail
    },

    {
      path: '/recognition',
      name: 'recognition',
      component: PokemonRecognition
    }

  ]

})

export default router