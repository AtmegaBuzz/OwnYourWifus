import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { initialize, ZoKratesProvider } from "zokrates-js";



const app = express();
const port = 3000;

const zk = initialize();

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Server responding');
});

app.post('/api/generate-proof', (req: Request, res: Response) => {
  const { name, age } = req.body;

  zk

  console.log(`Received data: ${name}, ${age}`);

  res.json({ message: 'Data received successfully!', name, age });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
