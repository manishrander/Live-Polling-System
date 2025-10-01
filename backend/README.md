# Live Polling Backend with MongoDB

## MongoDB Setup

### Option 1: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Server**
   - Download from: https://www.mongodb.com/try/download/community
   - Install and start MongoDB service

2. **Verify MongoDB is running**
   ```bash
   # Check if MongoDB is running on default port 27017
   netstat -an | findstr :27017
   ```

3. **Start the backend**
   ```bash
   npm run dev
   ```
   The backend will connect to `mongodb://localhost:27017/livepolling`

### Option 2: MongoDB Atlas (Cloud - Free Tier)

1. **Create a free MongoDB Atlas account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Create a free cluster

2. **Get your connection string**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Set environment variable**
   ```bash
   # Windows PowerShell
   $env:MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/livepolling"
   npm run dev
   ```

   Or create a `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/livepolling
   PORT=4500
   ```

### Option 3: Run without MongoDB

The server will work without MongoDB but data won't persist:
```bash
npm run dev
```
You'll see: `⚠️ Running without database - data will not persist`

## Features

- **Chat Messages**: Stored in MongoDB with timestamps
- **Participants**: Active users tracked in database
- **Chat History**: New users receive last 50 messages
- **REST API Endpoints**:
  - `GET /api/messages` - Get chat history
  - `GET /api/participants` - Get active participants

## Environment Variables

- `MONGODB_URI` - MongoDB connection string (default: `mongodb://localhost:27017/livepolling`)
- `PORT` - Server port (default: `4500`)
