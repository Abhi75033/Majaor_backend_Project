import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors(
    {
origin: process.env.CORS_ORGIN,
credentials: true
}
))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static("Public"))
app.use(cookieParser())

// Improt Routes
import userRotes from './routes/User.rotes.js'
import videoRoutes from './routes/video.routes.js'
// when we export the routes so we have to use middlewares


app.use('/api/v1/users',userRotes)// after '/api/v1/users' => userRoutes
app.use('/api/v1/videos',videoRoutes)// after '/api/v1/videos' => videoRoutes

// Final Url = https://localhost:5000/api/v1/users/register

export {app}