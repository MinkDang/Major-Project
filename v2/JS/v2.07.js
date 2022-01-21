document.onreadystatechange = () => {
	if (document.readyState === 'complete') {
		chromeTimeInputStyling();
		injectPrice(price);
		injectArrayOfRecords();
		submitClickability();
	}
};

["keyup", "click"].forEach(
	event => document.querySelector("main").addEventListener(event, () => submitClickability())
);

function chromeTimeInputStyling() {
	if (window.chrome) {
		document.querySelector("[type=datetime-local]").style.width = '275px';
	}
}

// _______________ Pricing _______________

let price = 0;

// Price injection
const injectPrice = priceElement => document.getElementById("price-data").textContent = `$ ${priceElement.toFixed(2)}`;

// Load price after all valid inputs
let quantityChoice = 1;

function calculateFinalPrice() {
	let displayPrice = quantityActivation ? price * quantityChoice : price;

	// Floating error when two toppings are added and removed (negative 0)
	if (displayPrice < 0) {
		displayPrice = 0;
	}

	injectPrice(displayPrice);
}

// _______________ Order type _______________

const inputLogisticToggle = ["suburb", "postcode", "address", "store"];
let deliveryChoice;

function selectLogistic(el) {
	if (el.id === "history") {
		document.activeElement.blur();
		onSiteNotification("info", "Feature is not available");
		resetButton();
		return;
	}

	// Show or hide of different inputs base on logistics
	const inputLogisticDictSwitch = {
		delivery: { displayDelivery: "flex", requiredDelivery: true, displayPickup: "none", requiredPickup: false },
		pickup: { displayDelivery: "none", requiredDelivery: false, displayPickup: "flex", requiredPickup: true },
	};

	inputLogisticToggle.forEach(
		(input, index, array) => {
			if (index === array.length - 1) {
				document.getElementById(input).closest("div").style.display = inputLogisticDictSwitch[el.id].displayPickup;
				document.getElementById(input).required = inputLogisticDictSwitch[el.id].requiredPickup;
			} else {
				document.getElementById(input).closest("div").style.display = inputLogisticDictSwitch[el.id].displayDelivery;
				document.getElementById(input).closest("div").required = inputLogisticDictSwitch[el.id].requiredDelivery;
			}
		}
	);

	deliveryChoice = (el.id === "delivery");
}

[...document.querySelectorAll("[name=logistic]")].forEach(
	i => i.addEventListener("click", () => selectLogistic(i))
);

// _______________ Time _______________

// Getting time restrictions
function restrictingTime() {
	// Offset timezone (toISOstring returns GMT 0)
	const offsetTimeZone = new Date().getTimezoneOffset() * 60000;

	// Allow 15 minutes preparation for the pizzerias
	const preparationTime = new Date();
	preparationTime.setMinutes(preparationTime.getMinutes() + 14); // +14 so that 08:00 won't turn into 08:30 but into 08:15 instead

	// Min and Max of the datetime-local input setup
	// Round the time to the nearest quarter of an hour
	let minTime = Math.ceil(new Date(new Date(preparationTime) - offsetTimeZone).getTime() / 900000) * 900000;

	// 30 days ordering window
	let maxTime = minTime + (30 * 24 * 60 * 60 * 1000);

	minTime = new Date(minTime).toISOString().slice(0, -8);
	maxTime = `${new Date(maxTime).toISOString().slice(0, -13)}23:59`;

	return [minTime, maxTime];
}

// Log time
let timeValue;

function logTime() {
	timeValue = document.querySelector("[type=datetime-local]").value;

	if (!glowed) {
		glowTimeInput("update");
	}
}

// Input box glowing
function glowTimeInput(type = "error") {
	const colorDict = {
		success: "rgba(0, 122, 116, 0.1)",
		update: "rgba(117, 92, 27, 0.1)",
		error: "rgba(221, 115, 115, 0.1)",
	};

	const boxShadow = `${colorDict[type]} 0px -5px 10px, ${colorDict[type]} 0px 8px 10px, ${colorDict[type]} 0px 16px 56px`;
	document.querySelector("[type=datetime-local]").style.boxShadow = boxShadow;

	setTimeout(() => {
		document.querySelector("[type=datetime-local]").style.boxShadow = "none";
		document.querySelector("[type=datetime-local]").style.transition = "all .3s";
	}, 300);
}

// Buttons behaviour

let glowed;

