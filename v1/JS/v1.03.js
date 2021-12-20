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
    if (quantity_price != 0.00 || quantity_activation) {
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
quantity_choice = 1; // Default quantity
prev_price = 0; // First previous price, use in Pizza Base

// Other data types
base_prices = {'supreme': 17.65, 'cheese': 5.50, 'margherita': 4.00}; // List of objects -- Base: Price
toppings_prices = {'anchovies': 2.00, 'jalapenos': 2.00, 'olives': 2.00, 'parmesan': 1.30}; // List of objects -- Topping: Price
toppings_choice = []; // Declare array for Toppings
paid_choice = false; // Default paid value
quantity_activation = false; // Flag for quantity

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
    deli_type = true;
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
    deli_type = false;
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
    delete time;
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
    
    base_choice = base_id.id;
}

// ********************* Pizza Toppings

function toppings_array(top_type) {
    // If toppings ADDED
    if (toppings_choice.includes(top_type)) {
        color_change(top_type, false);
        toppings_choice.splice(toppings_choice.indexOf(top_type), 1);
        base_price -= toppings_prices[top_type];
        
        base_price_load();
    }
    // If toppings NOT ADDED
    else {
        color_change(top_type, true);
        toppings_choice.push(top_type);
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
    const el = document.querySelector('input[min="1"]')
    quantity_choice = Math.min(30, Math.max(parseInt(el.value), 1))

    if (isNaN(quantity_choice)) {
        quantity_choice = 0;
    }

    cal_and_display();
}

// Update price
function cal_and_display() {
    quantity_price = base_price * quantity_choice;
    quantity_activation = true; // Fix no price update when quantity is selected before base and toppings.
    price_load(quantity_price);
}

// ********************* Payment

function testCreditCard() {
    testCreditCard: {
        myCardNo = document.getElementById('CardNumber').value;
        myCardType = document.getElementById('CardType').value;
        // If Credit Card field is blank then paid_chocie = false
        if (myCardNo == '') {
            break testCreditCard;
        }
    
        if (checkCreditCard(myCardNo, myCardType)) {
            alert('Credit card has a valid format');
            paid_choice = true;
            document.getElementById('CardNumber').readOnly = true; // Lock card field after successful attempt
        } else {
            alert(ccErrors[ccErrorNo]);
        }
    }
}

// ********************* Array of records

// Capitalise first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Validate phone
function validate_phone(phone) {
    const regex = /[0-9]{10}/;
    return(regex.test(phone));
}

// Validate postcode
function validate_postcode(pc) {
    const regex = /[0-9]{4}/;
    return(regex.test(pc));
}

// Validate name, suburb
function validate_name(name) {
    const regex = /^[A-Za-z\s]+$/;
    return(regex.test(name));
}

// Validate address
function validate_loc(loc) {
    const regex = /\d+[ ](?:[A-Za-z0-9.-]+[ ]?)+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Dr|Rd|Blvd|Ln|St|Cl)\.?/;
    return(regex.test(loc));
}

// Main function
function push_obj() {
    if (typeof deli_type == 'undefined') {
        alert("Please complete Step 1");
        return false;
    }
    if (typeof time == 'undefined') {
        alert("Please complete Step 2");
        return false;
    }
    if (validate_name(document.querySelector('input[name="f_name"]').value) == false) {
        alert("Invalid First Name");
        return false;
    }
    if (validate_name(document.querySelector('input[name="l_name"]').value) == false) {
        alert("Invalid Last Name");
        return false;
    }
    if (validate_phone(document.querySelector('input[name="phone"]').value) == false) {
        alert("Invalid Phone Number");
        return false;
    }
    if (deli_type == true) {
        if (validate_name(document.querySelector('input[name="suburb"]').value) == false) {
            alert("Invalid Suburb");
            return false;
        }
        else {
            suburb_choice = document.querySelector('input[name="suburb"]').value;
        }
        if (validate_postcode(document.querySelector('input[name="postcode"]').value) == false) {
            alert("Invalid Post Code");
            return false;
        }
        else {
            postcode_choice = document.querySelector('input[name="postcode"]').value;
        }
        if (validate_loc(document.querySelector('input[name="address"]').value) == false) {
            alert("Invalid Address");
            return false;
        }
        else {
            loc_choice = document.querySelector('input[name="address"]').value;
        }
        store_selection = null;
    }
    else {
        select = document.getElementById('test');
        store_selection = select.options[select.selectedIndex].value;
        suburb_choice = null;
        postcode_choice = null;
        loc_choice = null;
    }

    if (typeof base_choice == 'undefined') {
        alert("Please complete Step 4");
        return true;
    }

    if (toppings_choice.length == 0) {
        alert("Please select at least 1 topping");
        return true;
    }

    testCreditCard();

    order_summary.push(
        {
            ID: order_summary.length, deli: deli_type, t: time,
            f_name: capitalizeFirstLetter(document.querySelector('input[name="f_name"]').value),
            l_name: capitalizeFirstLetter(document.querySelector('input[name="l_name"]').value),
            phone: document.querySelector('input[name="phone"]').value,
            suburb: suburb_choice,
            postcode: postcode_choice,
            address: loc_choice,
            store: store_selection,
            base: base_choice,
            toppings: toppings_choice,
            quantity: quantity_choice,
            paid: paid_choice
        }
    )

    display_orders();
}

// Reset form stub
function reset_field() {
    alert("Not available");
}

// Inject order_summary
function display_orders() {
    strStList = "";
    for (let i = 0; i < order_summary.length; i++) {
        strStList += order_summary[i].ID + " - Delivery: " + order_summary[i].deli
            + " - " + order_summary[i].t + " - " + order_summary[i].f_name + ' - ' + order_summary[i].l_name 
            + " - " + order_summary[i].phone 
            + " - Suburb: " + order_summary[i].suburb + ' - Postcode: ' + order_summary[i].postcode + ' - Address: ' + order_summary[i].address
            + ' - Store: ' + order_summary[i].store
            + ' - Base: ' + order_summary[i].base + ' - Toppings: ' + order_summary[i].toppings + ' - Quantity: ' + order_summary[i].quantity
            + ' - Paid: ' + order_summary[i].paid + "\n"
    }
    document.querySelector('textarea[cols = "90"]').value = strStList;
}

// First record
order_summary = [
    {
        ID: 1, deli : true, t: "2021-10-20 10:20", f_name: "Minh", l_name: "Dang", phone: "0414243454", 
        suburb: "Glebe", postcode: "2037", address: "12 Taylor St", 
        store: null, 
        base: "supreme", toppings: ["olives", "parmesan"], quantity: 1, paid: true
    }
];