const Onfleet = require("@onfleet/node-onfleet")
const onfleetGetInfoDictionary = require("./onfleetGetInfoDictionary")
const dispensary_directory = require("./dispensary_directory")

var onfleetLogic = {
    makeOrder: async function(order){
        const onfleetApi = new Onfleet("433273baf931427ef6b294a5d14af7d4");
        console.log(await onfleetApi.verifyKey())

        let order_text = `Customer Name ${order.client_name}\n`
        order_text += `Address: ${order.destination_address}\n`
        order_text += `Phone: ${order.client_phone_number}\n`
        for (let i = 0; i < order.products_in_order.length; i++) {
            order_text += `Item ${i+1}----------\n`
            for (const property in order.products_in_order[i]) {
                order_text += ` ${property}: ${order.products_in_order[i][property]}\n`
              }
          }

          order_text += `\nOrder Total: ${order.order_total}`
          
          
        var dropoff = await onfleetApi.tasks.create({
            "destination":{
              "address":{
                "unparsed":order.destination_address
              },
              "notes":""
            },"recipients":[{"name":order.client_name,
                             "phone":order.client_phone_number,
                             "notes":"NOTES"}],
            // "completeAfter":1455151071727,
            "notes":order_text,
            "autoAssign":{"mode":"distance"}
          });

          const RI = Math.floor(Math.random() * 5)

         var pickup = await onfleetApi.tasks.create({
            "destination":{
              "address":{
                "unparsed":dispensary_directory[RI].address
              },
              "notes":""},
              "recipients":[{"name":dispensary_directory[RI].name,
                             "phone":dispensary_directory[RI].phone,
                             "notes":"NOTES"}],
            // "completeAfter":1455151071727,
            // "dependencies":[dropoff.id],
            "dependencies": [dropoff.id],
            "notes":order_text,
            "pickupTask":true,
            "autoAssign":{"mode":"distance"}
          });
    },
}

module.exports = onfleetLogic;