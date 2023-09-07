// const taskId = data.Notes.match(taskIdRegex);
//                 if (taskId && taskId[1]) {
//                     dataObj.task_id = taskId[1];
//                 }
//                 const createdAtRegex = /created at (\d+)/;
//                 const order_time = data.Notes.match(createdAtRegex);
//                 if (order_time && order_time[1]) {
//                     const createdAtTime = new Date(parseInt(order_time[1]));
//                     dataObj.order_date = createdAtTime;
//                 }
//                 const viewOrderRegex = /View order: (https:\/\/[^\s]+)/;
//                 const viewOrder = data.Notes.match(viewOrderRegex);
//                 if (viewOrder && viewOrder[1]) {
//                     const viewOrderLink = viewOrder[1];
//                     dataObj.view_order = viewOrderLink;
//                 }

//                 const orderNumberRegex = /Order Number: (\d+)/;
//                 const OrderNumber = data.Notes.match(orderNumberRegex);
//                 if (OrderNumber && OrderNumber[1]) {
//                     const orderNumber = OrderNumber[1];
//                     dataObj.order_number = orderNumber;
//                 }
//                 const productRegex = /([A-Za-z\s]+)\nOption: [^\n]+\nQuantity: \d+\nBrand: [^\n]+\nPrice: \d+/g;
//                 const ProductName = data.Notes.match(productRegex);

//                 if (ProductName) {
//                     const productNames = ProductName.map(match => match.trim());
//                     dataObj.product_info = productNames
//                 }

//                 const costRegex = /(\w+): (\$[\d.]+)/g;

//                 const matches = data.Notes.matchAll(costRegex);

//                 for (const match of matches) {
//                     const key = match[1];
//                     const value = match[2];
//                     dataObj[key] = value;
//                 }

//                 var orders = dataObj.product_info
//                 //r65253f%@reafqertr43ret235f4/#QR#$R$#F#$F#qcfewqrfeqw
//                 if (orders?.length) {
//                     var extractedItems = [];
//                     orders.forEach(entry => {
//                         const lines = entry.split('\n');
//                         const [productNameLine, optionLine, quantityLine, brandLine, priceLine] = lines;
//                         const productName = productNameLine.split('\n')[0];
//                         const option = optionLine.split(": ")[1];
//                         const quantity = quantityLine.split(": ")[1];
//                         const brand = brandLine.split(": ")[1];
//                         const price = priceLine.split(": ")[1];

//                         extractedItems.push({
//                             product_name: productName,
//                             option,
//                             quantity: parseInt(quantity),
//                             brand,
//                             price: parseFloat(price)
//                         });
//                     });
//                 }
//                 dataObj.pos_system_used = "Dutchie"
//                 dataObj.purchase_details = extractedItems

//------------------NOT SURE 1

// function extractInfo(line) {
//     const regex = /([\d.]+) x (.+?) ([\d.]+(?: Gram|g)) .+?\| (\d+)/;
//     const match = line.match(regex);
//     if (match) {
//         const quantity = parseFloat(match[1]);
//         const product = match[2];
//         const option = match[3];
//         const sku = parseInt(match[4]);
//         return { quantity, product, option, sku };
//     }
//     return null;
// }

// // Function to extract Total and Sub-Total
// function extractTotals(lines) {

//     console.log("llllllllllllllllll")
//     console.log(lines)
//     console.log("llllllllllllllllll")
 
//     const subTotalLine = lines.find(line => line.includes('Sub-Total:'));
//     const totalLine = lines.find(line => line.includes('Total:'));
//     const subTotal = parseFloat(subTotalLine.match(/\$([\d.]+)/)[1]);
//     const total = parseFloat(totalLine.match(/\$([\d.]+)/)[1]);
//     return { subTotal, total };
// }

// // Split the input string into lines
// const lines1 = data.Notes.split('\n');

// // Extract information and totals
// const info1 = lines1.map(extractInfo).filter(Boolean);
// const totals1 = extractTotals(lines1);

//--------------WORKING DUTCHIE, EXCEPT THE TOTAL/SUBTOTAL
// console.log("************************************")
// dataObj.pos_system_used = "Dutchie"

// function extractOrderInfo(input) {
//     const orderInfo = {};

