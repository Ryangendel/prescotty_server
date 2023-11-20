const { Customer, Order, Product, Pickup } = require('../models');

const databaseManager = {


    dutchie: async function (data) {
        let orderDetail = {
            onfleet_task_id: data.onfleet_task_id,
            delivery_driver: data.delivery_driver,
            creation_time: data.creation_time,
            delivery_start_time: data.delivery_start_time,
            day_of_the_week: data.day_of_the_week,
            destination_address: data.destination_address,
            client_name: data.client_name,
            client_phone_number: data.client_phone_number,
            delivery_distance: data.delivery_distance ? data.delivery_distance : "",
            task_details: data.task_details,
            signature_picture: data.signature_picture,
            client_picture: data.client_picture,
            driver_departure_time: data.driver_departure_time,
            driver_arrival_time: data.driver_arrival_time,
            pos_system: data.pos_system,
            order_url: data.order_url,
            transaction_id: data.transaction_id,
            products: data.products,
            subtotal: data.subtotal,
            discount: data.discount,
            order_total: data.order_total,
            quantity_of_items_in_order: data.quantity_of_items_in_order
        }

        let customer = {
            client_name: data.client_name,
            destination_address: data.destination_address,
            onfleet_task_id: data.onfleet_task_id, //THIS IS AN ARRAY
            client_phone_number: data.client_phone_number,
            medical_patient: data.medical_patient,
        }

        let products = []
        for (let i = 0; i < data.products.length; i++) {
            let product = {
                product_name: data.products[i].product_name ? data.products[i].name : "",
                option: data.products[i].option ? data.products[i].option : "",
                quantity: parseInt(data.products[i].quantity) ? parseInt(data.products[i].quantity) : "",
                brand: data.products[i].brand ? data.products[i].product : "",
                price: data.products[i].price ? data.products[i].price : "",
                sku: data.products[i].sku ? data.products[i].sku : "",
                type: data.products[i].type ? data.products[i].type : "",
            }
            products.push(product)
        }


        try {    
            const customerWOtaskId = {
                client_name: data.client_name,
                destination_address: customer.destination_address,
                client_phone_number: data.client_phone_number,
                medical_patient: data.medical_patient,
            }
            const query = customerWOtaskId;
            const update = {
                $addToSet: { onfleet_task_id: customer.onfleet_task_id }, // Add each item if not already present
                $setOnInsert: customerWOtaskId // Set the phone number only on insert
            };

            const options = { upsert: true, new: true, setDefaultsOnInsert: true };

            Customer.findOneAndUpdate(query, update, options)
                .then(result => {
                    console.log('Upserted User:', result);
                })
                .catch(err => {
                    console.error('Error:', err);
                });
        }
        catch (error) {
            console.log(error)
        }
        // try {
        //     const newCustomer = new Customer(customer);
        //     if (newCustomer) {
        //         await newCustomer.save();
        //     } else {
        //         throw new Error('duplicate');
        //     }
        // } catch (error) {
        //     console.log(error)
        // }

        try {
            const newOrder = new Order(orderDetail);
            if (newOrder) {
                await newOrder.save();
            } else {
                throw new Error('duplicate');
            }
        } catch (error) {
            console.log(error)
        }

        try {
            Product.insertMany(products)
                .then(docs => {
                    console.log('Documents inserted:', docs);
                })
                .catch(err => {
                    console.error('Error inserting documents:', err);
                });
        } catch (error) {
            console.log(error)
        }

        // try {
        //     console.log("=================================ORDER")
        //     console.log(orderDetail)
        //     console.log("=================================ORDER")
        //     const newOrder = await new Order(orderDetail);
        //     if (newOrder) {
        //         await newOrder.save();
        //     } else {
        //         throw new Error('duplicate');
        //     }
        // } catch (error) {
        //     console.log(error)
        // }



    },
    leafly: async function (data) {
        let orderDetail = {
            onfleet_task_id: data.onfleet_task_id,
            delivery_driver: data.delivery_driver,
            creation_time: data.creation_time,
            delivery_start_time: data.delivery_start_time,
            day_of_the_week: data.day_of_the_week,
            destination_address: data.destination_address,
            client_name: data.client_name,
            client_phone_number: data.client_phone_number,
            delivery_distance: data.delivery_distance ? data.delivery_distance : "",
            task_details: data.task_details,
            signature_picture: data.signature_picture,
            client_picture: data.client_picture,
            driver_departure_time: data.driver_departure_time,
            driver_arrival_time: data.driver_arrival_time,
            pos_system: data.pos_system,
            order_url: data.order_url,
            transaction_id: data.transaction_id,
            products: data.products,
            subtotal: data.subtotal,
            discount: data.discount,
            order_total: data.order_total,
            quantity_of_items_in_order: data.quantity_of_items_in_order? data.quantity_of_items_in_order: undefined
        }

        let customer = {
            client_name: data.client_name,
            destination_address: data.destination_address,
            onfleet_task_id: data.onfleet_task_id, //THIS IS AN ARRAY
            client_phone_number: data.client_phone_number,
            medical_patient: data.medical_patient,
        }

        let products = []
        for (let i = 0; i < data.products.length; i++) {
            let product = {
                product_name: data.products[i].product_name ? data.products[i].name : "",
                option: data.products[i].option ? data.products[i].option : "",
                quantity: parseInt(data.products[i].quantity) ? parseInt(data.products[i].quantity) : "",
                brand: data.products[i].brand ? data.products[i].product : "",
                price: data.products[i].price ? data.products[i].price : "",
                sku: data.products[i].sku ? data.products[i].sku : "",
                type: data.products[i].type ? data.products[i].type : "",
            }
            products.push(product)
        }


        try {    
            const customerWOtaskId = {
                client_name: data.client_name,
                destination_address: customer.destination_address,
                client_phone_number: data.client_phone_number,
                medical_patient: data.medical_patient,
            }
            const query = customerWOtaskId;
            const update = {
                $addToSet: { onfleet_task_id: customer.onfleet_task_id }, // Add each item if not already present
                $setOnInsert: customerWOtaskId // Set the phone number only on insert
            };

            const options = { upsert: true, new: true, setDefaultsOnInsert: true };

            Customer.findOneAndUpdate(query, update, options)
                .then(result => {
                    console.log('Upserted User:', result);
                })
                .catch(err => {
                    console.error('Error:', err);
                });
        }
        catch (error) {
            console.log(error)
        }
        // try {
        //     const newCustomer = new Customer(customer);
        //     if (newCustomer) {
        //         await newCustomer.save();
        //     } else {
        //         throw new Error('duplicate');
        //     }
        // } catch (error) {
        //     console.log(error)
        // }

        try {
            const newOrder = new Order(orderDetail);
            if (newOrder) {
                await newOrder.save();
            } else {
                throw new Error('duplicate');
            }
        } catch (error) {
            console.log(error)
        }

        try {
            Product.insertMany(products)
                .then(docs => {
                    console.log('Documents inserted:', docs);
                })
                .catch(err => {
                    console.error('Error inserting documents:', err);
                });
        } catch (error) {
            console.log(error)
        }

        // try {
        //     console.log("=================================ORDER")
        //     console.log(orderDetail)
        //     console.log("=================================ORDER")
        //     const newOrder = await new Order(orderDetail);
        //     if (newOrder) {
        //         await newOrder.save();
        //     } else {
        //         throw new Error('duplicate');
        //     }
        // } catch (error) {
        //     console.log(error)
        // }
    },
    unknown1: async function (data) {

        let orderDetail = {
            onfleet_task_id: data.onfleet_task_id,
            delivery_driver: data.delivery_driver,
            creation_time: data.creation_time,
            delivery_start_time: data.delivery_start_time,
            day_of_the_week: data.day_of_the_week,
            destination_address: data.destination_address,
            client_name: data.client_name,
            client_phone_number: data.client_phone_number,
            delivery_distance: data.delivery_distance ? data.delivery_distance : "",
            task_details: data.task_details,
            signature_picture: data.signature_picture,
            client_picture: data.client_picture,
            driver_departure_time: data.driver_departure_time,
            driver_arrival_time: data.driver_arrival_time,
            pos_system: data.pos_system,
            order_url: data.order_url,
            transaction_id: data.transaction_id,
            products: data.products,
            subtotal: data.subtotal,
            discount: data.discount,
            order_total: data.order_total,
            quantity_of_items_in_order: data.quantity_of_items_in_order? data.quantity_of_items_in_order: undefined
        }

        let customer = {
            client_name: data.client_name,
            destination_address: data.destination_address,
            onfleet_task_id: data.onfleet_task_id, //THIS IS AN ARRAY
            client_phone_number: data.client_phone_number,
            medical_patient: data.medical_patient,
        }

        let products = []
        for (let i = 0; i < data.products.length; i++) {
            let product = {
                product_name: data.products[i].product_name ? data.products[i].name : "",
                option: data.products[i].option ? data.products[i].option : "",
                quantity: parseInt(data.products[i].quantity) ? parseInt(data.products[i].quantity) : "",
                brand: data.products[i].brand ? data.products[i].product : "",
                price: data.products[i].price ? data.products[i].price : "",
                sku: data.products[i].sku ? data.products[i].sku : "",
                type: data.products[i].type ? data.products[i].type : "",
            }
            products.push(product)
        }


        try {    
            const customerWOtaskId = {
                client_name: data.client_name,
                destination_address: customer.destination_address,
                client_phone_number: data.client_phone_number,
                medical_patient: data.medical_patient,
            }
            const query = customerWOtaskId;
            const update = {
                $addToSet: { onfleet_task_id: customer.onfleet_task_id }, // Add each item if not already present
                $setOnInsert: customerWOtaskId // Set the phone number only on insert
            };

            const options = { upsert: true, new: true, setDefaultsOnInsert: true };

            Customer.findOneAndUpdate(query, update, options)
                .then(result => {
                    console.log('Upserted User:', result);
                })
                .catch(err => {
                    console.error('Error:', err);
                });
        }
        catch (error) {
            console.log(error)
        }
        // try {
        //     const newCustomer = new Customer(customer);
        //     if (newCustomer) {
        //         await newCustomer.save();
        //     } else {
        //         throw new Error('duplicate');
        //     }
        // } catch (error) {
        //     console.log(error)
        // }

        try {
            const newOrder = new Order(orderDetail);
            if (newOrder) {
                await newOrder.save();
            } else {
                throw new Error('duplicate');
            }
        } catch (error) {
            console.log(error)
        }

        try {
            Product.insertMany(products)
                .then(docs => {
                    console.log('Documents inserted:', docs);
                })
                .catch(err => {
                    console.error('Error inserting documents:', err);
                });
        } catch (error) {
            console.log(error)
        }

        // try {
        //     console.log("=================================ORDER")
        //     console.log(orderDetail)
        //     console.log("=================================ORDER")
        //     const newOrder = await new Order(orderDetail);
        //     if (newOrder) {
        //         await newOrder.save();
        //     } else {
        //         throw new Error('duplicate');
        //     }
        // } catch (error) {
        //     console.log(error)
        // }

    },
    unknown2: async function (data) {
        let orderDetail = {
            onfleet_task_id: data.onfleet_task_id,
            delivery_driver: data.delivery_driver,
            creation_time: data.creation_time,
            delivery_start_time: data.delivery_start_time,
            day_of_the_week: data.day_of_the_week,
            destination_address: data.destination_address,
            client_name: data.client_name,
            client_phone_number: data.client_phone_number,
            delivery_distance: data.delivery_distance ? data.delivery_distance : "",
            task_details: data.task_details,
            signature_picture: data.signature_picture,
            client_picture: data.client_picture,
            driver_departure_time: data.driver_departure_time,
            driver_arrival_time: data.driver_arrival_time,
            pos_system: data.pos_system,
            order_url: data.order_url,
            transaction_id: data.transaction_id,
            products: data.products,
            subtotal: data.subtotal,
            discount: data.discount,
            order_total: data.order_total,
            quantity_of_items_in_order: data.quantity_of_items_in_order? data.quantity_of_items_in_order: undefined
        }

        let customer = {
            client_name: data.client_name,
            destination_address: data.destination_address,
            onfleet_task_id: data.onfleet_task_id, //THIS IS AN ARRAY
            client_phone_number: data.client_phone_number,
            medical_patient: data.medical_patient,
        }

        let products = []
        for (let i = 0; i < data.products.length; i++) {
            let product = {
                product_name: data.products[i].product_name ? data.products[i].name : "",
                option: data.products[i].option ? data.products[i].option : "",
                quantity: parseInt(data.products[i].quantity) ? parseInt(data.products[i].quantity) : "",
                brand: data.products[i].brand ? data.products[i].product : "",
                price: data.products[i].price ? data.products[i].price : "",
                sku: data.products[i].sku ? data.products[i].sku : "",
                type: data.products[i].type ? data.products[i].type : "",
            }
            products.push(product)
        }


        try {    
            const customerWOtaskId = {
                client_name: data.client_name,
                destination_address: customer.destination_address,
                client_phone_number: data.client_phone_number,
                medical_patient: data.medical_patient,
            }
            const query = customerWOtaskId;
            const update = {
                $addToSet: { onfleet_task_id: customer.onfleet_task_id }, // Add each item if not already present
                $setOnInsert: customerWOtaskId // Set the phone number only on insert
            };

            const options = { upsert: true, new: true, setDefaultsOnInsert: true };

            Customer.findOneAndUpdate(query, update, options)
                .then(result => {
                    console.log('Upserted User:', result);
                })
                .catch(err => {
                    console.error('Error:', err);
                });
        }
        catch (error) {
            console.log(error)
        }
        // try {
        //     const newCustomer = new Customer(customer);
        //     if (newCustomer) {
        //         await newCustomer.save();
        //     } else {
        //         throw new Error('duplicate');
        //     }
        // } catch (error) {
        //     console.log(error)
        // }

        try {
            const newOrder = new Order(orderDetail);
            if (newOrder) {
                await newOrder.save();
            } else {
                throw new Error('duplicate');
            }
        } catch (error) {
            console.log(error)
        }

        try {
            Product.insertMany(products)
                .then(docs => {
                    console.log('Documents inserted:', docs);
                })
                .catch(err => {
                    console.error('Error inserting documents:', err);
                });
        } catch (error) {
            console.log(error)
        }

        // try {
        //     console.log("=================================ORDER")
        //     console.log(orderDetail)
        //     console.log("=================================ORDER")
        //     const newOrder = await new Order(orderDetail);
        //     if (newOrder) {
        //         await newOrder.save();
        //     } else {
        //         throw new Error('duplicate');
        //     }
        // } catch (error) {
        //     console.log(error)
        // }

    },
    pickupOrder: async function (data) {
        let orderDetail = {
            signature_text: data.signature_text,
            signature_url: data.signature_url,
            photo_url: data.photo_url,
            onfleet_task_id: data.onfleet_task_id,
            quantity_of_items_in_order:data.quantity_of_items_in_order,
            subtotal:data.subtotal,
            order_total:data.order_total,
            creation_time: data.creation_time,
            completion_time: data.completion_time,
            order_id: data.order_id,
            pickup_dispensary: data.pickup_dispensary,
            pickup_dispensary_location: data.pickup_dispensary_location,
            driver: data.driver,
        }

        try {
            const newPickup = new Pickup(orderDetail);
            if (newPickup) {
                await newPickup.save();
            } else {
                throw new Error('duplicate');
            }
        } catch (error) {
            console.log(error)
        }
    }
}



module.exports = databaseManager;


