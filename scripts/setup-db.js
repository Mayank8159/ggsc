import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const region = process.env.AWS_REGION || "ap-south-1";
const client = new DynamoDBClient({ region });

const tables = [
  {
    TableName: "ggsc-profiles",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" }
    ],
    BillingMode: "PAY_PER_REQUEST",
    GlobalSecondaryIndexes: [
      {
        IndexName: "EmailIndex",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" }
      }
    ]
  },
  {
    TableName: "ggsc-attendance",
    KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "email", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST"
  },
  {
    TableName: "ggsc-webauthn",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "user_id", AttributeType: "S" }
    ],
    BillingMode: "PAY_PER_REQUEST",
    GlobalSecondaryIndexes: [
      {
        IndexName: "UserIdIndex",
        KeySchema: [{ AttributeName: "user_id", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" }
      }
    ]
  },
  {
    TableName: "ggsc-login-history",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "ip_address", AttributeType: "S" }
    ],
    BillingMode: "PAY_PER_REQUEST",
    GlobalSecondaryIndexes: [
      {
        IndexName: "IpAddressIndex",
        KeySchema: [{ AttributeName: "ip_address", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" }
      }
    ]
  }
];

async function setupTables() {
  console.log(`Starting AWS DynamoDB tables setup in region: ${region}...`);

  for (const tableConfig of tables) {
    const tableName = tableConfig.TableName;
    try {
      // Check if table exists
      await client.send(new DescribeTableCommand({ TableName: tableName }));
      console.log(`Table "${tableName}" already exists.`);
    } catch (error) {
      if (error.name === "ResourceNotFoundException") {
        console.log(`Creating table "${tableName}"...`);
        await client.send(new CreateTableCommand(tableConfig));
        console.log(`Table "${tableName}" successfully created!`);
      } else {
        console.error(`Error checking/creating table "${tableName}":`, error);
      }
    }
  }

  console.log("DynamoDB tables setup sequence complete.");
}

setupTables();
