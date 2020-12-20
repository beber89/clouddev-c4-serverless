import 'source-map-support/register'
import * as AWS from 'aws-sdk'


import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'


const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const itemId = event.pathParameters.todoId

  // TODO: Remove a TODO item by id
  const itemKeyToBeDeleted = {
    "todoId": itemId
  }

  const result = await docClient.delete({
    TableName: todosTable,
    Key: itemKeyToBeDeleted,
  }).promise();
  console.log("Result of deletion ... ", result);

  return {
    statusCode: 201,
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
    body: "",
  }
}