//     // Extract DOB, Drivers License, Onfleet Task ID, View Order, Order Number
//     const dobMatch = input.match(/DOB: ([^\n]+)/);
//     const driversLicenseMatch = input.match(/Drivers License: ([^\n]+)/);
//     const onFleetTaskIDMatch = input.match(/Onfleet Task ID:  ([^\n]+)/);
//     const viewOrderMatch = input.match(/View order: ([^\n]+)/);
//     const orderNumberMatch = input.match(/Order Number: ([^\n]+)/);

//     orderInfo.dob = dobMatch ? dobMatch[1].trim() : null;
//     orderInfo.drivers_license = driversLicenseMatch ? driversLicenseMatch[1].trim() : null;

//     // Split "created at" time from "on_fleet_task_id"
//     if (onFleetTaskIDMatch) {
//         const onFleetTaskIDParts = onFleetTaskIDMatch[1].split(" created at ");
//         orderInfo.on_fleet_task_id = onFleetTaskIDParts[0].trim();
//         const created_at_timestamp = parseInt(onFleetTaskIDParts[1]);
//         orderInfo.created_at = new Date(created_at_timestamp).toISOString();
//     } else {
//         orderInfo.on_fleet_task_id = null;
//         orderInfo.created_at = null;
//     }

//     orderInfo.view_order = viewOrderMatch ? viewOrderMatch[1].trim() : null;
//     orderInfo.order_number = orderNumberMatch ? orderNumberMatch[1].trim() : null;

//     // Extract Product Info
//     const productInfo = [];

//     const productBlocks = input.match(/Products:(.*?)productSubtotal:/s);
//     if (productBlocks) {
//         const productLines = productBlocks[1].split("\n");
//         let product = {};

//         for (let i = 0; i < productLines.length; i++) {
//             const line = productLines[i].trim();
//             if (line === "-----------") {
//                 if (Object.keys(product).length > 0) {
//                     // Convert quantity and price to integers
//                     product.quantity = parseInt(product.quantity);
//                     product.price = parseFloat(product.price);
//                     productInfo.push(product);
//                     product = {};
//                 }
//             } else {
//                 const keyValue = line.split(":");
//                 if (keyValue.length === 2) {
//                     const key = keyValue[0].trim();
//                     const value = keyValue[1].trim();
//                     product[key.toLowerCase()] = key === "price" ? parseFloat(value) : value;
//                 }
//             }
//         }

//         if (Object.keys(product).length > 0) {
//             // Convert quantity and price to integers for the last product
//             product.quantity = parseInt(product.quantity);
//             product.price = parseFloat(product.price);
//             productInfo.push(product);
//         }
//     }

//     orderInfo.products = productInfo;

//     // Extract productSubtotal, deliveryFee, total, medical card, etc.
//     const productSubtotalMatch = input.match(/productSubtotal: \$(\d+\.\d+)/);
//     const deliveryFeeMatch = input.match(/deliveryFee: \$([\d.]+)/);
//     const totalMatch = input.match(/total: \$(\d+\.\d+)/);
//     const medicalCardMatch = input.match(/Medical Card: ([^\n]+)/);
//     const emailMatch = input.match(/Email: ([^\n]+)/);
//     const expirationDateMatch = input.match(/Exp: ([^\n]+)/);

//     orderInfo.productSubtotal = productSubtotalMatch ? parseFloat(productSubtotalMatch[1]) : null;
//     orderInfo.deliveryFee = deliveryFeeMatch ? parseFloat(deliveryFeeMatch[1]) : null;
//     orderInfo.total = totalMatch ? parseFloat(totalMatch[1]) : null;
//     orderInfo.medical = medicalCardMatch ? true : false;
//     orderInfo.email = emailMatch ? emailMatch[1].trim() : null;
//     orderInfo.expiration_date = expirationDateMatch ? expirationDateMatch[1].trim() : null;

//     return orderInfo;
// }

// const orderInfo = extractOrderInfo(data.Notes);
// dataObj.NOTES = data.Notes
// dataObj.dob = orderInfo.dob
// dataObj.drivers_license = orderInfo.drivers_license
// dataObj.on_fleet_task_id = orderInfo.on_fleet_task_id
// dataObj.created_at = orderInfo.created_at
// dataObj.order_number = orderInfo.order_number
// dataObj.order_detail = orderInfo.products
// dataObj.subtotal = orderInfo.productSubtotal
// dataObj.drivers_license = orderInfo.drivers_license
// dataObj.delivery_fee = orderInfo.deliveryFee
// dataObj.order_total = orderInfo.total
// dataObj.medical = orderInfo.medical
// dataObj.customer_email = orderInfo.email
// dataObj.med_card_expiration_date = orderInfo.expiration_date
