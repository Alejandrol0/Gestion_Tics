import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL)
    const url = `${connection.connection.host}:${connection.connection.port}`
    console.log(`MongoDB conectado en ${url}`)
  } catch (error) {
    console.log(`Error de conexión: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB;