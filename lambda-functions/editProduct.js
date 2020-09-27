const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require("uuid");

exports.handler = async (event) => {
  let body = JSON.parse(event.body);

  // update product details
  let productId = body["id"];
  let productName = body["productName"];
  let productPrice = Number(body["productPrice"]);

  let productParams = {
    Key: {
      id: productId,
    },
    UpdateExpression: `set productName = :productName, productPrice = :productPrice`,
    ExpressionAttributeValues: {
      ":productName": productName,
      ":productPrice": productPrice,
    },
    TableName: "product",
  };

  await dynamoDB.update(productParams).promise();

  // update ingredients details
  let scanProductParams = {
    TableName: "ingredient",
    FilterExpression: "contains(product_id, :pid)",
    ExpressionAttributeValues: {
      ":pid": productId,
    },
  };

  let results = await dynamoDB.scan(scanProductParams).promise();
  results = results.Items;

  for (let index in results) {
    let ingredientParams = {
      Key: {
        id: results[index].id,
      },
      TableName: "ingredient",
    };

    await dynamoDB.delete(ingredientParams).promise();
  }

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
