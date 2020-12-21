import 'source-map-support/register'
import {getUserId} from '../utils'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getAllTodosPerUser } from '../businessLogic/todos';


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  // DONE: Get all TODO items for a current user

  const items = await getAllTodosPerUser(getUserId(event));

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
