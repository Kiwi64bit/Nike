// Utility
function closestSibling(element, selector) {
    let relative = element?.parentElement?.querySelector(selector);
    return relative;
}

function closestDescendant(element, selector) {
    if (element.matches(selector)) {
        return element;
    }
    return element.querySelector(selector);
}

function transferClass(element, className) {
    let currentActive = closestSibling(element, `.${className}`);
    currentActive?.classList.remove(className);
    element?.classList.add(className);
}

function onNextFrame(callback) {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            callback.apply(this);
        });
    });
}

function deepEquality(obj1 = null, obj2 = null, exceptions = null) {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 === null || obj2 === null) {
        return false;
    }

    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj1);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (exceptions && exceptions.includes(key)) continue;
        if (!keys2.includes(key) || !deepEquality(obj1[key], obj2[key])) return false;
    }

    return true;
}

function getProductData(btnElement) {
    let productCard = btnElement.closest(`.product-card[data-id]`);
    let productId = productCard.dataset.id;
    let productSize = productCard.querySelector(".indicator-size.active").textContent;
    let productColor = productCard.querySelector(".indicator-color.active").style.getPropertyValue("--bg-color");
    return { id: productId, size: productSize, color: productColor, count: 1 };
}

function addToCart(cart, data) {
    let existing = cart.find(product => deepEquality(product, data, ["count"]));
    if (existing) {
        existing.count++;
    } else {
        cart.push(data);
    }
    localStorage.setItem("shoppingCart", JSON.stringify(cart));
}

function removeFromCart(cart, data) {
    let existing = cart.find(product => deepEquality(product, data, ["count"]));
    let newCart = cart;
    if (existing && existing.count - 1 > 0) {
        existing.count--;
    } else {
        newCart = cart.filter(product => !deepEquality(product, data, ["count"]));
    }
    localStorage.setItem("shoppingCart", JSON.stringify(newCart));
    return newCart;
}

// UI updates
function updateMainColor(color) {
    document.documentElement.style.setProperty("--main-color", color);
}

