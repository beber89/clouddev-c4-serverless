import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { TodosRepository } from '../awsRepository/todosRepository'
import { getUserId } from '../utils';

const repo = new TodosRepository();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const todoId = event.pathParameters.todoId

  // DONE: Return a presigned URL to upload a file for a TODO item with the provided id
  const result = await repo.generateUploadUrl(getUserId(event), todoId)

console.log("Updated OK ... ");

  return {
      statusCode: 200,
      headers: {
          'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
          ...result
      })
  }
}