function selectTime(el) {
	glowed = false;

	const timeInput = document.querySelector("[type=datetime-local]");

	if (el.id === "now") {
		timeInput.readOnly = true;
		timeInput.value = restrictingTime()[0];

		if (typeof window.livetime_limit != "undefined") {
			clearInterval(window.livetime_limit);
		}

		glowTimeInput("success");
		glowed = true;
		logTime();

		if (typeof livetime_now != "undefined") {
			return;
		}

		window.livetime_now = setInterval(() => enforceTimeRestrictions(true), 1000);
	} else {
		timeValue = undefined; // Delete time for validation purposes

		timeInput.readOnly = false;
		timeInput.value = "";
		[timeInput.min, timeInput.max] = restrictingTime();

		if (typeof window.livetime_now != "undefined") {
			window.clearInterval(window.livetime_now);
		}

		window.livetime_limit = setInterval(() => {
			if (!glowed) {
				[timeInput.min, timeInput.max] = restrictingTime();
			} else {
				enforceTimeRestrictions(true);
			}
		}, 1000);
	}
}

[...document.querySelectorAll("[name=time]")].forEach(
	i => i.addEventListener("click", () => selectTime(i))
);

// Enforce time restrictions
function enforceTimeRestrictions(update = null) {
	logTime();

	const timeInput = document.querySelector("[type=datetime-local]");

	[timeInput.min, timeInput.max] = restrictingTime();

	if (timeValue < timeInput.min) {
		timeInput.value = restrictingTime()[0];

		update ? glowTimeInput("update") : glowTimeInput("error");
	} else if (Number(timeValue.split(":").pop()) % 15 !== 0) {
		const offsetTimeZone = new Date().getTimezoneOffset() * 60000;
		let correction = Math.ceil(new Date(new Date(timeValue) - offsetTimeZone).getTime() / 900000) * 900000;
		correction = new Date(correction).toISOString().slice(0, -8);

		timeInput.value = (correction > restrictingTime()[1]) ? restrictingTime()[1].replace("23:59", "23:45") : correction;

		glowTimeInput("error");
	} else {
		if (!update) {
			glowTimeInput("success");
		}
	}

	glowed = true;
	logTime();
}

document.querySelector("[type=datetime-local]").addEventListener("change", () => enforceTimeRestrictions());

// _______________ Pizza Random _______________

function selectPizzaRandom() {
	if (document.querySelector("[data-tooltip = 'Random Pizza']") != null) {
		document.getElementById("random-button").setAttribute("data-tooltip", "(^///^) Randomised");
	}

	setTimeout(() => {
		if (document.querySelector("[data-tooltip = '(^///^) Randomised']") != null) {
			document.getElementById("random-button").setAttribute("data-tooltip", "Random Pizza");
		}
	}, 500);

	const base_keys = Object.keys(baseCosts);
	const toppings_keys = Object.keys(toppingsCosts);

	let random = Math.floor(Math.random() * base_keys.length);
	let randomSelection = base_keys[random];

	selectBase(document.getElementById(randomSelection), true);

	randomSelection = [];

	for (let i = 0; i < toppings_keys.length * 5; i += 1) {
		random = Math.floor(Math.random() * toppings_keys.length);
		randomSelection.push(toppings_keys[random]);
	}

	randomSelection.forEach(i => selectToppings(document.getElementById(i), true));
}

document.getElementById("random-button").addEventListener("click", () => selectPizzaRandom());

// _______________ Pizza Base _______________

const baseCosts = {
	supreme: 17.65,
	simply_cheese: 5.5,
	margherita: 4,
};

let previousPrice = 0;
let baseChoice;

function selectBase(el, random = null) {
	if (random) {
		el.click();
	}

	price -= previousPrice; // Deduct PREVIOUS price
	price += baseCosts[el.id]; // Add CURRENT price
	previousPrice = baseCosts[el.id]; // Record CURRENT price as PREVIOUS price

	calculateFinalPrice();

	baseChoice = el.id;
}

[...document.querySelectorAll("[name=pizza_base]")].forEach(
	i => i.addEventListener("click", () => selectBase(i))
);

// _______________ Pizza Toppings _______________

const toppingsCosts = {
	anchovies: 2,
	jalapenos: 1.8,
	olives: 2,
	parmesan: 1.3,
};

const toppingsChoice = [];

