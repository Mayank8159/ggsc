# AWS Serverless Backend: Architecture & Setup Guide

This guide documents the architecture, database configurations, and feature workflows of the migrated **AWS Lambda + Amazon DynamoDB** serverless backend.

---

## 1. Database Setup: Creating DynamoDB Tables

The backend utilizes four DynamoDB tables. You can create them programmatically using the provided setup script.

### Prerequisites: AWS Configuration
Ensure your shell has credentials configured for an AWS account with DynamoDB permissions:
```bash
# Set your AWS Credentials
$env:AWS_ACCESS_KEY_ID="your_access_key_id"
$env:AWS_SECRET_ACCESS_KEY="your_secret_access_key"
$env:AWS_REGION="ap-south-1" # Mumbai region recommended for low latency
```

### Table Initialization Command
Execute the database setup script in the project root:
```bash
node scripts/setup-db.js
```
This script will connect to your AWS account, check if the tables exist, and create them with the required keys and global secondary indexes (GSIs) if they are missing.

### Table Schema Summary

1.  **Profiles Table (`ggsc-profiles`)**:
    *   *Partition Key*: `id` (String - UUID)
    *   *Global Secondary Index*: `EmailIndex` (Partition Key: `email`, String)
2.  **Attendance Table (`ggsc-attendance`)**:
    *   *Partition Key*: `email` (String - ensures unique scans)
3.  **WebAuthn Table (`ggsc-webauthn`)**:
    *   *Partition Key*: `id` (String - Base64URL Credential ID)
    *   *Global Secondary Index*: `UserIdIndex` (Partition Key: `user_id`, String)
4.  **Login History Table (`ggsc-login-history`)**:
    *   *Partition Key*: `id` (String - UUID)
    *   *Global Secondary Index*: `IpAddressIndex` (Partition Key: `ip_address`, String)

---

## 2. Overall Serverless Architecture

The system transitions from client-heavy Supabase calls to a secure API Gateway + AWS Lambda backend proxy, shielding your DynamoDB tables:

```mermaid
graph TB
    subgraph Client App
        F[React SPA Frontend]
    end

    subgraph AWS API Gateway
        APIGW[HTTP API Router]
    end

    subgraph AWS Lambda Compute
        L[Express Serverless Route Handler]
        Auth[JWT Token Validator Middleware]
    end

    subgraph Amazon DynamoDB NoSQL
        DB1[(ggsc-profiles)]
        DB2[(ggsc-attendance)]
        DB3[(ggsc-webauthn)]
        DB4[(ggsc-login-history)]
    end

    F -->|REST Requests with Bearer JWT| APIGW
    APIGW -->|Proxy Integration event/context| L
    L --> Auth
    Auth -->|Authorize & Read/Write| DB1
    Auth -->|Authorize & Read/Write| DB2
    Auth -->|Authorize & Read/Write| DB3
    Auth -->|Authorize & Read/Write| DB4
```

---

## 3. Detailed Feature Workflows (Mermaid Diagrams)

### Feature 3.1: Password Login and Token Generation
Verifies credentials using DynamoDB queries against `ggsc-profiles` using the GSI `EmailIndex`, performs rate-limiting checks against `ggsc-login-history`, and generates a secure JSON Web Token (JWT).

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin/User
    participant App as React Frontend
    participant Server as Lambda Backend
    participant History as DynamoDB: login-history
    participant Profiles as DynamoDB: profiles

    Admin->>App: Submits Email, Password & Role
    App->>Server: POST /api/login {email, password, role}
    Server->>History: Check failed attempts for client IP last 15 mins
    History-->>Server: Count of failures
    alt Failure Count >= 3
        Server-->>App: Return 429 Too Many Requests (Device Blocked)
    end
    
    Server->>Profiles: Find profile using GSI EmailIndex
    Profiles-->>Server: Return Profile (id, role, password_hash)
    
    alt Profile Not Found OR Role Mismatch
        Server->>History: Log failed login attempt
        Server-->>App: Return 403 Forbidden
    end

    Server->>Server: Verify submitted password vs bcrypt password_hash
    alt Passwords DO NOT Match
        Server->>History: Log failed login attempt
        Server-->>App: Return 401 Unauthorized
    end

    Server->>History: Log successful login attempt
    Server->>Server: Generate JWT (Sign with ID, Email, Role)
    Server-->>App: Return 200 OK with session (JWT token & Profile metadata)
    App->>App: Store JWT in localStorage
