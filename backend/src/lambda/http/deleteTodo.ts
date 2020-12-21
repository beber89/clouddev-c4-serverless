import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils';
import { deleteTodoItem } from '../businessLogic/todos';


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const itemId = event.pathParameters.todoId

  // DONE: Remove a TODO item by id
  await deleteTodoItem(getUserId(event), itemId);

  return {
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
    body: "",
  }
}
