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