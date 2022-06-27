// Set multiple attributes at once instead of Element.setAttribute()
function setAttributes(element, attributes) {
	Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

// Possible check for localStorage tampering
function storageLogisticValidation(logisticStorageObject) {
	if (logisticStorageObject === null) {
		return false;
	}
	if ("logisticAddress" in logisticStorageObject && "logisticType" in logisticStorageObject) {
		if (logisticStorageObject.logisticType === "pickup") {
			const regex = /^\w*( \w*)*, \d{4}, NSW/i;
			if (!regex.test(logisticStorageObject.logisticAddress)) {
				return false;
			}
		}
	} else {
		return false;
	}
	return true;
}

// Display address after running check
function displayLogisticData(storageObject, storageCheckFn) {
	if (!storageCheckFn(storageObject)) {
		document.getElementById("logistic-display").style.display = "none";
		return;
	}
	document.getElementById("logistic-display").style.display = "flex";

	// Injection
	document.getElementById("logistic-option").textContent =
		storageObject.logisticType === "pickup" ? "Pickup: " : "Delivery: ";

	document.getElementById("logistic-address").textContent = storageObject.logisticAddress;
	document.getElementById("logistic-address").setAttribute('title', `Click to change the address: ${storageObject.logisticAddress}`);

	// TODO: Parse with correct capitalisation
}

function calculateAmountOfLines(element) {
	let divHeight = element.offsetHeight;
	let lineHeight = parseInt(getComputedStyle(element).lineHeight);
	return Math.floor(divHeight / lineHeight);
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

function filterMenu() {
	// Get everything shown again to be hidden later
	[...document.getElementsByClassName("menu-card")].forEach(menuCard => menuCard.style.display = "flex");

	// Start hiding based on data-tag-${checkbox.value} attributes on div.menu-card
	[...document.querySelectorAll("[name='menu-filter']:checked")].forEach(
		checkbox => {
			[...document.querySelectorAll(`.menu-card:not([data-tag-${checkbox.value} = "true"])`)].forEach(menuCard => menuCard.style.display = "none");
		}
	);

	// TODO: Hide empty sections
}

export { setAttributes, storageLogisticValidation, displayLogisticData, calculateAmountOfLines, expandMinimiseCardInformation, filterMenu };