function updateTitleImage(fileName) {
    let root = document.documentElement;
    let folderPath = getComputedStyle(root).getPropertyValue("--title-image-folder").replace(/["']/g, "");
    root.style.setProperty("--title-image-url", `url("${folderPath}/${fileName}")`);
}

function updateTargetImage(element) {
    let currentSrc = closestDescendant(element, "[src]").getAttribute("src");
    if (!currentSrc) return;
    let targetSelector = element.dataset.target;
    let target = document.querySelector(targetSelector);
    let targetImage = closestDescendant(target, "[src]");
    targetImage?.setAttribute("src", currentSrc);
}

function updateModalContent(targetSelector, innerContent) {
    let modal = document.querySelector(targetSelector);
    let modalBody = modal.querySelector(".custom-modal-body");
    modalBody.innerHTML = innerContent;
}

function openModal(targetSelector) {
    let modal = document.querySelector(targetSelector);
    document.body.style.overflow = "hidden";
    modal.classList.add("active");
    onNextFrame(() => modal.classList.add("show"));
}

function closeModal(targetSelector) {
    let modal = document.querySelector(targetSelector);
    document.body.style.overflow = "auto";
    modal.classList.remove("show");

    modal.addEventListener("transitionend", function handler(event) {
        if (event.target === modal && event.propertyName === "opacity") {
            modal.classList.remove("active");
            modal.removeEventListener("transitionend", handler);
        }
    });
}

function toggleModal(targetSelector) {
    let modal = document.querySelector(targetSelector);
    if (!modal.classList.contains("active")) {
        openModal(targetSelector);
        return;
    }
    closeModal(targetSelector);
}

// Create
function createWrapper(element, wrapperTag, wrapperClass) {
    let colWrapper = document.createElement(wrapperTag);
    colWrapper.classList.add(...wrapperClass.split(" "));
    colWrapper.appendChild(element);
    return colWrapper;
}

function createThumbnailImages(images, target) {
    let thumbnailImages = document.createElement("div");
    thumbnailImages.classList.add(
        ...`row m-0 gy-0 gx-1 gx-sm-2 col-12 row-cols-${images.length} row-gap-2 row-cols-md-1 col-md-2 gx-md-0`.split(
            " "
        )
    );
    for (let i = 0; i < images.length; i++) {
        thumbnailImages.innerHTML += `
            <div class="col">
                <div class="thumbnail p-1 rounded-3 border border-1 border-main overflow-hidden"
                    style="aspect-ratio: 1;" data-target=${target}
                    onclick="updateTargetImage(this)">
                    <img src="images/products/${images[i]}" alt="" class="img-fluid">
                </div>
            </div>`;
    }
    return thumbnailImages;
}

function createPrice(price, discount) {
    let priceElement = document.createElement("span");
    let oldPrice = discount ? `<del class="text-danger">$${price.toFixed(2)}</del>` : ``;
    priceElement.innerHTML = `${oldPrice} $${((1 - discount) * price).toFixed(2)}`;
    return priceElement;
}

function createSizeIndicators(sizes) {
    let indicatorsRow = document.createElement("span");
    indicatorsRow.classList.add(..."d-flex flex-wrap gap-2 fs-6".split(" "));
    for (let size of sizes) {
        indicatorsRow.innerHTML += `<span class="indicator-size" onclick="transferClass(this, 'active')">${size}</span>`;
    }
    indicatorsRow.firstElementChild.classList.add("active");
    return indicatorsRow;
}

function createColorIndicators(colors) {
    let indicatorsRow = document.createElement("span");
    indicatorsRow.classList.add(..."d-flex flex-wrap gap-2 fs-6".split(" "));
    for (let color of colors) {
        indicatorsRow.innerHTML += `<span class="indicator-color" style="--bg-color: ${color};"
        onclick="transferClass(this, 'active')"></span>`;
    }
    indicatorsRow.firstElementChild.classList.add("active");
    return indicatorsRow;
}

function createImageIndicators(images, target) {
    let indicatorsContainer = document.createElement("div");
    indicatorsContainer.classList.add(..."indicators d-flex justify-content-center align-items-center".split(" "));
    for (let i = 0; i < images.length; i++) {
        indicatorsContainer.innerHTML += `
            <span class="indicator rounded-circle mx-1" src="images/products/${images[i]}"
            data-target="#${target}" style="width: 1em; aspect-ratio: 1;"
            onclick="updateTargetImage(this); transferClass(this, 'active')"></span>`;
    }
    indicatorsContainer.firstElementChild.classList.add("active");
    return indicatorsContainer;
}

function createLatestCard(data) {
    let latestCard = document.createElement("div");
    latestCard.classList.add(..."latest-card product-card bg-light rounded-3 border border-2 border-main".split(" "));
    latestCard.dataset.id = data.id;
    latestCard.innerHTML = `
        <div class="row g-0 p-3 row-gap-4">
            <div class="row g-0 col-12 col-lg-6">
                ${createThumbnailImages(data.images, "#latestMainImage" + data.id).outerHTML}
                <div id="latestMainImage${data.id}"
                    class="main-image col-12 col-md-10 d-flex justify-content-center align-items-center">
                    <img src="images/products/${data.images[0]}" alt="" class="img-fluid w-75">
                </div>
            </div>
            <div class="col-12 col-lg-6">
                <h2 class="text-main">${data.name}</h2>
                <p class="text-secondary">${data.description}</p>
                <p><b>Price:</b> ${createPrice(data.price, data.discount).outerHTML}</p>
                <p><b>Sizes:</b> ${createSizeIndicators(data.sizes).outerHTML}</p>
                <p><b>Colors:</b> ${createColorIndicators(data.colors).outerHTML}</p>
                <button class="btn btn-outline-main" data-action="addToCart">Add to cart</button>
            </div>
        </div>`;
    return latestCard;
}

function createFeaturedCard(data) {
    let featuredCard = document.createElement("div");
    featuredCard.classList.add(
        ..."featured-card product-card text-center p-3 bg-light rounded-3 overflow-hidden".split(" ")
    );
    featuredCard.dataset.id = data.id;
    featuredCard.innerHTML = `
        <div class="card-image p-1 my-4">
            <img id="featuredMainImage${data.id}" src="images/products/${data.images[0]}" 
            alt="" class="img-fluid">
            <div class="controls vstack justify-content-center align-items-center row-gap-3">
                <div class="view-btn-container">
                    <button class="view-btn btn btn-outline-main fs-6 rounded-circle"
                        data-action="toggleModal updateProductModal" data-target="#productModal0"
                        data-id=${data.id}>
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                </div>
                ${createImageIndicators(data.images, "featuredMainImage" + data.id).outerHTML}
            </div>
        </div>
        <div class="card-text">
            <h6>${data.name}</h6>
            ${createPrice(data.price, data.discount).outerHTML}
            <span class="${data.discount ? "" : "d-none"} discount w-100 text-light bg-main">
                ${data.discount * 100}%
            </span>
        </div>`;
    return featuredCard;
}

function createCartCard(data) {
    let product = products.find(product => product.id == data.id);
    let productCard = document.createElement("div");
    productCard.classList.add(..."cart-card product-card bg-light rounded-3 p-3".split(" "));
    productCard.dataset.id = data.id;
    productCard.innerHTML = `
        <img src="images/products/${product.images[0]}" alt="" class="img-fluid">
        <h5 class="text-truncate" title="${product.name}">
            ${product.name}
        </h5>
        <p>Price: ${createPrice(product.price, product.discount).outerHTML}</p>
        <p>Size: <span class="indicator-size active">${data.size}</span></p>
        <p>Color: <span class="indicator-color active" style="--bg-color: ${data.color};"></span></p>
        <p>Count: ${data.count}</p>
        <button class="btn btn-danger w-100" data-action="removeFromCart updateCartModal" data-target="#shoppingCartModal">
            Remove
        </button>`;

    return productCard;
}

function createProductsContainer(cart) {
    let productsContainer = document.createElement("div");
    productsContainer.classList.add(..."row row-cols-3 gx-3 row-gap-3 justify-content-center".split(" "));
    for (let data of cart) {
        let productCard = createCartCard(data);
        let colWrapper = createWrapper(productCard, "div", "col");
        productsContainer.appendChild(colWrapper);
    }
    return productsContainer;
}

function createWarningMessage(text) {
    let warningMessage = document.createElement("p");
    warningMessage.classList.add(..."alert alert-warning text-center".split(" "));
    warningMessage.textContent = text;
    return warningMessage;
}

// Append
function appendProducts(products, section) {
    for (let product of products) {
        section.appendChild(product);
    }
}

// Scroll Spy
function getCurrentSection(sections, offset = 0) {
    for (let section of sections) {
        let currentScrollPos = document.documentElement.scrollTop + offset;

        let startAt = section.offsetTop;
        let endAt = startAt + section.offsetHeight;

        let isInView = startAt <= currentScrollPos && currentScrollPos < endAt;
        if (isInView) return section;
    }
    return null;
}

function getCurrentMenuItem(navbar, id) {
    let menuItem = navbar.querySelector(`.smart-nav-item:has(a[href="#${id}"])`);
    return menuItem;
}

function scrollSpy(sections, menu, offset) {
    let section = getCurrentSection(sections, offset);
    let menuItem = getCurrentMenuItem(menu, section?.getAttribute("id"));
    transferClass(menuItem, "active");
}

function throttle(callback, delay) {
    let ticking = false; // Control flag

    // Returning a throttled version
    return function (...args) {
        if (!ticking) {
            callback.apply(this, args); // Run the callback function
            setTimeout(() => {
                ticking = false; // Allow calls after delay
            }, delay);
            ticking = true; // Block further calls
        }
    };
}

function rafThrottle(callback) {
    let ticking = false;

    return function (...args) {
        if (!ticking) {
            requestAnimationFrame(() => {
                callback.apply(this, args);
                ticking = false;
            });
            ticking = true;
        }
    };
}
