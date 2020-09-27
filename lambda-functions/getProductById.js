const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  let body = JSON.parse(event.body);

  let productId = body["id"];

  let productParams = {
    TableName: "ingredient",
    FilterExpression: "contains(product_id, :pid)",
    ExpressionAttributeValues: {
      ":pid": productId,
    },
  };

  let results = await dynamoDB.scan(productParams).promise();

  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    },
    body: JSON.stringify(results.Items),
  };

  return response;
};
