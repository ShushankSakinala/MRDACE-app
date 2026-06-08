# MongoDB Atlas Setup Instructions

Follow these instructions to set up a MongoDB Atlas cloud database cluster, create a database user, configure network access, and obtain the connection string for the MRDACE project.

---

## Step 1: Create a MongoDB Atlas Cluster

1. Go to the [MongoDB Atlas Website](https://www.mongodb.com/cloud/atlas) and sign in or create a new free account.
2. Once logged in, click the **"Create"** button under **Database Deployments**.
3. Choose the **M0 Free** tier (shared RAM, shared vCPU, and 512MB storage), which is perfect for development and testing.
4. Select your preferred Cloud Provider (e.g., AWS, Google Cloud, or Azure) and a Region close to you.
5. Click **"Create Deployment"** (or Create Cluster).

---

## Step 2: Create a Database User

To access the cluster, you must create a database user with read/write permissions.

1. In the Atlas dashboard, navigate to **Security** -> **Database Access** in the left sidebar.
2. Click **"+ Add New Database User"**.
3. Select **Password** as the Authentication Method.
4. Enter a **Username** (e.g., `mrdace_user`) and a secure **Password**. Save these credentials; you will need them for your environment variables.
5. Under **Database User Privileges**, select **Built-in Role** -> **Read and write to any database**.
6. Click **"Add User"**.

---

## Step 3: Configure Network Access

To allow the Node.js application (including Vercel deployments) to connect to MongoDB Atlas, you must whitelist network access.

1. Navigate to **Security** -> **Network Access** in the left sidebar.
2. Click **"+ Add IP Address"**.
3. To allow access from any IP address (necessary for serverless cloud deployments like Vercel because they don't have static IPs):
   - Click **"Allow Access from Anywhere"** (this sets the IP address to `0.0.0.0/0`).
4. (Optional) Enter a description (e.g., "Allow Vercel and local dev").
5. Click **"Confirm"**.
6. Wait a few moments for the status to change from *Pending* to *Active*.

---

## Step 4: Obtain the Connection String

1. Navigate to **Deployment** -> **Database** in the left sidebar.
2. Click **"Connect"** next to your active database cluster.
3. Select **"Drivers"** (under Connect to your application).
4. Select your Driver: **Node.js** and the Version (e.g., **5.5 or later**).
5. Copy the connection string provided. It will look like this:
   ```text
   mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
6. Replace `<username>` and `<password>` with the credentials you created in **Step 2**.
7. Specify the database name (e.g. `mrdace`) right before the query parameters, like:
   ```text
   mongodb+srv://mrdace_user:YOUR_PASSWORD@cluster0.example.mongodb.net/mrdace?retryWrites=true&w=majority
   ```

---

## Step 5: Configure the Application

1. Open your `.env` file in the `backend/` directory of the project.
2. Add or update the `MONGODB_URI` environment variable with your copied Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://mrdace_user:YOUR_PASSWORD@cluster0.example.mongodb.net/mrdace?retryWrites=true&w=majority
   JWT_SECRET=mrdace-secure-jwt-secret-key-2026
   ```
3. Restart the backend server. The console should output:
   `MongoDB Connected successfully to host: cluster0.example.mongodb.net`
