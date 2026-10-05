import dotenv from 'dotenv'
import app from './app.js'
import connectDB from './config/db.js'

dotenv.config()

const port = process.env.PORT || 5000

async function startServer() {
  try {
    await connectDB()

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

startServer()
