import { storageLogisticValidation } from "./menu/menu.js";

// || Events

// [01] Check for saved address
window.addEventListener("DOMContentLoaded", () =>
	displaySavedAddressOptions(
		localStorage, storageLogisticValidation, document.querySelector("#logistic-value-found > p")
	));

// [02] Change Address Button
document.getElementById("logistic-value-found-change").addEventListener("click", () =>
	displayChangeAddressOptions(localStorage, document.getElementById("cancel-button")));

// [03] Resume Order Button
document.getElementById("logistic-value-found-resume").addEventListener("click", () => {
	localStorage.removeItem("isEditingLogisticData");
	window.location.href = "./menu/pizza.html";
});

// [04] Cancel Change Address Button
document.getElementById("cancel-button").addEventListener("click", () => displaySavedAddressOptions(
	localStorage, storageLogisticValidation, document.querySelector("#logistic-value-found > p")
));

// [05] Switch Delivery Mode
[...document.querySelectorAll("[name=logistic]")].forEach(
	input => input.addEventListener("click", () => formGuidanceChange(input, localStorage))
);

// [06] Background Blur
document.getElementById("logistic-value-form").addEventListener("click", () => document.getElementById("background").classList.add("background-toggle"));

document.getElementById("background").addEventListener("click", () => document.getElementById("background").classList.remove("background-toggle"));

// [07] Submit Button
document.getElementById("order-now-button").addEventListener("click", () => formEmptySubmissionCheck(document.getElementById("location").value));

// [08] Dynamic Interface Change When Typing
document.getElementById("location").addEventListener("input", inputBox => formInputAppearanceControl(inputBox.target));

// [09] Prevent Enter -> Reload
document.getElementById("location").addEventListener("keydown", e => {
	if (e.key === "Enter") {
		e.preventDefault();
		return false;
	}
});

["forward-button", "backward-button"].forEach(
	input =>
		document.getElementById(input).addEventListener("keydown", e => {
			if (e.key === "Enter") {
				e.preventDefault();
				return false;
			}
		})
);

// [10]
window.addEventListener("DOMContentLoaded", () => promptForUnfinishedLogisticOrder());

// || Functions

function formGuidanceChange(element, storageObject) {
	const dataSwitch = {
		delivery: ["delivery address", "e.g. 1 Bridge Rd, Glebe"],
		pickup: ["suburb or postcode", "e.g. 2037"],
	};
	[...document.getElementsByClassName("logistic-value")].forEach(i => i.textContent = dataSwitch[element.id][0]);
	document.getElementById("location").placeholder = dataSwitch[element.id][1];
	formInputAppearanceControl(document.getElementById("location"));

	// localStorage store value as string
	if (storageObject.getItem("isEditingLogisticData") !== "true") {
		document.getElementById("cancel-button").style.display = "none";
	}
}

function formEmptySubmissionCheck(inputField) {
	if (inputField === "") {
		document.getElementById("location").focus();
		document.getElementById("location-warning").style.display = "block";
	}
}

function formInputAppearanceControl(inputBox) {
	const button = document.getElementById("order-now-button");
	const autocompleteSection = document.getElementById("autocomplete-section");

	document.getElementById("location-warning").style.display = "none";

	if (inputBox.value.length > 0) {
		button.style.display = "none";
		formAutocomplete(document.querySelector("input[name='logistic']:checked").value);
	} else {
		button.style.display = "flex";
		autocompleteSection.style.display = "none";
	}
}

function formAutocomplete(logisticType) {
	document.getElementById("autocomplete-section").style.display = "unset";

	const inputField = document.getElementById("location").value;
	if (inputField.length < 4) {
		["autocomplete-entries", "excess-result-page-switch"].forEach(element => document.getElementById(element).style.display = "none");
		document.getElementById("autocomplete-information-text").style.display = "block";
		document.getElementById("autocomplete-information-text").textContent = "Keep typing...";
		return;
	}

	document.getElementById("autocomplete-entries").style.display = "block";
	if (logisticType === "pickup") {
		autocompleteSearchPostcodes(inputField).then(postcodes => autocompleteSearchPostcodesChoices(postcodes, inputField));
	} else {
		autocompleteSearchAddress(inputField);
	}
}

async function autocompleteSearchPostcodes(searchText) {
	const response = await fetch('../assets/json/nsw_postcodes.json');
	const postcodes = await response.json();

	return postcodes.filter(data => {
		const regex = new RegExp(`^${searchText}`, "gi");
		return data.postcode.match(regex) || data.locality.match(regex);
	});

	// TODO: invalid regex when entries have "/"
}

// TODO: address check through API
function autocompleteSearchAddress(searchText) {
	document.getElementById("excess-result-page-switch").style.display = "none";
	document.getElementById("autocomplete-information-text").textContent = "Your input: ";
	const toInject =
		`<li><div class="fade-right"><p>${searchText}</p></div><button type="button">Select</button></li>`;
	document.getElementById("autocomplete-entries").innerHTML = toInject;
	autocompleteSearchProceedToOrder();
}

