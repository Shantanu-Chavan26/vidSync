import { StreamChat } from 'stream-chat';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); 
  }

  const { userId } = req.body; 

  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY; 
  const apiSecret = process.env.STREAM_SECRET_KEY;

  const serverClient = StreamChat.getInstance(apiKey, apiSecret);

  const userToken = serverClient.createToken(userId);

  console.log("generate jwt token is backend-> ",userToken);

  res.status(200).json({ userToken });
}
