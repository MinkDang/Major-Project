import * as module from "../modules.js";

// || Events

// [01] load:
// * Load items
// * Display price from localStorage
// * Load address
window.addEventListener("load", () => {
	displayMenu(document.querySelector("html").getAttribute("data-menu-type"));
	displayLogisticData(JSON.parse(localStorage.getItem("logistic")), module.storageLogisticValidation);
	document.getElementById("price-display-injection").textContent = `$${Number(localStorage.getItem("cartPrice")).toFixed(2)}`;
});

// [02] Filter
[...document.querySelectorAll("[name='menu-filter']")].forEach(filter => filter.addEventListener("click", () => filterMenu(document.querySelectorAll("[name='menu-filter']:checked"))));

// || Functions

// Set multiple attributes at once instead of Element.setAttribute()
function setAttributes(element, attributes) {
	Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

// Display address after running check
function displayLogisticData(storageObject, storageCheckFn) {
	if (!storageCheckFn(storageObject)) {
		document.getElementById("logistic-display").style.display = "none";
		return;
	}
	document.getElementById("logistic-display").style.display = "flex";

	// Injection
	document.getElementById("logistic-option").textContent = storageObject.logisticType === "pickup" ? "Pickup: " : "Delivery: ";

	document.getElementById("logistic-address").textContent = storageObject.logisticAddress;
	document.getElementById("logistic-address").setAttribute('title', `Click to change the address: ${storageObject.logisticAddress}`);
}

function filterMenu(checkedBoxes) {
	// Get everything shown again to be hidden later
	[...document.getElementsByClassName("menu-card"), ...document.getElementsByClassName("menu-section")].forEach(elementToBeDisplay => elementToBeDisplay.style.display = "flex");

	// Start hiding based on data-tag-${checkbox.value} attributes on div.menu-card
	[...checkedBoxes].forEach(
		checkbox => {
			[...document.querySelectorAll(`.menu-card:not([data-tag-${checkbox.value} = "true"])`)].forEach(menuCard => menuCard.style.display = "none");
		}
	);

	// Hide empty sections
	[...document.getElementsByClassName("menu-section")].forEach(section => section.style.display = section.innerText === section.id ? "none" : "flex");
}

async function displayMenu(menuType) {
	const response = await fetch(`.././assets/json/${menuType}.json`);
	const items = await response.json();

	const main = document.querySelector("main");

	for (const [key, value] of Object.entries(items)) {
		// Create section
		const menuSection = document.createElement("section");
		setAttributes(menuSection, { class: "menu-section", id: `${key}` });

		// Add section title
		menuSection.innerHTML = `
			<div class="menu-section-title">
				<h2><span>${key}</span></h2>
			</div>
		`;

		// Menu cards
		value.forEach(
			menuObject => {
				const menuCard = document.createElement("div");
				menuCard.classList.add("menu-card");
				setAttributes(menuCard, {
					"data-tag-vegetarian": menuObject.tag.indexOf("vegetarian") > -1,
					"data-tag-vegan": menuObject.tag.indexOf("vegan") > -1,
					"data-tag-spicy": menuObject.tag.indexOf("spicy") > -1,
				});

				// Image
				// Image extension jpg for drink TODO: Consistent file extension
				menuCard.innerHTML = `
					<figure>
						<img src="../assets/visual/${menuType}/${menuObject.imageDir}.${menuType === "drink" ? "jpg" : "webp"}" alt="${menuObject.name}">
					</figure>
				`;

				// The rest of the card
				const menuCardData = document.createElement("div");
				menuCardData.classList.add("menu-card-data");

				// Heading (Pizza name + Tags)
				const cardHeading = document.createElement("div");
				cardHeading.classList.add("card-heading");
				cardHeading.innerHTML = `<h3 class="card-title">${menuObject.name}</h3>`;

				const cardTag = document.createElement("span");
				cardTag.classList.add("card-tag");
				menuObject.tag.forEach(tag => cardTag.insertAdjacentHTML("beforeend", `<i class="card-svg svg-${tag}" title="${tag}"></i>`));

				cardHeading.appendChild(cardTag);
				menuCardData.appendChild(cardHeading);

				// Calories
				menuCardData.insertAdjacentHTML("beforeend", `<p class="menu-calorie-display">${menuObject.energy}</p>`);

				// Description + View more
				const cardInformation = document.createElement("div");
				cardInformation.classList.add("card-information");
				cardInformation.innerHTML = `
					<p>${menuObject.description}</p>
					<a href="javascript:void(0)" class="expand-close-anchor">View more</a>
				`;
				menuCardData.appendChild(cardInformation);

				// Pizza Only: Customise size
				if (menuType === "pizza") {
					const cardCustomisation = document.createElement("form");
					setAttributes(cardCustomisation, { class: "card-customisation", autocomplete: "off" });
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
				}

				// Add to Cart
				const addToCartButton = document.createElement("button");
				setAttributes(addToCartButton, { type: "button", class: "add-to-cart" });
				addToCartButton.innerHTML = `
					<p>Add to Cart</p>
					<p class="add-to-cart-price" id="${menuObject.name}">$${menuObject.price}</p>
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
	const calculateAmountOfLines = element => {
		const divHeight = element.offsetHeight;
		const lineHeight = parseInt(getComputedStyle(element).lineHeight);
		return Math.floor(divHeight / lineHeight);
	};

	[...document.querySelectorAll(".card-information > p")].forEach(
		element => {
			if (calculateAmountOfLines(element) > 2) {
				element.style.webkitLineClamp = 2;
			} else {
				element.nextElementSibling.remove();
			}
		}
	);

	// Events

	// "View more anchor click"
	[...document.getElementsByClassName("expand-close-anchor")].forEach(
		element => element.addEventListener("click", () => expandMinimiseCardInformation(element))
	);

	// Pizza Only: Change price when change size
	if (menuType === "pizza") {
		[...document.getElementsByClassName("card-size-customisation")].forEach(
			option => option.addEventListener("change", () => displayAddToCartPrice(option))
		);
	}

	// Add to cart
	[...document.getElementsByClassName("add-to-cart")].forEach(
		button => button.addEventListener("click",
			() => addToCart(menuType, button, document.getElementById("price-display-injection"), localStorage)
		)
	);
}

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

function addToCart(menuType, buttonElement, priceElement, storageObject) {
	const productPrice = parseFloat(buttonElement.querySelector(".add-to-cart-price").textContent.replace("$", ""));
	// Number(null) == 0
	storageObject.setItem("cartPrice", Number(storageObject.getItem("cartPrice")) + productPrice);
	priceElement.textContent = `$${Number(storageObject.getItem("cartPrice")).toFixed(2)}`;

	// Animation
	priceElement.parentElement.classList.remove('price-display-change-flash'); // reset animation
	void priceElement.parentElement.offsetWidth; // trigger reflow
	priceElement.parentElement.classList.add('price-display-change-flash'); // start animation

	let productSize;
	try {
		productSize = buttonElement.previousElementSibling.querySelector(".card-size-customisation").value;
	} catch (e) {
		productSize = null;
	}
	const productName = productSize === "large" ? `${buttonElement.querySelector(".add-to-cart-price").id}-large` : buttonElement.querySelector(".add-to-cart-price").id;

	const cartMenuItems = storageObject.getItem(`cart${module.toSentenceCase(menuType)}Items`) == null ? {} : JSON.parse(storageObject.getItem(`cart${module.toSentenceCase(menuType)}Items`));
	if (Object.prototype.hasOwnProperty.call(cartMenuItems, productName)) {
		cartMenuItems[productName] = cartMenuItems[productName] + 1;
	} else {
		cartMenuItems[productName] = 1;
	}

	storageObject.setItem(`cart${module.toSentenceCase(menuType)}Items`, JSON.stringify(cartMenuItems));
}

function expandMinimiseCardInformation(element) {
	if (getComputedStyle(element.previousElementSibling).webkitLineClamp === "none") {
		element.previousElementSibling.style.webkitLineClamp = "2";
		element.textContent = "View more";
	} else {
		element.previousElementSibling.style.webkitLineClamp = "unset";
		element.textContent = "View less";
	}
}