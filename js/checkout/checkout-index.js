import * as module from "../modules.js";

// || Events

// [01] Load table
window.addEventListener("load", () => displayPriceTable());

// [02] Complete Order Button
document.getElementById("complete-order-button").addEventListener("click", () => checkLogisticForRedirection());

// || Functions

async function displayPriceTable() {
	document.querySelector("tbody").innerHTML = "";

	for await (const menuType of ["pizza", "side", "drink"]) {
		await displayMenuPriceTable(menuType);
	}

	// Calculate Quantity and Price
	document.getElementById("quantity-sum").textContent = calculateQuantity(document.getElementsByClassName("quantity"));
	document.getElementById("price-sum").textContent = calculatePrice(document.getElementsByClassName("price"));

	// Activate increase decrease quantity button
	quantityIncreaseDecreaseEventListenerActivation(document.getElementsByClassName("quantity-increase"), document.getElementsByClassName("quantity-decrease"));
}

function isObjectEmpty(obj) {
	return obj == null || Object.keys(obj).length === 0;
}

async function displayMenuPriceTable(menuType) {
	const response = await fetch(`.././assets/json/${menuType}.json`);
	const menuItems = await response.json();

	const menuItemLocalStorage = JSON.parse(localStorage.getItem(`cart${module.toSentenceCase(menuType)}Items`));

	// Test if empty localStorage => exit function
	if (isObjectEmpty(menuItemLocalStorage)) {
		return;
	}

	Object.values(menuItems).forEach(menuObjects => {
		for (const [keyLocal, valueLocal] of Object.entries(menuItemLocalStorage)) {
			menuObjects.forEach(menuObject => {
				const isLargePizza = () => menuType === "pizza" && menuObject.name === keyLocal.slice(0, -6);

				if (menuObject.name === keyLocal || isLargePizza()) {
					document.querySelector('tbody').insertAdjacentHTML("beforeend", `
							<tr>
								<td>${isLargePizza() ? `${keyLocal} - Large` : keyLocal}</td>
								<td class="quantity-container">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										fill="transparent" stroke="currentColor" stroke-width="2" stroke-linecap="round"
										stroke-linejoin="round" class="feather feather-minus-circle quantity-decrease"
										tabindex="0">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="8" y1="12" x2="16" y2="12"></line>
									</svg>
									<span class="quantity" id="${keyLocal}" data-menu-type="${menuType}">${valueLocal}</span>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										fill="transparent" stroke="currentColor" stroke-width="2" stroke-linecap="round"
										stroke-linejoin="round" class="feather feather-plus-circle quantity-increase"
										tabindex="0">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="12" y1="8" x2="12" y2="16"></line>
										<line x1="8" y1="12" x2="16" y2="12"></line>
									</svg>
								</td>
								<td class="price">$${((Number(menuObject.price) + isLargePizza() ? 2 : 0) * valueLocal).toFixed(2)}</td>
							</tr>
						`);
				}
			});
		}
	});
}

function calculateQuantity(quantityElements) {
	// Remap array to be list of numbers from span.quantity, then reduce it to get sum
	return [...quantityElements].map(span => Number(span.textContent)).reduce((a, b) => a + b, 0);
}

function calculatePrice(priceElements) {
	// Remap array to be list of numbers (with slice(1) to remove the "$") from td.price, then reduce it to get sum
	return [...priceElements].map(td => Number(td.textContent.slice(1))).reduce((a, b) => a + b, 0).toFixed(2);
}

function quantityIncreaseDecreaseEventListenerActivation(increaseButtons, decreaseButtons) {
	[...increaseButtons].forEach(button => button.addEventListener("click", () => {
		// span is above svg
		const quantitySpan = button.previousElementSibling;

		const menuLocalStorage = JSON.parse(localStorage.getItem(`cart${module.toSentenceCase(quantitySpan.getAttribute("data-menu-type"))}Items`));
		menuLocalStorage[quantitySpan.id] = menuLocalStorage[quantitySpan.id] + 1;
		localStorage.setItem(`cart${module.toSentenceCase(quantitySpan.getAttribute("data-menu-type"))}Items`, JSON.stringify(menuLocalStorage));

		let priceLocalStorage = Number(localStorage.getItem("cartPrice"));
		priceLocalStorage += Number(quantitySpan.closest("tr").querySelector(".price").textContent.slice(1)) / Number(quantitySpan.textContent);
		localStorage.setItem("cartPrice", priceLocalStorage.toFixed(2));
	}));

	[...decreaseButtons].forEach(button => button.addEventListener("click", () => {
		// span is below svg
		const quantitySpan = button.nextElementSibling;

		const menuLocalStorage = JSON.parse(localStorage.getItem(`cart${module.toSentenceCase(quantitySpan.getAttribute("data-menu-type"))}Items`));
		menuLocalStorage[quantitySpan.id] = menuLocalStorage[quantitySpan.id] - 1;
		if (menuLocalStorage[quantitySpan.id] === 0) {
			delete menuLocalStorage[quantitySpan.id];
		}
		localStorage.setItem(`cart${module.toSentenceCase(quantitySpan.getAttribute("data-menu-type"))}Items`, JSON.stringify(menuLocalStorage));

		let priceLocalStorage = Number(localStorage.getItem("cartPrice"));
		priceLocalStorage -= Number(quantitySpan.closest("tr").querySelector(".price").textContent.slice(1)) / Number(quantitySpan.textContent);
		localStorage.setItem("cartPrice", priceLocalStorage.toFixed(2));
	}));

	displayPriceTable();
}

function checkLogisticForRedirection() {
	if (!document.getElementById("personal-details-form").reportValidity()) {
		return;
	} else if (document.querySelector("tbody").textContent === "") {
		alert("Please add food to cart");
		window.location.href = "../menu/pizza.html";
	} else if (module.storageLogisticValidation(JSON.parse(localStorage.getItem("logistic")))) {
		window.location.href = "./success.html";
	} else {
		sessionStorage.setItem("logisticDataNotFound", true);
		window.location.href = "../";
	}
}
