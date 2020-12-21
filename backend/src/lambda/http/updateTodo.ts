import 'source-map-support/register'
import * as AWS from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils';

const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const itemId = event.pathParameters.todoId
  const todoDto: UpdateTodoRequest = JSON.parse(event.body)

  // DONE: Update a TODO item with the provided id using values in the "updatedTodo" object

  const queryParams = {
    TableName: todosTable,
    Key: {
        userId: getUserId(event),
        todoId: itemId
    },
    UpdateExpression: "set #a = :a, #b = :b, #c = :c",
    ExpressionAttributeNames: {
        "#a": "name",
        "#b": "dueDate",
        "#c": "done"
    },
    ExpressionAttributeValues: {
        ":a": todoDto.name,
        ":b": todoDto.dueDate,
        ":c": todoDto.done
    },
    ReturnValues: "ALL_NEW"
};

  const newItem = await docClient.update(queryParams).promise()

  console.log("Updated Item " + itemId + " with " + newItem);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem
    })
  };
}
