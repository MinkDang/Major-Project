// Price injection
function price_load(price_element) {
	document.getElementById("price_display").innerText = "$ " + price_element.toFixed(2);
}

// Base price display, checking for quantity
function base_price_load() {
	if (quantity_price != 0.0 || quantity_activation) {
		cal_and_display();
	}
	else {
		price_load(base_price);
	}
}

// Update price, quantity available
function cal_and_display() {
	quantity_price = base_price * quantity_choice;
	quantity_activation = true; // Fix no price update when quantity is selected before base and toppings.
	price_load(quantity_price);
}

// ********************* Variables

// Colors
color_yellow = "#E7B84B"

// Numbers
base_price = 0.0; // Price before multiplication of quantity NOT PRICE OF BASE
quantity_price = 0.0; // Price after multiplication of quantity
quantity_choice = 1; // Default quantity
prev_price = 0.0; // First previous price, use in Pizza Base

// Other data types
base_prices = { supreme: 17.65, simply_cheese: 5.5, margherita: 4.0 }; // List of objects -- Base: Price
toppings_prices = { anchovies: 2.0, jalapenos: 1.8, olives: 2.0, parmesan: 1.3 }; // List of objects -- Topping: Price
toppings_choice = []; // Declare array for Toppings
paid_choice = false; // Default paid value
quantity_activation = false; // Flag for quantity
hide_show = ["hide_1", "hide_2", "hide_3", "hide_4"];
required_list = ["suburb", "postcode", "address", "store"];

// ********************* Order type
function select_logistic(el) {
	let logistic_array = ["delivery", "pickup", "history"];

	el.style.background = color_yellow;

	logistic_array.splice(logistic_array.indexOf(el.getAttribute("for")), 1);

	logistic_array.forEach(function (val) {
		document.querySelector("[for=" + CSS.escape(val) + "]").style.background = "unset";
	});

	if (el.getAttribute("for") == "delivery") {
		for (let i = 0; i < 3; i++) {
			document.getElementById(hide_show[i]).style.display = "flex";
			document.getElementById(required_list[i]).required = true;
		}
		document.getElementById(hide_show[3]).style.display = "none";
		document.getElementById(required_list[3]).required = false;

		deli_type = true;
	}
	else if (el.getAttribute("for") == "pickup") {
		for (let i = 0; i < 3; i++) {
			document.getElementById(hide_show[i]).style.display = "none";
			document.getElementById(required_list[i]).required = false;
		}
		document.getElementById(hide_show[3]).style.display = "flex";
		document.getElementById(required_list[3]).required = true;

		deli_type = false;
	}
	else {
		deli_type = undefined;
		alert("Not available");
		reset_field();
	}
}

// ********************* Time
// Offsetting ISO time
function get_time() {
	let tzoffset = new Date().getTimezoneOffset() * 60000;
	dateTime = new Date(Date.now() - tzoffset).toISOString().slice(0, -8);
	return dateTime;
}

// Buttons behaviour
function select_time(el) {
	el.style.background = color_yellow;

	if (el.getAttribute("for") == "now") {
		document.querySelector('[for="later"]').style.background = "unset";

		document.querySelector('input[type="datetime-local"]').readOnly = true;
		document.querySelector('input[type="datetime-local"]').value =
			get_time();

		// Update time so that time does not fall behind
		livetime_now = setInterval(function () {
			document.querySelector('input[type="datetime-local"]').value =
				get_time();
		}, 1000);

		log_time();
	}
	else {
		document.querySelector('[for="now"]').style.background = "unset";

		time_value = undefined; // Delete time for validation purposes

		document.querySelector('input[type="datetime-local"]').readOnly = false;
		document.querySelector('input[type="datetime-local"]').value = "";
		document.querySelector('input[type="datetime-local"]').min = get_time();

		clearInterval(livetime_now); // Stop time updating in now()
	}
}

// Log time
function log_time() {
	time_value = document.querySelector('input[type="datetime-local"]').value.replace("T", " ");
}

// ********************* Pizza base

