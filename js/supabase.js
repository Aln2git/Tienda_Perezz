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

async function initMenu() {
  const tablaRefrescos = document.getElementById('tbody-refrescos')
  if (!tablaRefrescos) return

  const productos = await cargarProductos()
  llenarTabla(productos, 'Refrescos', 'tbody-refrescos')
  llenarTabla(productos, 'Botanas',   'tbody-botanas')
  llenarTabla(productos, 'Lácteos',  'tbody-lacteos')
}

async function buscarIdProducto(nombre) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/productos?nombre=eq.${encodeURIComponent(nombre)}&select=id_producto`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }
  )
  const data = await response.json()
  return data.length > 0 ? data[0].id_producto : null
}

async function crearVenta() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/ventas`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({})
  })
  const data = await response.json()
  return data[0].id_venta
}

async function insertarDetalleVenta(idVenta, idProducto, cantidad, precioUnitario) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/detalle_ventas`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      id_venta: idVenta,
      id_producto: idProducto,
      cantidad: cantidad,
      precio_unitario: precioUnitario
    })
  })
  return response.ok
}

async function registrarVentaEnSupabase(carrito) {
  const idVenta = await crearVenta()

  for (const item of carrito) {
    const idProducto = await buscarIdProducto(item.nombre)

    if (!idProducto) {
      console.warn(`No se encontró el producto "${item.nombre}" en la base de datos`)
      continue
    }

    await insertarDetalleVenta(idVenta, idProducto, item.cantidad, item.precio)
  }

  return idVenta
}

document.addEventListener('DOMContentLoaded', initMenu)
