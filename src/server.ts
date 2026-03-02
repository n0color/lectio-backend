import buildApp from './index.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config'

const PORT = process.env.PORT || 4000;
const app = buildApp();

const serverStart = async () => {
  try {
    app.listen(PORT, () => console.log("Lectio starts on " + PORT))
  } catch (err) {
    console.log(err);
  }
}

serverStart();