```

---

### Feature 3.2: WebAuthn Fingerprint Registration & Authentication

WebAuthn requires a two-step handshake: Challenge Generation and Assertion/Signature Verification.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin User
    participant App as React Frontend
    participant Server as Lambda Backend
    participant WebAuthnTable as DynamoDB: webauthn
    participant Profiles as DynamoDB: profiles

    Note over Admin, WebAuthnTable: Step A: Fingerprint Enrollment (Registration)
    Admin->>App: Navigate to Biometrics page & input user email
    App->>App: Register biometric key via navigator.credentials.create()
    App->>Server: POST /api/webauthn {id, user_id, public_key} (Bearer JWT)
    Server->>WebAuthnTable: PutItem {id, user_id, public_key, counter}
    WebAuthnTable-->>Server: Success
    Server-->>App: Return 201 Created

    Note over Admin, WebAuthnTable: Step B: Biometric Sign-in
    Admin->>App: Inputs email & clicks Biometrics Login
    App->>Server: POST /api/get-biometric-challenge {email}
    Server->>Profiles: Fetch profile using GSI EmailIndex
    Profiles-->>Server: User details (id, role)
    Server->>WebAuthnTable: Retrieve registered credential IDs for user_id
    WebAuthnTable-->>Server: Credential IDs array
    Server->>Server: Create random base64 challenge, sign with JWT_SECRET
    Server-->>App: Return 200 OK with challenge token & registered credential IDs
    
    App->>App: Challenge parsed & fed to navigator.credentials.get()
    Note right of App: User scans finger on device
    App->>Server: POST /api/verify-biometric {email, challengeToken, assertion}
    Server->>Server: Verify challenge signature and expiration
    Server->>WebAuthnTable: Fetch public_key (PEM) by credentialId
    WebAuthnTable-->>Server: credential info (public_key)
    Server->>Server: Verify cryptographic assertion signature using public key
    Server->>Server: Sign new user JWT session token
    Server-->>App: Return 200 OK with session (JWT token)
```

---

### Feature 3.3: Attendance Scanning & Duplicate Verification
Prevents scan spoofing or double scanning of tickets by enforcing a unique key constraint on the student's email inside DynamoDB.

```mermaid
sequenceDiagram
    autonumber
    actor Scanner as Volunteer / Scanner
    participant App as React Frontend (Scanner Portal)
    participant Server as Lambda Backend
    participant Attendance as DynamoDB: attendance

    Scanner->>App: Scan ticket QR code
    App->>Server: POST /api/attendance {studentDetails...} (Bearer JWT)
    Server->>Attendance: GetItem check by email
    Attendance-->>Server: Checked-in record (if exists)
    
    alt Ticket has already been scanned
        Server-->>App: Return 409 Conflict (Duplicate scan details)
        App->>App: Display "Already Scanned!" alert
    end
    
    Server->>Attendance: PutItem new check-in {email, name, roll, section, scanned_by}
    Attendance-->>Server: Success
    Server-->>App: Return 201 Created
    App->>App: Display Green checkmark UI and success tone
```

---

### Feature 3.4: Audit Log (Login History) Management
Retains a security history of logs. Only members authenticated under the `oops` role can purge logs.

