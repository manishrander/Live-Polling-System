import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import { connectDB, ChatMessage, Participant } from './db.js'

const app = express()
app.use(express.json())

// CORS configuration for development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL || 'https://live-polling-system1-19d4.vercel.app/'
]

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Allow if origin is in allowedOrigins or if wildcard is set
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST'],
  credentials: false
}))

const server = http.createServer(app)
const io = new Server(server, { 
  cors: { 
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, false)
      }
    },
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 4975

// Connect to MongoDB
connectDB()

// In-memory presence (with MongoDB backup)
const socketsToUser = new Map()

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`)

  socket.on('chat:join', async (user) => {
    const userData = user || { id: socket.id, name: 'Guest' }
    socketsToUser.set(socket.id, userData)
    
    // Save participant to MongoDB
    try {
      await Participant.findOneAndUpdate(
        { socketId: socket.id },
        { socketId: socket.id, name: userData.name },
        { upsert: true, new: true }
      )
    } catch (error) {
      console.error('Error saving participant:', error.message)
    }
    
    io.emit('chat:participants', Array.from(socketsToUser.values()))
    
    // Send recent chat history to new user
    try {
      const recentMessages = await ChatMessage.find()
        .sort({ timestamp: -1 })
        .limit(50)
        .lean()
      
      const formattedMessages = recentMessages.reverse().map(msg => ({
        id: msg._id.toString(),
        from: msg.from,
        text: msg.text,
        timestamp: msg.timestamp
      }))
      
      socket.emit('chat:history', formattedMessages)
    } catch (error) {
      console.error('Error fetching chat history:', error.message)
    }
  })

  socket.on('chat:message', async (msg) => {
    const user = socketsToUser.get(socket.id) || { id: socket.id, name: 'Guest' }
    const payload = { id: Date.now(), from: user.name, text: String(msg || '').slice(0, 300) }
    
    // Save message to MongoDB
    try {
      await ChatMessage.create({
        from: user.name,
        text: payload.text
      })
    } catch (error) {
      console.error('Error saving message:', error.message)
    }
    
    io.emit('chat:message', payload)
    
    // naive chatbot reply
    if (/help|hello|hi/i.test(payload.text)) {
      setTimeout(async () => {
        const botMessage = { id: Date.now()+1, from: 'Bot', text: 'Hey there, how can I help?' }
        io.to(socket.id).emit('chat:message', botMessage)
        
        // Save bot message to MongoDB
        try {
          await ChatMessage.create({
            from: 'Bot',
            text: botMessage.text
          })
        } catch (error) {
          console.error('Error saving bot message:', error.message)
        }
      }, 400)
    }
  })

  socket.on('disconnect', async () => {
    console.log(`❌ Client disconnected: ${socket.id}`)
    socketsToUser.delete(socket.id)
    
    // Remove participant from MongoDB
    try {
      await Participant.deleteOne({ socketId: socket.id })
    } catch (error) {
      console.error('Error removing participant:', error.message)
    }
    
    io.emit('chat:participants', Array.from(socketsToUser.values()))
  })
})

app.get('/', (_req, res) => res.send('Live Polling Socket Server running with MongoDB'))

// API endpoint to get chat history
app.get('/api/messages', async (_req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ timestamp: -1 }).limit(100)
    res.json(messages)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API endpoint to get participants
app.get('/api/participants', async (_req, res) => {
  try {
    const participants = await Participant.find()
    res.json(participants)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

server.listen(PORT, () => {
  console.log(`🚀 Socket server on http://localhost:${PORT}`)
})



