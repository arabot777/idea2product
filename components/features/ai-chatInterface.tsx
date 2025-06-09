import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

const AIChatInterface: React.FC = () => {
  const t = useTranslations('AIChatInterface');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, `${t('you_prefix')}: ${message}`]);
      setMessage('');
      // Simulate AI response
      setTimeout(() => {
        setChatHistory((prevHistory) => [...prevHistory, `${t('ai_prefix')}: ${t('ai_response_prefix')}"${message}"${t('ai_response_suffix')}`]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded shadow-md p-4">
      <div className="flex-1 overflow-y-auto mb-4 p-2 border rounded bg-gray-50">
        {chatHistory.length === 0 ? (
          <p className="text-gray-500 text-center">{t('start_chat_message')}</p>
        ) : (
          chatHistory.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.startsWith(t('you_prefix')) ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${msg.startsWith(t('you_prefix')) ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
                {msg}
              </span>
            </div>
          ))
        )}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('input_placeholder')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleSendMessage}
        >
          {t('send_button')}
        </button>
      </div>
    </div>
  );
};

export default AIChatInterface;