function selectToppings(el, random = null) {
	if (toppingsChoice.includes(el.id)) {
		if (random) {
			document.getElementById(el.id).checked = false;
		}

		toppingsChoice.splice(toppingsChoice.indexOf(el.id), 1);
		price -= toppingsCosts[el.id];
	} else {
		if (random) {
			document.getElementById(el.id).checked = true;
		}

		toppingsChoice.push(el.id);
		price += toppingsCosts[el.id];
	}

	calculateFinalPrice();
}

[...document.querySelectorAll("[name=pizza_toppings]")].forEach(
	i => i.addEventListener("click", () => selectToppings(i))
);

// _______________ Quantity _______________

function imposeMinMax(el) {
	if (el.value !== "") {
		const glowQuantityInput = () => {
			el.setAttribute(
				"style",
				"box-shadow: rgba(221, 115, 115, 0.1) 0px -5px 10px, rgba(221, 115, 115, 0.1) 0px 8px 10px, rgba(221, 115, 115, 0.1) 0px 16px 56px; transition: all .3s;");
			setTimeout(() => el.setAttribute("style", "box-shadow: none; transition: all .3s;"), 300);
		};

		if (parseInt(el.value) < parseInt(el.min)) {
			el.value = el.min;
			glowQuantityInput();
		} else if (parseInt(el.value) > parseInt(el.max)) {
			el.value = el.max;
			glowQuantityInput();
		}
	}
}

document.getElementById("quantity").addEventListener("keyup", (element) => imposeMinMax(element.target));

let quantityActivation = false;

function logQuantity() {
	quantityActivation = true;

	const el = document.getElementById("quantity");
	quantityChoice = Math.min(30, Math.max(parseInt(el.value), 1));

	if (Number.isNaN(quantityChoice)) {
		quantityChoice = 0;
	}

	calculateFinalPrice();
}

document.getElementById("quantity").addEventListener("input", () => logQuantity());

// _______________ Payment _______________

const isEmpty = str => !str.trim().length;

function injectCardSample() {
	const cardSamples = {
		AmEx: '3400 0000 0000 009',
		CarteBlanche: '3000 0000 0000 04',
		DinersClub: '3852 0000 0232 37',
		Discover: '6011 0000 0000 0004',
		EnRoute: '2014 0000 0000 009',
		JCB: '3530 111333300000',
		Maestro: '6759 6498 2643 8453',
		MasterCard: '5500 0000 0000 0004',
		Solo: '6334 0000 0000 0004',
		Switch: '4903 0100 0000 0009',
		Visa: '4111 1111 1111 1111',
		VisaElectron: '4917 3008 0000 0000',
		LaserCard: '6304 1000 0000 0008',
	};

	const myCardType = document.getElementById("card-type").value;
	document.getElementById("card-number").value = cardSamples[myCardType];
}

document.getElementById("autofill-card").addEventListener("click",
	() => {
		injectCardSample();
		testCreditCardNumber(true);
	}
);

let paidChoice = false;

function testCreditCardNumber(autofill = null) {
	let msg;
	let invalidAttempt;

	testCreditCardNumber: {
		if (autofill) {
			msg = "";
			paidChoice = true;
			invalidAttempt = false;
			break testCreditCardNumber;
		}

		invalidAttempt = false;
		const myCardNo = document.getElementById("card-number").value;
		const myCardType = document.getElementById("card-type").value;

		if (isEmpty(myCardNo)) {
			msg = "";
			break testCreditCardNumber;
		}

		/* global checkCreditCard */
		if (checkCreditCard(myCardNo, myCardType)) {
			paidChoice = true;
			msg = "";
		} else {
			invalidAttempt = true;
			/* global ccErrors, ccErrorNo */
			msg = ccErrors[ccErrorNo];
		}
	}

	document.getElementById("cc-message").textContent = msg;
	return invalidAttempt;
}

["card-type", "card-number"].forEach(
	id => document.getElementById(id).addEventListener("input", () => testCreditCardNumber())
);

// _______________ Array of records _______________

const toTitleCase = str => str.replace(/(^\w|\s\w)(\S*)/g, (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase());

const checkPhone = phone => /^0([1-5]|[7-8])\d{8}/.test(phone);

const checkPostcode = code => /^2(([0-5]\d{2})|([6-8](([1][9])|([2-9]\d)))|([9](([2][1-9])|[3-9]\d)))/.test(code);

const checkName = name => /^[a-zA-z,.'-]{2,}( [a-zA-z,.'-]+)*$/.test(name);

