import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as uuid from 'uuid'

import { TodoItem } from '../../models/TodoItem'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

export class TodosRepository {

  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getAllTodosPerUser(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos for a user')

    const queryParams = {
        TableName: this.todosTable,
        KeyConditionExpression: "#a = :a",
        ExpressionAttributeNames: {
            "#a": "userId"
        },
        ExpressionAttributeValues: {
            ":a": userId
        }
      };
    
      const result = await this.docClient.query(queryParams).promise();
    
      const items = result.Items
      return items as TodoItem[]
  }

  async createTodoItem(userId: string, todoDto: CreateTodoRequest): Promise<TodoItem> {
    const itemId = uuid.v4()
  
    const newItem: TodoItem = {
      todoId: itemId,
      userId: userId,
      createdAt: new Date().getTime().toString(),
      done: false,
      ...todoDto
    }
  
    await this.docClient.put({
      TableName: this.todosTable,
      Item: newItem
    }).promise();
  
    console.log("created new todo item: " + newItem);
  
    return newItem;
  }
  async deleteTodoItem(userId: string, itemId: string): Promise<void> {
    const itemKeyToBeDeleted = {
        userId: userId,
        todoId: itemId
      }
    
      const result = await this.docClient.delete({
        TableName: this.todosTable,
        Key: itemKeyToBeDeleted,
      }).promise();
      console.log("Result of deletion ... ", result);
  }

  async updateTodoItem(userId: string, todoDto: UpdateTodoRequest, itemId: string):Promise<any> {
    const queryParams = {
        TableName: this.todosTable,
        Key: {
            userId: userId,
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
    
      return await this.docClient.update(queryParams).promise()
  }
}
