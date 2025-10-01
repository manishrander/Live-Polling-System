import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/livepolling'

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    console.log('⚠️  Running without database - data will not persist')
  }
}

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
})

// Participant Schema
const participantSchema = new mongoose.Schema({
  socketId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now }
})

// Poll Question Schema
const pollQuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String }],
  startedAt: { type: Date, default: Date.now },
  durationSec: { type: Number, default: 60 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
})

// Poll Answer Schema
const pollAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PollQuestion', required: true },
  studentId: { type: String, required: true },
  studentName: { type: String },
  optionIndex: { type: Number, required: true },
  answeredAt: { type: Date, default: Date.now }
})

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)
export const Participant = mongoose.model('Participant', participantSchema)
export const PollQuestion = mongoose.model('PollQuestion', pollQuestionSchema)
export const PollAnswer = mongoose.model('PollAnswer', pollAnswerSchema)
