// || Imports
import * as menu from "./menu.js";

// || Events

// [01] DOMContentLoaded: Load address
window.addEventListener("DOMContentLoaded", () => menu.displayLogisticData(JSON.parse(localStorage.getItem("logistic")), menu.storageLogisticValidation));

// [02] load:
// * Load drinks
// * Display price from localStorage
window.addEventListener("load", () => {
	displayDrinkMenu();
	document.getElementById("price-display-injection").textContent = `$${Number(localStorage.getItem("cartPrice")).toFixed(2)}`;
});

// [03] Filter
[...document.querySelectorAll("[name='menu-filter']")].forEach(filter => filter.addEventListener("click", () => menu.filterMenu()));

async function displayDrinkMenu() {
	const response = await fetch(".././assets/json/drink.json");
	const drinks = await response.json();

	const main = document.querySelector("main");

	for (const [key, value] of Object.entries(drinks)) {
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
			drinkObject => {
				let menuCard = document.createElement("div");
				menuCard.classList.add("menu-card");

				// Pizza image
				menuCard.innerHTML = `
					<figure>
						<img src="../assets/visual/drink/${drinkObject.imageDir}.jpg" alt="${drinkObject.name}">
					</figure>
				`;

				// The rest of the card
				let menuCardData = document.createElement("div");
				menuCardData.classList.add("menu-card-data");

				// Heading (Pizza name + Tags)
				let cardHeading = document.createElement("div");
				cardHeading.classList.add("card-heading");
				cardHeading.innerHTML = `<h3 class="card-title">${drinkObject.name}</h3>`;

				let cardTag = document.createElement("span");
				cardTag.classList.add("card-tag");
				drinkObject.tag.forEach(tag => cardTag.insertAdjacentHTML("beforeend", `<i class="card-svg svg-${tag}" title="${tag}"></i>`));

				cardHeading.appendChild(cardTag);
				menuCardData.appendChild(cardHeading);

				// Calories
				menuCardData.insertAdjacentHTML("beforeend", `<p class="menu-calorie-display">${drinkObject.energy}</p>`);

				// Description + View more
				let cardInformation = document.createElement("div");
				cardInformation.classList.add("card-information");
				cardInformation.innerHTML = `
					<p>${drinkObject.description}</p>
					<a href="javascript:void(0)" class="expand-close-anchor">View more</a>
				`;
				menuCardData.appendChild(cardInformation);

				// Add to Cart
				let addToCartButton = document.createElement("button");
				menu.setAttributes(addToCartButton, { type: "button", class: "add-to-cart" });
				addToCartButton.innerHTML = `
					<p>Add to Cart</p>
					<p class="add-to-cart-price" id="${drinkObject.name}">$${drinkObject.price}</p>
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

	// Add to cart
	[...document.getElementsByClassName("add-to-cart")].forEach(
		button => button.addEventListener("click",
			() => addToCart(button, document.getElementById("price-display-injection"), localStorage)
		)
	);
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

	const productName = buttonElement.querySelector(".add-to-cart-price").id;
	const cartDrinkItems = storageObject.getItem("cartDrinkItems") == null ? {} : JSON.parse(storageObject.getItem("cartDrinkItems"));
	if (Object.prototype.hasOwnProperty.call(cartDrinkItems, productName)) {
		cartDrinkItems[productName] = cartDrinkItems[productName] + 1;
	} else {
		cartDrinkItems[productName] = 1;
	}
	storageObject.setItem("cartDrinkItems", JSON.stringify(cartDrinkItems));
}