function select_base(el) {
	let base_prices_keys = ["supreme", "simply_cheese", "margherita"]; // Reset array
	base_prices_keys.splice(base_prices_keys.indexOf(el.getAttribute("for")), 1); // Remove CURRENT base out of array

	// Turn OFF background color of OTHER base
	for (let i = 0; i < base_prices_keys.length; i++) {
		document.querySelector("[for=" + CSS.escape(base_prices_keys[i]) + "]").style.background = "unset"
	}

	el.style.background = color_yellow

	base_price -= prev_price; // Deduct PREVIOUS price
	base_price += base_prices[el.getAttribute("for")]; // Add CURRENT price
	prev_price = base_prices[el.getAttribute("for")]; // Record CURRENT price as PREVIOUS price

	base_price_load();

	base_choice = el.getAttribute("for");
}

// ********************* Pizza Toppings

function select_toppings(el) {
	// If toppings ADDED
	if (toppings_choice.includes(el.getAttribute("for"))) {
		document.querySelector("[for=" + CSS.escape(el.getAttribute("for")) + "]").style.background = "unset"
		toppings_choice.splice(toppings_choice.indexOf(el.getAttribute("for")), 1);
		base_price -= toppings_prices[el.getAttribute("for")];

		base_price_load();
	}
	// If toppings NOT ADDED
	else {
		document.querySelector("[for=" + CSS.escape(el.getAttribute("for")) + "]").style.background = color_yellow
		toppings_choice.push(el.getAttribute("for"));
		base_price += toppings_prices[el.getAttribute("for")];

		base_price_load();
	}
}

// ********************* Quantity

// Autocorrection into min and max
function imposeMinMax(el) {
	if (el.value != "") {
		if (parseInt(el.value) < parseInt(el.min)) {
			el.value = el.min;
		}
		if (parseInt(el.value) > parseInt(el.max)) {
			el.value = el.max;
		}
	}
}

// Log quantity
function log_quantity() {
	let el = document.getElementById("quantity");
	quantity_choice = Math.min(30, Math.max(parseInt(el.value), 1));

	if (isNaN(quantity_choice)) {
		quantity_choice = 0;
	}

	cal_and_display();
}

// ********************* Payment

// Trim string, supporting validation of text
const isEmpty = str => !str.trim().length;

function testCreditCard() {
	testCreditCard: {
		pay_attempt = false;
		myCardNo = document.getElementById("CardNumber").value;
		myCardType = document.getElementById("CardType").value;
		// If Credit Card field is blank then paid_chocie = false
		if (isEmpty(myCardNo)) {
			break testCreditCard;
		}

		if (checkCreditCard(myCardNo, myCardType)) {
			paid_choice = true;
			document.getElementById("CardNumber").readOnly = true; // Lock card field after successful attempt
		}
		else {
			pay_attempt = true;
			alert(ccErrors[ccErrorNo]);
		}
	}
}

// ********************* Array of records

// Capitalise first letter
const toTitleCase = str => str.replace(/(^\w|\s\w)(\S*)/g, (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase())

// Check for whitespace at the beginnning of string
function firstspace(string) {
	let regex = /^\s/
	return regex.test(string)
}

// Validate phone
function validate_phone(phone) {
	let regex = /[0-9]{10}/;
	return regex.test(phone);
}

// Validate postcode
function validate_postcode(pc) {
	let regex = /[0-9]{4}/;
	return regex.test(pc);
}

// Validate name, suburb
function validate_name(name) {
	if (firstspace(name)) {
		return false;
	}
	let regex = /^[A-Za-z\s]+$/;
	return regex.test(name);
}

// Validate address
function validate_address(address) {
	if (firstspace(address)) {
		return false;
	}
	let regex =
		/\d+[ ](?:[A-Za-z0-9.-]+[ ]?)+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Dr|Rd|Blvd|Ln|St|Cl)\.?/;
	return regex.test(address);
}

