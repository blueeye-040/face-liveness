const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE   = process.env.TABLE_NAME;
const API_KEY = process.env.APP_API_KEY;

exports.handler = async (event) => {
    const key = event.headers?.["x-api-key"] || event.headers?.["X-Api-Key"];
    if (key !== API_KEY) {
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    if (!body.id || !body.employeeId || !body.timestamp) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    const item = Object.fromEntries(
        Object.entries(body).filter(([_, v]) => v !== null && v !== undefined)
    );
    item.syncStatus = 1;

    try {
        await client.send(new PutCommand({ TableName: TABLE, Item: item }));
        console.log("Synced:", body.id, body.employeeName);
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (err) {
        console.error("DynamoDB error:", err.message);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
