// || Imports
import * as menu from "../menu/menu.js";

// || Events

// [01] Load table
window.addEventListener("load", () => displayPriceTable());

// [02] Complete Order Button
document.getElementById("complete-order-button").addEventListener("click", () => checkLogisticForRedirection());

// || Functions

async function displayPriceTable() {
	document.querySelector("tbody").innerHTML = "";
	await displayPizzaPriceTable();
	await displaySidePriceTable();
	await displayDrinkPriceTable();
	// TODO: Turn into 1 function
	calculateQuantity();
	calculatePrice();
	activateEventListener(document.getElementsByClassName("quantity-increase"), document.getElementsByClassName("quantity-decrease"));
}

function isObjectEmpty(obj) {
	return obj == null || Object.keys(obj).length === 0;
}

async function displayPizzaPriceTable() {
	const response = await fetch(".././assets/json/pizza.json");
	const pizzas = await response.json();

	const pizzaLocalStorage = JSON.parse(localStorage.getItem("cartPizzaItems"));
	if (isObjectEmpty(pizzaLocalStorage)) {
		return;
	}
	Object.values(pizzas).forEach(pizzaObjects => {
		for (const [keyLocal, valueLocal] of Object.entries(pizzaLocalStorage)) {
			pizzaObjects.forEach(pizzaObject => {
				// Check for medium and then large size (slice the string)
				if (pizzaObject.name === keyLocal) {
					document.querySelector('tbody').insertAdjacentHTML("beforeend", `
							<tr>
								<td>${keyLocal}</td>
								<td class="quantity-container">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										fill="transparent" stroke="currentColor" stroke-width="2" stroke-linecap="round"
										stroke-linejoin="round" class="feather feather-minus-circle quantity-decrease"
										tabindex="0">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="8" y1="12" x2="16" y2="12"></line>
									</svg>
									<span class="quantity" id="${keyLocal}" data-menu-type="pizza">${valueLocal}</span>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										fill="transparent" stroke="currentColor" stroke-width="2" stroke-linecap="round"
										stroke-linejoin="round" class="feather feather-plus-circle quantity-increase"
										tabindex="0">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="12" y1="8" x2="12" y2="16"></line>
										<line x1="8" y1="12" x2="16" y2="12"></line>
									</svg>
								</td>
								<td class="price">$${(Number(pizzaObject.price) * valueLocal).toFixed(2)}</td>
							</tr>
						`);
				} else if (pizzaObject.name === keyLocal.slice(0, -6)) {
					document.querySelector('tbody').insertAdjacentHTML("beforeend", `
							<tr>
								<td>${`${keyLocal} - Large`}</td>
								<td class="quantity-container">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										fill="transparent" stroke="currentColor" stroke-width="2" stroke-linecap="round"
										stroke-linejoin="round" class="feather feather-minus-circle quantity-decrease"
										tabindex="0">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="8" y1="12" x2="16" y2="12"></line>
									</svg>
									<span class="quantity" id="${keyLocal}" data-menu-type="pizza">${valueLocal}</span>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										fill="transparent" stroke="currentColor" stroke-width="2" stroke-linecap="round"
										stroke-linejoin="round" class="feather feather-plus-circle quantity-increase"
										tabindex="0">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="12" y1="8" x2="12" y2="16"></line>
										<line x1="8" y1="12" x2="16" y2="12"></line>
									</svg>
								</td>
								<td class="price">$${((Number(pizzaObject.price) + 2) * valueLocal).toFixed(2)}</td>
							</tr>
						`);
				}
			});
		}
	});
}

async function displaySidePriceTable() {
	const response = await fetch(".././assets/json/side.json");
	const sides = await response.json();

	const sideLocalStorage = JSON.parse(localStorage.getItem("cartSideItems"));
	if (isObjectEmpty(sideLocalStorage)) {
		return;
	}
	Object.values(sides).forEach(sideObjects => {
		for (const [keyLocal, valueLocal] of Object.entries(sideLocalStorage)) {
			sideObjects.forEach(sideObject => {
				if (sideObject.name === keyLocal) {
					document.querySelector('tbody').insertAdjacentHTML("beforeend", `
							<tr>
								<td>${keyLocal}</td>
								<td class="quantity-container">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										fill="transparent" stroke="currentColor" stroke-width="2" stroke-linecap="round"
										stroke-linejoin="round" class="feather feather-minus-circle quantity-decrease"
										tabindex="0">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="8" y1="12" x2="16" y2="12"></line>
									</svg>
									<span class="quantity" id="${keyLocal}" data-menu-type="side">${valueLocal}</span>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										fill="transparent" stroke="currentColor" stroke-width="2" stroke-linecap="round"
										stroke-linejoin="round" class="feather feather-plus-circle quantity-increase"
										tabindex="0">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="12" y1="8" x2="12" y2="16"></line>
										<line x1="8" y1="12" x2="16" y2="12"></line>
									</svg>
								</td>
								<td class="price">$${(Number(sideObject.price) * valueLocal).toFixed(2)}</td>
							</tr>
						`);
				}
			});
		}
	});
}

