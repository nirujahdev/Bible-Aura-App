import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { 
  Bot, Send, Loader2, MessageSquare, BookOpen, 
  Users, Target, FileText, Lightbulb, Sparkles,
  Copy, Check, RotateCcw, Maximize2, Minimize2
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { generateSystemPrompt, AI_RESPONSE_TEMPLATES } from '../lib/ai-response-templates';

// Chat modes with your specific templates
const CHAT_MODES = [
  { id: 'chat', name: 'AI Chat', icon: MessageSquare, color: 'bg-blue-500', description: 'General Bible questions and spiritual guidance' },
  { id: 'verse', name: 'Verse Analysis', icon: BookOpen, color: 'bg-green-500', description: 'Deep analysis of specific Bible verses' },
  { id: 'sermon', name: 'Sermon Generator', icon: FileText, color: 'bg-purple-500', description: 'Comprehensive sermon manuscripts' },
  { id: 'character', name: 'Character Study', icon: Users, color: 'bg-orange-500', description: 'Bible character profiles and lessons' },
  { id: 'parable', name: 'Parable Study', icon: Lightbulb, color: 'bg-yellow-500', description: 'Jesus\' parables explained' },
  { id: 'topical', name: 'Topical Study', icon: Target, color: 'bg-red-500', description: 'Biblical topics and themes' }
];

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  mode?: string;
}

const callBiblicalAI = async (
  messages: Message[],
  mode: string,
  abortController: AbortController
): Promise<string> => {
  // Get the proper system prompt for the selected mode
  const systemPrompt = generateSystemPrompt(mode as keyof typeof AI_RESPONSE_TEMPLATES);
  
  // Get the latest user message
  const userMessage = messages[messages.length - 1]?.content || '';

  // Set timeout for request
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, 30000); // 30 second timeout

  try {
    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: mode === 'sermon' ? 4000 : mode === 'chat' ? 400 : 1000,
      temperature: 0.6,
      stream: false
    };

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-6251eb1f9fb8476cb2aba1431ab3c114`
      },
      body: JSON.stringify(requestBody),
      signal: abortController.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    return data.choices[0].message.content;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

interface EnhancedAIChatProps {
  className?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const EnhancedAIChat: React.FC<EnhancedAIChatProps> = ({ 
  className = "", 
  isExpanded = false, 
  onToggleExpand 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('chat');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
      mode: selectedMode
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const aiResponse = await callBiblicalAI(
        [...messages, userMessage],
        selectedMode,
        abortControllerRef.current
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        mode: selectedMode
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      toast({
        title: "AI Error",
        description: error.message || "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const clearMessages = () => {
    setMessages([]);
    toast({
      title: "Chat cleared",
      description: "All messages have been cleared",
    });
  };

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      toast({
        title: "Request cancelled",
        description: "AI request has been cancelled",
      });
    }
  };

  const formatAIResponse = (content: string) => {
    // Split by lines and format properly
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Main titles with ✮
      if (trimmedLine.startsWith('✮')) {
        return (
          <div key={index} className="text-lg font-bold text-blue-400 mb-3 flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            {trimmedLine.substring(1).trim()}
          </div>
        );
      }
      
      // Section headers with ↗
      if (trimmedLine.startsWith('↗')) {
        return (
          <div key={index} className="text-base font-semibold text-green-400 mt-4 mb-2 flex items-center">
            <span className="mr-2">↗</span>
            {trimmedLine.substring(1).trim()}
          </div>
        );
      }
      
      // Bullet points with •
      if (trimmedLine.startsWith('•')) {
        return (
          <div key={index} className="text-sm text-slate-300 ml-4 mb-1 flex items-start">
            <span className="text-orange-400 mr-2 mt-1">•</span>
            <span>{trimmedLine.substring(1).trim()}</span>
          </div>
        );
      }
      
      // Regular text
      if (trimmedLine) {
        return (
          <div key={index} className="text-sm text-slate-300 mb-2">
            {trimmedLine}
          </div>
        );
      }
      
      // Empty lines for spacing
      return <div key={index} className="mb-2"></div>;
    });
  };

  const selectedModeInfo = CHAT_MODES.find(mode => mode.id === selectedMode);

  return (
    <Card className={`${className} bg-slate-900 border-slate-700 text-white`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bot className="h-5 w-5 mr-2 text-blue-400" />
            Bible AI Assistant
          </CardTitle>
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="text-slate-400 hover:text-white h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            {onToggleExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                className="text-slate-400 hover:text-white h-8 w-8 p-0"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
        
        {/* Mode Selection */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {CHAT_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.id}
                variant={selectedMode === mode.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMode(mode.id)}
                className={`justify-start text-xs ${
                  selectedMode === mode.id 
                    ? `${mode.color} text-white` 
                    : 'text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                <Icon className="h-3 w-3 mr-1" />
                {mode.name}
              </Button>
            );
          })}
        </div>
        
        {selectedModeInfo && (
          <p className="text-xs text-slate-400 mt-2">
            {selectedModeInfo.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages Area */}
        <ScrollArea className={`px-4 ${isExpanded ? 'h-96' : 'h-64'}`}>
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                <p className="text-slate-400 text-sm">
                  Choose a mode above and start your biblical conversation!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-100 border border-slate-700'
                    }`}
                  >
                    {message.sender === 'ai' && message.mode && (
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {CHAT_MODES.find(mode => mode.id === message.mode)?.name}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    )}
                    
                    <div className="text-sm">
                      {message.sender === 'ai' ? (
                        <div className="space-y-1">
                          {formatAIResponse(message.content)}
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                    
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-sm text-slate-300">AI is thinking...</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelRequest}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex space-x-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask anything about the Bible in ${selectedModeInfo?.name} mode...`}
              className="flex-1 min-h-[40px] max-h-32 bg-slate-800 border-slate-600 text-white placeholder-slate-400 resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 px-3"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="text-xs text-slate-500 mt-2 text-center">
            Powered by DeepSeek AI • Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAIChat; 