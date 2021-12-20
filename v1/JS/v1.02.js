// ********************* Recycle functions
// Color changing button
function color_change(IdName, change) {
    if (change == true) {
        document.getElementById(IdName).style.background='#E7B84B';
    }
    if (change == false) {
        document.getElementById(IdName).style.background='unset';
    }
}

// Price injection
function price_load(price_element) {
    document.getElementById("price_display").innerText = '$ '+ price_element.toFixed(2);
}

// Base price display, checking for quantity
function base_price_load() {
    if (quantity_price != 0.00) {
        cal_and_display();
    }
    else {
        price_load(base_price);
    }
}

// ********************* Variables

// Numbers
base_price = 0.00; // Price before multiplication of quantity NOT PRICE OF BASE
quantity_price = 0.00; // Price after multiplication of quantity
quantity = 1; // Default quantity
prev_price = 0; // First previous price, use in Pizza Base

// Other data types
base_prices = {'supreme': 17.65, 'cheese': 5.50, 'margherita': 4.00}; // List of objects -- Base: Price
toppings_prices = {'anchovies': 2.00, 'jalapenos': 2.00, 'olives': 2.00, 'parmesan': 1.30}; // List of objects -- Topping: Price
toppings = []; // Declare array for Toppings

// ********************* Delivery type
// Delivery btn
function delivery() {
    color_change('delivery', true);
    color_change('pickup', false);
    Array.from(document.querySelectorAll("#street, #postcode, #suburb")).forEach(
        function(val) {
            val.style.display = 'flex';
            val.required = true;
        }   
    );
    document.getElementById('store').style.display='none';
    document.getElementById('store').required = false;
    deli = true;
}

// Pick btn
function pickup() {
    color_change('pickup', true);
    color_change('delivery', false);
    Array.from(document.querySelectorAll("#street, #postcode, #suburb")).forEach(
        function(val) {
            val.style.display = 'none';
            val.required = false;
        }
    );
    document.getElementById('store').style.display='flex';
    document.getElementById('store').required = true;
    deli = false;
}

// ********************* Time
// Offsetting ISO time
function get_time() {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    dateTime = new Date(Date.now() - tzoffset).toISOString().slice(0, -8);
    return dateTime;
}

// Now btn
function now() {
    color_change('now', true);
    color_change('later', false);
    document.querySelector('input[type="datetime-local"]').readOnly = true;
    document.querySelector('input[type="datetime-local"]').value = get_time();
    livetime_now = setInterval(function(){
        document.querySelector('input[type="datetime-local"]').value = get_time();
    }, 1000);
    log_time();
}

// Later btn
function later() {
    color_change('later', true);
    color_change('now', false);
    document.querySelector('input[type="datetime-local"]').readOnly = false;
    document.querySelector('input[type="datetime-local"]').value='';
    document.querySelector('input[type="datetime-local"]').min = get_time();
    clearInterval(livetime_now);
}

// Log time
function log_time() {
    time = document.querySelector('input[type="datetime-local"]').value.replace('T', ' ');
    console.log(time);
}

// ********************* Pizza base

function change_base(base_id) {
    base_prices_keys = ['supreme', 'cheese', 'margherita']; // Reset array
    base_prices_keys.splice(base_prices_keys.indexOf(base_id.id),1); // Remove CURRENT base out of array
    
    // Turn OFF background color of OTHER base
    for (i = 0; i < base_prices_keys.length; i++) { 
        color_change(base_prices_keys[i], false);
    }

    color_change(base_id.id, true);

    base_price -= prev_price; // Deduct PREVIOUS price
    base_price += base_prices[base_id.id]; // Add CURRENT price
    prev_price = base_prices[base_id.id]; // Record CURRENT price as PREVIOUS price
    
    base_price_load();
    
    base = base_id.id;
}

// ********************* Pizza Toppings

function toppings_array(top_type) {
    // If toppings ADDED
    if (toppings.includes(top_type)) {
        color_change(top_type, false);
        toppings.splice(toppings.indexOf(top_type), 1);
        base_price -= toppings_prices[top_type];
        
        base_price_load();
    }
    // If toppings NOT ADDED
    else {
        color_change(top_type, true);
        toppings.push(top_type);
        base_price += toppings_prices[top_type];
        
        base_price_load();
    }
}

// ********************* Quantity

// Autocorrection into min and max
function imposeMinMax(el) {
    if (el.value != "") {
        if(parseInt(el.value) < parseInt(el.min)){
            el.value = el.min;
        }
        if(parseInt(el.value) > parseInt(el.max)){
            el.value = el.max;
        }
    }
}

// Log quantity
function log_quantity() {
    if (isNaN(parseInt(document.querySelector('input[min="1"]').value))) {
        quantity = 0;
    }
    else if (parseInt(document.querySelector('input[min="1"]').value) > 30) {
        quantity = 30;
    }
    else if (parseInt(document.querySelector('input[min="1"]').value) < 1) {
        quantity = 1;
    }
    else {
        quantity = parseInt(document.querySelector('input[min="1"]').value);
    }
    cal_and_display();
}

// Update price
function cal_and_display() {
    quantity_price = base_price * quantity;
    price_load(quantity_price);
}

// ********************* Payment

function testCreditCard() {
	myCardNo = document.getElementById('CardNumber').value;
	myCardType = document.getElementById('CardType').value;
	if (checkCreditCard(myCardNo, myCardType)) {
		alert('Credit card has a valid format');
		paid = true;
        document.getElementById('CardNumber').readOnly = true; // Lock card field after successful attempt
	} else {
		alert(ccErrors[ccErrorNo]);
	}
}

// ********************* Array of records

order_summary = [
    {
        ID: 1, deli : true, f_name : "Minh", l_name : "Dang", phone : "0414243454", 
        suburb : "Glebe", postcode : "2037", street : "Taylor St", 
        store : null, 
        base : "supreme", toppings : ["olives", "parmesan"], quantity : 1, paid : true
    }
];