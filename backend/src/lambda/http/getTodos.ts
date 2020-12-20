import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import {getUserId} from '../utils'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;
const secondaryIndex = process.env.GSI_INDEX_NAME

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  // DONE: Get all TODO items for a current user
  const queryParams = {
    TableName: todosTable,
    IndexName: secondaryIndex,
    KeyConditionExpression: "#a = :a",
    ExpressionAttributeNames: {
        "#a": "userId"
    },
    ExpressionAttributeValues: {
        ":a": getUserId(event)
    }
  };

  const result = await docClient.query(queryParams).promise();

  const items = result.Items
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  };
}