function autocompleteSearchPostcodesChoices(injectionData, userInput) {
	document.getElementById("autocomplete-entries").innerHTML = "";
	if (injectionData.length === 0) {
		document.getElementById("autocomplete-information-text").textContent = "The system cannot locate your input";
		return;
	}
	document.getElementById("autocomplete-information-text").innerHTML = `Found <b>${injectionData.length}</b> suburbs for <b id="user-input"></b>`;
	document.getElementById("user-input").textContent = userInput;
	const toInject = injectionData.map(postcode =>
		`<li><div><p><b>${postcode.locality}</b>, ${postcode.postcode}, NSW</p></div><button type="button">Select</button></li>`
	);

	if (toInject.length > 5) {
		autocompleteSearchPostcodeChoicesPageSwitch(document.querySelectorAll("[name=page]"), toInject);
	} else {
		document.getElementById("autocomplete-entries").innerHTML = toInject.join("");
		autocompleteSearchProceedToOrder();
	}
}

function autocompleteSearchPostcodeChoicesPageSwitch(pageSwitchButtons, pageContents) {
	document.getElementById("excess-result-page-switch").style.display = "flex";

	const finalPageCount = Math.ceil(pageContents.length / 5 - 1);
	let currentPageCount = 0;

	const forwardBackward = (buttonClicked) => {
		if ((currentPageCount === finalPageCount && buttonClicked === "forward") || (currentPageCount === 0 && buttonClicked === "backward")) {
			return;
		}

		if (buttonClicked === "start") {
			currentPageCount = 0;
		} else if (buttonClicked === "forward") {
			currentPageCount += 1;
		} else {
			currentPageCount -= 1;
		}

		document.getElementById("location").addEventListener("keydown", e => {
			if (e.key === "Enter") {
				e.preventDefault();
				return false;
			}
		});

		["forward-button", "backward-button"].forEach(button => document.getElementById(button).classList.remove("block-click"));
		if (currentPageCount === finalPageCount) {
			document.getElementById("forward-button").classList.add("block-click");
		} else if (currentPageCount === 0) {
			document.getElementById("backward-button").classList.add("block-click");
		}

		document.getElementById("autocomplete-entries").innerHTML = pageContents.slice(currentPageCount * 5, currentPageCount * 5 + 5).join("");
		autocompleteSearchProceedToOrder();
	};

	forwardBackward("start");

	[...pageSwitchButtons].forEach(
		input => input.addEventListener("click",
			() => forwardBackward(input.value))
	);
}

function autocompleteSearchProceedToOrder() {

	const startOrder = button => {
		let logisticAddress = button.previousSibling.innerText;
		const logisticType = document.querySelector("input[name='logistic']:checked").value;

		if (logisticType === "delivery") {
			logisticAddress = logisticAddress.trim().toLowerCase().replace(/\w\S*/g, w => w.replace(/^\w/, c => c.toUpperCase()));
		} else {
			logisticAddress = logisticAddress.slice(0, -3).toLowerCase().replace(/\w\S*/g, w => w.replace(/^\w/, c => c.toUpperCase())) + logisticAddress.slice(-3);
		}

		let storageLogisticData = {
			logisticAddress,
			logisticType,
		};

		localStorage.setItem("logistic", JSON.stringify(storageLogisticData));
		localStorage.removeItem("isEditingLogisticData");

		// Redirect to checkout
		if (sessionStorage.getItem("logisticDataNotFound") != null) {
			window.location.href = "./checkout/";
			sessionStorage.removeItem("logisticDataNotFound");
			return;
		}

		// Redirect normal to menu
		window.location.href = "./menu/pizza.html";
	};
	document.querySelectorAll("#autocomplete-entries button").forEach(button => button.addEventListener("click", () => startOrder(button)));
}

function displaySavedAddressOptions(storageObject, storageCheckFn, placeHolder) {
	const logisticStorageObject = JSON.parse(storageObject.getItem("logistic"));
	if (!storageCheckFn(logisticStorageObject)) {
		document.getElementById("logistic-value-found").style.display = "none";
		document.getElementById("cancel-button").style.display = "none";
		return;
	}
	document.getElementById("logistic-value-found").style.display = "flex";
	document.getElementById("logistic-option-form").style.display = "none";
	document.querySelector("#logistic-value-form fieldset").style.display = "none";
	document.getElementById("logistic-value-form").style.borderRadius = "10px";

	placeHolder.innerHTML = `${logisticStorageObject.logisticType}: <strong></strong>`;
	document.querySelector("#logistic-value-found > p > strong").textContent = logisticStorageObject.logisticAddress;
}

function displayChangeAddressOptions(storageObject, cancelButton) {
	document.getElementById("logistic-value-found").style.display = "none";
	document.getElementById("logistic-option-form").style.display = "flex";
	document.querySelector("#logistic-value-form fieldset").style.display = "flex";
	cancelButton.style.display = "unset";
	document.getElementById("logistic-value-form").style.borderRadius = "0 0 10px 10px";

	storageObject.setItem("isEditingLogisticData", true);
	document.getElementById(JSON.parse(storageObject.getItem("logistic")).logisticType).click();
}

function promptForUnfinishedLogisticOrder() {
	if (sessionStorage.getItem("logisticDataNotFound") != null) {
		document.getElementById("order-now-button").click();
	}
}