import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ToggleDarkMode } from '../assets/js/darkmode';
import ChatSideMenu from './ChatSideMenu';

function ChatMainPage() {
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [showSecondDiv, setShowSecondDiv] = useState(true);
    const [chatSessions, setChatSessions] = useState([]);
    const [userName, setUserName] = useState('Guest');
    const chatContainerRef = useRef(null);

    const handleInputChange = (e) => {
        setUserInput(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const userMessage = userInput;
        setUserInput('');
        setLoading(true);
        setShowSecondDiv(false);
        setMessages((prevMessages) => [...prevMessages, { text: userMessage, sender: 'user' }]);

        try {
            const openaiResponse = await axios.post('http://localhost:2000/chat', {
                prompt: userMessage
            });
            setMessages((prevMessages) => [...prevMessages, { text: openaiResponse.data.response, sender: 'bot' }]);
        } catch (error) {
            console.error("Error fetching OpenAI response:", error);
            setMessages((prevMessages) => [...prevMessages, { text: "Sorry, something went wrong.", sender: 'bot' }]);
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        const storedUserName = Cookies.get('userName');
        if (storedUserName) {
            setUserName(storedUserName);
        }
    }, []);

    useEffect(() => {
        const DarkModeOn = localStorage.getItem('DarkModeOn') === 'true';
        setDarkMode(DarkModeOn);
        ToggleDarkMode();
    }, []);

    const toggleDarkmode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('DarkModeOn', newDarkMode);
        ToggleDarkMode();
    };

    const handleNewChatSession = () => {
        const sessionTopic = `Chat Session ${chatSessions.length + 1}`;
        setChatSessions([...chatSessions, { topic: sessionTopic, messages }]);
        setMessages([]);
        setShowSecondDiv(true);
    };

    return (
        <div className={`chat-mainpage ${darkMode ? 'dark-mode' : ''}`}>
            <ChatSideMenu onNewChat={handleNewChatSession} />
            <div className="first-main-div">
                <div className="left-div">
                    <h1 className="title">NIHA CHATBOT</h1>
                </div>
                <div className="right-div">
                    <div className="profile-title">
                        <h3>{userName}</h3>
                    </div>
                    <div className="profile-icon">
                        <img src="/static/images/user.png" alt="user" />
                    </div>
                    <button className="theme-toggle" onClick={toggleDarkmode}>
                        <img src={darkMode ? "/static/images/sun.png" : "/static/images/moon.png"} alt="toggle theme" />
                    </button>
                </div>
            </div>
            {showSecondDiv && (
                <div className="second-main-div">
                    <div className="second-main-div-h">
                        <h1 className="task-title">USE NIHA FOR</h1>
                        <a href="/login-signup" className="icon-link">
                            <img src="/static/images/ai.png" alt="icon" className="ai-icon" style={{ width: '45px' }} />
                        </a>
                    </div>
                    <div className="flex-row">
                        <div className="col-4">
                            <img src="/static/images/application.png" alt="task-1" className="center-img" />
                            <p className="tasks">Describing the contents <br /> of an image</p>
                        </div>
                        <div className="col-4">
                            <img src="/static/images/network.png" alt="task-2" className="center-img" />
                            <p className="tasks">Turning your data into <br /> graphs</p>
                        </div>
                        <div className="col-4">
                            <img src="/static/images/table.png" alt="task-3" className="center-img" />
                            <p className="tasks">Turning your data into <br /> tables</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="chat-container" ref={chatContainerRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        <div className="message-icon">
                            <img src={msg.sender === 'user' ? "/static/images/user.png" : "/static/images/ai.png"} alt={msg.sender} />
                        </div>
                        <p>{msg.text}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit}>
                <div className="third-main-div">
                    <div className="message-tab">
                        <div className="icons-left">
                            {/* Icon placeholders; functionality removed */}
                            <img src="/static/images/attach.png" alt="attach file" className="icon-1" />
                            <img src="/static/images/mic.png" alt="voice input" className="icon-2" />
                        </div>
                        <input
                            type="text"
                            className="message-input my-input"
                            placeholder="Message NIHA"
                            value={userInput}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        <div className="icons-right">
                            <img
                                src="/static/images/up-arrow.png"
                                alt="send"
                                className="icon-3"
                                onClick={handleSubmit}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ChatMainPage;
