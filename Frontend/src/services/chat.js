import axios from 'axios';

export const sendMessageToGreenBot = async (message) => {
  try {
    const response = await axios.post('http://localhost:3000/api/chat/chat', { message });
    console.log('Response from GreenBot:', response.data.reply);
    return response.data.reply;
  } catch (error) {
    console.error('Error contacting GreenBot:', error);
    return "Oops! Something went wrong.";
  }
};