const checkAddress = address =>
	/\d+(\/\d+[A-za-z]?)? ([A-Za-z0-9]+ )+(Avenue|Lane|Road|Boulevard|Drive|Street|Close|Crescent|Cres|Ave|Dr|Rd|Blvd|Ln|St|Cl)\.?$/.test(address);

const checkQuantity = quantity => /^([1-9]|[1-2][0-9]|30)$/.test(quantity);

function submitClickability() {
	document.getElementById('submit-button').style.opacity = 0.5;

	if (typeof deliveryChoice == "undefined") {
		return "Step 1 Incompleted";
	} else if (typeof timeValue == "undefined") {
		return "Step 2 Incompleted";
	} else if (!checkName(document.getElementById("f-name").value)) {
		return "Invalid First Name";
	} else if (!checkName(document.getElementById("l-name").value)) {
		return "Invalid Last Name";
	} else if (!checkPhone(document.getElementById("phone").value)) {
		return "Invalid Phone Number";
	}

	if (deliveryChoice) {
		if (!checkName(document.getElementById("suburb").value)) {
			return "Invalid Suburb";
		} else if (!checkPostcode(document.getElementById("postcode").value)) {
			return "Invalid Post Code";
		} else if (!checkAddress(toTitleCase(document.getElementById("address").value))) {
			return "Invalid Address";
		}
	}

	if (typeof baseChoice == "undefined") {
		return "Step 4 Incompleted";
	} else if (!checkQuantity(document.getElementById("quantity").value)) {
		return "Invalid quantity";
	}

	if (testCreditCardNumber()) {
		return "Check Payment Information";
	}

	document.getElementById('submit-button').style.opacity = 1;
}

// Message when hover over submit button when form is unfinished
function submitHoverMessage() {
	const msg = submitClickability();

	if (typeof msg != "undefined") {
		if (msg.includes("Invalid") && !msg.includes("Quantity")) {
			document.getElementById("contacts").reportValidity();
		}

		document.getElementById('submit-button').setAttribute("data-tooltip", msg);
	} else {
		document.getElementById('submit-button').removeAttribute("data-tooltip");
	}
}

document.getElementById("submit-button").addEventListener("mouseover", () => submitHoverMessage());

function appendRecord() {
	if (submitClickability()) {
		onSiteNotification("error", submitClickability());
		return;
	}

	// Handling of different inputs data causing by logistics
	const inputLogisticDictSwitch = {
		true: { dataDelivery: "document.getElementById(input).value", dataPickup: null },
		false: { dataDelivery: null, dataPickup: "document.getElementById(input).value" },
	};

	// Avoiding making these input choices global
	const inputLogisticDict = {};

	inputLogisticToggle.forEach(
		(input, index, array) => {
			if (index === array.length - 1) {
				eval(`${input}Choice = "${eval(inputLogisticDictSwitch[deliveryChoice].dataPickup)}"`);
			} else {
				eval(`${input}Choice = "${eval(inputLogisticDictSwitch[deliveryChoice].dataDelivery)}"`);
			}
			inputLogisticDict[`${input}Choice`] = eval(`${input}Choice`);
		}
	);

	// Handling of toppings
	if (toppingsChoice.length === 0) {
		toppingsChoice.push(null);
	}

	orderRecords.push(
		{
			ID: orderRecords.length + 1,
			Deli: deliveryChoice,
			Time: timeValue.replace("T", " "),
			F_name: toTitleCase(document.getElementById("f-name").value),
			L_name: toTitleCase(document.getElementById("l-name").value),
			Phone: document.getElementById("phone").value,
			Suburb: (inputLogisticDict.suburbChoice === "null") ? null : toTitleCase(inputLogisticDict.suburbChoice),
			Postcode: inputLogisticDict.postcodeChoice,
			Address: (inputLogisticDict.addressChoice === "null") ? null : toTitleCase(inputLogisticDict.addressChoice),
			Store: inputLogisticDict.storeChoice,
			Base: baseChoice,
			Toppings: toppingsChoice,
			Quantity: quantityChoice,
			Paid: paidChoice,
		}
	);

	injectArrayOfRecords();

	// Scroll textarea to bottom
	let textArea = document.querySelector("textarea");
	textArea.scrollTop = textArea.scrollHeight;

	onSiteNotification("success", "Order Submitted");
}

document.getElementById("submit-button").addEventListener("click", () => appendRecord());

