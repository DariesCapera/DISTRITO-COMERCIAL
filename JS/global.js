const $categoryButtons = document.getElementById('category-buttons');
let selectedCategory = 'TODOS';
let allProductsByCategory = {};

const $searchInput = document.getElementById('search-input');
let searchTerm = '';

let currentProductIndex = null;

const $nav = document.querySelector("nav");
const $openNav = document.querySelector(".open-nav");
const $closeNav = document.querySelector(".close-nav");
const $closeViewProduct = document.querySelector(".close-v-product");
const $viewProduct = document.getElementById("v-product");

const listProductHTML = document.querySelector('.listProduct');
const listCartHTML = document.querySelector('.listCart');
const iconCart = document.querySelector('.icon-cart');
const iconCartSpan = document.querySelector('.icon-cart span');
const body = document.querySelector('body');
const closeCart = document.querySelector('.close');
const $cleanCart = document.querySelector('.clean');
const $btnBuy = document.querySelector('.buy');

let products = [];
let cart = [];

const cleanImagePath = (path) => path ? path.trim() : '';

$openNav.addEventListener("click", () => $nav.style.display = "flex");
$closeNav.addEventListener("click", () => $nav.style.display = "none");
$closeViewProduct.addEventListener("click", () => $viewProduct.style.display = "none");

iconCart.addEventListener('click', () => body.classList.toggle('showCart'));
closeCart.addEventListener('click', () => body.classList.toggle('showCart'));
$cleanCart.addEventListener('click', () => {
  cart = [];
  addCartToHTML();
  localStorage.removeItem('cart');
});

$btnBuy.addEventListener("click", () => {
  let total = document.querySelector('.cart-total strong').innerText;
  let mensaje = `Hola DISTRITO COMERCIAL!, quiero hacer un pedido:\n\n`;

  cart.forEach((item) => {
    // Usar el product_id como índice, no como valor de búsqueda
    mensaje += `- ${products[item.product_id - 1].name} - $${products[item.product_id - 1].price.toFixed(3)} x ${item.quantity} = ${(products[item.product_id - 1].price.toFixed(3) * item.quantity).toFixed(3)}\n`;
  });
  mensaje += `\n*${total}*`;

  const urlWhatsApp = `https://wa.me/573222887148?text=${encodeURIComponent(mensaje)}`;
  window.open(urlWhatsApp, "_blank");
});

const renderCategoryButtons = () => {
  $categoryButtons.innerHTML = '';

  const categories = ['TODOS', ...Object.keys(allProductsByCategory)];

  categories.forEach(category => {
    const btn = document.createElement('button');
    btn.textContent = category;
    btn.classList.add('button2');
    if (category === selectedCategory) btn.classList.add('active');
    btn.addEventListener('click', () => {
      selectedCategory = category;
      renderCategoryButtons();
      addDataToHTML();
    });
    $categoryButtons.appendChild(btn);
  });
};

const normalizeText = (text) => {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const addDataToHTML = () => {
  listProductHTML.innerHTML = '';

  const baseList = selectedCategory === 'TODOS'
    ? Object.values(allProductsByCategory).flat()
    : allProductsByCategory[selectedCategory] || [];

  const filteredList = baseList.filter(product =>
    normalizeText(product.name).includes(normalizeText(searchTerm))
  );

  if (filteredList.length > 0) {
    const fragment = document.createDocumentFragment();

    filteredList.forEach((product, index) => {
      const newProduct = document.createElement('div');
      newProduct.dataset.id = products.indexOf(product);
      newProduct.classList.add('item', 'flex-column');
      newProduct.innerHTML = `
        <img src=".${cleanImagePath(product.images[0])}" alt="${product.name}">
        <h5 class="product-name">${product.name}</h5>
        <h5 class="price">$${product.price.toFixed(3)}</h5>
        <div class="flex-row">
          <button class="addCart button1">Agregar</button>
        </div>`;

      fragment.appendChild(newProduct);

      newProduct.addEventListener('click', (e) => {
        if (e.target.closest('.addCart')) return;

        const imagesContainer = $viewProduct.querySelector('.images');
        imagesContainer.innerHTML = '';
        product.images.forEach(imgPath => {
          const img = document.createElement('img');
          img.src = `.${cleanImagePath(imgPath)}`;
          img.alt = product.name;
          imagesContainer.appendChild(img);
        });

        $viewProduct.querySelector('.name').textContent = product.name;
        $viewProduct.querySelector('.details').innerHTML = product.details.replace(/\n/g, '<br>');
        $viewProduct.style.display = "flex";
        currentProductIndex = products.indexOf(product);
      });
    });

    listProductHTML.appendChild(fragment);
  }
};

$searchInput?.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  addDataToHTML();
});




