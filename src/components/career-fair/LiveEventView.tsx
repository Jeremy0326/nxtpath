import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  MessageSquare, 
  Users, 
  ThumbsUp,
  Send,
  Mic,
  MicOff,
  VideoOff,
  X
} from 'lucide-react';

interface LiveEventProps {
  event: {
    id: string;
    title: string;
    company: string;
    type: 'presentation' | 'qa' | 'networking';
    description: string;
    presenter: {
      name: string;
      title: string;
      avatar?: string;
    };
    attendees: number;
  };
  onClose: () => void;
}

export function LiveEventView({ event, onClose }: LiveEventProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Sarah Wilson', content: 'Great presentation! Very informative.', time: '10:05 AM' },
    { id: '2', sender: 'Michael Chen', content: 'Could you explain more about the tech stack?', time: '10:07 AM' },
    { id: '3', sender: event.presenter.name, content: 'Thanks for the question! We primarily use React, Node.js, and AWS.', time: '10:08 AM' },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          sender: 'You',
          content: message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">{event.title}</h1>
            <p className="text-sm text-white/80">{event.company}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-white/80 text-sm">
              <Users className="h-4 w-4 mr-1.5" />
              {event.attendees} Attendees
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <Video className="h-16 w-16 mx-auto text-gray-600" />
              <p className="mt-4 text-gray-400">Live presentation in progress</p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full ${
                isMuted ? 'bg-gray-700 text-gray-400' : 'bg-indigo-600 text-white'
              }`}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3 rounded-full ${
                isVideoOff ? 'bg-gray-700 text-gray-400' : 'bg-indigo-600 text-white'
              }`}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-red-600 rounded-full text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-full md:w-80 bg-white flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-base font-medium text-gray-900">Live Chat</h2>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-900">{msg.sender}</span>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                className="p-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}