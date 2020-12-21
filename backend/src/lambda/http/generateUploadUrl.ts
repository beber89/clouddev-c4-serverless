import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import * as AWSXRay from 'aws-xray-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const todosTable = process.env.TODOS_TABLE

const XAWS = AWSXRay.captureAWS(AWS)


const docClient = new XAWS.DynamoDB.DocumentClient()
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const todoId = event.pathParameters.todoId

  // DONE: Return a presigned URL to upload a file for a TODO item with the provided id
  const imageId = uuid.v4()

  const uploadUrl = await s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
  const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`

  const dbUpdateRequestBody = {
        TableName: todosTable,
        Key: { 
            userId: getUserId(event),
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

await docClient.update(dbUpdateRequestBody).promise()

console.log("Updated OK ... ");

  return {
      statusCode: 200,
      headers: {
          'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
          iamgeUrl: imageUrl,
          uploadUrl: uploadUrl
      })
  }
}