listProductHTML.addEventListener('click', (event) => {
  if (event.target.classList.contains('addCart')) {
    const product_id = event.target.closest('.item').dataset.id;
    addToCart(product_id);
    animateCartIcon();
  }
});

document.querySelector('#v-product .addCart').addEventListener('click', () => {
  if (currentProductIndex !== null) {
    addToCart(currentProductIndex);
    animateCartIcon();
  }
});

const addToCart = (product_id) => {
  const index = cart.findIndex(item => item.product_id == product_id);
  if (index === -1) {
    cart.push({ product_id, quantity: 1 });
  } else {
    cart[index].quantity++;
  }
  addCartToHTML();
  addCartToMemory();
};

const addCartToMemory = () => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

const addCartToHTML = () => {
  listCartHTML.innerHTML = '';
  let totalQuantity = 0;
  let totalPrice = 0;
  const fragment = document.createDocumentFragment();

  cart.forEach(item => {
    const product = products[item.product_id];
    if (!product) return;

    const itemTotal = product.price * item.quantity;
    totalQuantity += item.quantity;
    totalPrice += itemTotal;

    const newItem = document.createElement('div');
    newItem.classList.add('item', 'flex-row');
    newItem.dataset.id = item.product_id;
    newItem.innerHTML = `
      <div class="image flex-row">
        <img src=".${cleanImagePath(product.images[0])}" alt="${product.name}">
      </div>
      <div class="name">${product.name}</div>
      <div class="totalPrice">$${itemTotal.toFixed(3)}</div>
      <div class="quantity flex-row">
        <span><i class="bi bi-dash minus"></i></span>
        <span>${item.quantity}</span>
        <span><i class="bi bi-plus plus"></i></span>
      </div>`;
    fragment.appendChild(newItem);
  });

  listCartHTML.appendChild(fragment);

  const totalSection = document.createElement('div');
  totalSection.classList.add('cart-total');
  totalSection.innerHTML = `<strong>Total: $${totalPrice.toFixed(3)}</strong>`;
  listCartHTML.appendChild(totalSection);
  iconCartSpan.innerText = totalQuantity;
};

listCartHTML.addEventListener('click', (event) => {
  const isMinus = event.target.classList.contains('minus');
  const isPlus = event.target.classList.contains('plus');
  if (!isMinus && !isPlus) return;
  const product_id = event.target.closest('.item').dataset.id;
  const type = isMinus ? 'minus' : 'plus';
  changeQuantityCart(product_id, type);
});

const changeQuantityCart = (product_id, type) => {
  const index = cart.findIndex(item => item.product_id == product_id);
  if (index === -1) return;
  if (type === 'plus') {
    cart[index].quantity++;
  } else if (type === 'minus') {
    cart[index].quantity--;
    if (cart[index].quantity === 0) cart.splice(index, 1);
  }
  addCartToHTML();
  addCartToMemory();
};

const animateCartIcon = () => {
  iconCart.classList.add('animate-cart');
  setTimeout(() => iconCart.classList.remove('animate-cart'), 300);
};

const initApp = () => {
  fetch('./JSON/products.json')
    .then(response => response.json())
    .then(data => {
      allProductsByCategory = data;
      products = Object.values(data).flat();
      renderCategoryButtons();
      addDataToHTML();

      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        cart = JSON.parse(storedCart);
        addCartToHTML();
      }
    })
    .catch(error => console.error('Error cargando productos:', error));
};


window.addEventListener('DOMContentLoaded', initApp);

// Modal de imagen
const $imgModal = document.getElementById('image-modal');
const $modalImg = $imgModal?.querySelector('img');
const $closeModal = $imgModal?.querySelector('.close-modal');

$viewProduct.querySelector('.images').addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG') {
    $modalImg.src = e.target.src;
    $imgModal.style.display = 'flex';
  }
});

$closeModal?.addEventListener('click', () => $imgModal.style.display = 'none');
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $imgModal.style.display = 'none';
});
$imgModal?.addEventListener('click', (e) => {
  if (e.target === $imgModal) $imgModal.style.display = 'none';
});
