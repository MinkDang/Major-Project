// _______________ Pricing _______________

var price = 0;

// Price injection
function live_price(price_element) {
	document.getElementById("price_display").innerText = "$ " + price_element.toFixed(2);
}

// Load price after all valid inputs
function price_load() {
	if (quantity_activation) {
		display_price = price * quantity_choice;
	}
	else {
		display_price = price;
	}

	// Floating error when two toppings are added and removed (negative 0)
	if (display_price < 0) {
		display_price = 0;
	}
	live_price(display_price);
}

// _______________ Order type _______________

const required_list = ["suburb", "postcode", "address", "store"];

function select_logistic(el) {
	if (el.getAttribute("for") == "delivery") {
		for (let i = 0; i < required_list.length - 1; i++) {
			let el = document.getElementById(required_list[i]);
			el.closest("div").style.display = "flex";
			el.required = true;
		}
		let el = document.getElementById(required_list[required_list.length - 1]);
		el.closest("div").style.display = "none";
		el.required = false;

		deli_choice = true;
	}
	else if (el.getAttribute("for") == "pickup") {
		for (let i = 0; i < required_list.length - 1; i++) {
			let el = document.getElementById(required_list[i]);
			el.closest("div").style.display = "none";
			el.required = false;
		}
		let el = document.getElementById(required_list[required_list.length - 1]);
		el.closest("div").style.display = "flex";
		el.required = true;

		deli_choice = false;
	}
}

// _______________ Time _______________

// Getting time limitation
function get_time() {
	// Offset timezone (toISOstring returns GMT 0)
	let tz_offset = new Date().getTimezoneOffset() * 60000;

	// Allow 15 minutes preparation for the pizzerias
	let preparation_time = new Date();
	preparation_time.setMinutes(preparation_time.getMinutes() + 14); // +14 so that 08:00 won't turn into 08:30 but into 08:15 instead

	// Min and Max of the datetime-local input setup
	// Round the time to the nearest quarter of an hour
	let datetime_min = Math.ceil(new Date(new Date(preparation_time) - tz_offset).getTime() / 900000) * 900000;
	// 30 days ordering window
	let datetime_max = datetime_min + (30 * 24 * 60 * 60 * 1000);

	datetime_min = new Date(datetime_min).toISOString().slice(0, -8);
	datetime_max = new Date(datetime_max).toISOString().slice(0, -13) + "23:59";

	return [datetime_min, datetime_max];
}

// Log time
function log_time() {
	time_value = document.querySelector('[type="datetime-local"]').value;
	console.log(time_value);
	if (!glowed) {
		glow("update");
	}
}

// Input box glowing
function glow(type = "error") {
	if (type == "success") {
		var color = 'rgba(0, 122, 116, 0.1)'; // Green
	}
	else if (type == "update") {
		var color = 'rgba(117, 92, 27, 0.1)'; // Brownish Yellow
	}
	else {
		var color = 'rgba(221, 115, 115, 0.1)'; // Red
	}
	document.querySelector('[type="datetime-local"]').setAttribute(
		"style",
		"box-shadow: " + color + " 0px -5px 10px, " + color + " 0px 8px 10px, " + color + " 0px 16px 56px; transition: all .3s;");
	setTimeout(() => {
		document.querySelector('[type="datetime-local"]').setAttribute(
			"style", "box-shadow: none; transition: all .3s;");
	}, 300);
}

// Buttons behaviour

var glowed;

