import 'dotenv/config'
import express, { Request, Response } from "express"
import cookieParser from 'cookie-parser'
import { authorizeAccess, getAccess, refreshAccess } from './controllers/AuthorizationController'

const app = express()
app.use(cookieParser())
const port = process.env.PORT

app.get('/', (req: Request, res: Response,) => {
  res.send('Hello World')
})

app.get('/authorize-access', authorizeAccess)
app.get('/get-access', getAccess)
app.get('/refresh-access', refreshAccess)

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Example app listening on port ${port}`)
})