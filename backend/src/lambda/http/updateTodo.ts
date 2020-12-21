import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils';
import { updateTodoItem } from '../businessLogic/todos';


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const itemId = event.pathParameters.todoId
  const todoDto: UpdateTodoRequest = JSON.parse(event.body)

  // DONE: Update a TODO item with the provided id using values in the "updatedTodo" object

  const updatedItem = await updateTodoItem(getUserId(event), todoDto, itemId);


  console.log("Updated Item " + itemId + " with " + updatedItem);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      updatedItem
    })
  };
}