function select_time(el) {

	glowed = false;

	if (el.getAttribute("for") == "now") {
		document.querySelector('[type="datetime-local"]').readOnly = true;
		document.querySelector('[type="datetime-local"]').value = get_time()[0];

		if (typeof (livetime_limit) != "undefined") {
			clearInterval(livetime_limit);
		}

		glow("success");
		glowed = true;
		log_time();
		glowed = false;

		// Update time so that time does not fall behind
		if (typeof (livetime_now) != "undefined") {
			return;
		}

		livetime_now = setInterval(function () {
			let new_time = get_time()[0];
			if (typeof (old_time) == "undefined") {
				old_time = new_time;
			}
			else if (old_time == new_time) {
				return;
			}
			else {
				document.querySelector('[type="datetime-local"]').value = new_time;
				old_time = new_time;
				log_time();
			}
		}, 1000);

	}
	else {
		time_value = undefined; // Delete time for validation purposes

		document.querySelector('[type="datetime-local"]').readOnly = false;
		document.querySelector('[type="datetime-local"]').value = "";
		document.querySelector('[type="datetime-local"]').min = get_time()[0];
		document.querySelector('[type="datetime-local"]').max = get_time()[1];

		if (typeof (livetime_now) != "undefined") {
			clearInterval(livetime_now);
		}

		livetime_limit = setInterval(function () {
			document.querySelector('[type="datetime-local"]').min = get_time()[0];
			if (glowed) {
				if (time_value < document.querySelector('[type="datetime-local"]').min) {
					document.querySelector('[type="datetime-local"]').value = get_time()[0];
					glowed = false;
					log_time();
					glowed = true;
				}
			}
		}, 1000);
	}
}

// Enforce intervals
function enforce_rules() {
	log_time();

	if (time_value < document.querySelector('[type="datetime-local"]').min) {
		document.querySelector('[type="datetime-local"]').value = get_time()[0];
		glow("error");
	}
	else if (Number(time_value.split(":").pop()) % 15 != 0) {
		let tz_offset = new Date().getTimezoneOffset() * 60000;
		let correction = Math.ceil(new Date(new Date(time_value) - tz_offset).getTime() / 900000) * 900000;
		correction = new Date(correction).toISOString().slice(0, -8);
		if (correction > get_time()[1]) {
			document.querySelector('[type="datetime-local"]').value = get_time()[1].replace("23:59", "23:45");
		}
		else {
			document.querySelector('[type="datetime-local"]').value = correction;
		}
		glow("error");
	}
	else {
		glow("success");
	}
	glowed = true;
	log_time();
}

// _______________ Pizza Random _______________

function select_random() {
	if (document.querySelector("[data-tooltip = 'Random Pizza']") != null) {
		document.querySelector("[data-tooltip = 'Random Pizza']").setAttribute('data-tooltip', '(^///^) Randomised');
	}
	setTimeout(() => {
		if (document.querySelector("[data-tooltip = '(^///^) Randomised']") != null) {
			document.querySelector("[data-tooltip = '(^///^) Randomised']").setAttribute('data-tooltip', 'Random Pizza');
		}
	}, 500);

	let base_keys = Object.keys(base_costs);
	let toppings_keys = Object.keys(toppings_costs);

	let random = Math.floor(Math.random() * base_keys.length);
	let random_key = base_keys[random];

	select_base(document.querySelector("[for=" + CSS.escape(random_key) + "]"), true);

	random_key = []
	for (let i = 0; i < toppings_keys.length * 5; i++) {
		random = Math.floor(Math.random() * toppings_keys.length);
		random_key.push(toppings_keys[random]);
	}

	for (let i = 0; i < random_key.length; i++) {
		select_toppings(document.querySelector("[for=" + CSS.escape(random_key[i]) + "]"), true);
	}
}

// _______________ Pizza Base _______________

const base_costs = {
	supreme: 17.65,
	simply_cheese: 5.5,
	margherita: 4
};

var prev_price = 0;

function select_base(el, random = null) {
	if (random != null) {
		document.getElementById(el.getAttribute("for")).checked = true;
	}
	price -= prev_price; // Deduct PREVIOUS price
	price += base_costs[el.getAttribute("for")]; // Add CURRENT price
	prev_price = base_costs[el.getAttribute("for")]; // Record CURRENT price as PREVIOUS price

	price_load();

	base_choice = el.getAttribute("for");
}

// _______________ Pizza Toppings _______________

const toppings_costs = {
	anchovies: 2,
	jalapenos: 1.8,
	olives: 2,
	parmesan: 1.3
};

var toppings_choice = [];

function select_toppings(el, random = null) {
	if (toppings_choice.includes(el.getAttribute("for"))) {
		if (random != null) {
			document.getElementById(el.getAttribute("for")).checked = false;
		}
		toppings_choice.splice(toppings_choice.indexOf(el.getAttribute("for")), 1);
		price -= toppings_costs[el.getAttribute("for")];
	}
	else {
		if (random != null) {
			document.getElementById(el.getAttribute("for")).checked = true;
		}
		toppings_choice.push(el.getAttribute("for"));
		price += toppings_costs[el.getAttribute("for")];
	}
	price_load();
}