```mermaid
sequenceDiagram
    autonumber
    actor User as Admin or Oops User
    participant App as React Frontend
    participant Server as Lambda Backend
    participant History as DynamoDB: login-history

    Note over User, History: Fetching Logs
    User->>App: View Audit Log Dashboard
    App->>Server: GET /api/login-history (Bearer JWT)
    Server->>Server: Verify request user role is 'admin' or 'oops'
    Server->>History: ScanCommand login-history
    History-->>Server: Items list
    Server->>Server: Sort desc by logged_at
    Server-->>App: Return 200 OK with logs array

    Note over User, History: Deleting Logs (Oops Role Only)
    User->>App: Click "Clear History" button
    App->>Server: DELETE /api/login-history (Bearer JWT)
    Server->>Server: Check if token user.role == 'oops'
    alt Role IS NOT 'oops'
        Server-->>App: Return 403 Forbidden (Unauthorized)
    end
    Server->>History: Scan and Delete all items in table
    History-->>Server: Success
    Server-->>App: Return 200 OK (Logs cleared)
```

---

## 4. Environment Variables Checklist

Ensure the following environment variables are supplied to your AWS Lambda configuration (e.g. through the AWS Console, AWS CLI, or Serverless CLI configuration):

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `JWT_SECRET` | `your-secure-jwt-signature-key` | HMAC signing secret for session tokens |
| `AWS_REGION` | `ap-south-1` | Target region for DynamoDB calls |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Event ticket storage configuration |
| `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary credentials |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary secret |

---

## 5. Backend Implementation Files

The following files represent the backend implementation of this serverless project:

*   [api/lambda.js](file:///c:/Codes/ggsc/ggsc/api/lambda.js): Express-wrapped Lambda handler with all routes, business logic, rate-limiting, and WebAuthn validation.
*   [serverless.yml](file:///c:/Codes/ggsc/ggsc/serverless.yml): Stack orchestration, mapping routes to API Gateway, declaring tables IAM execution role policies, and environments.
*   [scripts/setup-db.js](file:///c:/Codes/ggsc/ggsc/scripts/setup-db.js): Database migration helper to programmatically deploy and check DynamoDB tables and GSIs on AWS.
*   [package.json](file:///c:/Codes/ggsc/ggsc/package.json): Declares backend dependencies such as `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `bcryptjs`, `jsonwebtoken`, and `serverless-http`.

---

## 6. Frontend Portal Integration Files

The following React portal integration files directly connect with the backend:

*   [src/lib/apiClient.js](file:///c:/Codes/ggsc/ggsc/src/lib/apiClient.js): Centralized HTTP wrapper that handles endpoint routing, parsing payloads, and forwarding authorization Bearer JWT tokens.
*   [src/components/Admin/AdminLogin.jsx](file:///c:/Codes/ggsc/ggsc/src/components/Admin/AdminLogin.jsx): Interfaces with credential validation endpoints and performs browser WebAuthn biometric queries.
*   [src/components/Admin/AdminDashboard.jsx](file:///c:/Codes/ggsc/ggsc/src/components/Admin/AdminDashboard.jsx): Handles global user authorization checks using backend session validation.
*   [src/components/Admin/AttendancePortal.jsx](file:///c:/Codes/ggsc/ggsc/src/components/Admin/AttendancePortal.jsx): Records scanned attendees, checks duplicates, and lists scan logs.
*   [src/components/Admin/BiometricEnrollment.jsx](file:///c:/Codes/ggsc/ggsc/src/components/Admin/BiometricEnrollment.jsx): Admin interface to list users, load enrolled public keys, verify administrative passwords, and register/remove WebAuthn credentials.
*   [src/components/Admin/LogHistory.jsx](file:///c:/Codes/ggsc/ggsc/src/components/Admin/LogHistory.jsx): Administrative audit workspace to review login attempts, clear logs, and delete single entries.
*   [src/components/Admin/TicketGeneratorPortal.jsx](file:///c:/Codes/ggsc/ggsc/src/components/Admin/TicketGeneratorPortal.jsx): Admin utility to generate QR tickets and upload images to Cloudinary.
