import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as uuid from 'uuid'

import { TodoItem } from '../../models/TodoItem'

export class TodosRepository {

  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly s3 = new (new AWSXRay.captureAWS(AWS)).S3({signatureVersion: 'v4'})
    ) {
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

  async createTodoItem(newItem: TodoItem): Promise<TodoItem> {
  
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

  async updateTodoItem(userId: string, todoDto: any, itemId: string):Promise<any> {
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
  async generateUploadUrl(userId: string, todoId: string): Promise<any> {
    const imageId = uuid.v4()

    const uploadUrl = await this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration
    })
    const imageUrl = `https://${this.bucketName}.s3.amazonaws.com/${imageId}`
  
    const dbUpdateRequestBody = {
          TableName: this.todosTable,
          Key: { 
              userId: userId,
              todoId: todoId 
          },
          UpdateExpression: "set #a = :a",
          ExpressionAttributeNames: {
              "#a": "attachmentUrl"
          },
          ExpressionAttributeValues:{
          ":a": imageUrl
          },
          ReturnValues:"UPDATED_NEW"
      }
    await this.docClient.update(dbUpdateRequestBody).promise()
    return {imageUrl, uploadUrl};
  }
}
