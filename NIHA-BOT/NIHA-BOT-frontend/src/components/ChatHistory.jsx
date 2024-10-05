import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ChatHistory() {
    const [chats, setChats] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);

    // Fetch chat history from the server
    const fetchChats = async () => {
        try {
            const response = await axios.get('http://localhost:2000/chat_sessions');
            setChats(response.data);
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    useEffect(() => {
        fetchChats();

        // Polling to refetch chats every 5 seconds
        const intervalId = setInterval(fetchChats, 5000);
        return () => clearInterval(intervalId);
    }, []);

    // Function to handle clicking a question
    const toggleAnswer = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Function to delete a chat
    const deleteChat = async (chatId) => {
        if (window.confirm('Are you sure you want to delete this chat?')) {
            try {
                const response = await axios.delete(`http://localhost:2000/chat_sessions/${chatId}`);
                console.log(response.data); // Log the server response
                setChats(chats.filter((chat) => chat._id !== chatId));
            } catch (error) {
                console.error("Error deleting chat:", error);
            }
        }
    };

    return (
        <div>
            <h1 className="chat-title">Chat History</h1>
            <div className="chatContainer">
                <ol className="chatList">
                    {chats.map((chat, index) => (
                        <li key={chat._id} className="list">
                            <a href="#" className="chats" onClick={() => toggleAnswer(index)}>
                                {chat.user_message}
                            </a>
                            <img 
                                src="/static/images/delete.png" 
                                className="del-icon" 
                                alt="delete" 
                                onClick={() => deleteChat(chat._id)}
                                style={{ cursor: 'pointer' }}
                            />
                            {openIndex === index && (
                                <div className="answer">
                                    <p><strong>Bot:</strong> {chat.bot_response}</p>
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}

export default ChatHistory;
