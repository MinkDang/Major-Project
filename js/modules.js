export { storageLogisticValidation, toSentenceCase };

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

function toSentenceCase(str) {
	return str.toLowerCase().replace(/\w\S*/g, w => w.replace(/^\w/, c => c.toUpperCase()));
}
