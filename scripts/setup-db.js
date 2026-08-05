import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import fs from "fs";
import path from "path";

// Load environment variables from .env file manually if not already present
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of envLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        let val = trimmed.substring(index + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (err) {
  console.warn("Unable to load .env file manually:", err.message);
}

const region = process.env.AWS_REGION || "ap-south-1";
const client = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  }
});

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
  },
  {
    TableName: "ggsc-events",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST"
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
