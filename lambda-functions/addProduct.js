const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require("uuid");

exports.handler = async (event) => {
  let body = JSON.parse(event.body);

  // insert product details
  let productId = uuidv4();
  let productName = body["name"];
  let productPrice = Number(body["price"]);

  let productParams = {
    Item: {
      id: productId,
      productName: productName,
      productPrice: productPrice,
    },
    TableName: "product",
  };

  await dynamoDB.put(productParams).promise();

  // insert ingredients details
  let ingredients = body["ingredients"];

  for (let index in ingredients) {
    let ingredientParams = {
      Item: {
        id: uuidv4(),
        product_id: productId,
        ingredient_id: ingredients[index].id,
        ingredient_name: ingredients[index].name,
        quantity: ingredients[index].quantity,
      },
      TableName: "ingredient",
    };

    await dynamoDB.put(ingredientParams).promise();
  }

  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    },
    body: JSON.stringify({ result: "success" }),
  };

  return response;
};
