"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: '¡Hola! Soy tu asistente virtual. Puedo ayudarte a consultar información sobre inventario, profesores, horarios y turnos. ¿En qué puedo ayudarte?'
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: messages
                })
            })

            if (!response.ok) {
                throw new Error('Error al enviar mensaje')
            }

            const data = await response.json()
            setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error al comunicarse con el asistente')
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.'
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <>
            {/* Botón flotante */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg z-50"
                    size="icon"
                >
                    <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <Card className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-96 max-w-md h-[calc(100vh-8rem)] md:h-[600px] max-h-[600px] shadow-2xl z-50 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b flex-shrink-0">
                        <CardTitle className="text-base md:text-lg flex items-center gap-2">
                            <Bot className="h-4 w-4 md:h-5 md:w-5" />
                            <span className="hidden sm:inline">Asistente Virtual</span>
                            <span className="sm:hidden">Asistente</span>
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex gap-2 md:gap-3",
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="flex-shrink-0 h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            "rounded-lg px-3 py-2 md:px-4 md:py-2 max-w-[85%] md:max-w-[80%]",
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        )}
                                    >
                                        <p className="text-xs md:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <div className="flex-shrink-0 h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-2 md:gap-3 justify-start">
                                    <div className="flex-shrink-0 h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                                    </div>
                                    <div className="bg-muted rounded-lg px-3 py-2 md:px-4 md:py-2">
                                        <div className="flex gap-1">
                                            <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="border-t p-3 md:p-4 flex-shrink-0">
                            <div className="flex gap-2">
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe tu pregunta..."
                                    disabled={isLoading}
                                    className="flex-1 text-sm md:text-base"
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    size="icon"
                                    className="flex-shrink-0"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    )
}

