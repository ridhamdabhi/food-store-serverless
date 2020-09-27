const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB();
const { v4: uuidv4 } = require("uuid");

exports.handler = async (event) => {
  let body = JSON.parse(event.body);

  let transactionId = body["id"];
  let action = body["action"];

  if (action == "commit") {
    let products = body["products"];

    let writes = [];
    for (let index in products) {
      let id = uuidv4();

      let orderParams = {
        Item: {
          id: { S: id },
          transaction_id: { S: transactionId },
          product_id: { S: products[index].id },
          quantity: { S: products[index].quantity },
        },
        TableName: "order",
      };

      writes.push({ Pu: orderParams });
    }

    let result = await dynamoDB
      .transactWriteItems({ TransactItems: writes })
      .promise();

    const response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({ status: "success" }),
    };

    return response;
  }
};
