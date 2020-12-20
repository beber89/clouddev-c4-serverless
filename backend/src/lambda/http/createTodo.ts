import 'source-map-support/register'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import {getUserId} from '../utils'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const itemId = uuid.v4()

  const parsedBody: CreateTodoRequest = JSON.parse(event.body)

  // DONE: Implement creating a new TODO item

  const newItem = {
    todoId: itemId,
    userId: getUserId(event),
    createdAt: new Date().getTime().toString(),
    done: false,
    ...parsedBody
  }

  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise();

  console.log("created new todo item: " + newItem);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: newItem
    })
  };
}