async function displayDrinkPriceTable() {
	const response = await fetch(".././assets/json/drink.json");
	const drinks = await response.json();

	const drinkLocalStorage = JSON.parse(localStorage.getItem("cartDrinkItems"));
	if (isObjectEmpty(drinkLocalStorage)) {
		return;
	}
	Object.values(drinks).forEach(drinkObjects => {
		for (const [keyLocal, valueLocal] of Object.entries(drinkLocalStorage)) {
			drinkObjects.forEach(drinkObject => {
				if (drinkObject.name === keyLocal) {
					document.querySelector('tbody').insertAdjacentHTML("beforeend", `
							<tr>
								<td>${keyLocal}</td>
								<td class="quantity-container">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										fill="transparent" stroke="currentColor" stroke-width="2" stroke-linecap="round"
										stroke-linejoin="round" class="feather feather-minus-circle quantity-decrease"
										tabindex="0">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="8" y1="12" x2="16" y2="12"></line>
									</svg>
									<span class="quantity" id="${keyLocal}" data-menu-type="drink">${valueLocal}</span>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										fill="transparent" stroke="currentColor" stroke-width="2" stroke-linecap="round"
										stroke-linejoin="round" class="feather feather-plus-circle quantity-increase"
										tabindex="0">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="12" y1="8" x2="12" y2="16"></line>
										<line x1="8" y1="12" x2="16" y2="12"></line>
									</svg>
								</td>
								<td class="price">$${(Number(drinkObject.price) * valueLocal).toFixed(2)}</td>
							</tr>
						`);
				}
			});
		}
	});
}

function calculateQuantity() {
	// Remap array to be list of numbers from span.quantity, then reduce it to get sum
	const quantitySum = [...document.getElementsByClassName("quantity")].map(span => Number(span.textContent)).reduce((a, b) => a + b, 0);
	document.getElementById("quantity-sum").textContent = quantitySum;
}

function calculatePrice() {
	// Remap array to be list of numbers (with slice(1) to remove the "$") from td.price, then reduce it to get sum
	const priceSum = [...document.getElementsByClassName("price")].map(td => Number(td.textContent.slice(1))).reduce((a, b) => a + b, 0).toFixed(2);
	document.getElementById("price-sum").textContent = priceSum;
}

function activateEventListener(increaseButtons, decreaseButtons) {
	const capitaliseFirstLetter = string => string[0].toUpperCase() + string.slice(1);

	[...increaseButtons].forEach(button => button.addEventListener("click", () => {
		// span is above svg
		const quantitySpan = button.previousElementSibling;

		const menuLocalStorage = JSON.parse(localStorage.getItem(`cart${capitaliseFirstLetter(quantitySpan.getAttribute("data-menu-type"))}Items`));
		menuLocalStorage[quantitySpan.id] = menuLocalStorage[quantitySpan.id] + 1;
		localStorage.setItem(`cart${capitaliseFirstLetter(quantitySpan.getAttribute("data-menu-type"))}Items`, JSON.stringify(menuLocalStorage));

		let priceLocalStorage = Number(localStorage.getItem("cartPrice"));
		priceLocalStorage += Number(quantitySpan.closest("tr").querySelector(".price").textContent.slice(1)) / Number(quantitySpan.textContent);
		localStorage.setItem("cartPrice", priceLocalStorage.toFixed(2));
		displayPriceTable();
	}));

	[...decreaseButtons].forEach(button => button.addEventListener("click", () => {
		// span is below svg
		const quantitySpan = button.nextElementSibling;

		const menuLocalStorage = JSON.parse(localStorage.getItem(`cart${capitaliseFirstLetter(quantitySpan.getAttribute("data-menu-type"))}Items`));
		menuLocalStorage[quantitySpan.id] = menuLocalStorage[quantitySpan.id] - 1;
		if (menuLocalStorage[quantitySpan.id] === 0) {
			delete menuLocalStorage[quantitySpan.id];
		}
		localStorage.setItem(`cart${capitaliseFirstLetter(quantitySpan.getAttribute("data-menu-type"))}Items`, JSON.stringify(menuLocalStorage));

		let priceLocalStorage = Number(localStorage.getItem("cartPrice"));
		priceLocalStorage -= Number(quantitySpan.closest("tr").querySelector(".price").textContent.slice(1)) / Number(quantitySpan.textContent);
		localStorage.setItem("cartPrice", priceLocalStorage.toFixed(2));
		displayPriceTable();
	}));
}

function checkLogisticForRedirection() {
	if (!document.getElementById("personal-details-form").reportValidity()) {
		return;
	} else if (document.querySelector("tbody").textContent === "") {
		alert("Please add food to cart");
		window.location.href = "../menu/pizza.html";
	} else if (menu.storageLogisticValidation(JSON.parse(localStorage.getItem("logistic")))) {
		window.location.href = "./success.html";
	} else {
		sessionStorage.setItem("logisticDataNotFound", true);
		window.location.href = "../";
	}
}
