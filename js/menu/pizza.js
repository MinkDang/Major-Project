// || Imports
import * as menu from "./menu.js";

// || Events

// [01] DOMContentLoaded: Load address
window.addEventListener("DOMContentLoaded", () => menu.displayLogisticData(JSON.parse(localStorage.getItem("logistic")), menu.storageLogisticValidation));

// [02] load:
// * Load pizzas
// * Display price from localStorage
window.addEventListener("load", () => {
	displayPizzaMenu();
	document.getElementById("price-display-injection").textContent = `$${Number(localStorage.getItem("cartPrice")).toFixed(2)}`;
});

// [03] Filter
[...document.querySelectorAll("[name='menu-filter']")].forEach(filter => filter.addEventListener("click", () => menu.filterMenu()));

// || Functions

async function displayPizzaMenu() {
	const response = await fetch(".././assets/json/pizza.json");
	const pizzas = await response.json();

	const main = document.querySelector("main");

	for (const [key, value] of Object.entries(pizzas)) {
		// Create section
		let menuSection = document.createElement("section");
		menu.setAttributes(menuSection, { class: "menu-section", id: `${key}-menu-section` });

		// Add section title
		menuSection.innerHTML = `
			<div class="menu-section-title">
				<h2><span>${key}</span></h2>
			</div>
		`;

		// Pizza cards
		value.forEach(
			pizzaObject => {
				let menuCard = document.createElement("div");
				menuCard.classList.add("menu-card");
				menu.setAttributes(menuCard, {
					"data-tag-vegetarian": pizzaObject.tag.indexOf("vegetarian") > -1,
					"data-tag-vegan": pizzaObject.tag.indexOf("vegan") > -1,
					"data-tag-spicy": pizzaObject.tag.indexOf("spicy") > -1,
				});

				// Pizza image
				menuCard.innerHTML = `
					<figure>
						<img src="../assets/visual/pizza/${pizzaObject.imageDir}.webp" alt="${pizzaObject.name}">
					</figure>
				`;

				// The rest of the card
				let menuCardData = document.createElement("div");
				menuCardData.classList.add("menu-card-data");

				// Heading (Pizza name + Tags)
				let cardHeading = document.createElement("div");
				cardHeading.classList.add("card-heading");
				cardHeading.innerHTML = `<h3 class="card-title">${pizzaObject.name}</h3>`;

				let cardTag = document.createElement("span");
				cardTag.classList.add("card-tag");
				pizzaObject.tag.forEach(tag => cardTag.insertAdjacentHTML("beforeend", `<i class="card-svg svg-${tag}" title="${tag}"></i>`));

				cardHeading.appendChild(cardTag);
				menuCardData.appendChild(cardHeading);

				// Calories
				menuCardData.insertAdjacentHTML("beforeend", `<p class="menu-calorie-display">${pizzaObject.energy}</p>`);

				// Description + View more
				let cardInformation = document.createElement("div");
				cardInformation.classList.add("card-information");
				cardInformation.innerHTML = `
					<p>${pizzaObject.description}</p>
					<a href="javascript:void(0)" class="expand-close-anchor">View more</a>
				`;
				menuCardData.appendChild(cardInformation);

				// Customise size
				let cardCustomisation = document.createElement("form");
				menu.setAttributes(cardCustomisation, { class: "card-customisation", autocomplete: "off" });
				cardCustomisation.innerHTML = `
					<fieldset>
						<legend>Size</legend>
						<select class="card-size-customisation">
							<option value="medium">Medium</option>
							<option value="large">Large +$2.00</option>
						</select>
					</fieldset>
				`;
				menuCardData.appendChild(cardCustomisation);

				// Add to Cart
				let addToCartButton = document.createElement("button");
				menu.setAttributes(addToCartButton, { type: "button", class: "add-to-cart" });
				addToCartButton.innerHTML = `
					<p>Add to Cart</p>
					<p class="add-to-cart-price" id="${pizzaObject.name}">$${pizzaObject.price}</p>
				`;
				menuCardData.appendChild(addToCartButton);

				// Add back to the main menu card
				menuCard.appendChild(menuCardData);

				// Add to the main section
				menuSection.appendChild(menuCard);
			}
		);
		main.appendChild(menuSection);
	}

	// Remove anchor "View more" if description is less than 2 lines
	[...document.querySelectorAll(".card-information > p")].forEach(
		element => {
			if (menu.calculateAmountOfLines(element) > 2) {
				element.style.webkitLineClamp = 2;
			} else {
				element.nextElementSibling.remove();
			}
		}
	);

	// Events

	// "View more anchor click"
	[...document.getElementsByClassName("expand-close-anchor")].forEach(
		element => element.addEventListener("click", () => menu.expandMinimiseCardInformation(element))
	);

	// Change price when change size
	[...document.getElementsByClassName("card-size-customisation")].forEach(
		option => option.addEventListener("change", () => displayAddToCartPrice(option))
	);

	// Add to cart
	[...document.getElementsByClassName("add-to-cart")].forEach(
		button => button.addEventListener("click",
			() => addToCart(button, document.getElementById("price-display-injection"), localStorage)
		)
	);
}

// Change both energy and price value
function displayAddToCartPrice(selectElement) {
	const priceElement = selectElement.closest(".menu-card-data").querySelector(".add-to-cart-price");
	const energyElement = selectElement.closest(".menu-card-data").querySelector(".menu-calorie-display");

	// parseInt will ignore every thing to the right if it meet a non digit character => no need to remove the end of string
	// similar to parseFloat => remove the beginning "$"
	if (selectElement.value === "large") {
		priceElement.textContent = `$${(parseFloat(priceElement.textContent.replace("$", "")) + 2).toFixed(2)}`;
		energyElement.textContent = `${parseInt(energyElement.textContent) + 500} kJ`;
	} else {
		priceElement.textContent = `$${(parseFloat(priceElement.textContent.replace("$", "")) - 2).toFixed(2)}`;
		energyElement.textContent = `${parseInt(energyElement.textContent) - 500} kJ`;
	}
}

function addToCart(buttonElement, priceElement, storageObject) {
	const productPrice = parseFloat(buttonElement.querySelector(".add-to-cart-price").textContent.replace("$", ""));
	// Number(null) == 0
	storageObject.setItem("cartPrice", Number(storageObject.getItem("cartPrice")) + productPrice);
	priceElement.textContent = `$${Number(storageObject.getItem("cartPrice")).toFixed(2)}`;

	// Animation
	priceElement.parentElement.classList.remove('price-display-change-flash'); // reset animation
	void priceElement.parentElement.offsetWidth; // trigger reflow
	priceElement.parentElement.classList.add('price-display-change-flash'); // start animation

	const productSize = buttonElement.previousElementSibling.querySelector(".card-size-customisation").value;
	const productName = productSize === "large" ? `${buttonElement.querySelector(".add-to-cart-price").id}-large` : buttonElement.querySelector(".add-to-cart-price").id;
	const cartPizzaItems = storageObject.getItem("cartPizzaItems") == null ? {} : JSON.parse(storageObject.getItem("cartPizzaItems"));
	if (Object.prototype.hasOwnProperty.call(cartPizzaItems, productName)) {
		cartPizzaItems[productName] = cartPizzaItems[productName] + 1;
	} else {
		cartPizzaItems[productName] = 1;
	}
	storageObject.setItem("cartPizzaItems", JSON.stringify(cartPizzaItems));
}