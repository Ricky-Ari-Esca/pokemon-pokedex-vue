const API_URL = 'https://pokeapi.co/api/v2/pokemon'

export async function getPokemonList(offset = 0, limit = 20) {
  const response = await fetch(
    `${API_URL}?offset=${offset}&limit=${limit}`
  )

  if (!response.ok) {
    throw new Error('Error al obtener los Pokémon')
  }

  const data = await response.json()

  return data
}

export async function getPokemonByUrl(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Error al obtener el Pokémon')
  }

  const data = await response.json()

  return data
}

export async function getPokemonByName(name) {
  const response = await fetch(
    `${API_URL}/${name.toLowerCase()}`
  )

  if (!response.ok) {
    throw new Error('Pokémon no encontrado')
  }

  const data = await response.json()

  return data
}