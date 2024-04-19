import express, { Request, Response, NextFunction } from 'express';
import apiRouter from './api';

const app = express();

app.use('/routes', apiRouter);

app.use(express.static('public'));

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome Home');
});

app.get('/tcs', (req: Request, res: Response) => {
    res.send('HI RCSer');
});

// Handle 404 - Keep this as a last route
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send('404: File Not Found');
});

app.listen(8080, () => {
    console.log('Example app listening on port 8080!');
});
