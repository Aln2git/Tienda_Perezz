function obtenerCarrito() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarContador() {
  const carrito = obtenerCarrito();
  const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  let contador = document.getElementById('carrito-contador');
  const linkCarrito = document.querySelector('a[href="carrito.html"]');

  if (!linkCarrito) return;

  if (!contador) {
    contador = document.createElement('span');
    contador.id = 'carrito-contador';
    contador.style.cssText = `
      background: #ff6a00;
      color: white;
      border-radius: 50%;
      padding: 2px 7px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 4px;
      vertical-align: middle;
    `;
    linkCarrito.appendChild(contador);
  }

  contador.textContent = total > 0 ? total : '';
  contador.style.display = total > 0 ? 'inline' : 'none';
}

function leerDatosProducto(btn) {
  const tarjeta = btn.closest('.producto');
  if (tarjeta) {
    const nombre = tarjeta.querySelector('h3').textContent.trim();
    const precioTexto = tarjeta.querySelector('.precio').textContent.trim();
    const precio = parseFloat(precioTexto.replace('$', '').replace(',', ''));
    const img = tarjeta.querySelector('img').getAttribute('src');
    return { nombre, precio, img };
  }

  const fila = btn.closest('tr');
  if (fila) {
    const celdas = fila.querySelectorAll('td');
    const nombre = celdas[0].textContent.trim();
    const precioTexto = celdas[2].textContent.trim();
    const precio = parseFloat(precioTexto.replace('$', '').replace(',', ''));
    const img = '';
    return { nombre, precio, img };
  }

  return null;
}

function inicializarBotonesAgregar() {
  const botones = document.querySelectorAll('.btn-agregar');

  botones.forEach(btn => {
    btn.addEventListener('click', () => {
      const datos = leerDatosProducto(btn);
      if (!datos) return;

      const { nombre, precio, img } = datos;

      const carrito = obtenerCarrito();
      const existente = carrito.find(p => p.nombre === nombre);

      if (existente) {
        existente.cantidad++;
      } else {
        carrito.push({ nombre, precio, img, cantidad: 1 });
      }

      guardarCarrito(carrito);
      actualizarContador();
      mostrarToast(`"${nombre}" agregado al carrito 🛒`);
    });
  });
}

function mostrarToast(mensaje) {
  let toast = document.getElementById('toast-carrito');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-carrito';
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #0f2a57;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: 'Trebuchet MS', sans-serif;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = mensaje;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2500);
}

function renderizarCarrito() {
  const contenedor = document.getElementById('carrito-contenido');
  if (!contenedor) return;

  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <p>Tu carrito está vacío.</p>
        <a href="index.html" class="btn-principal" style="display:inline-block;padding:12px 25px;background:#ff6a00;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">
          Ver productos
        </a>
      </div>
    `;
    actualizarResumen(0, 0);
    return;
  }

  let filas = carrito.map((item, i) => `
    <tr>
      <td>${item.img ? `<img src="${item.img}" alt="${item.nombre}">` : ''}</td>
      <td>${item.nombre}</td>
      <td class="precio-col">$${item.precio.toFixed(2)}</td>
      <td>
        <div class="carrito-cantidad">
          <button onclick="cambiarCantidad(${i}, -1)">−</button>
          <span>${item.cantidad}</span>
          <button onclick="cambiarCantidad(${i}, 1)">+</button>
        </div>
      </td>
      <td class="precio-col">$${(item.precio * item.cantidad).toFixed(2)}</td>
      <td><button class="btn-eliminar" onclick="eliminarProducto(${i})">Eliminar</button></td>
    </tr>
  `).join('');

  contenedor.innerHTML = `
    <table class="carrito-tabla">
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Producto</th>
          <th>Precio</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        ${filas}
      </tbody>
    </table>
  `;

  const subtotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const envio = subtotal > 0 ? 30 : 0;
  actualizarResumen(subtotal, envio);
}

function actualizarResumen(subtotal, envio) {
  const elSub = document.getElementById('resumen-subtotal');
  const elEnv = document.getElementById('resumen-envio');
  const elTot = document.getElementById('resumen-total');

  if (elSub) elSub.textContent = `$${subtotal.toFixed(2)}`;
  if (elEnv) elEnv.textContent = envio > 0 ? `$${envio.toFixed(2)}` : 'Gratis';
  if (elTot) elTot.textContent = `$${(subtotal + envio).toFixed(2)}`;
}

function cambiarCantidad(index, delta) {
  const carrito = obtenerCarrito();
  carrito[index].cantidad += delta;
  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }
  guardarCarrito(carrito);
  actualizarContador();
  renderizarCarrito();
}

function eliminarProducto(index) {
  const carrito = obtenerCarrito();
  carrito.splice(index, 1);
  guardarCarrito(carrito);
  actualizarContador();
  renderizarCarrito();
}

function vaciarCarrito() {
  if (confirm('¿Seguro que quieres vaciar el carrito?')) {
    guardarCarrito([]);
    actualizarContador();
    renderizarCarrito();
  }
}

async function procesarPago() {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  try {
    await registrarVentaEnSupabase(carrito);
    alert('¡Gracias por tu compra! Tu pedido ha sido recibido.');
    guardarCarrito([]);
    actualizarContador();
    renderizarCarrito();
  } catch (error) {
    console.error('Error al registrar la venta:', error);
    alert('Hubo un problema al procesar tu compra. Intenta de nuevo.');
  }
}
