# MongoDB Atlas Setup Guide

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create a New Cluster

1. Click **"Build a Database"** or **"Create"**
2. Choose **FREE** tier (M0 Sandbox)
3. Select your preferred **Cloud Provider** (AWS, Google Cloud, or Azure)
4. Choose a **Region** closest to your location
5. Name your cluster (optional) or keep the default name
6. Click **"Create Cluster"** (this may take 3-5 minutes)

## Step 3: Create Database User

1. In the left sidebar, click **"Database Access"** under Security
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter a **username** (e.g., `livepolling_user`)
5. Click **"Autogenerate Secure Password"** or create your own
6. **IMPORTANT**: Copy and save the password securely
7. Under "Database User Privileges", select **"Read and write to any database"**
8. Click **"Add User"**

## Step 4: Configure Network Access

1. In the left sidebar, click **"Network Access"** under Security
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - **Note**: For production, add only your specific IP addresses
4. Click **"Confirm"**

## Step 5: Get Your Connection String

1. Go back to **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select **Driver**: Node.js
5. Select **Version**: 5.5 or later
6. Copy the connection string (it looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env File

1. Open the `.env` file in the backend folder
2. Replace the `MONGODB_URI` value with your connection string
3. Replace `<username>` with your database username
4. Replace `<password>` with your database password
5. Add your database name after `.mongodb.net/` (e.g., `livepolling`)

**Example:**
```env
MONGODB_URI=mongodb+srv://livepolling_user:YourPassword123@cluster0.abc123.mongodb.net/livepolling?retryWrites=true&w=majority
PORT=4970
```

## Step 7: Install Dependencies and Run

1. Open terminal in the backend folder
2. Install the new dependency:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

## Step 8: Verify Connection

You should see this message in the console:
```
✅ MongoDB connected successfully
🚀 Socket server on http://localhost:4970
```

## Troubleshooting

### Connection Error: "Authentication failed"
- Double-check your username and password in the connection string
- Make sure there are no special characters that need URL encoding
- Use `encodeURIComponent()` for passwords with special characters

### Connection Error: "Network timeout"
- Verify that your IP address is whitelisted in Network Access
- Check your internet connection
- Try allowing access from anywhere (0.0.0.0/0)

### Connection Error: "Database not found"
- MongoDB Atlas will automatically create the database on first write
- Make sure you specified the database name in the connection string

## Security Best Practices

1. **Never commit `.env` file to Git** - it's already in `.gitignore`
2. Use strong passwords for database users
3. In production, whitelist only specific IP addresses
4. Rotate passwords regularly
5. Use environment variables for all sensitive data

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