// Main function
function push_obj() {
	if (typeof deli_type == "undefined") {
		alert("Please complete Step 1");
		return;
	}
	else if (typeof time_value == "undefined") {
		alert("Please complete Step 2");
		return;
	}
	else if (!validate_name(document.getElementById("f_name").value)) {
		alert("Invalid First Name");
		return;
	}
	else if (!validate_name(document.getElementById("l_name").value)) {
		alert("Invalid Last Name");
		return;
	}
	else if (!validate_phone(document.getElementById("phone").value)) {
		alert("Invalid Phone Number");
		return;
	}

	if (deli_type) {
		if (!validate_name(document.getElementById("suburb").value)) {
			alert("Invalid Suburb");
			return;
		}
		else {
			suburb_choice = document.getElementById("suburb").value;
		}
		if (!validate_postcode(document.getElementById("postcode").value)) {
			alert("Invalid Post Code");
			return;
		}
		else {
			postcode_choice = document.getElementById("postcode").value;
		}
		if (!validate_address(toTitleCase(document.getElementById("address").value))) {
			alert("Invalid Address Or Try This Address 1 A Rd");
			return;
		}
		else {
			address_choice = toTitleCase(document.getElementById("address").value);
		}
		store_choice = null;
	}
	else {
		let select = document.getElementById("store");
		store_choice = select.options[select.selectedIndex].value;
		suburb_choice = null;
		postcode_choice = null;
		address_choice = null;
	}

	if (typeof base_choice == "undefined") {
		alert("Please complete Step 4");
		return;
	}
	else if (toppings_choice.length == 0) {
		alert("Please select at least 1 topping");
		return;
	}
	else if (quantity_choice == 0) {
		alert("Invalid quantity");
		return;
	}

	testCreditCard();
	if (pay_attempt) {
		return;
	}

	order_summary.push({
		ID: order_summary.length,
		deli: deli_type,
		time: time_value,
		f_name: toTitleCase(document.getElementById("f_name").value),
		l_name: toTitleCase(document.getElementById("l_name").value),
		phone: document.getElementById("phone").value,
		suburb: suburb_choice,
		postcode: postcode_choice,
		address: address_choice,
		store: store_choice,
		base: base_choice,
		toppings: toppings_choice,
		quantity: quantity_choice,
		paid: paid_choice,
	});

	display_orders();
}

// Reset form stub
function reset_field() {
	// Reset all color
	Array.from(document.querySelectorAll(".box > label")).forEach(
		function (val) {
			val.style.background = "none";
		}
	);

	// Reset default visibility Step 3
	for (let i = 0; i < 4; i++) {
		document.getElementById(hide_show[i]).style.display = "none";
		document.getElementById(required_list[i]).required = false;
	}

	// Reset all input
	Array.from(document.querySelectorAll("input")).forEach(
		function (val) {
			val.value = "";
		}
	);
	document.getElementById("quantity").value = "1";

	// Variables reset
	quantity_price = 0.0;
	base_price = 0.0;
	prev_price = 0.0;
	quantity_choice = 1;
	toppings_choice = [];
	paid_choice = false;
	quantity_activation = false;

	// Stop time updating in now()
	clearInterval(livetime_now);

	// Turn variables to undefined for validation purposes
	let unset_variables = [deli_type, time_value, base_choice, suburb_choice, postcode_choice, address_choice, store_selection];
	for (let i = 0; i < unset_variables.length; i++) {
		unset_variables[i] = undefined;
	}

	// Reload price
	price_load(base_price);
}

// Inject order_summary
function display_orders() {
	let strStList = "";
	for (let i = 0; i < order_summary.length; i++) {
		strStList +=
			"ID: " + order_summary[i].ID +
			" - Delivery: " + order_summary[i].deli +
			" - Time: " + order_summary[i].time +
			" - F.Name: " + order_summary[i].f_name +
			" - L.Name: " + order_summary[i].l_name +
			" - Phone: " + order_summary[i].phone +
			" - Suburb: " + order_summary[i].suburb +
			" - Postcode: " + order_summary[i].postcode +
			" - Address: " + order_summary[i].address +
			" - Store: " + order_summary[i].store +
			" - Base: " + order_summary[i].base +
			" - Toppings: " + order_summary[i].toppings +
			" - Quantity: " + order_summary[i].quantity +
			" - Paid: " + order_summary[i].paid +
			"\n";
	}
	document.querySelector('textarea').value = strStList;
}

// First record
order_summary = [
	{
		ID: 1,
		deli: true,
		time: "2021-10-20 10:20",
		f_name: "Minh",
		l_name: "Dang",
		phone: "0414243454",
		suburb: "Glebe",
		postcode: "2037",
		address: "12 Taylor St",
		store: null,
		base: "supreme",
		toppings: ["olives", "parmesan"],
		quantity: 1,
		paid: true,
	},
];