function injectArrayOfRecords() {
	let strStList = "";

	orderRecords.forEach(
		recordIteration => {
			strStList += `ID: ${recordIteration.ID} - Delivery: ${recordIteration.Deli} - Time: ${recordIteration.Time}`
				+ ` - F.Name: ${recordIteration.F_name} - L.Name: ${recordIteration.L_name} - Phone: ${recordIteration.Phone}`
				+ ` - Suburb: ${recordIteration.Suburb} - Postcode: ${recordIteration.Postcode} - Address: ${recordIteration.Address}`
				+ ` - Store: ${recordIteration.Store}`
				+ ` - Base: ${recordIteration.Base} - Toppings: ${recordIteration.Toppings} - Quantity: ${recordIteration.Quantity}`
				+ ` - Paid: ${recordIteration.Paid}\n\n`;
		}
	);

	document.querySelector('textarea').value = strStList;
}

// First record
const orderRecords = [
	{
		ID: 1,
		Deli: true,
		Time: "2021-10-20 10:20",
		F_name: "Minh",
		L_name: "Dang",
		Phone: "0414243454",
		Suburb: "Glebe",
		Postcode: "2037",
		Address: "12 Taylor St",
		Store: null,
		Base: "supreme",
		Toppings: ["olives", "parmesan"],
		Quantity: 1,
		Paid: true,
	},
];

// _______________ Reset Button _______________

function resetButton() {
	// Reset all input fields
	[...document.querySelectorAll("input:checked")].forEach(i => i.checked = false);
	[...document.querySelectorAll("input:not([type=radio],[type=checkbox])")].forEach(i => i.value = "");
	document.getElementById("quantity").value = "1";

	// Reset default visibility Step 3
	inputLogisticToggle.forEach(
		inputIteration => {
			document.getElementById(inputIteration).closest("div").style.display = "none";
			document.getElementById(inputIteration).required = false;
		}
	);

	// Variables reset
	price = 0;
	previousPrice = 0;
	quantityChoice = 1;
	quantityActivation = false;
	toppingsChoice.length = 0;
	paidChoice = false;

	// Stop all intervals
	if (typeof window.livetime_now != "undefined") {
		clearInterval(window.livetime_now);
	}

	if (typeof window.livetime_limit != "undefined") {
		clearInterval(window.livetime_limit);
	}

	// Turn variables to undefined for validation purposes
	let resetVariables = ['deliveryChoice', 'timeValue', 'baseChoice'];

	resetVariables.forEach(i => eval(`${resetVariables[i]} = undefined`));

	// Reload price
	injectPrice(price);

	// Scroll to top
	window.scrollTo({ top: 0, behavior: 'smooth' });
	onSiteNotification("info", "Order Successfully Resetted", 2500);
}

document.getElementById("reset-button").addEventListener("click", () => resetButton());

function onSiteNotification(type, msg, duration = null, specifyType = null) {
	// type acceptable values = "info", "error", "success"
	const random_id = Date.now().toString(36).replace(/[^a-z]+/g, '');
	const htmlContent = `
	<div>
		<span id="notification-type">${specifyType ? specifyType : type}</span>
		<button type="button" title="Close">X</button>
	</div>
	<span id="notification-details">${msg}</span>
	`;

	const newParentDiv = document.createElement("div");
	newParentDiv.classList.add("notification", type);
	newParentDiv.setAttribute("id", random_id);

	document.getElementById("notification-area").appendChild(newParentDiv);
	document.getElementById(random_id).innerHTML = htmlContent;

	document.querySelector(`#${random_id} [title=Close]`).addEventListener(
		"click", (element) => closeOnSiteNotification(element.target)
	);

	window[random_id] = setTimeout(() => {
		const toRemove = document.getElementById(random_id);
		toRemove.classList.add("notification-remove");
		setTimeout(() => {
			toRemove.remove();
			delete window[random_id];
		}, 500);
	}, duration ? duration : 5000);
}

["Account", "Dark Mode", "Pizzeria Interface"].forEach(
	data => document.querySelector(`[data-tooltip="${data}"]`).addEventListener(
		"click", () => onSiteNotification("info", `${data} feature is not available`)
	)
);

function closeOnSiteNotification(el) {
	const elementToRemove = el.closest("#notification-area > div");
	const timeoutToRemove = elementToRemove.getAttribute("id");

	clearTimeout(window[timeoutToRemove]);
	delete window[timeoutToRemove];

	elementToRemove.classList.add("notification-remove");
	setTimeout(() => elementToRemove.remove(), 500);
}