// _______________ Quantity _______________

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

var quantity_activation = false;

function log_quantity() {
	quantity_activation = true;

	let el = document.getElementById("quantity");
	quantity_choice = Math.min(30, Math.max(parseInt(el.value), 1));

	if (isNaN(quantity_choice)) {
		quantity_choice = 0;
	}

	price_load();
}

// _______________ Payment _______________

// Trim string, supporting validation of text
const isEmpty = str => !str.trim().length;

function cardsample() {
	const sample_cardnumber = {
		AmEx: '3400 0000 0000 009',
		CarteBlanche: '3000 0000 0000 04',
		DinersClub: '3852 0000 0232 37',
		Discover: '6011 0000 0000 0004',
		EnRoute: '2014 0000 0000 009',
		JCB: '3530 111333300000',
		Maestro: '6759649826438453',
		MasterCard: '5500 0000 0000 0004',
		Solo: '6334 0000 0000 0004',
		Switch: '4903 0100 0000 0009',
		Visa: '4111 1111 1111 1111',
		VisaElectron: '4917300800000000',
		LaserCard: '6304 1000 0000 0008'
	};
	let myCardType = document.getElementById("CardType").value;
	document.getElementById("CardNumber").value = sample_cardnumber[myCardType];
}

var paid_choice = false;

function testCreditCard() {
	testCreditCard: {
		pay_attempt = false;
		let myCardNo = document.getElementById("CardNumber").value;
		let myCardType = document.getElementById("CardType").value;
		// If Credit Card field is blank then paid_chocie = false
		if (isEmpty(myCardNo)) {
			break testCreditCard;
		}

		if (checkCreditCard(myCardNo, myCardType)) {
			paid_choice = true;
			document.getElementById("CardNumber").readOnly = true;
		}
		else {
			pay_attempt = true;
			alert(ccErrors[ccErrorNo]);
		}
	}
}

// _______________ Array of records _______________

// Capitalise first letter
const toTitleCase = str => str.replace(/(^\w|\s\w)(\S*)/g, (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase());

// Check for whitespace at the beginnning of string
function firstspace(string) {
	let regex = /^\s/;
	return regex.test(string);
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
	if (typeof deli_choice == "undefined") {
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

	if (deli_choice) {
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
		store_choice = document.getElementById("store").value;
		suburb_choice = null;
		postcode_choice = null;
		address_choice = null;
	}

	if (typeof base_choice == "undefined") {
		alert("Please complete Step 4");
		return;
	}
	else if (quantity_choice == 0) {
		alert("Invalid quantity");
		return;
	}

	if (toppings_choice.length == 0) {
		toppings_choice = null;
	}

	testCreditCard();
	if (pay_attempt) {
		return;
	}

	order_summary.push(
		{
			ID: order_summary.length,
			deli: deli_choice,
			time: time_value.replace("T", " "),
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
		}
	);

	display_orders();
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

// _______________ Reset Button _______________
function reset_field() {
	// Reset all input fields 
	Array.from(document.querySelectorAll("input")).forEach(
		function (val) {
			val.checked = false;
			val.value = "";
		}
	);
	document.getElementById("quantity").value = "1";

	// Reset default visibility Step 3
	for (let i = 0; i < 4; i++) {
		document.getElementById(required_list[i]).closest("div").style.display = "none";
		document.getElementById(required_list[i]).required = false;
	}

	// Variables reset
	price = 0;
	prev_price = 0;
	quantity_choice = 1;
	quantity_activation = false;
	toppings_choice = [];
	paid_choice = false;

	// Stop time updating in now()
	if (typeof (livetime_now) != "undefined") {
		clearInterval(livetime_now);
	}

	// Turn variables to undefined for validation purposes
	let unset_variables = [
		'deli_choice',
		'time_value',
		'base_choice',
		'suburb_choice',
		'postcode_choice',
		'address_choice',
		'store_choice'
	];
	for (let i = 0; i < unset_variables.length; i++) {
		window[unset_variables[i]] = undefined;
	}

	// Reload price
	live_price(price);

	// Scroll to top
	window.scrollTo({ top: 0, behavior: 'smooth' });
}
