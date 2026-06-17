const SUPABASE_URL = 'https://owszpfvusbsltswwqtzk.supabase.co'
const SUPABASE_KEY = 'sb_publishable_QNUZyL0NmiYtllx-rHpf7A_HHEJ_UYi'

async function cargarProductos() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/productos?select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  })
  return await response.json()
}

async function llenarTabla(productos, categoria, tbodyId) {
  const tbody = document.getElementById(tbodyId)
  tbody.innerHTML = ''

  const filtrados = productos.filter(p => p.categoria === categoria)

  filtrados.forEach(p => {
    const fila = document.createElement('tr')
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.descripcion}</td>
      <td class="precio-col">$${p.precio}</td>
      <td><button class="btn-agregar">Agregar</button></td>
    `
    tbody.appendChild(fila)
  })
}

async function init() {
  const productos = await cargarProductos()
  llenarTabla(productos, 'Refrescos', 'tbody-refrescos')
  llenarTabla(productos, 'Botanas',   'tbody-botanas')
  llenarTabla(productos, 'Lácteos',  'tbody-lacteos')
}

init()
