"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Send, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export function Chatbot({ variant = "floating" }: { variant?: "floating" | "header" }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hola, soy Migue. Puedo ayudarte con informacion sobre clases, horarios, actividades y espacios del complejo.'
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
            toast.error('Error al comunicarse con Migue')
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
            {!isOpen && (
                <div className={variant === "header"
                    ? "relative z-50"
                    : "fixed bottom-3 right-3 z-50 flex items-center gap-4 md:bottom-6 md:right-6"
                }>
                    {variant === "floating" ? (
                        <div className="relative hidden animate-bounce-subtle rounded-xl border border-border bg-popover px-4 py-2 text-popover-foreground shadow-lg md:block">
                            <span className="text-sm font-bold">Necesitas ayuda?</span>
                            <div className="absolute top-1/2 -right-1 h-2 w-2 -translate-y-1/2 rotate-45 border-r border-t border-border bg-popover"></div>
                        </div>
                    ) : null}
                    <Button
                        onClick={() => setIsOpen(true)}
                        className={variant === "header"
                            ? "h-9 w-9 overflow-hidden rounded-full border bg-white p-0 shadow-sm transition-transform hover:scale-105 dark:bg-slate-100"
                            : "h-16 w-16 overflow-hidden rounded-full border-2 border-white/20 bg-white p-0 shadow-lg transition-transform duration-300 hover:scale-110 md:h-24 md:w-24 dark:bg-slate-100"
                        }
                        size="icon"
                        title="Abrir asistente Migue"
                    >
                        <div className="relative h-full w-full">
                            <Image
                                src="/images/migue-avatar.png"
                                alt="Migue, asistente del complejo"
                                fill
                                sizes={variant === "header" ? "36px" : "96px"}
                                className={variant === "header"
                                    ? "object-contain object-center p-0.5"
                                    : "object-contain object-center p-1.5"
                                }
                                priority
                            />
                        </div>
                    </Button>
                </div>
            )}

            {isOpen && (
                <Card className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-96 max-w-md h-[calc(100vh-8rem)] md:h-[600px] max-h-[600px] shadow-2xl z-50 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b flex-shrink-0">
                        <CardTitle className="text-base md:text-lg flex items-center gap-2">
                            <Bot className="h-4 w-4 md:h-5 md:w-5" />
                            <span className="hidden sm:inline">Migue, asistente del complejo</span>
                            <span className="sm:hidden">Migue</span>
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

                        <div className="border-t p-3 md:p-4 flex-shrink-0">
                            <div className="flex gap-2">
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Preguntale a Migue..."
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
