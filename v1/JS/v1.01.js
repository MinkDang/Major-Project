// Color changing button
function color_change(IdName, change) {
    if (change == true) {
        document.getElementById(IdName).style.background='#E7B84B';
    }
    if (change == false) {
        document.getElementById(IdName).style.background='none';
    }
}

// Variables
base_price = 0.00;
quantity_price = 0.00;
quantity = 1;
base = ' ';
toppings_prices = {'anchovies': 2.00, 'jalapenos': 2.00, 'olives': 2.00, 'parmesan': 1.30};
toppings = [];

// Price injection
function price_load(price_element) {
    document.getElementById("price_display").innerText = '$ '+ price_element.toFixed(2);
}

// Delivery type
function delivery() {
    color_change('delivery', true);
    color_change('pickup', false);
    Array.from(document.querySelectorAll("#street, #postcode, #suburb"))
    .forEach(function(val) {
        val.style.display = 'flex';
        val.required = true;
    });
    document.getElementById('store').style.display='none';
    document.getElementById('store').required = false;
    deli = true;
}

function pickup() {
    color_change('pickup', true);
    color_change('delivery', false);
    Array.from(document.querySelectorAll("#street, #postcode, #suburb"))
    .forEach(function(val) {
        val.style.display = 'none';
        val.required = false;
    });
    document.getElementById('store').style.display='flex';
    document.getElementById('store').required = true;
    deli = false;
}

// Time
function get_time() {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    dateTime = new Date(Date.now() - tzoffset).toISOString().slice(0, -8);
    return dateTime;
}

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

function later() {
    color_change('later', true);
    color_change('now', false);
    document.querySelector('input[type="datetime-local"]').readOnly = false;
    document.querySelector('input[type="datetime-local"]').value='';
    document.querySelector('input[type="datetime-local"]').min = get_time();
    clearInterval(livetime_now);
}

function log_time() {
    time = document.querySelector('input[type="datetime-local"]').value.replace('T', ' ');
    console.log(time);
}

// Pizza type
function supreme() {
    color_change('supreme', true);
    color_change('cheese', false);
    color_change('margherita', false);
    if (base == 'cheese') {
        base_price -= 5.50;
    }
    else if (base == 'margherita') {
        base_price -= 4.00;
    }
    if (base != 'supreme') {
        base_price += 17.65;
        base = "supreme";
    }
    if (quantity_price != 0.00) {
        cal_and_display();
    }
    else {
        price_load(base_price);
    }
}

// function change_base(new_type){

//     base_price -= base_prices[base]
//     base_price += base_prices[new_type]
//     base = new_type

// } 

function cheese() {
    color_change('supreme', false);
    color_change('cheese', true);
    color_change('margherita', false);
    if (base == 'supreme') {
        base_price -= 17.65;
    }
    else if (base == 'margherita') {
        base_price -= 4.00;
    }
    if (base != 'cheese') {
        base_price += 5.50;
        base = "cheese";
    }
    if (quantity_price != 0.00) {
        cal_and_display();
    }
    else {
        price_load(base_price);
    }
}

function margherita() {
    color_change('supreme', false);
    color_change('cheese', false);
    color_change('margherita', true);
    if (base == 'supreme') {
        base_price -= 17.65;
    }
    else if (base == 'cheese') {
        base_price -= 5.50;
    }
    if (base != 'margherita') {
        base_price += 4.00;
        base = "margherita";
    }
    if (quantity_price != 0.00) {
        cal_and_display();
    }
    else {
        price_load(base_price);
    }
}

// Pizza Toppings

function toppings_array(top_type) {
    if (toppings.includes(top_type)) {
        color_change(top_type, false);
        toppings.splice(toppings.indexOf(top_type), 1);
        base_price -= toppings_prices[top_type];
        console.log(toppings);
        
        if (quantity_price != 0.00) {
            cal_and_display();
        }
        else {
            price_load(base_price);
        }
    }
    else {
        color_change(top_type, true);
        toppings.push(top_type);
        base_price += toppings_prices[top_type];
        console.log(toppings);
        
        if (quantity_price != 0.00) {
            cal_and_display();
        }
        else {
            price_load(base_price);
        }
    }
}

// Quantity

function imposeMinMax(el){
    if (el.value != "") {
        if(parseInt(el.value) < parseInt(el.min)){
            el.value = el.min;
        }
        if(parseInt(el.value) > parseInt(el.max)){
            el.value = el.max;
        }
    }
}

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

function cal_and_display() {
    quantity_price = base_price * quantity;
    price_load(quantity_price);
}

// Payment

function testCreditCard() {
	myCardNo = document.getElementById('CardNumber').value;
	myCardType = document.getElementById('CardType').value;
	if (checkCreditCard(myCardNo, myCardType)) {
		alert('Credit card has a valid format');
		paid = true;
        document.getElementById('CardNumber').readOnly = true;
	} else {
		alert(ccErrors[ccErrorNo]);
	}
}

// Summary

order_summary = [
    {
        ID: 1, 
    },
    {
        studID: 2, firstName: "Jennifer", lastName: "Lawrence",
        DOB: "15/8/90", gender: "f", avMk: 88.2,
    },
    {
        studID: 3, firstName: "George", lastName: "Clooney",
        DOB: "6/5/61", gender: "f", avMk: 68.2,
    },
    {
        studID: 4, firstName: "Scarlett", lastName: "Johansson",
        DOB: "22/11/84", gender: "f", avMk: 72.2,
    }
];