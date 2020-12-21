import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import {getUserId} from '../utils'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoItem } from '../../models/TodoItem'
import { TodosRepository } from '../awsRepository/todosRepository'

const repo = new TodosRepository();



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const parsedBody: CreateTodoRequest = JSON.parse(event.body)

  // DONE: Implement creating a new TODO item

  const newItem: TodoItem = await repo.createTodoItem(getUserId(event), parsedBody);

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
