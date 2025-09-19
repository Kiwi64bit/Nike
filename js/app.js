let mainColors = ["hsl(2, 94%, 57%)", "hsl(211, 65%, 53%)", "hsl(35, 90%, 45%)"];
let logos = ["logo_red.png", "logo_blue.png", "logo_yellow.png"];
let titleImages = ["icon_red.png", "icon_blue.png", "icon_yellow.png"];

let nikeLogo = document.getElementById("nikeLogo");

let shoppingCart = JSON.parse(localStorage.getItem("shoppingCart")) ?? [];

let navbar = document.querySelector("nav");
let smartNavItems = navbar.querySelectorAll(".smart-nav-item");
let navLinks = navbar.querySelectorAll(".smart-nav-item a[href^='#']");
let sections = document.querySelectorAll("header, section");
let scrollSpyOffset = navbar.offsetHeight + 10;

let modals = document.querySelectorAll(`.custom-modal`);

let controlsFile = {
    ArrowLeft: () => {
        heroSlider.prevSlide();
    },
    ArrowRight: () => {
        heroSlider.nextSlide();
    },
    Escape: () => {
        let modal = document.querySelector(".custom-modal.active");
        if (!modal) return;
        closeModal(`#${modal.id}`);
    },
};

let heroSliderElement = document.getElementById("heroSlideShow");
let heroSlider = {
    sliderElement: heroSliderElement,
    slides: Array.from(heroSliderElement.querySelectorAll(".slide")),
    prevBtn: heroSliderElement.querySelector(".slide-show-control-prev"),
    nextBtn: heroSliderElement.querySelector(".slide-show-control-next"),
    currentIndex: +(localStorage.getItem("colorIndex") ?? 0),

    updateSlide: function (index) {
        transferClass(this.slides[index], "active");
        onNextFrame(() => transferClass(this.slides[index], "show"));
    },

    nextSlide: function () {
        this.currentIndex++;
        this.currentIndex = this.currentIndex % this.slides.length;
        this.updateUI(this.currentIndex);
        localStorage.setItem("colorIndex", this.currentIndex);
    },

    prevSlide: function () {
        this.currentIndex--;
        this.currentIndex = (this.currentIndex + this.slides.length) % this.slides.length;
        this.updateUI(this.currentIndex);
        localStorage.setItem("colorIndex", this.currentIndex);
    },

    updateUI: function (index) {
        this.updateSlide(index);
        updateMainColor(mainColors[index]);
        updateTitleImage(titleImages[index]);
        nikeLogo.src = `images/logo/${logos[index]}`;
    },
};

heroSlider.updateUI(heroSlider.currentIndex);

for (let link of navLinks) {
    link.addEventListener("click", event => {
        event.preventDefault();
        let href = link.getAttribute("href");
        if (href === "#") return;
        let target = document.querySelector(href);
        if (!target) return;

        let yPos = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
        window.scrollTo({ top: yPos, behavior: "smooth" });
    });
}

let latestProducts = latest.map(productData => {
    let latestCard = createLatestCard(productData);
    let colWrapper = document.createElement("div");
    colWrapper.classList.add("col");
    colWrapper.appendChild(latestCard);
    return colWrapper;
});
appendProducts(latestProducts, document.getElementById("latestContainer"));

let featuredProducts = featured.map(productData => {
    let featuredCard = createFeaturedCard(productData);
    let colWrapper = document.createElement("div");
    colWrapper.classList.add("col");
    colWrapper.appendChild(featuredCard);
    return colWrapper;
});
appendProducts(featuredProducts, document.getElementById("featuredContainer"));

for (let modal of modals) {
    modal.addEventListener("click", event => {
        let modalContent = modal.querySelector(".custom-modal-content");
        if (!modalContent.contains(event.target)) {
            closeModal(`#${modal.id}`);
        }
    });
}

document.addEventListener("click", event => {
    let btn = event.target.closest("[data-action]");
    if (!btn) return;

    if (btn.matches(`[data-action~="dismissModal"]`)) {
        closeModal(btn.dataset.target);
    }

    if (btn.matches(`[data-action~="toggleModal"]`)) {
        toggleModal(btn.dataset.target);
    }

    if (btn.matches(`[data-action~="updateProductModal"]`)) {
        let data = products.find(product => product.id == btn.dataset.id);
        let productCard = createLatestCard(data);
        updateModalContent(btn.dataset.target, productCard.outerHTML);
    }

    if (btn.matches(`[data-action~="addToCart"]`)) {
        let productData = getProductData(btn);
        addToCart(shoppingCart, productData);
    }

    if (btn.matches(`[data-action~="removeFromCart"]`)) {
        let productData = getProductData(btn);
        shoppingCart = removeFromCart(shoppingCart, productData);
    }

    if (btn.matches(`[data-action~="updateCartModal"]`)) {
        let footer = document.querySelector(`${btn.dataset.target} .custom-modal-footer`);
        let productsContainer = document.createElement("div");
        productsContainer.classList.add(..."row row-cols-3 gx-3 row-gap-3 justify-content-center".split(" "));
        for (let data of shoppingCart) {
            let productCard = createCartCard(data);
            let colWrapper = document.createElement("div");
            colWrapper.classList.add("col");
            colWrapper.appendChild(productCard);
            productsContainer.appendChild(colWrapper);
        }
        if (productsContainer.childElementCount == 0) {
            footer.style.display = "none";
            let warningMessage = document.createElement("p");
            warningMessage.classList.add(..."alert alert-warning text-center".split(" "));
            warningMessage.textContent = "There are no products!";
            updateModalContent(btn.dataset.target, warningMessage.outerHTML);
            return;
        }
        footer.style.display = "flex";
        updateModalContent(btn.dataset.target, productsContainer.outerHTML);
    }
});

window.addEventListener("scroll", () => rafThrottle(scrollSpy(sections, navbar, scrollSpyOffset)));

window.addEventListener("keyup", event => {
    controlsFile[event.key]?.();
});
