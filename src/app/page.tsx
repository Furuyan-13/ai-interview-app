"use client";

import { useState } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (inputValue.trim() === "") return;

    const userMessage: Message = { text: inputValue, sender: 'user' };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // 過去の会話履歴をAPIに送れる形式に変換
      const historyForApi = newMessages.slice(0, -1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      
      // バックエンド（ウェイター）にリクエストを送信
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputValue, history: historyForApi }),
      });

      const data = await response.json();
      
      // AIからの返事を会話履歴に追加
      setMessages([...newMessages, { text: data.text, sender: 'ai' }]);

    } catch (error) {
      console.error("AIとの通信に失敗しました。", error);
      setMessages([...newMessages, { text: "エラーが発生しました。もう一度試してください。", sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-2xl p-8 space-y-4">
        <h1 className="text-4xl font-bold text-center">
          AI Interview App
        </h1>
        
        <div className="p-4 bg-gray-800 rounded-lg h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-400">AIからのメッセージがここに表示されます。</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <p className={`p-3 rounded-lg inline-block ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  {msg.text}
                </p>
              </div>
            ))
          )}
           {isLoading && <p className="text-gray-400 text-left">AIが考え中...</p>}
        </div>
        
        <div className="flex">
          <textarea
            className="flex-grow p-4 bg-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="あなたの意見をここに入力してください..."
            rows={3}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading}
          />
          <button 
            className="px-6 py-3 bg-blue-600 rounded-r-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-500"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '...' : '送信'}
          </button>
        </div>
      </div>
    </main>
  );
}